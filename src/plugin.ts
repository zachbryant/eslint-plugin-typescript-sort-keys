import { TSESTree } from '@typescript-eslint/utils'
import { getOptions } from 'common/options'
import { getFixerFunction } from 'fixer'
import { memoize } from 'utils/memo'
import { reportBodyNodes, reportParentNode } from './report'
import { AllRuleOptions, CreateReporterArgs, NodePositionInfo, TSType } from './types'
import { getPropertyIsOptional, getPropertyName } from './utils/ast'
import { compareFn } from './utils/compare'

/**
 * Returns the body sorted according to the options and sorting function.
 */
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

export function createReporter(
  createReporterArgs: CreateReporterArgs<string, AllRuleOptions>,
) {
  const { isAscending, isInsensitive, isNatural, isRequiredFirst } = getOptions(
    createReporterArgs.context,
  )
  const compare = compareFn(isAscending, isInsensitive, isNatural)
  const sortFunction = (a: TSType, b: TSType) =>
    compare(getPropertyName(a), getPropertyName(b))

  // Reporter function
  return (bodyParent: TSESTree.Node, body: TSType[]) => {
    if (body.length < 2) {
      return
    }

    const baseMemoKey = JSON.stringify({
      unsortedCount: body
        .map(node => createReporterArgs.context.getSourceCode().getText(node))
        .join(''),
      context: createReporterArgs.context,
    })

    const sortedBody: TSType[] = memoize(
      `sortedBody_${baseMemoKey}`,
      getSortedBody(body, isRequiredFirst, sortFunction),
    )
    const nodePositions: Map<TSType, NodePositionInfo> = memoize(
      `nodePositions_${baseMemoKey}`,
      new Map<TSType, NodePositionInfo>(
        body.map((n, index) => [
          n,
          { initialIndex: index, finalIndex: sortedBody.indexOf(n) },
        ]),
      ),
    )

    const unsortedCount = Array.from(nodePositions.entries()).reduce(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (count, [_, info]) => {
        if (info.initialIndex !== info.finalIndex) {
          return count + 1
        }
        return count
      },
      0,
    )

    if (unsortedCount > 0) {
      const fixerFunction = memoize(
        `fixerFunction_${baseMemoKey}`,
        getFixerFunction(createReporterArgs, body, sortedBody),
      )
      reportParentNode(createReporterArgs, bodyParent, unsortedCount, fixerFunction)
      reportBodyNodes(createReporterArgs, nodePositions, sortedBody, fixerFunction)
    }
  }
}
