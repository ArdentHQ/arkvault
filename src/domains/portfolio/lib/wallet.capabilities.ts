import { Contracts } from "@/app/lib/profiles";
import { Enums } from "@ardenthq/sdk";

export const WalletCapabilities = (wallet: Contracts.IReadWriteWallet) => ({
	/**
	 * Determines whether the wallet can send any transaction.
	 * @returns {boolean}
	 */
	canBroadcast() {
		return wallet.hasBeenFullyRestored() && wallet.hasSyncedWithNetwork() && wallet.balance() > 0;
	},
	/**
	 * Determines whether the wallet can send a transfer transaction.
	 * @returns {boolean}
	 */
	canSendTransfer() {
		return this.canBroadcast();
	},

	/**
	 * Determines whether the wallet can send a username registration transaction.
	 * @returns {boolean}
	 */
	canSendUsernameRegistration(): boolean {
		if (!this.canBroadcast()) {
			return false;
		}

		return wallet.network().allows(Enums.FeatureFlag.TransactionUsernameRegistration);
	},

	/**
	 * Determines whether the wallet can send a username resignation transaction.
	 * @returns {boolean}
	 */
	canSendUsernameResignation(): boolean {
		if (!this.canBroadcast()) {
			return false;
		}

		return wallet.network().allows(Enums.FeatureFlag.TransactionUsernameRegistration) && !!wallet.username();
	},

	/**
	 * Determines whether the wallet can send a validator registration transaction.
	 * @returns {boolean}
	 */
	canSendValidatorRegistration(): boolean {
		if (!this.canBroadcast()) {
			return false;
		}

		return (
			wallet.network().allows(Enums.FeatureFlag.TransactionValidatorRegistration) &&
			!wallet.isValidator() &&
			!wallet.isResignedValidator()
		);
	},

	/**
	 * Determines whether the wallet can send a validator resignation transaction.
	 * @returns {boolean}
	 */
	canSendValidatorResignation(): boolean {
		if (!this.canBroadcast()) {
			return false;
		}

		return (
			wallet.network().allows(Enums.FeatureFlag.TransactionValidatorResignation) &&
			wallet.isValidator() &&
			!wallet.isResignedValidator()
		);
	},

	/**
	 * Determines whether the wallet is a multisignature wallet.
	 * @returns {boolean}
	 */
	isMultisignature(): boolean {
		return false;
	},
});
