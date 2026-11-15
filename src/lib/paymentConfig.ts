
export const PAYMENT_CONFIG = {
  SELAR_CHECKOUT_URL: "https://selar.com/46o4125613",
  PLACEHOLDER_URL: "https://selar.com/fgaimlab-pro",
  SELLER_WHATSAPP: "2348100145906",
  PRODUCT_NAME: "FG AIM LAB Pro — 1 Profile Unlock",
  PRICE_NAIRA: 620, PRICE_DISPLAY: "₦500", CURRENCY: "NGN",
  WHAT_YOU_GET: ["1 Payment = 1 Profile", "Same Profile = FREE next time", "New phone/settings = New ₦500"],
  STORAGE_KEY_UNLOCKED: "fg_payment_unlocked", STORAGE_KEY_REF: "fg_payment_ref", STORAGE_KEY_EMAIL: "fg_payment_email", STORAGE_KEY_DATE: "fg_payment_date", STORAGE_KEY_USED_CODES: "fg_used_codes", STORAGE_KEY_MY_CODE: "fg_my_code", STORAGE_KEY_PENDING: "fg_pending_requests",
  SELAR_REDIRECT_URL: "https://hefgesensitivity.hefge.cloud/lab?selar=success",
}
export function isPlaceholderLink(): boolean { return PAYMENT_CONFIG.SELAR_CHECKOUT_URL === PAYMENT_CONFIG.PLACEHOLDER_URL || PAYMENT_CONFIG.SELAR_CHECKOUT_URL.includes("fgaimlab-pro") }
export function isUnlocked(): boolean { try { return localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_UNLOCKED) === "true" } catch { return false } }
export function getUsedCodes(): string[] { try { return JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_USED_CODES) || "[]") } catch { return [] } }
export function isCodeUsedLocally(code: string): boolean { return getUsedCodes().includes(code.trim().toUpperCase()) }
export function markCodeUsedLocally(code: string) { const clean = code.trim().toUpperCase(); const used = getUsedCodes(); if (!used.includes(clean)) { used.push(clean); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_USED_CODES, JSON.stringify(used)) } localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_MY_CODE, clean) }

export function buildSelarCheckoutUrl(email: string, fullname: string, mobile?: string): string {
  try {
    const base = PAYMENT_CONFIG.SELAR_CHECKOUT_URL
    const hasQ = base.includes("?")
    const sep = hasQ ? "&" : "?"
    const parts: string[] = ["add_to_cart=1"]
    if (email.trim()) parts.push("email=" + encodeURIComponent(email.trim()))
    if (fullname.trim()) parts.push("fullname=" + encodeURIComponent(fullname.trim()))
    if (mobile && mobile.trim()) parts.push("mobile=" + encodeURIComponent(mobile.trim()))
    return base + sep + parts.join("&")
  } catch { return PAYMENT_CONFIG.SELAR_CHECKOUT_URL }
}

export type PendingProfile = { game: 'ff'|'cod', inputs: any, fingerprint: string, label: string, email: string, fullname: string, startedAt: number }
export function savePendingProfile(p: PendingProfile) {
  try {
    localStorage.setItem("fg_pending_profile", JSON.stringify(p))
    localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, p.email)
    try { sessionStorage.setItem("fg_selar_checkout_started", String(p.startedAt)) } catch {}
    try { localStorage.setItem("fg_selar_checkout_started", String(p.startedAt)) } catch {}
  } catch {}
}
export function getPendingProfile(): PendingProfile | null {
  try { const s = localStorage.getItem("fg_pending_profile"); if (!s) return null; return JSON.parse(s) as PendingProfile } catch { return null }
}
export function clearPendingProfile() { try { localStorage.removeItem("fg_pending_profile") } catch {} }

