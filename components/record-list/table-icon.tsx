const paths: Record<string, string> = {
  text: 'M5 6h14M5 10h14M5 14h10M5 18h7',
  record: 'M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M17 13h1M17 17h1M3 21h18',
  email: 'M4 6h16v12H4zM4 6l8 6 8-6',
  url: 'M10 14l4-4M8 16l-2 2a4 4 0 0 1-6-6l4-4m12 0 2-2a4 4 0 0 1 6 6l-4 4',
  number: 'M9 3 7 21M17 3l-2 18M4 9h16M3 15h16',
  money: 'M12 2v20M17 6H9a4 4 0 0 0 0 8h6a3 3 0 0 1 0 6H6',
  percent: 'M5 19 19 5M5 5h3v3H5zM16 16h3v3h-3z',
  date: 'M4 5h16v16H4zM8 3v4M16 3v4M4 10h16M8 14h2M14 14h2',
  datetime: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7v5l3 2',
  boolean: 'M4 4h16v16H4zM8 12l3 3 5-6',
  status: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10',
  tags: 'M3 3h8l10 10-8 8L3 11zM7 7h.01',
  member: 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M4 21v-3a8 5 0 0 1 16 0v3',
  asc: 'M5 17V5M2 8l3-3 3 3M12 7h9M12 12h6M12 17h3',
  desc: 'M5 5v12M2 14l3 3 3-3M12 7h3M12 12h6M12 17h9',
  left: 'M19 12H5m5-5-5 5 5 5',
  right: 'M5 12h14m-5-5 5 5-5 5',
  edit: 'M4 20l4-1L20 7l-4-4L4 15zM14 5l4 4',
  hide: 'M3 3l18 18M10 6a12 12 0 0 1 11 6 15 15 0 0 1-4 4M6 6a15 15 0 0 0-5 6s4 7 11 7l3-1',
  settings: 'M8 3h8v3l3 2 2 4-2 4-3 2v3H8v-3l-3-2-2-4 2-4 3-2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  open: 'M4 4h16v16H4zM14 4v16M7 9l3 3-3 3',
}
export function TableIcon({ name }: { name: string }) {
  return (
    <svg
      width='15'
      height='15'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      <path d={paths[name] ?? paths.text} />
    </svg>
  )
}
