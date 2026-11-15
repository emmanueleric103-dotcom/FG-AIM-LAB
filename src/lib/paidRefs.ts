
export const KNOWN_PAID_REFS = ["SS15YT2P60WUMW0AG","S4571DJT89ELCFIA1","SKG52AHHW5CHVQFFY","SA0STOO5F602B"]
export function isRefFormatValid(ref: string): boolean {
  const c = ref.trim().toUpperCase()
  return c.length >= 10 && /[A-Z]/.test(c) && /[0-9]/.test(c) && !/\s/.test(c)
}
export function isKnownPaidRef(ref: string): boolean { return KNOWN_PAID_REFS.includes(ref.trim().toUpperCase()) }
