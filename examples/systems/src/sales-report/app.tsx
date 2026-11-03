// Sales report (売上集計): orders against products and customers, with a report page of revenue, target attainment,
// revenue by product and customer, the largest orders and customers whose revenue is falling.
import {
  BuildingIcon,
  ChartColumnIcon,
  ChartNoAxesCombinedIcon,
  DownloadIcon,
  PackageIcon,
  ReceiptTextIcon,
} from 'lucide-react'
import { useState } from 'react'
import { HorizontalBars, TrendChart } from '@/components/charts/index.tsx'
import { Button } from '@/components/ui/button.tsx'
import { ChoiceContent } from '@/components/ui/choice-content.tsx'
import { EmptyState } from '@/components/ui/empty-state.tsx'
import { Select } from '@/components/ui/select.tsx'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { Toast } from '@/components/ui/toast.tsx'
import type { RecordSort } from '@/lib/query.ts'
import { formatDate, formatNumber, NumberValue } from '@/components/ui/value.tsx'
import { KitApp } from '@/components/systems/kit/app.tsx'
import {
  DashboardBody,
  DashboardColumns,
  DashboardList,
  DashboardPanel,
  StatGrid,
} from '@/components/systems/kit/dashboard.tsx'
import { day, random, record } from '@/components/systems/kit/seed.ts'
import type { KitConfig, KitObject, KitPageContext, KitRecord } from '@/components/systems/kit/types.ts'
import { buildReport, csvFor, periods, usePeriod } from '@/components/systems/sales-report/report.ts'

