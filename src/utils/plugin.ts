import { TSESTree } from '@typescript-eslint/experimental-utils'

import { RuleContext as UtilRuleContext } from '@typescript-eslint/experimental-utils/dist/ts-eslint'
import assert from 'assert'

import { SortingOrder } from 'common/options'
import { getPropertyIsOptional, getPropertyName } from './ast'
import { compareFn } from './compare'
import { createNodeMover } from './createNodeMover'
import { RuleOptions, TSType, NodePositionInfo } from 'common/types'

function getOptions(context: UtilRuleContext<string, RuleOptions>) {
  const order = context.options[0] || SortingOrder.Ascending
  const options = context.options[1]
  const isAscending = order === SortingOrder.Ascending
  const isInsensitive = Boolean(options?.caseSensitive) === false
  const isNatural = Boolean(options?.natural)
  const isRequiredFirst = Boolean(options?.requiredFirst) === true

  return {
    isAscending,
    isInsensitive,
    isNatural,
    isRequiredFirst,
    order,
  }
}

function getSortedBody(
  body: TSType[],
  isRequiredFirst: boolean,
  sortFunction: (a: TSType, b: TSType) => number,
) {
  return isRequiredFirst
    ? [
        // Split into required and optional properties, sort each group, then merge
        ...body
          .slice(0)
          .filter(node => !getPropertyIsOptional(node))
          .sort(sortFunction),
        ...body
          .slice(0)
          .filter(node => getPropertyIsOptional(node))
          .sort(sortFunction),
      ]
    : body.slice(0).sort(sortFunction)
}

export function createReporter<MessageIds extends string>(
  context: UtilRuleContext<MessageIds, RuleOptions>,
  createReportObject: (node: TSESTree.Node) => {
    readonly loc: TSESTree.SourceLocation
    readonly messageId: MessageIds
  },
) {
  const { isAscending, isInsensitive, isNatural, isRequiredFirst, order } =
    getOptions(context)
  const compare = compareFn(isAscending, isInsensitive, isNatural)
  const sortFunction = (a: TSType, b: TSType) =>
    compare(getPropertyName(a), getPropertyName(b))
  const moveNode = createNodeMover(context)

  return (body: TSType[]) => {
    if (body.length < 2) {
      return
    }

    const sortedBody = getSortedBody(body, isRequiredFirst, sortFunction)
    const nodePositions = new Map<TSType, NodePositionInfo>(
      body.map((n, index) => [
        n,
        { initialIndex: index, finalIndex: sortedBody.indexOf(n) },
      ]),
    )

    for (const [node, nodePositionInfo] of nodePositions.entries()) {
      const { initialIndex, finalIndex } = nodePositionInfo
      // If the node is not in the correct position, report it
      if (initialIndex !== finalIndex) {
        const { loc, messageId } = createReportObject(node)

        // Sanity check
        assert(loc, 'createReportObject return value must include a node location')
        assert(
          messageId,
          'createReportObject return value must include a problem message',
        )

        const prevSortedNode = finalIndex - 1 > 0 ? sortedBody[finalIndex - 1] : undefined
        const nextSortedNode =
          finalIndex + 1 < sortedBody.length ? sortedBody[finalIndex + 1] : undefined

        context.report({
          loc,
          messageId,
          node: node,
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

          fix: fixer => moveNode(fixer, node, nextSortedNode, prevSortedNode),
        })
      }
    }
  }
}
