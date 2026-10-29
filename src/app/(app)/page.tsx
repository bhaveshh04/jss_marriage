import { getStats, listCandidates } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";
const PAGE = 12;

export default async function Dashboard({ searchParams }: { searchParams: { q?: string; gender?: string; status?: string; page?: string } }) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [{ rows, total }, stats] = await Promise.all([
    listCandidates({ ...searchParams, page, pageSize: PAGE }),
    getStats(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <DashboardClient
      rows={rows}
      total={total}
      stats={stats}
      page={page}
      pages={pages}
      searchParams={searchParams as Record<string, string | undefined>}
    />
  );
}
