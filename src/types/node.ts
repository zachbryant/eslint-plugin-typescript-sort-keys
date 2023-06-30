import { TSESTree } from '@typescript-eslint/utils'

export type TSType = TSESTree.TypeElement | TSESTree.TSEnumMember
export type NodePositionInfo = { initialIndex: number; finalIndex: number }
