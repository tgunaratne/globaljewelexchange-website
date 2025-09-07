export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get("Origin");
    const allowOrigin = isAllowedOrigin(origin) ? origin : "https://globaljewelexchange.com";

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: cors(allowOrigin) });
    }

    if (url.pathname === "/api/early-access" && req.method === "POST") {
      try {
        const { name, email, type } = await req.json();
        if (!name || !email || !type) return json({ ok:false, error:"Missing fields" }, 400, allowOrigin);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:"Invalid email" }, 400, allowOrigin);

        await env.DB.prepare(
          "INSERT OR IGNORE INTO early_access (name, email, user_type) VALUES (?1, ?2, ?3)"
        ).bind(name.trim(), email.trim().toLowerCase(), type).run();

        // Email via Resend
        const fromEmail = env.FROM_EMAIL || "no-reply@globaljewelexchange.com";
        const fromName  = env.FROM_NAME  || "Global Jewel Exchange";
        const html = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thank you for requesting early access to <b>Global Jewel Exchange</b>.
               We’ll be in touch before launch with next steps.</p>
            <p>— ${fromName}</p>
          </div>`;

        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: `${fromName} <${fromEmail}>`, to: email, subject: "Thanks for joining Global Jewel Exchange", html })
        });
        if (!r.ok) console.error("Resend email failed:", await r.text().catch(()=>"(no body)"));

        return json({ ok:true }, 200, allowOrigin);
      } catch (e) {
        console.error(e);
        return json({ ok:false, error:"Server error" }, 500, allowOrigin);
      }
    }

    return new Response("Not found", { status: 404, headers: cors(allowOrigin) });
  }
};

function cors(origin){ return {
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json; charset=utf-8"
};}
function json(obj, status=200, origin="*"){ return new Response(JSON.stringify(obj), { status, headers: cors(origin) }); }
function isAllowedOrigin(o){ if(!o) return false; try { const h=new URL(o).hostname;
  return ["globaljewelexchange.com","www.globaljewelexchange.com","api.globaljewelexchange.com","localhost","127.0.0.1"].some(d=>h===d||h.endsWith("."+d));
} catch { return false; } }
function escapeHtml(s=""){ return s.replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;","'":"&#39;" }[c])); }
