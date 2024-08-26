import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { ContactListItemMobile } from "./ContactListItemMobile";
import { AvailableNetwork } from "@/domains/contact/pages/Contacts";
import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";

interface Properties {
	profile: Contracts.IProfile;
	availableNetworks: AvailableNetwork[];
	options: ContactListItemOption[];
	contacts: Contracts.IContact[];
	onAction: (action: ContactListItemOption, contact: Contracts.IContact) => void;
	onSend: (address: Contracts.IContactAddress) => void;
}

export const ContactListMobile: React.VFC<Properties> = ({
	profile,
	availableNetworks,
	contacts,
	options,
	onAction,
	onSend,
}) => (
	<div className="mt-5" data-testid="ContactListMobile">
		{contacts.map((contact) => (
			<ContactListItemMobile
				profile={profile}
				key={contact.name()}
				contact={contact}
				onSend={onSend}
				options={options}
				onAction={(action) => onAction(action, contact)}
				availableNetworks={availableNetworks}
			/>
		))}
	</div>
);
