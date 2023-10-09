import { Rule, RuleTester } from 'eslint'
import path from 'path'
import { name, rule } from '../../../src/rules/string-enum'
import { typescriptConfig } from '../../helpers/configs'
import {
  PreInvalidTestCaseObject,
  PreValidTestCaseObject,
  processInvalidTestCase,
  processValidTestCase,
} from '../../helpers/processCases'

import fs from 'fs'
import { CaseCategory } from '../../helpers/strings'

const fixtures = path.resolve(__dirname, '../../fixtures')

const validBigTestCode = fs
  .readFileSync(path.resolve(fixtures, 'string-enum-big-valid.output.ts'))
  .toString('utf-8')
const invalidBigTestCode = fs
  .readFileSync(path.resolve(fixtures, 'string-enum-big-invalid.output.ts'))
  .toString('utf-8')

const valid: PreValidTestCaseObject = {
  ascending: [validBigTestCode],
}

const invalid: PreInvalidTestCaseObject = {
  ascending: [
    {
      code: invalidBigTestCode,
      output: validBigTestCode,
      errors: 328,
    },
  ],
}

describe('TypeScript large enum', () => {
  const ruleTester = new RuleTester(typescriptConfig)

  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid, false),
    invalid: processInvalidTestCase(invalid, CaseCategory.StringEnum, false),
  })
})
