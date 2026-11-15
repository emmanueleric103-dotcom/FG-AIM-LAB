
import { getStore } from "@netlify/blobs"
const KNOWN_PAID_REFS = ["SS15YT2P60WUMW0AG","S4571DJT89ELCFIA1","SKG52AHHW5CHVQFFY","SA0STOO5F602B"]
export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
  try {
    const { ref, fingerprint } = await req.json()
    const cleanRef = (ref || "").trim().toUpperCase()
    const fp = (fingerprint || "").trim()
    if (!cleanRef || cleanRef.length < 10) return new Response(JSON.stringify({ status: "invalid", message: "Invalid reference." }), { status: 200 })
    if (!/[A-Z]/.test(cleanRef) || !/[0-9]/.test(cleanRef)) return new Response(JSON.stringify({ status: "invalid", message: "Invalid reference format." }), { status: 200 })
    if (cleanRef.startsWith("FG-")) return new Response(JSON.stringify({ status: "invalid", message: "FG- codes are old. Use your Selar Reference directly." }), { status: 200 })
    let isPaid = KNOWN_PAID_REFS.includes(cleanRef)
    if (!isPaid) {
      try {
        const paidStore = getStore("fg-paid-refs")
        const paid = await paidStore.get("PAID:" + cleanRef, { type: "json" })
        if (paid) isPaid = true
      } catch {}
    }
    if (!isPaid) return new Response(JSON.stringify({ status: "invalid", message: "Invalid reference. This Reference is NOT in Sales yet. Seller has not added it. If you are the seller, tap SELLER APPROVE below." }), { status: 200 })
    const usedStore = getStore("fg-used-refs")
    let existing = null
    try { existing = await usedStore.get(cleanRef, { type: "json" }) } catch {}
    if (existing) {
      if (existing.fingerprint && existing.fingerprint === fp) return new Response(JSON.stringify({ status: "ok_same_profile" }), { status: 200 })
      if (existing.fingerprint && existing.fingerprint !== fp) return new Response(JSON.stringify({ status: "used_for_other" }), { status: 200 })
      return new Response(JSON.stringify({ status: "used" }), { status: 200 })
    }
    await usedStore.setJSON(cleanRef, { ref: cleanRef, fingerprint: fp, usedAt: new Date().toISOString() })
    return new Response(JSON.stringify({ status: "ok" }), { status: 200 })
  } catch (e) { return new Response(JSON.stringify({ status: "error", message: String(e) }), { status: 500 }) }
}
export const config = { path: "/.netlify/functions/verify-ref" }
