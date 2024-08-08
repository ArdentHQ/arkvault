import { Contracts } from "@ardenthq/sdk-profiles";
import { act, renderHook } from "@testing-library/react";
import React from "react";

import { useSearchWallet } from "./use-search-wallet";
import { EnvironmentProvider } from "@/app/contexts/Environment";
import { RecipientProperties } from "@/domains/transaction/components/SearchRecipient/SearchRecipient.contracts";
import { env, getDefaultProfileId } from "@/utils/testing-library";

enum ListType {
	wallets = "wallets",
	recipients = "recipients",
}

let profile: Contracts.IProfile;
let wallets: Contracts.IReadWriteWallet[];
let recipients: RecipientProperties[];

const wrapper = ({ children }: any) => <EnvironmentProvider env={env}>{children}</EnvironmentProvider>;

const getList = (listType: ListType) => {
	if (listType === ListType.wallets) {
		return wallets;
	}

	return recipients;
};

describe("useSearchWallet", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallets = profile.wallets().values();

		recipients = wallets.map((wallet) => ({
			address: wallet.address(),
			alias: wallet.alias(),
			avatar: wallet.avatar(),
			id: wallet.id(),
			network: wallet.networkId(),
			type: "wallet",
		}));
	});

	it.each([ListType.wallets, ListType.recipients])(
		"should return default %s if search keyword is empty",
		(listType) => {
			const defaultList = getList(listType);
			const {
				result: { current },
			} = renderHook(() => useSearchWallet({ wallets: defaultList }), { wrapper });

			const { filteredList } = current;

			expect(defaultList).toHaveLength(filteredList.length);
		},
	);

	it.each([ListType.wallets, ListType.recipients])("should filter %s by address", (listType) => {
		const { result } = renderHook(() => useSearchWallet({ wallets: getList(listType) }), { wrapper });

		expect(result.current.filteredList).toHaveLength(2);

		act(() => {
			result.current.setSearchKeyword("D8rr7B1d");
		});

		const { filteredList } = result.current;

		expect(filteredList).toHaveLength(1);

		const address =
			listType === ListType.wallets
				? (filteredList[0] as Contracts.IReadWriteWallet).address()
				: filteredList[0].address;

		expect(address).toBe("D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD");
	});

	it.each([ListType.wallets, ListType.recipients])("should filter %s by alias", (listType) => {
		const { result } = renderHook(() => useSearchWallet({ profile, wallets: getList(listType) }), { wrapper });

		expect(result.current.filteredList).toHaveLength(2);

		act(() => {
			result.current.setSearchKeyword("Ark Wallet 1");
		});

		const { filteredList } = result.current;

		expect(filteredList).toHaveLength(1);

		const alias =
			listType === ListType.wallets
				? (filteredList[0] as Contracts.IReadWriteWallet).alias()
				: filteredList[0].alias;

		expect(alias).toBe("ARK Wallet 1");
	});

	it.each([ListType.wallets, ListType.recipients])(
		"should not find search %s and turn 'isEmptyResults' to true",
		(listType) => {
			const { result } = renderHook(() => useSearchWallet({ wallets: getList(listType) }), { wrapper });

			expect(result.current.filteredList).toHaveLength(2);
			expect(result.current.isEmptyResults).toBeFalsy();

			act(() => {
				result.current.setSearchKeyword("test");
			});

			const { filteredList, isEmptyResults } = result.current;

			expect(filteredList).toHaveLength(0);
			expect(isEmptyResults).toBeTruthy();
		},
	);
});
