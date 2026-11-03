import { useState } from 'react'
import { ConfirmDialog } from '@dir/ui/components/ui/alert-dialog.tsx'
import { Button } from '@dir/ui/components/ui/button.tsx'
import { Dialog, Drawer } from '@dir/ui/components/ui/dialog.tsx'
import { Field } from '@dir/ui/components/ui/field.tsx'
import { Input } from '@dir/ui/components/ui/input.tsx'
import { Select } from '@dir/ui/components/ui/select.tsx'
import type { ComponentDoc } from './index.ts'

const companies = ['ABC Trading', 'Hokuto Manufacturing'].map((c) => ({ value: c, label: c }))

export function DialogDemo() {
  const [open, setOpen] = useState(false)
  const [company, setCompany] = useState('ABC Trading')
  return (
    <>
      <Button onClick={() => setOpen(true)}>New deal</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title='New deal'
        footer={
          <div className='flex justify-end gap-2'>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant='default' onClick={() => setOpen(false)}>Create</Button>
          </div>
        }
      >
        <div className='grid gap-4 p-5'>
          <Field label='Deal name'>{(props) => <Input {...props} placeholder='e.g. Core system renewal' />}</Field>
          <Field label='Company'>
            {(props) => (
              <Select
                id={props.id}
                label='Company'
                items={companies}
                value={company}
                onChange={setCompany}
              />
            )}
          </Field>
        </div>
      </Dialog>
    </>
  )
}
export function DrawerDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit deal</Button>
      <Drawer open={open} onOpenChange={setOpen} title='Edit deal'>
        <div className='grid grid-cols-2 gap-x-5 gap-y-4 p-5 max-[600px]:grid-cols-1'>
          <Field label='Deal name'>{(props) => <Input {...props} defaultValue='Core system renewal' />}</Field>
          <Field label='Amount'>
            {(props) => <Input {...props} type='money' currency='JPY' defaultValue='12000000' />}
          </Field>
          <Field label='Close date'>{(props) => <Input {...props} type='date' defaultValue='2026-11-14' />}</Field>
          <Field label='Owner'>{(props) => <Input {...props} defaultValue='Misaki Sato' />}</Field>
        </div>
      </Drawer>
    </>
  )
}
export function AlertDialogDemo() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <>
      <Button variant='destructive' onClick={() => setOpen(true)}>Delete deal</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title='Delete deal'
        description='"ABC Trading — Core system renewal" and 3 activities will be deleted. This cannot be undone.'
        action='Delete'
        busy={busy}
        onConfirm={() => {
          setBusy(true)
          setTimeout(() => {
            setBusy(false)
            setOpen(false)
          }, 1200)
        }}
      />
    </>
  )
}
export const doc: ComponentDoc = {
  hero: DialogDemo,
  sections: [
    {
      id: 'drawer',
      title: 'Drawer',
      description: '`Drawer` docks to the right edge at 760px for wide editing.',
      example: DrawerDemo,
    },
    {
      id: 'alert-dialog',
      title: 'Alert Dialog',
      description:
        '`ConfirmDialog` confirms destructive actions; initial focus is Cancel. `busy` disables both buttons while the action runs.',
      example: AlertDialogDemo,
    },
  ],
}
