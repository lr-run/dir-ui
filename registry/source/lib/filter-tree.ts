import type { FilterNode } from '@/lib/query.ts'

export function nodeConditionCount(node: FilterNode): number {
  return 'conditions' in node ? node.conditions.reduce((count, child) => count + nodeConditionCount(child), 0) : 1
}
export function filterNodeDepth(node: FilterNode): number {
  return 'conditions' in node ? 1 + Math.max(0, ...node.conditions.map(filterNodeDepth)) : 0
}
export function cloneFilterNode(node: FilterNode): FilterNode {
  return 'conditions' in node
    ? { ...node, id: crypto.randomUUID(), conditions: node.conditions.map(cloneFilterNode) }
    : { ...node, id: crypto.randomUUID(), value: structuredClone(node.value) }
}

// The root is level 1; maxDepth retains its existing zero-based nesting contract.
export const MAX_FILTER_LEVELS = 3
export function filterDepthLimit(maxDepth = MAX_FILTER_LEVELS - 1): number {
  return Number.isNaN(maxDepth)
    ? MAX_FILTER_LEVELS - 1
    : Math.max(0, Math.min(MAX_FILTER_LEVELS - 1, Math.floor(maxDepth)))
}
export function canWrapFilterNode(node: FilterNode, parentDepth: number, maxDepth?: number): boolean {
  return parentDepth + filterNodeDepth(node) < filterDepthLimit(maxDepth)
}
export function filterGroupLevels(group: import('@/lib/query.ts').FilterGroup): number {
  return 1 + Math.max(0, ...group.conditions.map(filterNodeDepth))
}
