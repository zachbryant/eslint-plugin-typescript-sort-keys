import path from 'path'
import {
  generateTestEnvironment,
  purgeTestEnvironment,
  runScript,
} from './helpers/test-node'

describe('Node environments', () => {
  const keepArtifacts = process.env.KEEP_ARTIFACTS === 'true'
  const generatedTestFolder = path.resolve(__dirname, './environments/generated')
  const cases = ['16', '18', '19', '20']

  for (const majorNodeVersion of cases) {
    const testFolder = path.resolve(generatedTestFolder, `node-${majorNodeVersion}`)
    // TODO template for testing in ESM
    for (const moduleType of ['commonjs' /*, 'es6'*/]) {
      describe(`v${majorNodeVersion}`, () => {
        describe(moduleType, () => {
          beforeAll(() => {
            purgeTestEnvironment(testFolder)
            generateTestEnvironment(majorNodeVersion, testFolder)
            if (process.env.DEBUG === 'true')
              console.log(`Running setup for node v${majorNodeVersion} (${moduleType})`)
            runScript(testFolder, 'setup')
          })
          afterAll(() => {
            if (!keepArtifacts) {
              purgeTestEnvironment(testFolder)
            }
          })

          it(`should detect lint errors`, () => {
            const result = runScript(testFolder, 'lint-original-file')
            expect(result.exitCode).toBe(1)
          })
          it(`should lint without issue`, () => {
            const result = runScript(testFolder, 'lint-fix')
            expect(result.exitCode).toBe(0)
          })
          it(`should fix in one go`, () => {
            runScript(testFolder, 'lint-fix')
            const result = runScript(testFolder, 'lint-fixed-file')
            expect(result.exitCode).toBe(0)
          })
        })
      })
    }
  }
})
