export async function downloadAsPdf(text: string, filename = "tailored-resume.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 15;
  let y = margin;

  const lines = doc.splitTextToSize(text, maxLineWidth);

  for (const line of lines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(filename);
}

export function downloadAsText(text: string, filename = "tailored-resume.txt") {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
