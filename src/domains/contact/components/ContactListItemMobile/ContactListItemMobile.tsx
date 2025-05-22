import React, { useCallback, useMemo } from "react";
import { Contracts } from "@/app/lib/profiles";
import { Icon } from "@/app/components/Icon";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { Dropdown } from "@/app/components/Dropdown";
import { useNetworks } from "@/app/hooks";
import { MobileTableElement, MobileTableElementRow } from "@/app/components/MobileTableElement";
import { useTranslation } from "react-i18next";
import { Address } from "@/app/components/Address";
import { Button } from "@/app/components/Button";
import { Tooltip } from "@/app/components/Tooltip";

interface Properties {
	profile: Contracts.IProfile;
	contact: Contracts.IContact;
	onSend: (address: Contracts.IContactAddress) => void;
	options: ContactListItemOption[];
	onAction: (action: ContactListItemOption) => void;
	hasBalance: boolean;
}

export const ContactListItemMobile: React.VFC<Properties> = ({
	contact,
	onSend,
	options,
	onAction,
	hasBalance,
	profile,
}) => {
	const { t } = useTranslation();

	const profileAvailableNetworks = useNetworks({ profile });

	const sendIsDisabled = useMemo(() => {
		if (!hasBalance) {
			return true;
		}

		return false;
	}, [hasBalance, profileAvailableNetworks]);

	const renderAddress = useCallback(
		(address: Contracts.IContactAddress) => <Address address={address.address()} size="sm" showCopyButton />,
		[hasBalance, onSend],
	);

	return (
		<tr data-testid="ContactListItemMobile">
			<td className="pt-3">
				<MobileTableElement
					title={contact.name()}
					titleExtra={
						<div className="flex gap-3 items-center">
							<Tooltip content={hasBalance ? "" : t("CONTACTS.VALIDATION.NO_BALANCE")}>
								<Button
									disabled={sendIsDisabled}
									variant="transparent"
									onClick={(e) => {
										e.stopPropagation();
										onSend(contact.addresses().first());
									}}
									className="p-0 text-sm hover:underline text-theme-primary-600 dark:hover:text-theme-primary-500 hover:text-theme-primary-700"
									data-testid="ContactListItemMobileAddress__send-button"
								>
									{t("COMMON.SEND")}
								</Button>
							</Tooltip>

							<span className="block w-px h-5 bg-theme-secondary-300 dark:bg-theme-secondary-800" />

							<Dropdown
								toggleContent={
									<button type="button" className="flex text-theme-secondary-700">
										<Icon name="EllipsisVerticalFilled" size="md" />
									</button>
								}
								options={options}
								onSelect={(action: ContactListItemOption) => onAction(action)}
							/>
						</div>
					}
				>
					<MobileTableElementRow title={t("COMMON.ADDRESS")}>
						<div data-testid="ContactListItemMobile__addresses" className="space-y-3 w-full">
							{contact
								.addresses()
								.values()
								.map((element) => renderAddress(element))}
						</div>
					</MobileTableElementRow>
				</MobileTableElement>
			</td>
		</tr>
	);
};
