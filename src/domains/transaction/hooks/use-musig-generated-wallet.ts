import { useEffect, useState } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { Enums } from "@ardenthq/sdk";

export const useMusigGeneratedWallet = ({ wallet, publicKeys, min }: { publicKeys: string[], wallet: Contracts.IReadWriteWallet, min?: number }) => {
	const [generatedWallet, setGeneratedWallet] = useState<Contracts.IReadWriteWallet>();

	const generate = async (address: string) => await wallet.profile().walletFactory().fromAddress({
		address,
		coin: wallet.network().coin(),
		network: wallet.network().id()
	})

	useEffect(() => {
		const generateAddressFromMusig = async () => {
			if (!wallet.network().allows(Enums.FeatureFlag.AddressMultiSignature)) {
				setGeneratedWallet(await generate(wallet.address()));
				return;
			}

			const { address } = await wallet
				.coin()
				.address()
				.fromMultiSignature({ min, publicKeys });


			const generatedWallet = await generate(address)

			setGeneratedWallet(generatedWallet);
		};

		generateAddressFromMusig();
	}, [wallet, publicKeys, min]);

	return {
		generatedWallet
	}
}
