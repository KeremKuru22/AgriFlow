const {
  calculateYieldPerHectare,
  getYieldStatus,
} = require("../src/services/yieldService");

describe("Yield Service Tests", () => {
  test("should calculate yield per hectare correctly", () => {
    const result = calculateYieldPerHectare(48000, 12.5);
    expect(result).toBe(3840);
  });

  test("should return Low Yield when yield is below 2000", () => {
    const result = getYieldStatus(1500);
    expect(result).toBe("Low Yield");
  });

  test("should return Normal Yield when yield is between 2000 and 3999", () => {
    const result = getYieldStatus(3000);
    expect(result).toBe("Normal Yield");
  });

  test("should return High Yield when yield is 4000 or above", () => {
    const result = getYieldStatus(4500);
    expect(result).toBe("High Yield");
  });

  test("should throw error when total harvest amount is zero or negative", () => {
    expect(() => calculateYieldPerHectare(0, 10)).toThrow(
      "Total harvest amount must be greater than zero."
    );
  });

  test("should throw error when field area is zero or negative", () => {
    expect(() => calculateYieldPerHectare(10000, 0)).toThrow(
      "Field area must be greater than zero."
    );
  });
});