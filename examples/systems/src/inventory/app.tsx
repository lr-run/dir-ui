// Inventory (在庫管理): items, suppliers and purchase orders, with a dashboard of what needs reordering.
import { BoxesIcon, FactoryIcon, LayoutDashboardIcon, PackageIcon, PlusIcon, TruckIcon } from 'lucide-react'
import { useState } from 'react'
import { HorizontalBars } from '@/components/charts/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { KitApp } from '@/components/systems/kit/app.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import { CreateForm } from '@/components/systems/kit/list.tsx'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitConfig, KitObject, KitPageContext, KitRecord } from '@/components/systems/kit/types.ts'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const users = [
  { value: 'u1', label: 'Mika Sato' },
  { value: 'u2', label: 'Ken Ito' },
  { value: 'u3', label: 'Aya Mori' },
  { value: 'u4', label: 'Daichi Kato' },
]
const stock = [
  { value: 'healthy', label: 'Healthy', color: 'var(--ui-green)' },
  { value: 'reorder', label: 'Reorder', color: 'var(--ui-amber)' },
  { value: 'short', label: 'Short', color: 'var(--ui-red)' },
]
const categories = ['Frames', 'Motion', 'Electrical', 'Fasteners', 'Pneumatics'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
const orderStatus = [
  { value: 'draft', label: 'Draft', color: 'var(--ui-muted)' },
  { value: 'sent', label: 'Sent', color: 'var(--ui-blue)' },
  { value: 'partial', label: 'Partially received', color: 'var(--ui-amber)' },
  { value: 'received', label: 'Received', color: 'var(--ui-green)' },
]
const items: KitObject = {
  id: 'items',
  title: 'Items',
  singular: 'Item',
  nameLabel: 'Item',
  icon: <PackageIcon {...icon} />,
  fields: [
    { key: 'sku', label: 'SKU', type: 'text', width: 130, required: true },
    { key: 'status', label: 'Stock', type: 'choice', options: stock, width: 120 },
    { key: 'category', label: 'Category', type: 'choice', options: categories, width: 130 },
    { key: 'onHand', label: 'On hand', type: 'number', width: 110 },
    { key: 'reorderPoint', label: 'Reorder at', type: 'number', width: 110 },
    { key: 'unitCost', label: 'Unit cost', type: 'money', width: 120 },
    { key: 'location', label: 'Location', type: 'text', width: 110 },
    { key: 'supplier', label: 'Supplier', type: 'reference', reference: 'suppliers', width: 190 },
  ],
}
const suppliers: KitObject = {
  id: 'suppliers',
  title: 'Suppliers',
  singular: 'Supplier',
  icon: <FactoryIcon {...icon} />,
  fields: [
    { key: 'contact', label: 'Contact', type: 'text', width: 150 },
    { key: 'email', label: 'Email', type: 'email', width: 210 },
    { key: 'phone', label: 'Phone', type: 'tel', width: 140 },
    { key: 'leadTime', label: 'Lead time (days)', type: 'number', width: 140 },
    { key: 'owner', label: 'Buyer', type: 'member', options: users, width: 150 },
  ],
}
const orders: KitObject = {
  id: 'orders',
  title: 'Purchase orders',
  singular: 'Purchase order',
  nameLabel: 'Order',
  icon: <TruckIcon {...icon} />,
  fields: [
    { key: 'supplier', label: 'Supplier', type: 'reference', reference: 'suppliers', width: 190, required: true },
    { key: 'status', label: 'Status', type: 'choice', options: orderStatus, width: 160 },
    { key: 'total', label: 'Total', type: 'money', width: 130 },
    { key: 'orderedAt', label: 'Ordered', type: 'date', width: 130 },
    { key: 'expectedAt', label: 'Expected', type: 'date', width: 130 },
    { key: 'owner', label: 'Buyer', type: 'member', options: users, width: 150 },
    { key: 'notes', label: 'Notes', type: 'longtext', hideInList: true },
  ],
}
const supplierNames = [
  'Hokuto Metals',
  'Daichi Motion',
  'Seiryu Electric',
  'Kanto Fasteners',
  'Minato Pneumatics',
  'Asahi Profiles',
  'Kawa Bearings',
  'Tokai Cable',
]
const parts = [
  ['Aluminum frame 40×40 L2000', 'frames'],
  ['Aluminum frame 20×20 L1000', 'frames'],
  ['Linear guide SHS15', 'motion'],
  ['Ball screw 16 mm', 'motion'],
  ['Stepper motor NEMA 23', 'motion'],
  ['PLC input unit', 'electrical'],
  ['Proximity sensor M12', 'electrical'],
  ['Power supply 24 V 10 A', 'electrical'],
  ['Hex bolt M6×20', 'fasteners'],
  ['T-nut M5', 'fasteners'],
  ['Air cylinder 32×100', 'pneumatics'],
  ['Solenoid valve 5/2', 'pneumatics'],
] as const

function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 7)
  const supplierRecords = supplierNames.map((name, index) =>
    record(`s${index + 1}`, name, {
      contact: r.pick(['Haruto Abe', 'Yui Ono', 'Sota Endo', 'Rin Kudo', 'Kaito Mori']),
      email: `orders@${name.toLowerCase().replace(/\s+/g, '-')}.example`,
      phone: `03-${r.int(1000, 9999)}-${r.int(1000, 9999)}`,
      leadTime: r.int(3, 21),
      owner: r.pick(users).value,
    }, 400)
  )
  const itemRecords = Array.from({ length: Math.max(12, count) }, (_, index) => {
    const [name, category] = parts[index % parts.length]!
    const reorderPoint = r.int(10, 60), onHand = r.int(0, 160)
    return record(
      `i${index + 1}`,
      index < parts.length ? name : `${name} · rev ${Math.floor(index / parts.length) + 1}`,
      {
        sku: `SKU-${String(20000 + index * 37).padStart(5, '0')}`,
        status: onHand < reorderPoint / 2 ? 'short' : onHand < reorderPoint ? 'reorder' : 'healthy',
        category,
        onHand,
        reorderPoint,
        unitCost: r.int(2, 180) * 100,
        location: `${r.pick(['A', 'B', 'C'])}-${r.int(1, 12)}-${r.int(1, 6)}`,
        supplier: r.pick(supplierRecords).id,
      },
      r.int(20, 300),
    )
  })
  const orderRecords = Array.from(
    { length: Math.max(8, Math.round(count / 3)) },
    (_, index) =>
      record(`o${index + 1}`, `PO-${1040 + index}`, {
        supplier: r.pick(supplierRecords).id,
        status: r.pick(orderStatus).value,
        total: r.int(8, 240) * 1000,
        orderedAt: day(-r.int(1, 40)),
        expectedAt: day(r.int(-5, 20)),
        owner: r.pick(users).value,
        notes: '',
      }, r.int(1, 40)),
  )
  return { items: itemRecords, suppliers: supplierRecords, orders: orderRecords }
}

