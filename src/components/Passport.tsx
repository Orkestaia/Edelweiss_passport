"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { PassportMap } from "./PassportMap";
import { Install } from "./Install";
import { writeLocal } from "@/lib/storage";
import type { PassportCard } from "@/lib/types";
export const ORDER_URL = "https://edelweisspastryshop.ch/menu";
export function Brand() { return <header className="brand"><a href="https://edelweisspastryshop.ch" aria-label="Edelweiss Pastry Shop"><Image src="/edelweiss-logo.png" alt="Edelweiss Pastry Shop" width={200} height={90} className="logo" priority/></a><span>Swiss roots. Maine heart.</span></header>; }
export function Rules() { return <p className="rules">1 stamp per online order · 2 stamps on orders over $40 · 10 stamps = 15% off · reward valid 30 days · online orders only</p>; }
export function Passport({ card, token, calibrate }: { card: PassportCard; token: string; calibrate?: boolean }) {
  const [offline, setOffline] = useState(false), [copied, setCopied] = useState(false), [copyError, setCopyError] = useState(false);
  useEffect(() => {
    writeLocal("edelweiss_passport_token", token);
    const update = () => setOffline(!navigator.onLine);
    const online = () => { setOffline(false); window.location.reload(); };
    const frame = requestAnimationFrame(update);
    window.addEventListener("offline", update); window.addEventListener("online", online);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready).then(registration => registration.active?.postMessage({ type: "CACHE_PASSPORT", path: `/p/${token}` })).catch(() => {});
    return () => { cancelAnimationFrame(frame); window.removeEventListener("offline", update); window.removeEventListener("online", online); };
  }, [token]);
  return <main className="passport-shell" data-passport-valid="true"><Brand/>{offline && <p className="offline" role="status">You’re offline — showing your last saved passport. Rewards must be checked online.</p>}
    <section className="passport-heading"><p className="eyebrow">Your Edelweiss Swiss Passport</p><h1>Grüezi, {card.firstName || "traveller"}!</h1><p>A little Swiss adventure, one delicious order at a time.</p></section>
    <section className="progress-section"><div><h2><strong>{card.stampsOnCard}</strong> of 10 stamps</h2><p>{card.stampsOnCard === 10 ? "You made it to the Matterhorn. Your Swiss journey is complete!" : `${10 - card.stampsOnCard} more stops to the Matterhorn and 15% off your next online order.`}</p></div><div className="mini-stamps" aria-label={`${card.stampsOnCard} of 10 stamps`}>{Array.from({ length: 10 }, (_, i) => <span key={i} className={i < card.stampsOnCard ? "filled" : ""} aria-hidden="true">{i === 9 ? "✿" : i + 1}</span>)}</div></section>
    <PassportMap count={card.stampsOnCard} stamps={card.stamps} token={token} calibrate={calibrate}/>
    {card.reward && <section className="reward"><Image src="/reward-card.png" alt="Matterhorn reward: 15% off" width={480} height={360} className="reward-image"/><div><p className="eyebrow">A sweet reward for your journey</p><h2>The next treat is on us.<br/><em>Well, 15% of it.</em></h2><p>Use your personal code on your next online order.</p><div className="reward-code"><code>{card.reward.code}</code><button aria-label="Copy reward code" onClick={async () => { try { await navigator.clipboard.writeText(card.reward!.code); setCopied(true); setCopyError(false); } catch { setCopyError(true); } }}>{copied ? "Copied!" : "Copy"}</button></div>{copyError && <p role="status">Please select and copy the code above.</p>}<p className="reward-valid">Valid until {new Date(card.reward.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })} · Online orders only</p><a className="button" href={ORDER_URL}>Order online <span aria-hidden="true">↗</span></a></div></section>}
    <Rules/><Install/><section className="history"><p className="eyebrow">Little moments along the way</p><h2>Your journey so far</h2>{card.history.length ? <ul>{card.history.map((h, i) => <li key={`${h.date}-${i}`}><time dateTime={h.date}>{new Date(h.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" })}</time><span>+{h.stamps} {h.stamps === 1 ? "stamp" : "stamps"}</span></li>)}</ul> : <p>Your first stop is waiting.</p>}<p className="history-note">One passport, ten stops, one reward. Orders after completion do not start a new passport.</p></section><footer>Made with Swiss care, here in Maine. <span aria-hidden="true">✿</span> Edelweiss Pastry Shop</footer>
  </main>;
}
