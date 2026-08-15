const paths = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
  chat: <path d="M20 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A7.5 7.5 0 0 1 3 12c0-4.4 3.8-8 8.5-8S20 7.6 20 12v3Z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  moon: <path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" />,
  sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  send: <path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14" />,
  attach: <path d="m20.5 11.5-8.8 8.8a5 5 0 0 1-7.1-7.1l9.2-9.2a3.5 3.5 0 0 1 5 5l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23V5.5Z" /></>,
  translate: <><path d="M4 5h10M9 3v2M6 8c1.2 3 3.4 5.2 6 6.5M12 8c-1 3-3.2 5.6-6.5 7" /><path d="m14 21 4-9 4 9M15.5 18h5" /></>,
  code: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" />,
  spark: <path d="m12 2 1.4 5.6L19 9l-5.6 1.4L12 16l-1.4-5.6L5 9l5.6-1.4L12 2ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  trash: <path d="M4 7h16M9 7V5h6v2m-8.5 0 1 13h9l1-13M10 11v5M14 11v5" />,
  'message-square': <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />,
  play: <path d="M7 5.5v13l11-6.5-11-6.5Z" />,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="1.5" />,
  replay: <><path d="M20 11a8 8 0 1 0 1 4" /><path d="M20 5v6h-6" /></>,
  volume: <><path d="M4 10v4h4l5 4V6L8 10H4Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11" /></>,
  'volume-x': <><path d="M4 10v4h4l5 4V6L8 10H4Z" /><path d="m17 10 4 4m0-4-4 4" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9.5 9 5 9-5" />,
  brain: <path d="M12 4a3.5 3.5 0 0 0-3.5 3.5c-2 .3-3.5 1.9-3.5 4a4 4 0 0 0 2.6 3.8A3.6 3.6 0 0 0 12 19.6a3.6 3.6 0 0 0 4.4-4.3A4 4 0 0 0 19 11.5c0-2.1-1.5-3.7-3.5-4A3.5 3.5 0 0 0 12 4Zm0 0v16" />,
  flame: <path d="M12 3s-5 4.5-5 9.5a5 5 0 0 0 10 0c0-2-1-4-2.5-5.5 0 0-.5 2-2 3C12.5 8 12 3 12 3Z" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="m16 10.5 5-3v9l-5-3" /></>,
  heart: <path d="M12 20s-7.5-4.6-9-9.3C1.9 7.2 4 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3 0 5.1 2.7 4 6.2-1.5 4.7-9 9.3-9 9.3Z" />,
  home: <><path d="m4 11 8-7 8 7" /><path d="M6 9.5V20h12V9.5" /><path d="M10 20v-6h4v6" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.4 9.2a2.7 2.7 0 0 1 5.3.8c0 1.8-2.7 2.3-2.7 3.7" /><path d="M12 17h.01" /></>,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  diya: <><path d="M4 14c0 3.3 3.6 6 8 6s8-2.7 8-6H4Z" /><path d="M12 3c-1.5 2.5-3 4.5-3 6.5a3 3 0 0 0 6 0c0-2-1.5-4-3-6.5Z" fill="currentColor" className="diya-flame-path" /></>,
  lotus: <><path d="M12 4c-2 3.5-3 6-3 8a3 3 0 0 0 6 0c0-2-1-4.5-3-8Z" /><path d="M12 12c-4-1.5-7.5.5-9 3.5 2 2.5 5.5 3 9 1 3.5 2 7 1.5 9-1-1.5-3-5-5-9-3.5Z" /></>,
  om: <><path d="M7 10a3 3 0 1 1 3-3M7 10a3.5 3.5 0 0 1 6.5 2c0 2-2 3.5-3.5 5M13.5 12a3.5 3.5 0 0 1 3.5 5c0 2.5-2.5 4-5.5 4M15 5.5a2.5 2.5 0 0 1 4 0" /><circle cx="17.5" cy="3" r="0.8" fill="currentColor" /></>,
  trishul: <><path d="M12 2v20M7 4c0 4 2 7 5 7s5-3 5-7M6 3v2M18 3v2" /></>,
  mandala: <><circle cx="12" cy="12" r="9" strokeDasharray="3 3" /><circle cx="12" cy="12" r="5" strokeDasharray="2 2" /><circle cx="12" cy="12" r="2" /></>,
}

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      {paths[name]}
    </svg>
  )
}
