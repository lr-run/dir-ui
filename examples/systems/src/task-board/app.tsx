import { useEffect, useRef, useState } from 'react'
import {
  BlocksIcon,
  ChevronDownIcon,
  EyeOffIcon,
  FolderIcon,
  InboxIcon,
  LayersIcon,
  LayoutListIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react'
import { AppShell } from '@/components/shells/app-shell.tsx'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Select } from '@/components/ui/select.tsx'
import { TabBar } from '@/components/ui/tab-bar.tsx'
import { List } from '@/components/ui/list.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { ErrorState } from '@/components/ui/error-state.tsx'
import { Skeleton } from '@/components/ui/skeleton.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { filterTasks, moveTask, owners, projects, seedTasks, type Status, statuses } from './model.ts'
import { icon, Person, StatusIcon, TaskCard } from './parts.tsx'
import { items, NewIssue, TaskEditor } from './editor.tsx'
import './board.css'

/** Local example data only. No Linear connection, message delivery, or production writes. */
export function TaskBoardApp({ count = 25 }: { count?: number }) {
  const [tasks, setTasks] = useState(() => seedTasks(count))
  const [search, setSearch] = useState(''),
    [view, setView] = useState('all'),
    [owner, setOwner] = useState(''),
    [project, setProject] = useState('')
  const [selected, setSelected] = useState<string | null>(null), [creating, setCreating] = useState<Status | null>(null)
  const [hidden, setHidden] = useState<Status[]>(['backlog', 'canceled'])
  const [dragging, setDragging] = useState<string | null>(null), [drop, setDrop] = useState<Status | null>(null)
  const [loading, setLoading] = useState(true),
    [loadError, setLoadError] = useState(false),
    [busy, setBusy] = useState(false)
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [filters, setFilters] = useState(false)
  const gate = useRef(false), failNext = useRef(false), nextId = useRef(count + 12)
  const retry = useRef<null | (() => void)>(null)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])
  const mutate = async (apply: () => void, message: string) => {
    if (gate.current) throw new Error('A save is already in progress.')
    gate.current = true
    setBusy(true)
    setError('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 250))
      if (failNext.current) {
        failNext.current = false
        throw new Error('Simulated connection failure')
      }
      apply()
      setNotice(message)
    } finally {
      gate.current = false
      setBusy(false)
    }
  }
  const move = async (id: string, status: Status) => {
    if (gate.current || !tasks.some((task) => task.id === id && task.status !== status)) return
    retry.current = () => {
      void move(id, status)
    }
    try {
      await mutate(
        () => setTasks((previous) => moveTask(previous, id, status)),
        `Moved ${id} to ${statuses.find((item) => item.value === status)!.label}.`,
      )
      retry.current = null
    } catch {
      setError('Unable to move the issue. Retry the change.')
    }
  }
  const rows = filterTasks(tasks, search, view, owner, project)
  const activeTask = tasks.find((task) => task.id === selected)
  const visibleStatuses = statuses.filter((status) =>
    view === 'backlog' ? status.value === 'backlog' : !hidden.includes(status.value)
  )
  const navigate = (id: string) => {
    setOwner(id === 'my-issues' ? owners[1]! : '')
    setProject(projects.includes(id) ? id : '')
    if (id === 'review') {
      setView('active')
      setSearch('')
      setHidden(['backlog', 'todo', 'progress', 'done', 'canceled'])
    } else {
      setView('all')
      setHidden(['backlog', 'canceled'])
    }
  }
  const onDrop = (event: React.DragEvent, status: Status) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    setDragging(null)
    setDrop(null)
    if (tasks.some((task) => task.id === id)) void move(id, status)
  }
  return (
    <AppShell
      workspace={
        <>
          <span className='inline-flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground'>
            S
          </span>
          <span className='flex-1'>Studio workspace</span>
          <ChevronDownIcon {...icon} />
        </>
      }
      active={project || (owner === owners[1] ? 'my-issues' : hidden.includes('todo') ? 'review' : 'issues')}
      onNavigate={navigate}
      navigation={[{
        items: [{ id: 'issues', label: 'All issues', icon: <LayersIcon {...icon} /> }, {
          id: 'my-issues',
          label: 'My issues',
          icon: <UserRoundIcon {...icon} />,
        }, { id: 'review', label: 'Reviews', icon: <InboxIcon {...icon} /> }],
      }, { label: 'Workspace', items: projects.map((id) => ({ id, label: id, icon: <FolderIcon {...icon} /> })) }]}
      sidebarFooter={
        <div className='flex flex-col gap-3 p-3'>
          <div className='flex items-center gap-2 text-sm'>
            <Person name='Alex Morgan' />
            <span>Alex Morgan</span>
          </div>
          <span className='text-xs text-muted-foreground'>Demo · changes reset on reload</span>
        </div>
      }
      title={project || 'Product / Issues'}
      leading={<BlocksIcon {...icon} />}
      actions={
        <Button type='button' variant='default' onClick={() => setCreating('todo')} disabled={busy}>
          <PlusIcon {...icon} />New issue
        </Button>
      }
    >
      <div className='flex h-full min-h-0 min-w-0 flex-col'>
        <TabBar
          label='Issue views'
          value={view}
          onValueChange={setView}
          items={[{ value: 'active', label: 'Active' }, { value: 'backlog', label: 'Backlog' }, {
            value: 'all',
            label: 'All issues',
          }]}
          actions={
            <div className='flex gap-1'>
              <IconButton label='Filter issues' variant='ghost' onClick={() => setFilters(!filters)}>
                <SlidersHorizontalIcon {...icon} />
              </IconButton>
              <DropdownMenu>
                <DropdownMenuTrigger render={<IconButton label='Board options' variant='ghost' />}>
                  <MoreHorizontalIcon {...icon} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => {
                      setLoading(true)
                      setTimeout(() => setLoading(false), 1000)
                    }}
                  >
                    Preview loading
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLoadError(true)}>Preview load error</DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      failNext.current = true
                      setNotice('The next save will fail once. Retry will succeed.')
                    }}
                  >
                    Test next save failure
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setHidden([])}
                  >
                    Show all columns
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />
        <div className='flex flex-wrap items-center gap-3 border-b border-border px-4 py-3'>
          <SearchIcon {...icon} />
          <div className='min-w-0 flex-1'>
            <Input
              aria-label='Search issues'
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Search issues…'
            />
          </div>
          <span className='text-xs text-muted-foreground tabular-nums'>{rows.length} issues</span>
          <span className='hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex'>
            <LayoutListIcon {...icon} />Grouped by status
          </span>
        </div>
        {filters && (
          <div className='grid grid-cols-2 gap-4 border-b border-border p-4'>
            <Field label='Assignee'>
              {(props) => (
                <Select
                  {...props}
                  label='Filter by assignee'
                  value={owner}
                  onChange={setOwner}
                  items={[{ value: '', label: 'Everyone' }, ...items(owners)]}
                />
              )}
            </Field>
            <Field label='Project'>
              {(props) => (
                <Select
                  {...props}
                  label='Filter by project'
                  value={project}
                  onChange={setProject}
                  items={[{ value: '', label: 'All projects' }, ...items(projects)]}
                />
              )}
            </Field>
          </div>
        )}
        {error && <ErrorState message={error} retry={busy ? undefined : () => retry.current?.()} />}
        {loadError
          ? <ErrorState message='Unable to load your issues.' retry={() => setLoadError(false)} />
          : loading
          ? (
            <div role='status' aria-label='Loading board' className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-3'>
              {[0, 1, 2].map((column) => (
                <div key={column} className='flex flex-col gap-3'>
                  <Skeleton className='h-8 w-32' />
                  {[0, 1, 2].map((row) => <Skeleton key={row} className='h-36 w-full' />)}
                </div>
              ))}
            </div>
          )
          : tasks.length === 0
          ? (
            <EmptyState title='Your workspace starts here'>
              <Button type='button' onClick={() => setCreating('todo')}>Create your first issue</Button>
            </EmptyState>
          )
          : rows.length === 0
          ? (
            <EmptyState title='No issues match this view'>
              <Button
                type='button'
                onClick={() => {
                  setSearch('')
                  setOwner('')
                  setProject('')
                  setView('all')
                }}
              >
                Clear filters
              </Button>
            </EmptyState>
          )
          : (
            <div className='task-board-columns min-h-0 flex-1 gap-4 overflow-auto p-4' aria-label='Task board'>
              {visibleStatuses.map((status) => {
                const columnTasks = rows.filter((task) => task.status === status.value)
                return (
                  <section
                    key={status.value}
                    className='task-board-lane flex min-h-0 flex-col gap-3 p-2'
                    aria-label={`${status.label} column`}
                    data-drop={drop === status.value}
                    onDragOver={(event) => {
                      if (dragging && !busy) {
                        event.preventDefault()
                        setDrop(status.value)
                      }
                    }}
                    onDrop={(event) => onDrop(event, status.value)}
                  >
                    <div className='flex shrink-0 items-center gap-2 px-1 py-1'>
                      <StatusIcon status={status.value} />
                      <h2 className='text-sm font-medium'>{status.label}</h2>
                      <span className='text-xs text-muted-foreground tabular-nums'>{columnTasks.length}</span>
                      <div className='ml-auto flex gap-1'>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<IconButton label={`${status.label} options`} variant='ghost' />}
                          >
                            <MoreHorizontalIcon {...icon} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => {
                                setHidden((previous) => [...previous, status.value])
                                if (view === 'backlog') setView('all')
                              }}
                            >
                              <EyeOffIcon {...icon} />Hide column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <IconButton
                          label={`Add issue to ${status.label}`}
                          variant='ghost'
                          disabled={busy}
                          onClick={() => setCreating(status.value)}
                        >
                          <PlusIcon {...icon} />
                        </IconButton>
                      </div>
                    </div>
                    <div className='min-h-0 flex-1 overflow-auto'>
                      <List
                        separators='none'
                        className='flex flex-col gap-2'
                        empty={
                          <Button
                            type='button'
                            onClick={() => setCreating(status.value)}
                          >
                            Add issue
                          </Button>
                        }
                      >
                        {columnTasks.length
                          ? columnTasks.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              selected={selected === task.id}
                              disabled={busy}
                              onOpen={() => setSelected(task.id)}
                              onDrag={(id) => {
                                setDragging(id)
                                if (!id) setDrop(null)
                              }}
                            />
                          ))
                          : null}
                      </List>
                    </div>
                  </section>
                )
              })}
              {view !== 'backlog' && hidden.length > 0 && (
                <section className='flex flex-col gap-3 p-2' aria-label='Hidden columns'>
                  <h2 className='flex items-center gap-2 py-2 text-xs font-medium text-muted-foreground'>
                    <ChevronDownIcon {...icon} />Hidden columns
                  </h2>
                  {statuses.filter((status) =>
                    hidden.includes(status.value)
                  ).map((status) => (
                    <div
                      key={status.value}
                      onDragOver={(event) => {
                        if (dragging && !busy) event.preventDefault()
                      }}
                      onDrop={(event) =>
                        onDrop(event, status.value)}
                    >
                      <Button
                        type='button'
                        className='w-full'
                        onClick={() => setHidden((previous) => previous.filter((value) => value !== status.value))}
                      >
                        <StatusIcon status={status.value} />
                        {status.label}
                        <span className='ml-auto text-muted-foreground'>
                          {rows.filter((task) => task.status === status.value).length}
                        </span>
                      </Button>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        <div className='flex shrink-0 items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground'>
          <span role='status'>
            {busy ? 'Saving…' : notice || 'Drag cards between columns · Open an issue to edit properties'}
          </span>
          {notice && (
            <IconButton label='Dismiss notification' variant='ghost' onClick={() => setNotice('')}>
              <XIcon {...icon} />
            </IconButton>
          )}
        </div>
      </div>
      {activeTask && (
        <TaskEditor
          key={activeTask.id}
          task={activeTask}
          busy={busy}
          onClose={() => setSelected(null)}
          onSave={(task) =>
            mutate(
              () => setTasks((previous) => previous.map((item) => item.id === task.id ? task : item)),
              `${task.id} saved.`,
            )}
        />
      )}
      {creating && (
        <NewIssue
          status={creating}
          initialOwner={owner || undefined}
          initialProject={project || undefined}
          busy={busy}
          onClose={() => setCreating(null)}
          onCreate={(value) =>
            mutate(() => {
              const id = `TASK-${nextId.current++}`
              setTasks((
                previous,
              ) => [...previous, {
                ...value,
                id,
                due: '',
                label: 'Product',
                activity: ['You created this issue.'],
                comments: [],
              }])
              setSelected(id)
            }, 'Issue created.')}
        />
      )}
    </AppShell>
  )
}
