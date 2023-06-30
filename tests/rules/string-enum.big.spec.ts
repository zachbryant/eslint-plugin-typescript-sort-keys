import { Rule, RuleTester } from 'eslint'

import { rule, name, Options } from 'rules/string-enum'
//import { SortingOrder } from 'common/options'
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
    code: '',
    optionsSet: [
      [],
      // [SortingOrder.Ascending],
      // [SortingOrder.Ascending, { caseSensitive: true }],
      // [SortingOrder.Ascending, { natural: false }],
      // [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    ],
  },
]

const invalid: readonly InvalidTestCase<Options>[] = [
  {
    code: `
export enum A {
  /*back*/ B = '' /*front*/,
  // C above
  C = '', // C side
  // A above
  A = '', // A side
}`,
    output: `
export enum A {
  // A above
  A = '', // A side
  /*back*/ B = '' /*front*/,
  // C above
  C = '', // C side
}`,
    errors: 4,
    optionsSet: [
      [],
      // [SortingOrder.Ascending],
      // [SortingOrder.Ascending, { caseSensitive: true }],
      // [SortingOrder.Ascending, { natural: false }],
      // [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    ],
  },
  {
    code: invalidBigTestCode,
    output: validBigTestCode,
    errors: 458,
    optionsSet: [
      [],
      // [SortingOrder.Ascending],
      // [SortingOrder.Ascending, { caseSensitive: true }],
      // [SortingOrder.Ascending, { natural: false }],
      // [SortingOrder.Ascending, { caseSensitive: true, natural: false }],
    ],
  },
]

describe('TypeScript large enum', () => {
  const ruleTester = new RuleTester(typescript)

  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid),
    invalid: processInvalidTestCase(invalid),
  })
})
