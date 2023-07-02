import { TSESTree } from '@typescript-eslint/utils'

export type Node = Omit<TSESTree.Node, 'type'> & { type: any }
export type TSType = TSESTree.TypeElement | TSESTree.TSEnumMember
export type NodePositionInfo = { initialIndex: number; finalIndex: number }
