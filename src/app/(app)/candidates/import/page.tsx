import ImportClient from "@/components/ImportClient";

export const metadata = { title: "Import from Excel" };

export default function ImportPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight text-kumkum-900">Import from Excel</h1>
      <p className="mb-6 text-sm text-stone-500">Add many bio-datas at once. Download the template, fill one candidate per row, then upload it here.</p>
      <ImportClient />
    </>
  );
}
