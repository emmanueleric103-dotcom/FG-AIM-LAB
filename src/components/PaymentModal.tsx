
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Check, ExternalLink, ShieldCheck, Receipt, AlertTriangle, MessageCircle } from 'lucide-react'
import { PAYMENT_CONFIG, isPlaceholderLink, verifyRefForProfile, bindRefToFingerprint } from '../lib/paymentConfig'
import { bindCodeToFingerprint, unlockProfile } from '../lib/profileLock'

export default function PaymentModal({ open, onClose, onUnlocked, game, currentInputs, fingerprint, label }: { open: boolean, onClose: () => void, onUnlocked: () => void, game: 'ff' | 'cod', currentInputs: any, fingerprint: string, label: string }) {
  const [ref, setRef] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(false)
  const [sellerKey, setSellerKey] = useState('')
  const [showSeller, setShowSeller] = useState(false)
  const [approving, setApproving] = useState(false)
  if (!open) return null

  const handlePay = () => {
    if (isPlaceholderLink()) { setError('Seller has not set the real Selar link yet.'); return }
    window.open(PAYMENT_CONFIG.SELAR_CHECKOUT_URL, '_blank', 'noopener,noreferrer')
  }

  const handleUnlockWithRef = async () => {
    setError('')
    const cleanRef = ref.trim().toUpperCase()
    if (cleanRef.length < 10) { setError('Enter your Selar Reference from your receipt. At least 10 characters, e.g. SS15YT2P60WUMW0AG.'); return }
    if (cleanRef.startsWith('FG-')) { setError('FG- codes are old. Use your Selar Reference directly - looks like SS15YT2P60WUMW0AG.'); return }
    setChecking(true)
    const result = await verifyRefForProfile(cleanRef, fingerprint)
    if (result === 'ok' || result === 'ok_same_profile') {
      bindRefToFingerprint(cleanRef, fingerprint)
      bindCodeToFingerprint(cleanRef, fingerprint)
      unlockProfile({ fingerprint, game, label, code: cleanRef, ref: cleanRef, date: new Date().toISOString(), inputs: currentInputs })
      setSuccess(true)
      setTimeout(() => { onUnlocked(); setSuccess(false); setRef('') }, 900)
    } else if (result === 'used_for_other') { setError('This Reference was already used for a different phone/settings. 1 Reference = 1 Profile. Buy a new profile for this new phone/settings.') }
    else if (result === 'used') { setError('This Reference has already been used.') }
    else if (result === 'invalid') { setError('Invalid Reference. This Reference is NOT in Sales yet. If you just bought it, the seller has not added it yet. If YOU are the seller, tap SELLER APPROVE below.') }
    else { setError('Could not reach server. Check internet and try again.') }
    setChecking(false)
  }

  const handleSellerApprove = async () => {
    const cleanRef = ref.trim().toUpperCase()
    if (!sellerKey.trim()) { setError('Enter your Seller Key. Default is FG-SELLER-2026 unless you changed SELLER_KEY in Netlify.'); return }
    setApproving(true)
    try {
      const res = await fetch('/.netlify/functions/approve-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: cleanRef, sellerKey: sellerKey.trim() }) })
      const data = await res.json()
      if (data.status === 'ok') {
        setError('')
        // Now retry unlock automatically
        const result = await verifyRefForProfile(cleanRef, fingerprint)
        if (result === 'ok' || result === 'ok_same_profile') {
          bindRefToFingerprint(cleanRef, fingerprint)
          bindCodeToFingerprint(cleanRef, fingerprint)
          unlockProfile({ fingerprint, game, label, code: cleanRef, ref: cleanRef, date: new Date().toISOString(), inputs: currentInputs })
          setSuccess(true)
          setTimeout(() => { onUnlocked(); setSuccess(false); setRef(''); setShowSeller(false) }, 900)
        } else { setError('Approved, but unlock still says: ' + result + '. Try UNLOCK again.') }
      } else { setError(data.message || 'Could not approve.') }
    } catch { setError('Could not reach server.') }
    setApproving(false)
  }

  const handleWhatsApp = () => {
    const msg = `Hello FG AIM LAB, I paid ₦620 but my Reference says Invalid. My Selar Ref: ${ref.trim()}. My Profile: ${label}. Profile ID: ${fingerprint}. Please check Selar Sales.`
    if (PAYMENT_CONFIG.SELLER_WHATSAPP && PAYMENT_CONFIG.SELLER_WHATSAPP !== "2340000000000") window.open(`https://wa.me/${PAYMENT_CONFIG.SELLER_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')
    else setError('Seller WhatsApp not set yet.')
  }

  const gameName = game === 'ff' ? 'FREE FIRE' : 'CALL OF DUTY MOBILE'
  const isPlaceholder = isPlaceholderLink()
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[28px] bg-[#0A0D0F] border border-white/10 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] opacity-50">FG AIM LAB • {gameName}</div>
              <div className="mt-1 font-display font-bold text-[22px] leading-tight">Unlock This Profile</div>
              <div className="mt-1 font-mono text-[11px] opacity-60">1 Reference = 1 Profile • ₦620</div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
          <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/10 p-4">
            <div className="font-mono text-[10px] opacity-60">PAY FOR THIS PROFILE ONLY</div>
            <div className="mt-1 flex items-baseline gap-2"><span className="font-display font-bold text-[32px]">₦620</span><span className="font-mono text-[12px] opacity-60">NGN • 1 Profile • Not unlimited</span></div>
          </div>
          {isPlaceholder && <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 font-mono text-[11px] text-amber-300 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />Seller: Real Selar link not set yet.</div>}
          <button onClick={handlePay} disabled={isPlaceholder} className="mt-4 w-full py-4 rounded-full bg-[#FF6B00] hover:bg-[#FF8A2A] disabled:opacity-50 text-white font-bold text-[13px] tracking-[0.12em] flex items-center justify-center gap-2">PAY WITH SELAR — ₦620 <ExternalLink className="w-4 h-4" /></button>
          <div className="mt-2 text-center font-mono text-[10px] opacity-50">After paying, Selar gives you a Reference. Copy it and paste below.</div>
          <div className="my-5 flex items-center gap-3"><div className="flex-1 h-px bg-white/10" /><span className="font-mono text-[10px] tracking-[0.2em] opacity-60">ALREADY PAID?</span><div className="flex-1 h-px bg-white/10" /></div>
          <div className="font-mono text-[11px] font-bold flex items-center gap-2"><Receipt className="w-4 h-4 text-cyan" /> YOUR SELAR REFERENCE = YOUR CODE</div>
          <p className="mt-1 font-mono text-[11px] opacity-60 leading-relaxed">Paste your Selar Reference here. If it is in Sales, it unlocks. If not, it says Invalid.</p>
          <input value={ref} onChange={e=>setRef(e.target.value.toUpperCase())} placeholder="e.g. SS15YT2P60WUMW0AG" className="mt-3 w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 font-mono text-[15px] tracking-[0.08em] placeholder:opacity-40 placeholder:text-[12px] placeholder:tracking-normal" />
          <div className="mt-2 font-mono text-[10px] opacity-50">Find it on: Selar receipt • Selar email • Selar → Sales → Reference column</div>
          <button onClick={handleUnlockWithRef} disabled={checking} className="mt-3 w-full py-4 rounded-full bg-white text-black font-bold text-[13px] tracking-[0.12em] flex items-center justify-center gap-2 disabled:opacity-50">{checking ? 'CHECKING SALES...' : success ? 'UNLOCKED ✓' : 'UNLOCK WITH REFERENCE'} <Lock className="w-4 h-4" /></button>
          {error && <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 p-3 font-mono text-[11px] text-red-300 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
          {error && error.includes('NOT in Sales') && (
            <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
              <div className="font-mono text-[11px] font-bold text-amber-300">YOU ARE THE SELLER? APPROVE IT HERE</div>
              <div className="mt-1 font-mono text-[11px] opacity-80">New References are NOT auto-added. Selar does not tell your site about new sales. You must add it once. Tap below, enter your Seller Key, it will unlock instantly.</div>
              {!showSeller ? <button onClick={()=>setShowSeller(true)} className="mt-3 w-full py-3 rounded-full bg-amber-400 text-black font-bold text-[12px]">SELLER: APPROVE THIS REFERENCE →</button> : (
                <div className="mt-3 space-y-2">
                  <input value={sellerKey} onChange={e=>setSellerKey(e.target.value)} placeholder="Seller Key (default FG-SELLER-2026)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-[13px]" />
                  <button onClick={handleSellerApprove} disabled={approving} className="w-full py-3 rounded-full bg-amber-400 text-black font-bold text-[12px]">{approving ? 'APPROVING...' : 'APPROVE & UNLOCK NOW'}</button>
                  <div className="font-mono text-[10px] opacity-60 text-center">Or go to /seller → Paste Reference → Approve</div>
                </div>
              )}
            </div>
          )}
          {success && <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 font-mono text-[11px] text-emerald-300 flex gap-2"><Check className="w-4 h-4" />Reference valid! Profile unlocked.</div>}
          <div className="mt-4 rounded-xl bg-white/[0.04] border border-white/10 p-4 font-mono text-[11px] opacity-70 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan" /> How it works:</div>
            <div>1. You pay ₦620 on Selar → Selar gives you a Reference</div>
            <div>2. You paste that Reference here</div>
            <div>3. Site checks ITS Sales list → If Reference is there → Unlock. If not → Invalid.</div>
            <div>4. Same Reference for same profile = FREE next time (Vault).</div>
          </div>
          <button onClick={handleWhatsApp} className="mt-4 w-full py-3 rounded-full glass font-mono text-[11px] flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" /> My Reference says Invalid but I paid — Contact Seller</button>
          <div className="mt-3 text-center font-mono text-[10px] opacity-40">FG AIM LAB • 1 Reference = 1 Profile • Secure</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
