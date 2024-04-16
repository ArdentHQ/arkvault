import { Networks } from "@ardenthq/sdk";
import { isMainsailNetwork } from "@/utils/network-utils";

interface Properties<T extends string | React.ReactNode> {
	network: Networks.Network;
	validatorStr: T;
	delegateStr: T;
}

export const selectDelegateValidatorTranslation = <T extends string | React.ReactNode>({ network, validatorStr, delegateStr }: Properties<T>): T => isMainsailNetwork(network) ? validatorStr : delegateStr;



