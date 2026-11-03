// Deterministic fixtures: the same count always produces the same records, so previews stay stable.
import type { KitRecord } from '@/components/systems/kit/types.ts'

export function random(seed: number) {
  let state = seed >>> 0
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T>(items: readonly T[]) => items[Math.floor(next() * items.length)]!,
  }
}
const base = Date.UTC(2026, 10, 2, 9)
/** An ISO date `days` from 2 November 2026; negative is the past. */
export const day = (days: number) => new Date(base + days * 86400000).toISOString().slice(0, 10)
export const stamp = (days: number) => new Date(base + days * 86400000).toISOString()
export function record(id: string, name: string, values: Record<string, unknown>, ageDays = 30): KitRecord {
  return { id, name, createdAt: stamp(-ageDays), updatedAt: stamp(-Math.floor(ageDays / 3)), archivedAt: null, values }
}