const icon = { size: 16, strokeWidth: 1.5, 'aria-hidden': true } as const
const users = [
  { value: 'u1', label: 'Haruka Suzuki' },
  { value: 'u2', label: 'Takumi Yamada' },
  { value: 'u3', label: 'Nanami Kobayashi' },
  { value: 'u4', label: 'Ren Watanabe' },
  { value: 'u5', label: 'Sakura Inoue' },
]
const orderStatus = [
  { value: 'booked', label: 'Booked', color: 'var(--ui-blue)' },
  { value: 'invoiced', label: 'Invoiced', color: 'var(--ui-amber)' },
  { value: 'paid', label: 'Paid', color: 'var(--ui-green)' },
  { value: 'cancelled', label: 'Cancelled', color: 'var(--ui-muted)' },
]
const productStatus = [
  { value: 'active', label: 'On sale', color: 'var(--ui-green)' },
  { value: 'limited', label: 'Limited stock', color: 'var(--ui-amber)' },
  { value: 'retired', label: 'Discontinued', color: 'var(--ui-muted)' },
]
const accountStatus = [
  { value: 'active', label: 'Active', color: 'var(--ui-green)' },
  { value: 'risk', label: 'At risk', color: 'var(--ui-amber)' },
  { value: 'new', label: 'New', color: 'var(--ui-blue)' },
]
const categories = ['Software', 'Hardware', 'Services', 'Support'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
const departments = [
  { value: 'enterprise', label: 'Enterprise Sales' },
  { value: 'smb', label: 'SMB Sales' },
  { value: 'partner', label: 'Partner Sales' },
  { value: 'online', label: 'Online' },
]
const regions = ['Kanto', 'Kansai', 'Chubu', 'Kyushu', 'Tohoku', 'Hokkaido'].map((label) => ({
  value: label.toLowerCase(),
  label,
}))
const industries = ['Logistics', 'Wholesale', 'Food', 'Retail', 'Manufacturing', 'IT', 'Healthcare', 'Hospitality']
  .map((label) => ({ value: label.toLowerCase(), label }))
const newest: RecordSort = { field: 'orderedAt', direction: 'desc' }

const orders: KitObject = {
  id: 'orders',
  title: 'Orders',
  singular: 'Order',
  nameLabel: 'Order',
  icon: <ReceiptTextIcon {...icon} />,
  fields: [
    { key: 'customer', label: 'Customer', type: 'reference', reference: 'customers', width: 190, required: true },
    { key: 'product', label: 'Product', type: 'reference', reference: 'products', width: 200, required: true },
    {
      key: 'status',
      label: 'Status',
      type: 'choice',
      options: orderStatus,
      width: 120,
      confirm: {
        cancelled: {
          title: 'Cancel this order?',
          description:
            'Its amount leaves the sales report, the customer totals and the CSV export. You can set another status later to restore it.',
          action: 'Cancel order',
        },
      },
    },
    { key: 'orderedAt', label: 'Ordered', type: 'date', width: 130, required: true },
    { key: 'quantity', label: 'Quantity', type: 'number', width: 100 },
    { key: 'amount', label: 'Amount', type: 'money', width: 140, required: true },
    { key: 'department', label: 'Department', type: 'choice', options: departments, width: 150 },
    { key: 'owner', label: 'Sales rep', type: 'member', options: users, width: 160 },
    { key: 'notes', label: 'Notes', type: 'longtext', hideInList: true },
  ],
  views: [
    { id: 'all', name: 'All orders', sorts: [newest] },
    {
      id: 'recent',
      name: 'Last 30 days',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'recent', field: 'orderedAt', operator: 'gte', value: day(-30) }],
      },
      sorts: [newest],
    },
    {
      id: 'unpaid',
      name: 'Unpaid',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'unpaid', field: 'status', operator: 'in', value: ['Booked', 'Invoiced'] }],
      },
      sorts: [{ field: 'orderedAt', direction: 'asc' }],
    },
    {
      id: 'cancelled',
      name: 'Cancelled',
      filter: {
        conjunction: 'and',
        conditions: [{ id: 'cancelled', field: 'status', operator: 'in', value: ['Cancelled'] }],
      },
      sorts: [newest],
    },
  ],
  // A new order takes the next number, today's date in the fixtures, Booked, and the signed-in rep.
  defaults: (store) => ({
    name: `SO-${Math.max(24000, ...store.rows.orders!.map((row) => Number(row.name.replace(/\D/g, '')) || 0)) + 1}`,
    status: 'booked',
    orderedAt: day(0),
    quantity: 1,
    owner: 'u1',
  }),
}
const customers: KitObject = {
  id: 'customers',
  title: 'Customers',
  singular: 'Customer',
  nameLabel: 'Company',
  icon: <BuildingIcon {...icon} />,
  fields: [
    { key: 'status', label: 'Account', type: 'choice', options: accountStatus, width: 120 },
    { key: 'industry', label: 'Industry', type: 'choice', options: industries, width: 140 },
    { key: 'region', label: 'Region', type: 'choice', options: regions, width: 110 },
    { key: 'department', label: 'Department', type: 'choice', options: departments, width: 150 },
    { key: 'owner', label: 'Account owner', type: 'member', options: users, width: 160 },
    { key: 'revenue', label: 'Revenue (12 mo)', type: 'money', width: 150, readOnly: true },
    { key: 'lastOrderAt', label: 'Last order', type: 'date', width: 130, readOnly: true },
    { key: 'contact', label: 'Contact', type: 'text', width: 150, hideInList: true },
    { key: 'email', label: 'Email', type: 'email', width: 220, hideInList: true },
    { key: 'phone', label: 'Phone', type: 'tel', width: 140, hideInList: true },
  ],
  views: [
    { id: 'all', name: 'All customers', sorts: [{ field: 'revenue', direction: 'desc' }] },
    {
      id: 'risk',
      name: 'At risk',
      filter: { conjunction: 'and', conditions: [{ id: 'risk', field: 'status', operator: 'in', value: ['At risk'] }] },
      sorts: [{ field: 'revenue', direction: 'desc' }],
    },
  ],
  defaults: () => ({ status: 'new', owner: 'u1' }),
}
const products: KitObject = {
  id: 'products',
  title: 'Products',
  singular: 'Product',
  nameLabel: 'Product',
  icon: <PackageIcon {...icon} />,
  fields: [
    { key: 'sku', label: 'SKU', type: 'text', width: 120, required: true },
    { key: 'category', label: 'Category', type: 'choice', options: categories, width: 120 },
    { key: 'status', label: 'Status', type: 'choice', options: productStatus, width: 140 },
    { key: 'unitPrice', label: 'List price', type: 'money', width: 130 },
    { key: 'revenue', label: 'Revenue (12 mo)', type: 'money', width: 150, readOnly: true },
    { key: 'share', label: 'Share (12 mo)', type: 'percent', width: 120, readOnly: true },
    { key: 'description', label: 'Description', type: 'longtext', hideInList: true },
  ],
  views: [{ id: 'revenue', name: 'By revenue', sorts: [{ field: 'revenue', direction: 'desc' }] }],
}

