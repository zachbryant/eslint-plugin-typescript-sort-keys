import { ReportFixFunction } from '@typescript-eslint/utils/dist/ts-eslint'
import { AllRuleOptions, CreateReporterArgs, Node, SourceCode, TSType } from './types'
import { getBodyRange, getFixedBodyText } from './utils/sourcecode'

import { TSESLint } from '@typescript-eslint/utils'
import { getMemoized, memoize } from 'utils/memo'

export const getFixerFunction = (
  createReporterArgs: Pick<CreateReporterArgs<string, AllRuleOptions>, 'context'>,
  body: TSType[],
  sortedBody: TSType[],
): ReportFixFunction =>
  function* (fixer: TSESLint.RuleFixer) {
    const sourceCode = createReporterArgs.context.getSourceCode() as SourceCode
    // Was trying to figure out replacing entire body (end not right)
    const bodyRange = getBodyRange(sourceCode, body as unknown as Node[])

    const baseMemoKey = JSON.stringify({
      unsorted: body.map(node => sourceCode.getText(node)).join(''),
      sorted: sortedBody.map(node => sourceCode.getText(node)).join(''),
      context: createReporterArgs.context,
    })
    const fixedBodyTextMemoKey = `fixedBodyText_${baseMemoKey}`
    // Replace the entire body with the sorted body
    const fixedBodyText =
      getMemoized(fixedBodyTextMemoKey) ??
      memoize(
        fixedBodyTextMemoKey,
        getFixedBodyText(
          sourceCode,
          sortedBody as unknown as Node[],
          body as unknown as Node[],
        ),
      )
    yield fixer.replaceTextRange(bodyRange, fixedBodyText)
  }
