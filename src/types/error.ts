export enum ErrorMessage {
  ParentInvalidOrder = `Found {{ unsortedCount }} keys out of order.`,
  InterfaceInvalidOrder = `Expected interface keys to be in {{ requiredFirst }}{{ natural }}{{ insensitive }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}.`,
  StringEnumInvalidOrder = `Expected string enum members to be in {{ natural }}{{ insensitive }}{{ order }}ending order. '{{ nodeName }}' should be {{ messageShouldBeWhere }}.`,
}
