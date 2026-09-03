import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const statsData = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" />
        <path d="M8 11h6" />
      </svg>
    ),
    value: 4000,
    prefix: '',
    suffix: '+',
    label: 'Discourses Processed',
    hindi: 'प्रवचन प्रसंस्कृत'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9l2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9l2.12-2.12" />
      </svg>
    ),
    value: 50,
    prefix: '',
    suffix: 'M+',
    label: 'Tokens Experimented',
    hindi: 'टोकेन्स परीक्षण'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v6m0 6v6M3 12h6m6 0h6M5.6 5.6l4.2 4.2m4.4 4.4l4.2 4.2M5.6 18.4l4.2-4.2m4.4-4.4l4.2-4.2" />
      </svg>
    ),
    value: 10,
    prefix: '',
    suffix: '+',
    label: 'Segmentation Iterations',
    hindi: 'खंड पुनरावृत्तियां'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        <path d="M8 10h.01M12 10h.01M16 10h.01" />
      </svg>
    ),
    value: 50,
    prefix: '',
    suffix: 'K+',
    label: 'Q&A Pairs Generated',
    hindi: 'संवाद प्रश्नोत्तरी'
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C9 6 4 10 4 15a8 8 0 0 0 16 0C20 10 15 6 12 2z" />
        <path d="M12 7c-2 3-5 5-5 8a5 5 0 0 0 10 0c0-3-3-5-5-8z" />
      </svg>
    ),
    value: 1,
    prefix: '',
    suffix: '',
    label: 'Mission Samvaad',
    hindi: 'एक पावन संकल्प'
  },
];

function CountUpNumber({ target, active, duration = 1800 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayValue(0);
      return;
    }
    let startTimestamp = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [active, target, duration]);

  return <>{target >= 1000 ? displayValue.toLocaleString('en-IN') : displayValue}</>;
}

export default function ParchmentScroll() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, {
    once: false,
    amount: 0.25,
    margin: '-30px 0px -30px 0px',
  });

  return (
    <div className="parchment-scroll-wrapper" ref={containerRef} aria-label="Our Journey In Numbers Parchment Scroll">
      {/* Golden divine ambient glow behind the unrolled scroll */}
      <div className={`parchment-glow-backdrop ${isInView ? 'is-active' : ''}`} />

      {/* Unfurling Stage */}
      <div className={`parchment-unfurl-stage ${isInView ? 'is-unfurled' : 'is-closed'}`}>
        
        {/* Left Scroll Roller Cylinder */}
        <motion.div
          className="parchment-roller parchment-roller-left"
          initial={{ x: 'calc(50% - 28px)', rotateY: 0 }}
          animate={isInView ? { x: '0%', rotateY: -360 } : { x: 'calc(50% - 28px)', rotateY: 0 }}
          transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="roller-finial roller-finial-top" />
          <div className="roller-spindle">
            <div className="spindle-shading" />
            <div className="spindle-lip" />
          </div>
          <div className="roller-finial roller-finial-bottom" />
        </motion.div>

        {/* Central Parchment Manuscript Body */}
        <motion.div
          className="parchment-sheet"
          initial={{ scaleX: 0, opacity: 0.2 }}
          animate={isInView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0.2 }}
          transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Paper texture and vintage deckled edges */}
          <div className="parchment-texture" />
          <div className="parchment-edge-top" />
          <div className="parchment-edge-bottom" />
          <div className="parchment-frame-border" />

          {/* Stats Content */}
          <motion.div
            className="parchment-inner-content"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, delay: 0.45 }}
          >
            {/* Scroll Header */}
            <div className="parchment-header-ornament">
              <span className="scroll-bracket-left">✦ ───</span>
              <h3 className="scroll-headline">OUR JOURNEY IN NUMBERS</h3>
              <span className="scroll-bracket-right">─── ✦</span>
            </div>

            {/* 5 Stat Columns */}
            <div className="parchment-metrics-grid">
              {statsData.map((stat, idx) => (
                <div key={stat.label} className="parchment-metric-item">
                  <div className="metric-icon-circle">
                    <div className="icon-halo-ring" />
                    <span className="metric-icon-svg">{stat.icon}</span>
                  </div>

                  <div className="metric-number-display">
                    <span className="metric-digit">
                      <CountUpNumber target={stat.value} active={isInView} duration={1500 + idx * 120} />
                    </span>
                    {stat.suffix && <span className="metric-suffix">{stat.suffix}</span>}
                  </div>

                  <div className="metric-text-label">{stat.label}</div>
                  
                  {idx < statsData.length - 1 && (
                    <div className="metric-vertical-divider" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right Scroll Roller Cylinder */}
        <motion.div
          className="parchment-roller parchment-roller-right"
          initial={{ x: 'calc(-50% + 28px)', rotateY: 0 }}
          animate={isInView ? { x: '0%', rotateY: 360 } : { x: 'calc(-50% + 28px)', rotateY: 0 }}
          transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="roller-finial roller-finial-top" />
          <div className="roller-spindle">
            <div className="spindle-shading" />
            <div className="spindle-lip" />
          </div>
          <div className="roller-finial roller-finial-bottom" />
        </motion.div>

      </div>
    </div>
  );
}
