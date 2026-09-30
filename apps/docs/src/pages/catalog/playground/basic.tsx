import {
  AlignLeftIcon,
  ArchiveIcon,
  ArrowUpRightIcon,
  Building2Icon,
  ChartNoAxesColumnIcon,
  CheckIcon,
  DatabaseIcon,
  EllipsisIcon,
  InfoIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  TargetIcon,
  UserRoundIcon,
} from 'lucide-react'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Radio } from '@base-ui/react/radio'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Checkbox } from '@dir/ui/components/ui/checkbox.tsx'
import { EmptyState } from '@dir/ui/components/ui/empty-state.tsx'
import { ErrorState } from '@dir/ui/components/ui/error-state.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import { Switch } from '@base-ui/react/switch'
import { Field } from '@dir/ui/components/ui/field.tsx'
import { Input, type InputType } from '@dir/ui/components/ui/input.tsx'
import { Textarea } from '@dir/ui/components/ui/textarea.tsx'
import { type Choice } from '@dir/ui/lib/choice-types.ts'
import { MultiCombobox, SingleCombobox } from '@dir/ui/components/ui/combobox.tsx'
import { MultiSelect } from '@dir/ui/components/ui/multi-select.tsx'
import {
  InlineInput,
  InlineMultiSelect,
  InlineRichText,
  InlineSelect,
  InlineTextarea,
} from '@dir/ui/components/ui/inline-edit.tsx'
import { RichText } from '@dir/ui/components/ui/rich-text.tsx'
import { Skeleton } from '@dir/ui/components/ui/skeleton.tsx'
import type { Note } from '@dir/ui/components/ui/rich-text.tsx'
import { SelectionPreview } from './selection.tsx'
import { bool, num, type PreviewProps, str } from './model.ts'
import { expression as e, jsx, literal, source, state } from './code.ts'
import { Surface } from './surface.tsx'

