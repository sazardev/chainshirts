export type StoreError =
  | { code: 'no_profile'; message: string }
  | { code: 'empty_cart'; message: string }
  | { code: 'invalid_field'; field: string; message: string }
  | { code: 'not_found'; message: string }
  | { code: 'storage_unavailable'; message: string }
  | { code: 'storage_full'; message: string };

export type Result<T, E = StoreError> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function errorMessage(error: StoreError): string {
  return error.message;
}
