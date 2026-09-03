import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles, Float } from '@react-three/drei'

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
    meaning: 'Polishing the mirror of my mind with the dust of the Guru’s lotus feet, I sing the spotless glory of Sri Ram, giver of the four fruits.',
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

const PAGE_TIME = 7000
const TURN_TIME = 1200
const RESET_STAGGER = 90
const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ---------- canvas texture helpers ---------- */

const PAGE_W = 720
const PAGE_H = 1040
const SANS_DEVA = '"Noto Sans Devanagari","Nirmala UI","Mangal",serif'

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  return [canvas, canvas.getContext('2d')]
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
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawCenteredWrapped(ctx, text, x, y, maxWidth, lineH) {
  const lines = wrapText(ctx, text, maxWidth)
  for (const line of lines) {
    ctx.fillText(line, x, y)
    y += lineH
  }
  return y
}

function pageChrome(ctx) {
  // aged paper
  ctx.fillStyle = '#FBF3DF'
  ctx.fillRect(0, 0, PAGE_W, PAGE_H)
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = `rgba(120, 85, 40, ${0.02 + Math.random() * 0.03})`
    ctx.fillRect(Math.random() * PAGE_W, Math.random() * PAGE_H, 1.6, 1.6)
  }
  // double gold border + corner diamonds
  ctx.strokeStyle = '#C9962E'
  ctx.lineWidth = 5
  ctx.strokeRect(28, 28, PAGE_W - 56, PAGE_H - 56)
  ctx.lineWidth = 1.6
  ctx.strokeRect(44, 44, PAGE_W - 88, PAGE_H - 88)
  ctx.fillStyle = '#C9962E'
  for (const [cx, cy] of [[28, 28], [PAGE_W - 28, 28], [28, PAGE_H - 28], [PAGE_W - 28, PAGE_H - 28]]) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-7, -7, 14, 14)
    ctx.restore()
  }
  // ॐ watermark
  ctx.save()
  ctx.globalAlpha = 0.07
  ctx.fillStyle = '#8A5A14'
  ctx.font = `560px ${SANS_DEVA}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ॐ', PAGE_W / 2, PAGE_H / 2 + 40)
  ctx.restore()
  ctx.textBaseline = 'alphabetic'
}

function drawVersePage(verse, pageNo) {
  const [canvas, ctx] = makeCanvas(PAGE_W, PAGE_H)
  pageChrome(ctx)
  ctx.textAlign = 'center'

  ctx.fillStyle = '#B4560A'
  ctx.font = `700 27px Georgia, serif`
  drawCenteredWrapped(ctx, verse.source.toUpperCase(), PAGE_W / 2, 150, PAGE_W - 140, 38)

  // gold divider
  ctx.strokeStyle = '#C9962E'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(PAGE_W / 2 - 110, 200)
  ctx.lineTo(PAGE_W / 2 + 110, 200)
  ctx.stroke()

  // devanagari verse
  ctx.fillStyle = '#3A2410'
  ctx.font = `600 44px ${SANS_DEVA}`
  let y = drawCenteredWrapped(ctx, verse.devanagari, PAGE_W / 2, 320, PAGE_W - 160, 74)

  // divider
  y += 26
  ctx.strokeStyle = 'rgba(201, 150, 46, 0.6)'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(PAGE_W / 2 - 70, y)
  ctx.lineTo(PAGE_W / 2 + 70, y)
  ctx.stroke()
  y += 46

  // english meaning
  ctx.fillStyle = '#6B4A22'
  ctx.font = 'italic 30px Georgia, serif'
  drawCenteredWrapped(ctx, verse.meaning, PAGE_W / 2, y, PAGE_W - 180, 44)

  // page number
  ctx.fillStyle = '#8A6B4D'
  ctx.font = `600 24px ${SANS_DEVA}`
  ctx.fillText(`पृष्ठ ${pageNo} / ${verses.length}`, PAGE_W / 2, PAGE_H - 76)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function drawOrnamentPage() {
  const [canvas, ctx] = makeCanvas(PAGE_W, PAGE_H)
  pageChrome(ctx)
  ctx.textAlign = 'center'

  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.fillStyle = '#B48314'
  ctx.font = `300px ${SANS_DEVA}`
  ctx.textBaseline = 'middle'
  ctx.fillText('ॐ', PAGE_W / 2, PAGE_H / 2 - 30)
  ctx.restore()

  ctx.fillStyle = '#8A5A14'
  ctx.font = `600 34px ${SANS_DEVA}`
  ctx.fillText('॥ श्री सीताराम ॥', PAGE_W / 2, PAGE_H - 130)
  ctx.textBaseline = 'alphabetic'
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function drawCoverArt() {
  const [canvas, ctx] = makeCanvas(760, 1080)
  const grad = ctx.createLinearGradient(0, 0, 760, 1080)
  grad.addColorStop(0, '#A64B08')
  grad.addColorStop(0.55, '#8A3A06')
  grad.addColorStop(1, '#6E2E04')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 760, 1080)

  // ornate frame
  ctx.strokeStyle = '#EFC558'
  ctx.lineWidth = 7
  ctx.strokeRect(26, 26, 708, 1028)
  ctx.lineWidth = 2
  ctx.strokeRect(46, 46, 668, 988)
  ctx.fillStyle = '#EFC558'
  for (const [cx, cy] of [[26, 26], [734, 26], [26, 1054], [734, 1054]]) {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-9, -9, 18, 18)
    ctx.restore()
  }

  ctx.textAlign = 'center'
  ctx.save()
  ctx.shadowColor = 'rgba(255, 214, 110, 0.8)'
  ctx.shadowBlur = 42
  ctx.fillStyle = '#F5C542'
  ctx.font = `230px ${SANS_DEVA}`
  ctx.textBaseline = 'middle'
  ctx.fillText('ॐ', 380, 400)
  ctx.restore()

  ctx.fillStyle = '#F5C542'
  ctx.font = `600 58px ${SANS_DEVA}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('गीता · रामचरितमानस', 380, 680)
  ctx.fillStyle = '#FFD9A0'
  ctx.font = `500 36px ${SANS_DEVA}`
  ctx.fillText('ज्ञान · भक्ति · धर्म', 380, 750)

  ctx.strokeStyle = '#EFC558'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(300, 800)
  ctx.lineTo(460, 800)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function drawInnerCover() {
  const [canvas, ctx] = makeCanvas(760, 1080)
  const grad = ctx.createLinearGradient(0, 0, 760, 1080)
  grad.addColorStop(0, '#93410A')
  grad.addColorStop(1, '#743105')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 760, 1080)
  ctx.strokeStyle = 'rgba(239, 197, 88, 0.65)'
  ctx.lineWidth = 3
  ctx.strokeRect(38, 38, 684, 1004)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ---------- 3D pieces ---------- */

