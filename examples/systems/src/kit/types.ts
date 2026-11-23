import type { ReactNode } from 'react'
import type { Choice } from '@/lib/choice-types.ts'
import type { ShellNavGroup } from '@/components/shells/shell-parts.tsx'
import type { ListViews } from '@/components/crm/types.ts'
import type { RecordFilter, RecordSort } from '@/lib/query.ts'
import type { KitStore } from '@/components/systems/kit/store.ts'

/** Field types an example object can declare; each maps to a table cell, a filter and an inline editor. */
export type KitFieldType =
  | 'text'
  | 'longtext'
  | 'email'
  | 'url'
  | 'tel'
  | 'number'
  | 'money'
  | 'percent'
  | 'date'
  | 'datetime'
  | 'choice'
  | 'member'
  | 'reference'
  | 'boolean'
export type KitField = {
  key: string
  label: string
  type: KitFieldType
  /** Options of a `choice` field; `color` shows as the status dot. */
  options?: Choice[]
  /** Object id a `reference` field points to. */
  reference?: string
  required?: boolean
  /** Column width in the list; omit to use the cell type default. */
  width?: number
  /** Kept out of the list columns, still shown on the record. */
  hideInList?: boolean
  /** Shown on the record but not editable, such as computed totals. */
  readOnly?: boolean
  currency?: string
  /** Choice values that ask before they are saved, such as Rejected or Terminated (rule 11). */
  confirm?: Record<string, { title: string; description: string; action: string }>
}
export type KitDetailContext = KitPageContext & { object: KitObject; record: KitRecord }
export type KitObject = {
  id: string
  title: string
  singular: string
  icon: ReactNode
  /** Label of the record name, such as Title or Candidate. */
  nameLabel?: string
  fields: KitField[]
  /** Records people only read, such as invoices in a customer portal: no create, rename or archive. */
  readOnly?: boolean
  /** Saved views the list starts with; the first is selected. */
  views?: { id: string; name: string; filter?: RecordFilter; sorts?: RecordSort[] }[]
  /** A page that creates this record instead of the generic dialog, such as `/new` with line items. */
  createPath?: string
  /** Values a new record starts with, such as today's date or the next number. */
  defaults?: (store: KitStore) => Record<string, unknown>
  detail?: {
    compactHeader?: boolean
    /** Buttons in the record's page header; end with the one primary action. */
    actions?: (context: KitDetailContext) => ReactNode
    /** Objects left out of the Related tab because a custom tab already lists them. */
    hideRelated?: string[]
    /** Tabs shown before Related, Notes and History. */
    tabs?: { id: string; label: string; render: (context: KitDetailContext) => ReactNode }[]
  }
}
/** A stored record: fixed columns plus the object's own values, keyed by field. */
export type KitRecord = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  values: Record<string, unknown>
}
/** A table row: the record flattened with display values, so search, sort and filter read labels. */
export type KitRow = Omit<KitRecord, 'values'> & { record: KitRecord; [key: string]: unknown }
export type KitPageContext = {
  store: KitStore
  leading: ReactNode
  navigate: (path: string) => void
  openRecord: (objectId: string, id: string) => void
}
/** A screen that is not a record list, such as a dashboard, a report or a form. */
export type KitPage = {
  id: string
  label: string
  /** Page header title when it differs from the navigation label. */
  title?: string
  icon: ReactNode
  /** Buttons at the right of the page header; end with the one primary action. */
  actions?: (context: KitPageContext) => ReactNode
  render: (context: KitPageContext) => ReactNode
}
export type KitNavGroup = { label?: string; items: string[] }
export type KitConfig = {
  id: string
  /** Brand shown at the top of the sidebar or the header. */
  brand: { name: string; mark: ReactNode }
  objects: KitObject[]
  pages?: KitPage[]
  /** Sidebar groups of object and page ids, in order. */
  navigation: KitNavGroup[]
  /** Path of the first screen, such as `/dashboard` or `/inventory`. */
  home: string
  users: Choice[]
  /** The signed-in member, used as the actor of every change. */
  me: string
  seed: (count: number) => Record<string, KitRecord[]>
}
export type { ListViews, ShellNavGroup }
