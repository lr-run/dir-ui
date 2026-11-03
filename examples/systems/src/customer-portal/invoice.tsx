// Invoice record actions: download a copy, and for unpaid invoices the bank transfer details to pay it.
import { DownloadIcon, LandmarkIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Dialog } from '@/components/ui/dialog.tsx'
import { formatDate } from '@/components/ui/value.tsx'
import type { KitDetailContext } from '@/components/systems/kit/types.ts'
import { saveText } from '@/components/systems/customer-portal/contract.tsx'
import { yen } from '@/components/systems/customer-portal/home.tsx'
import { customer } from '@/components/systems/customer-portal/objects.tsx'

export function InvoiceActions({ record, store }: KitDetailContext) {
  const [paying, setPaying] = useState(false)
  const values = record.values
  const unpaid = values.status !== 'paid'
  const download = () =>
    saveText(`${record.name}.txt`, [
      `Invoice ${record.name}`,
      '',
      `Billed to: ${customer.name} (${customer.id})`,
      `Contract: ${store.recordName('contracts', String(values.contract))}`,
      `Billing period: ${values.period}`,
      `Issued: ${formatDate(String(values.issuedAt))} · Due: ${formatDate(String(values.dueAt))}`,
      `Consumption tax: ${yen(Number(values.tax))}`,
      `Total: ${yen(Number(values.amount))}`,
    ])
  return (
    <>
      <Button variant={unpaid ? 'outline' : 'default'} onClick={download}>
        <DownloadIcon aria-hidden='true' />Download
      </Button>
      {unpaid && (
        <Button variant='default' onClick={() => setPaying(true)}>
          <LandmarkIcon aria-hidden='true' />Pay invoice
        </Button>
      )}
      <Dialog
        open={paying}
        onOpenChange={setPaying}
        title={`Pay ${record.name}`}
        footer={
          <div className='flex justify-end'>
            <Button onClick={() => setPaying(false)}>Close</Button>
          </div>
        }
      >
        <div className='flex flex-col gap-4 p-5 text-[13px]'>
          <p className='m-0'>
            Transfer <b className='font-medium'>{yen(Number(values.amount))}</b> by{' '}
            <b className='font-medium'>{formatDate(String(values.dueAt))}</b>. Use the invoice number as the transfer
            name so we can match your payment.
          </p>
          <dl className='m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 rounded-lg border border-border p-4 [&_dt]:text-muted-foreground [&_dd]:m-0'>
            <dt>Bank</dt>
            <dd>Sample Bank, Shibuya branch</dd>
            <dt>Account</dt>
            <dd>Ordinary 0000000</dd>
            <dt>Name</dt>
            <dd>Kumo Cloud K.K.</dd>
            <dt>Transfer name</dt>
            <dd>{record.name}</dd>
          </dl>
          <p className='m-0 text-muted-foreground'>
            The invoice shows as paid within two business days of your transfer arriving.
          </p>
        </div>
      </Dialog>
    </>
  )
}
