import { Contracts } from "@payvo/sdk-profiles";
import { TFunction } from "i18next";

import { lowerCaseEquals } from "@/utils/equals";

const nameMaxLength = 42;

export const contactForm = (t: TFunction, profile: Contracts.IProfile) => ({
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
