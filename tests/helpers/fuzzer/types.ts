export type Range = [number, number]

export enum DefinitionTypes {
  Enum = 'E',
  Inline = 'inline',
  Interface = 'I',
  Type = 'T',
  Union = 'U',
}

export enum MemberKeyFormat {
  Index = "[index: '{0}']{1}", // type, optional respectively
  KeyOf = '[K in keyof TKey]{1}', // optional
  Method = "'{0}'{1}()", // Name, optional respectively
  String = "'{0}'{1}", // Name, optional respectively
  //Variable = '[\'{0}\']', // TODO need to generate a variable to enable this
}

export enum MemberTypeAnnotationFormat {
  Basic = '{0}',
  Generic = 'Array<{0}>',
  Union = '{0}|{1}|{2}',
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
  type: string[]
  typeAnnotationFormat: MemberTypeAnnotationFormat
  isEnumMember: boolean
}

export interface GeneratedComment {
  text: string
  type: CommentTypes
}
