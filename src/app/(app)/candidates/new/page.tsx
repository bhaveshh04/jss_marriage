import CandidateForm from "@/components/CandidateForm";

export const metadata = { title: "Add bio-data" };

export default function NewCandidate() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-kumkum-900">Add bio-data</h1>
      <CandidateForm />
    </>
  );
}
