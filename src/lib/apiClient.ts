async function triggerLogout(reason: string) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }
  const url = new URL(window.location.href);
  url.pathname = "/login";
  url.search = `?reason=${reason}`;
  window.location.href = url.toString();
}

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
) {
  const res = await fetch(url, options);
  const contentType = res.headers.get("content-type") ?? "";
  let data: any = null;
  let text = "";

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    text = await res.text();
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      await triggerLogout("unauthorized");
    }
    const error = new Error("انتهت الجلسة. سجّل الدخول مرة أخرى.");
    (error as any).status = res.status;
    throw error;
  }

  if (!res.ok) {
    const message =
      data?.error ??
      (contentType.includes("text/html") ? "حدث خطأ في الخادم." : text) ??
      res.statusText;
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }

  return (data ?? {}) as T;
}
