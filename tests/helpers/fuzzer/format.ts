import { generateWhitespace } from './generate'
import {
  CommentTypes,
  DefinitionTypes,
  GeneratedComment,
  GeneratedDefinition,
  GeneratedMember,
  MemberKeyFormat,
  MemberTypeAnnotationFormat,
} from './types'
import { generateFilledArray, zip } from './utils'

export function formatDefinition(definition: GeneratedDefinition) {
  const formattedTypeAndName = [formatDefinitionType(definition.type), definition.name]
    .filter(Boolean)
    .join(' ')
  const formattedMembers = definition.members.map(formatMember)
  const entries = [
    ...definition.comments.start.map(formatComment),
    ...formattedMembers,
    ...definition.comments.end.map(formatComment),
  ]
  const whitespace = generateFilledArray(entries.length + 1, generateWhitespace)
  return `${formattedTypeAndName}${formattedTypeAndName && ' '}{${zip(
    entries,
    whitespace,
  ).join('')}}`
}

function formatMember(member: GeneratedMember) {
  const formattedKey = formatMemberKey(member.keyFormat, member)
  const formattedType = formatMemberTypeAnnotation(member.typeAnnotationFormat, member)
  const punctuation = member.isEnumMember ? ',' : ';'
  const entries = [
    ...member.comments.before.map(formatComment),
    `${formattedKey}${member.isEnumMember ? '=' : ':'}`,
    `${formattedType}`,
    ...member.comments.after
      .filter(_ => _.type === CommentTypes.Block)
      .map(formatComment),
    punctuation,
    ...member.comments.after.filter(_ => _.type === CommentTypes.Line).map(formatComment),
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

export function formatMemberTypeAnnotation(
  typeAnnotationFormat: MemberTypeAnnotationFormat,
  member: GeneratedMember,
) {
  return format(typeAnnotationFormat, ...member.type)
}

function formatMemberKey(keyFormat: MemberKeyFormat, member: GeneratedMember) {
  return format(keyFormat, member.name, member.optional ? '?' : '')
}

export function format(template: string, ...args: string[]) {
  return template.replace(/{(\d+)}/g, (match, index) => args[index] ?? match)
}
