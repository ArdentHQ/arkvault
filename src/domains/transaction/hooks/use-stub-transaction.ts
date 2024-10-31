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
	publicKeys = [],
}: {
	fee: number;
	min: number;
	publicKeys: string[];
	wallet: Contracts.IReadWriteWallet;
}) => {
	const [musigRegistrationStubTransaction, setMusigRegistrationStubTransaction] = useState<DTO.RawTransactionData>();

	useEffect(() => {
		const createStub = async ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
			try {
				const stub = await wallet
					.coin()
					.transaction()
					.multiSignature({
						data: {
							min,
							publicKeys,
							senderPublicKey: wallet.publicKey(),
						},
						fee,
						nonce: "1",
						signatory: await wallet.coin().signatory().multiSignature({
							min,
							publicKeys,
						}),
					});

				setMusigRegistrationStubTransaction(stub);
			} catch {
				//
			}
		};

		if (!musigRegistrationStubTransaction) {
			createStub({ wallet });
		}

	}, [fee, wallet, publicKeys, min]);

	return {
		musigRegistrationStubTransaction,
	};
};
