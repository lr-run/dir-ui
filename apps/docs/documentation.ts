import { installPath, installSnippet } from '../../registry/paths.ts'
import { componentApi } from './src/pages/catalog/api-data.ts'
import { specs } from './src/pages/catalog/playground/specs.ts'
import { navigationGroups } from './src/pages/catalog/navigation.ts'
import { templates } from '../../registry/templates.ts'
import { installCommand, registryUrl, siteUrl } from '../../registry/catalog.ts'

const code = (language: string, source: string) => `\`\`\`${language}\n${source}\n\`\`\``
const cell = (value: string) => value.replaceAll('|', '\\|').replaceAll('\n', '<br>')
const setup =
  `Requires React 19, Tailwind CSS 4 and shadcn initialized with Base UI. Registry target placeholders resolve through components.json: @ui, @components, @hooks and @lib. Imports below use the conventional @/ prefix for illustration; the CLI rewrites them to your configured aliases. Shared components are installed once through registryDependencies. The installer merges shared theme rules into the stylesheet configured in components.json. Existing files are never forcibly overwritten; review CLI conflicts before accepting changes. No Dir runtime is required.`

function reference(id: string) {
  const api = componentApi[id as keyof typeof componentApi]
  if (!api) throw new Error(`Missing API reference: ${id}`)
  const path = api.path.startsWith('components/') ? `@/${installPath(api.path)}` : api.path
  const imports = api.path === 'HTML'
    ? 'Use native HTML <table>, <thead>, <tbody>, <tr>, <th>, and <td>.'
    : code('tsx', `import { ${api.names} } from '${path}'`)
  return `## ${api.names}\n\n${imports}\n\n| Prop | Type | Default / required | Notes |\n| --- | --- | --- | --- |\n${
    api.rows.map((row) => `| ${[row.name, row.type, row.default, row.detail].map(cell).join(' | ')} |`).join('\n')
  }\n${api.types ? '\n' + code('ts', installSnippet(api.types)) + '\n' : ''}${api.notes ? '\n' + api.notes + '\n' : ''}`
}
const constraints: Record<string, string> = {
  sidebar: 'Wrap Sidebar and SidebarTrigger in SidebarProvider. Never mount either outside the provider.',
  tooltip: 'Wrap tooltip consumers in Tooltip.Provider.',
  toast: 'Wrap toast consumers in Toast.Provider.',
  'data-grid':
    'The installer adds the grid stylesheet import to your configured CSS file. Give the grid a bounded height. Sorting and filtering emit query state; the caller supplies the resulting rows. Apply remote queries to the complete dataset before pagination.',
  table:
    'The registry item installs shared theme styles; Table is a native HTML recipe, not an exported React component.',
  radio: 'The registry item installs Base UI and shared theme styles. Compose RadioGroup and Radio.Root directly.',
}

/** The UI and machine-readable docs share the same descriptions and API tables. */
export function documentationFiles(): Map<string, string> {
  const files = new Map<string, string>()
  for (const spec of specs) {
    const related = spec.id === 'chart'
      ? ['chart-frame', 'revenue-bars', 'line-chart', 'horizontal-bars', 'spark-chart', 'chart-tooltip', 'chart-legend']
      : []
    files.set(
      `components/${spec.id}.md`,
      `# ${spec.title}\n\n${spec.description}\n\n## Install\n\n${
        code('sh', installCommand(spec.id))
      }\n\n[Registry item with source and dependencies](${registryUrl(spec.id)})\n\n${setup}\n${
        constraints[spec.id] ? '\n' + constraints[spec.id] + '\n' : ''
      }\n${[spec.id, ...related].map(reference).join('\n')}\n`,
    )
  }
  for (const template of templates) {
    files.set(
      `examples/${template.id}.md`,
      `# ${template.title} template\n\n${template.description}\n\n## Install\n\n${
        code('sh', installCommand(template.registryItem))
      }\n\n[Registry item with all source and dependencies](${registryUrl(template.registryItem)})\n\n${setup}\n\n${
        code('css', template.styles)
      }\n\n## Entry\n\n${
        code(
          'tsx',
          `import { ${template.exportName} } from '@/${
            installPath(template.entry)
          }'\n\nexport default function Page() {\n  return <div className="h-dvh">${template.usage}</div>\n}`,
        )
      }\n\n${template.integration}\n\n## Files and routes\n\nSource directory: \`${
        installPath(template.sourceDirectory)
      }/\`.\n\n${template.files}\n\nRoutes under basePath: ${
        template.routes.map((route) => `\`/${route}\``).join(', ')
      }\n`,
    )
  }
  files.set(
    'llms.txt',
    `# dir/ui\n\n> React components and copyable application templates for internal tools. React 19, Base UI, Tailwind CSS 4, React Hook Form, Recharts, and react-data-grid.\n\nInstall individual components or complete templates with shadcn. Each Markdown document contains installation, imports, props, types, and integration constraints. Registry items declare owned files, shared registry dependencies, and npm versions. The library has no Dir runtime dependency.\n\n${
      navigationGroups.map((group) =>
        `## ${group.label}\n\n${
          group.items.map((spec) => `- [${spec.title}](${siteUrl}components/${spec.id}.md): ${spec.description}`).join(
            '\n',
          )
        }`
      ).join('\n\n')
    }\n\n## Application templates\n\n${
      templates.map((template) =>
        `- [${template.title}](${siteUrl}examples/${template.id}.md): ${template.description}`
      ).join('\n')
    }\n`,
  )
  const paths = ['', ...templates.map((t) => `examples/${t.id}`), ...specs.map((s) => `components/${s.id}`)]
  files.set(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${
      paths.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join('')
    }</urlset>\n`,
  )
  files.set('robots.txt', `User-agent: *\nAllow: /\nDisallow: /preview/\nSitemap: ${siteUrl}sitemap.xml\n`)
  return files
}

export function pageMetadata(path: string) {
  const spec = specs.find((s) => path === `/components/${s.id}`)
  const template = templates.find((t) => path === `/examples/${t.id}` || path === `/examples/${t.id}/code`)
  if (spec) {
    return { title: `${spec.title} — dir/ui`, description: spec.description, markdown: `components/${spec.id}.md` }
  }
  if (template) {
    return {
      title: `${template.title} template — dir/ui`,
      description: template.description,
      markdown: `examples/${template.id}.md`,
    }
  }
  return {
    title: 'dir/ui — Components for internal tools',
    description:
      'React components and application templates for building internal tools with Base UI and Tailwind CSS.',
    markdown: 'llms.txt',
  }
}
