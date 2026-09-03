import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'

// ---------------------------------------------------------------------------
//  Verses — same content, now shown on real palm leaves (tadpatra)
// ---------------------------------------------------------------------------
const verses = [
  {
    source: 'Bhagavad Gita · 2.47',
    devanagari: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    meaning: 'Your right is to action alone, never to its fruits — act without attachment, and never rest in inaction.',
  },
  {
    source: 'Bhagavad Gita · 2.20',
    devanagari: 'न जायते म्रियते वा कदाचिन्नायं भूत्वा भविता वा न भूयः। अजो नित्यः शाश्वतोऽयं पुराणो न हन्यते हन्यमाने शरीरे॥',
    meaning: 'The soul is never born, nor does it ever die — unborn, eternal, it is not slain when the body is slain.',
  },
  {
    source: 'Bhagavad Gita · 4.7',
    devanagari: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    meaning: 'Whenever righteousness fades and unrighteousness rises, I manifest Myself in every age.',
  },
  {
    source: 'Bhagavad Gita · 18.66',
    devanagari: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    meaning: 'Abandon all duties and come to Me alone for refuge — I shall free you from every sin; do not grieve.',
  },
  {
    source: 'Ramcharitmanas · 1.1',
    devanagari: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥',
    meaning: 'Polishing the mirror of my mind with the dust of the Guru’s lotus feet, I sing the spotless glory of Sri Ram.',
  },
  {
    source: 'Ramcharitmanas · Doha',
    devanagari: 'धीरज धर्म मित्र अरु नारी। आपद काल परहिं जो चारी॥',
    meaning: 'Patience, virtue, a true friend and a devoted wife — these four stay with you in the hour of calamity.',
  },
  {
    source: 'Ramcharitmanas · Aranya Kand 35',
    devanagari: 'सियाराममय सब जग जानी। करहुँ प्रनाम जोरि जुग पानी॥',
    meaning: 'Knowing all the world to be filled with Sita and Ram, I bow to every being with folded hands.',
  },
  {
    source: 'Ramcharitmanas · Doha',
    devanagari: 'बिनु सतसंग बिबेक न होई। राम कृपाँ बिनु सुलभ न सोई॥',
    meaning: 'Without satsang there is no true wisdom, and without Ram’s grace it is never easily won.',
  },
]

const PAGE_TIME = 5200
const TURN_TIME = 1400
const LEAF_W = 4.4 // world units — pothi is horizontal, wide
const LEAF_D = 1.22
const LEAF_H = 0.042
const STACK_GAP = 0.038
const STACK_COUNT = 16 // visually stacked leaves under the top patta

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ---------------------------------------------------------------------------
//  Canvas texture helpers
// ---------------------------------------------------------------------------
const SANS_DEVA = '"Noto Sans Devanagari","Nirmala UI","Mangal",serif'

function makeCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  // high quality text
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  return [c, ctx]
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = test
  }
  if (line) lines.push(line)
  return lines
}

