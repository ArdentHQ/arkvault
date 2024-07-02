import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { ContactListItemOption } from "@/domains/contact/components/ContactListItem/ContactListItem.contracts";
import { AvailableNetwork } from "@/domains/contact/pages/Contacts";

import { ContactListItemMobile } from "./ContactListItemMobile";

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
	<div className="mt-8" data-testid="ContactListMobile">
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
