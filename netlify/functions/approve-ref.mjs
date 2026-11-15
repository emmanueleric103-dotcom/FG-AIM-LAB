
import { getStore } from "@netlify/blobs"
export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
  try {
    const { ref, sellerKey } = await req.json()
    const expected = process.env.SELLER_KEY || "FG-SELLER-2026"
    if (sellerKey !== expected) return new Response(JSON.stringify({ status: "unauthorized", message: "Wrong Seller Key. Default is FG-SELLER-2026 unless you changed SELLER_KEY in Netlify." }), { status: 200 })
    const cleanRef = (ref || "").trim().toUpperCase()
    if (!cleanRef || cleanRef.length < 10) return new Response(JSON.stringify({ status: "invalid", message: "Enter ref." }), { status: 200 })
    const paidStore = getStore("fg-paid-refs")
    await paidStore.setJSON("PAID:" + cleanRef, { ref: cleanRef, verifiedVia: "seller_manual", at: new Date().toISOString() })
    return new Response(JSON.stringify({ status: "ok", message: `Ref ${cleanRef} marked as PAID. Buyer can now unlock.` }), { status: 200 })
  } catch (e) { return new Response(JSON.stringify({ status: "error", message: String(e) }), { status: 500 }) }
}
export const config = { path: "/.netlify/functions/approve-ref" }
