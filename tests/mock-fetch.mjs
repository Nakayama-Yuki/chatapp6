process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "e2e-only-key";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.origin !== "http://127.0.0.1:54321") return originalFetch(input, init);
  if (!url.pathname.startsWith("/auth/v1/")) throw new Error(`Unexpected test API request: ${url}`);
  return Response.json({ code: "invalid_credentials", msg: "Invalid login credentials" }, { status: 400 });
};