// Name, category, list price, relative order weight, largest quantity per order.
const catalog = [
  ['Cloud ERP Standard', 'software', 480000, 9, 3],
  ['Cloud ERP Enterprise', 'software', 1200000, 4, 2],
  ['Attendance Cloud', 'software', 180000, 10, 5],
  ['Expense Cloud', 'software', 150000, 8, 5],
  ['POS Terminal T2', 'hardware', 98000, 6, 30],
  ['Handheld Scanner H5', 'hardware', 64000, 5, 40],
  ['Receipt Printer P1', 'hardware', 38000, 4, 30],
  ['Implementation package', 'services', 800000, 5, 1],
  ['Data migration', 'services', 350000, 4, 1],
  ['On-site training', 'services', 120000, 5, 3],
  ['Premium support', 'support', 240000, 6, 3],
  ['Standard support', 'support', 96000, 7, 4],
] as const
const prefixes = [
  'Sakura',
  'Minato',
  'Aoba',
  'Hikari',
  'Tsubame',
  'Kumo',
  'Yamabuki',
  'Shirakawa',
  'Nagisa',
  'Fujimi',
  'Kaede',
  'Midori',
  'Hoshino',
  'Asagiri',
  'Tamagawa',
  'Isshin',
  'Kitaura',
  'Wakaba',
  'Hinode',
  'Seiran',
]
const suffixes = [
  ['Logistics', 'logistics'],
  ['Trading', 'wholesale'],
  ['Foods', 'food'],
  ['Retail', 'retail'],
  ['Motors', 'manufacturing'],
  ['Systems', 'it'],
  ['Medical', 'healthcare'],
  ['Hotels', 'hospitality'],
] as const
const contacts = ['Yuto Takahashi', 'Mei Nakamura', 'Sota Kimura', 'Aoi Hayashi', 'Riku Shimizu', 'Hina Matsumoto']

function seed(count: number): Record<string, KitRecord[]> {
  const r = random(count + 11)
  const productRecords = catalog.map(([name, category, unitPrice], index) =>
    record(`p${index + 1}`, name, {
      sku: `${category.slice(0, 3).toUpperCase()}-${String(100 + index * 7).padStart(4, '0')}`,
      category,
      status: index === 6 ? 'retired' : index === 4 ? 'limited' : 'active',
      unitPrice,
      revenue: 0,
      share: 0,
      description: '',
    }, 600)
  )
  const customerCount = count ? Math.min(120, Math.max(4, Math.round(count / 8))) : 0
  // A customer marked declining orders less often in the last year, so the report has accounts at risk.
  const declining = new Set<string>()
  const customerRecords = Array.from({ length: customerCount }, (_, index) => {
    const a = Math.floor(index / prefixes.length), b = index % prefixes.length
    const [suffix, industry] = suffixes[(5 * a + b) % suffixes.length]!
    const name = `${prefixes[b]} ${suffix}`
    const id = `c${index + 1}`
    if (index % 5 === 2) declining.add(id)
    const department = index % 4 === 0 ? 'enterprise' : r.pick(departments).value
    return record(id, name, {
      status: declining.has(id) ? 'risk' : index % 9 === 4 ? 'new' : 'active',
      industry,
      region: r.pick(regions).value,
      department,
      owner: r.pick(users.slice(1)).value,
      revenue: 0,
      lastOrderAt: null,
      contact: r.pick(contacts),
      email: `sales@${name.toLowerCase().replace(/\s+/g, '-')}.example`,
      phone: `0${r.int(3, 6)}-${r.int(1000, 9999)}-${r.int(1000, 9999)}`,
    }, r.int(400, 900))
  })
  const totalWeight = catalog.reduce((sum, item) => sum + item[3], 0)
  const pickProduct = () => {
    let roll = r.next() * totalWeight
    for (const [index, item] of catalog.entries()) {
      roll -= item[3]
      if (roll < 0) return index
    }
    return catalog.length - 1
  }
  // Orders cover two years so each period compares with the same months a year earlier; more fall in recent months.
  const drafts = customerRecords.length
    ? Array.from({ length: count }, () => {
      const age = Math.floor(735 * Math.pow(r.next(), 1.12))
      let customer = r.pick(customerRecords)
      if (age < 365 && declining.has(customer.id) && r.next() < 0.7) customer = r.pick(customerRecords)
      const productIndex = pickProduct()
      const [, , unitPrice, , maxQuantity] = catalog[productIndex]!
      const quantity = r.int(1, maxQuantity)
      const month = day(-age).slice(5, 7)
      const season = month === '03' ? 1.4 : month === '09' || month === '12' ? 1.15 : 1
      const discount = 1 - r.int(0, 15) / 100
      const amount = Math.round(unitPrice * quantity * discount * season / 1000) * 1000
      const status = r.next() < 0.04
        ? 'cancelled'
        : age > 60
        ? 'paid'
        : age > 20
        ? r.pick(['invoiced', 'paid'])
        : r.pick(['booked', 'booked', 'invoiced'])
      return { age, customer, productIndex, quantity, amount, status }
    }).sort((x, y) => y.age - x.age)
    : []
  const orderRecords = drafts.map((draft, index) =>
    record(`o${index + 1}`, `SO-${24001 + index}`, {
      customer: draft.customer.id,
      product: productRecords[draft.productIndex]!.id,
      status: draft.status,
      orderedAt: day(-draft.age),
      quantity: draft.quantity,
      amount: draft.amount,
      department: draft.customer.values.department,
      owner: draft.customer.values.owner,
      notes: '',
    }, draft.age)
  ).reverse()
  // Totals shown on customer and product records: the last twelve months, cancelled orders excluded.
  const yearAgo = day(-365)
  let total = 0
  for (const order of orderRecords) {
    const values = order.values
    if (values.status === 'cancelled') continue
    const customer = customerRecords.find((item) => item.id === values.customer)!
    const at = String(values.orderedAt)
    if (!customer.values.lastOrderAt || at > String(customer.values.lastOrderAt)) customer.values.lastOrderAt = at
    if (at < yearAgo) continue
    const product = productRecords.find((item) => item.id === values.product)!
    customer.values.revenue = Number(customer.values.revenue) + Number(values.amount)
    product.values.revenue = Number(product.values.revenue) + Number(values.amount)
    total += Number(values.amount)
  }
  for (const product of productRecords) {
    product.values.share = total ? Math.round(Number(product.values.revenue) / total * 1000) / 10 : 0
  }
  return { orders: orderRecords, customers: customerRecords, products: productRecords }
}

