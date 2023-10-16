import fs from 'fs'
import tmp from 'tmp'
import { Config, getESLint } from './helpers/eslint'
import { fuzz } from './helpers/fuzzer/fuzz'

const FUZZ_COUNT = 1000

/**
 * At this time, fuzzy testing is ensuring there are no
 * edge cases that cause the autofix to crash.
 *
 * It is intended to test positioning of comments/whitespace around nodes.
 * TODO Add output comparison
 */
describe('fuzz', () => {
  const tmpOutDir = tmp.dirSync({
    template: 'typescript-sort-keys-XXXXXX',
    unsafeCleanup: false,
  }).name

  beforeAll(() => {
    tmp.setGracefulCleanup()
  })

  afterAll(() => {
    if (fs.readdirSync(tmpOutDir).length === 0)
      fs.rmdirSync(tmpOutDir, { recursive: true })
  })

  const cases = fuzz(FUZZ_COUNT).map(inputString => [
    tmp.tmpNameSync({ template: `${tmpOutDir}/XXXXXX.ts` }),
    inputString,
  ])

  it.each(cases)(
    `fuzzy autofix has no errors (input= %s)`,
    async (tmpInputFile, inputString) => {
      fs.writeFileSync(tmpInputFile, inputString)

      const eslint = getESLint(Config.Recommended)

      const results = await eslint.lintFiles(tmpInputFile)
      const result = results[0]

      // For debugging when output is malformed
      if (process.env.DEBUG === 'true') console.log(result.output)

      expect(result.messages).toHaveLength(0)
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
      expect(result.fixableErrorCount).toBe(0)
      expect(result.fixableWarningCount).toBe(0)

      // No need to keep successful test files
      fs.unlinkSync(tmpInputFile)
    },
  )
})
