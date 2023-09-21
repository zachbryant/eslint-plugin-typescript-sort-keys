import { Rule, RuleTester } from 'eslint'

import { name, rule } from 'rules/interface'
import { typescriptConfig } from '../../helpers/configs'
import {
  PreInvalidTestCaseObject,
  PreValidTestCaseObject,
  processInvalidTestCase,
  processValidTestCase,
} from '../../helpers/processCases'

const valid: PreValidTestCaseObject = {
  /**
   * ascending, caseSensitive (default)
   */
  ascendingSensitive: [
    'interface U {_:T; a:T; b:T;}',
    'interface U {a:T; b:T; c:T;}',
    'interface U {a:T; b:T; b_:T;}',
    'interface U {C:T; b_:T; c:T;}',
    'interface U {$:T; A:T; _:T; a:T;}',
    "interface U {1:T; '11':T; 2:T; A:T;}",
    "interface U {'#':T; 'Z':T; À:T; è:T;}",
    /**
     * computed
     */
    'interface U {a:T; ["ab"]:T; b:T; c:T;}',
    /**
     * nested
     */
    'interface U {a:T; b:{x:T; y:T;}; c:T;}',
    'interface U {a:T; b:{x:T; y:T; z:{i:T; j:T;};}; c:T;}',
    'type U = {a:T; b:{x:T; y:T;}; c:T;}',
    'type U = {a:T; b:{x:T; y:T; z:{i:T; j:T;};}; c:T;}',
  ],

  /**
   * ascending, insensitive
   */
  ascendingInsensitive: [
    'interface U {_:T; a:T; b:T;}',

    'interface U {a:T; b:T; c:T;}',

    'interface U {a:T; b:T; b_:T;}',

    'interface U {b_:T; C:T; c:T;}',

    'interface U {b_:T; c:T; C:T;}',

    'interface U {$:T; _:T; A:T; a:T;}',
    "interface U {1:T; '11':T; 2:T; A:T;}",
  ],

  ascendingNatural: ["interface U {'#':T; 'Z':T; À:T; è:T;}"],

  /**
   * ascending, natural, insensitive
   */
  ascendingInsensitiveNatural: [
    'interface U {_:T; a:T; b:T;}',
    'interface U {a:T; b:T; c:T;}',
    'interface U {a:T; b:T; b_:T;}',
    'interface U {b_:T; C:T; c:T;}',
    'interface U {b_:T; c:T; C:T;}',
    'interface U {$:T; _:T; A:T; a:T;}',
    "interface U {1:T; 2:T; '11':T; A:T;}",
    "interface U {'#':T; 'Z':T; À:T; è:T;}",
  ],
  /**
   * ascending, natural, insensitive, required
   */
  ascendingInsensitiveNaturalRequired: [
    'interface U {_:T; b:T; a?:T;}',
    'interface U {a:T; c:T; b?:T;}',
    'interface U {b:T; b_:T; a?:T;}',
    'interface U {C:T; c:T; b_?:T;}',
    'interface U {c:T; C:T; b_?:T;}',
    'interface U {$:T; _:T; A?:T; a?:T;}',
    "interface U {1:T; '11':T; A:T; 2?:T;}",
    "interface U {'Z':T; À:T; è:T; '#'?:T;}",
  ],
  /**
   * ascending, required
   */
  ascendingRequired: [
    'interface U {_:T; b:T; a?:T;}',
    'interface U {a:T; c:T; b?:T;}',
    'interface U {b:T; b_:T; a?:T;}',
    'interface U {C:T; c:T; b_?:T;}',
    'interface U {1:T; 11:T; 9:T; 111?:T;}',
    'interface U {$:T; _:T; A?:T; a?:T;}',
    "interface U {10:T; '11':T; 1?:T; 12?:T; 2?:T;}",
    "interface U {'Z':T; À:T; è:T; '#'?:T;}",
  ],
  /**
   * ascending, natural, insensitive, not-required
   */
  ascendingInsensitiveNaturalNotRequired: [
    'interface U {_:T; a?:T; b:T;}',
    'interface U {a:T; b?:T; c:T;}',
    'interface U {a?:T; b:T; b_:T;}',
    'interface U {b_?:T; C:T; c:T;}',
    'interface U {b_?:T; c:T; C:T;}',
    'interface U {$:T; _:T; A?:T; a?:T;}',
    "interface U {1:T;  2?:T; '11':T; A:T;}",
    "interface U {'#'?:T; 'Z':T; À:T; è:T;}",
  ],
  /**
   * descending
   */
  descending: [
    'interface U {b:T; a:T; _:T;}',
    'interface U {c:T; b:T; a:T;}',
    'interface U {b_:T; b:T; a:T;}',
    'interface U {c:T; b_:T; C:T;}',
    'interface U {a:T; _:T; A:T; $:T;}',
    "interface U {A:T; 2:T; '11':T; 1:T;}",
    "interface U {è:T; À:T; 'Z':T; '#':T;}",
  ],
  /**
   * descending, insensitive, non-natural
   */
  descendingInsensitiveNonNatural: [
    'interface U {b:T; a:T; _:T;}',
    'interface U {c:T; b:T; a:T;}',
    'interface U {b_:T; b:T; a:T;}',
    'interface U {c:T; C:T; b_:T;}',
    'interface U {C:T; c:T; b_:T;}',
    'interface U {a:T; A:T; _:T; $:T;}',
    "interface U {A:T; 2:T; '11':T; 1:T;}",
    "interface U {è:T; À:T; 'Z':T; '#':T;}",
  ],
  /**
   * descending, case-sensitive, natural
   */
  descendingSensitiveNatural: [
    'interface U {b:T; a:T; _:T;}',
    'interface U {c:T; b:T; a:T;}',
    'interface U {b_:T; b:T; a:T;}',
    'interface U {c:T; b_:T; C:T;}',
    'interface U {a:T; A:T; _:T; $:T;}',
    "interface U {A:T; '11':T; 2:T; 1:T;}",
    "interface U {è:T; À:T; 'Z':T; '#':T;}",
  ],
  /**
   * descending, natural, insensitive
   */
  descendingInsensitiveNatural: [
    'interface U {b:T; a:T; _:T;}',
    'interface U {c:T; b:T; a:T;}',
    'interface U {b_:T; b:T; a:T;}',
    'interface U {c:T; C:T; b_:T;}',
    'interface U {C:T; c:T; b_:T;}',
    'interface U {a:T; A:T; _:T; $:T;}',
    "interface U {A:T; '11':T; 2:T; 1:T;}",
    "interface U {è:T; À:T; 'Z':T; '#':T;}",
  ],
  /**
   * descending, natural, insensitive, required
   */
  descendingInsensitiveNaturalRequired: [
    'interface U {b:T; _:T; a?:T;}',
    'interface U {c:T; a:T; b?:T;}',
    'interface U {b_:T; b:T; a?:T;}',
    'interface U {c:T; C:T; b_?:T;}',
    'interface U {C:T; c:T; b_?:T;}',
    'interface U {_:T; $:T; a?:T; A?:T;}',
    "interface U { A:T; '11':T; 1:T; 2?:T;}",
    "interface U {è:T; 'Z':T; À?:T; '#'?:T;}",
  ],
  /**
   * descending, required
   */
  descendingRequired: [
    'interface U {b:T; _:T; a?:T;}',
    'interface U {c:T; a:T; b?:T;}',
    'interface U {b_:T; b:T; a?:T;}',
    'interface U {c:T; C:T; b_?:T;}',
    'interface U {9:T; 11:T; 1:T; 111?:T;}',
    'interface U {_:T; $:T; a?:T; A?:T;}',
    "interface U {'11':T; 10:T; 2?:T; 12?:T; 1?:T;}",
    "interface U {è:T; À:T; 'Z':T; '#'?:T;}",
  ],
  /**
   * descending, natural, insensitive, not-required
   */
  descendingInsensitiveNaturalNotRequired: [
    'interface U {b:T; a?:T; _:T;}',
    'interface U {c:T; b?:T; a:T;}',
    'interface U {b_:T; b:T; a?:T;}',
    'interface U {c:T; C:T; b_?:T;}',
    'interface U {C:T; c:T; b_?:T;}',
    'interface U {a?:T; A?:T; _:T; $:T;}',
    "interface U {A:T; '11':T; 2?:T; 1:T;}",
    "interface U {è:T; À:T; 'Z':T; '#'?:T;}",
  ],
  /**
   * index signatures
   */
  ascendingOnly: [
    `interface U<T> { [nkey: number]: T; [skey: string]: T; $: T; A: T; _: T; a: T; }`,
    `interface U<T> { a: T; _: T; A: T; $: T; [skey: string]: T; [nkey: number]: T; }`,
  ],
}

