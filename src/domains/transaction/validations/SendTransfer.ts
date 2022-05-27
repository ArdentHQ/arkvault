import { Coins, Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { TFunction } from "react-i18next";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export const sendTransfer = (t: TFunction) => ({
	amount: (
		network: Networks.Network | undefined,
		balance: number,
		recipients: RecipientItem[],
		isSingleRecipient: boolean,
	) => ({
		validate: {
			valid: (amountValue: number | string) => {
				const amount = amountValue || 0;
				const hasSufficientBalance = Number(balance || 0) >= amount && balance !== 0;
				const shouldRequire = isSingleRecipient || recipients.length === 0;

				if (!hasSufficientBalance) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE", {
						balance,
						coinId: network?.coin(),
					});
				}

				if (shouldRequire) {
					if (amountValue === undefined || amountValue === "") {
						return t("COMMON.VALIDATION.FIELD_REQUIRED", {
							field: t("COMMON.AMOUNT"),
						});
					}

					if (amount === 0) {
						return t("TRANSACTION.VALIDATION.AMOUNT_BELOW_MINIMUM", {
							coinId: network?.coin(),
							min: "0.00000001",
						});
					}
				}

				return true;
			},
		},
	}),
	memo: () => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("COMMON.MEMO"),
				maxLength: 255,
			}),
			value: 255,
		},
	}),
	network: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.CRYPTOASSET"),
		}),
	}),
	recipientAddress: (
		profile: Contracts.IProfile,
		network: Networks.Network | undefined,
		recipients: RecipientItem[],
		isSingleRecipient: boolean,
	) => ({
		validate: {
			valid: async (addressValue: string | undefined) => {
				const address = (addressValue || "").trim();
				const shouldRequire = !address && recipients.length === 0;
				const hasAddedRecipients = !address && !isSingleRecipient && recipients.length > 0;

				if (!network) {
					return false;
				}

				if (hasAddedRecipients) {
					return true;
				}

				if (shouldRequire || !network) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.RECIPIENT"),
					});
				}

				const coin: Coins.Coin = profile.coins().set(network.coin(), network.id());
				const isValidAddress: boolean = await coin.address().validate(address);
				return isValidAddress || t("COMMON.VALIDATION.RECIPIENT_INVALID");
			},
		},
	}),
	recipients: () => ({
		validate: {
			valid: (recipients: RecipientItem[]) => recipients.length > 0,
		},
	}),
	senderAddress: () => ({
		required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
			field: t("COMMON.SENDER_ADDRESS"),
		}),
	}),
});
