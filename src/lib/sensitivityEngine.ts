export type Inputs = {
  phoneBrand?: string; phoneModel?: string; ram?: string;
  refreshRate?: string; dpi?: string; fingerLayout?: string;
  playStyle?: string; weapon?: string; problem?: string;
  mode?: 'room' | 'rank';
};
export function calculateSensitivity(inp: Inputs, _opts: any) {
  const isRoom = inp.mode === 'room';
  // Verified base: Rank = balanced, Room = faster for Custom Room flicks
  let r: any = isRoom
    ? { General: 95, RedDot: 88, '2x': 82, '4x': 78, Sniper: 65, FreeLook: 73 }
    : { General: 87, RedDot: 80, '2x': 75, '4x': 70, Sniper: 60, FreeLook: 68 };
  let exp: string[] = [isRoom ? 'Room Mode -> +8 General, faster for Custom Room' : 'Rank Mode -> balanced control for Ranked'];
  const dpi = parseInt(String(inp.dpi || '420').replace(/[^0-9]/g, '')) || 420;
  if (dpi <= 350) { r.General += 8; r.RedDot += 5; r['2x'] += 4; exp.push(`Low DPI (${dpi}) -> +8 General, low DPI needs higher sensitivity to move fast`); }
  else if (dpi <= 420) { r.General += 3; exp.push(`Mid DPI (${dpi}) -> +3 General`); }
  else if (dpi > 500) { r.General -= 5; r.RedDot -= 3; exp.push(`High DPI (${dpi}) -> -5 General, high DPI already fast, lower to avoid overshoot`); }
  const fingers = String(inp.fingerLayout || '2');
  if (fingers.includes('2')) { r.General += 6; r.RedDot += 4; exp.push('2-finger -> +6 General, thumb does all movement'); }
  else if (fingers.includes('3')) { r.General += 2; exp.push('3-finger -> +2 General'); }
  else if (fingers.includes('4')) { r.General -= 2; exp.push('4-finger claw -> -2 General, more control fingers'); }
  const refresh = String(inp.refreshRate || '');
  if (refresh.includes('60')) { r.General += 4; exp.push('60Hz -> +4 General, lower refresh needs higher to compensate'); }
  else if (refresh.includes('90')) { r.General += 2; exp.push('90Hz -> +2 General'); }
  const ram = String(inp.ram || '');
  if (ram.includes('4')) { r.General -= 3; exp.push('4GB RAM -> -3 General, lower for stability on low RAM'); }
  const style = String(inp.playStyle || 'Balanced');
  if (style.includes('Aggressive') || style.includes('Rush')) { r.General += 5; r.RedDot += 3; r.Sniper -= 3; exp.push('Aggressive -> +5 General for fast flicks'); }
  if (style.includes('Sniper')) { r.Sniper -= 2; exp.push('Sniper playstyle -> -2 Sniper for steady aim'); }
  const weapon = String(inp.weapon || 'AR');
  if (weapon.includes('SMG')) { r.General += 4; exp.push('SMG -> +4 General for close range'); }
  if (weapon.includes('Sniper')) { r.Sniper -= 5; exp.push('Sniper weapon -> -5 Sniper for steady scope'); }
  const prob = String(inp.problem || '');
  if (prob.includes('Dragging')) { r.General += 10; r.RedDot += 6; exp.push('Dragging -> +10 General, helps drag to head'); }
  if (prob.includes('Overshooting')) { r.General -= 8; exp.push('Overshooting -> -8 General, you were moving too fast'); }
  if (prob.includes('Undershooting')) { r.General += 8; exp.push('Undershooting -> +8 General, you were moving too slow'); }
  if (prob.includes('Unstable')) { r.FreeLook -= 5; r.Sniper -= 4; exp.push('Unstable -> -5 FreeLook, steadies camera'); }
  if (prob.includes('Headshots')) { r.RedDot += 6; r['2x'] += 4; exp.push('Headshots -> +6 RedDot, helps head tracking'); }
  // Clamp 0-200, round
  for (const k of Object.keys(r)) { r[k] = Math.max(0, Math.min(200, Math.round(r[k]))); }
  return { result: r, explanation: exp };
}
