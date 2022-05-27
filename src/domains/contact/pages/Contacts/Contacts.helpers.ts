import { useMemo } from "react";
import { FilteredContactsProperties } from "./Contacts.contracts";
import { useNetworkOptions } from "@/app/hooks";
import { assertNetwork } from "@/utils/assertions";

export const useFilteredContacts = ({ contacts, query, profile }: FilteredContactsProperties) => {
	const { networkById } = useNetworkOptions({ profile });

	const filteredContacts = useMemo(() => {
		if (query.length === 0) {
			return contacts;
		}

		return contacts.filter((contact) => {
			const identifiers = [contact.name().toLowerCase()];

			for (const address of contact.addresses().values()) {
				const network = networkById(address.network());

				assertNetwork(network);

				identifiers.push(address.address().toLowerCase());
			}

			return identifiers.some((identifier: string) => identifier.includes(query.toLowerCase()));
		});
	}, [contacts, networkById, query]);

	return { filteredContacts };
};
