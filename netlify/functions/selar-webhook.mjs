
// FG AIM LAB - Selar Webhook Receiver
// Selar -> Zapier Integration -> Webhook URL = https://hefgesensitivity.hefge.cloud/.netlify/functions/selar-webhook
// When buyer pays, Selar POSTs order data here. We extract Ref and mark it as PAID automatically.
// Then buyer goes to /claim, enters same Ref, gets code instantly - NO manual approve needed.
//
// Selar/Zapier payload can have many shapes, so we check ALL possible field names:
// reference, transaction_reference, tx_ref, order_id, orderId, transaction_id, id, ref, payment_reference, etc.
// Also checks nested data / order / transaction objects.
import { getStore } from "@netlify/blobs"

function findRef(obj, depth=0) {
  if (!obj || depth > 3) return null
  if (typeof obj === "string") {
    // If string looks like a Ref (10+ chars, has letter + digit), return it
    const s = obj.trim()
    if (s.length >= 10 && /[A-Z]/i.test(s) && /[0-9]/.test(s)) return s.toUpperCase()
    return null
  }
  if (typeof obj !== "object") return null
  const keys = ["reference","transaction_reference","tx_ref","txref","order_id","orderId","orderID","transaction_id","transactionId","payment_reference","payment_ref","ref","reference_id","id","txn_ref","receipt","invoice"]
  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "string" && obj[k].trim().length >= 10) {
      const v = obj[k].trim().toUpperCase()
      if (/[A-Z]/.test(v) && /[0-9]/.test(v)) return v
    }
  }
  // Search nested objects
  for (const v of Object.values(obj)) {
    if (typeof v === "object") {
      const found = findRef(v, depth+1)
      if (found) return found
    }
  }
  return null
}
function findEmail(obj, depth=0) {
  if (!obj || depth > 3) return ""
  if (typeof obj !== "object") return ""
  const keys = ["customer_email","email","buyer_email","customerEmail","buyerEmail","user_email"]
  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "string" && obj[k].includes("@")) return obj[k]
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "object") {
      const f = findEmail(v, depth+1)
      if (f) return f
    }
  }
  return ""
}
function findAmount(obj, depth=0) {
  if (!obj || depth > 3) return null
  if (typeof obj !== "object") return null
  const keys = ["amount","total","price","amount_paid","paid_amount"]
  for (const k of keys) {
    if (obj[k] != null) return obj[k]
  }
  for (const v of Object.values(obj)) {
    if (typeof v === "object") {
      const f = findAmount(v, depth+1)
      if (f != null) return f
    }
  }
  return null
}

export default async (req) => {
  // Zapier test sends GET, real sale sends POST
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok", message: "FG AIM LAB Selar Webhook is live. Selar should POST here on new sale." }), { status: 200 })
  }
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405 })
  try {
    let body = {}
    try { body = await req.json() } catch { body = {} }
    const ref = findRef(body)
    const email = findEmail(body)
    const amount = findAmount(body)
    if (!ref) {
      return new Response(JSON.stringify({ status: "no_ref", message: "No reference found in payload. Body received.", receivedKeys: Object.keys(body) }), { status: 200 })
    }
    // Mark as PAID automatically - this is the auto-approve!
    const paidStore = getStore("fg-paid-refs")
    await paidStore.setJSON("PAID:" + ref, { ref, email: email || "", amount: amount || "", verifiedVia: "selar_webhook", at: new Date().toISOString(), raw: JSON.stringify(body).slice(0, 2000) })
    return new Response(JSON.stringify({ status: "ok", message: `Ref ${ref} marked as PAID via webhook. Buyer can now claim code.`, ref }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", message: String(e) }), { status: 500 })
  }
}
export const config = { path: "/.netlify/functions/selar-webhook" }
