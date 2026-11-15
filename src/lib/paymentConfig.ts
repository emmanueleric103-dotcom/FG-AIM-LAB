
export const PAYMENT_CONFIG = {
  SELAR_CHECKOUT_URL: "https://selar.com/46o4125613",
  PLACEHOLDER_URL: "https://selar.com/fgaimlab-pro",
  SELLER_WHATSAPP: "2348100145906",
  PRODUCT_NAME: "FG AIM LAB Pro — 1 Profile Unlock",
  PRICE_NAIRA: 620, PRICE_DISPLAY: "₦620", CURRENCY: "NGN",
  WHAT_YOU_GET: ["1 Reference = 1 Profile", "Same Reference for same profile = FREE", "New phone/settings = New ₦500"],
  STORAGE_KEY_UNLOCKED: "fg_payment_unlocked", STORAGE_KEY_REF: "fg_payment_ref", STORAGE_KEY_EMAIL: "fg_payment_email", STORAGE_KEY_DATE: "fg_payment_date", STORAGE_KEY_USED_CODES: "fg_used_codes", STORAGE_KEY_MY_CODE: "fg_my_code", STORAGE_KEY_PENDING: "fg_pending_requests",
}
export function isPlaceholderLink(): boolean { return PAYMENT_CONFIG.SELAR_CHECKOUT_URL === PAYMENT_CONFIG.PLACEHOLDER_URL || PAYMENT_CONFIG.SELAR_CHECKOUT_URL.includes("fgaimlab-pro") }
export function isUnlocked(): boolean { try { return localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_UNLOCKED) === "true" } catch { return false } }
export function getUsedCodes(): string[] { try { return JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_USED_CODES) || "[]") } catch { return [] } }
export function isCodeUsedLocally(code: string): boolean { return getUsedCodes().includes(code.trim().toUpperCase()) }
export function markCodeUsedLocally(code: string) { const clean = code.trim().toUpperCase(); const used = getUsedCodes(); if (!used.includes(clean)) { used.push(clean); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_USED_CODES, JSON.stringify(used)) } localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_MY_CODE, clean) }
export function unlockFromSelarRedirect(): boolean {
  try {
    const params = new URLSearchParams(window.location.search)
    const isSuccess = params.get("payment") === "success" || params.get("selar") === "success" || params.get("paid") === "true"
    if (isSuccess) {
      const ref = params.get("ref") || params.get("reference") || params.get("tx_ref") || ""
      if (ref) localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_REF, ref)
      window.history.replaceState({}, "", window.location.pathname)
      return false
    }
  } catch {}
  return false
}
export function getPaymentInfo() { try { return { unlocked: isUnlocked(), ref: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_REF) || "", email: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL) || "", date: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_DATE) || "", myCode: localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_MY_CODE) || "" } } catch { return { unlocked: false, ref: "", email: "", date: "", myCode: "" } } }
export type PendingRequest = { ref: string, email: string, fingerprint: string, label: string, game: string, date: string }
export function savePendingRequest(req: PendingRequest): void { try { const list: PendingRequest[] = JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING) || "[]"); list.push(req); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING, JSON.stringify(list)); localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_REF, req.ref); if (req.email) localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, req.email) } catch {} }
export function getPendingRequests(): PendingRequest[] { try { return JSON.parse(localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_PENDING) || "[]") } catch { return [] } }
export async function verifyRefForProfile(ref: string, fingerprint: string): Promise<'ok'|'ok_same_profile'|'used_for_other'|'used'|'invalid'|'offline'> {
  const clean = ref.trim().toUpperCase()
  try {
    const map: Record<string,string> = JSON.parse(localStorage.getItem("fg_ref_to_fp") || "{}")
    if (map[clean] && map[clean] !== fingerprint) return 'used_for_other'
    if (map[clean] && map[clean] === fingerprint) return 'ok_same_profile'
  } catch {}
  try {
    const { isKnownPaidRef } = await import('./paidRefs')
    if (isKnownPaidRef(clean)) {
      try {
        const res = await fetch('/.netlify/functions/verify-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: clean, fingerprint }) })
        if (res.ok) { const data = await res.json(); if (['ok','ok_same_profile','used_for_other','used','invalid'].includes(data.status)) return data.status }
      } catch {}
      return 'ok'
    }
  } catch {}
  try {
    const res = await fetch('/.netlify/functions/verify-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: clean, fingerprint }) })
    if (!res.ok) return 'offline'
    const data = await res.json()
    if (['ok','ok_same_profile','used_for_other','used','invalid'].includes(data.status)) return data.status
    return 'offline'
  } catch { return 'offline' }
}
export async function verifyCodeForProfile(code: string, fingerprint: string): Promise<'ok'|'ok_same_profile'|'used_for_other'|'used'|'invalid'|'offline'> { return verifyRefForProfile(code, fingerprint) }
export function bindRefToFingerprint(ref: string, fingerprint: string) { try { const m: Record<string,string> = JSON.parse(localStorage.getItem("fg_ref_to_fp") || "{}"); m[ref.trim().toUpperCase()] = fingerprint; localStorage.setItem("fg_ref_to_fp", JSON.stringify(m)) } catch {} }

// ===== ADDED FIX: functions Homepage + LabPage import but were missing — caused build failed =====
export type PendingProfile = { game?: 'ff'|'cod', inputs?: any, fingerprint: string, label: string, email?: string, fullname?: string, startedAt?: number }

export function savePendingProfile(p: PendingProfile){
  try{
    localStorage.setItem('fg_pending_profile', JSON.stringify(p))
    sessionStorage.setItem('fg_pending_profile', JSON.stringify(p))
    if (p.email) localStorage.setItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL, p.email)
  }catch{}
}
export function getPendingProfile(): PendingProfile | null {
  try{
    const raw = sessionStorage.getItem('fg_pending_profile') || localStorage.getItem('fg_pending_profile')
    if (!raw) return null
    return JSON.parse(raw) as PendingProfile
  }catch{ return null }
}
export function clearPendingProfile(){
  try{ localStorage.removeItem('fg_pending_profile'); sessionStorage.removeItem('fg_pending_profile') }catch{}
}
export function parseSelarRedirect(): { email: string, fullname: string } | null {
  try{
    const params = new URLSearchParams(window.location.search)
    const isSuccess = params.get('selar') === 'success' || params.get('payment') === 'success' || params.get('paid') === 'true'
    if (!isSuccess) return null
    const email = params.get('email') || params.get('buyer_email') || params.get('customer_email') || localStorage.getItem(PAYMENT_CONFIG.STORAGE_KEY_EMAIL) || ''
    const fullname = params.get('fullname') || params.get('name') || params.get('buyer_name') || params.get('customer_name') || 'Buyer'
    return { email, fullname }
  }catch{ return null }
}
export function consumeSelarRedirectParams(){
  try{
    const url = new URL(window.location.href)
    url.searchParams.delete('selar')
    url.searchParams.delete('payment')
    url.searchParams.delete('paid')
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
  }catch{}
}
export function makeRedirectAutoCode(email: string, fingerprint: string): string {
  // Deterministic code from email + fingerprint so same profile reloads free via vault
  const base = (email + '|' + fingerprint).toUpperCase().replace(/[^A-Z0-9]/g,'')
  let hash = 0
  for (let i=0;i<base.length;i++){ hash = ((hash<<5)-hash + base.charCodeAt(i)) | 0 }
  const code = Math.abs(hash).toString(36).toUpperCase().padStart(6,'0').slice(-6)
  return 'FG-' + code
}
export function buildSelarCheckoutUrl(email: string, fullname: string): string {
  const base = PAYMENT_CONFIG.SELAR_CHECKOUT_URL
  const sep = base.includes('?') ? '&' : '?'
  const redirect = 'https://hefgesensitivity.hefge.cloud/lab?selar=success'
  return base + sep + 'email=' + encodeURIComponent(email) + '&fullname=' + encodeURIComponent(fullname) + '&redirect_url=' + encodeURIComponent(redirect)
}

