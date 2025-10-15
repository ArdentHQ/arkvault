
import React, { useEffect, useState } from "react";
import { Amount } from "@/app/components/Amount";
import { Networks } from "@/app/lib/mainsail";
import { buildTransferData } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.helpers";
import { GasLimit } from "@/domains/transaction/components/FeeField/FeeField";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { BigNumber } from "@/app/lib/helpers";
import { Contracts } from "@/app/lib/profiles";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useFees } from "@/app/hooks";


const FEE_DISPLAY_VALUE_DECIMALS = 8;

export const TransactionFee = ({
	network,
	profile,
	recipients,
	senderWallet,
}: {
	senderWallet: Contracts.IReadWriteWallet,
	network: Networks.Network
	profile: Contracts.IProfile
	recipients: RecipientItem[]
}) => {

	const { calculate } = useFees(profile);
	const [fee, setFee] = useState<number>(0)

	useEffect(() => {
		const calc = async () => {
			const data = buildTransferData({
				recipients,
			});

			const transactionFees = await calculate({
				coin: network.coin(),
				data,
				network: network.id(),
				type: "transfer",
			});

			const fee = BigNumber.make(calculateGasFee(transactionFees.avg, GasLimit["transfer"]))
				.decimalPlaces(FEE_DISPLAY_VALUE_DECIMALS)
				.toNumber()

			setFee(fee)
		}
		calc()
	}, [])

	return (
		<>
			<Amount
				ticker={network.ticker()}
				value={fee}
				className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
			/>
			<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
				(
				<Amount
					ticker={senderWallet.exchangeCurrency()}
					value={fee}
					className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
				/>
				)
			</span>
		</>
	)
}
