// Generate JSX as text only; user-provided values are never evaluated.
export const literal = (value: unknown) => JSON.stringify(value, null, 2)
export const expression = (code: string) => ({ expression: code })
type CodeProps = Record<string, unknown>
export function jsx(name: string, props: CodeProps = {}, children?: string): string {
  const attributes = Object.entries(props).filter(([, value]) => value !== undefined).map(([key, value]) => {
    const code = value && typeof value === 'object' && 'expression' in value ? String(value.expression) : literal(value)
    return `  ${key}={${code}}`
  })
  const opening = `<${name}${attributes.length ? '\n' + attributes.join('\n') + '\n' : ''}`
  return children === undefined
    ? `${opening}/>`
    : `${opening}>\n${children.split('\n').map((line) => '  ' + line).join('\n')}\n</${name}>`
}
export function source(imports: string, body: string, setup = '') {
  return `${
    setup.includes('useState') ? "import { useState } from 'react'\n" : ''
  }${imports}\n\nexport function Example() {\n${
    setup ? setup.split('\n').map((line) => '  ' + line).join('\n') + '\n' : ''
  }  return (\n${body.split('\n').map((line) => '    ' + line).join('\n')}\n  )\n}`
}
export const state = (name: string, value: unknown, type?: string) =>
  `const [${name}, set${name[0]!.toUpperCase() + name.slice(1)}] = useState${type ? `<${type}>` : ''}(${
    literal(value)
  })`
