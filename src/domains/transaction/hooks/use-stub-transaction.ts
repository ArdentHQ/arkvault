import { DTO } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useState } from "react";

export const useIpfsStubTransaction = ({
	fee,
	hash,
	wallet,
}: {
	fee: number;
	hash: string;
	wallet: Contracts.IReadWriteWallet;
}) => {
	const [ipfsStubTransaction, setIpfsStubTransaction] = useState<DTO.RawTransactionData>();

	useEffect(() => {
		const createIpfsStubTransaction = async ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
			try {
				const stub = await wallet
					.coin()
					.transaction()
					.ipfs({
						data: { hash },
						fee,
						nonce: "1",
						signatory: await wallet.signatory().secret("123"),
					});

				setIpfsStubTransaction(stub);
			} catch {
				//
			}
		};

		createIpfsStubTransaction({ wallet });
	}, [fee, hash, wallet]);

	return {
		ipfsStubTransaction,
	};
};


export const useMusigRegistrationStubTransaction = ({
	fee,
	wallet,
	min,
	publicKeys = []
}: {
	fee: number;
	min: number;
	publicKeys: string[];
	wallet: Contracts.IReadWriteWallet;
}) => {
	const [musigRegistrationStubTransaction, setMusigRegistrationStubTransaction] = useState<DTO.RawTransactionData>();

	const publicKeysLength = publicKeys.length
	useEffect(() => {
		const createStub = async ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
			console.log({ publicKeys1: publicKeys })
			try {
				const stub = await wallet
					.coin()
					.transaction()
					.multiSignature({
						data: {
							min,
							publicKeys,
						},
						fee,
						nonce: "1",
						signatory: await wallet.signatory().secret("123"),
					});

				setMusigRegistrationStubTransaction(stub);
			} catch (error) {
				console.log({ error })
				//
			}
		};

		createStub({ wallet });
	}, [fee, wallet, publicKeysLength, min]);


	return {
		musigRegistrationStubTransaction,
	};
};

