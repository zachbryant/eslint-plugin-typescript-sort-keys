import assert from 'assert'

import { getOptions } from 'common/options'
import { CreateReporterArgs, NodePositionInfo, TSType } from 'common/types'
import { getPropertyName } from './ast'
import {
  SourceCode,
  getIndentRange,
  getLineOfText,
  getReassembledBodyText,
} from './sourceCodeHelper'

import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils'

export function reportParentNode(
  createReporterArgs: Omit<CreateReporterArgs<string>, 'createReportPropertiesObject'>,
  bodyParent: TSESTree.Node,
  body: TSType[],
  sortedBody: TSType[],
  unsortedCount: number,
) {
  const { loc, messageId } = createReporterArgs.createReportParentObject(bodyParent)

  createReporterArgs.context.report({
    loc,
    messageId,
    node: bodyParent,
    data: {
      unsortedCount,
    },

    *fix(fixer: TSESLint.RuleFixer) {
      // Replace the entire body with the sorted body
      const sourceCode = createReporterArgs.context.getSourceCode() as SourceCode
      const startNodeIndentRange = getIndentRange(sourceCode, body[0])
      // The start of the body includes the indent of the first node
      const start = body[0].range[0] - (startNodeIndentRange[1] - startNodeIndentRange[0])
      const endNode = body[body.length - 1]
      // The end of the body includes the punctuator and comments if any
      const end =
        body[body.length - 1].range[1] -
        sourceCode.getText(endNode).length +
        getLineOfText(sourceCode, endNode).trimStart().length

      yield fixer.replaceTextRange(
        [start, end],
        getReassembledBodyText(sourceCode, sortedBody),
      )
    },
  })
}

export function reportUnsortedBody(
  createReporterArgs: Omit<CreateReporterArgs<string>, 'createReportParentObject'>,
  nodePositions: Map<TSType, NodePositionInfo>,
  sortedBody: TSType[],
) {
  const { isInsensitive, isNatural, isRequiredFirst, order } = getOptions(
    createReporterArgs.context,
  )
  for (const [node, nodePositionInfo] of nodePositions.entries()) {
    const { initialIndex, finalIndex } = nodePositionInfo
    // If the node is not in the correct position, report it
    if (initialIndex !== finalIndex) {
      const { loc, messageId } = createReporterArgs.createReportPropertiesObject(node)

      // Sanity check
      assert(loc, 'createReportObject return value must include a node location')
      assert(messageId, 'createReportObject return value must include a problem message')

      const nextSortedNode =
        finalIndex + 1 < sortedBody.length ? sortedBody[finalIndex + 1] : undefined

      createReporterArgs.context.report({
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
      })
    }
  }
}
