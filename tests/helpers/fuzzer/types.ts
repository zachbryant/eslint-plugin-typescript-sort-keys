export type Range = [number, number]

export enum DefinitionTypes {
  Enum = 'E',
  Inline = 'inline',
  I = 'I',
  Type = 'T',
  Union = 'U',
}

export enum MemberKeyFormat {
  String = '{0}',
  Index = '[{0}: {1}]',
  Variable = '[{0}]',
  Method = '{0}{1}()', // Name, optional respectively
  KeyOf = '[K in keyof TKey]',
}

export enum MemberTypeAnnotationFormats {
  Array = 'string[][]',
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Undefined = 'undefined',
  Unknown = 'unknown',
  Any = 'any',
  Generic = 'Array<{0}>',
  Union = '{1}|{2}|{3}',
  Embedded = '{0}',
}

export enum WhitespaceTypes {
  Newline = 'newline',
  Space = 'space',
  Tab = 'tab',
}

export enum CommentTypes {
  Line = 'Line',
  Block = 'Block',
}

export interface GeneratedDefinition {
  type: DefinitionTypes
  name: string
  members: GeneratedMember[]
}

export interface GeneratedMember {
  comments: {
    before: GeneratedComment[]
    after: GeneratedComment[]
  }
  name: string
  keyFormat: MemberKeyFormat
  typeAnnotationFormat: MemberTypeAnnotationFormats
  optional: boolean
}

export interface GeneratedComment {
  type: CommentTypes
  text: string
}
