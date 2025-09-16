import { getFeeType } from "./utils";

describe("SendTransfer utils", () => {
	it("#getFeeType", () => {
		expect(getFeeType(1)).toBe("transfer");
		expect(getFeeType(2)).toBe("multiPayment");
	});
});
