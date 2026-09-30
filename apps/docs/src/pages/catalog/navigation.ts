import { specs } from './playground/specs.ts'

const categories = [
  { label: 'Basics', ids: ['button', 'icons'] },
  { label: 'Layout', ids: ['header', 'sidebar', 'tabs'] },
  { label: 'Input', ids: ['field', 'input', 'textarea', 'rich-text', 'file-upload'] },
  { label: 'Selection', ids: ['checkbox', 'radio', 'switch', 'select', 'multi-select', 'combobox', 'multi-combobox'] },
  {
    label: 'Inline editing',
    ids: [
      'inline-edit',
      'inline-textarea',
      'inline-select',
      'inline-multi-select',
      'inline-combobox',
      'inline-multi-combobox',
      'inline-rich-text',
    ],
  },
  {
    label: 'Data display',
    ids: [
      'number-value',
      'date-value',
      'choice-value',
      'list',
      'list-item',
      'table',
      'data-grid',
      'chart',
    ],
  },
  {
    label: 'Overlay',
    ids: ['tooltip', 'popover', 'dropdown-menu', 'dialog', 'alert-dialog', 'sheet', 'search-dialog'],
  },
  { label: 'Feedback', ids: ['skeleton', 'empty-state', 'error-state', 'toast'] },
]
const byId = new Map(specs.map((spec) => [spec.id, spec]))
export const navigationGroups = categories.map(({ label, ids }) => ({
  label,
  items: ids.flatMap((id) => {
    const spec = byId.get(id)
    return spec ? [spec] : []
  }),
}))
export const categoryById = new Map(
  navigationGroups.flatMap((group) => group.items.map((spec) => [spec.id, group.label])),
)
