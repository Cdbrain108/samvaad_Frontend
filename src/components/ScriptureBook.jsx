import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import oldManuscriptBg from '../assets/old-manuscript-page.jpg'

const verses = [
  { source: 'Bhagavad Gita · 2.47', devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥', meaning: 'Your right is to action alone, never to its fruits — act without attachment, and never rest in inaction.' },
  { source: 'Bhagavad Gita · 2.20', devanagari: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥', meaning: 'The soul is never born, nor does it ever die — unborn, eternal, it is not slain when the body is slain.' },
  { source: 'Bhagavad Gita · 4.7', devanagari: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥', meaning: 'Whenever righteousness fades and unrighteousness rises, I manifest Myself in every age.' },
  { source: 'Bhagavad Gita · 18.66', devanagari: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥', meaning: 'Abandon all duties and come to Me alone for refuge — I shall free you from every sin; do not grieve.' },
  { source: 'Ramcharitmanas · 1.1', devanagari: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥', meaning: 'Polishing the mirror of my mind with the dust of the Guru’s lotus feet, I sing the spotless glory of Sri Ram.' },
  { source: 'Ramcharitmanas · Doha', devanagari: 'धीरज धर्म मित्र अरु नारी। आपद काल परहिं जो चारी॥', meaning: 'Patience, virtue, a true friend and a devoted wife — these four stay with you in the hour of calamity.' },
  { source: 'Ramcharitmanas · 35', devanagari: 'सियाराममय सब जग जानी। करहुँ प्रनाम जोरि जुग पानी॥', meaning: 'Knowing all the world to be filled with Sita and Ram, I bow to every being with folded hands.' },
  { source: 'Ramcharitmanas · Doha', devanagari: 'बिनु सतसंग बिबेक न होई। राम कृपाँ बिनु सुलभ न सोई॥', meaning: 'Without satsang there is no true wisdom, and without Ram’s grace it is never easily won.' },
]

const PAGE_TIME = 5200
const TURN_TIME = 1450
const LEAF_W = 4.15
const LEAF_D = 1.18
const LEAF_H = 0.032
const STACK_GAP = 0.029
const STACK_COUNT = 26
const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const SANS_DEVA = '"Noto Sans Devanagari","Nirmala UI","Mangal",serif'

function makeCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; return [c,ctx] }
function wrapText(ctx,text,maxW){ const words=text.split(' '); const lines=[]; let line=''; for(const w of words){ const t=line?line+' '+w:w; if(ctx.measureText(t).width>maxW && line){ lines.push(line); line=w } else line=t } if(line) lines.push(line); return lines }

// ---------------------------------------------------------------------------
//  ULTRA palm leaf — photo-real
// ---------------------------------------------------------------------------
function drawPalmLeafTexture(verse, folioNum){
  const W=2048, H=640
  const [canvas, ctx]=makeCanvas(W,H)
  // base palm — warm straw with uneven tone
  const bg=ctx.createLinearGradient(0,0,0,H)
  bg.addColorStop(0,'#D8B56E')
  bg.addColorStop(0.14,'#E9CD95')
  bg.addColorStop(0.32,'#F1DEB0')
  bg.addColorStop(0.58,'#EFD9A8')
  bg.addColorStop(0.84,'#E2C48B')
  bg.addColorStop(1,'#C8A96A')
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
  // horizontal fibres — dense, wavy, hand-cut look
  ctx.globalAlpha=0.14
  ctx.fillStyle='#7A4A14'
  for(let y=0;y<H;y+=2.2){
    const jitter=Math.sin(y*0.11)*0.9 + Math.cos(y*0.037)*0.6 + (Math.random()-0.5)*0.5
    const thickness= y%11<2 ? 1.0 : 0.55
    ctx.fillRect(0, y+jitter, W, thickness)
  }
  // thicker fibre bundles every ~22px
  ctx.globalAlpha=0.08
  for(let y=8;y<H;y+=22){
    ctx.fillRect(0, y+Math.sin(y*0.08)*1.2, W, 1.4)
  }
  ctx.globalAlpha=1
  // irregular edge wear — top/bottom jagged darkening (hand-trimmed)
  ctx.fillStyle='rgba(78,38,8,0.22)'
  ctx.beginPath()
  ctx.moveTo(0,0)
  for(let x=0;x<=W;x+=18){
    const dy= Math.random()*7 + Math.sin(x*0.018)*3
    ctx.lineTo(x, dy)
  }
  ctx.lineTo(W,0); ctx.closePath(); ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0,H)
  for(let x=0;x<=W;x+=18){
    const dy= Math.random()*7 + Math.cos(x*0.018)*3
    ctx.lineTo(x, H-dy)
  }
  ctx.lineTo(W,H); ctx.closePath(); ctx.fill()
  // left/right fray
  ctx.fillStyle='rgba(78,38,8,0.13)'
  ctx.fillRect(0,0,14,H); ctx.fillRect(W-14,0,14,H)
  // water stains & age — large soft and small speckles
  for(let i=0;i<70;i++){
    const x=Math.random()*W, y=Math.random()*H
    const rx= 18+Math.random()*42, ry= rx*0.55
    const a= 0.018 + Math.random()*0.032
    ctx.fillStyle=`rgba(92,62,18,${a})`
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry, Math.random()*0.6,0,Math.PI*2); ctx.fill()
  }
  for(let i=0;i<160;i++){
    const x=Math.random()*W, y=Math.random()*H, r= 1.2+Math.random()*5
    ctx.fillStyle=`rgba(72,42,12,${0.035+Math.random()*0.055})`
    ctx.beginPath(); ctx.ellipse(x,y,r,r*0.65,Math.random()*Math.PI,0,Math.PI*2); ctx.fill()
  }
  // fine micro-cracks — vertical irregular dark hairlines
  ctx.strokeStyle='rgba(58,30,8,0.09)'; ctx.lineWidth=0.6
  for(let i=0;i<18;i++){
    const x= Math.random()*W
    ctx.beginPath(); ctx.moveTo(x, 18+Math.random()*40)
    let cx=x, cy=18
    for(let s=0;s<5;s++){
      cx += (Math.random()-0.5)*7
      cy += H*0.18 + Math.random()*22
      ctx.lineTo(cx, cy)
    }
    ctx.stroke()
  }
  // ruled lines — hand-drawn wobble, deep vermilion
  function wobblyLine(y, alpha, lw){
    ctx.strokeStyle=`rgba(148,32,18,${alpha})`; ctx.lineWidth=lw; ctx.beginPath()
    ctx.moveTo(48, y)
    for(let x=48; x<=W-48; x+=48){
      const ny= y + Math.sin(x*0.032)*0.9 + (Math.random()-0.5)*0.7
      ctx.lineTo(x, ny)
    }
    ctx.stroke()
  }
  wobblyLine(108, 0.58, 1.35)
  wobblyLine(H-112, 0.58, 1.35)
  wobblyLine(114, 0.20, 0.7)
  wobblyLine(H-106, 0.20, 0.7)
  // Om watermark — ultra faint, large, behind text (like photo's bleed) — draw first so text is on top
  ctx.save(); ctx.globalAlpha=0.032; ctx.fillStyle='#5B2A04'; ctx.font=`500 340px ${SANS_DEVA}`; ctx.textAlign='center'; ctx.textBaseline='middle'
  ctx.fillText('ॐ', W/2, H/2+10); ctx.restore()
  // text
  ctx.textAlign='center'; ctx.textBaseline='alphabetic'
  ctx.fillStyle='rgba(122,58,12,0.74)'; ctx.font=`700 22px ${SANS_DEVA}`
  ctx.fillText(verse.source.toUpperCase(), W/2, 84)
  ctx.fillStyle='#170E04'
  ctx.font=`600 56px ${SANS_DEVA}`
  ctx.shadowColor='rgba(0,0,0,0.13)'; ctx.shadowBlur=0.9; ctx.shadowOffsetY=1.1
  const maxTextW=W*0.38
  const lines=wrapText(ctx, verse.devanagari, maxTextW)
  const lineH=68
  let ty= (H - lines.length*lineH)/2 + 38
  for(const ln of lines){ ctx.fillText(ln, W/2, ty); ty+=lineH }
  ctx.shadowBlur=0; ctx.shadowOffsetY=0
  if(lines.length<=2){
    ctx.fillStyle='rgba(92,58,14,0.58)'; ctx.font='italic 22px Georgia, serif'
    const ml=wrapText(ctx, verse.meaning, maxTextW-60)
    if(ml.length){ const t= ml[0].length>88? ml[0].slice(0,86)+'…': ml[0]; ctx.fillText(t, W/2, H-56) }
  }
  ctx.textAlign='right'; ctx.fillStyle='rgba(122,58,12,0.52)'; ctx.font=`600 17px ${SANS_DEVA}`
  ctx.fillText(`॥ ${folioNum} ॥`, W-30, H-16)
  // string holes — photo-real eyelet with bevel, shadow, crack, gold ring — draw AFTER text so holes stay clear (no text inside)
  for(const hx of [W*0.30, W*0.70]){
    const hy=H/2
    // drop shadow
    ctx.fillStyle='rgba(0,0,0,0.22)'
    ctx.beginPath(); ctx.ellipse(hx+2.5, hy+2.5, 18, 15, 0,0,Math.PI*2); ctx.fill()
    // outer wood bevel (dark)
    ctx.fillStyle='#2E1608'; ctx.beginPath(); ctx.ellipse(hx,hy,17,14.5,0,0,Math.PI*2); ctx.fill()
    // gold eyelet ring — thin
    ctx.strokeStyle='#C9A24A'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.ellipse(hx,hy,13,11,0,0,Math.PI*2); ctx.stroke()
    ctx.strokeStyle='rgba(255,232,160,0.42)'; ctx.lineWidth=0.9; ctx.beginPath(); ctx.ellipse(hx,hy,13,11, -0.9,0.7, 2.1); ctx.stroke()
    // inner void
    ctx.fillStyle='#0F0702'; ctx.beginPath(); ctx.ellipse(hx,hy,9.5,8,0,0,Math.PI*2); ctx.fill()
    // small radial crack around hole
    ctx.strokeStyle='rgba(58,30,8,0.18)'; ctx.lineWidth=0.7
    ctx.beginPath(); ctx.moveTo(hx+13, hy-2); ctx.lineTo(hx+19, hy-5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(hx-13, hy+3); ctx.lineTo(hx-18, hy+7); ctx.stroke()
  }
  // subtle vignette
  const vig=ctx.createRadialGradient(W/2,H/2, H*0.45, W/2,H/2, W*0.78)
  vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(60,30,8,0.18)')
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=8; tex.needsUpdate=true; return tex
}
function drawPlainLeafTexture(){
  const W=2048,H=640; const [c,ctx]=makeCanvas(W,H)
  const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,'#D8B56E'); bg.addColorStop(0.5,'#F1DEB0'); bg.addColorStop(1,'#C8A96A')
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
  ctx.globalAlpha=0.12; ctx.fillStyle='#7A4A14'; for(let y=0;y<H;y+=2.2) ctx.fillRect(0,y+Math.random()*0.5,W,0.55); ctx.globalAlpha=1
  for(let i=0;i<80;i++){ ctx.fillStyle=`rgba(92,62,18,${0.028+Math.random()*0.045})`; ctx.beginPath(); ctx.ellipse(Math.random()*W,Math.random()*H, Math.random()*10+2, Math.random()*6+2,0,0,Math.PI*2); ctx.fill() }
  ctx.strokeStyle='rgba(148,32,18,0.38)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(48,108); ctx.lineTo(W-48,108); ctx.stroke(); ctx.beginPath(); ctx.moveTo(48,H-112); ctx.lineTo(W-48,H-112); ctx.stroke()
  for(const hx of [W*0.30, W*0.70]){ ctx.fillStyle='#2E1608'; ctx.beginPath(); ctx.ellipse(hx,H/2,17,14.5,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0F0702'; ctx.beginPath(); ctx.ellipse(hx,H/2,9.5,8,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#C9A24A'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(hx,H/2,13,11,0,0,Math.PI*2); ctx.stroke() }
  ctx.save(); ctx.globalAlpha=0.055; ctx.fillStyle='#5B2A04'; ctx.font=`500 300px ${SANS_DEVA}`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('ॐ', W/2, H/2+8); ctx.restore()
  ctx.fillStyle='rgba(78,38,8,0.13)'; ctx.fillRect(0,0,14,H); ctx.fillRect(W-14,0,14,H)
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=8; return t
}
// ---------------------------------------------------------------------------
//  ULTRA painted patta — near photo
// ---------------------------------------------------------------------------
function drawPaintedPatta(isTop){
  const W=2048, H=720; const [canvas, ctx]=makeCanvas(W,H)
  // wood base — deep teak with grain
  const wood=ctx.createLinearGradient(0,0,0,H)
  wood.addColorStop(0,'#5A1D06'); wood.addColorStop(0.22,'#7A2A0B'); wood.addColorStop(0.48,'#8F3310'); wood.addColorStop(0.72,'#6F2408'); wood.addColorStop(1,'#4A1604')
  ctx.fillStyle=wood; ctx.fillRect(0,0,W,H)
  // grain — wavy, with knots
  ctx.globalAlpha=0.16; ctx.strokeStyle='#2A0B04'; ctx.lineWidth=0.7
  for(let y=12;y<H;y+=9){
    ctx.beginPath(); const wv=Math.sin(y*0.018)*7; ctx.moveTo(0, y+wv)
    for(let x=0;x<W;x+=80){ ctx.lineTo(x, y + Math.sin(x*0.014 + y*0.02)*2.2 + wv + (Math.random()-0.5)*0.6) }
    ctx.stroke()
  }
  ctx.globalAlpha=1
  // knots — 2-3 dark ellipses with highlight
  for(const [kx,ky] of [[W*0.22, H*0.50],[W*0.78,H*0.50]]){
    ctx.fillStyle='rgba(38,14,4,0.32)'; ctx.beginPath(); ctx.ellipse(kx,ky, 26, 14, 0.2,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#2A0B04'; ctx.beginPath(); ctx.ellipse(kx,ky, 14,7,0.2,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle='rgba(255,220,150,0.18)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(kx,ky,18,9,0.2, -0.4,2.6); ctx.stroke()
  }
  // central plank highlight between borders
  const bh=Math.round(H*0.30); const iy=bh+12, ih=H-bh*2-24
  const plank=ctx.createLinearGradient(0,iy,0,iy+ih)
  plank.addColorStop(0,'rgba(0,0,0,0.24)'); plank.addColorStop(0.15,'rgba(255,220,160,0.05)'); plank.addColorStop(0.5,'rgba(255,210,140,0.02)'); plank.addColorStop(0.85,'rgba(255,220,160,0.04)'); plank.addColorStop(1,'rgba(0,0,0,0.26)')
  ctx.fillStyle=plank; ctx.fillRect(12,iy,W-24,ih)
  // inner thin gold line around central plank
  ctx.strokeStyle='rgba(201,162,74,0.22)'; ctx.lineWidth=1; ctx.strokeRect(14, iy, W-28, ih)

  function drawBorder(y0, h){
    // outer gold frame
    ctx.fillStyle='#B8932E'; ctx.fillRect(0,y0,W,5); ctx.fillRect(0,y0+h-5,W,5)
    ctx.fillStyle='#FFD97A'; ctx.fillRect(0,y0+5,W,1); ctx.fillRect(0,y0+h-6,W,1)
    // red field with subtle mottling
    ctx.fillStyle='#7F1708'; ctx.fillRect(3, y0+6, W-6, h-12)
    ctx.fillStyle='#A01E0C'; ctx.fillRect(3, y0+6, W-6, h-12)
    // add faint mottling
    for(let i=0;i<120;i++){
      const x=Math.random()*(W-16)+8, y=y0+6+Math.random()*(h-12)
      const r= Math.random()*2+0.6
      ctx.fillStyle=`rgba(255,220,120,${0.06+Math.random()*0.08})`
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill()
    }
    // inner saffron inset with gold inner line
    ctx.fillStyle='#B94A0A'; ctx.fillRect(10, y0+10, W-20, h-20)
    ctx.fillStyle='#C85A14'; ctx.fillRect(14, y0+14, W-28, h-28)
    ctx.strokeStyle='#FFD37A'; ctx.lineWidth=1.2; ctx.strokeRect(18, y0+18, W-36, h-36)
    ctx.strokeStyle='rgba(255,215,110,0.55)'; ctx.lineWidth=0.6; ctx.strokeRect(22, y0+22, W-44, h-44)
    // vertical gold dividers — 9 panels
    const cols=9, pad=28, availW=W-pad*2, colW=availW/cols
    ctx.fillStyle='#FFD37A'
    for(let c=1;c<cols;c++){ const x=pad+colW*c; ctx.fillRect(x-0.5, y0+18, 1, h-36) }
    // palette — earthy miniature tones (photo-like, muted not neon)
    const cloths=[ ['#D9A441','#B47A0A'], ['#2F6B8A','#1E4A5E'], ['#7A9A6A','#4A6B4A'], ['#B85A6A','#7A3A42'], ['#6B5A8A','#3F3550'], ['#C98A5A','#8A5A2E'], ['#5A8A8A','#2F5A5A'], ['#D4B483','#8A6A3A'], ['#8A6A7A','#4A3540'] ]
    for(let i=0;i<cols;i++){
      const cx=pad + colW*i + colW/2, cy=y0+h/2
      // arch / prabhavali — gold arch with red inner, pillars
      const archW= colW*0.78, archH= h*0.74
      // outer gold arch
      ctx.fillStyle='rgba(255,211,122,0.16)'; ctx.beginPath(); ctx.ellipse(cx, cy+6, archW*0.42, archH*0.38, 0, 0, Math.PI*2); ctx.fill()
      ctx.strokeStyle='rgba(255,211,122,0.42)'; ctx.lineWidth=1.1; ctx.beginPath(); ctx.ellipse(cx, cy+5, archW*0.38, archH*0.35, 0, 0, Math.PI*2); ctx.stroke()
      // pillars at sides of arch
      ctx.fillStyle='#7A3A0A'; ctx.fillRect(cx-archW*0.38, cy- archH*0.20, 3, archH*0.42); ctx.fillRect(cx+archW*0.38-3, cy- archH*0.20, 3, archH*0.42)
      ctx.fillStyle='#C9A24A'; ctx.fillRect(cx-archW*0.38, cy- archH*0.20, 3, 2); ctx.fillRect(cx+archW*0.38-3, cy- archH*0.20, 3, 2)
      // figure
      const isDeity= i%3!==2
      const skin= isDeity? '#EACCA8' : '#D8B090'
      const cloth= cloths[i%cloths.length]
      // shadow under figure
      ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.ellipse(cx, cy+ archH*0.26, colW*0.22, 6, 0,0,Math.PI*2); ctx.fill()
      // lower drape / dhoti — with pattern
      const bodyW= colW*0.44, bodyH= h*0.42
      const grad=ctx.createLinearGradient(cx-bodyW/2, cy, cx+bodyW/2, cy)
      grad.addColorStop(0, cloth[1]); grad.addColorStop(0.5, cloth[0]); grad.addColorStop(1, cloth[1])
      ctx.fillStyle=grad
      ctx.beginPath(); ctx.roundRect(cx-bodyW/2, cy+2, bodyW, bodyH*0.56, 4); ctx.fill()
      // pattern on cloth — thin stripes or dots
      ctx.save(); ctx.clip(); ctx.beginPath(); ctx.roundRect(cx-bodyW/2, cy+2, bodyW, bodyH*0.56, 4); ctx.clip()
      if(i%2===0){
        ctx.strokeStyle='rgba(255,255,255,0.18)'; ctx.lineWidth=0.6
        for(let sx=cx-bodyW/2; sx<cx+bodyW/2; sx+=5){ ctx.beginPath(); ctx.moveTo(sx, cy+2); ctx.lineTo(sx-4, cy+2+ bodyH*0.56); ctx.stroke() }
      } else {
        ctx.fillStyle='rgba(255,255,255,0.14)'
        for(let dx=0; dx<bodyW; dx+=8) for(let dy=0; dy<bodyH*0.56; dy+=8) { ctx.beginPath(); ctx.arc(cx-bodyW/2+dx+4, cy+2+dy+4, 1,0,Math.PI*2); ctx.fill() }
      }
      ctx.restore()
      // upper torso / angavastra
      ctx.fillStyle= isDeity? '#5B2A04' : '#3A1A04'
      ctx.beginPath(); ctx.ellipse(cx, cy-2, bodyW*0.33, h*0.11,0,0,Math.PI*2); ctx.fill()
      // gold necklace
      ctx.strokeStyle='#D4AF37'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.ellipse(cx, cy+2, bodyW*0.24, 7,0,0,Math.PI*2); ctx.stroke()
      ctx.fillStyle='#FFD700'; for(let a=-0.6; a<=0.6; a+=0.3){ const nx=cx+Math.sin(a)*bodyW*0.24, ny=cy+2+Math.cos(a)*6; ctx.beginPath(); ctx.arc(nx,ny,1.3,0,Math.PI*2); ctx.fill() }
      // arms
      ctx.strokeStyle=skin; ctx.lineWidth=5; ctx.lineCap='round'
      ctx.beginPath(); ctx.moveTo(cx-bodyW*0.30, cy-2); ctx.lineTo(cx-bodyW*0.42, cy+10); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx+bodyW*0.30, cy-2); ctx.lineTo(cx+bodyW*0.42, cy+10); ctx.stroke()
      // hands
      ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(cx-bodyW*0.42, cy+12, 3.5,0,Math.PI*2); ctx.fill()
      ctx.beginPath(); ctx.arc(cx+bodyW*0.42, cy+12, 3.5,0,Math.PI*2); ctx.fill()
      // hold item
      if(i%3===0){ ctx.fillStyle='#E8A0BF'; ctx.beginPath(); ctx.ellipse(cx+bodyW*0.42, cy+9, 6,4, -0.3,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#C97A9A'; ctx.beginPath(); ctx.ellipse(cx+bodyW*0.42, cy+9, 3,2, -0.3,0,Math.PI*2); ctx.fill() } // lotus
      else if(i%3===1){ ctx.fillStyle='#7AB8E6'; ctx.beginPath(); ctx.ellipse(cx-bodyW*0.42, cy+9, 5,7, 0.2,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1E4A5E'; ctx.beginPath(); ctx.arc(cx-bodyW*0.42, cy+6, 2,0,Math.PI*2); ctx.fill() } // peacock / parrot
      // head
      ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(cx, cy - h*0.24, colW*0.115, 0,Math.PI*2); ctx.fill()
      // hair / crown base
      ctx.fillStyle='#1A0A04'; ctx.beginPath(); ctx.arc(cx, cy - h*0.28, colW*0.118, Math.PI, 0); ctx.fill()
      // crown — gold with gem
      const crownH= h*0.09
      ctx.fillStyle='#C9A24A'; ctx.beginPath(); ctx.moveTo(cx-colW*0.11, cy - h*0.28); ctx.lineTo(cx+colW*0.11, cy - h*0.28); ctx.lineTo(cx+colW*0.08, cy - h*0.28 - crownH); ctx.lineTo(cx-colW*0.08, cy - h*0.28 - crownH); ctx.closePath(); ctx.fill()
      ctx.fillStyle='#FFD700'; ctx.fillRect(cx-colW*0.11, cy - h*0.28, colW*0.22, 2)
      ctx.fillStyle='#B71C1C'; ctx.beginPath(); ctx.arc(cx, cy - h*0.28 - crownH*0.45, 3,0,Math.PI*2); ctx.fill()
      ctx.strokeStyle='rgba(255,255,255,0.55)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.arc(cx, cy - h*0.28 - crownH*0.45, 3, -0.6,1.2); ctx.stroke()
      // eyes
      ctx.fillStyle='#1A0A04'; ctx.beginPath(); ctx.arc(cx-3.2, cy - h*0.245, 1.1,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+3.2, cy - h*0.245, 1.1,0,Math.PI*2); ctx.fill()
      // tilak / bindi
      if(isDeity){ ctx.fillStyle='#B71C1C'; ctx.fillRect(cx-0.8, cy - h*0.255, 1.6, 5); ctx.fillStyle='#FFD700'; ctx.fillRect(cx-0.8, cy - h*0.255+1.5, 1.6, 0.7) } else { ctx.fillStyle='#B71C1C'; ctx.beginPath(); ctx.arc(cx, cy - h*0.252, 2,0,Math.PI*2); ctx.fill() }
      // earrings
      ctx.fillStyle='#D4AF37'; ctx.beginPath(); ctx.arc(cx-colW*0.105, cy - h*0.24, 2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+colW*0.105, cy - h*0.24, 2,0,Math.PI*2); ctx.fill()
      // halo behind head
      ctx.strokeStyle='rgba(255,215,110,0.22)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx, cy - h*0.24, colW*0.145,0,Math.PI*2); ctx.stroke()
    }
    // corner diamonds
    ctx.fillStyle='#FFD97A';
    for(const cx of [20, W-20]) for(const cy of [y0+16, y0+h-16]){
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.PI/4); ctx.fillRect(-7,-7,14,14); ctx.fillStyle='#B71C1C'; ctx.fillRect(-3,-3,6,6); ctx.restore(); ctx.fillStyle='#FFD97A'
    }
    // gold dot frieze along top edge of border
    ctx.fillStyle='#FFD97A'
    for(let x=36;x<W-36;x+=36){ ctx.beginPath(); ctx.arc(x, y0+9, 2,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x, y0+h-9, 2,0,Math.PI*2); ctx.fill() }
    // paint chipping — expose wood at random edge spots
    ctx.fillStyle='#5A1D06'
    for(let k=0;k<10;k++){
      const x= Math.random()*(W-40)+20, y=y0+ (Math.random()<0.5? 2: h-6)
      const w= 4+Math.random()*10, h2= 2+Math.random()*3
      ctx.globalAlpha=0.28+Math.random()*0.22
      ctx.beginPath(); ctx.ellipse(x,y,w,h2,0,0,Math.PI*2); ctx.fill()
    }
    ctx.globalAlpha=1
  }
  drawBorder(0,bh); drawBorder(H-bh,bh)
  // holes with gold eyelet + crack
  for(const hx of [W*0.30, W*0.70]){
    const hy=H/2
    ctx.fillStyle='rgba(0,0,0,0.30)'; ctx.beginPath(); ctx.ellipse(hx+2,hy+2,19,16,0,0,Math.PI*2); ctx.fill()
    ctx.fillStyle='#1E0F06'; ctx.beginPath(); ctx.ellipse(hx,hy,18,15,0,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle='#C9A24A'; ctx.lineWidth=2.4; ctx.beginPath(); ctx.ellipse(hx,hy,13.5,11.5,0,0,Math.PI*2); ctx.stroke()
    ctx.strokeStyle='rgba(255,238,170,0.42)'; ctx.lineWidth=1; ctx.beginPath(); ctx.ellipse(hx,hy,13.5,11.5,-0.8,0.4,1.6); ctx.stroke()
    ctx.fillStyle='#0B0402'; ctx.beginPath(); ctx.ellipse(hx,hy,9,7.5,0,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle='rgba(80,30,10,0.18)'; ctx.lineWidth=0.7; ctx.beginPath(); ctx.moveTo(hx+13,hy-3); ctx.lineTo(hx+20,hy-6); ctx.stroke()
  }
  // overall craquelure — fine cracks across wood
  ctx.strokeStyle='rgba(20,8,2,0.09)'; ctx.lineWidth=0.5
  for(let i=0;i<26;i++){
    const x=Math.random()*W, y= bh+14+Math.random()*ih
    ctx.beginPath(); ctx.moveTo(x,y)
    let cx=x, cy=y
    for(let s=0;s<4;s++){ cx+=(Math.random()-0.5)*18; cy+=(Math.random()-0.5)*10; ctx.lineTo(cx,cy) }
    ctx.stroke()
  }
  // vignette
  const vig=ctx.createRadialGradient(W/2,H/2, H*0.42, W/2,H/2, W*0.82)
  vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(0,0,0,0.30)')
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)
  const tex=new THREE.CanvasTexture(canvas); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=8; tex.needsUpdate=true; return tex
}

function PothiScene({ leafTextures, plainTexture, topCoverMap, bottomCoverMap, activeIndex, progress, scrollVisible }){
  const groupRef=useRef(null), floatingLeafRef=useRef(null), stackRef=useRef(null)
  const leafSideMat=useMemo(()=> new THREE.MeshStandardMaterial({ color:'#E6C78E', roughness:0.88 }),[])
  const cordMat=useMemo(()=> new THREE.MeshStandardMaterial({ color:'#EAE0C2', roughness:0.95 }),[])
  useEffect(()=>()=>{ leafSideMat.dispose(); cordMat.dispose() },[leafSideMat,cordMat])
  const eased=useMemo(()=> progress<0.5? 4*progress*progress*progress : 1-Math.pow(-2*progress+2,3)/2 ,[progress])
  useFrame((state,dt)=>{
    const t=state.clock.getElapsedTime(); if(!groupRef.current) return
    const floatY=Math.sin(t*0.55)*0.032, floatX=Math.sin(t*0.32)*0.012
    if(stackRef.current){ const sf= scrollVisible && progress<0.14 ? floatY*0.24 : 0; stackRef.current.position.y=THREE.MathUtils.damp(stackRef.current.position.y, sf, 2.2, dt); stackRef.current.rotation.y=THREE.MathUtils.damp(stackRef.current.rotation.y, Math.sin(t*0.22)*0.035, 1.0, dt) }
    groupRef.current.position.x=THREE.MathUtils.damp(groupRef.current.position.x, floatX, 1.2, dt)
    if(floatingLeafRef.current){
      const p=eased
      const baseY=(STACK_COUNT-1)*STACK_GAP+0.065
      const liftY=baseY + THREE.MathUtils.lerp(0,0.62,p)+Math.sin(p*Math.PI)*0.10
      const fwdZ=THREE.MathUtils.lerp(0,0.98,p)+Math.sin(p*Math.PI)*0.10
      const tx=floatX*(1-p*0.6)
      floatingLeafRef.current.position.y=THREE.MathUtils.damp(floatingLeafRef.current.position.y, liftY, 4.4, dt)
      floatingLeafRef.current.position.z=THREE.MathUtils.damp(floatingLeafRef.current.position.z, fwdZ, 4.4, dt)
      floatingLeafRef.current.position.x=THREE.MathUtils.damp(floatingLeafRef.current.position.x, tx, 3.2, dt)
      const rotX=THREE.MathUtils.lerp(0,-0.88,p)+Math.sin(p*Math.PI)*-0.05
      floatingLeafRef.current.rotation.x=THREE.MathUtils.damp(floatingLeafRef.current.rotation.x, rotX, 4.4, dt)
      floatingLeafRef.current.rotation.y=THREE.MathUtils.damp(floatingLeafRef.current.rotation.y, Math.sin(p*Math.PI)*0.04, 3.2, dt)
      floatingLeafRef.current.rotation.z=Math.sin(p*Math.PI)*0.025
      const sc=THREE.MathUtils.lerp(1,1.32,p)
      const s=THREE.MathUtils.damp(floatingLeafRef.current.scale.x, sc, 4.0, dt); floatingLeafRef.current.scale.setScalar(s)
    }
  })
  const activeTex=leafTextures[activeIndex%leafTextures.length]
  const topY=(STACK_COUNT-1)*STACK_GAP+0.065
  return (
    <group ref={groupRef} position={[0,-0.06,0]}>
      <group ref={stackRef}>
        {/* bottom patta */}
        <mesh position={[0, -STACK_COUNT*STACK_GAP*0.5+0.02, 0]}>
          <boxGeometry args={[LEAF_W+0.26, 0.145, LEAF_D+0.20]} />
          <meshStandardMaterial map={bottomCoverMap} roughness={0.60} metalness={0.02} />
        </mesh>
        <mesh position={[0, -STACK_COUNT*STACK_GAP*0.5+0.098, 0]}>
          <boxGeometry args={[LEAF_W+0.28, 0.016, LEAF_D+0.22]} />
          <meshStandardMaterial color='#C9A24A' roughness={0.34} metalness={0.42} />
        </mesh>
        {/* stack */}
        {Array.from({ length: STACK_COUNT }).map((_,i)=>{
          const isTop=i===STACK_COUNT-1, hidden=isTop && progress>0.07
          const y= i*STACK_GAP - STACK_COUNT*STACK_GAP*0.5 + 0.12
          const rx= (Math.sin(i*0.9)*0.010) + (Math.random()-0.5)*0.006
          const rz= Math.sin(i*1.7)*0.007 + (Math.random()-0.5)*0.004
          const shade= 0.88 + Math.sin(i*2.1)*0.06
          // vary leaf tone slightly
          const tone = `hsl(38, ${42+Math.sin(i*1.3)*6}%, ${72+Math.sin(i*0.7)*4}%)`
          return (
            <group key={i} position={[rx,y,rz]} visible={!hidden}>
              <mesh>
                <boxGeometry args={[LEAF_W, LEAF_H, LEAF_D]} />
                <meshStandardMaterial attach='material-0' color='#8A4E1E' roughness={0.92} />
                <meshStandardMaterial attach='material-1' color='#8A4E1E' roughness={0.92} />
                <meshStandardMaterial attach='material-2' map={plainTexture} roughness={0.84} metalness={0.01} />
                <meshStandardMaterial attach='material-3' map={plainTexture} roughness={0.84} metalness={0.01} />
                <meshStandardMaterial attach='material-4' color={tone} roughness={0.90} />
                <meshStandardMaterial attach='material-5' color={tone} roughness={0.90} />
              </mesh>
              {/* side edge dark line to emphasize layers */}
              <mesh position={[0, -LEAF_H*0.48, 0]}>
                <planeGeometry args={[LEAF_W*0.98, 0.008]} />
                <meshBasicMaterial color='#5A2E0A' transparent opacity={0.55*shade} depthWrite={false} />
              </mesh>
              <mesh position={[LEAF_W*0.20, LEAF_H*0.62, 0]}><cylinderGeometry args={[0.024,0.024,LEAF_H+0.008,14]} /><meshStandardMaterial color='#140700' roughness={1} /></mesh>
              <mesh position={[LEAF_W*-0.20, LEAF_H*0.62, 0]}><cylinderGeometry args={[0.024,0.024,LEAF_H+0.008,14]} /><meshStandardMaterial color='#140700' roughness={1} /></mesh>
            </group>
          )
        })}
        {/* top patta */}
        <mesh position={[0, topY+0.085, 0]}>
          <boxGeometry args={[LEAF_W+0.26, 0.145, LEAF_D+0.20]} />
          <meshStandardMaterial map={topCoverMap} roughness={0.60} metalness={0.02} />
        </mesh>
        {/* cords */}
        {[0.91,-0.91].map(xOff=>(
          <group key={xOff} position={[xOff, topY+0.16, 0]}>
            <mesh position={[0,0.014,0]}><boxGeometry args={[0.048,0.022,LEAF_D+0.06]} /><meshStandardMaterial color='#F5E6C2' roughness={0.96} /></mesh>
            <mesh position={[0,0.048,0]}><sphereGeometry args={[0.058,14,12]} /><meshStandardMaterial color='#F5E6C2' roughness={0.90} /></mesh>
            {/* tassels — 3 threads */}
            <mesh position={[0,-0.20,LEAF_D*0.52]}><cylinderGeometry args={[0.015,0.015,0.48,8]} /><meshStandardMaterial color='#F5E6C2' roughness={0.96} /></mesh>
            <mesh position={[0.038,-0.19,LEAF_D*0.52]}><cylinderGeometry args={[0.013,0.013,0.44,8]} /><meshStandardMaterial color='#EAD8B0' roughness={0.96} /></mesh>
            <mesh position={[-0.028,-0.195,LEAF_D*0.52]}><cylinderGeometry args={[0.012,0.012,0.42,8]} /><meshStandardMaterial color='#E2C9A0' roughness={0.96} /></mesh>
            <mesh position={[0,-0.44,LEAF_D*0.52]}><sphereGeometry args={[0.030,10,8]} /><meshStandardMaterial color='#8A4E1E' roughness={0.68} /></mesh>
            <mesh position={[0.018,-0.41,LEAF_D*0.52]}><sphereGeometry args={[0.020,10,8]} /><meshStandardMaterial color='#6B3A14' roughness={0.68} /></mesh>
          </group>
        ))}
      </group>
      {/* floating leaf */}
      <group ref={floatingLeafRef} position={[0, topY, 0]}>
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.96 - eased*0.18, -0.12]}>
          <planeGeometry args={[3.4,1.7]} />
          <meshBasicMaterial color='#1A0F02' transparent opacity={0.17*(1-eased*0.52)} depthWrite={false} />
        </mesh>
        <mesh>
          <boxGeometry args={[LEAF_W, LEAF_H*1.45, LEAF_D]} />
          <meshStandardMaterial attach='material-0' color='#8A4E1E' roughness={0.92} />
          <meshStandardMaterial attach='material-1' color='#8A4E1E' roughness={0.92} />
          <meshStandardMaterial attach='material-2' map={activeTex} roughness={0.70} metalness={0.015} />
          <meshStandardMaterial attach='material-3' map={activeTex} roughness={0.70} metalness={0.015} />
          <meshStandardMaterial attach='material-4' color='#E6C78E' roughness={0.90} />
          <meshStandardMaterial attach='material-5' color='#E6C78E' roughness={0.90} />
        </mesh>
        {[-0.91,0.91].map(x=>(
          <mesh key={x} position={[x, LEAF_H*0.82, 0]} rotation={[Math.PI/2,0,0]}>
            <torusGeometry args={[0.058,0.013,12,20]} />
            <meshStandardMaterial color='#8A3D12' roughness={0.52} metalness={0.22} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function ManuscriptFallback({ verse, onNext }){
  return (
    <div className='pothi-fallback'>
      <div className='pothi-fallback-frame'>
        <div className='pothi-fallback-leaf'>
          <span className='pothi-fallback-src'>{verse.source}</span>
          <p className='pothi-fallback-deva'>{verse.devanagari}</p>
          <span className='pothi-fallback-rule' aria-hidden='true' />
          <p className='pothi-fallback-meaning'>{verse.meaning}</p>
          <i className='pothi-hole' style={{ left:'30%' }} /><i className='pothi-hole' style={{ left:'70%' }} />
        </div>
      </div>
      <button className='pothi-fallback-next' onClick={onNext}>अगला श्लोक · Next →</button>
    </div>
  )
}

export default function ScriptureBook(){
  const [active,setActive]=useState(0), [progress,setProgress]=useState(0), [visible,setVisible]=useState(true), [webglFailed,setWebglFailed]=useState(false), [revealed,setRevealed]=useState(false)
  const exhibitRef=useRef(null), startRef=useRef(performance.now())
  const { leafTextures, plainTexture, topCoverMap, bottomCoverMap, allTextures }=useMemo(()=>{
    const leaves=verses.map((v,i)=> drawPalmLeafTexture(v,i+1)); const plain=drawPlainLeafTexture(); const top=drawPaintedPatta(true); const bottom=drawPaintedPatta(false)
    return { leafTextures:leaves, plainTexture:plain, topCoverMap:top, bottomCoverMap:bottom, allTextures:[...leaves, plain, top, bottom] }
  },[])
  useEffect(()=>()=>{ for(const t of allTextures) t.dispose() },[allTextures])
  useEffect(()=>{ if(REDUCED) return; const id=setInterval(()=>{ setActive(p=>(p+1)%verses.length); startRef.current=performance.now() },PAGE_TIME); return()=>clearInterval(id)},[])
  useEffect(()=>{ if(REDUCED){ setProgress(1); return } let raf=0; const loop=()=>{ const p=Math.min((performance.now()-startRef.current)/TURN_TIME,1); setProgress(p); raf=requestAnimationFrame(loop) }; raf=requestAnimationFrame(loop); return()=>cancelAnimationFrame(raf)},[active])
  useEffect(()=>{ startRef.current=performance.now() },[active])
  useEffect(()=>{ const el=exhibitRef.current; if(!el) return; const obs=new IntersectionObserver(([e])=> setVisible(e.isIntersecting),{ threshold:0, rootMargin:'120px'}); obs.observe(el); return()=>obs.disconnect()},[])
  useEffect(()=>{ const n=exhibitRef.current; if(!n){ setRevealed(true); return } let done=false; const trig=()=>{ if(!done){ done=true; setRevealed(true)}}; const o=new IntersectionObserver(([e])=>{ if(e.isIntersecting){ trig(); o.disconnect() }},{ threshold:0.08}); o.observe(n); const t=setTimeout(trig,900); return()=>{ o.disconnect(); clearTimeout(t)} },[])
  const handleCanvasError=useCallback(()=> setWebglFailed(true),[])
  const canRender3D=!webglFailed && typeof window!=='undefined'
  useEffect(()=>{ try{ const c=document.createElement('canvas'); const gl=c.getContext('webgl')||c.getContext('experimental-webgl'); if(!gl) setWebglFailed(true)} catch{ setWebglFailed(true)} },[])
  const current=verses[active]
  const nextPage=useCallback(()=>{ setActive(p=>(p+1)%verses.length); startRef.current=performance.now() },[])
  const prevPage=useCallback(()=>{ setActive(p=> (p-1+verses.length)%verses.length); startRef.current=performance.now() },[])
  const [isFullscreen,setIsFullscreen]=useState(false)
  const fsRef=useRef(null)
  const [touchX,setTouchX]=useState(null)
  const [typedDeva,setTypedDeva]=useState(verses[0].devanagari)
  const [typedMeaning,setTypedMeaning]=useState(verses[0].meaning)
  // typewriter — ChatGPT style, word by word over the old manuscript image (inclined)
  useEffect(()=>{
    if(!isFullscreen){
      setTypedDeva(current.devanagari)
      setTypedMeaning(current.meaning)
      return
    }
    setTypedDeva('')
    setTypedMeaning('')
    let cancelled=false
    const devaChars=Array.from(current.devanagari)
    const meaningChars=Array.from(current.meaning)
    let di=0
    const tick=()=>{
      if(cancelled) return
      if(di < devaChars.length){
        di+=1
        setTypedDeva(devaChars.slice(0,di).join(''))
        setTimeout(tick, 42)
      } else {
        // then type meaning
        let mi=0
        const mTick=()=>{
          if(cancelled) return
          if(mi < meaningChars.length){
            mi+=1
            setTypedMeaning(meaningChars.slice(0,mi).join(''))
            setTimeout(mTick, 18)
          }
        }
        setTimeout(mTick, 280)
      }
    }
    const startDelay=setTimeout(tick, 260)
    return()=>{ cancelled=true; clearTimeout(startDelay) }
  },[active, isFullscreen, current.devanagari, current.meaning])
  const openFullscreen=useCallback(()=>{
    setIsFullscreen(true)
    startRef.current=performance.now()
    setProgress(1)
    // try native fullscreen
    setTimeout(()=>{
      try{ fsRef.current?.requestFullscreen?.() }catch{}
    },80)
  },[])
  const closeFullscreen=useCallback(()=>{
    setIsFullscreen(false)
    try{ if(document.fullscreenElement) document.exitFullscreen?.() }catch{}
    startRef.current=performance.now()
  },[])

  // keyboard + body lock + native fullscreen sync
  useEffect(()=>{
    if(!isFullscreen) return
    const onKey=(e)=>{
      if(e.key==='Escape') closeFullscreen()
      if(e.key==='ArrowRight') nextPage()
      if(e.key==='ArrowLeft') prevPage()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const onFsChange=()=>{ if(!document.fullscreenElement && isFullscreen){ /* keep overlay if user exits native fs via Esc — still close our overlay */ } }
    document.addEventListener('fullscreenchange', onFsChange)
    return()=>{
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow=prevOverflow
      document.removeEventListener('fullscreenchange', onFsChange)
    }
  },[isFullscreen, closeFullscreen, nextPage, prevPage])

  const handleFsTouchStart=(e)=> setTouchX(e.touches[0].clientX)
  const handleFsTouchEnd=(e)=>{
    if(touchX==null) return
    const dx=e.changedTouches[0].clientX - touchX
    if(Math.abs(dx)>48){
      if(dx<0) nextPage(); else prevPage()
    }
    setTouchX(null)
  }

  return (
    <>
    <div className={`scripture-exhibit pothi-exhibit ${revealed?'is-open is-zoomed is-revealed':''}`} ref={exhibitRef} aria-label='Ancient palm-leaf manuscript'>
      <div className='pothi-scene-wrap'>
        {!canRender3D? <ManuscriptFallback verse={current} onNext={nextPage} /> : (
          <>
            <Canvas dpr={[1,1.7]} frameloop={visible?'always':'never'} camera={{ position:[0,1.28,5.85], fov:36 }} gl={{ antialias:true, alpha:true, powerPreference:'high-performance' }} shadows={false} onCreated={({gl})=>{ gl.setClearColor(0x000000,0); gl.toneMapping=THREE.ACESFilmicToneMapping; gl.toneMappingExposure=1.08 }} onError={handleCanvasError} className='pothi-canvas' style={{ width:'100%', height:'100%', display:'block' }}>
              <ambientLight intensity={1.08} color='#FFF2DC' />
              <directionalLight position={[4,6,4]} intensity={1.9} color='#FFE9C2' />
              <directionalLight position={[-3.5,3.5,-2]} intensity={0.58} color='#C8A87A' />
              <pointLight position={[0,3.2,2]} intensity={13} distance={10} decay={1.6} color='#FFD37A' />
              <pointLight position={[-4,1.2,-1]} intensity={6} distance={9} decay={2} color='#FF8C42' />
              <hemisphereLight args={['#FFE8C0','#4A2E0A',0.36]} />
              <ContactShadows position={[0,-0.96,0]} opacity={0.44} scale={10.5} blur={2.9} far={3.4} color='#1A0F02' />
              <PothiScene leafTextures={leafTextures} plainTexture={plainTexture} topCoverMap={topCoverMap} bottomCoverMap={bottomCoverMap} activeIndex={active} progress={progress} scrollVisible={revealed} />
            </Canvas>
            <button className='pothi-tap-target' onClick={openFullscreen} aria-label='Open fullscreen manuscript reader — tap leaf to read' title='पूरा पर्दा में पढ़ें — tap to read fullscreen' />
            <button className='pothi-fs-enter' onClick={openFullscreen} aria-label='Open fullscreen reader'>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3'/></svg>
              <span>Full screen</span>
            </button>
            <div className='pothi-ui'>
              <span className='pothi-folio'>folio {String(active+1).padStart(2,'0')} / {String(verses.length).padStart(2,'0')} · {current.source}</span>
              <div className='pothi-dots' role='tablist' aria-label='Choose verse'>
                {verses.map((_,i)=> <button key={i} role='tab' aria-selected={i===active} aria-label={`Shloka ${i+1}`} className={`pothi-dot ${i===active?'is-active':''}`} onClick={()=>{ setActive(i); startRef.current=performance.now() }} />)}
              </div>
            </div>
            <span className={`sb-hint pothi-hint ${active>0?'is-gone':''}`}>पत्ते पर टैप करें · tap leaf for next श्लोक</span>
          </>
        )}
      </div>
      <div className='pothi-caption'>
        <span className='pothi-caption-kicker'>{current.source}</span>
        <p className='pothi-caption-deva'>{current.devanagari}</p>
        <p className='pothi-caption-meaning'>{current.meaning}</p>
        <div className='pothi-caption-actions'>
          <button className='pothi-caption-next' onClick={nextPage}>अगला श्लोक <i aria-hidden>↗</i></button>
          <button className='pothi-caption-fs' onClick={openFullscreen} aria-label='Open fullscreen manuscript reader'>⛶ Full screen पढ़ें</button>
        </div>
      </div>
    </div>

    {/* Fullscreen palm-leaf reader */}
    {isFullscreen && (
      <div className='pothi-fullscreen' ref={fsRef} role='dialog' aria-modal='true' aria-label='Fullscreen palm-leaf manuscript reader' onTouchStart={handleFsTouchStart} onTouchEnd={handleFsTouchEnd}>
        <div className='pothi-fs-backdrop' onClick={closeFullscreen} aria-hidden='true' />
        <div className='pothi-fs-shell'>
          <div className='pothi-fs-topbar'>
            <span className='pothi-fs-title'>ॐ · {current.source}</span>
            <span className='pothi-fs-count'>पृष्ठ {active+1} / {verses.length}</span>
            <button className='pothi-fs-close' onClick={closeFullscreen} aria-label='Close fullscreen (Esc)'>
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'><path d='M18 6L6 18M6 6l12 12'/></svg>
              <span>Close</span>
            </button>
          </div>

          <div className='pothi-fs-stage'>
            <button className='pothi-fs-arrow is-prev' onClick={prevPage} aria-label='Previous shloka (←)'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M15 18l-6-6 6-6'/></svg>
            </button>

            <div className='pothi-fs-leaf-wrap'>
              <div className='pothi-fs-leaf-behind' style={{ backgroundImage: `url(${oldManuscriptBg})` }} aria-hidden='true' />
              <div className='pothi-fs-leaf-shadow' aria-hidden='true' />
              <div className='pothi-fs-leaf is-inclined' style={{ backgroundImage: `url(${oldManuscriptBg})` }} role='document' aria-label={`${current.source} — ${current.devanagari}`}>
                <div className='pothi-fs-leaf-inner'>
                  <span className='pothi-fs-src'>{current.source}</span>
                  <div className='pothi-fs-rule' aria-hidden='true' />
                  <p className='pothi-fs-deva'>{typedDeva}<span className={`pothi-type-cursor ${typedDeva.length < current.devanagari.length ? 'is-typing' : 'is-done'}`} aria-hidden='true'>▌</span></p>
                  <div className='pothi-fs-rule' aria-hidden='true' />
                  <p className='pothi-fs-meaning'>{typedMeaning}{typedDeva.length >= current.devanagari.length && typedMeaning.length < current.meaning.length ? <span className='pothi-type-cursor is-typing' aria-hidden='true'>▌</span> : null}</p>
                  <span className='pothi-fs-folio'>॥ {active+1} ॥</span>
                  <i className='pothi-fs-hole' style={{ left:'30%' }} aria-hidden='true' />
                  <i className='pothi-fs-hole' style={{ left:'70%' }} aria-hidden='true' />
                  <span className='pothi-fs-om' aria-hidden='true'>ॐ</span>
                </div>
              </div>
            </div>

            <button className='pothi-fs-arrow is-next' onClick={nextPage} aria-label='Next shloka (→)'>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M9 18l6-6-6-6'/></svg>
            </button>
          </div>

          <div className='pothi-fs-bottom'>
            <div className='pothi-fs-dots' role='tablist' aria-label='Choose shloka'>
              {verses.map((_,i)=>(
                <button key={i} role='tab' aria-selected={i===active} aria-label={`Go to shloka ${i+1}`} className={`pothi-fs-dot ${i===active?'is-active':''}`} onClick={()=>{ setActive(i); startRef.current=performance.now() }} />
              ))}
            </div>
            <span className='pothi-fs-hint'>← → to change · swipe · Esc to close</span>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
