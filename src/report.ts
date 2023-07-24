import assert from 'assert'

import { getOptions } from 'common/options'
import { AllRuleOptions, CreateReporterArgs, NodePositionInfo, TSType } from './types'
import { getPropertyName } from './utils/ast'

import { TSESTree } from '@typescript-eslint/utils'
import { ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint'

/**
 * Report the parent node if
 */
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

/**
 * Report the body nodes if they're unsorted.
 */
export function reportBodyNodes(
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
  for (const [node, { initialIndex, finalIndex }] of nodePositions.entries()) {
    // If the node is not in the correct position, report it
    if (initialIndex !== finalIndex) {
      const { loc, messageId } = createReportPropertiesObject(node)

      // Sanity check
      assert(loc, 'createReportObject return value must include a node location')
      assert(messageId, 'createReportObject return value must include a problem message')

      context.report({
        loc,
        messageId,
        node,
        data: {
          nodeName: getPropertyName(node),
          messageShouldBeWhere:
            finalIndex + 1 < sortedBody.length
              ? `before '${getPropertyName(sortedBody[finalIndex + 1])}'`
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
