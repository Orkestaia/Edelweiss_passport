"use client";
import { useEffect, useRef, useState } from "react";
import { readLocal, writeLocal } from "@/lib/storage";
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
declare global { interface Window { __edelweissInstallPrompt?: InstallEvent } }
export function Install() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null), [standalone, setStandalone] = useState(false);
  const sheet = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const media = matchMedia("(display-mode: standalone)");
    const isStandalone = () => media.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const update = () => setStandalone(isStandalone());
    const frame = requestAnimationFrame(() => { update(); if (window.__edelweissInstallPrompt) setPrompt(window.__edelweissInstallPrompt); });
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const installed = () => { setStandalone(true); setPrompt(null); delete window.__edelweissInstallPrompt; sheet.current?.close(); };
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    const timer = setTimeout(() => {
      if (ios && !isStandalone() && !readLocal("edelweiss_install_help_seen")) { sheet.current?.showModal(); writeLocal("edelweiss_install_help_seen", "1"); }
    }, 1200);
    window.addEventListener("beforeinstallprompt", capture); window.addEventListener("appinstalled", installed); media.addEventListener("change", update);
    return () => { cancelAnimationFrame(frame); clearTimeout(timer); window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", installed); media.removeEventListener("change", update); };
  }, []);
  if (standalone) return null;
  return <section className="install"><div><p className="eyebrow">Keep a little Switzerland with you</p><h2>Your passport, one tap away.</h2></div>{prompt && <button className="button" onClick={async () => { try { await prompt.prompt(); await prompt.userChoice; } finally { setPrompt(null); delete window.__edelweissInstallPrompt; } }}>Add to home screen</button>}<button className="text-button" onClick={() => sheet.current?.showModal()}>How to add to home screen</button><dialog className="stop-dialog" ref={sheet}><button aria-label="Close installation instructions" className="dialog-close" onClick={() => sheet.current?.close()}>×</button><p className="eyebrow">Always close at hand</p><h2>Add your passport</h2><p>On iPhone, open this passport in Safari.</p><p>Tap Share <span role="img" aria-label="Share">⎋</span> → <strong>Add to Home Screen</strong>.</p><p>On Android, use <strong>Add to home screen</strong> or <strong>Install app</strong> in Chrome’s menu.</p><p>Your app will open directly to this personal passport.</p></dialog></section>;
}
