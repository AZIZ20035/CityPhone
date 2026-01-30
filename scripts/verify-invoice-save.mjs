const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

async function getCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    const cookies = response.headers.getSetCookie();
    if (cookies && cookies.length) return cookies;
  }
  const raw = response.headers.get("set-cookie");
  return raw ? raw.split(",").map((part) => part.trim()) : [];
}

async function main() {
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const csrfJson = await csrfRes.json();
  const csrfToken = csrfJson.csrfToken;

  const loginBody = new URLSearchParams({
    csrfToken,
    email: process.env.ADMIN_EMAIL ?? "admin@local.test",
    password: process.env.ADMIN_PASSWORD ?? "Admin12345",
    json: "true"
  });

  const loginRes = await fetch(
    `${baseUrl}/api/auth/callback/credentials`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: loginBody.toString()
    }
  );

  const cookies = await getCookies(loginRes);
  const cookieHeader = cookies.map((c) => c.split(";")[0]).join("; ");

  if (!cookieHeader) {
    console.error("FAILED: no session cookie from login");
    process.exit(1);
  }

  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { Cookie: cookieHeader }
  });
  const sessionJson = await sessionRes.json();
  if (!sessionJson?.user) {
    console.error("FAILED: session not established", sessionJson);
    process.exit(1);
  }

  const invoiceRes = await fetch(`${baseUrl}/api/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader
    },
    body: JSON.stringify({
      customerName: "اختبار",
      deviceType: "iPhone"
    })
  });

  const contentType = invoiceRes.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await invoiceRes.json()
    : await invoiceRes.text();

  if (!invoiceRes.ok) {
    console.error("FAILED", invoiceRes.status, payload);
    process.exit(1);
  }

  if (!payload.invoice?.invoiceNo) {
    console.error("FAILED: invoiceNo missing", payload);
    process.exit(1);
  }

  const listRes = await fetch(`${baseUrl}/api/invoices`, {
    headers: { Cookie: cookieHeader }
  });
  const listJson = await listRes.json();
  const exists = Array.isArray(listJson.invoices)
    ? listJson.invoices.some((inv) => inv.id === payload.invoice.id)
    : false;

  if (!exists) {
    console.error("FAILED: invoice row not found in list");
    process.exit(1);
  }

  console.log("OK", payload.invoice.invoiceNo);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
