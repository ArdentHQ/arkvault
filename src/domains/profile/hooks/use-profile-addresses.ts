import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
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
	network?: Networks.Network;
}

const isMultiSignature = (wallet: Contracts.IReadWriteWallet) => {
	try {
		return wallet.isMultiSignature();
	} catch {
		/* istanbul ignore next -- @preserve */
		return false;
	}
};

export const useProfileAddresses = (
	{ profile, network }: ProfileAddressesProperties,
	exceptMultiSignature?: boolean,
) => {
	const contacts = profile.contacts().values();
	const profileWallets = profile.wallets().values();

	const isNetworkSelected = useCallback(
		(addressNetwork: string) => {
			if (!network) {
				return true;
			}

			return addressNetwork === network.id();
		},
		[network],
	);

	const profileAddresses = useMemo(() => {
		const profileAddresses: AddressProperties[] = [];

		for (const wallet of profileWallets) {
			if (!isNetworkSelected(wallet.network().id())) {
				continue;
			}

			if (exceptMultiSignature && isMultiSignature(wallet)) {
				continue;
			}

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
	}, [exceptMultiSignature, isNetworkSelected, profileWallets]);

	const getContactAddresses = useCallback(
		(profileAddresses: AddressProperties[]) => {
			const contactAddresses: AddressProperties[] = [];

			for (const contact of contacts) {
				for (const contactAddress of contact.addresses().values()) {
					if (!isNetworkSelected(contactAddress.network())) {
						continue;
					}

					if (exceptMultiSignature) {
						continue;
					}

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
						network: contactAddress.network(),
						type: "contact",
					};

					contactAddresses.push(address);
				}
			}

			return contactAddresses;
		},
		[contacts, exceptMultiSignature, isNetworkSelected],
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
