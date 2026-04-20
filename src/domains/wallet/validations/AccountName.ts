import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";

export const accountName = ({
	t,
	currentAccountName,
	profile,
}: {
	t: TFunction;
	currentAccountName: string;
	profile: Contracts.IProfile;
}) => {
	const maxLength = 15;

	return {
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.NAME"),
				maxLength,
			}),
			value: maxLength,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.NAME"),
		}),
		validate: {
			duplicateAlias: (value: string) => {
				const accountName = value.trim();

				if (accountName === currentAccountName) {
					return true;
				}

				const alreadyExists = profile
					.wallets()
					.values()
					.some((wallet) => wallet.accountName() === accountName);

				if (!alreadyExists) {
					return true;
				}

				return t("WALLETS.VALIDATION.ACCOUNT_NAME_ASSIGNED", { name: accountName });
			},
			empty: (alias: string) => {
				if (alias.trim() === "") {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", { field: t("COMMON.NAME") });
				}

				return true;
			},
		},
	};
};
