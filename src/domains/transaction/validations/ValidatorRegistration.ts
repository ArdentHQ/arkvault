import { Contracts } from "@ardenthq/sdk-profiles";
import { Networks } from "@ardenthq/sdk";
import { ValidateResult } from "react-hook-form";
import { debounceAsync } from "@/utils/debounce";

export const validatorRegistration = (t: any) => ({
	validatorPublicKey: (wallet: Contracts.IReadWriteWallet) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
				maxLength: 96,
			}),
			value: 96,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("TRANSACTION.VALIDATOR_PUBLIC_KEY"),
		}),

		validate: {
			pattern: async (publicKey: string) => {
				const isValid = await wallet.coin().publicKey().verifyPublicKeyWithBLS(publicKey);

				if (!isValid) {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.INVALID_BLS_PUBLIC_KEY");
				}

				return true;
			},
			unique: debounceAsync<ValidateResult>(async (publicKey: string) => {
				try {
					await publicKeyExists(wallet.network(), publicKey);
				} catch {
					return t("COMMON.INPUT_PUBLIC_KEY.VALIDATION.PUBLIC_KEY_ALREADY_EXISTS", { publicKey });
				}
			}, 300),
		},
	}),
});

const publicKeyExists = async (network: Networks.Network, publicKey: string) => {
	const endpoints = {
		"mainsail.devnet": "https://dwallets-evm.mainsailhq.com/api/wallets/",
		"mainsail.mainnet": "https://wallets-evm.mainsailhq.com/api/wallets/",
	};

	if (publicKey.length === 0) {
		return;
	}

	const response = await fetch(`${endpoints[network.id()]}?attributes.validatorPublicKey=${publicKey}`);

	const data = await response.json();

	if (data.meta.count > 0) {
		throw new Error("Public key has already been used!");
	}
};
