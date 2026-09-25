"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="message-page"><h1>Your passport is taking a little longer</h1><p>Please check your connection and try again.</p><button className="button" onClick={reset}>Try again</button><Link href="/">Return home</Link></main>; }
