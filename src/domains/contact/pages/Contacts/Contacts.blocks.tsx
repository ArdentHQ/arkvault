import React, { VFC } from "react";
import { useTranslation } from "react-i18next";
import { ContactsHeaderExtraProperties, ContactsHeaderProperties } from "./Contacts.contracts";
import { Button } from "@/app/components/Button";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Icon } from "@/app/components/Icon";
import { useBreakpoint } from "@/app/hooks";
import { PageHeader } from "@/app/components/Header";
import { Divider } from "@/app/components/Divider";

const ContactsHeader: VFC<ContactsHeaderProperties> = ({ showSearchBar, onAddContact, onSearch }) => {
	const { t } = useTranslation();

	return (
		<PageHeader
			title={t("CONTACTS.CONTACTS_PAGE.TITLE")}
			subtitle={t("CONTACTS.CONTACTS_PAGE.SUBTITLE")}
			extra={
				<ContactsHeaderExtra showSearchBar={showSearchBar} onAddContact={onAddContact} onSearch={onSearch} />
			}
			border
		/>
	);
};

const ContactsHeaderExtra: VFC<ContactsHeaderExtraProperties> = ({ showSearchBar, onSearch, onAddContact }) => {
	const { t } = useTranslation();

	const { isMdAndAbove } = useBreakpoint();

	return (
		<div className="items-top flex justify-end">
			{showSearchBar && (
				<div className="flex items-center text-theme-primary-200">
					<HeaderSearchBar onSearch={onSearch} noToggleBorder />
					<span className="mx-0.5 flex md:ml-3.5">
						<Divider type="vertical" size="md" />
					</span>
				</div>
			)}

			{isMdAndAbove ? (
				<Button className="ml-6" data-testid="contacts__add-contact-btn" onClick={onAddContact}>
					{t("CONTACTS.CONTACTS_PAGE.ADD_CONTACT")}
				</Button>
			) : (
				<button type="button" className="-mr-2.5 p-2.5" onClick={onAddContact}>
					<Icon name="Plus" size="lg" className="text-theme-primary-300 dark:text-theme-secondary-600" />
				</button>
			)}
		</div>
	);
};

export { ContactsHeader, ContactsHeaderExtra };
