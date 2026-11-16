import pathlib, re
p = pathlib.Path("src/components/LabPage.tsx")
t = p.read_text()
# 1. Remove broken banner that was stuck inside canvas line 118
t2 = re.sub(r"\s*\{\(ffResult \|\| codResult\) && \(.*?CODM Locked - TOP.*?\)\}\s*\n", "", t, flags=re.DOTALL)
print("removed broken banner:", "YES" if t2 != t else "NOT FOUND")
t = t2
# 2. Restore canvas title (was changed to BUILD...)
t = t.replace("FG AIM LAB • BUILD 8f0581d-LOCK", "FG AIM LAB")
# 3. Safety: delete any leftover line with TOP banner
if "CODM Locked - TOP" in t:
    t = "\n".join([l for l in t.splitlines() if "CODM Locked - TOP" not in l])
    print("cleaned leftover TOP line")
# 4. Insert CORRECT banner BEFORE the FF wrapper that holds ROOM vs RANK (not inside canvas, not inside FF block)
idx = t.find("ROOM vs RANK")
wrapper = t.rfind("{active==='ff'", 0, idx) if idx != -1 else -1
if wrapper != -1 and "BUILD 8f0581d-LOCK" not in t:
    banner = """{/* BUILD 8f0581d-LOCK */}
<div className="mb-2 text-center text-[11px] font-mono text-cyan-300">BUILD 8f0581d-LOCK</div>
{(ffResult || codResult) && (<div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500 text-center font-mono text-[12px]">{ffResult ? 'CODM Locked: This payment was used for Free Fire. Buy a new profile for CODM.' : 'Free Fire Locked: This payment was used for CODM. Buy a new profile for Free Fire.'}</div>)}
"""
    t = t[:wrapper] + banner + t[wrapper:]
    print("added CORRECT banner before FF wrapper")
else:
    print("wrapper not found or banner already there, idx:", idx, "wrapper:", wrapper)
p.write_text(t)
print("DONE")
