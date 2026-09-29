import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Select } from '../../../../../components/ui/index.tsx'
import { Field, Textarea, TextInput } from '../../../../../components/ui/input.tsx'
import { ErrorBoundary } from '../../../../../components/ui/error-boundary.tsx'
import { type Control, parseControl, type Spec, type Values } from './model.ts'
import { inputSampleValues } from './examples.ts'
const previews = {
  extensions: lazy(() => import('./extensions.tsx')),
  basic: lazy(() => import('./basic.tsx')),
  advanced: lazy(() => import('./advanced.tsx')),
  charts: lazy(() => import('./charts.tsx')),
  records: lazy(() => import('./records.tsx')),
}
function JsonControl(
  { control, value, onChange }: {
    control: Control
    value: unknown
    onChange: (value: unknown) => void
  },
) {
  const [draft, setDraft] = useState(() => JSON.stringify(value, null, 2)), [error, setError] = useState('')
  const last = useRef(value)
  useEffect(() => {
    if (last.current !== value) {
      last.current = value
      setDraft(JSON.stringify(value, null, 2))
      setError('')
    }
  }, [value])
  return (
    <Field label={control.key} error={error}>
      {(props) => (
        <Textarea
          {...props}
          className='group/playground-json'
          spellCheck={false}
          rows={6}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value)
            const result = parseControl(control, event.target.value)
            const invalid = result.error
            setError(invalid ?? '')
            if (!invalid) {
              last.current = result.value
              onChange(result.value)
            }
          }}
        />
      )}
    </Field>
  )
}
export function Playground({ spec }: { spec: Spec }) {
  const [values, setValues] = useState<Values>(() => structuredClone(spec.defaults)),
    [revision, setRevision] = useState(0),
    [example, setExample] = useState(spec.examples?.[0]?.label ?? '')
  const update = (key: string, value: unknown) =>
    setValues((previous) => ({
      ...previous,
      [key]: value,
      ...(key === 'type' && (spec.id === 'input' || spec.id === 'inline-edit')
        ? { value: inputSampleValues[String(value)] ?? '' }
        : {}),
      ...(key === 'kind' ? { value: spec.id === 'filter-editor' ? { conjunction: 'and', conditions: [] } : [] } : {}),
      ...(key === 'value' && spec.id === 'inline-rich-text' ? { notesDoc: undefined } : {}),
    }))
  const Preview = previews[spec.group]
  return (
    <section
      id='preview'
      className='mt-8 scroll-mt-[calc(var(--docs-header-height)+24px)] min-w-0 [&_h2]:m-0 [&_h2]:text-sm [&_h2]:font-medium [&_h3]:m-0 [&_h3]:text-[13px] [&_h3]:font-medium'
      aria-label='Interactive example'
    >
      <header className='mb-3 flex h-8 items-center justify-between'>
        <h2>Preview</h2>
        <Button
          variant='ghost'
          onClick={() => {
            setValues(structuredClone(spec.defaults))
            setExample(spec.examples?.[0]?.label ?? '')
            setRevision((n) => n + 1)
          }}
        >
          Reset props
        </Button>
      </header>
      <div
        className="grid grid-cols-[minmax(0,_1fr)] [grid-template-areas:'preview'_'code'_'controls'] items-stretch"
        data-preview-size={spec.previewSize}
      >
        <ErrorBoundary key={`${spec.id}-${revision}`}>
          <Suspense fallback={null}>
            <Preview id={spec.id} values={values} update={update} />
          </Suspense>
        </ErrorBoundary>
        <form
          id='props'
          className="[grid-area:controls] scroll-mt-[calc(var(--docs-header-height)+24px)] grid grid-cols-[repeat(2,_minmax(0,_1fr))] [align-content:start] [align-items:start] gap-x-6 gap-y-5 mt-8 p-0 min-w-0 max-h-[none] overflow-visible [&>h3]:[grid-column:1_/_-1] [&_label]:text-[12px] [&_code]:text-[12px] [@media(max-width:_700px)]:grid-cols-[minmax(0,_1fr)] [&_textarea[data-slot='input']]:[field-sizing:content] [&_textarea[data-slot='input']]:h-auto [&_textarea[data-slot='input']]:max-h-[none] [&_textarea[data-slot='input']]:overflow-hidden [&_textarea[data-slot='input']]:resize-none [&_textarea[data-slot='input']]:whitespace-pre-wrap [&_textarea[data-slot='input']]:[overflow-wrap:anywhere] [&_[class~='group/crm-field']]:m-0 [&_[class~='group/crm-field']]:min-w-0 [&_[data-slot='input']]:w-full [&_[class~='group/playground-json']]:[font-family:ui-monospace,_monospace] [&_[class~='group/playground-json']]:text-[11px] [&_[class~='group/playground-json']]:leading-[1.6] [@media(max-width:_700px)]:[&_[data-slot='input']]:text-[16px]"
          aria-label='Preview props'
          onSubmit={(event) => event.preventDefault()}
          key={revision}
        >
          <h3 className='!text-base !font-semibold'>Props</h3>
          {spec.examples && (
            <Field label='examples'>
              {(props) => (
                <Select
                  id={props.id}
                  label='examples'
                  value={example}
                  items={[
                    ...(spec.examples ?? []).map((item) => ({ value: item.label, label: item.label })),
                    ...(example === 'Custom' ? [{ value: 'Custom', label: 'Custom' }] : []),
                  ]}
                  onChange={(label) => {
                    const selected = spec.examples?.find((item) => item.label === label)
                    if (!selected) return
                    setValues(structuredClone({ ...spec.defaults, ...selected.values }))
                    setExample(label)
                    setRevision((n) => n + 1)
                  }}
                />
              )}
            </Field>
          )}
          {spec.controls.filter((control) => {
            if (spec.id !== 'input' && spec.id !== 'inline-edit') return true
            if (control.key === 'currency') return values.type === 'money'
            if (['min', 'max', 'step'].includes(control.key)) {
              return ['number', 'money', 'percent'].includes(String(values.type))
            }
            return true
          }).map((control) =>
            control.type === 'json'
              ? (
                <JsonControl
                  key={control.key}
                  control={control}
                  value={values[control.key]}
                  onChange={(value) => {
                    setExample('Custom')
                    update(control.key, value)
                  }}
                />
              )
              : control.type === 'boolean'
              ? (
                <label className='flex items-center gap-[9px] text-[13px] cursor-pointer' key={control.key}>
                  <Checkbox
                    label={control.key}
                    checked={Boolean(values[control.key])}
                    onCheckedChange={(value) => {
                      setExample('Custom')
                      update(control.key, value)
                    }}
                  />
                  <code>{control.key}</code>
                </label>
              )
              : (
                <Field key={control.key} label={control.key}>
                  {(props) =>
                    control.type === 'select'
                      ? (
                        <Select
                          id={props.id}
                          label={control.key}
                          value={String(values[control.key])}
                          items={control.options!.map((value) => ({ value, label: value }))}
                          onChange={(value) => {
                            setExample('Custom')
                            update(control.key, value)
                          }}
                        />
                      )
                      : control.type === 'textarea'
                      ? (
                        <Textarea
                          {...props}
                          value={String(values[control.key] ?? '')}
                          onChange={(event) => {
                            setExample('Custom')
                            update(control.key, event.target.value)
                          }}
                        />
                      )
                      : (
                        <TextInput
                          {...props}
                          type={control.type === 'number' ? 'number' : 'text'}
                          min={control.min}
                          max={control.max}
                          value={String(values[control.key] ?? '')}
                          onChange={(event) => {
                            setExample('Custom')
                            if (control.type === 'number') {
                              const value = Number(event.target.value)
                              if (
                                event.target.value !== '' && Number.isFinite(value) &&
                                value >= (control.min ?? -Infinity) && value <= (control.max ?? Infinity)
                              ) update(control.key, value)
                            } else update(control.key, event.target.value)
                          }}
                        />
                      )}
                </Field>
              )
          )}
        </form>
      </div>
    </section>
  )
}
