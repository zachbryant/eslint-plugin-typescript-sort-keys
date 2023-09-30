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
  ascendingOnly: 'ascending ',
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

export enum CaseCategory {
  Interface,
  StringEnum,
}

function getCategoryErrorString(category: CaseCategory) {
  switch (category) {
    case CaseCategory.Interface:
      return 'interface keys'
    case CaseCategory.StringEnum:
    default:
      return 'string enum members'
  }
}

function getCategoryParentErrorString(category: CaseCategory) {
  switch (category) {
    case CaseCategory.Interface:
      return 'key'
    case CaseCategory.StringEnum:
    default:
      return 'member'
  }
}

export const getSwapErrorString = (
  category: CaseCategory,
  order: OptionsSetsKey,
  a: string,
  b: string,
) => {
  return `Expected ${getCategoryErrorString(category)} to be in ${
    orderStrings[order]
  }order. '${a}' should be before '${b}'. Run autofix to sort entire body.`
}

export const getEndErrorString = (
  category: CaseCategory,
  order: OptionsSetsKey,
  a: string,
) =>
  `Expected ${getCategoryErrorString(category)} to be in ${
    orderStrings[order]
  }order. '${a}' should be at the end. Run autofix to sort entire body.`

export const getCountErrorString = (category: CaseCategory, count: number) =>
  `Found ${count} ${getCategoryParentErrorString(category)}${
    count > 1 ? 's' : ''
  } out of order.`
