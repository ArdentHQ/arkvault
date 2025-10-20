import React, { useEffect, useState } from "react";
import { Amount } from "@/app/components/Amount";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { BigNumber } from "@/app/lib/helpers";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

const FEE_DISPLAY_VALUE_DECIMALS = 8;

export const TransactionFee = ({ transfer }: { transfer: DraftTransfer }) => {
	const [fee, setFee] = useState<number>(0);

	useEffect(() => {
		const calc = async () => {
			await transfer.calculateFees();
			transfer.selectFee("avg");

			// To human
			const fee = BigNumber.make(calculateGasFee(transfer.selectedFee(), transfer.gasLimit()))
				.decimalPlaces(FEE_DISPLAY_VALUE_DECIMALS)
				.toNumber();

			setFee(fee);
		};

		calc();
	}, []);

	return (
		<>
			<Amount
				ticker={transfer.network().ticker()}
				value={fee}
				className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
			/>
			<span className="text-theme-secondary-700 dark:text-theme-secondary-500">
				(
				<Amount
					ticker={transfer.sender().exchangeCurrency()}
					value={fee}
					className="text-sm leading-[17px] font-semibold sm:text-base sm:leading-5"
				/>
				)
			</span>
		</>
	);
};
