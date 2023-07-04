import { AST_TOKEN_TYPES, TSESTree } from '@typescript-eslint/utils'
import assert from 'assert'
import { Node, SourceCode } from 'types'

/**
 * Returns comments before a node, but only if they belong to it. Excludes line
 * comments directly after the previous node which are on the same line as prev.
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

/**
 * Returns comments after a node, but only if they belong to it. Excludes
 * comments directly before the next node which are on the same line as next.
 */
function getCommentsAfter(sourceCode: SourceCode, node: Node) {
  const comments = sourceCode.getCommentsAfter(node)
  const nodeEndLine = node.loc.end.line

  return comments.filter(comment => {
    const commentStartLine = comment.loc.start.line
    const nextNode = sourceCode.getTokenAfter(node)
    const isNextPunctuator = nextNode?.type !== AST_TOKEN_TYPES.Punctuator
    const nextBeforeComments = nextNode ? getCommentsBefore(sourceCode, nextNode) : []

    // Comments on line after pertain to the next node
    return (
      commentStartLine === nodeEndLine &&
      !(isNextPunctuator && nextBeforeComments.includes(comment)) &&
      !(isNextPunctuator && commentStartLine > nodeEndLine)
    )
  })
}

/**
 * Returns text between the node and previous (previous may be a comment)
 */
function getTextBetweenNodeAndPrevious(sourceCode: SourceCode, node: Node) {
  const prevNode = sourceCode.getTokenBefore(node, { includeComments: true })
  if (!prevNode) return ''

  return getTextBetween(sourceCode, prevNode, node)
}

/**
 * Returns text between the node and next (next may be a comment)
 */
function getTextBetweenNodeAndNext(sourceCode: SourceCode, node: Node) {
  const nextNode = sourceCode.getTokenAfter(node, { includeComments: true })
  if (!nextNode) return ''

  return getTextBetween(sourceCode, node, nextNode)
}

/**
 * Returns the text of comment nodes, preserving whitespace (including leading
 * whitespace between comments and previous punctuator/body node)
 */
function getCommentsText(sourceCode: SourceCode, comments: TSESTree.Comment[]): string {
  return comments
    .map((comment, index) => {
      let commentText = sourceCode.getText(comment)
      const isLast = index === comments.length - 1
      if (!isLast || comments.length === 1) {
        // Conflicts with space between comments when this is added to the last comment
        const indentation = getTextBetweenNodeAndPrevious(sourceCode, comment)
        commentText = indentation + commentText
      }
      if (!isLast) {
        // Preserve whitespace between comments
        const textBetween = getTextBetween(sourceCode, comment, comments[index + 1])
        commentText += textBetween
      }
      // Don't put a line comment on the same line as anything else
      if (
        comment.type === AST_TOKEN_TYPES.Line &&
        !commentText.endsWith('\n') &&
        !getTextBetweenNodeAndNext(sourceCode, comment).includes('\n')
      ) {
        commentText += '\n'
      }
      return commentText
    })
    .join('')
}

/* Get text of comments before a node, if any, with leading whitespace */
function getCommentsTextBefore(sourceCode: SourceCode, node: Node) {
  return getCommentsText(sourceCode, getCommentsBefore(sourceCode, node))
}

/* Get text of comments after a node, if any, with leading whitespace */
function getCommentsTextAfter(sourceCode: SourceCode, node: Node) {
  return getCommentsText(sourceCode, getCommentsAfter(sourceCode, node))
}

// Returns a string containing the node's punctuation, if any
function getPunctuation(sourceCode: SourceCode, node: Node) {
  const nodeText = sourceCode.getText(node)
  return nodeText.trim().endsWith(',') ? ',' : nodeText.trim().endsWith(';') ? ';' : ''
}

/**
 * Returns the node with proper punctuation and indentation
 */
function getTextProcessed(sourceCode: SourceCode, node: Node, isLast: boolean) {
  const punctuation = getPunctuation(sourceCode, node)

  let nodeText = sourceCode.getText(node)

  // Case when the node was sorted last with punctuation
  if (isLast) {
    if (punctuation === ',' && nodeText.endsWith(punctuation)) {
      nodeText = nodeText.slice(0, -1)
    }
  } else {
    /**
     * Case when the node had no punctuation, and is in a position to need it
     * Default to comma
     */
    if (!punctuation) {
      nodeText += ','
    }
  }

  const indentation = getTextBetweenNodeAndPrevious(sourceCode, node)
  return indentation + nodeText
}

