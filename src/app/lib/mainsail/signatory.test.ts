/* eslint-disable sonarjs/no-duplicate-string */
import { describe, it, expect } from "vitest";
import { Signatory } from "./signatory";
import { MnemonicSignatory } from "./mnemonic.signatory";
import { SecretSignatory } from "./secret.signatory";
import { LedgerSignatory } from "./ledger.signatory";
import { ConfirmationMnemonicSignatory } from "./confirmation-mnemonic.signatory";
import { ConfirmationSecretSignatory } from "./confirmation-secret.signatory";
import { ForbiddenMethodCallException } from "./exceptions";
import { MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("Signatory", () => {
	describe("constructor", () => {
		it("should create instance with mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory).toBeInstanceOf(Signatory);
		});
	});

	describe("signingKey", () => {
		it("should return signing key from mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.signingKey()).toBe(MAINSAIL_MNEMONICS[0]);
		});

		it("should return signing key from secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.signingKey()).toBe("mysecret");
		});
	});

	describe("confirmKey", () => {
		it("should return confirm key from confirmation mnemonic signatory", () => {
			const confirmationMnemonicSignatory = new ConfirmationMnemonicSignatory({
				address: "0x123",
				confirmKey: MAINSAIL_MNEMONICS[1],
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(confirmationMnemonicSignatory);

			expect(signatory.confirmKey()).toBe(MAINSAIL_MNEMONICS[1]);
		});

		it("should return confirm key from confirmation secret signatory", () => {
			const confirmationSecretSignatory = new ConfirmationSecretSignatory({
				address: "0x123",
				confirmKey: "myconfirmsecret",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(confirmationSecretSignatory);

			expect(signatory.confirmKey()).toBe("myconfirmsecret");
		});

		it("should throw ForbiddenMethodCallException for mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(() => signatory.confirmKey()).toThrow(ForbiddenMethodCallException);
		});

		it("should throw ForbiddenMethodCallException for secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(() => signatory.confirmKey()).toThrow(ForbiddenMethodCallException);
		});

		it("should throw ForbiddenMethodCallException for ledger signatory", () => {
			const ledgerSignatory = new LedgerSignatory({
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(() => signatory.confirmKey()).toThrow(ForbiddenMethodCallException);
		});
	});

	describe("address", () => {
		it("should return address from mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.address()).toBe("0x123");
		});

		it("should return address from secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x456",
				publicKey: "pubkey456",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.address()).toBe("0x456");
		});

		it("should return address from confirmation mnemonic signatory", () => {
			const confirmationMnemonicSignatory = new ConfirmationMnemonicSignatory({
				address: "0x789",
				confirmKey: MAINSAIL_MNEMONICS[1],
				publicKey: "pubkey789",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(confirmationMnemonicSignatory);

			expect(signatory.address()).toBe("0x789");
		});

		it("should return address from confirmation secret signatory", () => {
			const confirmationSecretSignatory = new ConfirmationSecretSignatory({
				address: "0xabc",
				confirmKey: "myconfirmsecret",
				publicKey: "pubkeyabc",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(confirmationSecretSignatory);

			expect(signatory.address()).toBe("0xabc");
		});

		it("should throw ForbiddenMethodCallException for ledger signatory", () => {
			const ledgerSignatory = new LedgerSignatory({
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(() => signatory.address()).toThrow(ForbiddenMethodCallException);
		});
	});

	describe("publicKey", () => {
		it("should return public key from mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.publicKey()).toBe("pubkey123");
		});

		it("should return public key from secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x456",
				publicKey: "pubkey456",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.publicKey()).toBe("pubkey456");
		});

		it("should return public key from confirmation mnemonic signatory", () => {
			const confirmationMnemonicSignatory = new ConfirmationMnemonicSignatory({
				address: "0x789",
				confirmKey: MAINSAIL_MNEMONICS[1],
				publicKey: "pubkey789",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(confirmationMnemonicSignatory);

			expect(signatory.publicKey()).toBe("pubkey789");
		});

		it("should return public key from confirmation secret signatory", () => {
			const confirmationSecretSignatory = new ConfirmationSecretSignatory({
				address: "0xabc",
				confirmKey: "myconfirmsecret",
				publicKey: "pubkeyabc",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(confirmationSecretSignatory);

			expect(signatory.publicKey()).toBe("pubkeyabc");
		});

		it("should throw ForbiddenMethodCallException for ledger signatory", () => {
			const ledgerSignatory = new LedgerSignatory({
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(() => signatory.publicKey()).toThrow(ForbiddenMethodCallException);
		});
	});

	describe("path", () => {
		it("should return path from ledger signatory", () => {
			const ledgerSignatory = new LedgerSignatory({
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(signatory.path()).toBe("m/44'/60'/0'/0/0");
		});

		it("should throw ForbiddenMethodCallException for mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(() => signatory.path()).toThrow(ForbiddenMethodCallException);
		});

		it("should throw ForbiddenMethodCallException for secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(() => signatory.path()).toThrow(ForbiddenMethodCallException);
		});
	});

	describe("options", () => {
		it("should return options from mnemonic signatory", () => {
			const options = { bip44: { account: 0 } };
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				options,
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.options()).toBe(options);
		});

		it("should return options from ledger signatory", () => {
			const options = { bip44: { account: 1 } };
			const ledgerSignatory = new LedgerSignatory({
				options,
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(signatory.options()).toBe(options);
		});

		it("should return undefined options from mnemonic signatory when not provided", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.options()).toBeUndefined();
		});

		it("should return undefined options from secret signatory when not provided", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.options()).toBeUndefined();
		});

		it("should throw ForbiddenMethodCallException for confirmation mnemonic signatory", () => {
			const confirmationMnemonicSignatory = new ConfirmationMnemonicSignatory({
				address: "0x123",
				confirmKey: MAINSAIL_MNEMONICS[1],
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(confirmationMnemonicSignatory);

			expect(() => signatory.options()).toThrow(ForbiddenMethodCallException);
		});
	});

	describe("actsWithMnemonic", () => {
		it("should return true for mnemonic signatory", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.actsWithMnemonic()).toBe(true);
		});

		it("should return false for other signatory types", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.actsWithMnemonic()).toBe(false);
		});
	});

	describe("actsWithConfirmationMnemonic", () => {
		it("should return true for confirmation mnemonic signatory", () => {
			const confirmationMnemonicSignatory = new ConfirmationMnemonicSignatory({
				address: "0x123",
				confirmKey: MAINSAIL_MNEMONICS[1],
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(confirmationMnemonicSignatory);

			expect(signatory.actsWithConfirmationMnemonic()).toBe(true);
		});

		it("should return false for other signatory types", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.actsWithConfirmationMnemonic()).toBe(false);
		});
	});

	describe("actsWithLedger", () => {
		it("should return true for ledger signatory", () => {
			const ledgerSignatory = new LedgerSignatory({
				signingKey: "m/44'/60'/0'/0/0",
			});
			const signatory = new Signatory(ledgerSignatory);

			expect(signatory.actsWithLedger()).toBe(true);
		});

		it("should return false for other signatory types", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.actsWithLedger()).toBe(false);
		});
	});

	describe("actsWithSecret", () => {
		it("should return true for secret signatory", () => {
			const secretSignatory = new SecretSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(secretSignatory);

			expect(signatory.actsWithSecret()).toBe(true);
		});

		it("should return false for other signatory types", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.actsWithSecret()).toBe(false);
		});
	});

	describe("actsWithConfirmationSecret", () => {
		it("should return true for confirmation secret signatory", () => {
			const confirmationSecretSignatory = new ConfirmationSecretSignatory({
				address: "0x123",
				confirmKey: "myconfirmsecret",
				publicKey: "pubkey123",
				signingKey: "mysecret",
			});
			const signatory = new Signatory(confirmationSecretSignatory);

			expect(signatory.actsWithConfirmationSecret()).toBe(true);
		});

		it("should return false for other signatory types", () => {
			const mnemonicSignatory = new MnemonicSignatory({
				address: "0x123",
				publicKey: "pubkey123",
				signingKey: MAINSAIL_MNEMONICS[0],
			});
			const signatory = new Signatory(mnemonicSignatory);

			expect(signatory.actsWithConfirmationSecret()).toBe(false);
		});
	});
});
