import { RuleTester as ESLintRuleTester } from 'eslint'
import { AllRuleOptions } from 'types'
import { filename } from './configs'
import {
  OptionsSet,
  OptionsSetsKey,
  optionsSetsNoRequired,
  optionsSetsWithRequiredFirst,
} from './options'
import { getCountErrorString, getEndErrorString, getSwapErrorString } from './strings'

/* Types for processing test cases */
export type ValidTestCase = Omit<ESLintRuleTester.ValidTestCase, 'options'> & OptionsSet

export type InvalidTestCase = Omit<ESLintRuleTester.InvalidTestCase, 'options'> &
  OptionsSet

/* Types for preprocessing test cases */
export type PreInvalidTestCaseList = (Omit<InvalidTestCase, 'optionsSet' | 'errors'> & {
  errors: string[][] | number
})[]
export type PreInvalidTestCaseObject = Partial<
  Record<OptionsSetsKey, PreInvalidTestCaseList>
>

export type PreValidTestCaseObject = Partial<Record<OptionsSetsKey, string[]>>

function processErrorArgs(
  optionsSetsKey: OptionsSetsKey,
  errorArgs: string[][] | number | undefined,
) {
  if (Array.isArray(errorArgs)) {
    return [
      ...(errorArgs
        .map((args: string[]) => {
          switch (args.length) {
            case 1:
              return getEndErrorString(optionsSetsKey, args[0])
            case 2:
              return getSwapErrorString(optionsSetsKey, args[0], args[1])
          }
          return undefined
        })
        .filter(Boolean) as string[]),
      getCountErrorString(errorArgs.length),
    ]
  }
  return errorArgs
}

function preProcessInvalidTestCase(
  testCases: PreInvalidTestCaseObject,
  withRequiredFirstOption: boolean,
): InvalidTestCase[] {
  const processedCases = [] as InvalidTestCase[]

  for (const key in testCases) {
    const optionsSetsKey = key as OptionsSetsKey
    const cases = testCases[optionsSetsKey]
    if (cases && cases.length > 0) {
      processedCases.push(
        ...cases.map(({ code, output, errors: errorArgs }) => {
          const errors = processErrorArgs(optionsSetsKey, errorArgs)
          const optionsSet = (
            withRequiredFirstOption ? optionsSetsWithRequiredFirst : optionsSetsNoRequired
          )[optionsSetsKey] as AllRuleOptions[]
          return {
            code,
            output,
            errors,
            optionsSet,
          } as InvalidTestCase
        }),
      )
    }
  }
  return processedCases
}

function preProcessValidTestCase(
  testCases: PreValidTestCaseObject,
  withRequiredFirstOption: boolean,
): ValidTestCase[] {
  const processedCases = [] as ValidTestCase[]
  for (const key in testCases) {
    const optionsSetsKey = key as OptionsSetsKey
    const cases = testCases[optionsSetsKey]
    if (cases && cases.length > 0) {
      processedCases.push(
        ...cases.map(code => {
          const optionsSet = (
            withRequiredFirstOption ? optionsSetsWithRequiredFirst : optionsSetsNoRequired
          )[optionsSetsKey] as AllRuleOptions[]
          return {
            code,
            optionsSet,
          }
        }),
      )
    }
  }
  return processedCases
}

function processTestCases<T>(cases: (InvalidTestCase | ValidTestCase)[]) {
  return cases.flatMap(testCase =>
    testCase.optionsSet.map(options => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { optionsSet, ...eslintTestCase } = testCase

      return { filename, ...eslintTestCase, options }
    }),
  ) as T[]
}

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processInvalidTestCase(
  testCases: PreInvalidTestCaseObject,
  withRequiredFirstOption: boolean,
): ESLintRuleTester.InvalidTestCase[] {
  return processTestCases(preProcessInvalidTestCase(testCases, withRequiredFirstOption))
}

/**
 * Convert our test cases into ones eslint test runner is expecting.
 */
export function processValidTestCase(
  testCases: PreValidTestCaseObject,
  withRequiredFirstOption: boolean,
): ESLintRuleTester.ValidTestCase[] {
  return processTestCases(preProcessValidTestCase(testCases, withRequiredFirstOption))
}
