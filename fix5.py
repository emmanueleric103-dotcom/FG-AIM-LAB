import pathlib, re
p = pathlib.Path("src/components/LabPage.tsx")
t = p.read_text()
# 1. Remove old misplaced banners (inside FF block)
t = re.sub(r"\{ffResult && active==='cod' && \(.*?CODM Locked.*?\)\}\s*", "", t, flags=re.DOTALL)
t = re.sub(r"\{codResult && active==='ff' && \(.*?Free Fire Locked.*?\)\}\s*", "", t, flags=re.DOTALL)
print("removed old hidden banners")
# 2. Add version marker at top - so you can SEE new build instantly, no Generate needed
if "BUILD 8f0581d" not in t:
    # Insert after header title FG AIM LAB
    if "FG AIM LAB" in t:
        t = t.replace("FG AIM LAB", "FG AIM LAB • BUILD 8f0581d-LOCK", 1)
        print("added version marker")
# 3. Add correct lock banners at TOP LEVEL, before the tab buttons
# Find tab area: first occurrence of FREE FIRE tab button
m = re.search(r"FREE FIRE", t)
if m and "CODM Locked - TOP" not in t:
    banner = """  {(ffResult || codResult) && (<div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500 text-center font-mono text-[12px]">{ffResult ? 'CODM Locked - TOP: This payment was used for Free Fire. Buy a new profile for CODM.' : 'Free Fire Locked - TOP: This payment was used for CODM. Buy a new profile for Free Fire.'}</div>)}
"""
    t = t[:m.start()] + banner + t[m.start():]
    print("added TOP lock banner")
else:
    print("top banner already there or FREE FIRE not found")
p.write_text(t)
print("DONE")