const yen = (value: number) => formatNumber(value, { format: 'currency', currency: 'JPY', maximumFractionDigits: 0 })
const change = (current: number, previous: number) =>
  previous ? `${current >= previous ? '+' : '−'}${Math.abs((current / previous - 1) * 100).toFixed(1)}%` : null

function PeriodSelect() {
  const [period, setPeriod] = usePeriod()
  return (
    <Select
      label='Report period'
      value={period}
      onChange={setPeriod}
      items={periods.map(({ value, label }) => ({ value, label }))}
    />
  )
}

function Report({ store, openRecord, navigate }: KitPageContext) {
  const [period] = usePeriod()
  const [grain, setGrain] = useState<'month' | 'quarter'>('month')
  const report = buildReport(store, period, grain)
  if (!store.rows.orders!.some((row) => !row.archivedAt)) {
    return (
      <div className='grid min-h-0 flex-1 place-items-center'>
        <EmptyState title='No orders yet. The report fills in as orders are recorded.'>
          <Button onClick={() => navigate('/orders')}>Go to orders</Button>
        </EmptyState>
      </div>
    )
  }
  const yoy = change(report.revenue, report.previousRevenue)
  return (
    <DashboardBody>
      <div className='flex items-center justify-between gap-3 @max-[740px]:flex-col @max-[740px]:items-stretch'>
        <p className='m-0 text-[13px] text-muted-foreground'>
          {report.range} · compared with the same months a year earlier · cancelled orders excluded
        </p>
        <div className='hidden @max-[740px]:block'>
          <PeriodSelect />
        </div>
      </div>
      <StatGrid
        stats={[
          ['Revenue', yen(report.revenue), yoy ? `${yoy} vs last year` : 'No orders a year earlier'],
          [
            'Target attainment',
            report.target ? `${Math.round(report.revenue / report.target * 100)}%` : '—',
            report.target ? `Target ${yen(report.target)}` : 'No target for this period',
          ],
          [
            'Orders',
            report.orders.length.toLocaleString('en-US'),
            report.orders.length ? `${yen(report.revenue / report.orders.length)} per order` : 'None in this period',
          ],
          [
            'Ordering customers',
            String(report.customers.length),
            `${report.atRisk.length} at risk`,
          ],
        ]}
      />
      <DashboardPanel
        title='Revenue against target'
        description='Target is the same month last year plus 10%'
        action={
          <Tabs value={grain} onValueChange={(value) => setGrain(value as 'month' | 'quarter')}>
            <TabsList aria-label='Group by'>
              <TabsTrigger value='month'>Month</TabsTrigger>
              <TabsTrigger value='quarter'>Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <div className='px-3 pb-4'>
          <TrendChart values={report.trend} names={['Revenue', 'Target']} height={250} />
        </div>
      </DashboardPanel>
      <DashboardColumns>
        <DashboardPanel title='Revenue by product' description='Top six products in this period'>
          <div className='px-3 pb-4'>
            <HorizontalBars values={report.byProduct} labelWidth={150} height={230} />
          </div>
        </DashboardPanel>
        <DashboardPanel title='Revenue by customer' description='Top six customers in this period'>
          <div className='px-3 pb-4'>
            <HorizontalBars values={report.byCustomer} labelWidth={130} height={230} />
          </div>
        </DashboardPanel>
      </DashboardColumns>
      <DashboardColumns>
        <DashboardPanel title='Customers at risk' description='Revenue down 30% or more on the same months last year'>
          <DashboardList
            empty='No customer is down 30% or more on last year.'
            rows={report.atRisk.slice(0, 6).map((item) => ({
              id: item.row.id,
              title: item.row.name,
              detail: `${yen(item.current)} vs ${yen(item.previous)} last year · ${item.row.owner}`,
              trailing: (
                <span className='shrink-0 text-[13px] text-muted-foreground tabular-nums'>
                  {change(item.current, item.previous)}
                </span>
              ),
              onOpen: () => openRecord('customers', item.row.id),
            }))}
          />
        </DashboardPanel>
        <DashboardPanel title='Largest orders' description='By amount in this period'>
          <DashboardList
            empty='No orders in this period.'
            rows={report.largest.slice(0, 6).map((row) => ({
              id: row.id,
              title: `${row.name} · ${row.customer}`,
              detail: `${row.product} · ${formatDate(String(row.record.values.orderedAt))}`,
              trailing: (
                <span className='flex shrink-0 flex-col items-end gap-0.5 text-[13px]'>
                  <NumberValue
                    value={Number(row.record.values.amount)}
                    format='currency'
                    currency='JPY'
                    maximumFractionDigits={0}
                  />
                  <ChoiceContent item={orderStatus.find((s) => s.value === row.record.values.status)!} compact />
                </span>
              ),
              onOpen: () => openRecord('orders', row.id),
            }))}
          />
        </DashboardPanel>
      </DashboardColumns>
      <DashboardPanel title='Revenue by department' description='Share of revenue in this period'>
        <div className='px-3 pb-4'>
          <HorizontalBars values={report.byDepartment} labelWidth={130} height={170} />
        </div>
      </DashboardPanel>
    </DashboardBody>
  )
}

// Export progress goes to the app's toast stack; mount `Toasts` once per document, as the CRM example does.
function ReportActions(context: KitPageContext) {
  return <ExportActions {...context} />
}
function ExportActions({ store }: KitPageContext) {
  const [period] = usePeriod()
  const [exporting, setExporting] = useState(false)
  const toasts = Toast.useToastManager()
  const report = buildReport(store, period, 'month')
  const exportCsv = () => {
    setExporting(true)
    const id = toasts.add({
      title: `Exporting ${report.orders.length.toLocaleString('en-US')} orders…`,
      description: report.range,
      timeout: 0,
    })
    // A real export would be a server job; the file is built in the browser here.
    setTimeout(() => {
      const { name, body } = csvFor(report)
      const url = URL.createObjectURL(new Blob([body], { type: 'text/csv' }))
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toasts.update(id, {
        title: 'Export ready',
        description: `${name} · ${report.orders.length.toLocaleString('en-US')} rows`,
        timeout: 5000,
      })
      setExporting(false)
    }, 900)
  }
  return (
    <>
      <div className='w-[160px] max-[600px]:hidden'>
        <PeriodSelect />
      </div>
      <Button
        variant='default'
        onClick={exportCsv}
        disabled={exporting || !report.orders.length}
        className='min-w-[118px]'
      >
        <DownloadIcon aria-hidden='true' />
        {exporting ? 'Exporting…' : 'Export CSV'}
      </Button>
    </>
  )
}

export const salesReport: KitConfig = {
  id: 'sales-report',
  brand: { name: 'Sales Desk', mark: <ChartColumnIcon size={16} strokeWidth={2} aria-hidden='true' /> },
  objects: [orders, customers, products],
  pages: [{
    id: 'report',
    label: 'Overview',
    title: 'Sales report',
    icon: <ChartNoAxesCombinedIcon {...icon} />,
    actions: (context) => <ReportActions {...context} />,
    render: (context) => <Report {...context} />,
  }],
  navigation: [{ items: ['report', 'orders'] }, { label: 'Records', items: ['customers', 'products'] }],
  home: '/report',
  users,
  me: 'u1',
  seed,
}
export function SalesReportApp({ count, basePath }: { count?: number; basePath?: string }) {
  return <KitApp config={salesReport} layout='app' count={count} basePath={basePath} />
}