/**
 * Returns the text between two nodes, excluding comments between them.
 * Range of start/end is from the comments between the nodes, if any. If a
 * given node is a comment, the respective range is from the comment itself.
 */
function getTextBetween(sourceCode: SourceCode, startNode: Node, endNode: Node) {
  const startNodeEnd = startNode.range[1]
  const endNodeStart = endNode.range[0]

  return sourceCode.text.slice(startNodeEnd, endNodeStart)
}

/**
 * Returns the nodes for outer bracket punctuators of an interface or enum declaration.
 * Asserts that the punctuators exist due to use of non-null operator.
 */
export function getDeclarationPunctuators(sourceCode: SourceCode, body: Node[]) {
  const startNode = getEarliestNode(body)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const declarationStartPunctuator = sourceCode.getTokenBefore(startNode)!
  assert(
    !!declarationStartPunctuator,
    `Expected declaration end punctuator after ${sourceCode.getText(startNode)}`,
  )

  const endNode = getLatestNode(body)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const declarationEndPunctuator = sourceCode.getTokenAfter(endNode)!
  assert(
    !!declarationStartPunctuator,
    `Expected declaration end punctuator after ${sourceCode.getText(endNode)}`,
  )

  return { declarationStartPunctuator, declarationEndPunctuator }
}

/**
 * Returns the node with the highest range in the list
 */
function getLatestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] >= acc.range[1] ? node : acc
  }, body[0])
}

/**
 * Returns the node with the lowest range in the list
 */
function getEarliestNode(body: Node[]) {
  return body.reduce((acc, node) => {
    return node.range[1] <= acc.range[1] ? node : acc
  }, body[0])
}

/**
 * Returns the text of the last comment in the body
 */
function getLastCommentText(sourceCode: SourceCode, body: Node[]) {
  const lastBodyNode = getLatestNode(body)
  const lastBodyNodeComments = getCommentsAfter(sourceCode, lastBodyNode)
  const latestBodyNodeComment = getLatestNode([...lastBodyNodeComments, lastBodyNode])
  // Comments after the comments that belong to the last property in the body
  const lastComments = sourceCode.getCommentsAfter(latestBodyNodeComment)
  const lastCommentsText = getCommentsText(sourceCode, lastComments)

  const { declarationEndPunctuator } = getDeclarationPunctuators(sourceCode, body)
  const lastWhitespace = getTextBetween(
    sourceCode,
    getLatestNode([...lastComments, lastBodyNode]),
    declarationEndPunctuator,
  )

  const lastCommentsTextWithWhitespace = lastCommentsText + lastWhitespace

  if (lastComments.length > 0) {
    const textBeforeComment = getTextBetween(
      sourceCode,
      latestBodyNodeComment,
      getEarliestNode(lastComments),
    )

    return textBeforeComment + lastCommentsTextWithWhitespace
  }

  return lastCommentsTextWithWhitespace
}

/**
 * Returns a map from index of source code to indentation string.
 */
function getIndentationMap(sourceCode: SourceCode, body: Node[]) {
  return new Map<number, string>(
    body.map((node, nodeIndex) => {
      const prevNode = sourceCode.getTokenBefore(node, { includeComments: true })
      const indent = prevNode ? getTextBetween(sourceCode, prevNode, node) : ''

      return [nodeIndex, indent]
    }),
  )
}

/**
 * Returns the text of the entire body, rebuilt from the source code in order given.
 */
export function getFixedBodyText(
  sourceCode: SourceCode,
  bodyToEmit: Node[],
  originalBody: Node[],
) {
  const indentations = getIndentationMap(sourceCode, originalBody)
  // Capture any trailing comments + whitespace
  const lastCommentsText = getLastCommentText(sourceCode, originalBody)
  // if parts are on same line, use indent new position indent then get original whitespace between
  // if parts are on different lines, use original whitespace all the time

  return (
    bodyToEmit
      .map((node, index) => {
        const isLast = index === bodyToEmit.length - 1
        const text =
          indentations.get(index) +
          [
            getCommentsTextBefore(sourceCode, node),
            getTextProcessed(sourceCode, node, isLast),
            getCommentsTextAfter(sourceCode, node),
          ]
            .filter(Boolean)
            .join('')
            .trimStart()

        return text
      })
      .join('') + lastCommentsText
  )
}
