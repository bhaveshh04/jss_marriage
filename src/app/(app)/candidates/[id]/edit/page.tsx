import { notFound } from "next/navigation";
import CandidateForm from "@/components/CandidateForm";
import { getCandidate } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditCandidate({ params }: { params: { id: string } }) {
  const c = await getCandidate(Number(params.id));
  if (!c) notFound();
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-kumkum-900">Edit bio-data</h1>
      <CandidateForm initial={c} />
    </>
  );
}
