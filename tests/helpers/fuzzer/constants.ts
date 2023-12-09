import { Range, WhitespaceTypes } from './types'
import { range } from './utils'

// Defines ranges for different aspects of the fuzzy generation
export const Ranges = {
  comment: range(0, 5),
  embed: {
    depth: range(0, 2),
  },
  member: range(1, 10),
  union: range(2, 5),
  whitespace: {
    newline: range(0, 5),
    space: range(0, 10),
    tab: range(0, 5),
  } as { [key in WhitespaceTypes]: Range },
}
