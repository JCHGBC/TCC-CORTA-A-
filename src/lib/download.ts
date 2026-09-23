/** Faz o navegador baixar um texto como arquivo (ex.: relatório CSV). */
export function downloadTextFile(content: string, filename: string, mimeType = "text/csv;charset=utf-8") {
  // "﻿" (BOM) garante que o Excel reconheça os acentos
  const blob = new Blob(["﻿", content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
