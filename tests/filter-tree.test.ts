import { cloneFilterNode, filterNodeDepth, nodeConditionCount } from '../components/data-grid/internal/filter-tree.ts'
import type { FilterNode } from '../components/query/model.ts'
Deno.test('duplicating filter groups creates independent IDs and values at every depth', () => {
  const source: FilterNode = {
    id: 'group',
    conjunction: 'or',
    conditions: [
      { id: 'condition', field: 'tags', operator: 'any', value: ['sales'] },
      {
        id: 'nested',
        conjunction: 'and',
        conditions: [{
          id: 'relative',
          field: 'date',
          operator: 'relative',
          value: { amount: 7, direction: 'past', unit: 'day' },
        }],
      },
    ],
  }
  const copy = cloneFilterNode(source)
  if (nodeConditionCount(copy) !== 2 || filterNodeDepth(copy) !== 2) throw new Error('Group shape changed')
  const ids = (node: FilterNode): string[] => [node.id, ...('conditions' in node ? node.conditions.flatMap(ids) : [])]
  if (ids(copy).some((id) => ids(source).includes(id)) || new Set(ids(copy)).size !== 4) throw new Error('IDs reused')
  if ('conditions' in copy && 'conditions' in source) {
    const first = copy.conditions[0]!
    if (!('conditions' in first) && Array.isArray(first.value)) first.value.push('changed')
    if (JSON.stringify(source).includes('changed')) throw new Error('Values shared with original')
  }
})

Deno.test('filter nesting is capped at three total levels across add and wrap paths', async () => {
  const { canWrapFilterNode, filterDepthLimit, filterGroupLevels } = await import(
    '../components/data-grid/internal/filter-tree.ts'
  )
  const rule: FilterNode = { id: 'rule', field: 'name', operator: 'contains', value: 'Acme' }
  const group: FilterNode = { id: 'group', conjunction: 'and', conditions: [rule] }
  const nested: FilterNode = { id: 'nested', conjunction: 'or', conditions: [group] }
  for (const value of [undefined, 10, Infinity, NaN]) {
    if (filterDepthLimit(value) !== 2) throw new Error('Hard nesting cap bypassed')
  }
  if (filterDepthLimit(1) !== 1 || filterDepthLimit(-1) !== 0) throw new Error('Lower limit ignored')
  if (!canWrapFilterNode(rule, 1) || canWrapFilterNode(rule, 2)) throw new Error('Leaf wrap boundary incorrect')
  if (!canWrapFilterNode(group, 0) || canWrapFilterNode(group, 1)) throw new Error('Subtree wrap boundary incorrect')
  if (canWrapFilterNode(nested, 0)) throw new Error('Deep subtree can exceed cap')
  if (filterGroupLevels({ conjunction: 'and', conditions: [nested] }) !== 3) throw new Error('Root level not counted')
})
