/** Email delivery — logs when SMTP/API not configured. */

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; stub?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY ?? process.env.SENDGRID_API_KEY;
  const from = process.env.EMAIL_FROM ?? "noreply@goodbookies.com";

  if (!apiKey) {
    console.info("[email stub]", { to: opts.to, subject: opts.subject });
    return { ok: true, stub: true };
  }

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true };
  }

  console.info("[email stub — no provider]", opts.to, opts.subject);
  return { ok: true, stub: true };
}
