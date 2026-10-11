import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <h1 className="text-xl font-bold text-kumkum-900">Bio-data not found</h1>
      <p className="mt-2 text-sm text-stone-500">It may have been deleted. Go back to the list to pick another one.</p>
      <Link href="/" className="btn-primary mt-5">Back to dashboard</Link>
    </div>
  );
}
