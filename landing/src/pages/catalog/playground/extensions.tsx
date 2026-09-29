import { loadDemoSearchResults } from '../../../demo/loaders.ts'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Checkbox, I } from '../../../../../components/ui/index.tsx'
import { ChoiceValue, DateValue, NumberValue } from '../../../../../components/ui/value.tsx'
import { InlineCombobox, InlineMultiCombobox } from '../../../../../components/ui/inline-inputs.tsx'
import type { Choice } from '../../../../../components/ui/multi-select.tsx'
import { List, ListItem } from '../../../../../components/ui/list.tsx'
import {
  SearchDialog,
  SearchDialogTrigger,
  type SearchItem,
} from '../../../../../components/collections/search-dialog.tsx'
import { FileUpload } from '../../../../../components/collections/files.tsx'
import { bool, num, type PreviewProps, str } from './model.ts'
import { expression as e, jsx, source, state } from './code.ts'
import { Surface } from './surface.tsx'
const from = (name: string, path: string) => `import { ${name} } from './components/${path}'`
const searchApiCode =
  "// Async browser-only demo; replace this adapter with your API loader in production.\nimport { loadDemoSearchResults } from './demo/loaders.ts'\n"
const uploadCode =
  `async function upload(file: File, { signal, onProgress }: { signal: AbortSignal; onProgress: (n: number) => void }) {
  // Local preview adapter. Supply your storage adapter in an application.
  for (let n = 1; n <= 4; n++) {
    await new Promise<void>((resolve, reject) => {
      if (signal.aborted) { reject(new Error('Canceled')); return }
      const abort = () => { clearTimeout(timer); reject(new Error('Canceled')) }
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, 150)
      signal.addEventListener('abort', abort, { once: true })
    })
    onProgress(n * 25)
  }
  if (failUpload) throw new Error('Preview upload failed. Disable failUpload and retry.')
  const url = URL.createObjectURL(file)
  urls.current.push(url)
  return { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, url }
}`
export default function ExtensionsPreview({ id, values: v, update }: PreviewProps) {
  const [result, setResult] = useState(''), urls = useRef<string[]>([])
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), [])
  let preview: ReactNode, imports = '', setup = '', body = ''
  if (id === 'number-value') {
    const p = {
      value: num(v, 'value'),
      format: str(v, 'format') as 'number' | 'currency' | 'percent',
      currency: str(v, 'currency'),
      locale: str(v, 'locale'),
      maximumFractionDigits: num(v, 'maximumFractionDigits'),
    }
    preview = <NumberValue {...p} />
    imports = from('NumberValue', 'ui/value.tsx')
    body = jsx('NumberValue', p)
  } else if (id === 'date-value') {
    const p = {
      value: str(v, 'value'),
      locale: str(v, 'locale'),
      timeZone: str(v, 'timeZone'),
      includeTime: bool(v, 'includeTime'),
    }
    preview = <DateValue {...p} />
    imports = from('DateValue', 'ui/value.tsx')
    body = jsx('DateValue', p)
  } else if (id === 'choice-value') {
    const items = v.items as Choice[]
    preview = <ChoiceValue items={items} />
    imports = from('ChoiceValue', 'ui/value.tsx')
    body = jsx('ChoiceValue', { items })
  } else if (id === 'inline-combobox' || id === 'inline-multi-combobox') {
    const p = {
        label: str(v, 'label'),
        items: v.items as Choice[],
        disabled: bool(v, 'disabled'),
      },
      multiple = id === 'inline-multi-combobox',
      name = multiple ? 'InlineMultiCombobox' : 'InlineCombobox'
    preview = multiple
      ? <InlineMultiCombobox {...p} value={v.value as string[]} onValueChange={(next) => update('value', next)} />
      : <InlineCombobox {...p} value={str(v, 'value') || null} onValueChange={(next) => update('value', next)} />
    imports = from(name, 'ui/inline-inputs.tsx')
    setup = state('value', v.value, multiple ? 'string[]' : 'string | null')
    body = jsx(name, { ...p, value: e('value'), onValueChange: e('setValue') })
  } else if (id === 'list' || id === 'list-item') {
    type Item = { id: string; title: string; description?: string; meta?: string; done?: boolean }
    const items = v.items as Item[] ?? [],
      task = str(v, 'variant') === 'Tasks',
      activity = str(v, 'variant') === 'Activity',
      icons = str(v, 'variant') === 'Icons' || bool(v, 'showIcon')
    if (id === 'list') {
      preview = (
        <List>
          {items.length
            ? items.map((item) => (
              <ListItem
                key={item.id}
                title={item.title}
                description={item.description}
                meta={item.meta}
                leading={task
                  ? (
                    <Checkbox
                      label={`Complete ${item.title}`}
                      checked={!!item.done}
                      onCheckedChange={(done) =>
                        update('items', items.map((i) => i.id === item.id ? { ...i, done } : i))}
                    />
                  )
                  : activity
                  ? <span aria-hidden>◷</span>
                  : icons
                  ? <I name='text' />
                  : undefined}
              />
            ))
            : null}
        </List>
      )
      setup = state(
        'items',
        items,
        '{ id: string; title: string; description?: string; meta?: string; done?: boolean }[]',
      )
      body =
        `<List>{items.length ? items.map(item => <ListItem key={item.id} title={item.title} description={item.description} meta={item.meta}${
          task
            ? ' leading={<Checkbox label={`Complete ${item.title}`} checked={!!item.done} onCheckedChange={done => setItems(items.map(i => i.id === item.id ? {...i, done} : i))} />}'
            : activity
            ? ' leading={<span aria-hidden>◷</span>}'
            : icons
            ? ' leading={<I name="text" />}'
            : ''
        } />) : null}</List>`
    } else {
      const p = {
        title: str(v, 'title'),
        description: str(v, 'description'),
        meta: str(v, 'meta'),
        selected: bool(v, 'selected'),
      }
      preview = (
        <List>
          <ListItem {...p} leading={icons ? <I name='text' /> : undefined} />
        </List>
      )
      body = jsx('List', {}, jsx('ListItem', { ...p, leading: icons ? e('<I name="text" />') : undefined }))
    }
    imports = from('List, ListItem', 'ui/list.tsx') +
      (task ? '\n' + from('Checkbox', 'ui/index.tsx') : icons ? '\n' + from('I', 'ui/index.tsx') : '')
  } else if (id === 'search-dialog') {
    const p = {
      items: v.items as SearchItem[],
      query: str(v, 'query'),
      title: str(v, 'title'),
      placeholder: str(v, 'placeholder'),
      inputLabel: str(v, 'inputLabel'),
      emptyMessage: str(v, 'emptyMessage'),
      filter: bool(v, 'filter'),
      loading: bool(v, 'loading'),
      error: str(v, 'error'),
      shortcut: bool(v, 'shortcut'),
      maxVisible: num(v, 'maxVisible'),
      debounceMs: num(v, 'debounceMs'),
      minQueryLength: num(v, 'minQueryLength'),
      emptyQueryLabel: str(v, 'emptyQueryLabel'),
      selectLabel: str(v, 'selectLabel'),
    }
    const renderPreview = (item: SearchItem) => (
      <div className='[&>span]:text-muted-foreground [&>span]:text-[11px] [&_h3]:m-[10px_0_12px] [&_h3]:text-[16px] [&_h3]:font-semibold [&_p]:text-muted-foreground [&_p]:text-[13px] [&_p]:leading-[1.6] [&_dl]:grid [&_dl]:grid-cols-[80px_1fr] [&_dl]:gap-[12px] [&_dl]:mt-[24px] [&_dl]:text-[12px] [&_dt]:text-muted-foreground [&_dd]:m-0 [&_dd]:[overflow-wrap:anywhere]'>
        <span>{item.meta ?? item.group ?? 'Result'}</span>
        <h3>{item.label}</h3>
        <p>{item.description}</p>
        <dl>
          <dt>Category</dt>
          <dd>{item.group ?? 'Results'}</dd>
          <dt>Reference</dt>
          <dd>{item.id}</dd>
        </dl>
      </div>
    )
    preview = (
      <>
        <SearchDialogTrigger
          placeholder={str(v, 'triggerPlaceholder')}
          shortcut={p.shortcut}
          aria-expanded={bool(v, 'open')}
          onClick={() => update('open', true)}
        />
        <SearchDialog
          {...p}
          loadResults={bool(v, 'remote') ? loadDemoSearchResults : undefined}
          renderPreview={bool(v, 'showPreview') ? renderPreview : undefined}
          open={bool(v, 'open')}
          onOpenChange={(next) => update('open', next)}
          onQueryChange={(query) => update('query', query)}
          onSelect={(item) => setResult(`Selected: ${item.label}`)}
          onRetry={() => update('error', '')}
        />
        <output>{result}</output>
      </>
    )
    imports = from('SearchDialog, SearchDialogTrigger', 'collections/search-dialog.tsx') +
      (bool(v, 'remote') ? '\n' + searchApiCode : '')
    setup = state('query', p.query) + '\n' + state('result', '') + '\n' + state('open', v.open) + '\n' +
      state('error', p.error)
    body = '<>\n' +
      jsx('SearchDialogTrigger', {
        placeholder: v.triggerPlaceholder,
        shortcut: p.shortcut,
        'aria-expanded': e('open'),
        onClick: e('() => setOpen(true)'),
      }) + '\n' + jsx('SearchDialog', {
        ...p,
        loadResults: bool(v, 'remote') ? e('loadDemoSearchResults') : undefined,
        renderPreview: bool(v, 'showPreview')
          ? e(
            'item => <section><small>{item.meta ?? item.group ?? "Result"}</small><h3>{item.label}</h3><p>{item.description}</p><dl><dt>Category</dt><dd>{item.group ?? "Results"}</dd><dt>Reference</dt><dd>{item.id}</dd></dl></section>',
          )
          : undefined,
        query: e('query'),
        error: e('error'),
        open: e('open'),
        onOpenChange: e('setOpen'),
        onQueryChange: e('setQuery'),
        onSelect: e('item => setResult(`Selected: ${item.label}`)'),
        onRetry: e('() => setError("")'),
      }) + '\n<output>{result}</output>\n</>'
  } else if (id === 'file-upload') {
    const p = {
      label: str(v, 'label'),
      accept: str(v, 'accept'),
      maxSize: num(v, 'maxSize'),
      multiple: bool(v, 'multiple'),
      disabled: bool(v, 'disabled'),
    }
    preview = (
      <FileUpload
        {...p}
        upload={async (file, { signal, onProgress }) => {
          for (let n = 1; n <= 4; n++) {
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
              }, 150)
              signal.addEventListener('abort', abort, { once: true })
            })
            onProgress(n * 25)
          }
          if (bool(v, 'failUpload')) throw new Error('Preview upload failed. Disable failUpload and retry.')
          const url = URL.createObjectURL(file)
          urls.current.push(url)
          return { id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, url }
        }}
      />
    )
    imports = "import { useEffect, useRef } from 'react'\n" + from('FileUpload', 'collections/files.tsx')
    setup = `const failUpload = ${
      bool(v, 'failUpload')
    }\nconst urls = useRef<string[]>([])\nuseEffect(() => () => urls.current.forEach(url => URL.revokeObjectURL(url)), [])\n${uploadCode}`
    body = jsx('FileUpload', { ...p, upload: e('upload') })
  } else return null
  return <Surface code={source(imports, body, setup)}>{preview}</Surface>
}
