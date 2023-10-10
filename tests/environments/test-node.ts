import path from 'path'
import { generateTestEnvironment, purgeTestEnvironment, runTest } from './utils'

function main() {
  const NodeVersion = process.env.TEST_NODE_VERSION
  const KeepArtifacts = process.env.TEST_KEEP_ARTIFACTS
  const GeneratedTestFolder = path.resolve(__dirname, './generated')
  if (!NodeVersion) {
    throw new Error('Env variable TEST_NODE_VERSION is falsy')
  }

  const testFolder = path.resolve(GeneratedTestFolder, `node-${NodeVersion}`)

  try {
    generateTestEnvironment(NodeVersion, testFolder)
    runTest(testFolder)
  } finally {
    if (!KeepArtifacts) purgeTestEnvironment(testFolder)
  }
}

main()
