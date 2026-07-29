import { redirect } from 'next/navigation';

/** Retired by M4 — safety is an Operations workstream. See M8. */
export default function SafetyRedirect() {
  redirect('/dashboard/operations/safety');
}
