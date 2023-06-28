import { Rule, RuleTester } from 'eslint'

import { rule, name, Options } from 'rules/string-enum'
import { SortingOrder } from 'common/options'
import { typescript } from '../helpers/configs'
import {
  InvalidTestCase,
  processInvalidTestCase,
  processValidTestCase,
  ValidTestCase,
} from '../helpers/util'

import fs from 'fs'

const validBigTestCode = fs
  .readFileSync('tests/rules/string-enum-big-test.valid-case.ts')
  .toString('utf-8')
const invalidBigTestCode = fs
  .readFileSync('tests/rules/string-enum-big-test.invalid-case.ts')
  .toString('utf-8')

const valid: readonly ValidTestCase<Options>[] = [
  {
    code: validBigTestCode,
    optionsSet: [
      [],
      [SortingOrder.Ascending],
      [SortingOrder.Ascending, { caseSensitive: true }],
      [SortingOrder.Ascending, { natural: false }],
      [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    ],
  },
]

const invalid: readonly InvalidTestCase<Options>[] = [
  {
    code: invalidBigTestCode,
    output: validBigTestCode,
    errors: 146,
    optionsSet: [
      [],
      // [SortingOrder.Ascending],
      // [SortingOrder.Ascending, { caseSensitive: true }],
      // [SortingOrder.Ascending, { natural: false }],
      // [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    ],
  },
]

describe('TypeScript', () => {
  const ruleTester = new RuleTester(typescript)

  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  })
})
