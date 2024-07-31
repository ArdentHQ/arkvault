import { renderHook } from "@testing-library/react";

import { useRandomNumber } from "./use-random-number";

describe("useRandomNumber", () => {
  it("should throw if minimum is not an integer", () => {
	try {
		renderHook(() => useRandomNumber("no integer", 42));
	} catch (error) {
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(TypeError);
		expect(error.message).toContain("Arguments must be integers");
	}
  });

  it("should throw if maximum is not an integer", () => {
	try {
		renderHook(() => useRandomNumber(42, "no integer"));
	} catch (error) {
		expect(error).toBeDefined();
		expect(error).toBeInstanceOf(TypeError);
		expect(error.message).toContain("Arguments must be integers");
	}
  });

  it("should return an integer in the given range", () => {
    const { result } = renderHook(() => useRandomNumber(1, 10));

    expect(Number.isInteger(result.current)).toBe(true);
    expect(result.current).toBeGreaterThanOrEqual(1);
    expect(result.current).toBeLessThanOrEqual(10);
  });
});