const yen = (value: number) => `¥${Math.round(value).toLocaleString('ja-JP')}`
function Dashboard({ store, openRecord }: KitPageContext) {
  const live = store.rows.items!.filter((row) => !row.archivedAt)
  const values = (row: (typeof live)[number]) => row.record.values
  const attention = live.filter((row) => values(row).status !== 'healthy')
    .sort((a, b) =>
      Number(values(a).onHand) / Number(values(a).reorderPoint) -
      Number(values(b).onHand) / Number(values(b).reorderPoint)
    )
  const openOrders = store.rows.orders!.filter((row) => !row.archivedAt && row.record.values.status !== 'received')
  const value = live.reduce((sum, row) => sum + Number(values(row).onHand) * Number(values(row).unitCost), 0)
  const byCategory = categories.map((category) => ({
    label: category.label,
    value: live.filter((row) => values(row).category === category.value)
      .reduce((sum, row) => sum + Number(values(row).onHand) * Number(values(row).unitCost), 0),
  }))
  return (
    <DashboardBody>
      <StatGrid
        stats={[
          ['Stock value', yen(value), `${live.length} items`],
          [
            'Below reorder point',
            String(attention.length),
            `${attention.filter((row) => values(row).status === 'short').length} short`,
          ],
          [
            'Open purchase orders',
            String(openOrders.length),
            yen(openOrders.reduce((sum, row) => sum + Number(row.record.values.total), 0)),
          ],
          [
            'Arriving this week',
            String(openOrders.filter((row) => String(row.record.values.expectedAt) <= day(7)).length),
            'by expected date',
          ],
        ]}
      />
      <DashboardColumns>
        <DashboardPanel title='Needs reordering' description='Lowest stock against its reorder point first'>
          <DashboardList
            empty='Every item is above its reorder point.'
            rows={attention.slice(0, 6).map((row) => ({
              id: row.id,
              title: row.name,
              detail: `${values(row).onHand} on hand · reorder at ${values(row).reorderPoint} · ${row.supplier}`,
              trailing: <ChoiceContent item={stock.find((s) => s.value === values(row).status)!} compact />,
              onOpen: () => openRecord('items', row.id),
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title='Stock value by category' description='On hand × unit cost'>
          <div className='px-3 pb-4'>
            <HorizontalBars values={byCategory} labelWidth={90} />
          </div>
        </DashboardPanel>
      </DashboardColumns>
    </DashboardBody>
  )
}
function NewOrder(context: KitPageContext) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant='default' onClick={() => setOpen(true)}>
        <PlusIcon aria-hidden='true' />New purchase order
      </Button>
      {open && (
        <CreateForm
          object={orders}
          store={context.store}
          users={users}
          onClose={() => setOpen(false)}
          onCreated={(id) => context.openRecord('orders', id)}
        />
      )}
    </>
  )
}

export const inventory: KitConfig = {
  id: 'inventory',
  brand: { name: 'Warehouse', mark: <BoxesIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [items, orders, suppliers],
  pages: [{
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboardIcon {...icon} />,
    actions: (context) => <NewOrder {...context} />,
    render: (context) => <Dashboard {...context} />,
  }],
  navigation: [{ items: ['dashboard', 'items', 'orders'] }, { label: 'Partners', items: ['suppliers'] }],
  home: '/dashboard',
  users,
  me: 'u1',
  seed,
}
export function InventoryApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={inventory} count={count} basePath={basePath} />
}
