type Row = { name: string; type: string; default: string; detail: string }
type Api = { names: string; path: string; rows: Row[]; types: string; notes: string }
const row = (name: string, type: string, required = '—', detail = ''): Row => ({
  name,
  type,
  default: required,
  detail,
})
const api = (names: string, path: string, rows: Row[], types = '', notes = ''): Api => ({
  names,
  path: 'components/' + path,
  rows,
  types,
  notes,
})
const fieldType = `type QueryField = {
  id: string; label: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'select' | 'multiSelect' | 'relation'
  path?: string[]; options?: Choice[]; sortable?: boolean
  operators?: { id: string; label: string; input?: 'none' | 'single' | 'multiple' | 'range' | 'relative' }[]
  renderValue?: (props: { condition: FilterCondition; onChange: (value: FilterValue) => void; disabled?: boolean }) => ReactNode
}
type RecordSort = { field: string; direction: 'asc' | 'desc' }
type FilterCondition = { id: string; field: string; operator: string; value?: FilterValue }
type RecordFilter = { id?: string; conjunction: 'and' | 'or'; conditions: (FilterCondition | (RecordFilter & { id: string }))[] }
type FilterValue = string | number | boolean | null | (string | number)[] | { direction: 'past' | 'next'; amount: number; unit: 'day' | 'week' | 'month' }`
const choiceType =
  `type Choice = { value: string; label: string; description?: string; color?: string; avatar?: string; disabled?: boolean; keywords?: string[] }
type LoadChoices = (query: string, context: { signal: AbortSignal; cursor?: string }) => Promise<{ items: Choice[]; cursor?: string }>`
const choiceRows = [
  row('items', 'Choice[]', 'Required'),
  row('label', 'string', 'Required', 'Accessible input name.'),
  row('selectedItems', 'Choice[]', '[]', 'Supply selected labels that are absent from current search results.'),
  row('disabled / invalid', 'boolean', 'false'),
  row('loadOptions', 'LoadChoices', '—', 'Optional remote search. Honor the AbortSignal; keep this callback stable.'),
  row('debounceMs', 'number', '150'),
  row('maxVisible', 'number', '100', 'Bound rendered options; refine the query for larger result sets.'),
  row('renderOption / renderValue', '(item: Choice) => ReactNode', '—', 'renderValue customizes multi-value chips.'),
  row('onCreate', '(query: string) => void', '—', 'Optional create action; caller owns the workflow.'),
  row('placeholder', 'string', 'Search to select…'),
  row('clearable', 'boolean', 'true', 'Single selection only.'),
  row(
    'id / ref / onBlur / aria-describedby',
    'Input bindings',
    '—',
    'Connect controlled forms through React Hook Form Controller.',
  ),
]
const searchRows = [
  row(
    'loadResults',
    'LoadSearchResults',
    '—',
    'Remote adapter. Pass AbortSignal to fetch; return result items. Server order within each group is preserved without local filtering.',
  ),
  row(
    'debounceMs',
    'number',
    '250',
    'Remote search delay; cancels pending and in-flight requests on new input or close.',
  ),
  row('minQueryLength', 'number', '0', 'Do not request results below this trimmed query length.'),
  row(
    'SearchDialogTrigger.placeholder / shortcut',
    'string / boolean',
    'Search… / false',
    'Input-style button label and platform keyboard hint. Enable SearchDialog.shortcut separately.',
  ),
  row(
    'SearchDialogTrigger.…buttonProps',
    'ComponentProps<"button">',
    '—',
    'Supply onClick, aria-expanded, disabled, className, and ref.',
  ),
  row(
    'items',
    'readonly SearchItem[]',
    '[]',
    'Local results or initial suggestions; ignored when loadResults is supplied.',
  ),
  row(
    'onSelect',
    '(item: SearchItem) => void | Promise<void>',
    'Required',
    'Rejected promises display an error; duplicate selection is prevented.',
  ),
  row('query / onQueryChange', 'string / (query: string) => void', 'Uncontrolled'),
  row('filter', 'boolean', 'true', 'Applies to local items only. loadResults automatically bypasses local filtering.'),
  row('loading / error / onRetry', 'boolean / string / () => void'),
  row('maxVisible', 'number', '100'),
  row('placeholder', 'string', 'Search…'),
  row('inputLabel', 'string', 'Search', 'Accessible search field name.'),
  row(
    'emptyQueryLabel',
    'string',
    'Suggestions',
    'Fallback group label for caller-provided initial results; no history is stored.',
  ),
  row('selectLabel', 'string', 'Select', 'Label of the footer selection button.'),
  row(
    'renderPreview',
    '(item: SearchItem) => ReactNode',
    '—',
    'Optional content for the highlighted result. Updates on keyboard/pointer navigation; hidden below 600px. showPreview is a documentation-only control.',
  ),
  row('emptyMessage', 'ReactNode', 'No results found.'),
  row(
    'renderItem',
    '(item: SearchItem) => ReactNode',
    '—',
    'Customize result content; keyboard and selection behavior remain managed.',
  ),
]
const searchType =
  'type LoadSearchResults = (query: string, context: { signal: AbortSignal }) => Promise<readonly SearchItem[]>\ntype SearchItem = { id: string; label: string; group?: string; description?: string; keywords?: string[]; icon?: ReactNode; meta?: string; disabled?: boolean }'
