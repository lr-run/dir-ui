import type { Ref } from 'react'
export function IconPlaceholder(
  { lucide, className, ref, 'data-slot': slot }: {
    'data-slot'?: string
    lucide: string
    className?: string
    ref?: Ref<SVGSVGElement>
    tabler?: string
    hugeicons?: string
    phosphor?: string
    remixicon?: string
  },
) {
  const path = lucide === 'CheckIcon'
    ? 'm5 12 4 4L19 6'
    : lucide === 'XIcon'
    ? 'm6 6 12 12M6 18 18 6'
    : lucide === 'ChevronRightIcon'
    ? 'm10 7 5 5-5 5'
    : lucide === 'ChevronUpIcon'
    ? 'm7 14 5-5 5 5'
    : 'm7 10 5 5 5-5'
  return (
    <svg
      ref={ref}
      data-slot={slot}
      className={className}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.7'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={path} />
    </svg>
  )
}
