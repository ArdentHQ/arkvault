import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignatoryService } from "./signatory.service";
import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("SignatoryService", () => {
	let signatoryService: SignatoryService;

	beforeEach(() => {
		vi.clearAllMocks();
		signatoryService = new SignatoryService();
	});

	describe("mnemonic", () => {
		it("should create a signatory from mnemonic", async () => {
			const mnemonic = MAINSAIL_MNEMONICS[0];
			const options = { bip44: { account: 0 } };

			const result = await signatoryService.mnemonic(mnemonic, options);

			expect(result).toBeDefined();
			expect(result.actsWithMnemonic()).toBe(true);
			expect(result.signingKey()).toBe(mnemonic);
		});

		it("should create a signatory from mnemonic without options", async () => {
			const mnemonic = MAINSAIL_MNEMONICS[0];

			const result = await signatoryService.mnemonic(mnemonic);

			expect(result).toBeDefined();
			expect(result.actsWithMnemonic()).toBe(true);
			expect(result.signingKey()).toBe(mnemonic);
		});
	});

	describe("confirmationMnemonic", () => {
		it("should create a confirmation mnemonic signatory", async () => {
			const signingKey = MAINSAIL_MNEMONICS[0];
			const confirmKey = MAINSAIL_MNEMONICS[1];

			const result = await signatoryService.confirmationMnemonic(signingKey, confirmKey);

			expect(result).toBeDefined();
			expect(result.actsWithConfirmationMnemonic()).toBe(true);
			expect(result.signingKey()).toBe(signingKey);
		});
	});

	describe("ledger", () => {
		it("should create a ledger signatory", async () => {
			const path = "m/44'/60'/0'/0/0";
			const options = { bip44: { account: 0 } };

			const result = await signatoryService.ledger(path, options);

			expect(result).toBeDefined();
			expect(result.actsWithLedger()).toBe(true);
			expect(result.signingKey()).toBe(path);
		});

		it("should create a ledger signatory without options", async () => {
			const path = "m/44'/60'/0'/0/0";

			const result = await signatoryService.ledger(path);

			expect(result).toBeDefined();
			expect(result.actsWithLedger()).toBe(true);
			expect(result.signingKey()).toBe(path);
		});
	});

	describe("secret", () => {
		it("should create a secret signatory", async () => {
			const secret = "mysecret";
			const options = { bip44: { account: 0 } };

			const result = await signatoryService.secret(secret, options);

			expect(result).toBeDefined();
			expect(result.actsWithSecret()).toBe(true);
			expect(result.signingKey()).toBe(secret);
		});

		it("should create a secret signatory without options", async () => {
			const secret = "mysecret";

			const result = await signatoryService.secret(secret);

			expect(result).toBeDefined();
			expect(result.actsWithSecret()).toBe(true);
			expect(result.signingKey()).toBe(secret);
		});
	});

	describe("confirmationSecret", () => {
		it("should create a confirmation secret signatory", async () => {
			const signingKey = "mysecret";
			const confirmKey = "myconfirmsecret";
			const options = { bip44: { account: 0 } };

			const result = await signatoryService.confirmationSecret(signingKey, confirmKey, options);

			expect(result).toBeDefined();
			expect(result.actsWithConfirmationSecret()).toBe(true);
			expect(result.signingKey()).toBe(signingKey);
		});

		it("should create a confirmation secret signatory without options", async () => {
			const signingKey = "mysecret";
			const confirmKey = "myconfirmsecret";

			const result = await signatoryService.confirmationSecret(signingKey, confirmKey);

			expect(result).toBeDefined();
			expect(result.actsWithConfirmationSecret()).toBe(true);
			expect(result.signingKey()).toBe(signingKey);
		});
	});

	describe("stub", () => {
		it("should create a stub signatory for testing", async () => {
			const mnemonic = MAINSAIL_MNEMONICS[0];

			const result = await signatoryService.stub(mnemonic);

			expect(result).toBeDefined();
			expect(result.actsWithMnemonic()).toBe(true);
			expect(result.signingKey()).toBe(mnemonic);
			expect(result.address()).toBe("address");
			expect(result.publicKey()).toBe("publicKey");
		});
	});
});
