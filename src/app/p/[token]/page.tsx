import type { Metadata } from "next";
import { getPassport } from "@/lib/passport";
import { Passport } from "@/components/Passport";
import { InvalidPassport } from "@/components/InvalidPassport";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  return { title: "Your Swiss Passport · Edelweiss", robots: { index: false, follow: false }, referrer: "no-referrer", manifest: /^[\w-]{43}$/.test(token) ? `/p/${token}/manifest.webmanifest` : undefined };
}
export default async function Page({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ calibrate?: string }> }) {
  const { token } = await params;
  const card = await getPassport(token);
  if (!card) return <InvalidPassport/>;
  return <Passport card={card} token={token} calibrate={process.env.NODE_ENV === "development" && (await searchParams).calibrate === "1"}/>;
}
