import { installPath, installSnippet } from '../../../../registry/paths.ts'
import { componentApi } from './api-data.ts'
function ImportCode({ id }: { id: string }) {
  const doc = componentApi[id as keyof typeof componentApi]
  if (!doc) return null
  const specifier = doc.path.startsWith('components/') ? '@/' + installPath(doc.path) : doc.path
  const statement = doc.path === 'HTML'
    ? '<table className="w-full [border-collapse:collapse] text-[13px] whitespace-nowrap [&_th]:p-[12px_16px] [&_th]:text-left [&_th]:[border-bottom:1px_solid_var(--ui-border)] [&_td]:p-[12px_16px] [&_td]:text-left [&_td]:[border-bottom:1px_solid_var(--ui-border)] [&_th]:text-muted-foreground [&_th]:text-[12px] [&_th]:font-medium [&_tbody_tr:last-child_td]:[border:0]">…</table>'
    : doc.path === 'CSS'
    ? "import './tailwind.css'"
    : `import { ${doc.names} } from '${specifier}'`
  return (
    <pre className='text-[12px] leading-[1.7] whitespace-pre overflow-auto m-0 p-[20px_24px] text-muted-foreground max-h-[300px] [border:1px_solid_var(--ui-border)] rounded-[6px] [background:var(--ui-hover)]'><code>{statement}</code></pre>
  )
}
export function Usage({ id }: { id: string }) {
  return (
    <section id='usage' className='mt-12 scroll-mt-[calc(var(--docs-header-height)+24px)]'>
      <h2 className='mb-5 text-xl font-semibold tracking-tight'>Usage</h2>
      <ImportCode id={id} />
    </section>
  )
}
function Reference({ id, showImport = false }: { id: string; showImport?: boolean }) {
  const doc = componentApi[id as keyof typeof componentApi]
  if (!doc) return null
  return (
    <div>
      {showImport && <ImportCode id={id} />}
      <h3>Props</h3>
      <div className='overflow-auto [border:1px_solid_var(--ui-border)] rounded-[8px]'>
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default / Required</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {doc.rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <code>{row.name}</code>
                </td>
                <td>
                  <code>{row.type}</code>
                </td>
                <td>
                  <code>{row.default}</code>
                </td>
                <td>{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {doc.types && (
        <>
          <h3>Types</h3>
          <pre className='text-[12px] leading-[1.7] whitespace-pre overflow-auto m-0 p-[20px_24px] text-muted-foreground max-h-[300px] [border:1px_solid_var(--ui-border)] rounded-[6px] [background:var(--ui-hover)]'><code>{installSnippet(doc.types)}</code></pre>
        </>
      )}
      {doc.notes && <p className='text-[13px] text-muted-foreground leading-[1.7] mt-[18px]'>{doc.notes}</p>}
    </div>
  )
}

export function ApiReference({ id }: { id: string }) {
  return (
    <section
      id='api'
      className='scroll-mt-[calc(var(--docs-header-height)+24px)] mt-[48px] pt-[24px] [border-top:1px_solid_var(--ui-border)] min-w-0 [&_h2]:text-[22px] [&_h2]:tracking-tight [&_h2]:font-semibold [&_h2]:m-[0_0_24px] [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:m-[24px_0_12px] [&_table]:w-full [&_table]:[border-collapse:collapse] [&_table]:text-[13px] [&_table]:leading-6 [&_table]:text-left [&_th]:p-[12px] [&_th]:[border-bottom:1px_solid_var(--ui-border)] [&_th]:align-top [&_td]:p-[12px] [&_td]:[border-bottom:1px_solid_var(--ui-border)] [&_td]:align-top [&_th]:text-muted-foreground [&_th]:font-medium [&_td_code]:text-xs [&_thead]:bg-muted/40 [&_tbody_tr:last-child_td]:border-b-0 [&_td_code]:whitespace-normal [&_td_code]:[overflow-wrap:anywhere]'
    >
      <h2>API Reference</h2>
      <Reference id={id} />
      {id === 'chart' && [
        ['chart-frame', 'ChartFrame'],
        ['revenue-bars', 'RevenueBars'],
        ['line-chart', 'TrendChart'],
        ['horizontal-bars', 'HorizontalBars'],
        ['spark-chart', 'SparkChart'],
      ].map(([key, title]) => (
        <section key={key}>
          <h2>{title}</h2>
          <Reference id={key!} showImport />
        </section>
      ))}
    </section>
  )
}
