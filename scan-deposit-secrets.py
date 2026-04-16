"""Scan the DEPOSIT ZIP for any real secrets that may have leaked in."""
import zipfile
import re

Z = zipfile.ZipFile('DEPOSIT/onekof-platform-source.zip')

# 1. Any non-example env files?
real_envs = []
for n in Z.namelist():
    base = n.split('/')[-1]
    if base.startswith('.env') and 'example' not in base and 'sample' not in base:
        real_envs.append(n)

print('Non-example env files in deposit:')
for n in real_envs:
    print(f'  {n}')
if not real_envs:
    print('  (none)')
print()

# 2. Scan env-ish files for key=value with non-placeholder values
KEY_PAT = re.compile(
    r'(NEXTAUTH_SECRET|DATABASE_URL|DIRECT_URL|ANTHROPIC_API_KEY|'
    r'OPENAI_API_KEY|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_ANON_KEY|'
    r'GOOGLE_CLIENT_SECRET|GITHUB_CLIENT_SECRET|STRIPE_SECRET_KEY|'
    r'RESEND_API_KEY|SENTRY_AUTH_TOKEN)\s*=\s*(.+)'
)

PLACEHOLDER_MARKERS = [
    'your_', 'your-', 'password', 'change', 'example', 'xxx',
    '<', 'placeholder', 'todo', 'fill', 'replace', 'here',
    'localhost', 'user:pass', '<your',
]

real_hits = []
env_like_files = []

for name in Z.namelist():
    if name.endswith('/'):
        continue
    base = name.split('/')[-1]
    if '.env' not in base:
        continue
    env_like_files.append(name)
    try:
        data = Z.read(name).decode('utf-8', errors='ignore')
    except Exception:
        continue
    for line in data.splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        m = KEY_PAT.match(line)
        if not m:
            continue
        val = m.group(2).strip().strip('"').strip("'")
        low = val.lower()
        if any(marker in low for marker in PLACEHOLDER_MARKERS):
            continue
        if len(val) < 10:
            continue
        real_hits.append((name, m.group(1), val[:60]))

print(f'Env-like files scanned: {len(env_like_files)}')
for f in env_like_files:
    print(f'  {f}')
print()

print('Potential REAL secret values (non-placeholder):')
if real_hits:
    for name, key, val in real_hits:
        print(f'  [{name}] {key} = {val}...')
else:
    print('  (none found)')
print()

# 3. Wide scan for Supabase project refs, anthropic keys, etc
HARD_PATS = {
    'supabase_ref': re.compile(r'[a-z]{20}\.supabase\.co'),
    'anthropic_live': re.compile(r'sk-ant-api[0-9]{2}-[A-Za-z0-9_-]{50,}'),
    'openai_live': re.compile(r'sk-[A-Za-z0-9]{48}'),
    'stripe_live': re.compile(r'sk_live_[A-Za-z0-9]{20,}'),
    'stripe_test': re.compile(r'sk_test_[A-Za-z0-9]{20,}'),
    'jwt_b64': re.compile(r'eyJ[A-Za-z0-9_-]{20,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'),
}

hits = {k: [] for k in HARD_PATS}
for name in Z.namelist():
    if name.endswith('/'):
        continue
    if name.startswith(('node_modules/', '.next/', '.git/')):
        continue
    try:
        data = Z.read(name).decode('utf-8', errors='ignore')
    except Exception:
        continue
    for key, pat in HARD_PATS.items():
        for m in pat.finditer(data):
            hits[key].append((name, m.group()[:80]))

print('Hard-pattern matches across all files:')
for key, lst in hits.items():
    print(f'  [{key}] {len(lst)} hits')
    for name, match in lst[:3]:
        print(f'      {name}: {match}')
