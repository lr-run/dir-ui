import { specs } from '../landing/src/pages/catalog/playground/specs.ts'
import { parseControl } from '../landing/src/pages/catalog/playground/model.ts'
import { componentApi } from '../landing/src/pages/catalog/api-data.ts'
import { jsx } from '../landing/src/pages/catalog/playground/code.ts'
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message)
}
Deno.test('every component page has English documentation and valid editable props', () => {
  const ids = new Set<string>()
  for (const spec of specs) {
    assert(!ids.has(spec.id), `Duplicate route ${spec.id}`)
    ids.add(spec.id)
    assert(spec.description && spec.controls.length, `Missing documentation or controls for ${spec.id}`)
    assert(spec.id in componentApi, `Missing API reference for ${spec.id}`)
    for (const control of spec.controls) {
      assert(control.key in spec.defaults, `Missing default for ${spec.id}.${control.key}`)
      if (control.type === 'json') {
        assert(
          !parseControl(control, JSON.stringify(spec.defaults[control.key])).error,
          `Invalid default for ${spec.id}.${control.key}`,
        )
      }
    }
  }
  assert(
    !/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(
      JSON.stringify(componentApi) + JSON.stringify(specs),
    ),
    'Documentation must be English',
  )
})
Deno.test('JSON controls reject malformed values and duplicate row identities', () => {
  const control = { key: 'rows', type: 'json', schema: 'rows' } as const
  assert(!!parseControl(control, '[').error, 'Malformed JSON must not reach the preview')
  assert(!!parseControl(control, '[{"id":1}]').error, 'Incomplete rows must be rejected')
  assert(
    !!parseControl(
      control,
      JSON.stringify([{ id: 1, name: 'A', team: 'Sales', email: '' }, { id: 1, name: 'B', team: 'Sales', email: '' }]),
    ).error,
    'Duplicate identities must be rejected',
  )
})
Deno.test('generated JSX preserves special characters as string data', () => {
  const value = 'Quotes " and a newline\n</Button>{danger()}'
  const code = jsx('TextInput', { value })
  assert(code.includes(`value={${JSON.stringify(value)}}`), 'User text must remain a quoted JS string')
})

Deno.test('example presets satisfy the editable prop schemas', () => {
  for (const spec of specs) {
    for (const example of spec.examples ?? []) {
      const values = { ...spec.defaults, ...example.values }
      for (const control of spec.controls) {
        if (control.type === 'json') {
          assert(
            !parseControl(control, JSON.stringify(values[control.key])).error,
            `${spec.id}/${example.label}: invalid ${control.key}`,
          )
        } else if (control.type === 'select') {
          assert(
            control.options?.includes(String(values[control.key])),
            `${spec.id}/${example.label}: invalid option ${control.key}`,
          )
        }
      }
    }
  }
})
