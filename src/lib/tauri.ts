declare global {
  interface Window { __TAURI__?: any }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && !!window.__TAURI__;
}

export async function invoke<T = any>(cmd: string, args?: Record<string, any>): Promise<T> {
  // Works without installing @tauri-apps/api by using the injected global
  // when running under Tauri.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = (window as any).__TAURI__;
  if (!api?.invoke) throw new Error('Tauri API not available');
  return api.invoke(cmd, args);
}

