import { Contracts } from "@/app/lib/profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Column } from "react-table";
import { useFilteredContacts } from "./Contacts.helpers";
import { ContactsHeader } from "./Contacts.blocks";
import { Page, Section } from "@/app/components/Layout";
import { Table } from "@/app/components/Table";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { CreateContact, DeleteContact, UpdateContact } from "@/domains/contact/components";
import { ContactListItem } from "@/domains/contact/components/ContactListItem";
import { ContactListItemMobile } from "@/domains/contact/components/ContactListItemMobile";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { Button } from "@/app/components/Button";

export const Contacts: FC = () => {
	const { state } = useEnvironmentContext();

	const navigate = useNavigate();

	const { isMdAndAbove, isXs, isSmAndAbove } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const [query, setQuery] = useState("");

	const contacts: Contracts.IContact[] = useMemo(() => activeProfile.contacts().values(), [activeProfile, state]);

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
				noRoundedBorders: true,
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
				noRoundedBorders: true,
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
			const schema = { recipient: address.address() };
			const queryParameters = new URLSearchParams(schema).toString();
			const url = `/profiles/${activeProfile.id()}/send-transfer?${queryParameters}`;

			navigate(url);
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
		(contact: Contracts.IContact) => {
			if (isMdAndAbove) {
				return (
					<ContactListItem
						profile={activeProfile}
						item={contact}
						options={menuOptions}
						onSend={handleSend}
						hasBalance={hasBalance}
						onAction={(action) => handleContactAction(action, contact)}
					/>
				);
			}

			return (
				<ContactListItemMobile
					profile={activeProfile}
					contact={contact}
					onSend={handleSend}
					options={menuOptions}
					onAction={(action) => handleContactAction(action, contact)}
					hasBalance={hasBalance}
				/>
			);
		},
		[menuOptions, handleSend, handleContactAction, isMdAndAbove],
	);

	const tableFooter = useMemo(() => {
		if (filteredContacts.length > 0) {
			return null;
		}

		return (
			<tr
				data-testid="EmptyResults"
				className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-solid md:border-b-4"
			>
				<td colSpan={listColumns.length} className="pt-[11px] pb-4">
					{contacts.length > 0 && (
						<div className="flex flex-col items-center justify-center">
							<h3 className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-200 mb-2 text-base font-semibold">
								{t("COMMON.EMPTY_RESULTS.TITLE")}
							</h3>
							<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 text-sm">
								{t("COMMON.EMPTY_RESULTS.SUBTITLE")}
							</p>
						</div>
					)}

					{contacts.length === 0 && (
						<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 px-6 py-4 text-center text-sm sm:py-0">
							{t("CONTACTS.CONTACTS_PAGE.EMPTY_MESSAGE")}
						</p>
					)}
				</td>
			</tr>
		);
	}, [t, filteredContacts.length]);

	const renderContacts = () => (
		<SearchableTableWrapper
			innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
			searchQuery={query}
			setSearchQuery={setQuery}
			searchPlaceholder={t("CONTACTS.CONTACTS_PAGE.SEARCH_PLACEHOLDER")}
			extra={
				<Button
					className="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-300 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 mr-6 hidden h-8 py-0 leading-none sm:block"
					data-testid="contacts__add-contact-btn"
					onClick={() => setCreateIsOpen(true)}
					variant="primary-transparent"
					size="sm"
					icon="Plus"
				>
					<span className="text-base font-semibold whitespace-nowrap">
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

	return (
		<>
			<Page pageTitle={t("CONTACTS.CONTACTS_PAGE.TITLE")}>
				<ContactsHeader />

				<Section className="py-0">
					<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded border sm:hidden">
						<Button
							className="text-theme-primary-600 dark:text-theme-primary-400 dark:hover:text-theme-primary-300 hover:text-theme-primary-700 dim:text-theme-dim-navy-600 dim-hover:text-theme-dim-50 h-12 w-full"
							data-testid="contacts__add-contact-btn-mobile"
							onClick={() => setCreateIsOpen(true)}
							variant="primary-transparent"
							size="sm"
							icon="Plus"
						>
							<span className="text-base font-semibold whitespace-nowrap">
								{t("CONTACTS.CONTACTS_PAGE.ADD_CONTACT")}
							</span>
						</Button>
					</div>
				</Section>

				{isXs && (
					<>
						{contacts.length === 0 && (
							<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 p-4 px-6 text-center text-sm">
								{t("CONTACTS.CONTACTS_PAGE.EMPTY_MESSAGE")}
							</p>
						)}

						{contacts.length > 0 && renderContacts()}
					</>
				)}

				{isSmAndAbove && renderContacts()}
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
