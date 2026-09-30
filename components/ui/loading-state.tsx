export function LoadingState({ label }: { label: string }) {
  return (
    <div
      role='status'
      aria-label={label}
      className='grid gap-[14px] p-[24px] [&_span]:h-[16px] [&_span]:w-[85%] [&_span]:[background:var(--ui-hover)] [&_span]:rounded-[4px] [&_span:nth-child(2)]:w-[65%] [&_span:nth-child(3)]:w-[75%]'
    >
      <span />
      <span />
      <span />
    </div>
  )
}
