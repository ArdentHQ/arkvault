import { Networks } from "@ardenthq/sdk";
import {FieldErrors, ValidateResult} from "react-hook-form";
import { debounceAsync } from "@/utils/debounce";

const validateUsername = (t: any, value: string): string|undefined => {
	if (value.startsWith('_')) {
		return "cannot start with _";
	}

	if (value.endsWith('_')) {
		return "cannot end with _";
	}

	const multipleUnderscoresRegex = /.*_{2,}.*/;

	if (multipleUnderscoresRegex.test(value)) {
		return "cannot contain two or more consecutive underscores";
	}

	const allowedChars = /^[\d_a-z]+$/;

	if (!allowedChars.test(value)) {
		return "only lowercase letters, numbers and underscores are allowed";
	}
}

export const usernameRegistration = (t: any) => ({
	username: (network: Networks.Network, errors: FieldErrors) => ({
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
			pattern: (value: string) => validateUsername(t, value),
			unique: debounceAsync<ValidateResult>(async (value) => {
				// if there is an error from other groups, exit early
				if (errors.username && errors.username.type !== "unique") {
					return;
				}

				try {
					await usernameExists(network, value);
				} catch {
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

	if (username.length === 0) {
		return;
	}

	const response = await fetch(endpoints[network.id()] + username);

	if (response.ok) {
		throw new Error("Username is occupied!");
	}
};
