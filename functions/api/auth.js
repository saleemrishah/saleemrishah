// Cloudflare Pages Function: GitHub OAuth - step 1 (redirect to GitHub)
// Env vars required (set in Cloudflare Pages dashboard):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET (used in callback.js, not here)

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const origin = `${url.protocol}//${url.host}`;

  if (!env.GITHUB_CLIENT_ID) {
    return new Response("Missing GITHUB_CLIENT_ID environment variable.", { status: 500 });
  }

  const redirectUri = `${origin}/api/callback`;
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo,user");
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
