import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Column } from "react-table";
import { useFilteredContacts } from "./Contacts.helpers";
import { ContactsHeader } from "./Contacts.blocks";
import { Page, Section } from "@/app/components/Layout";
import { Table } from "@/app/components/Table";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { CreateContact, DeleteContact, UpdateContact } from "@/domains/contact/components";
import { ContactListItem } from "@/domains/contact/components/ContactListItem";
import { ContactListMobile } from "@/domains/contact/components/ContactListMobile";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { Button } from "@/app/components/Button";

export const Contacts: FC = () => {
	const { state } = useEnvironmentContext();

	const history = useHistory();

	const { isMdAndAbove } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const [query, setQuery] = useState("");

	const contacts: Contracts.IContact[] = useMemo(() => activeProfile.contacts().values(), [activeProfile, state]); // eslint-disable-line react-hooks/exhaustive-deps

	const { filteredContacts } = useFilteredContacts({ contacts, profile: activeProfile, query });

	const [createIsOpen, setCreateIsOpen] = useState(false);

	const [contactAction, setContactAction] = useState<string | undefined>(undefined);
	const [selectedContact, setSelectedContact] = useState<Contracts.IContact | undefined>(undefined);

	const { t } = useTranslation();

	useEffect(() => {
		if (!contactAction) {
			setSelectedContact(undefined);
		}
	}, [contactAction]);

	const listColumns = useMemo<Column<Contracts.IContact>[]>(
		() => [
			{
				Header: t("COMMON.NAME"),
				accessor: "name",
				headerClassName: "no-border",
				minimumWidth: true,
			},
			{
				Header: t("COMMON.ADDRESS"),
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.COPY"),
				headerClassName: "no-border",
				minimumWidth: true,
			},
			{
				Header: "Actions",
				cellWidth: "w-40",
				className: "hidden",
				headerClassName: "no-border",
			},
		],
		[t],
	);

	const handleContactAction = useCallback(
		(action: ContactListItemOption, contact: Contracts.IContact) => {
			setContactAction(String(action.value));
			setSelectedContact(contact);
		},
		[setContactAction, setSelectedContact],
	);

	const handleSend = useCallback(
		(address: Contracts.IContactAddress) => {
			const schema = { coin: address.coin(), recipient: address.address() };
			const queryParameters = new URLSearchParams(schema).toString();
			const url = `/profiles/${activeProfile.id()}/send-transfer?${queryParameters}`;

			history.push(url);
		},
		[history, activeProfile],
	);

	const resetContactAction = () => {
		setContactAction(undefined);
	};

	const menuOptions = useMemo(
		() => [
			{ label: t("COMMON.EDIT"), value: "edit" },
			{ label: t("COMMON.DELETE"), value: "delete" },
		],
		[t],
	);

	const hasBalance = useMemo(
		() => Object.values(activeProfile.wallets().all()).reduce((acc, wallet) => acc + wallet.balance(), 0) > 0,
		[activeProfile],
	);

	const renderTableRow = useCallback(
		(contact: Contracts.IContact) => (
			<ContactListItem
				profile={activeProfile}
				item={contact}
				options={menuOptions}
				onSend={handleSend}
				hasBalance={hasBalance}
				onAction={(action) => handleContactAction(action, contact)}
			/>
		),
		[menuOptions, handleSend, handleContactAction],
	);

	const tableFooter = useMemo(() => {
		if (filteredContacts.length > 0) {
			return null;
		}

		return (
			<tr
				data-testid="EmptyResults"
				className="border-solid border-theme-secondary-200 dark:border-theme-secondary-800 md:border-b-4"
			>
				<td colSpan={listColumns.length} className="pb-4 pt-[11px]">
					<div className="flex flex-col items-center justify-center">
						<h3 className="mb-2 text-base font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
							{t("COMMON.EMPTY_RESULTS.TITLE")}
						</h3>
						<p className="text-sm text-theme-secondary-700 dark:text-theme-secondary-600">
							{t("COMMON.EMPTY_RESULTS.SUBTITLE")}
						</p>
					</div>
				</td>
			</tr>
		);
	}, [t, filteredContacts.length]);

	const renderContacts = () => (
		// if (isMdAndAbove) {
		<SearchableTableWrapper
			innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
			searchQuery={query}
			setSearchQuery={setQuery}
			searchPlaceholder={t("CONTACTS.CONTACTS_PAGE.SEARCH_PLACEHOLDER")}
			extra={
				<Button
					className="mr-6 hidden h-8 py-0 leading-none text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-primary-400 dark:hover:text-theme-primary-300 sm:block"
					data-testid="contacts__add-contact-btn"
					onClick={() => setCreateIsOpen(true)}
					variant="primary-transparent"
					size="sm"
					icon="Plus"
				>
					<span className="whitespace-nowrap text-base font-semibold">
						{t("CONTACTS.CONTACTS_PAGE.ADD_CONTACT")}
					</span>
				</Button>
			}
		>
			<div data-testid="ContactList">
				<Table
					columns={listColumns}
					data={filteredContacts}
					className="with-x-padding"
					footer={tableFooter}
					hideHeader={!isMdAndAbove}
				>
					{renderTableRow}
				</Table>
			</div>
		</SearchableTableWrapper>
	);
	// }

	// return (
	// 	<ContactListMobile
	// 		profile={activeProfile}
	// 		contacts={filteredContacts}
	// 		onSend={handleSend}
	// 		options={menuOptions}
	// 		onAction={handleContactAction}
	// 		hasBalance={hasBalance}
	// 	/>
	// );
	return (
		<>
			<Page pageTitle={t("CONTACTS.CONTACTS_PAGE.TITLE")}>
				<ContactsHeader />

				<Section className="-mb-1 pb-0">
					<div className="flex items-center rounded border border-theme-secondary-300 dark:border-theme-secondary-800 sm:hidden">
						<Button
							className="h-12 w-full text-theme-primary-600 hover:text-theme-primary-700 dark:text-theme-primary-400 dark:hover:text-theme-primary-300"
							data-testid="contacts__add-contact-btn"
							onClick={() => setCreateIsOpen(true)}
							variant="primary-transparent"
							size="sm"
							icon="Plus"
						>
							<span className="whitespace-nowrap text-base font-semibold">
								{t("CONTACTS.CONTACTS_PAGE.ADD_CONTACT")}
							</span>
						</Button>
					</div>
				</Section>

				{renderContacts()}
			</Page>

			{createIsOpen && (
				<CreateContact
					profile={activeProfile}
					onCancel={() => setCreateIsOpen(false)}
					onClose={() => setCreateIsOpen(false)}
					onSave={() => setCreateIsOpen(false)}
				/>
			)}

			{selectedContact && (
				<>
					{contactAction === "edit" && (
						<UpdateContact
							contact={selectedContact}
							profile={activeProfile}
							onCancel={resetContactAction}
							onClose={resetContactAction}
							onDelete={() => setContactAction("delete")}
							onSave={resetContactAction}
						/>
					)}

					{contactAction === "delete" && (
						<DeleteContact
							contact={selectedContact}
							profile={activeProfile}
							onCancel={resetContactAction}
							onClose={resetContactAction}
							onDelete={resetContactAction}
						/>
					)}
				</>
			)}
		</>
	);
};