const listRows = [
  row('children', 'ReactNode', '—'),
  row('empty', 'ReactNode', 'No items yet.', 'Pass null children for an empty collection.'),
  row('...props', 'ComponentProps<"ul">'),
]
const inlineRows = [
  row('label', 'string', 'Required'),
  row('value', 'number | null', 'Required'),
  row(
    'onValueChange',
    '(value: number | null) => void | Promise<void>',
    'Required',
    'Rejected saves retain the draft for retry.',
  ),
  row('disabled', 'boolean', 'false'),
  row('min / max / step', 'number / number / number | "any"', '— / — / any'),
  row('locale', 'string', 'en-US'),
]
export const extendedApi: Record<string, Api> = {
  'data-grid': api(
    'DataGrid, type DataGridProps, type GridSearchOptions, type GridSortOptions, type GridFilterOptions, type GridColumnSettings, type GridColumnState, type QueryField, type RecordSort, type RecordFilter, type Column, SelectColumn, renderTextEditor',
    'data-grid/data-grid.tsx',
    [
      row(
        'columns / rows',
        'readonly Column<R>[] / readonly R[]',
        'Required',
        'react-data-grid column definitions and caller-provided rows.',
      ),
      row(
        'search',
        'GridSearchOptions',
        '—',
        'Controlled search toolbar: value, onChange, optional label, placeholder and disabled. The caller filters rows or fetches remote results; search is combined with sort and filter in the example.',
      ),
      row(
        'columnMenus',
        'boolean',
        'true',
        'Shared App-style header menus: sort, freeze/unfreeze, move and hide. Hiding requires columnSettings. Custom renderHeaderCell and the selection column are preserved. Uses the same controlled columnSettings state.',
      ),
      row('rowKeyGetter', '(row: R) => Key', '—', 'Stable row identity; required for selection.'),
      row(
        'sort',
        'GridSortOptions',
        '—',
        'Built-in Sort menu. fields, value, onChange; optional disabled and maxSorts. Array order is sort priority. Controls header sorting unless native sort props are supplied.',
      ),
      row(
        'filter',
        'GridFilterOptions',
        '—',
        'Built-in Filter menu. fields, value, onChange; optional disabled, maxConditions, maxDepth, contextLabel. Maximum 3 levels including the root; maxDepth defaults to 2 nested levels and can only lower that limit. Valid edits apply immediately. Incomplete edits remain in the local draft; external value changes reset it.',
      ),
      row(
        'sort.fields / filter.fields',
        'readonly QueryField[]',
        'Required when enabled',
        'Caller-defined field IDs, types, operators, choice lookups, and custom value editors.',
      ),
      row(
        'columnSettings',
        'boolean | GridColumnSettings',
        'false',
        'true creates internal column settings. Pass columns, value, onChange, optional onReset/disabled for controlled settings. Visibility, order, and freeze are applied by DataGrid.',
      ),
      row('toolbar', 'ReactNode', '—', 'Additional caller-defined grid actions.'),
      row(
        'containerClassName / toolbarClassName',
        'string',
        '—',
        'Tailwind classes for the outer container and toolbar. className targets the grid itself.',
      ),
      row(
        'sortColumns / onSortColumnsChange',
        'SortColumn[] / callback',
        'Derived from sort',
        'Native overrides; keep them consistent with sort when using both.',
      ),
      row('selectedRows / onSelectedRowsChange', 'ReadonlySet<Key> / callback', '—', 'Native row selection.'),
      row(
        'onRowsChange / columns[].renderEditCell',
        'callback / component',
        '—',
        'Both are needed for editable columns.',
      ),
      row(
        'rowHeight / headerRowHeight / className / ref',
        'Native react-data-grid props',
        'Native defaults',
        'Row and header heights default to 40px. Remaining props are forwarded to react-data-grid. ref refers to the grid, not the toolbar.',
      ),
    ],
    fieldType + `
 type GridSortOptions = { fields: readonly QueryField[]; value: RecordSort[]; onChange: (value: RecordSort[]) => void; disabled?: boolean; maxSorts?: number }
 type GridFilterOptions = { fields: readonly QueryField[]; value: RecordFilter; onChange: (value: RecordFilter) => void; disabled?: boolean; maxConditions?: number; maxDepth?: number; contextLabel?: string }
 type GridColumnState = { id: string; visible: boolean; frozen?: boolean }
 type GridColumnSettings = { columns: readonly { id: string; label: string; required?: boolean; canFreeze?: boolean }[]; value: GridColumnState[]; onChange: (value: GridColumnState[]) => void; onReset?: () => void; disabled?: boolean }`,
    'Sort, Filter, and Columns are built-in DataGrid features, not separate public components. Sorting/filtering emit query state; the caller supplies the resulting rows for local or remote data. Do not sort individual loaded pages. Column settings apply locally. Record List exposes these options inside grid. Editable filtered collections must merge changed rows by stable ID into their source data.',
  ),
  'combobox': api('SingleCombobox', 'ui/multi-select.tsx', [
    row('value', 'string | null', 'Required'),
    row('onValueChange', '(value: string | null) => void', 'Required'),
    ...choiceRows,
  ], choiceType),
  'multi-combobox': api('MultiCombobox', 'ui/multi-select.tsx', [
    row('value', 'string[]', 'Required'),
    row('onValueChange', '(value: string[]) => void', 'Required'),
    ...choiceRows,
  ], choiceType),
  'number-value': api(
    'NumberValue, formatNumber',
    'ui/value.tsx',
    [
      row('value', 'number | null | undefined', 'Required'),
      row('format', '"number" | "currency" | "percent"', 'number'),
      row('currency', 'string', 'USD'),
      row('locale', 'string', 'en-US'),
      row('maximumFractionDigits', 'number', '2'),
    ],
    '',
    'Percent values use percentage points: 60 renders as 60%. Null, undefined, and non-finite values render an em dash.',
  ),
  'date-value': api(
    'DateValue, formatDate',
    'ui/value.tsx',
    [
      row('value', 'string | null | undefined', 'Required', 'YYYY-MM-DD or an ISO timestamp.'),
      row('locale', 'string', 'en-US'),
      row('timeZone', 'string', 'UTC'),
      row('includeTime', 'boolean', 'false'),
    ],
    '',
    'Date-only values preserve the calendar date. Use an explicit timestamp offset for timezone conversion.',
  ),
  'choice-value': api('ChoiceValue', 'ui/value.tsx', [
    row('items', 'readonly Choice[]', 'Required'),
    row('empty', 'ReactNode', '—'),
    row('onSelect', '(item: Choice) => void', '—', 'When supplied, each label becomes a button.'),
  ], choiceType),
  'inline-number': api('InlineNumber', 'ui/inline-inputs.tsx', inlineRows),
  'inline-money': api('InlineMoney', 'ui/inline-inputs.tsx', [...inlineRows, row('currency', 'string', 'USD')]),
  'inline-percent': api(
    'InlinePercent',
    'ui/inline-inputs.tsx',
    inlineRows,
    '',
    'Values are percentage points: 60 means 60%.',
  ),
  'inline-date': api('InlineDate', 'ui/inline-inputs.tsx', [
    row('label', 'string', 'Required'),
    row('value', 'string', 'Required', 'YYYY-MM-DD or empty string.'),
    row('onValueChange', '(value: string) => void | Promise<void>', 'Required'),
    row('disabled', 'boolean', 'false'),
    row('locale', 'string', 'en-US'),
  ]),
  'inline-datetime': api('InlineDateTime', 'ui/inline-inputs.tsx', [
    row('label', 'string', 'Required'),
    row('value', 'string', 'Required', 'YYYY-MM-DDTHH:mm; local wall time, no implicit timezone conversion.'),
    row('onValueChange', '(value: string) => void | Promise<void>', 'Required'),
    row('disabled', 'boolean', 'false'),
  ]),
  'inline-combobox': api('InlineCombobox', 'ui/inline-inputs.tsx', [
    row('value', 'string | null', 'Required'),
    row('onValueChange', '(value: string | null) => void | Promise<void>', 'Required'),
    ...choiceRows,
  ], choiceType),
  'inline-multi-combobox': api('InlineMultiCombobox', 'ui/inline-inputs.tsx', [
    row('value', 'string[]', 'Required'),
    row('onValueChange', '(value: string[]) => void | Promise<void>', 'Required'),
    ...choiceRows,
  ], choiceType),
  'list': api('List', 'ui/list.tsx', listRows),
  'list-item': api('ListItem', 'ui/list.tsx', [
    row('title', 'ReactNode', 'Required'),
    row('description / meta / children', 'ReactNode'),
    row('leading / trailing / actions', 'ReactNode'),
    row('selected', 'boolean', 'false'),
    row('...props', 'ComponentProps<"li">'),
  ]),
  'search-dialog': api(
    'SearchDialog, SearchDialogTrigger, type SearchDialogProps, type SearchItem, type LoadSearchResults',
    'collections/search-dialog.tsx',
    [
      ...searchRows,
      row('open / onOpenChange', 'boolean / (open: boolean) => void', 'Required'),
      row('title', 'string', 'Search'),
      row('shortcut', 'boolean', 'false', 'Opt in to one Cmd/Ctrl+K handler per application.'),
    ],
    searchType,
  ),
  'file-upload': api(
    'FileUpload, type FileUploadProps, type FileItem, type UploadFile',
    'collections/files.tsx',
    [
      row('upload', 'UploadFile', 'Required', 'Adapter owns storage and must honor cancellation.'),
      row('onComplete', '(file: FileItem) => void'),
      row('accept', 'string', '—', 'Comma-separated extensions or MIME patterns.'),
      row('maxSize', 'number', '20971520', 'Bytes per file; applications must also validate on the server.'),
      row('multiple', 'boolean', 'true'),
      row('concurrency', 'number', '2'),
      row('disabled', 'boolean', 'false'),
      row('label', 'string', 'Attach files'),
    ],
    'type FileItem = { id: string; name: string; size: number; type?: string; url?: string; status?: "queued" | "uploading" | "complete" | "error" | "canceled"; progress?: number; error?: string }\ntype UploadFile = (file: File, context: { signal: AbortSignal; onProgress: (percent: number) => void }) => Promise<FileItem>',
    'The preview uses a local object URL and stores no files on a server. failUpload is a preview-only control. Supply a storage adapter for persistence.',
  ),
}
