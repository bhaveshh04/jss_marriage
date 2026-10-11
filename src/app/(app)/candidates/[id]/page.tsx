import { notFound } from "next/navigation";
import BioDataViewer from "@/components/BioDataViewer";
import { getCandidate } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CandidatePage({ params, searchParams }: { params: { id: string }; searchParams: { print?: string } }) {
  const c = await getCandidate(Number(params.id));
  if (!c) notFound();
  return <BioDataViewer c={c} autoPrint={searchParams.print === "1"} />;
}
