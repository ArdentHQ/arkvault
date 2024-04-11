import { Networks } from "@ardenthq/sdk";
import { debounceAsync } from "@/utils/debounce";
import { validatePattern } from "@/utils/validations";

export const usernameRegistration = (t: any) => ({
	username: (network: Networks.Network) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.USERNAME"),
				maxLength: 20,
			}),
			value: 20,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.USERNAME"),
		}),
		validate: {
			pattern: (value: string) => validatePattern(t, value, /[\d!$&.@_a-z]+/),
			unique: debounceAsync(async (value) => {
				try {
					await usernameExists(network, value);
				} catch (_e) {
					return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.USERNAME") });
				}
			}, 500),
		},
	}),
});

const usernameExists = async (network: Networks.Network, username: string) => {
	const endpoints = {
		"mainsail.devnet": "https://dwallets.mainsailhq.com/api/wallets/",
		"mainsail.mainnet": "https://wallets.mainsailhq.com/api/wallets/",
	};

	if (username.length === 0) return;

	const response = await fetch(endpoints[network.id()] + username);

	if (response.ok) {
		throw Error("Username is occupied!");
	}
};
