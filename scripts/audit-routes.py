"""Extract authorization facts from every API route.

Deliberately does NOT test against a known list of helper names — that is
exactly the mistake that produced two false reports today (missed
requireProjectAccess, then missed requireExpenseAccess). Instead it extracts
every guard-shaped call it finds and lets a human judge.
"""
import os
import re
import json

ROOT = 'apps/web/src/app/api'

# Must not assume the client is called `prisma` — this codebase also aliases
# it as `db`, and an earlier version of this script silently classed every
# `db.*` mutation as read-only. Match any identifier.model.mutation(...) shape.
MUTATION = re.compile(
    r'\b\w+\.\w+\.(create|update|delete|upsert|createMany|updateMany|deleteMany)\s*\('
    r'|\$transaction|\$executeRaw'
)
METHOD = re.compile(r'export async function (GET|POST|PUT|PATCH|DELETE)')
# Anything that looks like a guard: requireX(...), checkX(...), canX(...),
# resolveUserOrganization(...), plus membership lookups.
GUARD = re.compile(r'\b(require[A-Z]\w*|check[A-Z]\w*|can[A-Z]\w*|resolveUserOrganization|hasRole|hasAccessLevel)\s*\(')
MEMBERSHIP = re.compile(r'(organizationMember|projectMember|teamMember)\.(findUnique|findFirst|findMany)')
AUTH_ONLY = re.compile(r'\b(requireAuth|resolveAuthUser|getServerSession)\s*\(')

rows = []
for dirpath, _, files in os.walk(ROOT):
    for fn in files:
        if fn != 'route.ts':
            continue
        path = os.path.join(dirpath, fn)
        with open(path, encoding='utf-8') as fh:
            src = fh.read()
        # strip comments so prose never satisfies a check
        code = re.sub(r'/\*[\s\S]*?\*/', '', src)
        code = re.sub(r'^\s*//.*$', '', code, flags=re.M)

        methods = sorted(set(METHOD.findall(code)))
        mutates = bool(MUTATION.search(code))
        guards = sorted(set(m[0] for m in GUARD.findall(code)))
        # drop pure-authentication calls from the guard list
        guards = [g for g in guards if g not in ('requireAuth',)]
        membership = bool(MEMBERSHIP.search(code))
        authed = bool(AUTH_ONLY.search(code))

        rows.append({
            'route': path.replace(ROOT + '/', '').replace('/route.ts', ''),
            'methods': ','.join(methods),
            'mutates': mutates,
            'guards': guards,
            'membership': membership,
            'authed': authed,
        })

# The risk set: mutates, is authenticated, but shows no guard call and no
# membership lookup. These are the ones a human must read.
risk = [r for r in rows
        if r['mutates'] and r['authed'] and not r['guards'] and not r['membership']]
readonly_risk = [r for r in rows
                 if not r['mutates'] and r['authed'] and not r['guards'] and not r['membership']]

print(f'total routes: {len(rows)}')
print(f'mutating: {sum(1 for r in rows if r["mutates"])}')
print()
print(f'=== NEEDS READING — mutates, no guard, no membership lookup ({len(risk)}) ===')
for r in sorted(risk, key=lambda x: x['route']):
    print(f'  {r["methods"]:<20} {r["route"]}')
print()
print(f'=== read-only, no guard, no membership lookup ({len(readonly_risk)}) ===')
for r in sorted(readonly_risk, key=lambda x: x['route']):
    print(f'  {r["methods"]:<20} {r["route"]}')

with open('/tmp/claude-0/-home-user-onekof-platform/250f79b9-f673-59b1-b8e2-f796b2f4363f/scratchpad/routes.json', 'w') as fh:
    json.dump(rows, fh, indent=1)
