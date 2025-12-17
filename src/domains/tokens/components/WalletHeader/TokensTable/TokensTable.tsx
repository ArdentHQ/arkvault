import { Contracts } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { generatePath, useNavigate } from "react-router-dom";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { ContactListItem } from "@/domains/contact/components/ContactListItem";
import { ContactListItemMobile } from "@/domains/contact/components/ContactListItemMobile";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { ProfilePaths } from "@/router/paths";
import { useFilteredContacts } from "@/domains/contact/pages/Contacts/Contacts.helpers";
import { Toggle } from "@/app/components/Toggle";

export const TokensTable = () => {
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
				noRoundedBorders: true,
				cellWidth: "w-48 xl:w-40",
			},
			{
				Header: t("COMMON.SYMBOL"),
				headerClassName: "no-border",
				cellWidth: "w-48 xl:w-40",
			},
			{
				Header: t("COMMON.TOKEN_BALANCE"),
				headerClassName: "no-border",
				cellWidth: "w-48 xl:w-40",
			},
			{
				Header: t("COMMON.CURRENCY"),
				headerClassName: "no-border",
				minimumWidth: true,
				// className: "justify-end",
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
			const path =
				generatePath(ProfilePaths.SendTransfer, { profileId: activeProfile.id() }) + `&${queryParameters}`;

			navigate(path);
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
							{t("TOKENS.EMPTY_TOKENS")}
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
			searchPlaceholder={t("TOKENS.ENTER_TOKEN_NAME")}
			extra={
				<div className="flex items-center space-x-2 mr-6">
					<div className="whitespace-nowrap text-theme-secondary-700 dark:text-theme-secondary-200 font-semibold">{t("TOKENS.HIDE_DUST")}</div>
					<Toggle
						disabled
						name="hideDust"
						defaultChecked={false}
						data-testid="Tokens__toggle-Toggle"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							console.log("hide dust toggle", event.target.checked)
						}}
					/>
				</div>
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
		</SearchableTableWrapper >
	);

	return (
		<>
			{isXs && (
				<>
					{contacts.length === 0 && (
						<p
							data-testid="NoResultsMessage"
							className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 p-4 px-6 text-center text-sm"
						>
							{t("CONTACTS.CONTACTS_PAGE.EMPTY_MESSAGE")}
						</p>
					)}

					{contacts.length > 0 && renderContacts()}
				</>
			)}

			{isSmAndAbove && renderContacts()}
		</>
	);
};
