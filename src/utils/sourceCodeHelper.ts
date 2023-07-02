import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils'
import { Node, SourceCode } from 'types'
import { isComment } from './ast'

/**
 * Returns comments before a node, but only if they belong to it.
 * Excludes line comments directly after the previous node which are on the same line as prev.
 */
function getCommentsBefore(sourceCode: SourceCode, node: Node) {
  const prevNode = sourceCode.getTokenBefore(node)
  if (!prevNode) return []
  const comments = sourceCode.getCommentsBefore(node)

  const nodeStartLine = node.loc.start.line
  const prevNodeEndLine = prevNode.loc.end.line

  return comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const commentEndLine = comment.loc.end.line

    return (
      commentStartLine === nodeStartLine ||
      (commentStartLine > prevNodeEndLine && commentEndLine <= nodeStartLine)
    )
  })
}

function getCommentsAfter(sourceCode: SourceCode, node: Node) {
  const comments = sourceCode.getCommentsAfter(node)
  const nodeEndLine = node.loc.end.line

  return comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const nextNode = sourceCode.getTokenAfter(node)
    const isNextPunctuator = nextNode?.type !== AST_TOKEN_TYPES.Punctuator
    const nextBeforeComments = nextNode ? getCommentsBefore(sourceCode, nextNode) : []

    // Comments on another line after pertain to the next node, or belong at the end of the declaration
    return (
      commentStartLine === nodeEndLine &&
      !(isNextPunctuator && nextBeforeComments.includes(comment)) &&
      !(isNextPunctuator && commentStartLine > nodeEndLine)
    )
  })
}

function getCommentsText(
  sourceCode: SourceCode,
  comments: TSESTree.Comment[],
  nextIndentation?: string,
): string {
  return comments
    .map((comment, index) => {
      let commentText = sourceCode.getText(comment)
      if (index < comments.length - 1) {
        const textBetween = getTextBetween(sourceCode, comment, comments[index + 1])
        commentText += textBetween
      }
      if (
        comment.type === AST_TOKEN_TYPES.Line &&
        !commentText.endsWith('\n') &&
        !nextIndentation?.includes('\n')
      ) {
        commentText += '\n'
      }
      return commentText
    })
    .join('')
}

/**
 * The punctuator after the node, if any.
 */
export function getNodePunctuator(sourceCode: SourceCode, node: Node) {
  const punctuator = sourceCode.getTokenAfter(node, {
    filter: n => n.type === AST_TOKEN_TYPES.Punctuator && n.value !== ':',
    includeComments: false,
  })

  // Check the punctuator value outside of filter because we
  // want to stop traversal on any terminating punctuator
  return punctuator && /^[,;]$/.test(punctuator.value) ? punctuator : undefined
}

// Returns a string containing the node's punctuation, if any
function getPunctuation(sourceCode: SourceCode, node: Node) {
  const nodeText = sourceCode.getText(node)
  return getNodePunctuator(sourceCode, node)?.value ?? nodeText.endsWith(',')
    ? ','
    : nodeText.endsWith(';')
    ? ';'
    : ''
}

/**
 *
 */
function getTextFixedPunctuation(sourceCode: SourceCode, node: Node, isLast: boolean) {
  const punctuation = getPunctuation(sourceCode, node)

  let nodeText = sourceCode.getText(node)

  // Case when the node was sorted last with punctuation
  if (isLast && punctuation === ',') {
    if (nodeText.endsWith(punctuation)) {
      nodeText = nodeText.slice(0, -1)
    }
  } else {
    /**
     * Case when the node had no punctuation, and is in a position to need it
     * Default to comma
     */
    if (!punctuation) {
      nodeText += ', '
    }
  }
  return nodeText
}

function getTextBetween(sourceCode: SourceCode, startNode: Node, endNode: Node) {
  let startNodeEnd = startNode.range[1]
  if (!isComment(startNode)) {
    startNodeEnd = Math.max(
      startNodeEnd,
      ...getCommentsAfter(sourceCode, startNode)
        .filter(_ => _ !== endNode)
        .map(_ => _.range[1]),
    )
  }
  let endNodeStart = endNode.range[0]
  if (!isComment(endNode)) {
    endNodeStart = Math.min(
      endNodeStart,
      ...getCommentsBefore(sourceCode, endNode)
        .filter(_ => _ !== startNode)
        .map(_ => _.range[0]),
    )
  }
  return sourceCode.text.slice(startNodeEnd, endNodeStart)
}

/**
 * Returns a map from index of source code to indentation string.
 */
function getIndentationMap(sourceCode: SourceCode, body: Node[]) {
  return new Map<number, string>(
    body.map((node, index) => {
      const prevNode = sourceCode.getTokenBefore(node)
      const indent = prevNode ? getTextBetween(sourceCode, prevNode, node) : ''

      return [index, indent]
    }),
  )
}

function getLatestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] >= acc.range[1] ? node : acc
  }, body[0])
}

function getEarliestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] <= acc.range[1] ? node : acc
  }, body[0])
}

function getLastCommentText(sourceCode: SourceCode, body: Node[]) {
  const lastBodyNode = body[body.length - 1]
  const lastBodyNodeComments = getCommentsAfter(sourceCode, lastBodyNode)
  const latestBodyNodeComment = getLatestNode([...lastBodyNodeComments, lastBodyNode])
  const lastComments = sourceCode.getCommentsAfter(latestBodyNodeComment)
  return (
    getTextBetween(sourceCode, latestBodyNodeComment, getEarliestNode(lastComments)) +
    getCommentsText(sourceCode, lastComments)
  )
}

/**
 * Returns the text of the entire body, rebuilt from the source code in order given.
 */
export function getFixedBodyText(
  sourceCode: SourceCode,
  body: Node[],
  unsortedBody: Node[],
) {
  const indentations = getIndentationMap(sourceCode, unsortedBody)

  const lastCommentsText = getLastCommentText(sourceCode, unsortedBody)

  return (
    body
      .map((node, index) => {
        const isLast = index === body.length - 1
        const commentsBefore = getCommentsBefore(sourceCode, node)
        const commentsAfter = getCommentsAfter(sourceCode, node)
        const nodeLineText = getTextFixedPunctuation(sourceCode, node, isLast)

        const textBetweenCommentsAndNode =
          commentsBefore.length > 0
            ? getTextBetween(sourceCode, getLatestNode(commentsBefore), node)
            : undefined

        const textBetweenNodeAndComments =
          commentsAfter.length > 0
            ? getTextBetween(sourceCode, node, getEarliestNode(commentsAfter))
            : undefined

        return [
          indentations.get(index),
          getCommentsText(sourceCode, commentsBefore),
          textBetweenCommentsAndNode,
          nodeLineText,
          textBetweenNodeAndComments,
          getCommentsText(sourceCode, commentsAfter, indentations.get(index + 1)),
        ]
          .filter(Boolean)
          .join('')
      })
      .join('') + lastCommentsText
  )
}
