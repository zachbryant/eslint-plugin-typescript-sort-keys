import path from 'path'
import { generateTestEnvironment, purgeTestEnvironment, runTest } from './utils'

function main() {
  const NodeVersion = process.env.TEST_NODE_VERSION
  const KeepArtifacts = process.env.TEST_KEEP_ARTIFACTS === 'true'
  const GeneratedTestFolder = path.resolve(__dirname, './generated')
  if (!NodeVersion) {
    throw new Error('Env variable TEST_NODE_VERSION is falsy')
  }

  const testFolder = path.resolve(GeneratedTestFolder, `node-${NodeVersion}`)

  try {
    purgeTestEnvironment(testFolder)
    generateTestEnvironment(NodeVersion, testFolder)
    runTest(testFolder)
  } finally {
    if (!KeepArtifacts) purgeTestEnvironment(testFolder)
  }
}

main()
