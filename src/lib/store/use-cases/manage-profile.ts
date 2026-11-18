import { err, ok, type Result } from '../../domain/errors';
import type { Clock, IdGenerator, StorePort } from '../ports';
import type { Profile } from '../schema';

export const MAX_DISPLAY_NAME_LENGTH = 40;

export function createProfile(
  store: StorePort,
  clock: Clock,
  ids: IdGenerator,
  displayName: string,
): Result<Profile> {
  const name = displayName.trim();
  if (name.length === 0 || name.length > MAX_DISPLAY_NAME_LENGTH) {
    return err({
      code: 'invalid_field',
      field: 'displayName',
      message: 'Enter a name of 1–40 characters.',
    });
  }

  const read = store.read();
  if (!read.ok) return err(read.error);

  const profile: Profile = {
    id: ids.next('u'),
    displayName: name,
    avatar: name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    createdAt: clock.now(),
  };
  const write = store.write({
    ...read.value,
    profiles: [...read.value.profiles, profile],
    activeUserId: profile.id,
  });
  if (!write.ok) return err(write.error);
  return ok(profile);
}

export function selectProfile(store: StorePort, profileId: string): Result<Profile> {
  const read = store.read();
  if (!read.ok) return err(read.error);

  const profile = read.value.profiles.find((entry) => entry.id === profileId);
  if (!profile) return err({ code: 'not_found', message: 'That account no longer exists.' });

  const write = store.write({ ...read.value, activeUserId: profileId });
  if (!write.ok) return err(write.error);
  return ok(profile);
}
