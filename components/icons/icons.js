const icons = {
  pin: '<path d="M16 3l5 5-4 1-4 4-1 4-5-5 4-1 4-4 1-4ZM7 17l-4 4"/>',
  hide: '<path d="m3 3 18 18M10 6a12 12 0 0 1 11 6 15 15 0 0 1-4 4M6 6a15 15 0 0 0-5 6s4 7 11 7l3-1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  edit: '<path d="m15 4 5 5M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15v5Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  text: '<path d="M4 5h16M4 10h16M4 15h16M4 20h10"/>',

  relay:
    '<path d="m8 3 5 3-5 3-5-3 5-3Zm8 6 5 3-5 3-5-3 5-3ZM8 15l5 3-5 3-5-3 5-3Z"/><path d="m3 6 0 6 5 3m5-9 3 3M8 9v6m8 0v3l-3 0"/>',
  building:
    '<path d="M3 21V7l9-4v18M12 9h9v12H3M6 9h2m-2 4h2m-2 4h2m7-4h2m-2 4h2"/>',
  board:
    '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v16M5 8h2m4 0h2m4 0h2M5 11h2m6 0h-2"/>',
  chart: '<path d="M4 20V5m0 15h17M8 16v-5m5 5V7m5 9V3"/>',
  user: '<circle cx="12" cy="8" r="3"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6-5.4-2.8-5.4 2.8 1-6L2.2 9.4l6.1-.9L12 3Z"/>',
  sliders:
    '<path d="M4 7h8m4 0h4M4 17h4m4 0h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
  monitor:
    '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  chevrons: '<path d="m8 9 4-4 4 4m-8 6 4 4 4-4"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v11m-4-4 4 4 4-4M5 14v6h14v-6"/>',
  database:
    '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 4 16 4 16 0V5M4 12v7c0 4 16 4 16 0v-7"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  phone:
    '<path d="M6 3h4l1 5-3 2a15 15 0 0 0 6 6l2-3 5 1v4a3 3 0 0 1-3 3C9 20 4 15 3 6a3 3 0 0 1 3-3Z"/>',
  archive:
    '<rect x="3" y="3" width="18" height="4" rx="1"/><path d="M5 7v14h14V7M10 11h4"/>',
  expand: '<path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  empty: '<path d="M3 8h18v12H3V8Zm0 0 4-5h10l4 5M8 12h8"/>',
  warning: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3v.1"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  refresh:
    '<path d="M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5m-4 8a8 8 0 0 0 14 3l3-3m0 5v-5h-5"/>',
};
const icon = (name) =>
  '<svg class="[svg&]:block [svg&]:w-[16px] [svg&]:h-[16px] [svg&]:[fill:none] [svg&]:[stroke:currentColor] [svg&]:[stroke-width:1.5] [svg&]:[stroke-linecap:round] [svg&]:[stroke-linejoin:round] [svg&]:shrink-0" viewBox="0 0 24 24" aria-hidden="true">' +
  (icons[name] || icons.building) +
  "</svg>";

export { icons, icon };
