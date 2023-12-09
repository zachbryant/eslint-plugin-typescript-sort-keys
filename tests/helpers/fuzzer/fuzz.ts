import { formatDefinition } from './format'
import { generateDefinitions } from './generate/generate'

export function fuzz(count: number) {
  return generateDefinitions(count).map(
    definition => `export {}; ${formatDefinition(definition)}`,
  )
}
