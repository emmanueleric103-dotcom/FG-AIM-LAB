import { useState } from 'react'
export default function SellerPage() {
  const [sellerKey, setSellerKey] = useState('')
  const [ref, setRef] = useState('')
  const [msg, setMsg] = useState('')
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const loadPending = async () => {
    setLoading(true); setMsg('')
    try {
      const r = await fetch('/.netlify/functions/list-pending', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sellerKey }) })
      const d = await r.json()
      if (d.status === 'ok') setPending(d.pending || [])
      else setMsg(d.message || 'Wrong seller key')
    } catch { setMsg('Could not load pending') }
    setLoading(false)
  }
  const approve = async (r: string) => {
    try {
      const res = await fetch('/.netlify/functions/approve-ref', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: r, sellerKey }) })
      const d = await res.json()
      setMsg(d.message || d.status)
      if (d.status === 'ok') { setPending(pending.filter(p=>p.ref !== r.toUpperCase())); setRef('') }
    } catch { setMsg('Failed') }
  }
  return (
    <div className="min-h-screen bg-[#050607] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[600px] rounded-[28px] bg-[#0A0D0F] border border-white/10 p-6">
        <div className="font-display font-bold text-[20px]">SELLER — Verify Payment</div>
        <div className="font-mono text-[11px] opacity-60 mt-1">Only YOU open this page. Check Selar Dashboard first, then approve.</div>
        <div className="mt-5 space-y-3">
          <input value={sellerKey} onChange={e=>setSellerKey(e.target.value)} placeholder="Seller Key (default FG-SELLER-2026 — change in Netlify)" type="password" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-[13px]" />
          <button onClick={loadPending} className="w-full py-3 rounded-full bg-white text-black font-bold text-[12px]">{loading ? "LOADING..." : "SHOW PENDING REFS FROM BUYERS"}</button>
          <div className="font-mono text-[10px] opacity-60">Pending = Buyers who entered a Ref on Claim Page but you have not approved yet.</div>
          {pending.length > 0 && <div className="space-y-2">{pending.map((p:any)=>(
            <div key={p.ref} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 flex items-center justify-between gap-2">
              <div><div className="font-mono font-bold text-[12px]">{p.ref}</div><div className="font-mono text-[10px] opacity-50">{p.email} • {new Date(p.at).toLocaleString()}</div></div>
              <button onClick={()=>approve(p.ref)} className="px-4 py-2 rounded-full bg-emerald-400 text-black font-bold text-[11px]">APPROVE ✓</button>
            </div>
          ))}</div>}
          <div className="h-px bg-white/10 my-2" />
          <div className="font-mono text-[11px] font-bold">Or approve manually (copy Ref from Selar Dashboard):</div>
          <input value={ref} onChange={e=>setRef(e.target.value)} placeholder="Paste Ref from Selar Dashboard, e.g. SELAR-..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 font-mono text-[13px]" />
          <button onClick={()=>approve(ref)} className="w-full py-3.5 rounded-full bg-[#FF6B00] text-white font-bold text-[12px]">MARK AS PAID → BUYER CAN CLAIM CODE</button>
          {msg && <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 font-mono text-[11px] text-emerald-200">{msg}</div>}
          <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 font-mono text-[11px] opacity-70 space-y-1">
            <div>HOW TO USE:</div>
            <div>1. Buyer pays on Selar, enters Ref on Claim Page → You see it in Pending.</div>
            <div>2. Open Selar Dashboard → Transactions → Search that Ref.</div>
            <div>3. If you see ₦500 PAID → Tap APPROVE here.</div>
            <div>4. Buyer tries Claim Page again → Gets code. Changing 1 letter = Ref NOT approved = NO code.</div>
            <div>5. If Ref NOT in Selar → Do NOT approve. Buyer stays blocked.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
