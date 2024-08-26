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

	const { isExpanded, handleHeaderClick } = useAccordion();

	return (
		<AccordionWrapper>
			<AccordionHeader isExpanded={isExpanded} onClick={handleHeaderClick} className={twMerge("px-6", isExpanded ? "pt-4 pb-3" : "py-4")}>
				<div className="flex w-0 flex-grow items-center justify-between space-x-3">
					<span className="truncate leading-[20px] font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
						{contact.name()}
					</span>

					<div className="ml-5 flex items-center space-x-3">
						<Dropdown
							dropdownClass="mx-4 sm:mx-0"
							toggleContent={
								<button
									type="button"
									className="flex text-theme-gray-700 dark:text-theme-secondary-500"
								>
									<Icon name="EllipsisVerticalFilled" size="lg" />
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
