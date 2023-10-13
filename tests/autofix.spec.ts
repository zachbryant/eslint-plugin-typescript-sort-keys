import { ESLint } from '@typescript-eslint/utils/ts-eslint'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

import plugin from '../src'
import recommended from '../src/config/recommended.config'
import requiredFirst from '../src/config/requiredFirst.config'
import { typescriptConfig } from './helpers/configs'

describe('autofix', () => {
  beforeEach(() => {
    tmp.setGracefulCleanup()
  })

  const cases: Array<[any, string, string]> = [
    [recommended, 'recommended', 'recommended.output.ts'],
    [requiredFirst, 'requiredFirst', 'requiredFirst.output.ts'],
  ]
  cases.forEach(([config, configName, outputFileName]) => {
    it(`should autofix (config=${configName}, output=${outputFileName})`, async () => {
      const { name: tmpDir } = tmp.dirSync({
        prefix: 'typescript-sort-keys-',
        unsafeCleanup: true,
      })

      const testFilePath = path.join(tmpDir, `autofix-${configName}.ts`)
      const input = fs.readFileSync('tests/fixtures/autofix.input.ts', 'utf8')
      const expectedOutput = fs.readFileSync(`tests/fixtures/${outputFileName}`, 'utf8')

      fs.writeFileSync(testFilePath, input)

      const eslint = new ESLint({
        overrideConfig: {
          ...config,
          parser: typescriptConfig.parser,
          parserOptions: { sourceType: 'module' },
        },
        plugins: {
          'typescript-sort-keys': plugin,
        },
        useEslintrc: false,
        fix: true,
      })

      const results = await eslint.lintFiles(testFilePath)
      const result = results[0]

      // For debugging when output is malformed
      // console.log(result.output)

      expect(result.messages).toHaveLength(0)
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
      expect(result.fixableErrorCount).toBe(0)
      expect(result.fixableWarningCount).toBe(0)

      await ESLint.outputFixes(results)

      const output = fs.readFileSync(testFilePath, 'utf8')

      expect(output).toStrictEqual(expectedOutput)
    })
  })
})
