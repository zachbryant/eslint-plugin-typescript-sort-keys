import { RuleTester as ESLintRuleTester } from 'eslint'
import { filename } from './configs'
import {
  AllRuleOptions,
  SortingOrder,
  SortingOrderOption,
  SortingParamsOptions,
} from 'types'

export type OptionsSet<Options extends any[]> = {
  /**
   * The set of options this test case should pass for.
   */
  readonly optionsSet: readonly (Options | [])[]
}

export type ValidTestCase<Options extends any[]> = Omit<
  ESLintRuleTester.ValidTestCase,
  'options'
> &
  OptionsSet<Options>

export type InvalidTestCase<Options extends any[]> = Omit<
  ESLintRuleTester.InvalidTestCase,
  'options'
> &
  OptionsSet<Options>

export type PreInvalidTestCaseObject = Record<
  OptionsSetsKey,
  Array<
    Omit<InvalidTestCase<AllRuleOptions>, 'optionsSet' | 'errors'> & {
      errors: string[][] | number
    }
  >
>

export type PreValidTestCaseObject = Record<OptionsSetsKey, string[]>

function preprocessInvalidTestCase(
  testCases: PreInvalidTestCaseObject,
): InvalidTestCase<any>[] {
  const processedCases = [] as InvalidTestCase<any>[]
  for (const [optionsSetKey, cases] of Object.entries(testCases)) {
    processedCases.push(
      ...cases.map(({ code, output, errors: errorArgs }) => {
        const errors: number | string[] = Array.isArray(errorArgs)
          ? [
              ...(errorArgs
                .map((args: string[]) => {
                  switch (args.length) {
                    case 1:
                      return getEndErrorString(orderStrings[optionsSetKey], args[0])
                    case 2:
                      return getSwapErrorString(optionsSetKey, args[0], args[1])
                  }
                  return undefined
                })
                .filter(Boolean) as string[]),
              getCountErrorString(errorArgs.length),
            ]
          : errorArgs
        const testCase: InvalidTestCase<any[]> = {
          code,
          output,
          errors: errors ?? [],
          optionsSet: optionsSets[optionsSetKey],
        }
        return testCase
      }),
    )
  }
  return processedCases
}

function preprocessValidTestCase(
  testCases: PreValidTestCaseObject,
): ValidTestCase<any>[] {
  return Object.entries(testCases).flatMap(([optionsSetKey, cases]) => {
    return cases.map(code => ({ code, optionsSet: optionsSets[optionsSetKey] }))
  })
}

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processInvalidTestCase(
  testCases: PreInvalidTestCaseObject,
): ESLintRuleTester.InvalidTestCase[] {
  return preprocessInvalidTestCase(testCases).flatMap(testCase =>
    testCase.optionsSet.map(options => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { optionsSet, ...eslintTestCase } = testCase

      return { filename, ...eslintTestCase, options }
    }),
  )
}

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processValidTestCase(
  testCases: PreValidTestCaseObject,
): ESLintRuleTester.ValidTestCase[] {
  return processInvalidTestCase(preprocessValidTestCase(testCases) as any)
}

/**
 * Option sets by test category
 */
export const optionsSets: Record<
  string,
  ([SortingOrderOption] | [SortingOrderOption, Partial<SortingParamsOptions>] | [])[]
> = {
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
  descending: [[SortingOrder.Descending]],
  descendingInsensitive: [[SortingOrder.Descending, { caseSensitive: false }]],
  descendingNatural: [[SortingOrder.Descending, { natural: true }]],
  descendingInsensitiveNatural: [
    [SortingOrder.Descending, { natural: true, caseSensitive: false }],
  ],
  noOptions: [[]],
}

export type OptionsSetsKey = keyof typeof optionsSets

export const getMapFunction = (optionsSet: keyof typeof optionsSets) => {
  return (code: string) => ({
    code,
    optionsSet: optionsSets[optionsSet],
  })
}

export const orderStrings: Record<OptionsSetsKey, string> = {
  ascending: 'ascending ',
  ascendingInsensitive: 'insensitive ascending ',
  ascendingNatural: 'natural ascending ',
  ascendingInsensitiveNatural: 'insensitive natural ascending ',
  descending: 'descending ',
  descendingInsensitive: 'insensitive descending ',
  descendingNatural: 'natural descending ',
  descendingInsensitiveNatural: 'insensitive natural descending ',
  noOptions: '',
}

export const getSwapErrorString = (
  order: keyof typeof orderStrings,
  a: string,
  b: string,
) =>
  `Espected string enum members to be in ${orderStrings[order]}order. '${a}' should be before '${b}'.`

export const getEndErrorString = (order: keyof typeof orderStrings, a: string) =>
  `Espected string enum members to be in ${orderStrings[order]} order. '${a}' should be at the end.`

export const getCountErrorString = (count: number) => `Found ${count} keys out of order.`
