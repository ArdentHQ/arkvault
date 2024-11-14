import React, { useCallback } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { ContactListItemMobileAddress } from "./ContactListItemMobile.blocks";
import { Icon } from "@/app/components/Icon";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { Dropdown } from "@/app/components/Dropdown";
import { AvailableNetwork } from "@/domains/contact/pages/Contacts";
import { AccordionContent, AccordionHeader, AccordionWrapper } from "@/app/components/Accordion";
import { useAccordion } from "@/app/hooks";
import { Divider } from "@/app/components/Divider";
import { twMerge } from "tailwind-merge";

interface Properties {
	profile: Contracts.IProfile;
	contact: Contracts.IContact;
	onSend: (address: Contracts.IContactAddress) => void;
	options: ContactListItemOption[];
	onAction: (action: ContactListItemOption) => void;
	availableNetworks: AvailableNetwork[];
}

export const ContactListItemMobile: React.VFC<Properties> = ({
	contact,
	onSend,
	options,
	onAction,
	availableNetworks,
	profile,
}) => {
	const renderAddress = useCallback(
		(address: Contracts.IContactAddress) => (
			<ContactListItemMobileAddress
				profile={profile}
				availableNetworks={availableNetworks}
				onSend={() => onSend(address)}
				key={address.address()}
				address={address}
			/>
		),
		[availableNetworks, onSend],
	);

	const { isExpanded, handleHeaderClick } = useAccordion(`${profile.id()}_contact_list_mobile_${contact.id()}`);

	return (
		<AccordionWrapper>
			<AccordionHeader
				isExpanded={isExpanded}
				onClick={handleHeaderClick}
				className={twMerge("px-6", isExpanded ? "pb-3 pt-4" : "py-4")}
			>
				<div className="flex w-0 flex-grow items-center justify-between space-x-3">
					<span className="truncate font-semibold leading-[20px] text-theme-secondary-900 dark:text-theme-secondary-200">
						{contact.name()}
					</span>

					<div className="ml-5 flex items-center space-x-3">
						<Dropdown
							toggleContent={
								<button type="button" className="flex text-theme-secondary-700">
									<Icon name="EllipsisVerticalFilled" size="md" />
								</button>
							}
							options={options}
							onSelect={(action: ContactListItemOption) => onAction(action)}
						/>

						<Divider type="vertical" size="md" />
					</div>
				</div>
			</AccordionHeader>

			{isExpanded && (
				<AccordionContent className="px-6 pb-4">
					<div data-testid="ContactListItemMobile__addresses" className="w-full space-y-3">
						{contact.addresses().values().map(renderAddress)}
					</div>
				</AccordionContent>
			)}
		</AccordionWrapper>
	);
};
