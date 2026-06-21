// Cloudflare Pages Function: GitHub OAuth - step 2 (callback)
// Exchanges the GitHub "code" for an access token, then posts it back
// to the Decap CMS popup window via postMessage, exactly as Decap expects.

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response("Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET environment variables.", { status: 500 });
  }

  if (!code) {
    return new Response("Missing OAuth code.", { status: 400 });
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      renderPage("error", { message: tokenData.error_description || "OAuth token exchange failed." }),
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  return new Response(renderPage("success", { token: tokenData.access_token, provider: "github" }), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

function renderPage(status, payload) {
  // Decap CMS listens for a postMessage with this exact format:
  // "authorization:github:success:{\"token\":\"...\",\"provider\":\"github\"}"
  const message =
    status === "success"
      ? `authorization:github:success:${JSON.stringify(payload)}`
      : `authorization:github:error:${JSON.stringify(payload)}`;

  return `<!DOCTYPE html>
<html>
<body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      ${JSON.stringify(message)},
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;
}
