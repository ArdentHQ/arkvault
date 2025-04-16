import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";

import { useMusigGeneratedWallet } from "@/domains/transaction/hooks/use-musig-generated-wallet";
import { AddressCopy, AddressLabel, AddressLink } from "@/app/components/Address";

export const MusigGeneratedAddress = ({
	publicKeys,
	wallet,
	min,
	useExploreLink,
}: {
	publicKeys: string[];
	min?: number;
	wallet: Contracts.IReadWriteWallet;
	useExploreLink?: boolean;
}) => {
	const { generatedWallet: genWallet } = useMusigGeneratedWallet({ min, publicKeys, wallet });
	const generatedWallet = genWallet as Contracts.IReadWriteWallet | undefined;

	if (!generatedWallet) {
		return <></>;
	}

	return (
		<div className="flex space-x-2" data-testid="MusigGeneratedAddress">
			{!useExploreLink && <AddressLabel>{generatedWallet.address()}</AddressLabel>}
			{useExploreLink && (
				<AddressLink explorerLink={generatedWallet.explorerLink()}>
					<div className="leading-5">{generatedWallet.address()}</div>
				</AddressLink>
			)}
			<AddressCopy address={generatedWallet.address()} />
		</div>
	);
};
