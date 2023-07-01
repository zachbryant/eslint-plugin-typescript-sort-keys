import { RuleTester as ESLintRuleTester } from 'eslint'
import { AllRuleOptions } from 'types'
import { filename } from './configs'
import { OptionsSet, OptionsSetsKey, optionsSets } from './options'
import {
  getCountErrorString,
  getEndErrorString,
  getSwapErrorString,
  orderStrings,
} from './strings'

/* Types for processing test cases */
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

/* Types for preprocessing test cases */
export type PreInvalidTestCaseObject = Partial<
  Record<
    OptionsSetsKey,
    Array<
      Omit<InvalidTestCase<AllRuleOptions>, 'optionsSet' | 'errors'> & {
        errors: string[][] | number
      }
    >
  >
>

export type PreValidTestCaseObject = Partial<Record<OptionsSetsKey, string[]>>

function preProcessInvalidTestCase(
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
                      return getSwapErrorString(
                        optionsSetKey as OptionsSetsKey,
                        args[0],
                        args[1],
                      )
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

function preProcessValidTestCase(
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
  return preProcessInvalidTestCase(testCases).flatMap(testCase =>
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
  return processInvalidTestCase(preProcessValidTestCase(testCases) as any)
}
