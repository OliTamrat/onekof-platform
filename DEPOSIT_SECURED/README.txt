ONEKOF PLATFORM — EIPA SECURED DEPOSIT
==================================================

Author:   Oli Tamrat Oli <oli.oli@udc.edu>
Generated: April 11, 2026

This folder is an ALTERNATIVE, HARDENED version of the standard
DEPOSIT/ folder. It applies additional security measures on top of
the same underlying source code and filing forms. Offer it to EIPA
during the filing appointment and let them choose which version to
accept based on their preference.

CONTENTS:
--------------------------------------------------

00_FORMS/
    Form_C-1_Application.docx          -- EIPA main application
    Software_Description.docx          -- Functional description
    Publication_Date.docx              -- First publication declaration
    Source_Code_Deposit_Cover.docx     -- CD-ROM contents cover sheet
    Filing_Agent_NDA.docx              -- NDA to be signed by the
                                          filing agent BEFORE the disc
                                          leaves the author's hands.

01_MINIMAL_SOURCE/
    First_25_Pages.docx                -- First ~25 pages of source
    Last_25_Pages.docx                 -- Last ~25 pages of source
    Minimal_Source_README.txt          -- Explanation of reduced deposit
    (These two files implement the original EIPA Form C-1 Section 5
     "first 25 / last 25 pages" rule, in case EIPA prefers the
     reduced deposit over the full 5-volume archive.)

onekof-platform-source.zip.aes         -- Full source archive,
                                          AES-256 encrypted.
                                          Password is NOT on the CD.

SHA256_MANIFEST.txt                    -- Tamper-detection hash list
SHA256_MANIFEST.docx                   -- Formatted hash list (Word)
                                          Covers 9 files.

README.txt                             -- This file.

NOT ON THE CD (hand separately to EIPA):
--------------------------------------------------

ZIP_PASSWORD.txt                       -- The AES-256 password for the
                                          encrypted ZIP. This file MUST
                                          be kept offline, printed on
                                          paper, and handed to EIPA at
                                          the filing desk in a sealed
                                          envelope. It is saved in the
                                          DEPOSIT_SECURED/ folder on
                                          the author's local machine
                                          but SHALL NOT be burned to
                                          the CD.

USAGE:
--------------------------------------------------

1. Before the filing:
   a. Have the filing agent sign Filing_Agent_NDA.docx.
   b. Print ZIP_PASSWORD.txt on paper; keep the digital copy offline.

2. Burning the CD:
   a. Burn the DEPOSIT_SECURED/ folder to a CD-R (write-once media).
   b. DO NOT include ZIP_PASSWORD.txt on the CD.
   c. Verify the burned disc with SHA256_MANIFEST.txt before handing
      it to the filing agent.

3. At the EIPA filing desk:
   a. Present the standard DEPOSIT/ first. If EIPA accepts it, use it.
   b. If EIPA has concerns about the completeness, size, or sensitivity
      of the standard deposit, offer this DEPOSIT_SECURED/ alternative.
   c. If EIPA prefers the reduced deposit, point them to
      01_MINIMAL_SOURCE/.
   d. If EIPA accepts the encrypted archive, hand them the paper
      ZIP_PASSWORD.txt separately.

4. After the filing:
   a. Obtain the EIPA-stamped receipt.
   b. Rotate all production secrets (NEXTAUTH_SECRET, database
      password, API keys) as a precaution.
   c. Retain the signed NDA copy and the filing receipt together.

SECURITY PROPERTIES:
--------------------------------------------------

  (a) AES-256 encrypted ZIP        -- Confidentiality of full archive
  (b) SHA-256 manifest             -- Tamper detection
  (c) Minimal first/last deposit   -- Reduces attack surface if
                                      the full deposit is not required
  (d) Filing Agent NDA             -- Legal protection against
                                      unauthorized copying
  (e) Separate password channel    -- Defense in depth: even if the CD
                                      is stolen, the encrypted ZIP
                                      cannot be opened without the
                                      separately-delivered password
