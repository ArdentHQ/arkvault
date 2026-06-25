import { useEffect, useState } from "react";
import { BigNumber } from "@/app/lib/helpers";
import { Contracts, } from "@/app/lib/profiles";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

interface RequiresApprovalProperties {
	wallet: Contracts.IReadWriteWallet;
	amount: BigNumber;
	tokenAddress: string;
}

export const useAllowance = ({ wallet, tokenAddress }: RequiresApprovalProperties) => {
	const [isLoading, setIsLoading] = useState(false);
	const [allowance, setAllowance] = useState<BigNumber>(BigNumber.ZERO);

	useEffect(() => {
		const fetchAllowance = async () => {
			setIsLoading(true);
			try {
				const amount = await wallet.client().allowance(wallet.address(), tokenAddress);
				const allowance = UnitConverter.formatUnits(amount.toFixed(0), "ark");
				setAllowance(BigNumber.make(allowance.toFixed(0), allowance.decimalPlaces() ?? undefined));
			} catch (e) {
				// log and ignore error
				console.error(e);
			}

			setIsLoading(false);
		};

		void fetchAllowance();
	}, []);

	return {
		allowance,
		isLoading,
	}
}
