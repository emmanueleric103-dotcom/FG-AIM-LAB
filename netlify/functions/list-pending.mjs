
import { getStore } from "@netlify/blobs"
export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
  try {
    const { sellerKey } = await req.json()
    const expected = process.env.SELLER_KEY || "FG-SELLER-2026"
    if (sellerKey !== expected) return new Response(JSON.stringify({ status: "unauthorized" }), { status: 401 })
    const pendingStore = getStore("fg-pending-refs")
    const { blobs } = await pendingStore.list()
    const items = []
    for (const b of blobs.slice(0, 50)) {
      const v = await pendingStore.get(b.key, { type: "json" })
      if (v) items.push(v)
    }
    items.sort((a,b)=> new Date(b.at).getTime() - new Date(a.at).getTime())
    return new Response(JSON.stringify({ status: "ok", pending: items }), { status: 200 })
  } catch (e) { return new Response(JSON.stringify({ status: "error", message: String(e) }), { status: 500 }) }
}
export const config = { path: "/.netlify/functions/list-pending" }