const invalid: PreInvalidTestCaseObject = {
  /**
   * ascending sensitive (default)
   */
  ascendingSensitive: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {_:T; a:T; b:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {a:T; b:T; c:T;}',
      errors: [['b', 'c']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {a:T; b_:T; b:T;}',
      errors: [['a', 'b_']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {C:T; c:T; b_:T;}',
      errors: [['C', 'c']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {$:T; A:T; _:T; a:T;}',
      errors: [['A', '_']],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {1:T; '11':T; A:T; 2:T;}",
      errors: [['11', 'A']],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {'#':T; 'Z':T; À:T; è:T;}",
      errors: [['Z', 'À']],
    },
    /**
     * methods
     */
    {
      code: "interface U {1:T; 2:T; A():T; '11':T;}",
      output: "interface U {1:T; '11':T; A():T; 2:T;}",
      errors: [['11', 'A']],
    },
    {
      code: "interface U {'#'():T; À():T; 'Z':T; è:T;}",
      output: "interface U {'#'():T; 'Z':T; À():T; è:T;}",
      errors: [['Z', 'À']],
    },
    /**
     * not ignore simple computed properties.
     */
    {
      code: 'interface U {a:T; b:T; ["a"]:T; c:T;}',
      output: 'interface U {a:T; ["a"]:T; b:T; c:T;}',
      errors: [['a', 'b']],
    },
    /**
     * nested
     */
    {
      code: 'interface U {a:T; c:{y:T; x:T;}, b:T;}',
      output: 'interface U {a:T; b:T; c:{y:T; x:T;}}',
      errors: [
        ['x', 'y'],
        ['b', 'c'],
      ],
    },
    {
      code: 'type U = {a:T; c:{y:T; x:T;}, b:T;}',
      output: 'type U = {a:T; b:T; c:{y:T; x:T;}}',
      errors: [
        ['x', 'y'],
        ['b', 'c'],
      ],
    },
    /**
     * asc
     */
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {_:T; a:T; b:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {a:T; b:T; c:T;}',
      errors: [['b', 'c']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {a:T; b_:T; b:T;}',
      errors: [['a', 'b_']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {C:T; c:T; b_:T;}',
      errors: [['C', 'c']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {$:T; A:T; _:T; a:T;}',
      errors: [['A', '_']],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {1:T; '11':T; A:T; 2:T;}",
      errors: [['11', 'A']],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {'#':T; 'Z':T; À:T; è:T;}",
      errors: [['Z', 'À']],
    },
  ],

  /**
   * ascending, insensitive
   */
  ascendingInsensitive: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {_:T; a:T; b:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {a:T; b:T; c:T;}',
      errors: [['b', 'c']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {a:T; b_:T; b:T;}',
      errors: [['a', 'b_']],
    },
    {
      code: 'interface U {$:T; A:T; _:T; a:T;}',
      output: 'interface U {$:T; _:T; A:T; a:T;}',
      errors: [['_', 'A']],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {1:T; '11':T; A:T; 2:T;}",
      errors: [['11', 'A']],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {'#':T; 'Z':T; À:T; è:T;}",
      errors: [['Z', 'À']],
    },
  ],

  /**
   * ascending, natural
   */
  ascendingNatural: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {_:T; a:T; b:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {a:T; b:T; c:T;}',
      errors: [['b', 'c']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {a:T; b_:T; b:T;}',
      errors: [['a', 'b_']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {C:T; c:T; b_:T;}',
      errors: [['C', 'c']],
    },
    {
      code: 'interface U {$:T; A:T; _:T; a:T;}',
      output: 'interface U {$:T; _:T; A:T; a:T;}',
      errors: [['_', 'A']],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {1:T; 2:T; '11':T; A:T;}",
      errors: [['11', 'A']],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {'#':T; 'Z':T; À:T; è:T;}",
      errors: [['Z', 'À']],
    },
  ],

  /**
   * ascending, natural, insensitive
   */
  ascendingInsensitiveNatural: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {_:T; a:T; b:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {a:T; b:T; c:T;}',
      errors: [['b', 'c']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {a:T; b_:T; b:T;}',
      errors: [['a', 'b_']],
    },
    {
      code: 'interface U {$:T; A:T; _:T; a:T;}',
      output: 'interface U {$:T; _:T; A:T; a:T;}',
      errors: [['_', 'A']],
    },
    {
      code: "interface U {1:T; '11':T; 2:T; A:T;}",
      output: "interface U {1:T; 2:T; '11':T; A:T;}",
      errors: [['2', '11']],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {'#':T; 'Z':T; À:T; è:T;}",
      errors: [['Z', 'À']],
    },
  ],

  /**
   * ascending, natural, insensitive, required
   */
  ascendingInsensitiveNaturalRequired: [
    {
      code: 'interface U {_:T; a?:T; b:T;}',
      output: 'interface U {_:T; b:T; a?:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {a:T; b?:T; c:T;}',
      output: 'interface U {a:T; c:T; b?:T;}',
      errors: [['c', 'b']],
    },
    {
      code: 'interface U {b:T; a?:T; b_:T;}',
      output: 'interface U {b:T; b_:T; a?:T;}',
      errors: [['b_', 'a']],
    },
    {
      code: 'interface U {C:T; b_?:T; c:T;}',
      output: 'interface U {C:T; c:T; b_?:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {C:T; b_?:T; c:T;}',
      output: 'interface U {C:T; c:T; b_?:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {$:T; A?:T; _:T; a?:T;}',
      output: 'interface U {$:T; _:T; A?:T; a?:T;}',
      errors: [['_', 'A']],
    },
    {
      code: "interface U {1:T; '11':T; 2?:T; A:T;}",
      output: "interface U {1:T; '11':T; A:T; 2?:T;}",
      errors: [['A', '2']],
    },
    {
      code: "interface U {'Z':T; À:T; '#'?:T; è:T;}",
      output: "interface U {'Z':T; À:T; è:T; '#'?:T;}",
      errors: [['è', '#']],
    },
  ],

  /**
   * ascending, natural, insensitive, not-required
   */
  ascendingInsensitiveNaturalNotRequired: [
    {
      code: 'interface U {_:T; b:T; a?:T;}',
      output: 'interface U {_:T; a?:T; b:T;}',
      errors: [['a', 'b']],
    },
    {
      code: 'interface U {b?:T; a:T; c:T;}',
      output: 'interface U {a:T; b?:T; c:T;}',
      errors: [['a', 'b']],
    },
    {
      code: 'interface U {b:T; a?:T; b_:T;}',
      output: 'interface U {a?:T; b:T; b_:T;}',
      errors: [['a', 'b']],
    },
    {
      code: 'interface U {C:T; c:T; b_?:T;}',
      output: 'interface U {b_?:T; c:T; C:T;}',
      errors: [['b_', 'c']],
    },
    {
      code: 'interface U {C:T; b_?:T; c:T;}',
      output: 'interface U {b_?:T; C:T; c:T;}',
      errors: [['b_', 'C']],
    },
    {
      code: 'interface U {$:T; A?:T; _:T; a?:T;}',
      output: 'interface U {$:T; _:T; A?:T; a?:T;}',
      errors: [['_', 'A']],
    },
    {
      code: "interface U {1:T; '11':T; 2?:T; A:T;}",
      output: "interface U {1:T; 2?:T; '11':T; A:T;}",
      errors: [['2', '11']],
    },
    {
      code: "interface U {'Z':T; À:T; '#'?:T; è:T;}",
      output: "interface U {'#'?:T; À:T; 'Z':T; è:T;}",
      errors: [['#', 'À']],
    },
  ],

  /**
   * descending
   */
  descendingOnly: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {b:T; _:T; a:T;}',
      errors: [['b', '_']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {c:T; a:T; b:T;}',
      errors: [['c', 'a']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {b_:T; b:T; a:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {c:T; b_:T; C:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {a:T; _:T; A:T; $:T;}',
      errors: [
        ['_', '$'],
        ['a', 'A'],
      ],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {A:T; 2:T; 1:T; '11':T;}",
      errors: [
        ['2', '1'],
        ['A', '2'],
      ],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {è:T; À:T; 'Z':T; '#':T;}",
      errors: [
        ['À', '#'],
        ['è', 'Z'],
      ],
    },
    {
      code: 'interface U<T> { _: T; [skey: string]: T; A: T; }',
      output: 'interface U<T> { _: T; A: T; [skey: string]: T; }',
      errors: [['A', '[index: skey]']],
    },
  ],

  /**
   * descending, insensitive
   */
  descendingInsensitive: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {b:T; _:T; a:T;}',
      errors: [['b', '_']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {c:T; a:T; b:T;}',
      errors: [['c', 'a']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {b_:T; b:T; a:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {c:T; b_:T; C:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {A:T; _:T; $:T; a:T;}',
      errors: [
        ['_', '$'],
        ['A', '_'],
      ],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {A:T; 2:T; 1:T; '11':T;}",
      errors: [
        ['2', '1'],
        ['A', '2'],
      ],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {è:T; À:T; 'Z':T; '#':T;}",
      errors: [
        ['À', '#'],
        ['è', 'Z'],
      ],
    },
  ],

  /**
   * descending, natural
   */
  descendingNatural: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {b:T; _:T; a:T;}',
      errors: [['b', '_']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {c:T; a:T; b:T;}',
      errors: [['c', 'a']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {b_:T; b:T; a:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {c:T; b_:T; C:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {a:T; _:T; A:T; $:T;}',
      errors: [
        ['_', '$'],
        ['A', '_'],
        ['a', 'A'],
      ],
    },
    {
      code: "interface U {1:T; 2:T; A:T; '11':T;}",
      output: "interface U {A:T; 2:T; 1:T; '11':T;}",
      errors: [
        ['2', '1'],
        ['A', '2'],
      ],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {è:T; À:T; 'Z':T; '#':T;}",
      errors: [
        ['À', '#'],
        ['è', 'Z'],
      ],
    },
  ],

  /**
   * descending, natural, insensitive
   */
  descendingInsensitiveNatural: [
    {
      code: 'interface U {a:T; _:T; b:T;}',
      output: 'interface U {b:T; _:T; a:T;}',
      errors: [['b', '_']],
    },
    {
      code: 'interface U {a:T; c:T; b:T;}',
      output: 'interface U {c:T; a:T; b:T;}',
      errors: [['c', 'a']],
    },
    {
      code: 'interface U {b_:T; a:T; b:T;}',
      output: 'interface U {b_:T; b:T; a:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b_:T; c:T; C:T;}',
      output: 'interface U {c:T; b_:T; C:T;}',
      errors: [['c', 'b_']],
    },
    {
      code: 'interface U {$:T; _:T; A:T; a:T;}',
      output: 'interface U {A:T; _:T; $:T; a:T;}',
      errors: [
        ['_', '$'],
        ['A', '_'],
      ],
    },
    {
      code: "interface U {1:T; 2:T; '11':T; A:T;}",
      output: "interface U {A:T; 2:T; '11':T; 1:T;}",
      errors: [
        ['2', '1'],
        ['11', '2'],
        ['A', '11'],
      ],
    },
    {
      code: "interface U {'#':T; À:T; 'Z':T; è:T;}",
      output: "interface U {è:T; À:T; 'Z':T; '#':T;}",
      errors: [
        ['À', '#'],
        ['è', 'Z'],
      ],
    },
  ],

  /**
   * descending, natural, insensitive, required
   */
  descendingInsensitiveNaturalRequired: [
    {
      code: 'interface U {_:T; a?:T; b:T;}',
      output: 'interface U {b:T; a?:T; _:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b:T; a?:T; _:T;}',
      output: 'interface U {b:T; _:T; a?:T;}',
      errors: [['_', 'a']],
    },
    {
      code: 'interface U {b:T; b_:T; a?:T;}',
      output: 'interface U {b_:T; b:T; a?:T;}',
      errors: [['b_', 'b']],
    },
    {
      code: 'interface U {c:T; b_?:T; C:T;}',
      output: 'interface U {c:T; C:T; b_?:T;}',
      errors: [['C', 'b_']],
    },
    {
      code: 'interface U {b_?:T; C:T; c:T;}',
      output: 'interface U {C:T; b_?:T; c:T;}',
      errors: [['C', 'b_']],
    },
    {
      code: 'interface U {_:T; a?:T; $:T; A?:T;}',
      output: 'interface U {_:T; $:T; a?:T; A?:T;}',
      errors: [['$', 'a']],
    },
    {
      code: "interface U {2?:T; A:T; 1:T; '11':T;}",
      output: "interface U {A:T; 2?:T; 1:T; '11':T;}",
      errors: [
        ['A', '2'],
        ['11', '1'],
      ],
    },
    {
      code: "interface U {è:T; 'Z':T; '#'?:T; À?:T;}",
      output: "interface U {è:T; 'Z':T; À?:T; '#'?:T;}",
      errors: [['À', '#']],
    },
    {
      code: "interface U {À?:T; 'Z':T; '#'?:T; è:T;}",
      output: "interface U {è:T; 'Z':T; '#'?:T; À?:T;}",
      errors: [
        ['Z', 'À'],
        ['è', '#'],
      ],
    },
  ],

  /**
   * descending, natural, insensitive, not-required
   */
  descendingInsensitiveNaturalNotRequired: [
    {
      code: 'interface U {_:T; a?:T; b:T;}',
      output: 'interface U {b:T; a?:T; _:T;}',
      errors: [
        ['a', '_'],
        ['b', 'a'],
      ],
    },
    {
      code: 'interface U {a?:T; b:T; _:T;}',
      output: 'interface U {b:T; a?:T; _:T;}',
      errors: [['b', 'a']],
    },
    {
      code: 'interface U {b:T; b_:T; a?:T;}',
      output: 'interface U {b_:T; b:T; a?:T;}',
      errors: [['b_', 'b']],
    },
    {
      code: 'interface U {c:T; b_?:T; C:T;}',
      output: 'interface U {c:T; C:T; b_?:T;}',
      errors: [['C', 'b_']],
    },
    {
      code: 'interface U {b_?:T; C:T; c:T;}',
      output: 'interface U {C:T; b_?:T; c:T;}',
      errors: [['C', 'b_']],
    },
    {
      code: 'interface U {_:T; a?:T; $:T; A?:T;}',
      output: 'interface U {a?:T; _:T; $:T; A?:T;}',
      errors: [
        ['a', '_'],
        ['A', '$'],
      ],
    },
    {
      code: "interface U {2?:T; A:T; 1:T; '11':T;}",
      output: "interface U {A:T; 2?:T; 1:T; '11':T;}",
      errors: [
        ['A', '2'],
        ['11', '1'],
      ],
    },
    {
      code: "interface U {è:T; 'Z':T; '#'?:T; À?:T;}",
      output: "interface U {è:T; À?:T; '#'?:T; 'Z':T;}",
      errors: [['À', '#']],
    },
    {
      code: "interface U {À?:T; 'Z':T; '#'?:T; è:T;}",
      output: "interface U {è:T; 'Z':T; '#'?:T; À?:T;}",
      errors: [['è', '#']],
    },
  ],

  /**
   * index signatures
   */
  ascendingOnly: [
    {
      code: 'interface U<T> { A: T; [skey: string]: T; _: T; }',
      output: 'interface U<T> { [skey: string]: T; A: T; _: T; }',
      errors: [['[index: skey]', 'A']],
    },
  ],
}

describe('TypeScript', () => {
  const ruleTester = new RuleTester(typescriptConfig)

  ruleTester.run(name, rule as unknown as Rule.RuleModule, {
    valid: processValidTestCase(valid, true),
    invalid: processInvalidTestCase(invalid, true),
  })
})