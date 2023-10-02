import { RuleTester as ESLintRuleTester } from 'eslint'
import { AllRuleOptions } from 'types'
import { filename } from './configs'
import {
  OptionsSet,
  OptionsSetsKey,
  optionsSetsNoRequired,
  optionsSetsWithRequiredFirst,
} from './options'
import {
  CaseCategory,
  getCountErrorString,
  getEndErrorString,
  getSwapErrorString,
} from './strings'

/* Types for processing test cases */
export type ValidTestCase = Omit<ESLintRuleTester.ValidTestCase, 'options'> & OptionsSet
export type InvalidTestCase = Omit<ESLintRuleTester.InvalidTestCase, 'options'> &
  OptionsSet

/* Types for preprocessing test cases */
export type PreInvalidTestCaseList = (Omit<InvalidTestCase, 'optionsSet' | 'errors'> & {
  errors: Array<string[] | number> | number
  omitInferredErrorCount?: boolean
})[]
export type PreInvalidTestCaseObject = Partial<
  Record<OptionsSetsKey, PreInvalidTestCaseList>
>
export type PreValidTestCaseObject = Partial<Record<OptionsSetsKey, string[]>>

// Get error messages based on args provided in test cases
function processErrorArgs(
  category: CaseCategory,
  optionsSetsKey: OptionsSetsKey,
  errorArgs: Array<string[] | number> | number,
  omitInferredErrorCount: boolean,
) {
  const errorMessages: string[] = []
  if (Array.isArray(errorArgs)) {
    if (!omitInferredErrorCount)
      errorMessages.push(getCountErrorString(category, errorArgs.length))
    for (const args of errorArgs) {
      if (Array.isArray(args)) {
        switch (args.length) {
          case 1:
            errorMessages.push(getEndErrorString(category, optionsSetsKey, args[0]))
            break
          case 2:
            errorMessages.push(
              getSwapErrorString(category, optionsSetsKey, args[0], args[1]),
            )
            break
        }
      } else {
        errorMessages.push(getCountErrorString(category, args))
      }
    }
    return errorMessages
  }
  // Can return count of errors for test case instead of strings
  return errorArgs
}

// First processing step to put cases in the shape of InvalidTestCase
function preProcessInvalidTestCase(
  testCases: PreInvalidTestCaseObject,
  category: CaseCategory,
  withRequiredFirstOption: boolean,
): InvalidTestCase[] {
  const processedCases = [] as InvalidTestCase[]

  for (const key in testCases) {
    const optionsSetsKey = key as OptionsSetsKey
    const cases = testCases[optionsSetsKey]
    if (cases && cases.length > 0) {
      processedCases.push(
        ...cases.map(({ code, output, errors: errorArgs, omitInferredErrorCount }) => {
          const errors = processErrorArgs(
            category,
            optionsSetsKey,
            errorArgs,
            !!omitInferredErrorCount,
          )
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

// First processing step to put cases in the shape of ValidTestCase
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
// Second processing step to put cases in the shape expected by eslint test runner
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
  category: CaseCategory,
  withRequiredFirstOption: boolean,
): ESLintRuleTester.InvalidTestCase[] {
  return processTestCases(
    preProcessInvalidTestCase(testCases, category, withRequiredFirstOption),
  )
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
