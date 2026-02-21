/**
 * Casio fx-82ES PLUS — with Matrix Panel
 * npm install mathjs
 */

import React, { useState, useEffect, useCallback } from 'react';
import * as math from 'mathjs';

/* ════════════════════════════════════════════════════════════
   MATH ENGINE
════════════════════════════════════════════════════════════ */
const buildScope = (angleMode) => {
  const toR = x => angleMode==='DEG' ? x*Math.PI/180 : angleMode==='GRAD' ? x*Math.PI/200 : x;
  const frR = x => angleMode==='DEG' ? x*180/Math.PI : angleMode==='GRAD' ? x*200/Math.PI : x;
  const fact = n => { n=Math.floor(n); if(n<0||n>170) throw new Error('Range'); let r=1; for(let i=2;i<=n;i++) r*=i; return r; };
  return {
    sin:x=>Math.sin(toR(x)),   cos:x=>Math.cos(toR(x)),   tan:x=>Math.tan(toR(x)),
    asin:x=>frR(Math.asin(x)), acos:x=>frR(Math.acos(x)), atan:x=>frR(Math.atan(x)),
    sinh:Math.sinh, cosh:Math.cosh, tanh:Math.tanh,
    asinh:Math.asinh, acosh:Math.acosh, atanh:Math.atanh,
    log:x=>Math.log10(x), ln:x=>Math.log(x), exp:Math.exp,
    sqrt:Math.sqrt, cbrt:Math.cbrt, abs:Math.abs,
    ceil:Math.ceil, floor:Math.floor, round:Math.round,
    fact, factorial:fact,
    nPr:(n,r)=>{ n=Math.floor(n);r=Math.floor(r); let res=1; for(let i=n;i>n-r;i--) res*=i; return res; },
    nCr:(n,r)=>{ n=Math.floor(n);r=Math.floor(r); if(r>n) throw 0; r=Math.min(r,n-r); let res=1; for(let i=0;i<r;i++) res=res*(n-i)/(i+1); return Math.round(res); },
    det:m=>math.det(m), inv:m=>math.inv(m), transpose:m=>math.transpose(m),
    Pol:(x,y)=>`r=${Math.sqrt(x*x+y*y).toFixed(6)},θ=${frR(Math.atan2(y,x)).toFixed(6)}`,
    Rec:(r,th)=>`x=${(r*Math.cos(toR(th))).toFixed(6)},y=${(r*Math.sin(toR(th))).toFixed(6)}`,
    pi:Math.PI, e:Math.E,
    gcd:(a,b)=>{ a=Math.abs(a);b=Math.abs(b); while(b){[a,b]=[b,a%b];} return a; },
    lcm:(a,b)=>Math.abs(a*b)/(Math.abs(a)&&Math.abs(b)),
    mean:(...a)=>a.flat().reduce((x,y)=>x+y,0)/a.flat().length,
    max:Math.max, min:Math.min,
  };
};

