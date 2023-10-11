/**
 * Generate
 * - Type
 *   - interface
 *   - enum
 *   - type definition
 *   - anonymous type
 *   - embedded
 *   - union (random number of types in union)
 *   - as generic in Omit
 *   -
 * - Members
 *   - random string, a-z, A-Z, 0-9 + symbols + other accent chars
 *   - index signatures
 *   - key based on variable
 *   - optional
 *   - method (with and without return type)
 *   - random type on interface
 *   - generated (like [K in keyof TKey])
 * - order: randomized, sort then compare
 * - whitespace: randomized spaces, tabs, newlines
 * - comments: before, after, random count & length
 *   - Line
 *   - Block: with and without newlines
 */
// Generate cases until coverage hits threshold

import {
  CommentTypes,
  DefinitionTypes,
  GeneratedComment,
  GeneratedDefinition,
  GeneratedMember,
  MemberKeyFormat,
  MemberTypeAnnotationFormats,
  Range,
  WhitespaceTypes,
} from './types'
import {
  capitalize,
  generateFilledArray,
  generateRandomMemberKeyName,
  getWhitespaceFromType,
  randomIntBetween,
  randomSelect,
  randomText,
  range,
} from './utils'

const Ranges = {
  comment: range(0, 5),
  definition: range(1, 20),
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

function generateDefinition(): GeneratedDefinition {
  const definitionType: DefinitionTypes = randomSelect(DefinitionTypes)
  const definitionName =
    definitionType !== DefinitionTypes.Inline &&
    `${definitionType}_${capitalize(randomText([1, 1], 'words'))}_${randomIntBetween([
      1, 1000,
    ])}`

  return {
    type: definitionType,
    name: definitionName,
    members: generateFilledArray(randomIntBetween(Ranges.member), generateMember),
  }
}

function generateMember(): GeneratedMember {
  const name = generateRandomMemberKeyName()
  const keyType: MemberKeyFormat = randomSelect(MemberKeyFormat)
  const optional = Math.random() > 0.5
  const typeAnnotation: MemberTypeAnnotationFormats = randomSelect(
    MemberTypeAnnotationFormats,
  )

  console.log(generateFilledArray(randomIntBetween(Ranges.comment), generateComment))
  return {
    comments: {
      before: generateFilledArray(randomIntBetween(Ranges.comment), generateComment),
      after: generateFilledArray(randomIntBetween(Ranges.comment), generateComment),
    },
    keyFormat: keyType,
    name,
    typeAnnotationFormat: typeAnnotation,
    optional,
  }
}

function generateComment(): GeneratedComment {
  return {
    type: randomSelect(CommentTypes),
    text: randomText([1, 1], randomSelect(['words', 'sentences', 'paragraphs'])),
  }
}

function generateWhitespace() {
  const spaceType: WhitespaceTypes = randomSelect(WhitespaceTypes)
  const count = randomIntBetween(Ranges.whitespace[spaceType])
  const space = getWhitespaceFromType(spaceType)
  return new Array(count).fill(space).join('')
}

console.log(generateDefinition())
