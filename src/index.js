export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    const apiKey = request.headers.get("Apca-Api-Key-Id");
    const secretKey = request.headers.get("Apca-Api-Secret-Key");
    if (!apiKey || !secretKey) {
      return json({ error: "Missing Alpaca credentials" }, 400, origin);
    }

    let targetUrl;
    if (url.pathname === "/api/account") {
      targetUrl = "https://paper-api.alpaca.markets/v2/account";
    } else if (url.pathname === "/api/positions") {
      targetUrl = "https://paper-api.alpaca.markets/v2/positions";
    } else if (url.pathname === "/api/bars") {
      targetUrl = "https://data.alpaca.markets/v2/stocks/bars" + url.search;
    } else {
      return json({ error: "Unknown route" }, 404, origin);
    }

    const alpacaRes = await fetch(targetUrl, {
      headers: {
        "APCA-API-KEY-ID": apiKey,
        "APCA-API-SECRET-KEY": secretKey,
      },
    });

    const body = await alpacaRes.text();
    return new Response(body, {
      status: alpacaRes.status,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  },
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Apca-Api-Key-Id, Apca-Api-Secret-Key, Content-Type",
  };
}

function json(obj, status, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}
