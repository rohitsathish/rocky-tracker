declare global {
  interface Window { __TAURI__?: any }
}

export function isTauri(): boolean {
  // More robust check: ensure both __TAURI__ exists AND has invoke method
  return typeof window !== 'undefined' && 
         !!window.__TAURI__ && 
         typeof window.__TAURI__.invoke === 'function';
}

export async function invoke<T = any>(cmd: string, args?: Record<string, any>): Promise<T> {
  // Works without installing @tauri-apps/api by using the injected global
  // when running under Tauri.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const api: any = (window as any).__TAURI__;
  if (!api?.invoke) {
    throw new Error(`Tauri API not available. Running in ${isTauri() ? 'Tauri but invoke missing' : 'web browser'}. Use 'npm run dev:app' instead of 'npm run dev'.`);
  }
  return api.invoke(cmd, args);
}

