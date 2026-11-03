// Customer portal (顧客ポータル): one customer company's home, contract, invoices and support tickets, in header tabs.
import { CloudIcon, FileTextIcon, HouseIcon, MessageSquarePlusIcon, SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { KitApp } from '@/components/systems/kit/app.tsx'
import type { KitConfig } from '@/components/systems/kit/types.ts'
import { ContactForm } from '@/components/systems/customer-portal/contact.tsx'
import { ContractPage, DocumentList } from '@/components/systems/customer-portal/contract.tsx'
import { InvoiceActions } from '@/components/systems/customer-portal/invoice.tsx'
import { Home } from '@/components/systems/customer-portal/home.tsx'
import {
  announcements,
  contracts,
  icon,
  invoices,
  seed,
  tickets,
  users,
} from '@/components/systems/customer-portal/objects.tsx'

export const customerPortal: KitConfig = {
  id: 'customer-portal',
  brand: { name: 'Kumo Cloud', mark: <CloudIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [
    { ...invoices, detail: { actions: (context) => <InvoiceActions {...context} /> } },
    tickets,
    {
      ...contracts,
      detail: {
        tabs: [{
          id: 'documents',
          label: 'Documents',
          render: ({ record }) => <DocumentList contract={record} className='rounded-lg border border-border px-3' />,
        }],
      },
    },
    announcements,
  ],
  pages: [
    {
      id: 'home',
      label: 'Home',
      icon: <HouseIcon {...icon} />,
      actions: ({ navigate }) => (
        <Button variant='default' onClick={() => navigate('/contact')}>
          <MessageSquarePlusIcon aria-hidden='true' />Contact support
        </Button>
      ),
      render: (context) => <Home {...context} />,
    },
    {
      id: 'contract',
      label: 'Contract',
      title: 'Your contract',
      icon: <FileTextIcon {...icon} />,
      render: (context) => <ContractPage {...context} />,
    },
    {
      id: 'contact',
      label: 'Contact support',
      icon: <SendIcon {...icon} />,
      render: (context) => <ContactForm {...context} />,
    },
  ],
  // Header tabs. The contact form, contract records and announcements open from Home and the records.
  navigation: [{ items: ['home', 'contract', 'invoices', 'tickets'] }],
  home: '/home',
  users,
  me: 'c1',
  seed,
}
export function CustomerPortalApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={customerPortal} layout='page' count={count} basePath={basePath} />
}
