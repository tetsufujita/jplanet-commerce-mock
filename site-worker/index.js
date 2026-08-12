/**
 * Sites/Cloudflare entry point for the Vite-built static SPA.
 * Static assets are served through the platform ASSETS binding and unknown
 * application routes fall back to index.html for client-side navigation.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const response = await env.ASSETS.fetch(request);

    if (
      response.status === 404 &&
      request.method === "GET" &&
      !url.pathname.startsWith("/assets/")
    ) {
      return env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url), request),
      );
    }

    return response;
  },
};
