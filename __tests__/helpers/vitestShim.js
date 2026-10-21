// Shim para permitir imports desde 'vitest' en tests cuando se ejecutan con Jest
module.exports = {
  describe: global.describe,
  it: global.it,
  expect: global.expect,
  vi: global.vi || {
    mock: (...args) => jest.mock(...args),
    fn: (...args) => jest.fn(...args),
    spyOn: (...args) => jest.spyOn(...args),
    clearAllMocks: () => jest.clearAllMocks(),
    resetAllMocks: () => jest.resetAllMocks(),
    restoreAllMocks: () => (jest.restoreAllMocks ? jest.restoreAllMocks() : undefined),
  },
}
