import {
	getFeeType,
	isSendTransferNextDisabled,
	parseQRCodeUrl,
	handleQRCodeReadError,
	getRecipientsFromDeeplink,
} from "./utils";
import { SendTransferStep } from "./SendTransfer.contracts";
import * as toastModule from "@/app/services";

vi.mock("@/app/services", () => ({
	toasts: {
		error: vi.fn(),
	},
}));

describe("SendTransfer utils", () => {
	it("#getFeeType", () => {
		expect(getFeeType(1)).toBe("transfer");
		expect(getFeeType(2)).toBe("multiPayment");
	});

	describe("parseQRCodeUrl", () => {
		it("should parse valid URL directly", () => {
			const result = parseQRCodeUrl(
				"http://localhost:3000/#/?coin=mainsail&method=transfer&network=mainsail.devnet&recipient=0x123&amount=10",
			);
			expect(result.get("coin")).toBe("mainsail");
			expect(result.get("method")).toBe("transfer");
			expect(result.get("recipient")).toBe("0x123");
			expect(result.get("amount")).toBe("10");
		});

		it("should handle URL without network", () => {
			const result = parseQRCodeUrl("http://localhost:3000/#/?coin=mainsail&method=transfer&recipient=0xabc");
			expect(result.get("recipient")).toBe("0xabc");
		});

		it("should throw on invalid URL", () => {
			expect(() => parseQRCodeUrl("invalid-url")).toThrow();
		});
	});

	describe("isSendTransferNextDisabled", () => {
		it("should return false for NetworkStep with live network", () => {
			const mockNetwork = { isLive: () => true } as any;
			const result = isSendTransferNextDisabled({
				activeTab: SendTransferStep.NetworkStep,
				network: mockNetwork,
				isDirty: false,
				isValid: false,
			});
			expect(result).toBe(false);
		});

		it("should return true when not dirty", () => {
			const result = isSendTransferNextDisabled({
				activeTab: SendTransferStep.FormStep,
				network: undefined,
				isDirty: false,
				isValid: true,
			});
			expect(result).toBe(true);
		});

		it("should return true when dirty and invalid", () => {
			const result = isSendTransferNextDisabled({
				activeTab: SendTransferStep.FormStep,
				network: undefined,
				isDirty: true,
				isValid: false,
			});
			expect(result).toBe(true);
		});

		it("should return false when dirty and valid", () => {
			const result = isSendTransferNextDisabled({
				activeTab: SendTransferStep.FormStep,
				network: undefined,
				isDirty: true,
				isValid: true,
			});
			expect(result).toBe(false);
		});

		it("should return true for NetworkStep without isLive function", () => {
			const result = isSendTransferNextDisabled({
				activeTab: SendTransferStep.NetworkStep,
				network: {} as any,
				isDirty: false,
				isValid: false,
			});
			expect(result).toBe(true);
		});
	});

	describe("handleQRCodeReadError", () => {
		it("should show error toast for invalid QR code", () => {
			const t = vi.fn((key: string) => key);

			handleQRCodeReadError(t);

			expect(toastModule.toasts.error).toHaveBeenCalled();
		});
	});

	describe("getRecipientsFromDeeplink", () => {
		it("should get recipients from deeplink if provided", () => {
			const result = getRecipientsFromDeeplink([], { recipient: "0x1", amount: "10" });

			expect(result[0]).toStrictEqual({ address: "0x1", amount: "10" });
		});
	});
});
