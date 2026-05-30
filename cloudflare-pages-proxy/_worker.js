const upstreamOrigin = "https://syp-33-6.tinolambut.workers.dev";

function rewriteRequestUrl(requestUrl) {
  const incomingUrl = new URL(requestUrl);
  return new URL(`${incomingUrl.pathname}${incomingUrl.search}`, upstreamOrigin);
}

function rewriteHeaderUrl(value, incomingOrigin, targetOrigin) {
  if (!value) return value;
  return value.replaceAll(incomingOrigin, targetOrigin);
}

function upstreamRequest(request) {
  const incomingUrl = new URL(request.url);
  const headers = new Headers(request.headers);
  const origin = headers.get("origin");
  const referer = headers.get("referer");

  if (origin === incomingUrl.origin) {
    headers.set("origin", upstreamOrigin);
  }

  if (referer) {
    headers.set("referer", rewriteHeaderUrl(referer, incomingUrl.origin, upstreamOrigin));
  }

  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  return new Request(rewriteRequestUrl(request.url), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
}

async function downstreamResponse(response, incomingOrigin) {
  const headers = new Headers(response.headers);
  const location = headers.get("location");
  const contentType = headers.get("content-type") ?? "";

  if (location) {
    headers.set("location", rewriteHeaderUrl(location, upstreamOrigin, incomingOrigin));
  }

  if (contentType.includes("application/json")) {
    const body = rewriteHeaderUrl(await response.text(), upstreamOrigin, incomingOrigin);
    headers.delete("content-encoding");
    headers.delete("content-length");

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const proxyWorker = {
  async fetch(request) {
    const response = await fetch(upstreamRequest(request));
    return await downstreamResponse(response, new URL(request.url).origin);
  },
};

export default proxyWorker;