const runEval = (expr, scope) => {
  let e = expr
    .replace(/×/g,'*').replace(/÷/g,'/').replace(/\^/g,'**').replace(/π/g,'pi')
    .replace(/√\(/g,'sqrt(').replace(/∛\(/g,'cbrt(')
    .replace(/sin⁻¹\(/g,'asin(').replace(/cos⁻¹\(/g,'acos(').replace(/tan⁻¹\(/g,'atan(')
    .replace(/sinh⁻¹\(/g,'asinh(').replace(/cosh⁻¹\(/g,'acosh(').replace(/tanh⁻¹\(/g,'atanh(')
    .replace(/log\(/g,'log(').replace(/ln\(/g,'ln(').replace(/exp\(/g,'exp(')
    .replace(/(\d+(?:\.\d+)?)!/g,'fact($1)')
    .replace(/(\d+)nPr(\d+)/g,'nPr($1,$2)')
    .replace(/(\d+)nCr(\d+)/g,'nCr($1,$2)');
  const op=(e.match(/\(/g)||[]).length, cl=(e.match(/\)/g)||[]).length;
  if(op>cl) e+=')'.repeat(op-cl);
  try {
    return new Function(...Object.keys(scope),`"use strict";return (${e})`)(...Object.values(scope));
  } catch {
    return math.evaluate(e, {...scope});
  }
};

const fmt = v => {
  if (typeof v==='number') return isFinite(v) ? String(parseFloat(v.toPrecision(10))) : 'Math ERROR';
  if (typeof v==='string') return v;
  if (v && v.toArray) return JSON.stringify(v.toArray()); // mathjs matrix
  if (Array.isArray(v)) return JSON.stringify(v);
  try { return math.format(v,{precision:10}); } catch { return String(v); }
};

/* ════════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════ */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#111; }

  .casio-wrap {
    min-height:100vh;
    background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
    display:flex; align-items:center; justify-content:center;
    padding:20px 10px; font-family:Arial,sans-serif;
  }
  .casio-body {
    background:linear-gradient(175deg,#232323 0%,#1a1a1a 100%);
    width:340px; border-radius:16px 16px 12px 12px;
    border:1px solid #3a3a3a;
    box-shadow:0 12px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06);
    overflow:hidden;
  }

  /* ── Top bar ── */
  .top-bar {
    background:linear-gradient(90deg,#1a1a1a,#252525);
    padding:10px 16px 8px; border-bottom:2px solid #111;
  }
  .top-row { display:flex; justify-content:space-between; align-items:flex-end; }
  .brand { color:#fff; font-size:20px; font-weight:900; font-style:italic; letter-spacing:2px; }
  .model-name { color:#999; font-size:10px; letter-spacing:1px; }
  .vpam { color:#666; font-size:8px; text-align:center; letter-spacing:4px; margin-top:2px; }

  /* ── Display ── */
  .display-outer {
    margin:10px 12px 8px;
    background:linear-gradient(160deg,#c5d8a0,#b8cc90);
    border-radius:6px; padding:8px 10px 6px;
    box-shadow:inset 0 2px 10px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.1);
    border:2px solid #7a9060; min-height:82px; position:relative;
  }
  .disp-top { display:flex; justify-content:space-between; margin-bottom:2px; }
  .disp-inds { display:flex; gap:6px; font-size:9px; font-weight:bold; color:#2a3a10; }
  .ind-shift { color:#b8860b; }
  .ind-alpha { color:#c00; }
  .ind-hyp   { color:#00c; }
  .disp-mode { font-size:9px; color:#2a3a10; font-weight:bold; }
  .disp-expr {
    font-family:'Share Tech Mono',monospace; font-size:11px;
    color:#2a3a10; text-align:right; min-height:13px;
    opacity:0.65; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .disp-main {
    font-family:'Share Tech Mono',monospace; font-size:26px;
    color:#0d1f00; text-align:right; min-height:34px; line-height:1.1;
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }
  .disp-status { font-size:9px; color:#3a5a00; text-align:right; margin-top:3px; min-height:11px; }

  /* ── History strip ── */
  .history-strip {
    margin:0 12px 6px; background:#0d0d0d; border-radius:4px;
    max-height:36px; overflow-y:auto; border:1px solid #222;
  }
  .hist-item {
    font-size:9px; color:#5a8a3a; padding:2px 8px; cursor:pointer;
    border-bottom:1px solid #1a1a1a; font-family:monospace;
  }
  .hist-item:hover { background:#1a1a1a; color:#8aee5a; }

  /* ── Meta row (SHIFT ALPHA DPAD MODE ON) ── */
  .meta-row {
    display:flex; align-items:center; justify-content:space-between;
    padding:4px 10px 4px;
  }
  .meta-btn {
    padding:5px 9px; border-radius:5px; font-size:10px; font-weight:bold;
    cursor:pointer; border:none; transition:all 0.1s;
    box-shadow:0 2px 5px rgba(0,0,0,0.5);
  }
  .btn-shift { background:#1a2d55; color:#7ab3f5; border:1px solid #2a4d8a; }
  .btn-shift.active { background:#f5c542; color:#000; border-color:#f5c542; }
  .btn-alpha { background:#4a1515; color:#f08080; border:1px solid #8a2a2a; }
  .btn-alpha.active { background:#e05050; color:#fff; border-color:#e05050; }

  .dpad {
    width:58px; height:58px; background:#111; border-radius:50%;
    position:relative; border:1px solid #2a2a2a;
    box-shadow:0 3px 8px rgba(0,0,0,0.6);
    display:flex; align-items:center; justify-content:center;
  }
  .dpad-center {
    width:22px; height:22px; background:#1a1a1a; border-radius:50%;
    border:1px solid #333; display:flex; align-items:center;
    justify-content:center; font-size:7px; color:#555;
  }
  .dpad-arrow {
    position:absolute; color:#666; font-size:9px; cursor:pointer; user-select:none;
  }
  .btn-mode {
    background:#2a2a2a; color:#bbb; border:1px solid #444;
    border-radius:5px; padding:4px 6px; font-size:8px; font-weight:bold;
    cursor:pointer; text-align:center; line-height:1.4;
    box-shadow:0 2px 5px rgba(0,0,0,0.5);
  }
  .btn-on {
    background:#1a4a1a; color:#5dff5d; border:1px solid #2a8a2a;
    border-radius:5px; padding:5px 10px; font-size:10px; font-weight:bold;
    cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.5);
  }

  /* ── MATRIX PANEL ── */
  .matrix-panel {
    margin:0 10px 6px;
    background:linear-gradient(135deg,#0a1628,#0d1f3c);
    border:1px solid #1e3a6e; border-radius:8px; overflow:hidden;
  }
  .matrix-header {
    background:linear-gradient(90deg,#1e3a6e,#2a4a8e);
    padding:5px 10px; display:flex; justify-content:space-between; align-items:center;
  }
  .matrix-title { color:#7ab3f5; font-size:10px; font-weight:bold; letter-spacing:1px; }
  .matrix-toggle {
    color:#aaa; font-size:9px; cursor:pointer; padding:2px 6px;
    background:#111; border-radius:3px; border:1px solid #333;
  }
  .matrix-btns {
    display:grid; grid-template-columns:repeat(5,1fr); gap:4px; padding:6px 8px;
  }
  .mat-btn {
    background:#0d2040; color:#7ab3f5; border:1px solid #1e3a6e;
    border-radius:4px; padding:6px 2px; font-size:9px; font-weight:bold;
    cursor:pointer; text-align:center; transition:all 0.1s;
    box-shadow:0 1px 3px rgba(0,0,0,0.4);
  }
  .mat-btn:hover { background:#1e3a6e; color:#afd4ff; }
  .mat-btn:active { background:#2a4a8e; transform:scale(0.96); }
  .mat-hint {
    padding:4px 8px 6px; font-size:8px; color:#4a6a9e;
    font-family:monospace; text-align:center;
  }

  /* ── Key rows ── */
  .key-section { padding:0 10px; }
  .key-row { display:flex; gap:4px; margin-bottom:4px; justify-content:center; }

  .ckey {
    border:none; border-radius:5px; cursor:pointer;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    transition:all 0.08s; user-select:none; position:relative;
    box-shadow:0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .ckey:active { transform:translateY(1px); box-shadow:inset 0 2px 4px rgba(0,0,0,0.5); filter:brightness(0.85); }
  .ckey .above {
    font-size:7px; font-weight:bold; height:10px; line-height:10px;
    text-align:center; width:100%; overflow:hidden;
  }
  .ckey .main { font-size:10px; font-weight:bold; line-height:1; }
  .ckey .sub  { font-size:7px; opacity:0.7; line-height:1; }

  /* Key color classes */
  .k-dark  { background:#2e2e2e; color:#ddd; border:1px solid #3e3e3e; }
  .k-num   { background:#484848; color:#fff; border:1px solid #585858; }
  .k-op    { background:#2e2e2e; color:#ddd; border:1px solid #3e3e3e; }
  .k-eq    { background:#cc3300; color:#fff; border:1px solid #ff4411; }
  .k-del   { background:#2a6a2a; color:#fff; border:1px solid #3a8a3a; }
  .k-ac    { background:#2a6a2a; color:#fff; border:1px solid #3a8a3a; }

  /* Hint bar */
  .hint-bar {
    margin:2px 10px 4px; padding:4px 8px; background:#0a0a0a;
    border-radius:4px; font-size:8px; color:#555; text-align:center;
    border:1px solid #1a1a1a; font-family:monospace;
  }
  .hint-active { color:#7ab3f5; background:#0a1628; border-color:#1e3a6e; }

  /* Footer */
  .calc-footer {
    text-align:center; font-size:8px; color:#333; padding:6px 0 8px;
  }
`;

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function CasioFx82ES() {
  const [display,    setDisplay]    = useState('0');
  const [exprLine,   setExprLine]   = useState('');
  const [prevAns,    setPrevAns]    = useState('0');
  const [memory,     setMemory]     = useState(0);
  const [isShift,    setIsShift]    = useState(false);
  const [isAlpha,    setIsAlpha]    = useState(false);
  const [isHyp,      setIsHyp]      = useState(false);
  const [angleMode,  setAngleMode]  = useState('DEG');
  const [history,    setHistory]    = useState([]);
  const [status,     setStatus]     = useState('');
  const [matOpen,    setMatOpen]    = useState(true); // matrix panel open by default

  const flash = (msg, ms=2000) => { setStatus(msg); setTimeout(()=>setStatus(''),ms); };

  const append = useCallback(val => {
    setDisplay(p => (p==='0' && !isNaN(val) ? val : p==='0' && val==='.' ? '0.' : p==='0' ? val : p+val));
  }, []);

  /* ── evaluate ─────────────────────────────────────────────────────────── */
  const doEval = useCallback(() => {
    const raw = display==='0' ? '0' : display;
    setExprLine(raw);
    try {
      const scope = buildScope(angleMode);
      const prepared = raw.replace(/Ans/g, prevAns);
      const result = runEval(prepared, scope);
      const formatted = fmt(result);
      setDisplay(formatted);
      setPrevAns(formatted);
      setHistory(h=>[`${raw} = ${formatted}`,...h].slice(0,20));
    } catch(e) {
      setDisplay('Math ERROR');
      setTimeout(()=>setDisplay('0'),1600);
    }
  }, [display, angleMode, prevAns]);

  /* ── keyboard ─────────────────────────────────────────────────────────── */
  useEffect(()=>{
    const h = e => {
      if(['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      const k=e.key;
      const map={'0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '+':'+','-':'-','*':'×','/':'÷','.':'.','(':' (',')':', )','^':'^','%':'%','[':'[',']':']',',':', '};
      if(map[k]){ e.preventDefault(); append(map[k]); }
      else if(k==='Enter'||k==='='){ e.preventDefault(); doEval(); }
      else if(k==='Escape'){ e.preventDefault(); setDisplay('0'); setExprLine(''); }
      else if(k==='Backspace'){ e.preventDefault(); setDisplay(p=>p.length<=1?'0':p.slice(0,-1)); }
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[append,doEval]);

  /* ── matrix button press ──────────────────────────────────────────────── */
  const matPress = (val) => {
    setDisplay(p => p==='0' ? val : p+val);
  };

  /* ── regular button press ─────────────────────────────────────────────── */
  const press = useCallback((btn) => {
    const useShift = isShift && btn.sv !== undefined;
    const useHyp   = isHyp   && btn.hv !== undefined;
    const act = useShift ? (btn.sa||'APPEND') : useHyp ? (btn.ha||'APPEND') : (btn.act||'APPEND');
    const val = useShift ? btn.sv : useHyp ? btn.hv : btn.val;

    if(btn.act==='SHIFT'){ setIsShift(p=>!p); setIsAlpha(false); setIsHyp(false); return; }
    if(btn.act==='ALPHA'){ setIsAlpha(p=>!p); setIsShift(false); setIsHyp(false); return; }
    if(btn.act==='HYP')  { setIsHyp(p=>!p); return; }

    setIsShift(false); setIsAlpha(false); setIsHyp(false);

    switch(act){
      case 'AC':    setDisplay('0'); setExprLine(''); break;
      case 'DEL':   setDisplay(p=>p.length<=1?'0':p.slice(0,-1)); break;
      case 'EQ':    doEval(); break;
      case 'NEG':   setDisplay(p=>p.startsWith('-')?p.slice(1):'-'+p); break;
      case 'ANS':   setDisplay(prevAns); break;
      case 'MR':    setDisplay(String(memory)); break;
      case 'MC':    setMemory(0); flash('Memory = 0'); break;
      case 'M+':  { const v=parseFloat(display); if(!isNaN(v)){setMemory(m=>{const n=m+v;flash(`M = ${n}`);return n;});} break; }
      case 'M-':  { const v=parseFloat(display); if(!isNaN(v)){setMemory(m=>{const n=m-v;flash(`M = ${n}`);return n;});} break; }
      case 'STO':   setMemory(parseFloat(display)||0); flash(`Stored: ${display}`); break;
      case 'ANGLE':{
        const ms=['DEG','RAD','GRAD'];
        setAngleMode(m=>{ const n=ms[(ms.indexOf(m)+1)%3]; flash(`Mode: ${n}`); return n; });
        break;
      }
      case 'ENG': {
        const n=parseFloat(display);
        if(!isNaN(n)){ const ex=Math.floor(Math.log10(Math.abs(n))/3)*3; setDisplay(`${(n/10**ex).toPrecision(4)}×10^${ex}`); }
        break;
      }
      case 'FACT':  setDisplay(p=>p+'!'); break;
      case 'SD': {
        const v=parseFloat(display);
        if(!isNaN(v)){
          const tol=1e-8; let h1=1,h2=0,k1=0,k2=1,b=Math.abs(v);
          for(let i=0;i<60;i++){const a=Math.floor(b);[h1,h2]=[a*h1+h2,h1];[k1,k2]=[a*k1+k2,k1];if(Math.abs(Math.abs(v)-h1/k1)<tol)break;b=1/(b-a);}
          if(k1===1) flash('Already integer');
          else { setDisplay(`${v<0?'-':''}${h1}/${k1}`); flash(`Fraction: ${h1}/${k1}`); }
        }
        break;
      }
      case 'STAT': {
        const s=prompt('STAT — Enter numbers (comma separated):\ne.g.: 10,20,30,40,50');
        if(!s) break;
        const arr=s.split(',').map(Number).filter(x=>!isNaN(x));
        if(!arr.length) break;
        const n=arr.length, mean=arr.reduce((a,b)=>a+b,0)/n;
        const vari=arr.reduce((s,x)=>s+(x-mean)**2,0)/n;
        const res=`n=${n}  x̄=${mean.toFixed(4)}  σ=${Math.sqrt(vari).toFixed(4)}`;
        setDisplay(res); flash(res,4000);
        break;
      }
      case 'APPEND': if(val!==undefined) append(val); break;
      default: if(val!==undefined) append(val);
    }
  },[isShift,isAlpha,isHyp,display,memory,prevAns,doEval,append,angleMode]);

  /* ════════════════════════════════════════════════════════════
     BUTTON DEFINITIONS — matching Casio fx-82ES PLUS exactly
  ════════════════════════════════════════════════════════════ */
  const W=44, H=28;

  // k(label, act, val, extraProps)
  const B = (label,act,val,extra={}) => ({label,act,val,w:W,h:H,...extra});

  const rows = [
    /* Row A — Abs x³ ∛ x⁻¹ log■ */
    [
      B('Abs',  'APPEND','abs(',   {sv:'Pol(',  sa:'APPEND', shiftLabel:'Pol(',  cl:'k-dark', fs:'8px'}),
      B('x³',   'APPEND','**3',    {sv:'Rec(',  sa:'APPEND', shiftLabel:'Rec(',  cl:'k-dark', fs:'8px'}),
      B('∛',    'APPEND','cbrt(',  {sv:'■/□',  sa:'APPEND', shiftLabel:'■/□',  cl:'k-dark', fs:'9px'}),
      B('x⁻¹',  'APPEND','**(-1)', {sv:'x!',   sa:'FACT',   shiftLabel:'x!',    cl:'k-dark', fs:'8px'}),
      B('log■', 'APPEND','log(',   {sv:'10ˣ',  sa:'APPEND', shiftVal:'10**(', shiftLabel:'10ˣ', cl:'k-dark', fs:'8px'}),
    ],
    /* Row B — ■/□  √  x²  xⁿ  log  ln */
    [
      B('■/□', 'APPEND','(',      {sv:'■',    sa:'APPEND', shiftLabel:'■',  cl:'k-dark', fs:'8px'}),
      B('√',   'APPEND','sqrt(',  {sv:'■√',  sa:'APPEND', shiftLabel:'■√', cl:'k-dark', fs:'11px'}),
      B('x²',  'APPEND','**2',    {sv:'■',    sa:'APPEND', shiftLabel:'■',  cl:'k-dark', fs:'8px'}),
      B('xⁿ',  'APPEND','^(',     {cl:'k-dark', fs:'9px'}),
      B('log', 'APPEND','log(',   {sv:'10ˣ',  sa:'APPEND', shiftVal:'10**(',shiftLabel:'10ˣ', cl:'k-dark', fs:'9px'}),
      B('ln',  'APPEND','ln(',    {sv:'eˣ',   sa:'APPEND', shiftVal:'exp(', shiftLabel:'eˣ',  cl:'k-dark', fs:'9px'}),
    ],
    /* Row C — (-)  °′″  hyp  sin  cos  tan */
    [
      B('(-)',  'NEG',   null,     {sv:'',    cl:'k-dark', fs:'8px'}),
      B("°′″", 'APPEND',"'",      {cl:'k-dark', fs:'7px'}),
      B('hyp', 'HYP',   null,     {cl:'k-dark', fs:'8px', shiftLabel:'HYP'}),
      B('sin', 'APPEND','sin(',   {sv:'sin⁻¹(',sa:'APPEND',shiftLabel:'sin⁻¹', hv:'sinh(', ha:'APPEND', cl:'k-dark', fs:'9px'}),
      B('cos', 'APPEND','cos(',   {sv:'cos⁻¹(',sa:'APPEND',shiftLabel:'cos⁻¹', hv:'cosh(', ha:'APPEND', cl:'k-dark', fs:'9px'}),
      B('tan', 'APPEND','tan(',   {sv:'tan⁻¹(',sa:'APPEND',shiftLabel:'tan⁻¹', hv:'tanh(', ha:'APPEND', cl:'k-dark', fs:'9px'}),
    ],
    /* Row D — STO  %  (  )  S⟺D  M+ */
    [
      B('STO', 'STO',   null,     {sv:'RCL',  sa:'MR',   shiftLabel:'RCL',  cl:'k-dark', fs:'8px'}),
      B('%',   'APPEND','%',      {cl:'k-dark', fs:'11px'}),
      B('(',   'APPEND','(',      {cl:'k-dark', fs:'12px'}),
      B(')',   'APPEND',')',      {cl:'k-dark', fs:'12px'}),
      B('S⟺D','SD',    null,     {cl:'k-dark', fs:'7px'}),
      B('M+',  'M+',   null,     {sv:'M-',  sa:'M-',  shiftLabel:'M-',  cl:'k-dark', fs:'9px'}),
    ],
    /* Row E — 7 8 9 DEL AC */
    [
      B('7',   'APPEND','7', {cl:'k-num', fs:'14px'}),
      B('8',   'APPEND','8', {cl:'k-num', fs:'14px'}),
      B('9',   'APPEND','9', {cl:'k-num', fs:'14px'}),
      B('DEL', 'DEL',  null, {sv:'INS', sa:'APPEND', shiftLabel:'INS', cl:'k-del', fs:'9px', w:W}),
      B('AC',  'AC',   null, {sv:'OFF', sa:'AC',     shiftLabel:'OFF', cl:'k-ac',  fs:'9px', w:W}),
    ],
    /* Row F — 4 5 6 × ÷ */
    [
      B('4',   'APPEND','4',  {cl:'k-num', fs:'14px'}),
      B('5',   'APPEND','5',  {cl:'k-num', fs:'14px'}),
      B('6',   'APPEND','6',  {cl:'k-num', fs:'14px'}),
      B('×',   'APPEND','×',  {sv:'nPr',  sa:'APPEND', shiftLabel:'nPr', cl:'k-op', fs:'13px'}),
      B('÷',   'APPEND','÷',  {sv:'nCr',  sa:'APPEND', shiftLabel:'nCr', cl:'k-op', fs:'13px'}),
    ],
    /* Row G — 1 2 3 + – */
    [
      B('1',   'APPEND','1',  {cl:'k-num', fs:'14px', sv:'STAT', sa:'STAT', shiftLabel:'STAT'}),
      B('2',   'APPEND','2',  {cl:'k-num', fs:'14px'}),
      B('3',   'APPEND','3',  {cl:'k-num', fs:'14px'}),
      B('+',   'APPEND','+',  {sv:'Pol(', sa:'APPEND', shiftLabel:'Pol(',cl:'k-op', fs:'14px'}),
      B('−',   'APPEND','-',  {sv:'Rec(', sa:'APPEND', shiftLabel:'Rec(',cl:'k-op', fs:'14px'}),
    ],
    /* Row H — 0  .  ×10ˣ  Ans  = */
    [
      {label:'0', act:'APPEND', val:'0', w:W+8, h:H, cl:'k-num', fs:'14px', sv:'Rnd', sa:'APPEND', shiftLabel:'Rnd', shiftVal:String(+(Math.random()).toFixed(6))},
      B('.',    'APPEND','.',  {cl:'k-num', fs:'14px'}),
      B('×10ˣ', 'ENG',  null, {sv:'Ran#',sa:'APPEND',shiftLabel:'Ran#',shiftVal:String(+(Math.random()).toFixed(8)), cl:'k-dark', fs:'7px'}),
      B('Ans',  'ANS',  null, {sv:'DRG▸',sa:'ANGLE',shiftLabel:'DRG▸', cl:'k-dark', fs:'9px'}),
      B('=',    'EQ',   null, {cl:'k-eq', fs:'14px', w:W}),
    ],
  ];

  /* ── Matrix buttons ────────────────────────────────────────────────────── */
  const matBtns = [
    { label:'det(',   val:'det(',        hint:'Determinant' },
    { label:'inv(',   val:'inv(',        hint:'Inverse' },
    { label:'trans(', val:'transpose(',  hint:'Transpose' },
    { label:'[[',     val:'[[',          hint:'Matrix start' },
    { label:']]',     val:']])',         hint:'Matrix end' },
    { label:'[',      val:'[',           hint:'Row start' },
    { label:']',      val:'],',          hint:'Row end' },
    { label:',',      val:',',           hint:'Separator' },
    { label:'nPr',    val:'nPr',         hint:'Permutation' },
    { label:'nCr',    val:'nCr',         hint:'Combination' },
  ];

  /* ── Render a key ─────────────────────────────────────────────────────── */
  const renderKey = (btn, ri, bi) => {
    const shiftLabel = isShift && btn.shiftLabel ? btn.shiftLabel : null;
    const aboveColor = shiftLabel ? '#f5c542' : 'transparent';
    return (
      <div
        key={`${ri}-${bi}`}
        className={`ckey ${btn.cl||'k-dark'}`}
        style={{ width:btn.w||W, height:btn.h||H, minWidth:btn.w||W }}
        onClick={()=>press(btn)}
        title={btn.shiftLabel ? `SHIFT→${btn.shiftLabel}` : undefined}
      >
        <div className="above" style={{color:aboveColor}}>
          {btn.shiftLabel||'\u00a0'}
        </div>
        <div className="main" style={{fontSize:btn.fs||'10px'}}>
          {isShift && btn.shiftLabel ? btn.shiftLabel : btn.label}
        </div>
      </div>
    );
  };

  const hintText = isHyp ? '⚡ HYP ON — sin→sinh, cos→cosh, tan→tanh'
    : isShift ? '⬆ SHIFT ON — press yellow function'
    : isAlpha ? '🔤 ALPHA ON — letter input'
    : `${angleMode} | Type/click then press =`;

  return (
    <>
      <style>{css}</style>
      <div className="casio-wrap">
        <div className="casio-body">

          {/* ── Top branding ── */}
          <div className="top-bar">
            <div className="top-row">
              <div className="brand">CASIO</div>
              <div className="model-name">fx-82ES PLUS</div>
            </div>
            <div className="vpam">NATURAL-V.P.A.M.</div>
          </div>

          {/* ── Display ── */}
          <div className="display-outer">
            <div className="disp-top">
              <div className="disp-inds">
                {memory!==0 && <span>M</span>}
                {isShift && <span className="ind-shift">S</span>}
                {isAlpha && <span className="ind-alpha">A</span>}
                {isHyp   && <span className="ind-hyp">H</span>}
              </div>
              <div className="disp-mode">{angleMode} {sdMode}</div>
            </div>
            <div className="disp-expr">{exprLine}</div>
            <div className="disp-main">{display}</div>
            <div className="disp-status">{status}</div>
          </div>

          {/* ── History ── */}
          {history.length>0 && (
            <div className="history-strip">
              {history.slice(0,4).map((h,i)=>(
                <div key={i} className="hist-item"
                  onClick={()=>{ const r=h.split(' = ')[1]; if(r) setDisplay(r); }}>
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* ── MATRIX PANEL ── */}
          <div className="matrix-panel">
            <div className="matrix-header">
              <div className="matrix-title">⬡ MATRIX &amp; SPECIAL FUNCTIONS</div>
              <div className="matrix-toggle" onClick={()=>setMatOpen(p=>!p)}>
                {matOpen ? '▲ hide' : '▼ show'}
              </div>
            </div>
            {matOpen && (
              <>
                <div className="matrix-btns">
                  {matBtns.map((mb,i)=>(
                    <div key={i} className="mat-btn" onClick={()=>matPress(mb.val)} title={mb.hint}>
                      {mb.label}
                    </div>
                  ))}
                </div>
                {/* <div className="mat-hint">
                  Example: det( → [[ → 1,2 → ] → , → [3,4 → ]] → =
                  <br/>
                  Or type: <strong>det([[1,2],[3,4]])</strong> and press =
                </div> */}
              </>
            )}
          </div>

          {/* ── SHIFT / ALPHA / DPAD / MODE / ON ── */}
          <div className="meta-row">
            <div className={`meta-btn btn-shift ${isShift?'active':''}`} onClick={()=>press({act:'SHIFT'})}>
              SHIFT
            </div>
            <div className={`meta-btn btn-alpha ${isAlpha?'active':''}`} onClick={()=>press({act:'ALPHA'})}>
              ALPHA
            </div>
            <div className="dpad">
              <div className="dpad-arrow" style={{top:'5px',left:'50%',transform:'translateX(-50%)'}}>▲</div>
              <div className="dpad-arrow" style={{bottom:'5px',left:'50%',transform:'translateX(-50%)'}}>▼</div>
              <div className="dpad-arrow" style={{left:'5px',top:'50%',transform:'translateY(-50%)'}}>◀</div>
              <div className="dpad-arrow" style={{right:'5px',top:'50%',transform:'translateY(-50%)'}}>▶</div>
              <div className="dpad-center">OK</div>
            </div>
            <div className="btn-mode" onClick={()=>press({act:'ANGLE'})}>
              MODE<br/><span style={{fontSize:'7px',color:'#666'}}>SETUP</span>
            </div>
            <div className="btn-on" onClick={()=>press({act:'AC'})}>ON</div>
          </div>

          {/* ── Hint bar ── */}
          <div className={`hint-bar ${(isShift||isAlpha||isHyp)?'hint-active':''}`}>
            {hintText}
          </div>

          {/* ── Key rows ── */}
          <div className="key-section">
            {rows.map((row, ri)=>(
              <div key={ri} className="key-row">
                {row.map((btn, bi)=>renderKey(btn,ri,bi))}
              </div>
            ))}
          </div>

          {/* ── RCL ENG row ── */}
          <div className="key-row" style={{padding:'0 10px',marginBottom:'4px'}}>
            <div className="ckey k-dark" style={{width:W,height:H}} onClick={()=>press({act:'MR',sv:'STO',sa:'STO',shiftLabel:'STO'})}>
              <div className="above" style={{color:isShift?'#f5c542':'transparent'}}>STO</div>
              <div className="main" style={{fontSize:'9px'}}>{isShift?'STO':'RCL'}</div>
            </div>
            <div className="ckey k-dark" style={{width:W,height:H}} onClick={()=>press({act:'ENG'})}>
              <div className="above">&nbsp;</div>
              <div className="main" style={{fontSize:'9px'}}>ENG</div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="calc-footer">
            SAVS fx-82ES PLUS • mathjs • Matrix ✓ Trig ✓ Stat ✓
          </div>
        </div>
      </div>
    </>
  );
}

// tiny helper used in SD toggle display
CasioFx82ES.defaultProps = {};
// expose sdMode for display
const sdMode = '';