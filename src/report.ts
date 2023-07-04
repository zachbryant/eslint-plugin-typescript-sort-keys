import assert from 'assert'

import { getOptions } from 'common/options'
import { AllRuleOptions, CreateReporterArgs, NodePositionInfo, TSType } from './types'
import { getPropertyName } from './utils/ast'

import { TSESTree } from '@typescript-eslint/utils'
import { ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint'

export function reportParentNode(
  createReporterArgs: Omit<
    CreateReporterArgs<string, AllRuleOptions>,
    'createReportPropertiesObject'
  >,
  bodyParent: TSESTree.Node,
  unsortedCount: number,
  fixerFunction: ReportFixFunction,
) {
  const { context, createReportParentObject } = createReporterArgs
  const { loc, messageId } = createReportParentObject(bodyParent)

  context.report({
    loc,
    messageId,
    node: bodyParent,
    data: {
      unsortedCount,
    },
    fix: fixerFunction,
  })
}

export function reportUnsortedBody(
  createReporterArgs: Omit<
    CreateReporterArgs<string, AllRuleOptions>,
    'createReportParentObject'
  >,
  nodePositions: Map<TSType, NodePositionInfo>,
  sortedBody: TSType[],
  fixerFunction: ReportFixFunction,
) {
  const { context, createReportPropertiesObject } = createReporterArgs
  const { isInsensitive, isNatural, isRequiredFirst, order } = getOptions(
    createReporterArgs.context,
  )
  for (const [node, nodePositionInfo] of nodePositions.entries()) {
    const { initialIndex, finalIndex } = nodePositionInfo
    // If the node is not in the correct position, report it
    if (initialIndex !== finalIndex) {
      const { loc, messageId } = createReportPropertiesObject(node)

      // Sanity check
      assert(loc, 'createReportObject return value must include a node location')
      assert(messageId, 'createReportObject return value must include a problem message')

      const nextSortedNode =
        finalIndex + 1 < sortedBody.length ? sortedBody[finalIndex + 1] : undefined

      context.report({
        loc,
        messageId,
        node,
        data: {
          nodeName: getPropertyName(node),
          messageShouldBeWhere: nextSortedNode
            ? `before '${getPropertyName(nextSortedNode)}'`
            : 'at the end',
          order,
          insensitive: isInsensitive ? 'insensitive ' : '',
          natural: isNatural ? 'natural ' : '',
          requiredFirst: isRequiredFirst ? 'required first ' : '',
        },
        fix: fixerFunction,
      })
    }
  }
}
