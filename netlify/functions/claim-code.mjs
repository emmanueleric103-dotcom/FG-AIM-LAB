
// FG AIM LAB - SECURE CLAIM - FIXED
// BEFORE (BROKEN): Any ref that looked valid got a new code. Change 1 letter = new code = unlimited free codes.
// AFTER (FIXED): Only refs seller marked as PAID in Selar can get a code.
// - Buyer enters ref -> We check PAID store (filled by seller after checking Selar Dashboard, OR by Selar API if SELAR_API_KEY is set)
// - If ref NOT in PAID store -> NO CODE. Return status "pending" - buyer must wait for seller to verify.
// - If ref IS in PAID store -> Generate 1 unique code for that ref (same ref = same code, different ref = different code)
// - Changing 1 letter = ref NOT in PAID store = NO CODE. Hole closed.
import { getStore } from "@netlify/blobs"
import crypto from "node:crypto"
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
const SECRET = "FG-AIM-LAB-2026-CLAIM-SECRET-v1"
function makeCode(ref, email) {
  const hash = crypto.createHash("sha256").update(SECRET + "|" + ref.trim().toUpperCase() + "|" + (email||"").trim().toLowerCase()).digest("hex")
  let out = ""
  for (let i=0; i<12; i++) { const byte = parseInt(hash.slice(i*2, i*2+2), 16); out += CHARS[byte % CHARS.length] }
  return `FG-${out.slice(0,4)}-${out.slice(4,8)}-${out.slice(8,12)}`
}
async function trySelarApi(ref) {
  // If seller sets SELAR_API_KEY in Netlify Env Vars, we try to verify ref directly with Selar.
  // If no key or API fails, we return false and fall back to manual PAID store.
  const key = process.env.SELAR_API_KEY
  if (!key) return false
  try {
    const urls = [
      `https://api.selar.co/v1/transactions/${encodeURIComponent(ref)}`,
      `https://api.selar.com/v1/transactions/${encodeURIComponent(ref)}`,
      `https://selar.co/api/transactions/${encodeURIComponent(ref)}`,
    ]
    for (const u of urls) {
      try {
        const r = await fetch(u, { headers: { Authorization: `Bearer ${key}` } })
        if (r.ok) {
          const j = await r.json()
          const status = (j.status || j.data?.status || "").toLowerCase()
          const paid = status.includes("paid") || status.includes("success") || status.includes("completed") || j.paid === true
          if (paid) return true
        }
      } catch {}
    }
  } catch {}
  return false
}
export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
  try {
    const { ref, email } = await req.json()
    const cleanRef = (ref || "").trim().toUpperCase()
    if (!cleanRef || cleanRef.length < 10) return new Response(JSON.stringify({ status: "invalid", message: "Enter your real Selar reference from your receipt." }), { status: 200 })
    if (!/[A-Z]/i.test(cleanRef) || !/[0-9]/.test(cleanRef)) return new Response(JSON.stringify({ status: "invalid", message: "Invalid reference format." }), { status: 200 })
    const blocked = ["ABCD1234","TEST1234","FAKE","1234567890","ABCDEFGHIJ","SELARTEST","AHDJSGDNFJ"]
    if (blocked.some(b => cleanRef.includes(b))) return new Response(JSON.stringify({ status: "invalid", message: "Invalid reference." }), { status: 200 })

    // 1. Check if seller already marked this ref as PAID
    const paidStore = getStore("fg-paid-refs")
    const paid = await paidStore.get("PAID:" + cleanRef, { type: "json" })
    let isPaid = !!paid
    // 2. If not in PAID store, try Selar API (if key set)
    if (!isPaid) {
      const apiPaid = await trySelarApi(cleanRef)
      if (apiPaid) {
        isPaid = true
        await paidStore.setJSON("PAID:" + cleanRef, { ref: cleanRef, verifiedVia: "selar_api", at: new Date().toISOString() })
      }
    }
    // 3. NOT PAID -> NO CODE. This closes the 1-letter hole.
    if (!isPaid) {
      // Save as pending so seller can see it in /seller page
      const pendingStore = getStore("fg-pending-refs")
      await pendingStore.setJSON("PENDING:" + cleanRef, { ref: cleanRef, email: email||"", at: new Date().toISOString() })
      return new Response(JSON.stringify({ status: "pending", message: "This reference is not verified as PAID yet. Seller is checking Selar. If you just paid, wait a few minutes and try again. If you changed 1 letter, it will never verify — use the EXACT ref from your receipt." }), { status: 200 })
    }
    // 4. PAID -> Give 1 code for this ref (same ref = same code)
    const claimedStore = getStore("fg-claimed-refs")
    const existing = await claimedStore.get("REF:" + cleanRef, { type: "json" })
    if (existing && existing.code) return new Response(JSON.stringify({ status: "ok", code: existing.code, ref: cleanRef, alreadyClaimed: true }), { status: 200 })
    let code = makeCode(cleanRef, email)
    const issuedStore = getStore("fg-issued-codes")
    let tries = 0
    while (tries < 5) {
      const c = await issuedStore.get(code, { type: "json" })
      if (!c) break
      if (c.ref === cleanRef) break
      tries++; code = makeCode(cleanRef + "#" + tries, email)
    }
    await claimedStore.setJSON("REF:" + cleanRef, { code, ref: cleanRef, email: email||"", claimedAt: new Date().toISOString() })
    await issuedStore.setJSON(code, { ref: cleanRef, email: email||"", issuedAt: new Date().toISOString() })
    return new Response(JSON.stringify({ status: "ok", code, ref: cleanRef, alreadyClaimed: false }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", message: String(e) }), { status: 500 })
  }
}
export const config = { path: "/.netlify/functions/claim-code" }
