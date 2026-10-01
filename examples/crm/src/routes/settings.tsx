import { ActionsMenu } from '@/components/crm/components/actions-menu.tsx'
import { useErrorNotification } from '@/lib/error-notifications.tsx'
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, PlusIcon, Trash2Icon, UserXIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button.tsx'
import { IconButton } from '@/components/ui/icon-button.tsx'
import { InlineEdit } from '@/components/ui/inline-edit.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { ConfirmDialog } from '@/components/ui/alert-dialog.tsx'
import { Header } from '@/components/header.tsx'
import { TextField } from '@/components/crm/components/record-fields.tsx'
import { WorkspaceSidebarTrigger } from '@/components/crm/layout.tsx'
import type { CrmStore, Stage } from '@/components/crm/types.ts'
export default function Settings({ store }: { store: CrmStore }) {
  const notifyError = useErrorNotification()
  const [creating, setCreating] = useState(false),
    [deleting, setDeleting] = useState<Stage | null>(null)
  const [inactive, setInactive] = useState(false)
  const visibleUsers = store.state.users.filter((user) => user.isActive !== inactive)
  const stages = [...store.state.stages].sort((a, b) => a.sortOrder - b.sortOrder)
  const act = (fn: () => void) => {
    try {
      fn()
    } catch (e) {
      notifyError?.(e, 'Unable to save.')
    }
  }
  const move = (i: number, to: number) => {
    const a = stages[i], b = stages[to]
    if (a && b) {
      act(() => {
        store.saveStage({ ...a, sortOrder: b.sortOrder })
        store.saveStage({ ...b, sortOrder: a.sortOrder })
      })
    }
  }
  return (
    <>
      <Header leading={<WorkspaceSidebarTrigger />} title='Settings' />
      <div className='flex-1 overflow-auto p-5'>
        <div className='mx-auto max-w-4xl'>
          <Tabs defaultValue='stages'>
            <TabsList aria-label='Settings sections'>
              <TabsTrigger value='stages'>Deal stages</TabsTrigger>
              <TabsTrigger value='users'>Users</TabsTrigger>
            </TabsList>

            <TabsContent value='stages' className='pt-6'>
              <div className='mb-5 flex items-center justify-between gap-3'>
                <div className='pl-[10px]'>
                  <h1 className='text-base font-semibold'>Deal stages</h1>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Rename and reorder stages. Only unused stages can be deleted.
                  </p>
                </div>
                <Button className='h-7 text-xs' onClick={() => setCreating(true)}>
                  <PlusIcon size={14} />Add stage
                </Button>
              </div>
              <div className='overflow-x-auto rounded-lg border border-border'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-muted/50 text-xs text-muted-foreground'>
                    <tr>
                      <th className='p-3 font-medium'>Stage</th>
                      <th className='p-3 font-medium'>Order</th>
                      <th>
                        <span className='sr-only'>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map((stage, i) => {
                      const used = store.state.records.some((r) => r.kind === 'deals' && r.stageId === stage.id)
                      return (
                        <tr key={stage.id} className='border-t border-border'>
                          <td className='min-w-40 p-2'>
                            <InlineEdit
                              label={`Stage name ${stage.name}`}
                              value={stage.name}
                              onValueChange={(name) => store.saveStage({ ...stage, name })}
                            />
                          </td>
                          <td className='p-2'>
                            <div className='flex'>
                              <IconButton
                                label={`Move ${stage.name} up`}
                                disabled={i === 0}
                                variant='ghost'
                                onClick={() => move(i, i - 1)}
                              >
                                <ArrowUpIcon size={14} />
                              </IconButton>
                              <IconButton
                                label={`Move ${stage.name} down`}
                                disabled={i === stages.length - 1}
                                variant='ghost'
                                onClick={() => move(i, i + 1)}
                              >
                                <ArrowDownIcon size={14} />
                              </IconButton>
                            </div>
                          </td>
                          <td className='p-2'>
                            <IconButton
                              label={`Delete ${stage.name}`}
                              disabled={used}
                              variant='ghost'
                              onClick={() => setDeleting(stage)}
                            >
                              <Trash2Icon size={14} />
                            </IconButton>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            <TabsContent value='users' className='pt-6'>
              <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
                <div className='pl-[10px]'>
                  <div className='flex items-center gap-2'>
                    <h1 className='text-base font-semibold'>Users</h1>
                    {inactive && (
                      <span className='rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground'>Inactive</span>
                    )}
                    <span className='text-xs tabular-nums text-muted-foreground'>{visibleUsers.length}</span>
                  </div>
                  <p className='mt-1 text-xs text-muted-foreground'>Workspace members and their current status.</p>
                </div>
                {inactive
                  ? (
                    <Button size='sm' variant='ghost' onClick={() => setInactive(false)}>
                      <ArrowLeftIcon size={14} aria-hidden />Back to active users
                    </Button>
                  )
                  : (
                    <ActionsMenu
                      label='Users options'
                      items={[{
                        label: 'View inactive users',
                        icon: <UserXIcon size={14} aria-hidden />,
                        onClick: () => setInactive(true),
                      }]}
                    />
                  )}
              </div>
              <div className='overflow-x-auto rounded-lg border border-border'>
                <table className='w-full text-left text-sm'>
                  <thead className='bg-muted/50 text-xs text-muted-foreground'>
                    <tr>
                      <th className='p-3 font-medium'>Name</th>
                      <th className='p-3 font-medium'>Email</th>
                      <th className='p-3 font-medium'>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!visibleUsers.length && (
                      <tr>
                        <td colSpan={3} className='p-8 text-center text-sm text-muted-foreground'>
                          {inactive ? 'No inactive users.' : 'No active users.'}
                        </td>
                      </tr>
                    )}
                    {visibleUsers.map((u) => (
                      <tr key={u.id} className='border-t border-border'>
                        <td className='min-w-40 p-3 font-medium'>{u.name}</td>
                        <td className='min-w-56 p-3 text-muted-foreground'>{u.email}</td>
                        <td className='p-3'>
                          <span className='inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground'>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {creating && <CreateStage store={store} onClose={() => setCreating(false)} />}
      {deleting && (
        <ConfirmDialog
          open
          title={`Delete ${deleting.name}?`}
          description='Only unused stages can be deleted. Change history is retained.'
          action='Delete stage'
          onOpenChange={(open) => {
            if (!open) setDeleting(null)
          }}
          onConfirm={() =>
            act(() => {
              store.saveStage(deleting, true)
              setDeleting(null)
            })}
        />
      )}
    </>
  )
}
function CreateStage({ store, onClose }: { store: CrmStore; onClose: () => void }) {
  const notifyError = useErrorNotification()
  const { register, handleSubmit } = useForm<
    { name: string }
  >({ defaultValues: { name: '' } })
  return (
    <Dialog
      open
      title='Add stage'
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <form
        className='grid gap-4 p-5'
        onSubmit={handleSubmit((values) => {
          try {
            store.saveStage({
              ...values,
              status: 'open',
              id: crypto.randomUUID(),
              sortOrder: Math.max(-1, ...store.state.stages.map((s) => s.sortOrder)) + 1,
            })
            onClose()
          } catch (e) {
            notifyError?.(e, 'Unable to save.')
          }
        })}
      >
        <TextField name='name' label='Name' register={register} required />

        <div className='flex justify-end gap-2'>
          <Button type='button' onClick={onClose}>Cancel</Button>
          <Button variant='default' type='submit'>Add stage</Button>
        </div>
      </form>
    </Dialog>
  )
}