const damp = THREE.MathUtils.damp
const easeInOutCubic = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

function PagePlanes({ frontMap, backMap }) {
  return (
    <>
      <mesh position={[0.72, 0, 0.0016]}>
        <planeGeometry args={[1.44, 2.08]} />
        <meshStandardMaterial map={frontMap} roughness={0.92} metalness={0.01} />
      </mesh>
      <mesh position={[0.72, 0, -0.0016]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.44, 2.08]} />
        <meshStandardMaterial map={backMap} roughness={0.92} metalness={0.01} />
      </mesh>
    </>
  )
}

function Book({
  open,
  zoomed,
  coverArt,
  innerCover,
  ornament,
  pageTextures,
  onTurnForward,
  turnRef,
}) {
  const bookRef = useRef(null)
  const coverRef = useRef(null)
  const openRef = useRef(false)
  const zoomedRef = useRef(false)
  const anims = useRef(Array.from({ length: verses.length }, () => null))
  const sides = useRef(Array.from({ length: verses.length }, () => 1)) // 1 right, -1 left
  const leafRefs = useRef([])
  const busyRef = useRef(false)
  const turnedRef = useRef(0)
  const nowRef = useRef(0)
  const turnDuration = REDUCED ? 220 : TURN_TIME

  useEffect(() => { openRef.current = open }, [open])
  useEffect(() => { zoomedRef.current = zoomed }, [zoomed])

  const startFlip = (index, from, to, delay = 0) => {
    anims.current[index] = { from, to, start: nowRef.current + delay }
  }

  const resetAll = () => {
    busyRef.current = true
    for (let i = verses.length - 1; i >= 0; i--) {
      startFlip(i, -Math.PI, 0, (verses.length - 1 - i) * (RESET_STAGGER / 1000))
    }
    const total = verses.length * RESET_STAGGER + turnDuration + 80
    setTimeout(() => {
      sides.current.fill(1)
      turnedRef.current = 0
      busyRef.current = false
    }, total)
  }

  const turnForward = () => {
    if (!openRef.current || busyRef.current) return
    if (turnedRef.current >= verses.length) {
      resetAll()
      return
    }
    busyRef.current = true
    const index = turnedRef.current
    startFlip(index, 0, -Math.PI)
    setTimeout(() => {
      sides.current[index] = -1
      turnedRef.current += 1
      busyRef.current = false
      onTurnForward?.()
    }, turnDuration)
  }

  /* expose the turn action so the parent's auto-page interval can call it */
  useEffect(() => {
    turnRef.current = turnForward
    return () => { turnRef.current = null }
  })

  useFrame((state, dt) => {
    nowRef.current = performance.now() / 1000
    const t = nowRef.current

    // whole-book pose: closed tilt → open display
    if (bookRef.current) {
      const o = openRef.current
      bookRef.current.rotation.x = damp(bookRef.current.rotation.x, o ? 0.1 : 0.46, 3.2, dt)
      bookRef.current.position.y = damp(bookRef.current.position.y, o ? 0 : -0.16, 3.2, dt)
      const s = damp(bookRef.current.scale.x, o ? 1 : 0.9, 3.2, dt)
      bookRef.current.scale.setScalar(s)
    }

    // front cover swings open around the spine
    if (coverRef.current) {
      const target = openRef.current ? -Math.PI * 0.97 : 0
      coverRef.current.rotation.y = damp(coverRef.current.rotation.y, target, 2.6, dt)
    }

    // camera dolly once zoomed
    const cam = state.camera
    cam.position.z = damp(cam.position.z, openRef.current ? (zoomedRef.current ? 4.9 : 5.6) : 6.4, 2.4, dt)
    cam.position.y = damp(cam.position.y, openRef.current ? 0.34 : 0.5, 2.4, dt)
    cam.lookAt(0, 0, 0)

    // leaf flips with a paper-curl illusion
    for (let i = 0; i < verses.length; i++) {
      const group = leafRefs.current[i]
      if (!group) continue
      const anim = anims.current[i]
      if (anim) {
        const p = Math.min(Math.max((t - anim.start) / (turnDuration / 1000), 0), 1)
        const e = easeInOutCubic(p)
        group.rotation.y = anim.from + (anim.to - anim.from) * e
        const curl = Math.sin(p * Math.PI)
        group.rotation.x = curl * 0.09
        group.scale.x = 1 - curl * 0.13
        if (p >= 1) anims.current[i] = null
      } else {
        group.rotation.y = sides.current[i] === -1 ? -Math.PI : 0
        group.rotation.x = 0
        group.scale.x = 1
      }
    }
  })

  const pageMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#F1E3C2', roughness: 0.95 }),
    []
  )
  const leatherMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7A3607', roughness: 0.62 }),
    []
  )
  const goldMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#D9A441', roughness: 0.35, metalness: 0.65 }),
    []
  )

  useEffect(() => () => {
    pageMaterial.dispose()
    leatherMaterial.dispose()
    goldMaterial.dispose()
  }, [pageMaterial, leatherMaterial, goldMaterial])

  const bookBody = (
    <group ref={bookRef} rotation={[0.46, 0, 0]} position={[0, -0.16, 0]} scale={0.9}>
      {/* back cover + spine */}
      <mesh position={[0, 0, -0.031]} material={leatherMaterial}>
        <boxGeometry args={[3.12, 2.24, 0.05]} />
      </mesh>
      <mesh position={[0, 0, -0.1]} material={leatherMaterial}>
        <boxGeometry args={[0.18, 2.24, 0.2]} />
      </mesh>
      <mesh position={[0, 1.13, -0.02]} material={goldMaterial}>
        <boxGeometry args={[3.12, 0.035, 0.055]} />
      </mesh>
      <mesh position={[0, -1.13, -0.02]} material={goldMaterial}>
        <boxGeometry args={[3.12, 0.035, 0.055]} />
      </mesh>

      {/* page blocks peeking on both sides */}
      <mesh position={[0.72, 0, 0.03]} material={pageMaterial}>
        <boxGeometry args={[1.42, 2.06, 0.062]} />
      </mesh>
      <mesh position={[-0.72, 0, 0.03]} material={pageMaterial}>
        <boxGeometry args={[1.42, 2.06, 0.062]} />
      </mesh>

      {/* leaf pages, hinged at the spine */}
      {verses.map((_, i) => (
        <group
          key={i}
          ref={(node) => { leafRefs.current[i] = node }}
          position={[0, 0, 0.068 + i * 0.004]}
        >
          <PagePlanes frontMap={pageTextures[i]} backMap={ornament} />
        </group>
      ))}

      {/* front cover hinged at the spine */}
      <group ref={coverRef}>
        <mesh position={[0.78, 0, 0.108]} material={leatherMaterial}>
          <boxGeometry args={[1.52, 2.24, 0.05]} />
        </mesh>
        <mesh position={[0.78, 0, 0.136]}>
          <planeGeometry args={[1.42, 2.12]} />
          <meshStandardMaterial map={coverArt} roughness={0.58} />
        </mesh>
        <mesh position={[0.78, 0, 0.082]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.42, 2.12]} />
          <meshStandardMaterial map={innerCover} roughness={0.62} />
        </mesh>
      </group>

      {/* invisible tap target over the right page */}
      <mesh position={[0.76, 0, 0.16]} onClick={turnForward}>
        <planeGeometry args={[1.5, 2.14]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )

  return (
    <>
      <ambientLight intensity={1.0} color="#FFF2DC" />
      <directionalLight position={[3, 4, 5]} intensity={1.7} color="#FFE7C2" />
      <pointLight position={[-4, 1.5, 3]} intensity={9} distance={12} decay={2} color="#FFB300" />
      {REDUCED ? bookBody : (
        <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.32} floatingRange={[-0.04, 0.04]}>
          {bookBody}
        </Float>
      )}
      <Sparkles count={46} scale={[3.8, 2.7, 1.6]} size={2.4} speed={0.35} color="#FFD37A" position={[0, 0, 0.5]} />
    </>
  )
}

