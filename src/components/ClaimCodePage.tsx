import { useState, useEffect } from 'react'
import { Copy, Check, ShieldCheck, Lock, ArrowLeft, KeyRound, ExternalLink, AlertTriangle } from 'lucide-react'

export default function ClaimCodePage() {
  const [ref, setRef] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)

  useEffect(() => {
    // Selar can pass ref in URL: /claim?ref=SELAR-XXX or /?payment=success&ref=SELAR-XXX
    const params = new URLSearchParams(window.location.search)
    const r = params.get('ref') || params.get('reference') || params.get('tx_ref') || ''
    if (r) setRef(r)
    const e = params.get('email') || ''
    if (e) setEmail(e)
    // If buyer already claimed code on this phone, show it again
    const saved = localStorage.getItem('fg_claimed_code')
    const savedRef = localStorage.getItem('fg_claimed_ref')
    if (saved && savedRef && savedRef === r) setCode(saved)
  }, [])

  const handleClaim = async () => {
    setError('')
    const cleanRef = ref.trim()
    if (cleanRef.length < 10) { setError('Enter your real Selar reference from your receipt. It is at least 10 characters. Fake refs like "abcd1234" will not work.'); return }
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/claim-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: cleanRef, email: email.trim() }) })
      const data = await res.json()
      if (data.status === 'ok' && data.code) {
        setCode(data.code)
        setAlreadyClaimed(!!data.alreadyClaimed)
        localStorage.setItem('fg_claimed_code', data.code)
        localStorage.setItem('fg_claimed_ref', cleanRef)
        localStorage.setItem('fg_claimed_email', email.trim())
      } else {
        setError(data.message || 'Invalid reference. Use the reference from your real Selar receipt.')
      }
    } catch {
      setError('Could not reach server. Check internet and try again. If you already claimed, check your WhatsApp / email for code.')
    }
    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500) })
  }

  const goToMain = () => { window.location.href = '/?openLab=true' }

  return (
    <div className="min-h-screen bg-[#050607] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[560px] rounded-[28px] bg-[#0A0D0F] border border-white/10 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center"><Check className="w-6 h-6 text-black" /></div>
          <div><div className="font-display font-bold text-[20px] leading-tight">Payment Successful! 🎉</div><div className="font-mono text-[10px] opacity-50 tracking-[0.18em]">STEP 2 OF 3 — GET YOUR UNLOCK CODE</div></div>
        </div>
        <p className="mt-4 font-mono text-[12px] leading-relaxed opacity-70">You paid on Selar. Now get your <b className="text-white">unique one-time code</b>. Tap to copy it, then go back to main site and paste it.</p>

        <div className="mt-5 space-y-3">
          <div><div className="font-mono text-[10px] opacity-60 mb-2">Your Selar Reference (from your receipt)</div><input value={ref} onChange={e=>setRef(e.target.value)} placeholder="e.g. SELAR-... or TXN-... (copy from receipt)" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[13px] placeholder:opacity-40" /></div>
          <div><div className="font-mono text-[10px] opacity-60 mb-2">Email used for payment (optional)</div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 font-mono text-[13px] placeholder:opacity-40" /></div>
          <button onClick={handleClaim} disabled={loading} className="w-full py-4 rounded-full bg-[#FF6B00] hover:bg-[#FF8A2A] text-white font-bold text-[13px] tracking-[0.12em] disabled:opacity-50">{loading ? "GENERATING YOUR UNIQUE CODE..." : code ? "GET CODE AGAIN (SAME CODE)" : "GET MY UNLOCK CODE"}</button>
        </div>

        {error && <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 font-mono text-[11px] text-red-300 flex gap-2"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}

        {code && (
          <div className="mt-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
            <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-300"><KeyRound className="w-3.5 h-3.5" /> YOUR UNIQUE ONE-TIME CODE {alreadyClaimed ? "• SAME CODE AS BEFORE" : "• NEW CODE"}</div>
            <div className="mt-3 flex items-center justify-between gap-3 bg-black/60 border border-white/10 rounded-xl px-4 py-4">
              <div className="font-mono font-bold text-[18px] tracking-[0.08em] break-all">{code}</div>
              <button onClick={handleCopy} className="shrink-0 px-4 py-2.5 rounded-full bg-white text-black font-bold text-[11px] flex items-center gap-1.5">{copied ? <><Check className="w-4 h-4" /> COPIED ✓</> : <><Copy className="w-4 h-4" /> COPY</>}</button>
            </div>
            <div className="mt-3 font-mono text-[11px] opacity-70 space-y-1">
              <div>✓ This code is unique — no other buyer gets this same code.</div>
              <div>✓ Works only once for one profile. If you use it, no one else can use it.</div>
              <div>✓ If you enter same Ref again, you get same code back (so you can recover it).</div>
              <div>✓ Do not share it — after you use it, it stops working.</div>
            </div>
            <button onClick={handleCopy} className="mt-4 w-full py-3.5 rounded-full bg-white text-black font-bold text-[12px] tracking-[0.12em] flex items-center justify-center gap-2">{copied ? "COPIED ✓ — NOW GO PASTE IT" : "TAP TO COPY CODE"} <Copy className="w-4 h-4" /></button>
            <button onClick={goToMain} className="mt-3 w-full py-3.5 rounded-full bg-cyan text-black font-bold text-[12px] tracking-[0.12em] flex items-center justify-center gap-2">GO BACK TO MAIN SITE & PASTE CODE <ExternalLink className="w-4 h-4" /></button>
            <div className="mt-3 text-center font-mono text-[10px] opacity-50">Step 3: On main site → Choose your phone/settings → Generate → Paste this code → Unlock</div>
          </div>
        )}

        {!code && (
          <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/10 p-4 font-mono text-[11px] opacity-70 space-y-2">
            <div className="font-bold text-white">How it works:</div>
            <div>1. You paid on Selar → Selar sent you here</div>
            <div>2. You enter Ref → We generate your unique code (1 Ref = 1 Code)</div>
            <div>3. You copy code → Go back to main site → Paste it to unlock your profile</div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-cyan" /> Used code cannot be used again. Different Ref = Different Code.</div>
          </div>
        )}

        <button onClick={()=>window.location.href='/'} className="mt-6 w-full py-3 rounded-full glass font-mono text-[11px] flex items-center justify-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to Main Site (without code)</button>
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[10px] opacity-40"><Lock className="w-3 h-3" /> FG AIM LAB • Secure Claim • 1 Ref = 1 Code</div>
      </div>
    </div>
  )
}
