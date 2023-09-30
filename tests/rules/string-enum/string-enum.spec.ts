import { Rule, RuleTester } from 'eslint'

import { name, rule } from 'rules/string-enum'
import { typescriptConfig } from '../../helpers/configs'
import {
  PreInvalidTestCaseObject,
  PreValidTestCaseObject,
  processInvalidTestCase,
  processValidTestCase,
} from '../../helpers/processCases'
import { CaseCategory } from '../../helpers/strings'

const valid: PreValidTestCaseObject = {
  /**
   * ignores
   */
  noOptions: [
    'enum U {c, b, a}',
    'enum U {c=a(), b, a}',
    'enum U {c=0, b, a}',
    'enum U {c=3, b, a}',
    'enum U {c=1<<1, b, a}',
    'enum U {c=M|N, b, a}',
    'enum U {c="123".length, b, a}',
    'enum U {c=0, b="b", a}',
    'const enum U {A=1, B=A*2}',
  ],
  /**
   * ascending (default)
   */
  ascending: [
    'enum U {_="a", a="b", b="c"}',
    'enum U {a="a", b="b", c="c"}',
    'enum U {a="a", b="b", b_="c"}',
    'enum U {C="a", b_="b", c="c"}',
    'enum U {$="a", A="b", _="c", a="d"}',
    "enum U {'#'='a', 'Z'='b', À='c', è='d'}",
    'enum U {_="T", a="T", b="T"}',
    'enum U {a="T", b="T", c="T"}',
    'enum U {a="T", b="T", b_="T"}',
    'enum U {C="T", b_="T", c="T"}',
    'enum U {$="T", A="T", _="T", a="T"}',
    "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
    /**
     * computed
     */
    '{a="T", ["aa"]="T", b="T", c="T"}',
  ],
  /**
   * ascending, natureal, case sensitive
   */
  ascendingNatural: [
    'enum U {_="T", a="T", b="T"}',
    'enum U {a="T", b="T", c="T"}',
    'enum U {a="T", b="T", b_="T"}',
    'enum U {C="T", b_="T", c="T"}',
    'enum U {$="T", _="T", A="T", a="T"}',
    "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
  ],
  /**
   * ascending, natural, insensitive
   */
  ascendingInsensitiveNatural: [
    'enum U {_="T", a="T", b="T"}',
    'enum U {a="T", b="T", c="T"}',
    'enum U {a="T", b="T", b_="T"}',
    'enum U {b_="T", C="T", c="T"}',
    'enum U {b_="T", c="T", C="T"}',
    'enum U {$="T", _="T", A="T", a="T"}',
    "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
  ],
  /**
   * descending
   */
  descendingOnly: [
    'enum U {b="T", a="T", _="T"}',
    'enum U {c="T", b="T", a="T"}',
    'enum U {b_="T", b="T", a="T"}',
    'enum U {c="T", b_="T", C="T"}',
    'enum U {a="T", _="T", A="T", $="T"}',
    "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
  ],
  /**
   * descending, insensitive
   */
  descendingInsensitive: [
    'enum U {b="T", a="T", _="T"}',
    'enum U {c="T", b="T", a="T"}',
    'enum U {b_="T", b="T", a="T"}',
    'enum U {c="T", C="T", b_="T"}',
    'enum U {C="T", c="T", b_="T"}',
    'enum U {a="T", A="T", _="T", $="T"}',
    "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
  ],
  /**
   * descending, natural
   */
  descendingNatural: [
    'enum U {b="T", a="T", _="T"}',
    'enum U {c="T", b="T", a="T"}',
    'enum U {b_="T", b="T", a="T"}',
    'enum U {c="T", b_="T", C="T"}',
    'enum U {a="T", A="T", _="T", $="T"}',
    "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
  ],
  /**
   * descending, natural, insensitive
   */
  descendingInsensitiveNatural: [
    'enum U {b="T", a="T", _="T"}',
    'enum U {c="T", b="T", a="T"}',
    'enum U {b_="T", b="T", a="T"}',
    'enum U {c="T", C="T", b_="T"}',
    'enum U {C="T", c="T", b_="T"}',
    'enum U {a="T", A="T", _="T", $="T"}',
    "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
  ],
}

