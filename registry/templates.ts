/** One descriptor per template. Source and routes remain inside examples/<id>/. */
export const templates = [{
  id: 'crm',
  title: 'CRM',
  description: 'Companies, people, deals, and reports in a complete CRUD application.',
  registryItem: 'crm-example',
  entry: 'examples/crm/src/template.tsx',
  exportName: 'CrmTemplate',
  sourceDirectory: 'examples/crm/src',
  usage: '<CrmTemplate count={100} basePath="/crm" />',
  styles: '// The installer adds theme rules and the grid import to your configured stylesheet.',
  files:
    'routes/: route-specific list/detail pages and creation forms. screens/: shared list/detail screens driven by route definitions. layout.tsx: navigation and global search. example/: sample records, query helpers, and in-memory storage.',
  routes: ['companies', 'companies/:id', 'people', 'people/:id', 'deals', 'deals/:id', 'report'],
  integration:
    'CrmTemplate includes I18n, Tooltip.Provider, and Toast.Provider. Render on the client in a bounded-height container. basePath defaults to an empty string; count defaults to 100. Configure the host to serve this entry at every route under basePath, including reloads. Records, notes, and saved views reset on reload. No localStorage or backend is installed. Replace example/ with application APIs for persistence; the caller owns permissions.',
  features: ['Record lists', 'Inline editing', 'Saved views', 'Rich-text notes', 'Reports'],
}] as const
