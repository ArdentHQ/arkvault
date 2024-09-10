import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { Column } from "react-table";

import { AvailableNetwork } from "./Contacts.contracts";
import { useFilteredContacts } from "./Contacts.helpers";
import { ContactsHeader } from "./Contacts.blocks";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import { Page, Section } from "@/app/components/Layout";
import { Table } from "@/app/components/Table";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { CreateContact, DeleteContact, UpdateContact } from "@/domains/contact/components";
import { ContactListItem } from "@/domains/contact/components/ContactListItem";
import { ContactListMobile } from "@/domains/contact/components/ContactListMobile";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";

export const Contacts: FC = () => {
	const { state } = useEnvironmentContext();

	const history = useHistory();

	const { isMdAndAbove } = useBreakpoint();

	const activeProfile = useActiveProfile();

	const [query, setQuery] = useState("");

	const availableNetworks = useMemo<AvailableNetwork[]>(() => {
		const group: Record<string, number> = {};

		for (const wallet of activeProfile.wallets().values()) {
			group[wallet.networkId()] ??= 0;
			group[wallet.networkId()] += wallet.balance();
		}

		return Object.entries(group).map(([networkId, balance]) => ({
			hasBalance: balance > 0,
			id: networkId,
		}));
	}, [activeProfile]);

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
				Header: t("COMMON.CRYPTOASSET"),
				className: "justify-start",
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
			const schema = { coin: address.coin(), network: address.network(), recipient: address.address() };
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

	const renderTableRow = useCallback(
		(contact: Contracts.IContact) => (
			<ContactListItem
				profile={activeProfile}
				item={contact}
				options={menuOptions}
				availableNetworks={availableNetworks}
				onSend={handleSend}
				onAction={(action) => handleContactAction(action, contact)}
				isCompact={true}
			/>
		),
		[menuOptions, availableNetworks, handleSend, handleContactAction],
	);

	const renderContacts = () => {
		if (contacts.length === 0) {
			return (
				<Section>
					<EmptyBlock>{t("CONTACTS.CONTACTS_PAGE.EMPTY_MESSAGE")}</EmptyBlock>
				</Section>
			);
		}

		if (filteredContacts.length > 0) {
			if (isMdAndAbove) {
				return (
					<Section>
						<div className="mt-2 w-full" data-testid="ContactList">
							<Table
								columns={listColumns}
								data={filteredContacts}
								className="with-x-padding overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-secondary-800 md:border"
							>
								{renderTableRow}
							</Table>
						</div>
					</Section>
				);
			}

			return (
				<ContactListMobile
					profile={activeProfile}
					contacts={filteredContacts}
					onSend={handleSend}
					options={menuOptions}
					onAction={handleContactAction}
					availableNetworks={availableNetworks}
				/>
			);
		}

		return (
			<Section>
				<EmptyBlock data-testid="Contacts--empty-results">
					{t("CONTACTS.CONTACTS_PAGE.NO_CONTACTS_FOUND", { query })}
				</EmptyBlock>
			</Section>
		);
	};

	return (
		<>
			<Page pageTitle={t("CONTACTS.CONTACTS_PAGE.TITLE")}>
				<ContactsHeader
					showSearchBar={contacts.length > 0}
					onAddContact={() => setCreateIsOpen(true)}
					onSearch={setQuery}
				/>

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
