import { TSESTree } from '@typescript-eslint/experimental-utils'
import { CreateReporterArgs, NodePositionInfo, TSType } from 'common/types'
import { getPropertyIsOptional, getPropertyName } from './ast'
import { compareFn } from './compare'
import { reportParentNode, reportUnsortedBody } from './report'
import { getOptions } from 'common/options'

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

export function createReporter(createReporterArgs: CreateReporterArgs<string>) {
  const { isAscending, isInsensitive, isNatural, isRequiredFirst } = getOptions(
    createReporterArgs.context,
  )
  const compare = compareFn(isAscending, isInsensitive, isNatural)
  const sortFunction = (a: TSType, b: TSType) =>
    compare(getPropertyName(a), getPropertyName(b))

  return (bodyParent: TSESTree.Node, body: TSType[]) => {
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

    const unsortedCount = Array.from(nodePositions.entries()).reduce(
      (count, [_, info]) => {
        if (info.initialIndex !== info.finalIndex) {
          return count + 1
        }
        return count
      },
      0,
    )

    if (unsortedCount > 0) {
      reportParentNode(createReporterArgs, bodyParent, body, sortedBody, unsortedCount)
      reportUnsortedBody(createReporterArgs, nodePositions, sortedBody)
    }
  }
}