// Palm-leaf (tadpatra) — aged straw leaf with ruled ink lines + central verse
function drawPalmLeafTexture(verse, folioNum) {
  const W = 1680
  const H = 520
  const [canvas, ctx] = makeCanvas(W, H)

  // --- base palm gradient (horizontal fibres) ---
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#D7B46A')
  bg.addColorStop(0.18, '#EACD95')
  bg.addColorStop(0.45, '#F0DCB0')
  bg.addColorStop(0.72, '#E6C78E')
  bg.addColorStop(1, '#C9A86A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // fine horizontal fibre lines
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#8A5A14'
  for (let y = 0; y < H; y += 3) {
    const jitter = (Math.sin(y * 0.37) * 0.6 + Math.random() * 0.4)
    ctx.fillRect(0, y + jitter, W, 0.7)
  }
  ctx.globalAlpha = 1

  // edge darkening + worn border
  const edgeGradT = ctx.createLinearGradient(0, 0, 0, 42)
  edgeGradT.addColorStop(0, 'rgba(92,54,10,0.55)')
  edgeGradT.addColorStop(1, 'rgba(92,54,10,0)')
  ctx.fillStyle = edgeGradT
  ctx.fillRect(0, 0, W, 42)
  const edgeGradB = ctx.createLinearGradient(0, H - 42, 0, H)
  edgeGradB.addColorStop(0, 'rgba(92,54,10,0)')
  edgeGradB.addColorStop(1, 'rgba(92,54,10,0.52)')
  ctx.fillStyle = edgeGradB
  ctx.fillRect(0, H - 42, W, 42)
  // left / right worn
  ctx.fillStyle = 'rgba(92,54,10,0.18)'
  ctx.fillRect(0, 0, 18, H)
  ctx.fillRect(W - 18, 0, 18, H)

  // random age spots & stains
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = Math.random() * 10 + 2
    ctx.fillStyle = `rgba(110,78,28,${0.035 + Math.random() * 0.055})`
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // central ruled ink lines (two thin red lines top/bot like original pothi)
  ctx.strokeStyle = 'rgba(135, 32, 22, 0.42)'
  ctx.lineWidth = 1.2
  // upper rule
  ctx.beginPath()
  ctx.moveTo(90, 112)
  ctx.lineTo(W - 90, 112)
  ctx.stroke()
  // lower rule
  ctx.beginPath()
  ctx.moveTo(90, H - 108)
  ctx.lineTo(W - 90, H - 108)
  ctx.stroke()
  // faint second lines (less prominent)
  ctx.strokeStyle = 'rgba(135,32,22,0.18)'
  ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(90, 118)
  ctx.lineTo(W - 90, 118)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(90, H - 102)
  ctx.lineTo(W - 90, H - 102)
  ctx.stroke()

  // string holes — two holes with dark rim + shadow
  const holes = [W * 0.30, W * 0.70]
  for (const hx of holes) {
    const hy = H / 2
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.ellipse(hx + 2, hy + 2, 16, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    // hole outer rim (dark wood)
    ctx.fillStyle = '#3A1A08'
    ctx.beginPath()
    ctx.ellipse(hx, hy, 15, 13, 0, 0, Math.PI * 2)
    ctx.fill()
    // inner void
    ctx.fillStyle = '#1A0A04'
    ctx.beginPath()
    ctx.ellipse(hx, hy, 9, 7.5, 0, 0, Math.PI * 2)
    ctx.fill()
    // highlight on rim
    ctx.strokeStyle = 'rgba(255,220,150,0.35)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(hx, hy, 13, 11, 0, -0.6, 0.9)
    ctx.stroke()
  }

  // --- text area (between the two red lines) ---
  // source label (small, golden-brown, centered top inside ruled area)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(122,58,12,0.72)'
  ctx.font = `700 26px ${SANS_DEVA}`
  ctx.fillText(verse.source.toUpperCase(), W / 2, 96)

  // devanagari shloka — large, deep ink black-brown, centered
  ctx.fillStyle = '#1F1206'
  ctx.font = `600 52px ${SANS_DEVA}`
  // shadow under ink for depth (very subtle)
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 0.6
  ctx.shadowOffsetY = 1
  const maxTextW = W - 260 // leave space so text doesn't overlap holes
  const lines = wrapText(ctx, verse.devanagari, maxTextW)
  // vertically centre lines inside the ruled band
  const lineH = 62
  const blockH = lines.length * lineH
  let ty = (H - blockH) / 2 + 22 // +22 optical
  for (const line of lines) {
    ctx.fillText(line, W / 2, ty)
    ty += lineH
  }
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // meaning (English) — small italic under the shloka if single-line
  // (we keep it subtle so leaf stays authentic)
  if (lines.length <= 2) {
    ctx.fillStyle = 'rgba(92,58,14,0.62)'
    ctx.font = `italic 23px Georgia, serif`
    const mLines = wrapText(ctx, verse.meaning, maxTextW - 40)
    // only show first line on leaf to keep realistic
    if (mLines.length) {
      const truncated = mLines[0].length > 78 ? mLines[0].slice(0, 75) + '…' : mLines[0]
      ctx.fillText(truncated, W / 2, H - 68)
    }
  }

  // folio number at bottom-right corner (like original)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(122,58,12,0.55)'
  ctx.font = `600 18px ${SANS_DEVA}`
  ctx.fillText(`॥ ${folioNum} ॥`, W - 34, H - 18)
  ctx.textAlign = 'center'

  // very faint Om watermark in centre behind text
  ctx.save()
  ctx.globalAlpha = 0.045
  ctx.fillStyle = '#6B3200'
  ctx.font = `500 260px ${SANS_DEVA}`
  ctx.textBaseline = 'middle'
  ctx.fillText('ॐ', W / 2, H / 2 + 8)
  ctx.restore()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

// blank / ornament leaf (no verse — just plain aged palm with faint Om)
function drawPlainLeafTexture(seed = 0) {
  const W = 1680
  const H = 520
  const [canvas, ctx] = makeCanvas(W, H)
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#D7B46A')
  bg.addColorStop(0.45, '#F0DCB0')
  bg.addColorStop(1, '#C9A86A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  // fibres
  ctx.globalAlpha = 0.16
  ctx.fillStyle = '#8A5A14'
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y + (Math.random() * 0.5), W, 0.6)
  ctx.globalAlpha = 1
  // stains
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(110,78,28,${0.03 + Math.random() * 0.05})`
    ctx.beginPath()
    ctx.ellipse(Math.random() * W, Math.random() * H, Math.random() * 8 + 2, Math.random() * 5 + 2, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  // ruled lines
  ctx.strokeStyle = 'rgba(135,32,22,0.32)'
  ctx.lineWidth = 1.1
  ctx.beginPath(); ctx.moveTo(90, 112); ctx.lineTo(W - 90, 112); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(90, H - 108); ctx.lineTo(W - 90, H - 108); ctx.stroke()
  // holes
  for (const hx of [W * 0.30, W * 0.70]) {
    ctx.fillStyle = '#3A1A08'
    ctx.beginPath(); ctx.ellipse(hx, H / 2, 15, 13, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1A0A04'
    ctx.beginPath(); ctx.ellipse(hx, H / 2, 9, 7.5, 0, 0, Math.PI * 2); ctx.fill()
  }
  // faint Om
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#6B3200'
  ctx.font = `500 210px ${SANS_DEVA}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ॐ', W / 2, H / 2 + 6)
  ctx.restore()
  // edge dark
  ctx.fillStyle = 'rgba(92,54,10,0.18)'
  ctx.fillRect(0, 0, 18, H)
  ctx.fillRect(W - 18, 0, 18, H)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// Painted wooden patta (top / bottom cover) — mimics the reference image:
// deep reddish wood with thick painted borders top+bottom showing temple figures
function drawPaintedPatta(isTop) {
  const W = 1760
  const H = 560
  const [canvas, ctx] = makeCanvas(W, H)

  // --- wooden base gradient ---
  const wood = ctx.createLinearGradient(0, 0, 0, H)
  wood.addColorStop(0, '#7A2E0A')
  wood.addColorStop(0.25, '#9E3B0E')
  wood.addColorStop(0.5, '#A9440F')
  wood.addColorStop(0.75, '#8A3108')
  wood.addColorStop(1, '#5E2006')
  ctx.fillStyle = wood
  ctx.fillRect(0, 0, W, H)

  // wood grain lines (subtle horizontal)
  ctx.globalAlpha = 0.14
  ctx.strokeStyle = '#3A1504'
  ctx.lineWidth = 0.7
  for (let y = 14; y < H; y += 12) {
    ctx.beginPath()
    const wave = Math.sin(y * 0.018) * 8
    ctx.moveTo(0, y + wave)
    // wavy grain
    for (let x = 0; x < W; x += 90) {
      ctx.lineTo(x, y + Math.sin(x * 0.012 + y * 0.02) * 3 + wave)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // central wood field (slightly lighter) between painted borders
  const borderH = Math.round(H * 0.28) // painted border height
  const innerY = borderH + 10
  const innerH = H - borderH * 2 - 20
  // central plank highlight
  const plank = ctx.createLinearGradient(0, innerY, 0, innerY + innerH)
  plank.addColorStop(0, 'rgba(0,0,0,0.22)')
  plank.addColorStop(0.12, 'rgba(255,220,160,0.06)')
  plank.addColorStop(0.5, 'rgba(255,210,140,0.03)')
  plank.addColorStop(0.88, 'rgba(255,220,160,0.05)')
  plank.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = plank
  ctx.fillRect(10, innerY, W - 20, innerH)

  function drawPaintedBorder(y0, h) {
    // thick golden frame lines
    ctx.fillStyle = '#D9A441'
    ctx.fillRect(0, y0, W, 4)
    ctx.fillRect(0, y0 + h - 4, W, 4)
    // outer red background
    ctx.fillStyle = '#B7210E'
    ctx.fillRect(4, y0 + 4, W - 8, h - 8)
    // inner saffron rectangle
    ctx.fillStyle = '#E85D0A'
    ctx.fillRect(12, y0 + 10, W - 24, h - 20)
    // inner thin gold line
    ctx.strokeStyle = '#FFD37A'
    ctx.lineWidth = 1.4
    ctx.strokeRect(20, y0 + 16, W - 40, h - 32)

    // miniature figures — simplified Indian miniature style
    const cols = 8
    const pad = 44
    const availW = W - pad * 2
    const colW = availW / cols
    // palette for figures
    const clothColors = ['#FEC84B', '#38BDF8', '#4ADE80', '#F472B6', '#A78BFA', '#F87171', '#FB923C', '#34D399']
    for (let i = 0; i < cols; i++) {
      const cx = pad + colW * i + colW / 2
      const cy = y0 + h / 2
      // halo behind figure (faded temple arch)
      ctx.fillStyle = 'rgba(255,248,220,0.18)'
      ctx.beginPath()
      ctx.ellipse(cx, cy + 6, colW * 0.34, h * 0.34, 0, 0, Math.PI * 2)
      ctx.fill()
      // arch outline
      ctx.strokeStyle = 'rgba(255,220,130,0.32)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(cx, cy + 4, colW * 0.30, h * 0.30, 0, 0, Math.PI * 2)
      ctx.stroke()

      // body (dhoti / saree)
      ctx.fillStyle = clothColors[i % clothColors.length]
      const bodyW = colW * 0.36
      const bodyH = h * 0.48
      ctx.beginPath()
      ctx.roundRect(cx - bodyW / 2, cy - bodyH * 0.15, bodyW, bodyH, 4)
      ctx.fill()
      // torso
      ctx.fillStyle = '#5B3305'
      ctx.beginPath()
      ctx.ellipse(cx, cy - 4, bodyW * 0.30, h * 0.13, 0, 0, Math.PI * 2)
      ctx.fill()
      // head
      ctx.fillStyle = '#FFD9A0'
      ctx.beginPath()
      ctx.arc(cx, cy - h * 0.26, colW * 0.11, 0, Math.PI * 2)
      ctx.fill()
      // tilak
      ctx.fillStyle = '#B7210E'
      ctx.fillRect(cx - 1, cy - h * 0.29, 2, 5)
      // crown / turban dot
      ctx.fillStyle = '#FFB300'
      ctx.beginPath()
      ctx.arc(cx, cy - h * 0.33, 4, 0, Math.PI * 2)
      ctx.fill()
      // lotus in hand (small)
      if (i % 2 === 0) {
        ctx.fillStyle = '#F472B6'
        ctx.beginPath()
        ctx.arc(cx + bodyW * 0.32, cy + 4, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // golden corner ornaments
    ctx.fillStyle = '#FFD37A'
    for (const cx of [22, W - 22]) {
      for (const cy of [y0 + 10, y0 + h - 10]) {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-6, -6, 12, 12)
        ctx.restore()
      }
    }
  }

  drawPaintedBorder(0, borderH)
  drawPaintedBorder(H - borderH, borderH)

  // string holes in the cover (two dark holes, same x as leaves)
  for (const hx of [W * 0.30, W * 0.70]) {
    const hy = H / 2
    ctx.fillStyle = 'rgba(0,0,0,0.32)'
    ctx.beginPath()
    ctx.ellipse(hx + 2, hy + 2, 17, 15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1A0A04'
    ctx.beginPath()
    ctx.ellipse(hx, hy, 16, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#2A1206'
    ctx.beginPath()
    ctx.ellipse(hx, hy, 9, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // subtle vignette
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.75)
  vig.addColorStop(0, 'transparent')
  vig.addColorStop(1, 'rgba(0,0,0,0.28)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, W, H)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

// ---------------------------------------------------------------------------
//  3D Pothi scene
// ---------------------------------------------------------------------------
function PothiScene({ leafTextures, plainTexture, topCoverMap, bottomCoverMap, activeIndex, progress, scrollVisible }) {
  const groupRef = useRef(null)
  const floatingLeafRef = useRef(null)
  const stackRef = useRef(null)

  // materials cache
  const leafSideMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E6C78E', roughness: 0.88 }), [])
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8A4E1E', roughness: 0.9 }), [])
  const cordMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#EAE0C2', roughness: 0.95 }), [])
  const woodSideMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6E2E0A', roughness: 0.72 }), [])

  useEffect(() => () => {
    leafSideMat.dispose(); edgeMat.dispose(); cordMat.dispose(); woodSideMat.dispose()
  }, [leafSideMat, edgeMat, cordMat, woodSideMat])

  // progress 0..1 of current page flip arc (ease)
  const easedProgress = useMemo(() => {
    // cubic in-out
    return progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2
  }, [progress])

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime()
    if (!groupRef.current) return

    // gentle breathing float + slow yaw drift of the whole stack (visible when not focused)
    const isFloating = scrollVisible
    const floatY = Math.sin(t * 0.55) * 0.045
    const floatX = Math.sin(t * 0.32) * 0.015

    // when a leaf is levitating, keep stack grounded; otherwise float the whole group
    if (floatingLeafRef.current) {
      // stack floats subtly only when no focus, otherwise stays
      const stackFloat = isFloating && progress < 0.12 ? floatY * 0.35 : 0
      if (stackRef.current) {
        stackRef.current.position.y = THREE.MathUtils.damp(stackRef.current.position.y, stackFloat, 2.2, dt)
      }
    }
    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, floatX, 1.2, dt)

    // floating leaf arc: starts inside stack, rises, tilts toward camera, scales up
    if (floatingLeafRef.current) {
      const p = easedProgress // 0 -> leaf inside stack, 1 -> fully levitated reading position
      // bezier curve for Y
      const liftY = THREE.MathUtils.lerp(0, 1.55, p) + Math.sin(p * Math.PI) * 0.22
      const forwardZ = THREE.MathUtils.lerp(0, 1.55, p) + Math.sin(p * Math.PI) * 0.18
      const targetX = floatX * (1 - p * 0.6)

      floatingLeafRef.current.position.y = THREE.MathUtils.damp(floatingLeafRef.current.position.y, liftY, 4.2, dt)
      floatingLeafRef.current.position.z = THREE.MathUtils.damp(floatingLeafRef.current.position.z, forwardZ, 4.2, dt)
      floatingLeafRef.current.position.x = THREE.MathUtils.damp(floatingLeafRef.current.position.x, targetX, 3.2, dt)

      // rotation: 0 (flat in stack) -> -0.92 rad (~ -53deg) to face camera while still horizontal-ish
      const targetRotX = THREE.MathUtils.lerp(0, -0.88, p) + Math.sin(p * Math.PI) * -0.08
      floatingLeafRef.current.rotation.x = THREE.MathUtils.damp(floatingLeafRef.current.rotation.x, targetRotX, 4.2, dt)
      // slight yaw to keep centred
      floatingLeafRef.current.rotation.y = THREE.MathUtils.damp(floatingLeafRef.current.rotation.y, Math.sin(p * Math.PI) * 0.06, 3.2, dt)
      // curl easing
      const curl = Math.sin(p * Math.PI) * 0.04
      floatingLeafRef.current.rotation.z = curl

      // scale up as it comes forward (readable)
      const scale = THREE.MathUtils.lerp(1, 1.42, p)
      const s = THREE.MathUtils.damp(floatingLeafRef.current.scale.x, scale, 4.0, dt)
      floatingLeafRef.current.scale.setScalar(s)

      // shadow opacity tied to height
      floatingLeafRef.current.traverse((child) => {
        if (child.isMesh && child.material && child.material.opacity !== undefined) {
          // keep leaf opaque
        }
      })
    }

    // subtle stack yaw oscillation when idle
    if (stackRef.current) {
      stackRef.current.rotation.y = THREE.MathUtils.damp(stackRef.current.rotation.y, Math.sin(t * 0.22) * 0.05, 1.0, dt)
    }
  })

  const activeTexture = leafTextures[activeIndex % leafTextures.length]

  // y of active leaf inside the stack (so we can hide that single leaf in the pile)
  const activeStackY = (STACK_COUNT - 1) * STACK_GAP + 0.065 // top of pile baseline

  return (
    <group ref={groupRef} position={[0, -0.18, 0]}>
      {/* stack group — the pile that stays */}
      <group ref={stackRef}>
        {/* bottom patta */}
        <mesh position={[0, -STACK_COUNT * STACK_GAP * 0.5 + 0.02, 0]}>
          <boxGeometry args={[LEAF_W + 0.22, 0.13, LEAF_D + 0.18]} />
          <meshStandardMaterial map={bottomCoverMap} roughness={0.62} metalness={0.02} />
        </mesh>
        {/* thin gold edge lines on bottom patta (extra quads) */}
        <mesh position={[0, -STACK_COUNT * STACK_GAP * 0.5 + 0.09, 0]}>
          <boxGeometry args={[LEAF_W + 0.24, 0.015, LEAF_D + 0.20]} />
          <meshStandardMaterial color="#D9A441" roughness={0.35} metalness={0.4} />
        </mesh>

        {/* stacked palm leaves — the static pile (minus the one that is floating) */}
        {Array.from({ length: STACK_COUNT }).map((_, i) => {
          // hide the leaf that is currently being read (so we don't see duplicate)
          const isActiveLeafInPile = i === (STACK_COUNT - 1) // the topmost leaf is the one we lift
          // keep it but make it invisible while floating (prevents z-fight)
          const hidden = isActiveLeafInPile && progress > 0.06
          const y = i * STACK_GAP - STACK_COUNT * STACK_GAP * 0.5 + 0.12
          // slight random offset for realism
          const r = (i * 0.008) % 0.014
          const zJitter = (Math.sin(i * 1.7) * 0.008)
          // use plain texture formost, top few show verses? keep pile plain
          const map = i >= STACK_COUNT - 3 ? plainTexture : plainTexture
          return (
            <group key={i} position={[r, y, zJitter]} visible={!hidden}>
              <mesh>
                <boxGeometry args={[LEAF_W, LEAF_H, LEAF_D]} />
                {/* order: right, left, top, bottom, front, back */}
                <meshStandardMaterial attach="material-0" color="#8A4E1E" roughness={0.9} />
                <meshStandardMaterial attach="material-1" color="#8A4E1E" roughness={0.9} />
                <meshStandardMaterial attach="material-2" map={map} roughness={0.82} metalness={0.01} />
                <meshStandardMaterial attach="material-3" map={map} roughness={0.82} metalness={0.01} />
                <meshStandardMaterial attach="material-4" color="#E6C78E" roughness={0.9} />
                <meshStandardMaterial attach="material-5" color="#E6C78E" roughness={0.9} />
              </mesh>
              {/* hole dark cylinders to hint at depth */}
              <mesh position={[LEAF_W * 0.20, LEAF_H * 0.62, 0]}>
                <cylinderGeometry args={[0.025, 0.025, LEAF_H + 0.006, 16]} />
                <meshStandardMaterial color="#1A0A04" roughness={1} />
              </mesh>
              <mesh position={[LEAF_W * -0.20, LEAF_H * 0.62, 0]}>
                <cylinderGeometry args={[0.025, 0.025, LEAF_H + 0.006, 16]} />
                <meshStandardMaterial color="#1A0A04" roughness={1} />
              </mesh>
            </group>
          )
        })}

        {/* top patta (painted cover) — rests on pile */}
        <mesh position={[0, activeStackY + 0.08, 0]}>
          <boxGeometry args={[LEAF_W + 0.22, 0.13, LEAF_D + 0.18]} />
          <meshStandardMaterial map={topCoverMap} roughness={0.62} metalness={0.02} />
        </mesh>
        {/* binding cords over the top patta — two cream strings with knots */}
        {[0.88, -0.88].map((xOff) => (
          <group key={xOff} position={[xOff, activeStackY + 0.15, 0]}>
            {/* vertical cord segment over the cover */}
            <mesh position={[0, 0.015, 0]}>
              <boxGeometry args={[0.045, 0.02, LEAF_D + 0.04]} />
              <meshStandardMaterial color="#F5E6C2" roughness={0.95} />
            </mesh>
            {/* knot */}
            <mesh position={[0, 0.045, 0]}>
              <sphereGeometry args={[0.055, 14, 12]} />
              <meshStandardMaterial color="#F5E6C2" roughness={0.9} />
            </mesh>
            {/* hanging tassel strings (dangle off front edge) */}
            <mesh position={[0, -0.18, LEAF_D * 0.52]}>
              <cylinderGeometry args={[0.016, 0.016, 0.42, 8]} />
              <meshStandardMaterial color="#F5E6C2" roughness={0.95} />
            </mesh>
            <mesh position={[0.04, -0.18, LEAF_D * 0.52]}>
              <cylinderGeometry args={[0.016, 0.016, 0.38, 8]} />
              <meshStandardMaterial color="#EAD8B0" roughness={0.95} />
            </mesh>
            {/* small wooden bead at tassel tip */}
            <mesh position={[0, -0.39, LEAF_D * 0.52]}>
              <sphereGeometry args={[0.028, 10, 8]} />
              <meshStandardMaterial color="#8A4E1E" roughness={0.7} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ------- floating reading leaf — the hero leaf that levitates ------- */}
      <group
        ref={floatingLeafRef}
        position={[0, activeStackY, 0]}
        rotation={[0, 0, 0]}
      >
        {/* soft drop shadow plane under floating leaf (fades as it rises) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.9 - easedProgress * 0.2, -0.12]}>
          <planeGeometry args={[3.2, 1.6]} />
          <meshBasicMaterial color="#1A0F02" transparent opacity={0.18 * (1 - easedProgress * 0.55)} depthWrite={false} />
        </mesh>
        {/* the leaf mesh itself — thicker appearance + double-sided texture */}
        <mesh>
          <boxGeometry args={[LEAF_W, LEAF_H * 1.3, LEAF_D]} />
          {/* sides use edge color, top/bottom use verse texture */}
          <meshStandardMaterial attach="material-0" color="#8A4E1E" roughness={0.9} />
          <meshStandardMaterial attach="material-1" color="#8A4E1E" roughness={0.9} />
          <meshStandardMaterial attach="material-2" map={activeTexture} roughness={0.72} metalness={0.015} />
          <meshStandardMaterial attach="material-3" map={activeTexture} roughness={0.72} metalness={0.015} />
          <meshStandardMaterial attach="material-4" color="#E6C78E" roughness={0.9} />
          <meshStandardMaterial attach="material-5" color="#E6C78E" roughness={0.9} />
        </mesh>
        {/* hole reinforcements on floating leaf (tiny metallic rings) */}
        {[-0.88, 0.88].map((x) => (
          <mesh key={x} position={[x, LEAF_H * 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.055, 0.012, 10, 18]} />
            <meshStandardMaterial color="#6B3A14" roughness={0.6} metalness={0.18} />
          </mesh>
        ))}
        {/* subtle golden edge outline while floating (makes verse pop) */}
        <mesh position={[0, 0.001, 0]}>
          <planeGeometry args={[LEAF_W + 0.05, LEAF_D + 0.05]} />
          <meshBasicMaterial color="#D9A441" transparent opacity={0.0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
//  Error fallback image (shows same palm-leaf flat if WebGL fails)
// ---------------------------------------------------------------------------
function ManuscriptFallback({ verse, onNext }) {
  return (
    <div className="pothi-fallback">
      <div className="pothi-fallback-frame">
        <div className="pothi-fallback-leaf">
          <span className="pothi-fallback-src">{verse.source}</span>
          <p className="pothi-fallback-deva">{verse.devanagari}</p>
          <span className="pothi-fallback-rule" aria-hidden="true" />
          <p className="pothi-fallback-meaning">{verse.meaning}</p>
          <i className="pothi-hole" style={{ left: '30%' }} />
          <i className="pothi-hole" style={{ left: '70%' }} />
        </div>
      </div>
      <button className="pothi-fallback-next" onClick={onNext} aria-label="Next verse">
        अगला श्लोक · Next →
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  Main component
// ---------------------------------------------------------------------------
export default function ScriptureBook() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0) // 0..1 flip arc for levitation
  const [visible, setVisible] = useState(true)
  const [webglFailed, setWebglFailed] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const exhibitRef = useRef(null)
  const rafRef = useRef(0)
  const startRef = useRef(performance.now())
  const lastIndexRef = useRef(0)

  // build all textures once
  const { leafTextures, plainTexture, topCoverMap, bottomCoverMap, allTextures } = useMemo(() => {
    const leaves = verses.map((v, i) => drawPalmLeafTexture(v, i + 1))
    const plain = drawPlainLeafTexture(0)
    const top = drawPaintedPatta(true)
    const bottom = drawPaintedPatta(false)
    return {
      leafTextures: leaves,
      plainTexture: plain,
      topCoverMap: top,
      bottomCoverMap: bottom,
      allTextures: [...leaves, plain, top, bottom],
    }
  }, [])

  useEffect(() => () => {
    for (const t of allTextures) t.dispose()
  }, [allTextures])

  // page advance timer
  useEffect(() => {
    if (REDUCED) return
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % verses.length)
      startRef.current = performance.now()
    }, PAGE_TIME)
    return () => clearInterval(id)
  }, [])

  // levitation progress loop (ease per page)
  useEffect(() => {
    if (REDUCED) { setProgress(1); return }
    let raf = 0
    const loop = () => {
      const elapsed = performance.now() - startRef.current
      const p = Math.min(elapsed / TURN_TIME, 1)
      setProgress(p)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])

  // when active changes, restart arc
  useEffect(() => { startRef.current = performance.now() }, [active])

  // pause render when off-screen
  useEffect(() => {
    const el = exhibitRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0, rootMargin: '120px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // reveal once section enters view — fallback timer so it always opens even if observer fails
  useEffect(() => {
    const node = exhibitRef.current
    if (!node) { setRevealed(true); return }
    let done = false
    const trigger = () => { if (!done) { done = true; setRevealed(true) } }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { trigger(); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(node)
    const fallback = setTimeout(trigger, 900)
    return () => { observer.disconnect(); clearTimeout(fallback) }
  }, [])

  const handleCanvasError = useCallback(() => setWebglFailed(true), [])
  const canRender3D = !webglFailed && typeof window !== 'undefined'

  // quick webgl support probe — if creation fails immediately, show fallback
  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
      if (!gl) setWebglFailed(true)
    } catch { setWebglFailed(true) }
  }, [])

  const currentVerse = verses[active]

  // tap / click on scene advances page
  const nextPage = useCallback(() => {
    setActive((p) => (p + 1) % verses.length)
    startRef.current = performance.now()
  }, [])

  return (
    <div
      className={`scripture-exhibit pothi-exhibit ${revealed ? 'is-open is-zoomed is-revealed' : ''}`}
      ref={exhibitRef}
      aria-label="Ancient palm-leaf manuscript of Gita and Ramcharitmanas shlokas"
    >
      <div className="pothi-scene-wrap">
        {!canRender3D ? (
          <ManuscriptFallback verse={currentVerse} onNext={nextPage} />
        ) : (
          <>
            <Canvas
              dpr={[1, 1.7]}
              frameloop={visible ? 'always' : 'never'}
              camera={{ position: [0, 1.65, 5.55], fov: 34 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              shadows={false}
              onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0)
                gl.toneMapping = THREE.ACESFilmicToneMapping
                gl.toneMappingExposure = 1.06
              }}
              onError={handleCanvasError}
              className="pothi-canvas"
              style={{ width: '100%', height: '100%', display: 'block' }}
            >
              {/* warm ambient + key light + fill + rim for realism */}
              <ambientLight intensity={1.05} color="#FFF2DC" />
              <directionalLight position={[4, 6, 4]} intensity={1.85} color="#FFE9C2" castShadow={false} />
              <directionalLight position={[-3.5, 3.5, -2]} intensity={0.55} color="#C8A87A" />
              <pointLight position={[0, 3.2, 2]} intensity={12} distance={10} decay={1.6} color="#FFD37A" />
              <pointLight position={[-4, 1.2, -1]} intensity={6} distance={9} decay={2} color="#FF8C42" />
              <hemisphereLight args={['#FFE8C0', '#4A2E0A', 0.34]} />
              {/* contact shadow under the whole pothi */}
              <ContactShadows
                position={[0, -0.92, 0]}
                opacity={0.42}
                scale={10}
                blur={2.8}
                far={3.2}
                color="#1A0F02"
              />
              <PothiScene
                leafTextures={leafTextures}
                plainTexture={plainTexture}
                topCoverMap={topCoverMap}
                bottomCoverMap={bottomCoverMap}
                activeIndex={active}
                progress={progress}
                scrollVisible={revealed}
              />
            </Canvas>

            {/* invisible tap target over canvas — next leaf */}
            <button
              className="pothi-tap-target"
              onClick={nextPage}
              aria-label="Show next shloka"
              title="अगला श्लोक"
            />

            {/* leaf counter + hint */}
            <div className="pothi-ui">
              <span className="pothi-folio">
                folio {String(active + 1).padStart(2, '0')} / {String(verses.length).padStart(2, '0')} · {currentVerse.source}
              </span>
              <div className="pothi-dots" role="tablist" aria-label="Choose verse">
                {verses.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Shloka ${i + 1}`}
                    className={`pothi-dot ${i === active ? 'is-active' : ''}`}
                    onClick={() => { setActive(i); startRef.current = performance.now() }}
                  />
                ))}
              </div>
            </div>

            <span className={`sb-hint pothi-hint ${active > 0 ? 'is-gone' : ''}`}>पत्ते पर टैप करें · tap leaf for next श्लोक</span>
          </>
        )}
      </div>

      {/* caption card under the 3D — shows readable text synchronised with the floating leaf */}
      <div className="pothi-caption">
        <span className="pothi-caption-kicker">{currentVerse.source}</span>
        <p className="pothi-caption-deva">{currentVerse.devanagari}</p>
        <p className="pothi-caption-meaning">{currentVerse.meaning}</p>
        <button className="pothi-caption-next" onClick={nextPage}>
          अगला श्लोक <i aria-hidden="true">↗</i>
        </button>
      </div>
    </div>
  )
}
