import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { NormalizedNetwork } from "@/domains/setting/pages/Servers/Servers.contracts";
import { addressIsValid, endsWithSlash, hasPath, isValidIp } from "@/utils/peers";

export const server = (t: TFunction) => ({
	address: (customNetworks: NormalizedNetwork[], networkToUpdate?: NormalizedNetwork) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.ADDRESS"),
		}).toString(),
		validate: (address: string) => {
			if (!addressIsValid(address)) {
				return t("COMMON.VALIDATION.HOST_FORMAT");
			}

			if (isValidIp(address) && !hasPath(address, "/api")) {
				return t("COMMON.VALIDATION.HOST_FORMAT");
			}

			if (endsWithSlash(address)) {
				return t("COMMON.VALIDATION.HOST_FORMAT");
			}

			if (customNetworks.some((network) => network.address === address && networkToUpdate?.address !== address)) {
				return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.ADDRESS") });
			}

			return true;
		},
	}),
	name: (customNetworks: NormalizedNetwork[], networkToUpdate?: NormalizedNetwork) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.NAME"),
				maxLength: 42,
			}),
			value: 42,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.NAME"),
		}).toString(),
		validate: (name: string) => {
			if (customNetworks.some((network) => network.name === name && networkToUpdate?.name !== name)) {
				return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.NAME") });
			}

			return true;
		},
	}),
	network: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.NETWORK"),
		}).toString(),
	}),
});
