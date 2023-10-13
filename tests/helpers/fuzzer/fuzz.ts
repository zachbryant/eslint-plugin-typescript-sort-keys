import { formatDefinition } from './format'
import { generateDefinitions } from './generate/generate'

const argCount = parseInt(process.argv.at(2))
generateDefinitions((!isNaN(argCount) && argCount) ?? 1000)
  .map(formatDefinition)
  .join('\n\n')
