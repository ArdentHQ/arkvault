import { useStepMath } from "@/domains/transaction/components/InputFee/InputFee.helpers";
import { useConfirmationTimes } from "@/domains/transaction/components/InputFee/use-confirmation-times";

describe("InputFee.helpers", () => {
	describe("useConfirmationTimes", () => {
		it("should use default block time when not provided", () => {
			const { byFeeType } = useConfirmationTimes({});

			expect(byFeeType("Average")).toBe(8);
			expect(byFeeType("Fast")).toBe(8);
			expect(byFeeType("Slow")).toBe(16);
		});

		it("should use provided block time", () => {
			const { byFeeType } = useConfirmationTimes({ blockTime: 2000 });

			expect(byFeeType("Average")).toBe(2);
			expect(byFeeType("Fast")).toBe(2);
			expect(byFeeType("Slow")).toBe(4);
		});

		it("should return average confirmation time for unknown fee type", () => {
			const { byFeeType } = useConfirmationTimes({ blockTime: 4000 });

			expect(byFeeType("Unknown")).toBe(4);
		});
	});

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
