import { OptionsSetsKey } from './options'

export const orderStrings: Record<OptionsSetsKey, string> = {
  ascending: 'ascending ',
  ascendingInsensitive: 'insensitive ascending ',
  ascendingNatural: 'natural ascending ',
  ascendingInsensitiveNatural: 'insensitive natural ascending ',
  descendingOnly: 'descending ',
  descendingInsensitive: 'insensitive descending ',
  descendingNatural: 'natural descending ',
  descendingInsensitiveNatural: 'insensitive natural descending ',
  noOptions: '',
  ascendingOnly: '',
  ascendingSensitive: '',
  ascendingInsensitiveNaturalRequired: '',
  ascendingInsensitiveNaturalNotRequired: '',
  ascendingRequired: '',
  descending: 'descending ',
  descendingInsensitiveNonNatural: '',
  descendingSensitiveNatural: '',
  descendingInsensitiveNaturalRequired: '',
  descendingInsensitiveNaturalNotRequired: '',
  descendingRequired: '',
}

export const getSwapErrorString = (order: OptionsSetsKey, a: string, b: string) =>
  `Expected string enum members to be in ${orderStrings[order]}order. '${a}' should be before '${b}'. Run autofix to sort entire body.`

export const getEndErrorString = (order: OptionsSetsKey, a: string) =>
  `Expected string enum members to be in ${orderStrings[order]}order. '${a}' should be at the end. Run autofix to sort entire body.`

export const getCountErrorString = (count: number) => `Found ${count} keys out of order.`
