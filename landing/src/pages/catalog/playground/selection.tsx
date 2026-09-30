import { useCallback } from 'react'
import { type Choice } from '../../../../../lib/choice-types.ts'
import { type LoadChoices } from '../../../../../hooks/use-choices.ts'
import { MultiCombobox, SingleCombobox } from '../../../../../components/ui/combobox.tsx'
import { bool, num, type PreviewProps, str } from './model.ts'
import { expression as e, jsx, literal, source, state } from './code.ts'
import { Surface } from './surface.tsx'
export function SelectionPreview({ id, values: v, update }: PreviewProps) {
  const items = v.items as Choice[],
    remote = bool(v, 'remoteSearch'),
    fail = bool(v, 'failSearch'),
    multiple = id === 'multi-combobox'
  const loadOptions = useCallback<LoadChoices>(async (query, { signal, cursor }) => {
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new Error('Canceled'))
        return
      }
      const abort = () => {
        clearTimeout(timer)
        reject(new Error('Canceled'))
      }
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', abort)
        resolve()
      }, 200)
      signal.addEventListener('abort', abort, { once: true })
    })
    if (fail) throw new Error('Preview search failed. Disable failSearch and retry.')
    const matches = items.filter((i) =>
        (i.label + ' ' + (i.description ?? '')).toLowerCase().includes(query.toLowerCase())
      ),
      offset = Number(cursor ?? 0),
      page = matches.slice(offset, offset + 2)
    return { items: page, cursor: offset + 2 < matches.length ? String(offset + 2) : undefined }
  }, [items, fail])
  const p = {
    items: remote ? [] : items,
    selectedItems: items,
    label: str(v, 'label'),
    disabled: bool(v, 'disabled'),
    invalid: bool(v, 'invalid'),
    placeholder: str(v, 'placeholder'),
    maxVisible: num(v, 'maxVisible'),
  }
  const name = multiple ? 'MultiCombobox' : 'SingleCombobox'
  const imports =
    `import { useCallback } from 'react'\nimport { ${name}, type Choice, type LoadChoices } from './components/ui/multi-select.tsx'`
  const setup = state('value', v.value, multiple ? 'string[]' : 'string | null') +
    `\nconst items: Choice[] = ${literal(items)}` +
    (remote
      ? `\nconst failSearch = ${fail}\nconst loadOptions = useCallback<LoadChoices>(async (query, { signal, cursor }) => {
  // Preview adapter. Replace this body with your search API.
  if (signal.aborted) throw new Error('Canceled')
  if (failSearch) throw new Error('Preview search failed.')
  const matches = items.filter(i => (i.label + ' ' + (i.description ?? '')).toLowerCase().includes(query.toLowerCase()))
  const offset = Number(cursor ?? 0)
  return { items: matches.slice(offset, offset + 2), cursor: offset + 2 < matches.length ? String(offset + 2) : undefined }
}, [items, failSearch])`
      : '')
  const body = jsx(name, {
    ...p,
    items: e(remote ? '[]' : 'items'),
    selectedItems: e('items'),
    value: e('value'),
    onValueChange: e('setValue'),
    ...(remote ? { loadOptions: e('loadOptions') } : {}),
  })
  return (
    <Surface code={source(imports, body, setup)}>
      {multiple
        ? (
          <MultiCombobox
            {...p}
            value={v.value as string[]}
            loadOptions={remote ? loadOptions : undefined}
            onValueChange={(next) => update('value', next)}
          />
        )
        : (
          <SingleCombobox
            {...p}
            value={str(v, 'value') || null}
            loadOptions={remote ? loadOptions : undefined}
            onValueChange={(next) => update('value', next)}
          />
        )}
    </Surface>
  )
}
