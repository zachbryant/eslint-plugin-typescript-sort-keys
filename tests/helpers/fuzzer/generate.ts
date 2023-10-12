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

import { formatDefinition, formatMemberTypeAnnotation } from './format'
import {
  CommentTypes,
  DefinitionTypes,
  GeneratedComment,
  GeneratedDefinition,
  GeneratedMember,
  MemberKeyFormat,
  MemberTypeAnnotationFormat,
  Range,
  WhitespaceTypes,
} from './types'
import {
  capitalize,
  chance,
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
  definition: range(1000, 2000),
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

export function generateDefinitions(
  upperLimit: number = Ranges.definition[1],
): GeneratedDefinition[] {
  const [lowerLimit] = Ranges.definition
  return generateFilledArray(
    randomIntBetween([lowerLimit < upperLimit ? lowerLimit : 1, upperLimit]),
    () => generateDefinition(undefined, 0, randomIntBetween(Ranges.embed.depth)),
  )
}

function generateDefinition(
  forceType?: DefinitionTypes,
  depthCurrent: number = 0,
  depthMax: number = 0,
): GeneratedDefinition {
  const definitionType: DefinitionTypes = forceType ?? randomSelect(DefinitionTypes)
  const definitionName =
    definitionType !== DefinitionTypes.Inline &&
    `${definitionType}_${capitalize(randomText([1, 1], 'words'))}_${randomIntBetween([
      1, 1000,
    ])}`

  return {
    type: depthCurrent === 0 ? definitionType : DefinitionTypes.Inline,
    name: definitionName,
    comments: {
      start: generateComments(depthCurrent),
      end: generateComments(depthCurrent),
    },
    members: generateMembers(definitionType, depthCurrent, depthMax),
  }
}

function generateMembers(
  definitionType: DefinitionTypes,
  depthCurrent: number,
  depthMax: number,
) {
  return generateFilledArray(randomIntBetween(Ranges.member), () =>
    generateMember(definitionType, depthCurrent, depthMax),
  )
}

function generateMember(
  definitionType: DefinitionTypes,
  depthCurrent: number,
  depthMax: number,
): GeneratedMember {
  const isEnum = definitionType === DefinitionTypes.Enum
  const name = generateRandomMemberKeyName()
  const keyType: MemberKeyFormat = randomSelect(MemberKeyFormat)
  const optional = !isEnum && chance(0.5)
  const typeAnnotation: MemberTypeAnnotationFormat = randomSelect(
    MemberTypeAnnotationFormat,
  )

  return {
    comments: {
      before: generateComments(depthCurrent),
      after: generateComments(depthCurrent),
    },
    keyFormat: keyType,
    name,
    typeAnnotationFormat: typeAnnotation,
    type: generateTypeAnnotationValues(typeAnnotation, depthCurrent, depthMax),
    optional,
    isEnumMember: isEnum,
  }
}

function generateComment(): GeneratedComment {
  return {
    type: randomSelect(CommentTypes),
    text: randomText([1, 1], randomSelect(['words', 'sentences', 'paragraphs'])),
  }
}

function generateComments(depthCurrent: number) {
  const randCount = randomIntBetween(Ranges.comment) / Math.pow(depthCurrent, 2)
  return generateFilledArray(randCount, generateComment)
}

export function generateWhitespace() {
  const spaceType: WhitespaceTypes = chance(0.7)
    ? WhitespaceTypes.Space
    : randomSelect(WhitespaceTypes)
  const count = chance(0.5) ? 1 : randomIntBetween(Ranges.whitespace[spaceType])
  const space = getWhitespaceFromType(spaceType)
  return new Array(count).fill(space).join('')
}

function generateTypeAnnotationValues(
  typeAnnotation: MemberTypeAnnotationFormat,
  depthCurrent: number,
  depthMax: number,
): string[] {
  const count = typeAnnotation.match(/({\d+})/g)?.length ?? 0
  return generateFilledArray(count, () =>
    generateTypeAnnotationValue(depthCurrent, depthMax),
  )
}

function generateTypeAnnotationValue(depthCurrent: number, depthMax: number): string {
  return randomSelect([
    'string',
    'number',
    'boolean',
    'undefined',
    'unknown',
    'any',
    'never',
    '() => void',
    '"a"',
    '1',
    'true',
    '""',
    depthMax === 0 || depthCurrent < depthMax
      ? formatDefinition(
          generateDefinition(DefinitionTypes.Inline, depthCurrent + 1, depthMax),
        )
      : '""',
  ])
}

// TODO no mapped values outside of TYPE
//console.log(generateDefinitions(1).map(formatDefinition))
console.log(
  formatMemberTypeAnnotation(MemberTypeAnnotationFormat.Union, {
    type: generateTypeAnnotationValues(MemberTypeAnnotationFormat.Union, 0, 1),
  } as unknown as GeneratedMember),
)
