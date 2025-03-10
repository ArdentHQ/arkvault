import { Contracts } from "@ardenthq/sdk-profiles";
import { TFunction } from "i18next";
import { Networks } from "@ardenthq/sdk";
import { lowerCaseEquals } from "@/utils/equals";
import { Coins } from "@ardenthq/sdk";

const nameMaxLength = 42;

export const contactForm = (t: TFunction, profile: Contracts.IProfile, network: Networks.Network | undefined) => ({
	address: () => ({
		validate: {
			validAddress: async (address?: string) => {
				console.log({ address });
				if (!network) {
					return t("CONTACTS.VALIDATION.NETWORK_NOT_AVAILABLE").toString();
				}

				const instance: Coins.Coin = profile.coins().set(network.coin(), network.id());

				await instance.__construct();

				const isValidAddress: boolean = await instance.address().validate(address);

				if (!isValidAddress) {
					return t("CONTACTS.VALIDATION.ADDRESS_IS_INVALID").toString();
				}

				return true;
			},
		},
	}),
	name: (contactId?: string) => ({
		maxLength: {
			message: t("COMMON.VALIDATION.MAX_LENGTH", {
				field: t("CONTACTS.CONTACT_FORM.NAME"),
				maxLength: nameMaxLength,
			}),
			value: nameMaxLength,
		},
		validate: {
			duplicateName: (name?: string) => {
				const duplicateNames = profile
					.contacts()
					.values()
					.filter(
						(item: Contracts.IContact) =>
							item.id() !== contactId && lowerCaseEquals(item.name().trim(), name?.trim()),
					);

				if (duplicateNames.length > 0) {
					return t("CONTACTS.VALIDATION.NAME_EXISTS", {
						name: name?.trim(),
					}).toString();
				}

				return true;
			},
			required: (name?: string) => {
				if (!name?.trim()) {
					return t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("CONTACTS.CONTACT_FORM.NAME"),
					}).toString();
				}

				return true;
			},
		},
	}),
});
