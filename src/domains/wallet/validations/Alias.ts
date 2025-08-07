import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "i18next";

export const alias = ({
	t,
	walletAddress,
	profile,
}: {
	t: TFunction;
	walletAddress: string;
	profile: Contracts.IProfile;
}) => {
	const maxLength = 42;

	return {
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("WALLETS.ADDRESS_NAME"),
				maxLength,
			}),
			value: maxLength,
		},
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("WALLETS.ADDRESS_NAME"),
		}),
		validate: {
			duplicateAlias: (value: string) => {
				const alias = value.trim();

				const walletWithSameAlias = profile.wallets().findByAlias(alias);

				if (!walletWithSameAlias || walletWithSameAlias.address() === walletAddress) {
					return true;
				}

				return t("WALLETS.VALIDATION.ALIAS_ASSIGNED", { alias });
			},
			empty: (alias: string) => {
				if (alias.trim() === "") {
					return t("WALLETS.VALIDATION.ALIAS_REQUIRED");
				}

				return true;
			},
		},
	};
};
