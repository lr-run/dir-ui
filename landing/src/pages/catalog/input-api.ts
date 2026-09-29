type Row = { name: string; type: string; default: string; detail: string }
const row = (name: string, type: string, fallback = '—', detail = ''): Row => ({
  name,
  type,
  default: fallback,
  detail,
})
const inputType =
  "'text' | 'email' | 'tel' | 'url' | 'password' | 'search' | 'number' | 'money' | 'percent' | 'date' | 'datetime-local'"
const typeRows = [
  row('type', inputType, 'text'),
  row('currency', 'string', 'USD', 'Currency label for type="money".'),
  row('min / max / step', 'number | string', '—', 'Native constraints for numeric and date inputs.'),
]
const inlineRows = [
  row('label', 'string', 'Required'),
  row('value', 'string', 'Required'),
  row(
    'onValueChange',
    '(value: string) => void | Promise<void>',
    'Required',
    'Emits the raw string. Convert to a number in the caller if needed. Rejected saves retain the draft.',
  ),
  row('disabled', 'boolean', 'false'),
  row('placeholder', 'string', 'Add a value'),
  row('validate', '(value: string) => string | undefined', '—', 'Return an error to prevent saving.'),
  row('display', 'ReactNode', 'Formatted value', 'Optional custom value display.'),
]
const inputRows = [
  row('value / defaultValue', 'string | number | readonly string[]'),
  row('onChange', 'ChangeEventHandler<HTMLInputElement>'),
  row('disabled / invalid', 'boolean', 'false'),
  row('id / name / placeholder', 'string'),
  row('ref', 'Ref<HTMLInputElement>'),
]
export const inputApi = {
  input: {
    names: 'Input, type InputProps, type InputType',
    path: 'components/ui/input.tsx',
    rows: [...inputRows, ...typeRows],
    types: '',
    notes:
      'Money and percent use the same numeric input with an adornment. Percent values are percentage points (60 = 60%). Dates use YYYY-MM-DD; local timestamps use YYYY-MM-DDTHH:mm. The disabled prop is the shared non-editable state. Other native input attributes are forwarded.',
  },
  textarea: {
    names: 'Textarea',
    path: 'components/ui/input.tsx',
    rows: [
      row('value / defaultValue', 'string'),
      row('onChange', 'ChangeEventHandler<HTMLTextAreaElement>'),
      row('rows', 'number', '4'),
      row('disabled / invalid', 'boolean', 'false'),
      row('id / name / placeholder', 'string'),
      row('ref', 'Ref<HTMLTextAreaElement>'),
    ],
    types: '',
    notes: 'Other native textarea attributes are forwarded.',
  },
  'inline-edit': {
    names: 'InlineInput',
    path: 'components/ui/inline-edit.tsx',
    rows: [
      ...inlineRows,
      ...typeRows.filter((r) => r.name !== 'min / max / step'),
      row('min / max / step', 'number | string / number | string / number | "any"', '— / — / any'),
      row('renderInput', '(props: InputProps) => ReactNode'),
    ],
    types: '',
    notes:
      'Input and InlineInput share the type options. Enter or an outside click saves; Escape cancels. Disabled values cannot open an editor. Pending saves prevent duplicate requests.',
  },
  'inline-textarea': {
    names: 'InlineTextarea',
    path: 'components/ui/inline-edit.tsx',
    rows: [...inlineRows, row('rows', 'number', '4')],
    types: '',
    notes:
      'The inline counterpart of Textarea. Cmd/Ctrl+Enter or an outside click saves; Enter inserts a newline and Escape cancels.',
  },
}
