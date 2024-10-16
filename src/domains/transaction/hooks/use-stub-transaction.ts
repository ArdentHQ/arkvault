import { DTO } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles"
import { useEffect, useState } from "react"

export const useIpfsStubTransaction = ({ fee, hash, wallet }: { fee: number, hash: string, wallet: Contracts.IReadWriteWallet }) => {
	const [ipfsStubTransaction, setIpfsStubTransaction] = useState<DTO.RawTransactionData>();

	useEffect(() => {
		const createIpfsStubTransaction = async ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
			try {
				const stub = await wallet.coin().transaction().ipfs({
					data: { hash },
					fee,
					signatory: await wallet.signatory().secret("123")
				})

				setIpfsStubTransaction(stub)
			} catch {
				//
			}
		}

		createIpfsStubTransaction({ wallet })
	}, [fee, hash, wallet])

	return {
		ipfsStubTransaction
	}
}
