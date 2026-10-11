import { getDisplayCandidates } from "@/lib/db";
import DisplayScreen from "@/components/DisplayScreen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live display" };

export default async function DisplayPage({ searchParams }: { searchParams: { id?: string; gender?: string } }) {
  const list = await getDisplayCandidates(searchParams.gender);
  return <DisplayScreen candidates={list} startId={searchParams.id ? Number(searchParams.id) : undefined} />;
}
