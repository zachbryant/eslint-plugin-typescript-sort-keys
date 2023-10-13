import { Ranges } from '../constants'
import { formatDefinition } from '../format'
import {
  CommentTypes,
  DefinitionTypes,
  GeneratedComment,
  GeneratedDefinition,
  GeneratedMember,
  MemberKeyFormat,
  MemberTypeAnnotationFormat,
  isEnum,
  isIndexKey,
  isKeyOfKey,
  isStringKey,
  isType,
} from '../types'
import {
  capitalize,
  chance,
  generateFilledArray,
  generateRandomMemberKeyName,
  randomIntBetween,
  randomSelect,
  randomText,
  validateTSCode,
} from '../utils'

export function generateDefinitions(count: number): GeneratedDefinition[] {
  return generateFilledArray(count, () =>
    generateDefinition(undefined, 0, randomIntBetween(Ranges.embed.depth)),
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

/**
 * Need to prevent some scenarios like:
 * - keyof from being used outside of type definition
 * - methods as keys in enums
 */
const getKeyFormat = (definitionType: DefinitionTypes) => {
  let keyFormat
  while (
    !keyFormat ||
    (!isType(definitionType) && isKeyOfKey(keyFormat)) ||
    (isEnum(definitionType) && !isStringKey(keyFormat))
  ) {
    keyFormat = randomSelect(MemberKeyFormat)
  }
  return keyFormat
}

// Check for scenarios where optional is invalid
function canBeOptional(definitionType: DefinitionTypes, keyFormat: MemberKeyFormat) {
  return !isEnum(definitionType) && keyFormat !== MemberKeyFormat.Index
}

function generateMember(
  definitionType: DefinitionTypes,
  depthCurrent: number,
  depthMax: number,
): GeneratedMember {
  const name = generateRandomMemberKeyName()
  const keyFormat = getKeyFormat(definitionType)
  const optional = chance(0.5) && canBeOptional(definitionType, keyFormat)
  const typeAnnotation: MemberTypeAnnotationFormat = randomSelect(
    MemberTypeAnnotationFormat,
  )
  const type = generateTypeAnnotationValues(
    definitionType,
    keyFormat,
    typeAnnotation,
    depthCurrent,
    depthMax,
  )

  return {
    comments: {
      before: generateComments(depthCurrent),
      after: generateComments(depthCurrent),
    },
    keyFormat,
    name,
    typeAnnotationFormat: typeAnnotation,
    type,
    optional,
    parentDefinitionType: definitionType,
  }
}

function generateComment(): GeneratedComment {
  return {
    type: randomSelect(CommentTypes),
    text: randomText([1, 1], randomSelect(['words', 'sentences', 'paragraphs'])),
  }
}

function generateComments(depthCurrent: number) {
  const exponentialDropoff = Math.max(1, Math.pow(depthCurrent, 3))
  const randCount = Math.floor(randomIntBetween(Ranges.comment) / exponentialDropoff)
  return generateFilledArray(randCount, generateComment)
}

function generateTypeAnnotationValues(
  definitionType: DefinitionTypes,
  keyFormat: MemberKeyFormat,
  typeAnnotation: MemberTypeAnnotationFormat,
  depthCurrent: number,
  depthMax: number,
): string[] {
  const count = typeAnnotation.match(/({\d+})/g)?.length ?? 0
  return generateFilledArray(count, () =>
    generateTypeAnnotationValue(definitionType, keyFormat, depthCurrent, depthMax),
  )
}

// Check for scenarios where literal is invalid
function canBeLiteral(keyFormat: MemberKeyFormat) {
  return keyFormat !== MemberKeyFormat.Index
}

// Enum values must be literal
function mustBeLiteral(definitionType: DefinitionTypes) {
  return isEnum(definitionType)
}

function generateTypeAnnotationValue(
  definitionType: DefinitionTypes,
  keyFormat: MemberKeyFormat,
  depthCurrent: number,
  depthMax: number,
): string {
  if (isIndexKey(keyFormat)) return generateIndexSignatureFriendlyTypeValue()

  return (chance(0.5) && canBeLiteral(keyFormat)) || mustBeLiteral(definitionType)
    ? generateLiteralTypeAnnotationValue(depthCurrent, depthMax)
    : generateBasicTypeAnnotationValue()
}

function generateLiteralTypeAnnotationValue(
  depthCurrent: number,
  depthMax: number,
): string {
  return randomSelect(
    [
      '"a"',
      '1',
      'true',
      '""',
      depthCurrent < depthMax &&
        formatDefinition(
          generateDefinition(DefinitionTypes.Inline, depthCurrent + 1, depthMax),
        ),
    ].filter(_ => !!_) as string[],
  )
}

function generateIndexSignatureFriendlyTypeValue() {
  return randomSelect(['string', 'number', 'symbol'])
}

function generateBasicTypeAnnotationValue(): string {
  return randomSelect([
    'string',
    'number',
    'boolean',
    'undefined',
    'unknown',
    'any',
    'never',
    '(() => void)',
  ])
}

// TODO deduplicate index type annotations
// TODO mapped types can't have anything else
// TODO sync other type annotations to possible index signature types
//console.log(generateDefinitions(1).map(formatDefinition))
console.log(validateTSCode(`${generateDefinitions(1).map(formatDefinition)[0]}`))