/* ---------- component ---------- */

export default function ScriptureBook() {
  const [open, setOpen] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [readCount, setReadCount] = useState(0)
  const [bookVisible, setBookVisible] = useState(true)
  const exhibitRef = useRef(null)
  const turnRef = useRef(null)

  // pause WebGL render loop when book scrolls out of view
  useEffect(() => {
    const el = exhibitRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setBookVisible(e.isIntersecting), { threshold: 0, rootMargin: '100px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { pageTextures, ornament, coverArt, innerCover, allTextures } = useMemo(() => {
    const pages = verses.map((verse, i) => drawVersePage(verse, i + 1))
    const ornamentTex = drawOrnamentPage()
    const cover = drawCoverArt()
    const inner = drawInnerCover()
    return {
      pageTextures: pages,
      ornament: ornamentTex,
      coverArt: cover,
      innerCover: inner,
      allTextures: [...pages, ornamentTex, cover, inner],
    }
  }, [])

  useEffect(() => () => {
    for (const texture of allTextures) texture.dispose()
  }, [allTextures])

  /* open the book once the section enters the view, then zoom into the spread */
  useEffect(() => {
    const node = exhibitRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOpen(true)
          setTimeout(() => setZoomed(true), 1100)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* auto-turn the pages (motion-safe visitors tap instead) */
  useEffect(() => {
    if (!open || REDUCED) return
    const timer = setInterval(() => turnRef.current?.(), PAGE_TIME)
    return () => clearInterval(timer)
  }, [open])

  return (
    <div className={`scripture-exhibit ${open ? 'is-open' : ''}`} ref={exhibitRef}>
      <div className="sb-scene" style={{ position: 'relative' }}>
        <Canvas
          dpr={[1, 1.5]}
          frameloop={bookVisible ? 'always' : 'never'}
          camera={{ position: [0, 0.5, 6.4], fov: 38 }}
          gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        >
          <Book
            open={open}
            zoomed={zoomed}
            coverArt={coverArt}
            innerCover={innerCover}
            ornament={ornament}
            pageTextures={pageTextures}
            onTurnForward={() => setReadCount((count) => count + 1)}
            turnRef={turnRef}
          />
        </Canvas>
        <span className={`sb-hint ${readCount > 0 ? 'is-gone' : ''}`}>पृष्ठ पलटने के लिए किताब पर टैप करें</span>
      </div>
    </div>
  )
}
