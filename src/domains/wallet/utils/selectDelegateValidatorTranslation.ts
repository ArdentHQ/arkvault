import { Networks } from "@ardenthq/sdk";

interface Properties {
	network: Networks.Network;
	validatorStr: string;
	delegateStr: string;
}

export const selectDelegateValidatorTranslation = ({ network, validatorStr, delegateStr }: Properties): string => network.coinName() === "Mainsail" ? validatorStr : delegateStr;