export default function BasicPreview({ id, values: v, update }: PreviewProps) {
  const [message, setMessage] = useState('')
  if (id === 'combobox' || id === 'multi-combobox') return <SelectionPreview id={id} values={v} update={update} />
  const setValue = (value: unknown) => update('value', value)
  let preview: ReactNode, body = '', setup = '', imports = ''
  const from = (names: string, path: string) => `import { ${names} } from './components/${path}'`
  if (id === 'input' || id === 'textarea') {
    const p = {
      value: str(v, 'value'),
      placeholder: str(v, 'placeholder'),
      disabled: bool(v, 'disabled'),
      invalid: bool(v, 'invalid'),
      'aria-label': 'Example input',
    }
    const type = str(v, 'type') as InputType
    const extra = id === 'textarea' ? { rows: num(v, 'rows') } : {
      type,
      ...(['number', 'money', 'percent'].includes(type)
        ? { min: num(v, 'min'), max: num(v, 'max'), step: num(v, 'step') }
        : {}),
      ...(type === 'money' ? { currency: str(v, 'currency') } : {}),
    }
    const name = id === 'textarea' ? 'Textarea' : 'Input'
    preview = id === 'textarea'
      ? <Textarea {...p} rows={num(v, 'rows')} onChange={(event) => setValue(event.target.value)} />
      : <Input {...p} {...extra} onChange={(event) => setValue(event.target.value)} />
    imports = from(name, 'ui/input.tsx')
    setup = state('value', p.value)
    body = jsx(name, { ...p, ...extra, value: e('value'), onChange: e('event => setValue(event.target.value)') })
  } else if (
    ['select', 'combobox', 'multi-select', 'multi-combobox', 'inline-select', 'inline-multi-select'].includes(id)
  ) {
    const items = v.items as Choice[],
      label = str(v, 'label'),
      disabled = bool(v, 'disabled'),
      value = v.value as string | string[]
    const p = { items, label },
      multi = id.includes('multi'),
      name = id === 'select'
        ? 'Select'
        : id === 'combobox'
        ? 'SingleCombobox'
        : id === 'multi-select'
        ? 'MultiSelect'
        : id === 'multi-combobox'
        ? 'MultiCombobox'
        : id === 'inline-select'
        ? 'InlineSelect'
        : 'InlineMultiSelect'
    const common = { ...p, disabled, invalid: bool(v, 'invalid') }
    if (id === 'select') {
      preview = <Select {...p} disabled={disabled} invalid={common.invalid} value={String(value)} onChange={setValue} />
    } else if (id === 'combobox') {
      preview = (
        <SingleCombobox
          {...common}
          value={String(value) || null}
          onValueChange={(next) => setValue(next ?? '')}
        />
      )
    } else if (id === 'multi-select') {
      preview = <MultiSelect {...common} value={value as string[]} onValueChange={setValue} />
    } else if (id === 'multi-combobox') {
      preview = <MultiCombobox {...common} value={value as string[]} onValueChange={setValue} />
    } else if (id === 'inline-select') {
      preview = <InlineSelect {...p} disabled={disabled} value={String(value)} onValueChange={setValue} />
    } else preview = <InlineMultiSelect {...p} disabled={disabled} value={value as string[]} onValueChange={setValue} />
    imports = from(
      name,
      id === 'select'
        ? 'ui/select.tsx'
        : id.startsWith('inline-')
        ? 'ui/inline-choice.tsx'
        : id.includes('combobox')
        ? 'ui/combobox.tsx'
        : 'ui/multi-select.tsx',
    )
    setup = state(
      'value',
      multi ? value : id === 'combobox' ? str(v, 'value') || null : str(v, 'value'),
      multi ? 'string[]' : id === 'combobox' ? 'string | null' : 'string',
    )
    body = jsx(name, {
      ...p,
      ...(id === 'combobox'
        ? { disabled, invalid: common.invalid }
        : id === 'select'
        ? { disabled, invalid: common.invalid }
        : id.startsWith('inline-')
        ? { disabled }
        : { disabled, invalid: common.invalid }),
      value: e('value'),
      [id === 'select' ? 'onChange' : 'onValueChange']: e('setValue'),
    })
  } else if (id === 'button') {
    const p = {
      variant: str(v, 'variant') as ComponentProps<typeof Button>['variant'],
      size: str(v, 'size') as ComponentProps<typeof Button>['size'],
      disabled: bool(v, 'disabled'),
    }
    preview = (
      <div className='flex items-center gap-[10px] flex-wrap'>
        <Button {...p} onClick={() => setMessage('Action triggered')}>{str(v, 'children')}</Button>
        <output>{message}</output>
      </div>
    )
    imports = from('Button', 'ui/button.tsx')
    setup = state('message', '')
    body = `<>\n${
      jsx('Button', { ...p, onClick: e('() => setMessage("Action triggered")') }, `{${literal(v.children)}}`)
    }\n<output>{message}</output>\n</>`
  } else if (id === 'checkbox' || id === 'switch') {
    const p = { checked: bool(v, 'checked'), disabled: bool(v, 'disabled') },
      label = str(v, 'label')
    preview = (
      <label className='flex items-center gap-[9px] text-[13px] cursor-pointer'>
        {id === 'checkbox'
          ? (
            <Checkbox
              {...p}
              label={label}
              indeterminate={bool(v, 'indeterminate')}
              onCheckedChange={(next) => update('checked', next)}
            />
          )
          : (
            <Switch.Root
              {...p}
              className='w-[32px] h-[19px] [border:1px_solid_var(--ui-border)] [background:var(--ui-hover)] rounded-[30px] p-[2px] cursor-pointer [&>span]:block [&>span]:h-[13px] [&>span]:w-[13px] [&>span]:rounded-[50%] [&>span]:[background:white] [&>span]:[box-shadow:0_1px_3px_#0003] [&[data-checked]]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)] [&[data-checked]>span]:[transform:translateX(13px)]'
              onCheckedChange={(next) => update('checked', next)}
            >
              <Switch.Thumb />
            </Switch.Root>
          )}
        {label}
      </label>
    )
    imports = id === 'checkbox' ? from('Checkbox', 'ui/checkbox.tsx') : "import { Switch } from '@base-ui/react/switch'"
    setup = state('checked', p.checked)
    body = jsx(
      'label',
      { className: 'flex items-center gap-[9px] text-[13px] cursor-pointer' },
      jsx(id === 'checkbox' ? 'Checkbox' : 'Switch.Root', {
        ...p,
        checked: e('checked'),
        onCheckedChange: e('setChecked'),
        ...(id === 'checkbox' ? { label, indeterminate: bool(v, 'indeterminate') } : {
          className:
            'w-[32px] h-[19px] [border:1px_solid_var(--ui-border)] [background:var(--ui-hover)] rounded-[30px] p-[2px] cursor-pointer [&>span]:block [&>span]:h-[13px] [&>span]:w-[13px] [&>span]:rounded-[50%] [&>span]:[background:white] [&>span]:[box-shadow:0_1px_3px_#0003] [&[data-checked]]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)] [&[data-checked]>span]:[transform:translateX(13px)]',
        }),
      }, id === 'switch' ? '<Switch.Thumb />' : undefined) + `\n{${literal(label)}}`,
    )
  } else if (id === 'radio') {
    const items = v.items as Choice[],
      p = {
        value: str(v, 'value'),
        disabled: bool(v, 'disabled'),
        'aria-label': str(v, 'label'),
        className: 'flex items-center gap-[10px] flex-wrap',
      }
    preview = (
      <RadioGroup {...p} onValueChange={setValue}>
        {items.map((item) => (
          <label className='flex items-center gap-[9px] text-[13px] cursor-pointer' key={item.value}>
            <Radio.Root
              className='w-[16px] h-[16px] [border:1px_solid_var(--ui-border)] rounded-[50%] [background:var(--ui-surface)] grid [place-items:center] [&>span]:w-[8px] [&>span]:h-[8px] [&>span]:rounded-[50%] [&>span]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)]'
              value={item.value}
            >
              <Radio.Indicator />
            </Radio.Root>
            {item.label}
          </label>
        ))}
      </RadioGroup>
    )
    imports = "import { RadioGroup } from '@base-ui/react/radio-group'\nimport { Radio } from '@base-ui/react/radio'"
    setup = state('value', p.value)
    body = jsx(
      'RadioGroup',
      { ...p, value: e('value'), onValueChange: e('setValue') },
      items.map((item) =>
        jsx(
          'label',
          { className: 'flex items-center gap-[9px] text-[13px] cursor-pointer' },
          jsx('Radio.Root', {
            value: item.value,
            className:
              'w-[16px] h-[16px] [border:1px_solid_var(--ui-border)] rounded-[50%] [background:var(--ui-surface)] grid [place-items:center] [&>span]:w-[8px] [&>span]:h-[8px] [&>span]:rounded-[50%] [&>span]:[background:var(--ui-primary)] [&[data-checked]]:[border-color:var(--ui-primary)]',
          }, '<Radio.Indicator />') +
            `\n{${literal(item.label)}}`,
        )
      ).join('\n'),
    )
  } else if (id === 'field') {
    const p = {
      label: str(v, 'label'),
      description: str(v, 'description'),
      error: str(v, 'error'),
      required: bool(v, 'required'),
    }
    preview = (
      <Field {...p}>
        {(props) => <Input {...props} value={str(v, 'value')} onChange={(event) => setValue(event.target.value)} />}
      </Field>
    )
    imports = from('Field', 'ui/field.tsx') + '\n' + from('Input', 'ui/input.tsx')
    setup = state('value', v.value)
    body = jsx(
      'Field',
      p,
      '{props => <Input {...props} value={value} onChange={event => setValue(event.target.value)} />}',
    )
  } else if (id === 'inline-edit' || id === 'inline-textarea') {
    const type = str(v, 'type') as InputType
    const p = {
      label: str(v, 'label'),
      value: str(v, 'value'),
      disabled: bool(v, 'disabled'),
      placeholder: str(v, 'placeholder'),
      ...(id === 'inline-textarea' ? { rows: num(v, 'rows') } : {
        type,
        ...(['number', 'money', 'percent'].includes(type)
          ? { min: num(v, 'min'), max: num(v, 'max'), step: num(v, 'step') }
          : {}),
        ...(type === 'money' ? { currency: str(v, 'currency') } : {}),
      }),
    }
    const Component = id === 'inline-textarea' ? InlineTextarea : InlineInput
    const name = id === 'inline-textarea' ? 'InlineTextarea' : 'InlineInput'
    preview = <Component {...p} onValueChange={setValue} />
    imports = from(name, 'ui/inline-edit.tsx')
    setup = state('value', p.value)
    body = jsx(name, { ...p, value: e('value'), onValueChange: e('setValue') })
  } else if (id === 'inline-rich-text') {
    const value = { notes: str(v, 'value'), notesDoc: v.notesDoc as Note | undefined },
      p = { label: str(v, 'label'), disabled: bool(v, 'disabled') }
    preview = (
      <InlineRichText
        {...p}
        value={value}
        onValueChange={(next) => {
          setValue(next.notes)
          update('notesDoc', next.notesDoc)
        }}
      />
    )
    imports = from('InlineRichText', 'ui/inline-rich-text.tsx') +
      "\nimport type { Note } from './components/ui/rich-text.tsx'"
    setup = state('value', value, '{ notes: string; notesDoc?: Note }')
    body = jsx('InlineRichText', { ...p, value: e('value'), onValueChange: e('setValue') })
  } else if (id === 'rich-text') {
    const p = { label: str(v, 'label'), initialText: str(v, 'initialText'), disabled: bool(v, 'disabled') }
    preview = <RichText key={p.initialText} {...p} />
    imports = from('RichText', 'ui/rich-text.tsx')
    body = jsx('RichText', p)
  } else if (id === 'icons') {
    const icons = {
      Building2Icon,
      UserRoundIcon,
      TargetIcon,
      DatabaseIcon,
      SearchIcon,
      SlidersHorizontalIcon,
      ChartNoAxesColumnIcon,
      CheckIcon,
      PlusIcon,
      ArchiveIcon,
      ArrowUpRightIcon,
      EllipsisIcon,
      PencilIcon,
      InfoIcon,
      AlignLeftIcon,
      RefreshCwIcon,
    }
    const name = str(v, 'example') as keyof typeof icons
    const Icon = icons[name] ?? SearchIcon
    const props = { size: Number(v.size), strokeWidth: Number(v.strokeWidth), 'aria-hidden': true as const }
    preview = <Icon {...props} />
    imports = `import { ${name} } from 'lucide-react'`
    body = jsx(name, props)
  } else if (id === 'empty-state') {
    preview = <EmptyState title={str(v, 'title')}>{str(v, 'children')}</EmptyState>
    imports = from('EmptyState', 'ui/empty-state.tsx')
    body = jsx('EmptyState', { title: v.title }, `{${literal(v.children)}}`)
  } else if (id === 'error-state') {
    preview = (
      <>
        <ErrorState
          message={str(v, 'message')}
          retry={bool(v, 'retry') ? () => setMessage('Retry requested') : undefined}
        />
        <output>{message}</output>
      </>
    )
    imports = from('ErrorState', 'ui/error-state.tsx')
    setup = state('message', '')
    body = `<>\n${
      jsx('ErrorState', {
        message: v.message,
        retry: bool(v, 'retry') ? e('() => setMessage("Retry requested")') : undefined,
      })
    }\n<output>{message}</output>\n</>`
  } else if (id === 'skeleton') {
    preview = <Skeleton className={str(v, 'className')} aria-label='Loading content' />
    imports = from('Skeleton', 'ui/skeleton.tsx')
    body = jsx('Skeleton', { className: v.className, 'aria-label': 'Loading content' })
  }
  return <Surface code={source(imports, body, setup)}>{preview}</Surface>
}
