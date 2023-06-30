import { JSONSchema4 } from 'json-schema'

export enum SortingOrder {
  Ascending = 'asc',
  Descending = 'desc',
}

export const sortingOrderOptionSchema: JSONSchema4 = {
  enum: [SortingOrder.Ascending, SortingOrder.Descending],
}

export type SortingOrderOption = SortingOrder

export interface SortingParamsOptions {
  readonly caseSensitive: boolean
  readonly natural: boolean
  readonly requiredFirst: boolean
}
