import { JSONSchema4 } from 'json-schema'
import { CreateReporterArgs } from './types'

export enum SortingOrder {
  Ascending = 'asc',
  Descending = 'desc',
}

export const sortingOrderOptionSchema: JSONSchema4 = {
  enum: [SortingOrder.Ascending, SortingOrder.Descending],
}

export type SortingOrderOption = SortingOrder

interface CaseSensitiveSortingOption {
  readonly caseSensitive: boolean
}

interface NaturalSortingOption {
  readonly natural: boolean
}

interface RequiredFirstSortingOption {
  readonly requiredFirst: boolean
}

export interface SortingParamsOptions {
  readonly caseSensitive: CaseSensitiveSortingOption
  readonly natural: NaturalSortingOption
  readonly requiredFirst: RequiredFirstSortingOption
}

export enum ErrorMessage {
  ParentInvalidOrder = `Found {{ unsortedCount }} keys out of order.`,
  InterfaceInvalidOrder = `Expected interface keys to be in {{ requiredFirst }}{{ natural }}{{ insensitive }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}.`,
  StringEnumInvalidOrder = `Expected string enum members to be in {{ natural }}{{ insensitive }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}.`,
}

export function getOptions(context: CreateReporterArgs<string>['context']) {
  const order = context.options[0] || SortingOrder.Ascending
  const options = context.options[1]
  const isAscending = order === SortingOrder.Ascending
  const isInsensitive = Boolean(options?.caseSensitive) === false
  const isNatural = Boolean(options?.natural)
  const isRequiredFirst = Boolean(options?.requiredFirst) === true

  return {
    isAscending,
    isInsensitive,
    isNatural,
    isRequiredFirst,
    order,
  }
}
