import React from "react";
import { useTranslation } from "react-i18next";
import { ThemeIcon } from "@/app/components/Icon";
import { PageHeader } from "@/app/components/Header";

const ContactsHeader = () => {
	const { t } = useTranslation();

	return (
		<div className="mb-4 md:mb-0">
			<PageHeader
				title={t("CONTACTS.CONTACTS_PAGE.TITLE")}
				subtitle={t("CONTACTS.CONTACTS_PAGE.SUBTITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[54, 55]}
						lightIcon="ContactsLight"
						darkIcon="ContactsDark"
						dimIcon="ContactsDim"
					/>
				}
			/>
		</div>
	);
};

export { ContactsHeader };
