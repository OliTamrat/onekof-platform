# Activating M1 — patient registry

Two steps, in this order, both requiring credentials that only the founder
holds. Neither can be done from a Claude Code session: the GitHub token here
cannot dispatch workflows (403), the production `DIRECT_URL` is a repository
secret, and there is no Vercel token in the environment.

Everything below has been verified on a scratch Postgres 16 built from the
true pre-M1 production schema (`e805746~1`). What has **not** happened is any
change to a real database.

---

## Step 1 — apply the two migrations, in this order

Order is not optional. `20260729_add_task_patient_id` adds a foreign key
referencing `public.patients`, which the registry migration creates. Run it
first and it fails with `relation "public.patients" does not exist`.

Actions → **DB Migrate** → Run workflow, on `master`, once per migration:

| # | `migration` input | Creates |
|---|---|---|
| 1 | `20260729_add_patient_registry` | `patients` table, `organization_members.patient_access` |
| 2 | `20260729_add_task_patient_id` | `tasks.patient_id`, its index, its FK |

Both are hand-authored idempotent SQL (`IF NOT EXISTS`, `public`-qualified,
`DO $$` guards on constraints), so a re-run is safe if you lose track of
whether one succeeded.

### What the run should report

The verify step reads the migration's own SQL and checks each object it
mentions, so it reports on whatever you named rather than on a fixed list.
Expect:

```
patients: present
patient_access: present
patients_organization_id_identifier_index_key: present
tasks_patient_id_fkey: SET NULL
```

**`SET NULL` is the one to read carefully.** If it ever says `CASCADE`,
stop — erasing a patient under M6 would delete the ward's work record along
with the person, destroying the institution's own history in the name of
protecting the individual's.

### Verified locally, on the real schema

- Both migrations apply cleanly in order from a pre-M1 baseline.
- Both apply cleanly a **second** time (idempotency).
- `patients.retention_months` defaults to `12` — the founder's decision, not
  the 24 originally proposed.
- Deleting a patient row leaves the care item intact with `patient_id` NULL,
  and does not touch ordinary tasks. This is M2's central design claim and it
  is now demonstrated rather than asserted.

---

## Step 2 — set `BLIND_INDEX_KEY`

Until this is set, `blindIndex()` throws and **every patient write fails**.
That is deliberate: a missing key must not silently degrade to storing
identifiers in a form that can be looked up without decryption.

Generate it yourself rather than taking one from a transcript — a key pasted
into a chat log, a terminal history or an issue comment is a key that has
been disclosed:

```bash
openssl rand -base64 48
```

Minimum 32 characters; the command above yields 64. Set it as
`BLIND_INDEX_KEY` in **every** environment that may hold patient data:

- Vercel → project → Settings → Environment Variables → Production
- any Tier 1 (EthioTelecom Cloud) or Tier 2 (on-premise) deployment's
  `.env.production` on the VM

### The key is not rotatable in place

A blind index is a keyed HMAC of the normalised identifier. Change the key and
every stored `identifier_index` stops matching, so existing patients become
unfindable by identifier — they are not lost, but lookup breaks until every
row is re-indexed from the decrypted identifiers. Treat it as permanent from
first write. Back it up somewhere a lost laptop does not take it with it.

### It does not need to match across tiers

Each deployment holds its own patients. A Tier 1 hospital and a Tier 2
on-premise install share no rows, so they should have **different** keys —
one compromise then does not extend to the other.

---

## What still will not work after both steps

M1 and M2 shipped with **zero UI**, by design. After this runbook:

- the API enforces the rules correctly and can store and retrieve patients
- nothing in the product surfaces them — no patient list, no way to attach a
  care item from the board, no access-granting screen

Those are M3. Until then the registry is reachable only by direct API call,
which is what "dark launch" meant.

Also note the residency gate: on a Tier 3 (Vercel/Supabase EU) deployment,
`canStorePatientData()` returns false and every patient route answers 404 —
for everybody, including an owner holding MANAGE. Setting the key on Vercel
prepares the environment but does not open the feature there, and is not
meant to.
