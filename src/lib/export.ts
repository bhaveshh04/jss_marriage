import { SHEET_H, SHEET_W } from "@/components/BioDataSheet";

async function render(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  // first call warms up fonts/images so the real capture is complete
  await toPng(node, { width: SHEET_W, height: SHEET_H, pixelRatio: 1, cacheBust: false });
  return toPng(node, { width: SHEET_W, height: SHEET_H, pixelRatio: 2.5, cacheBust: false, backgroundColor: "#ffffff" });
}

const safe = (s: string) => s.replace(/[^\p{L}\p{N}_-]+/gu, "_");

export async function downloadPng(node: HTMLElement, name: string) {
  const url = await render(node);
  const a = document.createElement("a");
  a.href = url; a.download = `${safe(name)}.png`; a.click();
}

export async function downloadPdf(node: HTMLElement, name: string) {
  const [url, { jsPDF }] = await Promise.all([render(node), import("jspdf")]);
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pdf.addImage(url, "PNG", 0, 0, 210, 297, undefined, "FAST");
  pdf.save(`${safe(name)}.pdf`);
}
