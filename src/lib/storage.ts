import { isTauri, invoke } from './tauri';

export type RockyData = unknown;

export async function hasFileHandle(): Promise<boolean> {
  return isTauri() || typeof localStorage !== 'undefined';
}

export async function loadData<T = RockyData>(): Promise<T | undefined> {
  try {
    if (isTauri()) {
      const json = await invoke<any>('load_data');
      return json as T;
    }
    const raw = localStorage.getItem('rocky');
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export async function saveData<T = RockyData>(data: T): Promise<void> {
  if (isTauri()) {
    await invoke('save_data', { payload: data });
    return;
  }
  localStorage.setItem('rocky', JSON.stringify(data));
}
