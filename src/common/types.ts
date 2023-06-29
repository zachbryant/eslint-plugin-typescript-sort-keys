import { Options as InterfaceRuleOptions } from 'rules/interface'
import { Options as StringEnumRuleOptions } from 'rules/string-enum'
import { TSESTree } from '@typescript-eslint/experimental-utils/dist/ts-estree'

export type RuleOptions = InterfaceRuleOptions & StringEnumRuleOptions

export type TSType = TSESTree.TypeElement | TSESTree.TSEnumMember

export type NodePositionInfo = { initialIndex: number; finalIndex: number }
