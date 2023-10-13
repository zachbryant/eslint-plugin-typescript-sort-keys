import { Ranges } from '../constants'
import { WhitespaceTypes } from '../types'
import { chance, getWhitespaceFromType, randomIntBetween, randomSelect } from '../utils'

export function generateWhitespace() {
  const spaceType: WhitespaceTypes = chance(0.7)
    ? WhitespaceTypes.Space
    : randomSelect(WhitespaceTypes)
  const count = chance(0.5) ? 1 : randomIntBetween(Ranges.whitespace[spaceType])
  const space = getWhitespaceFromType(spaceType)
  return new Array(count).fill(space).join('')
}
