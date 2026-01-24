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

  if (!res.ok) {
    const message = data?.error ?? text ?? res.statusText;
    const error = new Error(message);
    (error as any).status = res.status;
    throw error;
  }

  return (data ?? {}) as T;
}