const invalid: PreInvalidTestCaseObject = {
  // /**
  //  * ascending (default case sensitive)
  //  */
  ascending: [
    {
      code: 'enum U {a="a", _="b", b="c"}',
      output: 'enum U {_="b", a="a", b="c"}',
      errors: [
        ['a', 'b'],
        ['_', 'a'],
      ],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: [['c'], ['b', 'c']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: [['b_'], ['a', 'b'], ['b', 'b_']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: [['b_', 'c'], ['c'], ['C', 'b_']],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {$="T", A="T", _="T", a="T"}',
      errors: [
        ['_', 'a'],
        ['A', '_'],
      ],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: [
        ['À', 'è'],
        ['Z', 'À'],
      ],
    },
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: [
        ['a', 'b'],
        ['_', 'a'],
      ],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: [['c'], ['b', 'c']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: [['b_'], ['a', 'b'], ['b', 'b_']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: [['b_', 'c'], ['c'], ['C', 'b_']],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {$="T", A="T", _="T", a="T"}',
      errors: [
        ['_', 'a'],
        ['A', '_'],
      ],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: [
        ['À', 'è'],
        ['Z', 'À'],
      ],
    },
    /**
     * not ignore simple computed properties.
     */
    {
      code: 'enum U {a="T", b="T", ["aa"]="T", c="T"}',
      output: 'enum U {a="T", ["aa"]="T", b="T", c="T"}',
      errors: [
        ['b', 'c'],
        ['aa', 'b'],
      ],
    },
  ],
  // /**
  //  * ascending, insensitive
  //  */
  ascendingInsensitive: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: [
        ['a', 'b'],
        ['_', 'a'],
      ],
    },
    {
      code: 'enum U {c="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: [['c'], ['a', 'b'], ['b', 'c']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: [['b_'], ['a', 'b'], ['b', 'b_']],
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: [
        ['A', 'a'],
        ['_', 'A'],
      ],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: [
        ['À', 'è'],
        ['Z', 'À'],
      ],
    },
  ],
  // /**
  //  * ascending, natural
  //  */
  ascendingNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: [
        ['a', 'b'],
        ['_', 'a'],
      ],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: [['c'], ['b', 'c']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: [['b_'], ['a', 'b'], ['b', 'b_']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: [['b_', 'c'], ['c'], ['C', 'b_']],
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: [
        ['A', 'a'],
        ['_', 'A'],
      ],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: [
        ['À', 'è'],
        ['Z', 'À'],
      ],
    },
  ],
  // /**
  //  * ascending, natural, insensitive
  //  */
  ascendingInsensitiveNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: [
        ['a', 'b'],
        ['_', 'a'],
      ],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: [['c'], ['b', 'c']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: [['b_'], ['a', 'b'], ['b', 'b_']],
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: [
        ['A', 'a'],
        ['_', 'A'],
      ],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: [
        ['À', 'è'],
        ['Z', 'À'],
      ],
    },
  ],
  // /**
  //  * descending (case sensitive)
  //  */
  descendingOnly: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: [['a', '_'], ['_'], ['b', 'a']],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: [['a'], ['c', 'b'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: [['a'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", b_="T", C="T"}',
      errors: [
        ['b_', 'C'],
        ['c', 'b_'],
      ],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {a="T", _="T", A="T", $="T"}',
      errors: [['$'], ['a', '_']],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: [['#'], ['è', 'À']],
    },
  ],
  // /**
  //  * descending, insensitive
  //  */
  descendingInsensitive: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: [['a', '_'], ['_'], ['b', 'a']],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: [['a'], ['c', 'b'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: [['a'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", C="T", b_="T"}',
      errors: [['b_'], ['c', 'C'], ['C', 'b_']],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {A="T", a="T", _="T", $="T"}',
      errors: [['$'], ['_', '$'], ['A', 'a'], ['a', '_']],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: [['#'], ['è', 'À']],
    },
  ],
  // /**
  //  * descending, natural
  //  */
  descendingNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: [['a', '_'], ['_'], ['b', 'a']],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: [['a'], ['c', 'b'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: [['a'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", b_="T", C="T"}',
      errors: [
        ['b_', 'C'],
        ['c', 'b_'],
      ],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {a="T", A="T", _="T", $="T"}',
      errors: [['$'], ['_', '$'], ['A', '_'], ['a', 'A']],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: [['#'], ['è', 'À']],
    },
  ],
  /**
   * descending, natural, insensitive
   */
  descendingInsensitiveNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: [['a', '_'], ['_'], ['b', 'a']],
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: [['a'], ['c', 'b'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: [['a'], ['b', 'a']],
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", C="T", b_="T"}',
      errors: [['b_'], ['c', 'C'], ['C', 'b_']],
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {A="T", a="T", _="T", $="T"}',
      // TODO this is interesting... A is before a already
      errors: [['$'], ['_', '$'], ['A', 'a'], ['a', '_']],
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: [['#'], ['è', 'À']],
    },
  ],
}

describe('TypeScript', () => {
  const ruleTester = new RuleTester(typescriptConfig)
  //ValidTestCase<Options>[]
  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid, false),
    invalid: processInvalidTestCase(invalid, CaseCategory.StringEnum, false),
  })
})
