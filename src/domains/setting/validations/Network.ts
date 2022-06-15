import { TFunction } from "react-i18next";
import { Networks } from "@ardenthq/sdk";
import { addressIsValid } from "@/utils/peers";

const validateAddress = (address: string, t: TFunction) => {
	if (address && !addressIsValid(address)) {
		return t("COMMON.VALIDATION.HOST_FORMAT");
	}

	return true;
};

export const network = (t: TFunction) => ({
	address: (customNetworks: Networks.NetworkManifest[], networkToUpdate?: Networks.NetworkManifest) => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.ADDRESS"),
		}).toString(),
		validate: (address: string) => {
			if (!addressIsValid(address)) {
				return t("SETTINGS.NETWORKS.FORM.INVALID_SEED_SERVER_FORMAT");
			}

			if (
				customNetworks.some((network) => {
					let networkToUpdateHostHost: string | undefined;
					if (networkToUpdate) {
						const networkToUpdateHost = networkToUpdate.hosts.find((host) => host.type === "full");
						networkToUpdateHostHost = networkToUpdateHost?.host;
					}

					return network.hosts.some(
						(host) =>
							host.host === address &&
							host.type === "full" &&
							(networkToUpdateHostHost === undefined || networkToUpdateHostHost !== host.host),
					);
				})
			) {
				return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.ADDRESS") });
			}

			return true;
		},
	}),
	explorer: () => ({
		validate: (address: string) => validateAddress(address, t),
	}),
	knownWallets: () => ({
		validate: (address: string) => {
			if (address && !addressIsValid(address)) {
				return t("SETTINGS.NETWORKS.FORM.INVALID_KNOWN_WALLETS_URL");
			}

			return true;
		},
	}),
	name: (customNetworks: Networks.NetworkManifest[], networkToUpdate?: Networks.NetworkManifest) => ({
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
			if (
				customNetworks.some((network) => {
					const networkToUpdateName: string | undefined = networkToUpdate?.name;

					return network.name === name && (networkToUpdateName === undefined || networkToUpdateName !== name);
				})
			) {
				return t("COMMON.VALIDATION.EXISTS", { field: t("COMMON.NAME") });
			}

			return true;
		},
	}),
	slip44: () => ({
		validate: (slip44: string) => {
			const isNumeric = /^\d+$/.test(slip44);

			if (!isNumeric) {
				return t("SETTINGS.NETWORKS.FORM.INVALID_SLIP_FORMAT");
			}
		},
	}),
	ticker: () => ({
		validate: (ticker: string) => {
			const onlyLetterAndNumber = /^[\dA-Za-z]*$/.test(ticker);

			if (!onlyLetterAndNumber || ticker.length > 5) {
				return t("SETTINGS.NETWORKS.FORM.INVALID_MARKET_TICKER_FORMAT");
			}
		},
	}),
});
