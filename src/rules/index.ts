import { RuleModule } from '@typescript-eslint/utils/ts-eslint'
import {
  RuleOptions as InterfaceRuleOptions,
  name as interfaceName,
  rule as interfaceRule,
} from './interface'
import {
  RuleOptions as StringEnumRuleOptions,
  name as stringEnumName,
  rule as stringEnumRule,
} from './string-enum'

export const rules: Record<string, RuleModule<string, unknown[]>> = {
  [interfaceName]: interfaceRule,
  [stringEnumName]: stringEnumRule,
}

export { InterfaceRuleOptions, StringEnumRuleOptions }
