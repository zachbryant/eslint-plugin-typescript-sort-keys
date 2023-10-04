import { ESLint } from 'eslint'
import fs from 'fs'
import path from 'path'
import tmp from 'tmp'

import recommended from 'config/recommended.config'
import requiredFirst from 'config/requiredFirst.config'
import plugin from '../src'
import { typescriptConfig } from './helpers/configs'

describe('autofix', () => {
  beforeEach(() => {
    tmp.setGracefulCleanup()
  })

  const cases: Array<[any, string, string]> = [
    [recommended, 'recommended', 'autofix.output.ts'],
    [requiredFirst, 'requiredFirst', 'requiredFirst.output.ts'],
  ]
  cases.forEach(([config, configName, outputFileName]) => {
    it(`should autofix (config=${configName}, output=${outputFileName})`, async () => {
      const { name: tmpDir } = tmp.dirSync({
        prefix: 'typescript-sort-keys-',
        unsafeCleanup: true,
      })

      const testFilePath = path.join(tmpDir, 'autofix.ts')
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
