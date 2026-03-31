import { Contracts } from "@/app/lib/profiles";
import { useCallback, useMemo } from "react";

export interface AddressProperties {
	id: string;
	address: string;
	alias?: string;
	network?: string;
	avatar: string;
	type: string;
}

interface ProfileAddressesProperties {
	profile: Contracts.IProfile;
}

export const useProfileAddresses = ({ profile }: ProfileAddressesProperties) => {
	const contacts = profile.contacts().values();
	const profileWallets = profile.wallets().values();

	const profileAddresses = useMemo(() => {
		const profileAddresses: AddressProperties[] = [];

		for (const wallet of profileWallets) {
			const address = {
				address: wallet.address(),
				alias: wallet.alias(),
				avatar: wallet.avatar(),
				id: wallet.id(),
				network: wallet.network().id(),
				type: "wallet",
			};

			profileAddresses.push(address);
		}

		return profileAddresses;
	}, [profileWallets]);

	const getContactAddresses = useCallback(
		(profileAddresses: AddressProperties[]) => {
			const contactAddresses: AddressProperties[] = [];

			for (const contact of contacts) {
				for (const contactAddress of contact.addresses().values()) {
					const addressAlreadyExist = profileAddresses.some(
						({ address }) => address === contactAddress.address(),
					);
					if (addressAlreadyExist) {
						continue;
					}

					const address = {
						address: contactAddress.address(),
						alias: contact.name(),
						avatar: contactAddress.avatar(),
						id: contactAddress.id(),
						type: "contact",
					};

					contactAddresses.push(address);
				}
			}

			return contactAddresses;
		},
		[contacts],
	);

	return useMemo(() => {
		const contactAddresses = getContactAddresses(profileAddresses);

		return {
			allAddresses: [...profileAddresses, ...contactAddresses],
			contactAddresses,
			profileAddresses,
		};
	}, [getContactAddresses, profileAddresses]);
};
