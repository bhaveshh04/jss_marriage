import { getDisplayCandidates, getDisplayConfig } from "@/lib/db";
import DisplayScreen from "@/components/DisplayScreen";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live Display — खान्देश मराठा मंडळ" };

export default async function DisplayPage({ searchParams }: { searchParams: { id?: string; gender?: string } }) {
  const [list, displayConfig] = await Promise.all([
    getDisplayCandidates(searchParams.gender),
    getDisplayConfig(),
  ]);
  return (
    <DisplayScreen
      candidates={list}
      startId={searchParams.id ? Number(searchParams.id) : undefined}
      displayConfig={displayConfig}
    />
  );
}
