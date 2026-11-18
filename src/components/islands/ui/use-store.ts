import { useEffect, useState } from 'preact/hooks';
import { readState } from '../../../lib/store';
import { STATE_EVENT } from '../../../lib/store/local-storage-adapter';
import { type PersistedState, STORAGE_KEY } from '../../../lib/store/schema';

/**
 * Every render reads persisted state directly from localStorage. A tick forces
 * one post-hydration re-render (server HTML has no user state) and every write
 * or cross-tab change triggers another. This avoids depending on module-level
 * state being shared between Astro's separately bundled islands.
 */
export function useStoreState(): PersistedState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((value) => value + 1);
    update();
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORAGE_KEY) update();
    };
    window.addEventListener(STATE_EVENT, update);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(STATE_EVENT, update);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return readState();
}
