import { Rule, RuleTester } from 'eslint'
import path from 'path'
import { name, rule } from 'rules/string-enum'
import { typescriptConfig } from '../../helpers/configs'
import {
  PreInvalidTestCaseObject,
  PreValidTestCaseObject,
  processInvalidTestCase,
  processValidTestCase,
} from '../../helpers/processCases'

import fs from 'fs'

const validBigTestCode = fs
  .readFileSync(path.resolve(__dirname, 'string-enum-big-test.valid-case.ts'))
  .toString('utf-8')
const invalidBigTestCode = fs
  .readFileSync(path.resolve(__dirname, 'string-enum-big-test.invalid-case.ts'))
  .toString('utf-8')

const valid: PreValidTestCaseObject = {
  ascending: [validBigTestCode],
}

const invalid: PreInvalidTestCaseObject = {
  ascending: [
    {
      code: invalidBigTestCode,
      output: validBigTestCode,
      errors: 458,
    },
  ],
}

describe('TypeScript large enum', () => {
  const ruleTester = new RuleTester(typescriptConfig)

  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid, false),
    invalid: processInvalidTestCase(invalid, false),
  })
})
