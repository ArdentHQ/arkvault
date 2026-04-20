import React, { useEffect, useState } from "react";
import { Amount } from "@/app/components/Amount";
import { DraftTransfer } from "@/app/lib/mainsail/draft-transfer";

export const TransactionFee = ({ transfer }: { transfer: DraftTransfer }) => {
	const [fee, setFee] = useState<number>(0);

	useEffect(() => {
		const updateFee = async () => {
			await transfer.sender().synchroniser().identity();
			await transfer.calculateFees();

			transfer.selectFee("avg");
			transfer.setSenderMaxAmount();
			setFee(transfer.fee());
		};

		updateFee();
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
