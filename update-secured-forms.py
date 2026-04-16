"""
Surgical update of DEPOSIT_SECURED after form changes:
  1. Copy new forms from DEPOSIT/00_FORMS/ over DEPOSIT_SECURED/00_FORMS/
  2. Regenerate Filing_Agent_NDA.docx (pulled from generate-eipa-secured.py)
  3. Regenerate SHA-256 manifest (covers new form hashes)
  4. DOES NOT touch the encrypted ZIP — preserves the user-chosen password.
"""

import shutil
from pathlib import Path

# Import helpers from the secured generator
import sys
sys.path.insert(0, str(Path(__file__).parent))

from importlib import import_module
secured = import_module('generate-eipa-secured')

DEPOSIT_DIR = Path(__file__).parent / "DEPOSIT"
SECURED_DIR = Path(__file__).parent / "DEPOSIT_SECURED"
FORMS_DIR = SECURED_DIR / "00_FORMS"


def copy_forms():
    src = DEPOSIT_DIR / "00_FORMS"
    n = 0
    for f in src.iterdir():
        if f.is_file():
            shutil.copy2(f, FORMS_DIR / f.name)
            n += 1
    return n


def main():
    print("=" * 60)
    print("SURGICAL UPDATE — DEPOSIT_SECURED forms")
    print("=" * 60)
    print()

    print("[1/3] Copying updated forms from DEPOSIT/00_FORMS/...")
    n = copy_forms()
    print(f"      {n} forms copied")

    print()
    print("[2/3] Regenerating Filing_Agent_NDA.docx...")
    secured.generate_filing_agent_nda(FORMS_DIR / "Filing_Agent_NDA.docx")

    print()
    print("[3/3] Regenerating SHA-256 manifest...")
    n = secured.generate_sha256_manifest(
        SECURED_DIR / "SHA256_MANIFEST.txt",
        SECURED_DIR / "SHA256_MANIFEST.docx",
    )
    print(f"      {n} files hashed.")

    print()
    print("=" * 60)
    print("DONE.")
    print("Encrypted ZIP untouched — user-chosen password still valid.")
    print("=" * 60)


if __name__ == '__main__':
    main()
