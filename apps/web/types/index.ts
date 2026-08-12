/**
 * Shared application-level types.
 * Feature-specific types live in features/<feature>/types.ts
 */

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

/** Common entity base */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
