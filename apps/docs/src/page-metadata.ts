import { specs } from './pages/catalog/playground/specs.ts'
import { templates } from '../../../registry/templates.ts'
import {
  componentDescriptions,
  componentIds,
  componentTitles,
  foundationPages,
  layoutIds,
  pageTitles,
  recipes,
  uiRules,
} from './navigation.ts'

/** Browser-safe page metadata; documentation.ts adds the file generation on top. */
export const sitePages = [
  'concept',
  ...foundationPages.map((page) => `foundations/${page.slug}`),
  ...componentIds.filter((id) => !specs.some((spec) => spec.id === id)).map((id) => `components/${id}`),
  'layouts',
  ...layoutIds.map((id) => `layouts/${id}`),
  ...uiRules.map((rule) => `rules/${rule.slug}`),
  ...recipes.filter((recipe) => recipe.slug !== 'crm').map((recipe) => `examples/${recipe.slug}`),
]
const pageDescriptions: Record<string, string> = {
  concept: 'Requirements for dir/ui: one system of components, layouts, UI rules and themes for internal tools.',
  layouts: 'Three layouts chosen by how much navigation an app needs: PageShell, AppShell and SuiteShell.',
}
export function pageMetadata(path: string) {
  const component = path.startsWith('/components/')
    ? path.slice('/components/'.length)
    : path.startsWith('/layouts/')
    ? path.slice('/layouts/'.length)
    : ''
  if (componentIds.includes(component) || layoutIds.includes(component)) {
    const spec = specs.find((s) => s.id === component)
    return {
      title: `${componentTitles[component]} — dir/ui`,
      description: componentDescriptions[component]!,
      markdown: spec ? `components/${spec.id}.md` : 'llms.txt',
    }
  }
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
  // An example's code view shares its page metadata.
  const page = path.slice(1).replace(/^(examples\/[^/]+)\/code$/, '$1')
  if (pageTitles.has(page) && !componentIds.includes(page) && !layoutIds.includes(page)) {
    const recipe = recipes.find((r) => `examples/${r.slug}` === page)
    const rule = uiRules.find((r) => `rules/${r.slug}` === page)
    const foundation = foundationPages.find((f) => `foundations/${f.slug}` === page)
    return {
      title: `${pageTitles.get(page)} — dir/ui`,
      description: pageDescriptions[page] ?? rule?.summary ?? foundation?.summary ??
        (recipe
          ? `${recipe.title} (${recipe.system}) example app built with dir/ui components and the ${recipe.shell}Shell layout.`
          : `${pageTitles.get(page)} of dir/ui: live examples of every variant, size and state.`),
      markdown: rule ? 'skill/rules.md' : recipe ? `skill/recipes/${recipe.slug}.md` : 'llms.txt',
    }
  }
  return {
    title: 'dir/ui — Components for internal tools',
    description:
      'React components and application templates for building internal tools with Base UI and Tailwind CSS.',
    markdown: 'llms.txt',
  }
}
