/* ============================================================
   图标单源（1.7 描边体系 · 24 网格）
   从原型 shell.js 迁移；<Icon name="…"/> 按名渲染
   ============================================================ */

const S = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'

export const ICONS: Record<string, string> = {
  home: `<svg viewBox="0 0 24 24" ${S}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9h12v-9"/></svg>`,
  sparkle: `<svg viewBox="0 0 24 24" ${S}><path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9z"/><path d="M19 15.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z"/></svg>`,
  image: `<svg viewBox="0 0 24 24" ${S}><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m3.5 16.5 5-4 4 3 3.5-3 4.5 4"/></svg>`,
  video: `<svg viewBox="0 0 24 24" ${S}><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m10 9.5 5 2.5-5 2.5z"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" ${S}><path d="M12 3.5a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0v-6a3 3 0 0 0-3-3z"/><path d="M5.5 11.5v1a6.5 6.5 0 0 0 13 0v-1M12 19v1.5"/></svg>`,
  audio: `<svg viewBox="0 0 24 24" ${S}><path d="M4 12h2M8 9v6M12 5.5v13M16 8v8M20 11v2"/></svg>`,
  lipsync: `<svg viewBox="0 0 24 24" ${S}><path d="M4.5 12c3-4 12-4 15 0-3 4-12 4-15 0z"/><path d="M7.5 12h9"/></svg>`,
  box: `<svg viewBox="0 0 24 24" ${S}><path d="M3.5 7.5h17v12h-17z"/><path d="M3.5 7.5 7 4h10l3.5 3.5"/></svg>`,
  grid: `<svg viewBox="0 0 24 24" ${S}><rect x="3.5" y="5" width="7" height="4.5" rx="1"/><rect x="13.5" y="5" width="7" height="4.5" rx="1"/><rect x="3.5" y="14.5" width="7" height="4.5" rx="1"/><rect x="13.5" y="14.5" width="7" height="4.5" rx="1"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.8-1.6L13 2.5h-4l-.7 2.4a7 7 0 0 0-2.8 1.6l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .5.1 1.1.2 1.6l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.8 1.6l.7 2.4h4l.7-2.4a7 7 0 0 0 2.8-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6z"/></svg>`,
  person: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.2 3.3-4.6 6.5-4.6s5.8 1.4 6.5 4.6"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" ${S}><path d="M12 16V5.5M7.5 9.5 12 5l4.5 4.5"/><path d="M5 16v2.5h14V16"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>`,
  retry: `<svg viewBox="0 0 24 24" ${S.replace('1.7', '1.9')}><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3.5V7h-3.5"/></svg>`,
  ok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  send: `<svg viewBox="0 0 24 24" ${S.replace('1.7', '1.8')}><path d="M4 12h12M4 7h8M4 17h9"/><path d="m14 6 5 6-5 6"/></svg>`,
  dl: `<svg viewBox="0 0 24 24" ${S.replace('1.7', '1.8')}><path d="M12 4v11M7.5 11.5 12 16l4.5-4.5M5 19h14"/></svg>`,
  wave: `<svg viewBox="0 0 24 24" ${S}><path d="M4 12h2M8 9v6M12 5.5v13M16 8v8M20 11v2"/></svg>`,
  search: `<svg viewBox="0 0 24 24" ${S}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" ${S}><path d="M12 5v14M5 12h14"/></svg>`,
  dice: `<svg viewBox="0 0 24 24" ${S}><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="15" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="15" r="1" fill="currentColor"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5h5v5h-5z" fill="currentColor" stroke="none"/></svg>`,
  external: `<svg viewBox="0 0 24 24" ${S}><path d="M7 17 17 7M9 7h8v8"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" ${S}><path d="M3.5 6.5h6l2 2.5h9v9h-17z"/></svg>`,
  chevR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>`,
  chevD: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 6.5h16M4 12h16M4 17.5h16"/></svg>`,
  broom: `<svg viewBox="0 0 24 24" ${S}><path d="M14 3.5 20.5 10M9 9.5l5.5 5.5-4 4L5 13.5z"/><path d="M6.5 15.5 3.5 20.5M11 15l-2.5 5"/></svg>`,
  info: `<svg viewBox="0 0 24 24" ${S}><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 7.8v.4"/></svg>`,
  warn: `<svg viewBox="0 0 24 24" ${S}><path d="M10.3 4.2 2.8 17.5A1.5 1.5 0 0 0 4.1 19.7h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.2a1.5 1.5 0 0 0-2.6 0z"/><path d="M12 9.5v4M12 16.5v.5"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" ${S}><path d="m12 4 8 4.5-8 4.5-8-4.5z"/><path d="m4 13 8 4.5 8-4.5"/></svg>`,
}
