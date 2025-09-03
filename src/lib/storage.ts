import { isTauri, invoke } from './tauri';

const LOG_PREFIX = '[storage]';
const debug = (...args: unknown[]) => console.debug(LOG_PREFIX, ...args);
const error = (...args: unknown[]) => console.error(LOG_PREFIX, ...args);

export type RockyData = unknown;

export async function hasFileHandle(): Promise<boolean> {
  const ok = isTauri() || typeof localStorage !== 'undefined';
  debug('hasFileHandle', { tauri: isTauri(), localStorage: typeof localStorage !== 'undefined', ok });
  return ok;
}

export async function loadData<T = RockyData>(): Promise<T | undefined> {
  try {
    if (isTauri()) {
      debug('loadData via Tauri invoke(load_data)');
      const json = await invoke<any>('load_data');
      debug('loadData Tauri: success', { bytes: JSON.stringify(json).length });
      return json as T;
    }
    debug('loadData via localStorage');
    const raw = localStorage.getItem('rocky');
    const parsed = raw ? (JSON.parse(raw) as T) : undefined;
    debug('loadData localStorage: success', { bytes: raw?.length ?? 0, present: !!raw });
    return parsed;
  } catch (e) {
    error('loadData failed', e);
    return undefined;
  }
}

export async function saveData<T = RockyData>(data: T): Promise<void> {
  const payload = data as unknown as object;
  
  if (isTauri()) {
    debug('saveData via Tauri invoke(save_data)');
    await invoke('save_data', { payload });
    return;
  }
  
  debug('saveData via localStorage');
  localStorage.setItem('rocky', JSON.stringify(payload));
}
