import { useEffect } from "react";
import { Contracts } from "@/app/lib/profiles";
import { useFormContext } from "react-hook-form";
import { useValidation } from "@/app/hooks";

interface Properties {
	wallet?: Contracts.IReadWriteWallet;
	activeTab: number;
	form: ReturnType<typeof useFormContext>;
}

export const useToggleFeeFields = ({ wallet, activeTab, form }: Properties) => {
	const { register, unregister, getValues } = form;

	const { common } = useValidation();

	useEffect(() => {
		const walletBalance = wallet?.balance() ?? 0;

		// unregister fee fields when active step is FormStep
		if (activeTab === 1) {
			unregister(["gasPrice", "gasLimit"]);
		} else if (activeTab === 2) {
			register("gasPrice", common.gasPrice(walletBalance, getValues, wallet?.network()));
			register("gasLimit", common.gasLimit(walletBalance, getValues, wallet?.network()));
		}
	}, [activeTab, wallet, common]);
};
