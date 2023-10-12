import { formatDefinition } from './format'
import { generateDefinitions } from './generate'

export const fuzz = () => generateDefinitions().map(formatDefinition).join('\n\n')

export default fuzz
