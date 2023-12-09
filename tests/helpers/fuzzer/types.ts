export type Range = [number, number]

export enum DefinitionTypes {
  Enum = 'E',
  Inline = 'inline',
  Interface = 'I',
  Type = 'T',
  Union = 'U',
}

export enum DefinitionTypesTopLevel {
  Enum = DefinitionTypes.Enum,
  Interface = DefinitionTypes.Interface,
  Type = DefinitionTypes.Type,
}

export const isEnum = (dt: DefinitionTypes) => dt === DefinitionTypes.Enum
export const isType = (dt: DefinitionTypes) => dt === DefinitionTypes.Type

export enum MemberKeyFormat {
  // Disabled these because they don't need fuzzing and cause a lot of edge cases
  //Index = '[index: {2}]', // type, optional respectively
  //KeyOf = '[K in keyof TKey]{1}', // optional
  Method = "'{0}'{1}()", // Name, optional respectively
  String = "'{0}'{1}", // Name, optional respectively
  //Variable = '[\'{0}\']', // TODO need to generate a variable to enable this
}

// export const isIndexKey = (kf: MemberKeyFormat) => kf === MemberKeyFormat.Index
// export const isKeyOfKey = (kf: MemberKeyFormat) => kf === MemberKeyFormat.KeyOf
export const isStringKey = (kf: MemberKeyFormat) => kf === MemberKeyFormat.String

export enum MemberTypeAnnotationFormat {
  Basic = '{0}',
  Generic = 'Array<{0}>',
  Union2 = '{0}|{1}',
  Union3 = '{0}|{1}|{2}',
}

export enum WhitespaceTypes {
  Newline = 'newline',
  Space = 'space',
  Tab = 'tab',
}

export enum CommentTypes {
  Block = 'Block',
  Line = 'Line',
}

export interface GeneratedDefinition {
  comments: {
    start: GeneratedComment[]
    end: GeneratedComment[]
  }
  members: GeneratedMember[]
  name: string | false
  type: DefinitionTypes
}

export interface GeneratedMember {
  comments: {
    before: GeneratedComment[]
    after: GeneratedComment[]
  }
  keyFormat: MemberKeyFormat
  name: string
  optional: boolean
  parentDefinitionType: DefinitionTypes
  type: string[]
  typeAnnotationFormat: MemberTypeAnnotationFormat
}

export const isEnumMember = (m: GeneratedMember) => isEnum(m.parentDefinitionType)

export interface GeneratedComment {
  text: string
  type: CommentTypes
}

export const isBlockComment = (c: GeneratedComment) => c.type === CommentTypes.Block
export const isLineComment = (c: GeneratedComment) => c.type === CommentTypes.Line
