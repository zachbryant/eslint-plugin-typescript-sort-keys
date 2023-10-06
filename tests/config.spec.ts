import { readdirSync } from 'fs'

import { RuleModule } from '@typescript-eslint/utils/ts-eslint'
import plugin from '../src'
import { entriesToObject } from './helpers/configs'

describe('recommended config', () => {
  const RULE_NAME_PREFIX = 'typescript-sort-keys/'
  const {
    rules,
    configs: {
      recommended: { rules: configRules },
    },
  } = plugin

  it('contains all recommended rules', () => {
    const ruleConfigs: Array<[string, string]> = (
      Object.entries(rules).filter(
        ([, rule]) => rule.meta.docs?.recommended !== 'recommended',
      ) as Array<[string, RuleModule<string, unknown[]>]>
    ).map(([name, rule]) => [
      `${RULE_NAME_PREFIX}${name}`,
      rule.meta.docs?.recommended ? 'error' : 'off',
    ])
    expect(entriesToObject(ruleConfigs)).toEqual(configRules)
  })
})

describe('recommended plugin', () => {
  const ruleFiles: readonly string[] = readdirSync('./src/rules').filter(
    file => file !== 'index.ts' && file.endsWith('.ts'),
  )

  it('should have all the rules', () => {
    expect(plugin).toHaveProperty('rules')
    expect(Object.keys(plugin.rules)).toHaveLength(ruleFiles.length)
  })

  it('should have the recommended config', () => {
    expect(plugin).toHaveProperty('configs')
    expect(Object.keys(plugin.configs)).toHaveLength(1)
  })
})
