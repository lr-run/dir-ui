// Example source under a preview, after shadcn's docs: a faded peek with View Code, then the whole file with line
// numbers and a copy button. The highlighter covers the TSX the examples use; it is not a full parser.
import { CheckIcon, CopyIcon } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { IconButton } from '@dir/ui/components/ui/icon-button.tsx'

const tokenPattern =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)|\b(import|from|export|default|function|return|const|let|type|interface|if|else|as|new|async|await|true|false|null|undefined)\b|(?<=<\/?)([A-Za-z][\w.]*)|\b(\d+(?:\.\d+)?)\b/g
const tokenClasses = [
  'text-(--code-comment)',
  'text-(--code-string)',
  'text-(--code-keyword)',
  'text-(--code-tag)',
  'text-(--code-number)',
]

/** Splits code into lines of plain text and colored spans. */
function highlightLines(code: string) {
  const lines: ReactNode[][] = [[]]
  const push = (text: string, className?: string) =>
    text.split('\n').forEach((part, index) => {
      if (index) lines.push([])
      const line = lines[lines.length - 1]!
      if (part) line.push(className ? <span key={line.length} className={className}>{part}</span> : part)
    })
  let last = 0
  for (const match of code.matchAll(tokenPattern)) {
    push(code.slice(last, match.index))
    push(match[0], tokenClasses[match.slice(1).findIndex((group) => group !== undefined)])
    last = match.index + match[0].length
  }
  push(code.slice(last))
  return lines
}

/** Highlighted code; `numbers` adds a line-number gutter. */
export function CodeLines({ code, numbers = true, className = '' }: {
  code: string
  numbers?: boolean
  className?: string
}) {
  return (
    <pre className={`m-0 py-4 font-mono text-[12.5px] leading-[22px] ${className}`}>
      <code className='grid min-w-fit'>
        {highlightLines(code.trimEnd()).map((line, index) => (
          <span key={index} className={`flex pr-5 ${numbers ? '' : 'pl-5'}`}>
            {numbers && (
              <span aria-hidden='true' className='w-12 shrink-0 pr-5 text-right text-muted-foreground/60 select-none'>
                {index + 1}
              </span>
            )}
            <span className='whitespace-pre'>{line.length ? line : ' '}</span>
          </span>
        ))}
      </code>
    </pre>
  )
}

/** Copies `code`, then shows a check until the pointer leaves. */
export function CopyCodeButton({ code, className = '' }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <IconButton
      label={copied ? 'Copied' : 'Copy code'}
      variant='ghost'
      size='icon-sm'
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
        } catch { /* clipboard unavailable */ }
      }}
      onMouseLeave={() => setCopied(false)}
      onBlur={() => setCopied(false)}
    >
      {copied
        ? <CheckIcon size={14} strokeWidth={1.5} aria-hidden='true' />
        : <CopyIcon size={14} strokeWidth={1.5} aria-hidden='true' />}
    </IconButton>
  )
}

/** The example's code under its preview: three faded lines and View Code, then all of it. */
export function PreviewCode({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className='relative border-t border-border bg-(--ui-hover)'>
      {open
        ? (
          <>
            <div className='max-h-[480px] overflow-auto'>
              <CodeLines code={code} />
            </div>
            <CopyCodeButton code={code} className='absolute top-2.5 right-2.5 bg-(--ui-hover)' />
          </>
        )
        : (
          <>
            <div
              aria-hidden='true'
              className='max-h-[92px] overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent)]'
            >
              <CodeLines code={code} />
            </div>
            <div className='absolute inset-0 grid place-items-center'>
              <Button
                variant='outline'
                onClick={() => setOpen(true)}
                className='h-8 bg-background px-3 text-[13px] shadow-xs'
              >
                View Code
              </Button>
            </div>
          </>
        )}
    </div>
  )
}
