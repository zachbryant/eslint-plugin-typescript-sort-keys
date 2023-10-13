import { generateWhitespace } from './generate/whitespace'
import {
  DefinitionTypes,
  GeneratedComment,
  GeneratedDefinition,
  GeneratedMember,
  isBlockComment,
  isEnumMember,
  isLineComment,
} from './types'
import { generateFilledArray, zip } from './utils'

export function formatDefinition(definition: GeneratedDefinition) {
  const formattedTypeAndName = [
    formatDefinitionType(definition.type),
    canShowName(definition.type) && definition.name,
  ]
    .filter(Boolean)
    .join(' ')
  const formattedMembers = definition.members.map(formatMember)
  const entries = [
    ...definition.comments.start.map(formatComment),
    ...formattedMembers,
    ...definition.comments.end.map(formatComment),
  ]
  const whitespace = generateFilledArray(entries.length + 1, generateWhitespace)
  const codeBodyString = zip(entries, whitespace).join('')
  return `${formattedTypeAndName}${formattedTypeAndName && ' '}{${codeBodyString}}`
}

function formatMember(member: GeneratedMember) {
  const formattedKey = formatMemberKey(member)
  const formattedType = formatMemberTypeAnnotation(member)
  const punctuation = isEnumMember(member) ? ',' : ';'
  const assignmentOperator = isEnumMember(member) ? '=' : ':'
  const entries = [
    ...member.comments.before.map(formatComment),
    `${formattedKey}${assignmentOperator}`,
    `${formattedType}`,
    ...member.comments.after.filter(isBlockComment).map(formatComment),
    punctuation,
    ...member.comments.after.filter(isLineComment).map(formatComment),
  ]
  return zipWithWhitespace(entries).join('')
}

function zipWithWhitespace(entries: string[]) {
  const whitespace = generateFilledArray(entries.length + 1, generateWhitespace)
  return zip(entries, whitespace)
}

function formatComment(comment: GeneratedComment) {
  switch (comment.type) {
    case 'Line':
      return format(`// {0}\n`, comment.text)
    case 'Block':
      return format(`/* {0} */`, comment.text)
    default:
      return ''
  }
}

function canShowName(definitionType: DefinitionTypes) {
  return (
    definitionType !== DefinitionTypes.Inline && definitionType !== DefinitionTypes.Union
  )
}

function formatDefinitionType(definitionType: string) {
  switch (definitionType) {
    case DefinitionTypes.Enum:
      return 'enum'
    case DefinitionTypes.Interface:
      return 'interface'
    case DefinitionTypes.Type:
      return 'type'
    case DefinitionTypes.Union:
    case DefinitionTypes.Inline:
    default:
      return ''
  }
}

export function formatMemberTypeAnnotation(member: GeneratedMember) {
  return format(member.typeAnnotationFormat, ...member.type)
}

export function formatMemberKey(member: GeneratedMember) {
  return format(member.keyFormat, member.name, member.optional ? '?' : '', ...member.type)
}

export function format(template: string, ...args: string[]) {
  return template.replace(/{(\d+)}/g, (match, index) => args[index] ?? match)
}
