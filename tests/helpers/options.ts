import { AllRuleOptions, SortingOrder } from 'types'

export type OptionsSet = {
  /**
   * The set of options this test case should pass for.
   */
  readonly optionsSet: readonly (AllRuleOptions | [])[]
}
/**
 * Option sets by test category
 */
export const optionsSets = {
  ascendingOnly: [[SortingOrder.Ascending]],
  ascending: [
    [],
    [SortingOrder.Ascending],
    [SortingOrder.Ascending, { caseSensitive: true }],
    [SortingOrder.Ascending, { natural: false }],
    [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: false, requiredFirst: false },
    ],
  ],
  ascendingInsensitive: [[SortingOrder.Ascending, { caseSensitive: false }]],
  ascendingNatural: [[SortingOrder.Ascending, { natural: true }]],
  ascendingInsensitiveNatural: [
    [SortingOrder.Ascending, { natural: true, caseSensitive: false }],
  ],
  ascendingSensitive: [
    [],
    [SortingOrder.Ascending],
    [SortingOrder.Ascending, { caseSensitive: true }],
    [SortingOrder.Ascending, { natural: false }],
    [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: false, requiredFirst: false },
    ],
  ],
  ascendingInsensitiveNaturalRequired: [
    [
      SortingOrder.Ascending,
      { natural: true, caseSensitive: false, requiredFirst: true },
    ],
  ],
  ascendingInsensitiveNaturalNotRequired: [
    [
      SortingOrder.Ascending,
      { natural: true, caseSensitive: false, requiredFirst: false },
    ],
  ],
  ascendingRequired: [[SortingOrder.Ascending, { requiredFirst: true }]],
  descendingOnly: [[SortingOrder.Descending]],
  descending: [
    [],
    [SortingOrder.Ascending],
    [SortingOrder.Ascending, { caseSensitive: true }],
    [SortingOrder.Ascending, { natural: false }],
    [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: false, requiredFirst: false },
    ],
  ],
  descendingInsensitive: [[SortingOrder.Descending, { caseSensitive: false }]],
  descendingInsensitiveNonNatural: [
    [SortingOrder.Descending, { caseSensitive: false }],
    [SortingOrder.Descending, { caseSensitive: false, natural: false }],
  ],
  descendingNatural: [[SortingOrder.Descending, { natural: true }]],
  descendingInsensitiveNatural: [
    [SortingOrder.Descending, { natural: true, caseSensitive: false }],
  ],
  descendingSensitiveNatural: [
    [SortingOrder.Descending, { natural: true }],
    [SortingOrder.Descending, { natural: true, caseSensitive: true }],
  ],
  descendingInsensitiveNaturalRequired: [
    [
      SortingOrder.Descending,
      { natural: true, caseSensitive: false, requiredFirst: true },
    ],
  ],
  descendingInsensitiveNaturalNotRequired: [
    [
      SortingOrder.Descending,
      { natural: true, caseSensitive: false, requiredFirst: false },
    ],
  ],
  descendingRequired: [[SortingOrder.Descending, { requiredFirst: true }]],
  noOptions: [[]],
}

export type OptionsSetsKey = keyof typeof optionsSets
