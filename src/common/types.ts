import { Options as InterfaceRuleOptions } from 'rules/interface'
import { Options as StringEnumRuleOptions } from 'rules/string-enum'
import { TSESTree } from '@typescript-eslint/experimental-utils'
import { RuleContext as UtilRuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint'

export type RuleOptions = InterfaceRuleOptions & StringEnumRuleOptions

export type TSType = TSESTree.TypeElement | TSESTree.TSEnumMember

export type NodePositionInfo = { initialIndex: number; finalIndex: number }

export type ReportObjectCreator = <MessageIds extends string>(
  node: TSESTree.Node,
) => {
  readonly loc: TSESTree.SourceLocation
  readonly messageId: MessageIds
}

export type CreateReporterArgs<MessageIds extends string> = {
  context: UtilRuleContext<MessageIds, RuleOptions>
  createReportPropertiesObject: ReportObjectCreator
  createReportParentObject: ReportObjectCreator
}
