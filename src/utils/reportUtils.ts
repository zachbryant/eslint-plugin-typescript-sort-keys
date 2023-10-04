import { NodePositionInfo, TSType } from 'types'

export function shouldReportUnsorted(
  sortedBody: TSType[],
  unsortedBody: TSType[],
  nodeInfo: NodePositionInfo,
) {
  const { initialIndex, finalIndex } = nodeInfo
  const isLastSorted = finalIndex === sortedBody.length - 1
  // Node moved and next sorted node isn't the same neighbor as unsorted
  return (
    initialIndex !== finalIndex &&
    (isLastSorted || sortedBody[finalIndex + 1] !== unsortedBody[initialIndex + 1])
  )
}

export function getUnsortedInfo(
  sortedBody: TSType[],
  unsortedBody: TSType[],
  nodePositions: Map<TSType, NodePositionInfo>,
) {
  const finalIndicesToReport = new Array(sortedBody.length).fill(false)
  const unsortedCount = Array.from(nodePositions.entries()).reduce(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (count, [_, info]) => {
      if (shouldReportUnsorted(sortedBody, unsortedBody, info)) {
        finalIndicesToReport[info.finalIndex] = true
        return count + 1
      }
      return count
    },
    0,
  )
  return { unsortedCount, finalIndicesToReport }
}
