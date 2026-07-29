import { redirect } from 'next/navigation';

/** Retired by M4 — equipment is an Operations workstream. See M8. */
export default function EquipmentRedirect() {
  redirect('/dashboard/operations/equipment');
}
