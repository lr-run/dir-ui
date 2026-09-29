import { useMemo } from 'react'

type Piece = { text: string; token?: string }
// A small display-only highlighter. Source is always rendered as escaped React text.
function sourceLines(source: string) {
  const pattern =
    /(?<comment>\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(?<string>'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(?<keyword>\b(?:import|export|from|default|function|return|const|let|if|else|true|false|null|undefined|type|interface|readonly|as|new|async|await|throw|typeof|number|string|boolean)\b)|(?<number>\b\d+(?:\.\d+)?\b)/g
  const lines: Piece[][] = [[]]
  const append = (text: string, token?: string) => {
    text.split('\n').forEach((part, index) => {
      if (index) lines.push([])
      if (part) lines[lines.length - 1]!.push({ text: part, token })
    })
  }
  let offset = 0
  for (const match of source.trimEnd().matchAll(pattern)) {
    append(source.slice(offset, match.index))
    append(match[0], Object.keys(match.groups ?? {}).find((key) => match.groups?.[key] !== undefined))
    offset = match.index + match[0].length
  }
  append(source.trimEnd().slice(offset))
  return lines
}
export function SourceViewer({ source }: { source: string }) {
  const lines = useMemo(() => sourceLines(source), [source])
  return (
    <div className='flex-1 min-h-0 min-w-0 overflow-auto outline-offset-[-1px]' tabIndex={0} aria-label='Source code'>
      <pre className='m-0 p-[8px_0_32px] min-w-[max-content] text-[12px] leading-[21px] [tab-size:2] [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Consolas,_monospace] [&_code]:[font:inherit]'><code>{lines.map((line, index) => (
        <span className="flex min-h-[21px] [&:hover]:[background:color-mix(in_srgb,_var(--ui-text)_2%,_transparent)]" key={index}>
          <span className="sticky left-0 [background:var(--ui-canvas)] text-muted-foreground select-none w-[58px] shrink-0 pr-[20px] text-right text-[11px]" aria-hidden='true'>{index + 1}</span>
          <span className="block pr-[28px]">{line.length ? line.map((piece, part) => (
            <span key={part} className={piece.token ? ({ comment: "text-[light-dark(#7d8491,_#7f8a9c)] italic", string: "text-[light-dark(#267b49,_#9ccc91)]", keyword: "text-[light-dark(#994bb0,_#c792ea)]", number: "text-[light-dark(#a76814,_#e5b478)]", tag: 'syntax-tag', attribute: 'syntax-attribute', punctuation: 'syntax-punctuation', property: 'syntax-property' } as Record<string, string>)[piece.token] : undefined}>{piece.text}</span>
          )) : null}</span>
        </span>
      ))}</code></pre>
    </div>
  )
}
