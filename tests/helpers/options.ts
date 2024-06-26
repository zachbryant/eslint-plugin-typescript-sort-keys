import { AllRuleOptions, SortingOrder, SortingParams } from '../../src/types'

export type OptionsSet = {
  /**
   * The set of options this test case should pass for.
   */
  readonly optionsSet: readonly (AllRuleOptions | [])[]
}
/**
 * Option sets by test category
 */
export const optionsSetsWithRequiredFirst = {
  ascendingInsensitiveNaturalNotRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: false, natural: true, requiredFirst: false },
    ],
  ],
  ascendingInsensitiveNaturalRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: false, natural: true, requiredFirst: true },
    ],
  ],
  ascendingInsensitiveNonNaturalNotRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: false, natural: false, requiredFirst: false },
    ],
  ],
  ascendingSensitiveNaturalNotRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: true, requiredFirst: false },
    ],
  ],
  ascendingSensitiveNonNaturalNotRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: false, requiredFirst: false },
    ],
  ],
  ascendingSensitiveNonNaturalRequired: [
    [
      SortingOrder.Ascending,
      { caseSensitive: true, natural: false, requiredFirst: true },
    ],
  ],
  ascendingWithDefaults: [[], [SortingOrder.Ascending]],
  descendingInsensitiveNaturalNotRequired: [
    [
      SortingOrder.Descending,
      { caseSensitive: false, natural: true, requiredFirst: false },
    ],
  ],
  descendingInsensitiveNaturalRequired: [
    [
      SortingOrder.Descending,
      { caseSensitive: false, natural: true, requiredFirst: true },
    ],
  ],
  descendingInsensitiveNonNaturalNotRequired: [
    [
      SortingOrder.Descending,
      { caseSensitive: false, natural: false, requiredFirst: false },
    ],
  ],
  descendingSensitiveNaturalNotRequired: [
    [
      SortingOrder.Descending,
      { caseSensitive: true, natural: true, requiredFirst: false },
    ],
  ],
  descendingSensitiveNonNaturalRequired: [
    [
      SortingOrder.Descending,
      { caseSensitive: true, natural: false, requiredFirst: true },
    ],
  ],
  descendingWithDefaults: [[SortingOrder.Descending]],
  noOptions: [[]],
}

// Delete requiredFirst, so we can keep the schemas strict
export const optionsSetsNoRequired: Record<
  OptionsSetsKey,
  Array<AllRuleOptions>
> = Object.entries(optionsSetsWithRequiredFirst).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [key as OptionsSetsKey]: value.map(opts => {
      if (opts.length < 2) return opts
      return [
        opts[0] as SortingOrder,
        Object.fromEntries(
          Object.entries(opts[1] as SortingParams).filter(
            ([key]) => key !== 'requiredFirst',
          ) as Array<[string, SortingParams[keyof SortingParams]]>,
        ),
      ]
    }),
  }),
  {},
) as Record<OptionsSetsKey, Array<AllRuleOptions>>

export type OptionsSetsKey = keyof typeof optionsSetsWithRequiredFirst
