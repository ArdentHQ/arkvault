// eslint-disable sonarjs/no-duplicate-string
import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import { TFunction } from "@/app/i18n/react-i18next.contracts";
import { BigNumber } from "@/app/lib/helpers";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { AddressService } from "@/app/lib/mainsail/address.service";

const FIELD_REQUIRED = "COMMON.VALIDATION.FIELD_REQUIRED";

export const sendTransfer = (t: TFunction) => ({
	amount: (
		network: Networks.Network | undefined,
		balance: BigNumber,
		recipients: RecipientItem[],
		isSingleRecipient: boolean,
	) => ({
		validate: {
			valid: (amountValue: string | undefined) => {
				const hasValidAmount = amountValue !== undefined && amountValue !== "";
				const amount = BigNumber.make(hasValidAmount ? amountValue : 0);

				const hasSufficientBalance = balance.isGreaterThanOrEqualTo(amount);
				const shouldRequire = isSingleRecipient || recipients.length === 0;

				if (!hasSufficientBalance) {
					return t("TRANSACTION.VALIDATION.LOW_BALANCE", {
						balance,
						coinId: network?.coin(),
					});
				}

				if (shouldRequire) {
					if (!hasValidAmount) {
						return t(FIELD_REQUIRED, {
							field: t("COMMON.AMOUNT"),
						});
					}

					if (amount.isZero()) {
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
		required: t(FIELD_REQUIRED, {
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
			valid: (addressValue: string | undefined) => {
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
					return t(FIELD_REQUIRED, {
						field: t("COMMON.RECIPIENT"),
					});
				}

				const isValidAddress: boolean = new AddressService().validate(address);
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
		required: t(FIELD_REQUIRED, {
			field: t("COMMON.SENDER_ADDRESS"),
		}),
	}),
	tokenContractAddress: () => ({
		required: t(FIELD_REQUIRED, {
			field: t("COMMON.ASSET"),
		}),
	}),
});
