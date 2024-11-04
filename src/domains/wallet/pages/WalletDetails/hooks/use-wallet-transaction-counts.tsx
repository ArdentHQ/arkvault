import { Contracts } from "@ardenthq/sdk-profiles";
import { useEffect, useState } from "react";

type TransactionType = "sent" | "received"

const fetchTransactionsCount = async (wallet: Contracts.IReadWriteWallet, type: TransactionType = "sent"): Promise<{ count: number }> => {
	const response = await wallet.transactionIndex()[type]({ limit: 1 })
	const pagination = response.getPagination()

	return {
		count: Number(pagination.last)
	}
}

export const useWalletTransactionCounts = (wallet: Contracts.IReadWriteWallet) => {
	const [sent, setSent] = useState<number>(0)
	const [received, setReceived] = useState<number>(0)
	const [isFetched, setIsFetched] = useState(false)

	useEffect(() => {
		const fetchAll = async () => {
			const [sent, received] = await Promise.allSettled([
				fetchTransactionsCount(wallet, "sent"),
				fetchTransactionsCount(wallet, "received")
			])

			if (sent.status === 'fulfilled') {
				setSent(sent.value.count)
			}

			if (received.status === "fulfilled") {
				setReceived(received.value.count)
			}

			setIsFetched(true)
		}

		if (!isFetched) {
			fetchAll()
		}

	}, [wallet, isFetched])

	return {
		received,
		sent
	}
};
