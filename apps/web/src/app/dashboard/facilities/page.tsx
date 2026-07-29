import { redirect } from 'next/navigation';

/**
 * Retired by M4. Facility work is an Operations workstream, not a top-level
 * page — see docs/architecture/MEDICAL_MODULE_ARCHITECTURE.md (M8).
 *
 * The old page rendered outside AppLayout, so it had no sidebar and no way
 * back. Kept as a redirect rather than deleted so existing links and
 * bookmarks land somewhere real.
 */
export default function FacilitiesRedirect() {
  redirect('/dashboard/operations/facilities');
}
