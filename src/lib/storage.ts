export function readLocal(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
export function writeLocal(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Private browsing may disable storage. */ } }
