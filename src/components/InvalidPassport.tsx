"use client";
import Link from "next/link";
export function InvalidPassport() {
  return <main className="message-page"><p className="eyebrow">Edelweiss Swiss Passport</p><h1>We couldn&apos;t find this passport</h1><p>Please try the link in your latest order email.</p><Link className="button" href="/" onClick={() => { try { localStorage.removeItem("edelweiss_passport_token"); } catch {} }}>Back to Edelweiss</Link></main>;
}
