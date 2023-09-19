import { ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint'
import { AllRuleOptions, CreateReporterArgs, Node, SourceCode, TSType } from './types'
import { getBodyRange, getFixedBodyText } from './utils/sourceCodeHelper'

import { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const getFixerFunction = (
  createReporterArgs: Pick<CreateReporterArgs<string, AllRuleOptions>, 'context'>,
  body: TSType[],
  bodyParent: TSESTree.Node,
  sortedBody: TSType[],
): ReportFixFunction =>
  function* (fixer: TSESLint.RuleFixer) {
    const sourceCode = createReporterArgs.context.getSourceCode() as SourceCode
    // Was trying to figure out replacing entire body (end not right)
    const bodyRange = getBodyRange(sourceCode, body as unknown as Node[])

    // Replace the entire body with the sorted body
    const fixedBodyText = getFixedBodyText(
      sourceCode,
      sortedBody as unknown as Node[],
      body as unknown as Node[],
    )
    yield fixer.replaceTextRange(bodyRange, fixedBodyText)
  }
