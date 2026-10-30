import { OPTIONAL_COMPONENTS, OPTIONAL_LIMIT, type ComponentId } from '../config';

/** Legfeljebb kettő választható küldetés jelölhető ki; a harmadik letiltott. */
export function canPickOptional(picked: readonly ComponentId[], id: ComponentId): boolean {
  if (!OPTIONAL_COMPONENTS.includes(id)) return false;
  return picked.includes(id) || picked.length < OPTIONAL_LIMIT;
}

export function togglePick(picked: readonly ComponentId[], id: ComponentId): ComponentId[] {
  if (picked.includes(id)) return picked.filter((p) => p !== id);
  return canPickOptional(picked, id) ? [...picked, id] : [...picked];
}
