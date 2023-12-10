import { Rule } from 'eslint'

import { name, rule } from '../../../src/rules/string-enum'
import { PreInvalidTestCaseObject, PreValidTestCaseObject, runCases } from '../../helpers/cases'
import { typescriptConfig } from '../../helpers/configs'
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
    'enum U {a="b", }',
    'enum U {a="b", b="c"}',
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
  descending: [
    'enum U {c, b, a}',
    'enum U {c=a(), b, a}',
    'enum U {c=0, b, a}',
    'enum U {c=3, b, a}',
    'enum U {c=1<<1, b, a}',
    'enum U {c=M|N, b, a}',
    'enum U {c="123".length, b, a}',
    'enum U {c=0, b="b", a}',
    'const enum U {B=1, A=B*2}',
  ],
}

const invalid: PreInvalidTestCaseObject = {
  // /**
  //  * ascending (default case sensitive)
  //  */
  ascending: [
    {
      code: 'enum U {b="c", a="a"}',
      output: 'enum U {a="a", b="c"}',
      errors: 3,
    },
    {
      code: 'enum U {a="a", _="b", b="c"}',
      output: 'enum U {_="b", a="a", b="c"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {$="T", A="T", _="T", a="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: 3,
    },
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {$="T", A="T", _="T", a="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: 3,
    },
    /**
     * not ignore simple computed properties.
     */
    {
      code: 'enum U {a="T", b="T", ["aa"]="T", c="T"}',
      output: 'enum U {a="T", ["aa"]="T", b="T", c="T"}',
      errors: 3,
    },
  ],
  // /**
  //  * ascending, insensitive
  //  */
  ascendingInsensitive: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: 3,
    },
    {
      code: 'enum U {c="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: 3,
    },
  ],
  // /**
  //  * ascending, natural
  //  */
  ascendingNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {C="T", b_="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: 3,
    },
  ],
  // /**
  //  * ascending, natural, insensitive
  //  */
  ascendingInsensitiveNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {_="T", a="T", b="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {a="T", b="T", c="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {a="T", b="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", A="T", _="T", a="T"}',
      output: 'enum U {$="T", _="T", A="T", a="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {'#'='T', 'Z'='T', À='T', è='T'}",
      errors: 3,
    },
  ],
  // /**
  //  * descending (case sensitive)
  //  */
  descendingOnly: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", b_="T", C="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {a="T", _="T", A="T", $="T"}',
      errors: 3,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: 3,
    },
  ],
  // /**
  //  * descending, insensitive
  //  */
  descendingInsensitive: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", C="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {A="T", a="T", _="T", $="T"}',
      errors: 4,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: 3,
    },
  ],
  // /**
  //  * descending, natural
  //  */
  descendingNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", b_="T", C="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {a="T", A="T", _="T", $="T"}',
      errors: 5,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: 3,
    },
  ],
  /**
   * descending, natural, insensitive
   */
  descendingInsensitiveNatural: [
    {
      code: 'enum U {a="T", _="T", b="T"}',
      output: 'enum U {b="T", a="T", _="T"}',
      errors: 3,
    },
    {
      code: 'enum U {a="T", c="T", b="T"}',
      output: 'enum U {c="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", a="T", b="T"}',
      output: 'enum U {b_="T", b="T", a="T"}',
      errors: 3,
    },
    {
      code: 'enum U {b_="T", c="T", C="T"}',
      output: 'enum U {c="T", C="T", b_="T"}',
      errors: 3,
    },
    {
      code: 'enum U {$="T", _="T", A="T", a="T"}',
      output: 'enum U {A="T", a="T", _="T", $="T"}',
      errors: 4,
    },
    {
      code: "enum U {'#'='T', À='T', 'Z'='T', è='T'}",
      output: "enum U {è='T', À='T', 'Z'='T', '#'='T'}",
      errors: 3,
    },
  ],
}

runCases({ name, rule: rule as unknown as Rule.RuleModule, typescriptConfig }, valid, invalid, {
  category: CaseCategory.Enum,
  withRequiredFirstOption: false,
})
