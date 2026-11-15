
// ============================================
// FG AIM LAB - ADVANCED: PAY PER PROFILE LOCK
// ============================================
// NEW MODEL (not unlimited):
// N500 = 1 PROFILE = 1 exact Phone + Settings combination
//
// What is a PROFILE?
//  Game + Phone Brand + Model + RAM + Refresh + DPI + Fingers + PlayStyle + Weapon + Problem (+ Fire Size / Gyro / ADS for COD)
//  Example: FF | Infinix Note 40 | 8GB | 120Hz | DPI 420 | 4-Finger | Balanced | AR | Headshots
//
// Rules:
//  - Change PHONE (Brand/Model/RAM) -> NEW PROFILE -> Pay N500 again
//  - Change ANY SETTING (DPI, Fingers, PlayStyle, Weapon, Problem, Refresh) -> NEW PROFILE -> Pay N500 again
//  - Go BACK to a profile you already paid for -> FREE, no new payment (it's in your Vault)
//  - Each one-time code unlocks ONLY ONE profile. Reusing same code for different profile = "Already used for another profile"
//  - This stops N500 = unlimited. Buyer who has 3 phones pays 3x N500 = N1500. Fair.
//
// Fingerprint: Hash of exact inputs, e.g. FG-PRF-8K2M-9Q3Z
// Vault: localStorage saves all paid profiles forever on this phone.
// ============================================

export type ProfileEntry = {
  fingerprint: string
  game: 'ff' | 'cod'
  label: string
  code: string
  ref: string
  date: string
  inputs: any
}

const VAULT_KEY = "fg_profile_vault"
const LAST_KEY = "fg_last_profile_fp"

export function hashString(str: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const n = (h2 >>> 0).toString(36).toUpperCase().padStart(6, '0') + (h1 >>> 0).toString(36).toUpperCase().padStart(6, '0')
  return n.slice(0, 8)
}

export function getFingerprint(game: 'ff'|'cod', inputs: any): string {
  const key = JSON.stringify({ game, ...inputs })
  const h = hashString(key)
  return `FG-PRF-${h.slice(0,4)}-${h.slice(4,8)}`
}

export function getProfileLabel(game: 'ff'|'cod', inputs: any): string {
  if (game === 'ff') {
    return `${game === 'ff' ? 'FF' : 'COD'} • ${inputs.phoneBrand} ${inputs.phoneModel} • ${inputs.ram}GB • ${inputs.refreshRate}Hz • DPI ${inputs.dpi} • ${inputs.fingerLayout}F • ${inputs.playStyle} • ${inputs.weapon} • ${inputs.problem}`
  } else {
    return `CODM • ${inputs.phoneBrand} ${inputs.phoneModel} • ${inputs.ram}GB • ${inputs.refreshRate}Hz • DPI ${inputs.dpi} • ${inputs.fingerLayout}F • ${inputs.playStyle} • ${inputs.weapon} • Gyro ${inputs.gyro} • ${inputs.problem}`
  }
}

export function getShortLabel(game: 'ff'|'cod', inputs: any): string {
  return `${inputs.phoneBrand} ${inputs.phoneModel} • DPI ${inputs.dpi} • ${inputs.fingerLayout}F • ${inputs.playStyle}`
}

export function getVault(): ProfileEntry[] {
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]") } catch { return [] }
}

export function isProfileUnlocked(fingerprint: string): boolean {
  return getVault().some(p => p.fingerprint === fingerprint)
}

export function getProfileEntry(fingerprint: string): ProfileEntry | null {
  return getVault().find(p => p.fingerprint === fingerprint) || null
}

export function unlockProfile(entry: ProfileEntry): void {
  const vault = getVault()
  if (!vault.some(p => p.fingerprint === entry.fingerprint)) {
    vault.push(entry)
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
  }
  localStorage.setItem(LAST_KEY, entry.fingerprint)
  // Also keep old global unlocked flag for backward compat, but per-profile is truth
  localStorage.setItem("fg_payment_unlocked", "true")
}

export function getCodeToFingerprintMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem("fg_code_to_fp") || "{}") } catch { return {} }
}

export function getFingerprintForCode(code: string): string | null {
  const m = getCodeToFingerprintMap()
  return m[code.trim().toUpperCase()] || null
}

export function bindCodeToFingerprint(code: string, fingerprint: string) {
  const m = getCodeToFingerprintMap()
  m[code.trim().toUpperCase()] = fingerprint
  localStorage.setItem("fg_code_to_fp", JSON.stringify(m))
  const used = JSON.parse(localStorage.getItem("fg_used_codes") || "[]")
  if (!used.includes(code.trim().toUpperCase())) { used.push(code.trim().toUpperCase()); localStorage.setItem("fg_used_codes", JSON.stringify(used)) }
}

// What changed between two inputs? For "Settings changed" UI
export function diffInputs(oldInputs: any, newInputs: any): string[] {
  const keys = ['phoneBrand','phoneModel','ram','refreshRate','dpi','fingerLayout','playStyle','weapon','problem','fireButtonSize','fps','adsMode','gyro']
  const diffs: string[] = []
  for (const k of keys) {
    if (oldInputs && newInputs && oldInputs[k] !== undefined && newInputs[k] !== undefined && String(oldInputs[k]) !== String(newInputs[k])) {
      diffs.push(`${k}: ${oldInputs[k]} → ${newInputs[k]}`)
    }
  }
  return diffs
}

export function isPhoneChanged(oldInputs: any, newInputs: any): boolean {
  if (!oldInputs || !newInputs) return false
  return oldInputs.phoneBrand !== newInputs.phoneBrand || oldInputs.phoneModel !== newInputs.phoneModel || oldInputs.ram !== newInputs.ram
}
