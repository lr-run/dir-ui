// Inquiry management (問合せ管理): customer tickets with SLA status, the customers who raise them and the canned replies
// agents send, opening on an inbox of what needs an answer next.
import { HeadsetIcon, InboxIcon, PlusIcon } from 'lucide-react'
import { KitApp } from '@/components/systems/kit/app.tsx'
import type { KitConfig, KitObject } from '@/components/systems/kit/types.ts'
import { Inbox, NewTicket } from '@/components/systems/inquiry/inbox.tsx'
import { NewTicketPage } from '@/components/systems/inquiry/new-ticket.tsx'
import { customers, icon, macros, seed, tickets, users } from '@/components/systems/inquiry/objects.tsx'
import { Conversation, TicketActions } from '@/components/systems/inquiry/ticket.tsx'

/** Tickets open on their conversation; New on the list opens the full-page form that sets the SLA. */
const ticketObject: KitObject = {
  ...tickets,
  createPath: '/new-ticket',
  detail: {
    actions: (context) => <TicketActions {...context} />,
    tabs: [{ id: 'conversation', label: 'Conversation', render: (context) => <Conversation {...context} /> }],
  },
}

export const inquiry: KitConfig = {
  id: 'inquiry',
  brand: { name: 'Support desk', mark: <HeadsetIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [ticketObject, customers, macros],
  pages: [{
    id: 'inbox',
    label: 'Inbox',
    icon: <InboxIcon {...icon} />,
    actions: (context) => <NewTicket {...context} />,
    render: (context) => <Inbox {...context} />,
  }, {
    id: 'new-ticket',
    label: 'New ticket',
    icon: <PlusIcon {...icon} />,
    render: (context) => <NewTicketPage {...context} />,
  }],
  navigation: [{ items: ['inbox', 'tickets'] }, { label: 'Customers', items: ['customers'] }, {
    label: 'Replies',
    items: ['macros'],
  }],
  home: '/inbox',
  users,
  me: 'u1',
  seed,
}
export function InquiryApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={inquiry} layout='app' count={count} basePath={basePath} />
}
