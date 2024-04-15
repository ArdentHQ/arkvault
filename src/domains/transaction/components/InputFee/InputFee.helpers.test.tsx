import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";

describe("InputFee.helpers", () => {
	describe("useStepMath", () => {
		it("should correctly add step to value", () => {
			const { increment } = useStepMath(0.01, 0.05);

			const notExpectedValue = 0.05 + 0.01; // returns 0.060000000000000005

			expect(increment()).not.toBe(notExpectedValue);
			expect(increment()).toBe("0.06");
		});

		it("should correctly subtract step to value", () => {
			const { decrement } = useStepMath(0.02, 0.05);

			const notExpectedValue = 0.05 - 0.02; // returns 0.030000000000000002

			expect(decrement()).not.toBe(notExpectedValue);
			expect(decrement()).toBe("0.03");
		});

		it("should handle a small result when decrementing", () => {
			const { decrement } = useStepMath(0.01, 0.010_000_01);

			expect(decrement()).toBe("0.00000001");
		});

		it("should handle a small result when incrementing", () => {
			const { increment } = useStepMath(0.01, -0.010_000_01);

			expect(increment()).toBe("-0.00000001");
		});
	});
});
