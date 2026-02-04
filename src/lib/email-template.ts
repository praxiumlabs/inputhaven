function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSubmissionEmailHtml(
  formName: string,
  data: Record<string, unknown>,
  submittedAt: string
): string {
  const dataHtml = Object.entries(data)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${escapeHtml(String(key))}</td><td style="padding:8px;border:1px solid #ddd">${escapeHtml(String(value))}</td></tr>`
    )
    .join("");

  return `
    <h2>New Form Submission</h2>
    <p>Form: ${escapeHtml(formName)}</p>
    <table style="border-collapse:collapse;width:100%">
      ${dataHtml}
    </table>
    <p style="color:#888;font-size:12px;margin-top:20px">
      Submitted at ${submittedAt}
    </p>
  `;
}
