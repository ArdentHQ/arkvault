import { Networks } from "@ardenthq/sdk";
import { ValidateResult } from "react-hook-form";
import { MutableRefObject } from "react";
import { debounceAsync } from "@/utils/debounce";

class UsernameExistsError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UsernameExistsError";
	}
}

const validateUsername = (t: any, value: string): string | undefined => {
	if (value.startsWith("_")) {
		return t("COMMON.VALIDATION.LEADING_UNDERSCORE");
	}

	if (value.endsWith("_")) {
		return t("COMMON.VALIDATION.TRAILING_UNDERSCORE");
	}

	const multipleUnderscoresRegex = /.*_{2,}.*/;

	if (multipleUnderscoresRegex.test(value)) {
		return t("COMMON.VALIDATION.MULTIPLE_UNDERSCORES");
	}

	const allowedChars = /^[\d_a-z]+$/;

	if (!allowedChars.test(value)) {
		return t("COMMON.VALIDATION.USERNAME_ALLOWED_CHARS");
	}
};

export const usernameRegistration = (t: any) => ({
	username: (network: Networks.Network, controller: MutableRefObject<AbortController | undefined>) => ({
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
			unique: debounceAsync(async (value) => {
				const error = validateUsername(t, value);

				if (error) {
					return error;
				}

				try {
					await usernameExists(network, value, controller);
				} catch (error) {
					console.log(error, error.name)
					if (error.name === "UsernameExistsError") {
						return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.USERNAME") });
					}

					return true;
				}
			}, 300) as () => Promise<ValidateResult>,
		},
	}),
});

const usernameExists = async (
	network: Networks.Network,
	username: string,
	controller: MutableRefObject<AbortController | undefined>,
) => {
	const endpoints = {
		"mainsail.devnet": "https://dwallets-evm.mainsailhq.com/api/wallets/",
		"mainsail.mainnet": "https://wallets-evm.mainsailhq.com/api/wallets/",
	};

	if (username.length === 0) {
		return;
	}

	const response = await fetch(endpoints[network.id()] + username, { signal: controller.current?.signal });

	if (response.ok) {
		throw new UsernameExistsError("Username is occupied!");
	}
};