export function parseSelarRedirect(): { email: string, fullname: string } | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const email = (params.get("email") || "").trim()
    const fullname = (params.get("fullname") || params.get("full_name") || params.get("name") || "").trim()
    const selarFlag = params.get("selar") === "success" || params.get("selar_paid") === "1" || params.get("paid") === "true" || params.get("from") === "selar"
    if (!email || !email.includes("@")) return null
    const pending = getPendingProfile()
    const started = (() => { try { return Number(localStorage.getItem("fg_selar_checkout_started") || sessionStorage.getItem("fg_selar_checkout_started") || "0") } catch { return 0 } })()
    const fresh = started && (Date.now() - started < 60 * 60 * 1000)
    const emailMatchesPending = pending ? pending.email.toLowerCase() === email.toLowerCase() : false
    if (selarFlag && (fresh || emailMatchesPending || pending)) return { email, fullname: fullname || pending?.fullname || "Buyer" }
    if (!selarFlag && pending && fresh && emailMatchesPending) return { email, fullname: fullname || pending.fullname || "Buyer" }
    if (selarFlag && email) return { email, fullname: fullname || "Buyer" }
    return null
  } catch { return null }
}
export function consumeSelarRedirectParams() {
  try {
    const url = new URL(window.location.href)
    if (url.search.includes("selar=") || url.search.includes("email=") || url.search.includes("fullname=")) {
      url.searchParams.delete("selar"); url.searchParams.delete("selar_paid"); url.searchParams.delete("paid")
      window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : ""))
    }
  } catch {}
}
export function unlockFromSelarRedirect(): boolean {
  try { const info = parseSelarRedirect(); if (info) { localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, info.email); return true } } catch {}
  return false
}
export function getPaymentInfo() { try { return { unlocked: isUnlocked(), ref: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_REF) || "", email: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL) || "", date: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_DATE) || "", myCode: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_MY_CODE) || "" } } catch { return { unlocked: false, ref: "", email: "", date: "", myCode: "" } } }
export type PendingRequest = { ref: string, email: string, fingerprint: string, label: string, game: string, date: string }
export function savePendingRequest(req: PendingRequest): void { try { const list: PendingRequest[] = JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING) || "[]"); list.push(req); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING, JSON.stringify(list)); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_REF, req.ref); if (req.email) localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, req.email) } catch {} }
export function getPendingRequests(): PendingRequest[] { try { return JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING) || "[]") } catch { return [] } }
export async function verifyRefForProfile(ref: string, fingerprint: string): Promise<'ok'|'ok_same_profile'|'used_for_other'|'used'|'invalid'|'offline'> {
  const clean = ref.trim().toUpperCase()
  try { const map: Record<string,string> = JSON.parse(localStorage.getItem("fg_ref_to_fp") || "{}"); if (map[clean] && map[clean] !== fingerprint) return 'used_for_other'; if (map[clean] && map[clean] === fingerprint) return 'ok_same_profile' } catch {}
  if (clean.startsWith("SELAR-REDIRECT-")) return 'ok'
  try { const { isKnownPaidRef } = await import('./paidRefs'); if (isKnownPaidRef(clean)) { try { const res = await fetch('/.netlify/functions/verify-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: clean, fingerprint }) }); if (res.ok) { const data = await res.json(); if (['ok','ok_same_profile','used_for_other','used','invalid'].includes(data.status)) return data.status } } catch {}; return 'ok' } } catch {}
  try { const res = await fetch('/.netlify/functions/verify-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: clean, fingerprint }) }); if (!res.ok) return 'offline'; const data = await res.json(); if (['ok','ok_same_profile','used_for_other','used','invalid'].includes(data.status)) return data.status; return 'offline' } catch { return 'offline' }
}
export async function verifyCodeForProfile(code: string, fingerprint: string): Promise<'ok'|'ok_same_profile'|'used_for_other'|'used'|'invalid'|'offline'> { return verifyRefForProfile(code, fingerprint) }
export function bindRefToFingerprint(ref: string, fingerprint: string) { try { const m: Record<string,string> = JSON.parse(localStorage.getItem("fg_ref_to_fp") || "{}"); m[ref.trim().toUpperCase()] = fingerprint; localStorage.setItem("fg_ref_to_fp", JSON.stringify(m)) } catch {} }
export function makeRedirectAutoCode(email: string, fingerprint: string): string {
  let h = 0; const s = email.toLowerCase().trim() + "|" + fingerprint
  for (let i=0;i<s.length;i++) { h = (Math.imul(h ^ s.charCodeAt(i), 2654435761) >>> 0) }
  return "SELAR-REDIRECT-" + h.toString(36).toUpperCase().padStart(8,"0").slice(0,8)
}
