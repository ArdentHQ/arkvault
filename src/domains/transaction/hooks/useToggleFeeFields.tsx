import { useEffect } from "react";
import { GasLimit, MIN_GAS_PRICE } from "@/domains/transaction/components/FeeField/FeeField";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useFormContext } from "react-hook-form";
import { useValidation } from "@/app/hooks";

interface Properties {
	wallet?: Contracts.IReadWriteWallet;
	activeTab: number;
	gasLimitType: keyof typeof GasLimit;
	form: ReturnType<typeof useFormContext>;
}

export const useToggleFeeFields = ({ wallet, activeTab, gasLimitType, form }: Properties) => {
	const { register, unregister, getValues } = form;

	const { common } = useValidation();

	useEffect(() => {
		const walletBalance = wallet?.balance() ?? 0;

		// unregister fee fields when active step is FormStep
		if (activeTab === 1) {
			unregister(["gasPrice", "gasLimit"]);
		} else if (activeTab === 2) {
			register("gasPrice", common.gasPrice(walletBalance, getValues, MIN_GAS_PRICE, wallet?.network()));
			register("gasLimit", common.gasLimit(walletBalance, getValues, GasLimit[gasLimitType], wallet?.network()));
		}
	}, [activeTab, wallet, common]);
};
