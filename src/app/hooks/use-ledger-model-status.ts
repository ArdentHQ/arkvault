import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";

export type LedgerModel = Contracts.WalletLedgerModel.NanoS | Contracts.WalletLedgerModel.NanoX;

interface ModelStatusProperties {
	connectedModel?: LedgerModel;
	supportedModels?: LedgerModel[];
}

export const useLedgerModelStatus = ({
	connectedModel,
	supportedModels = [Contracts.WalletLedgerModel.NanoS, Contracts.WalletLedgerModel.NanoX],
}: ModelStatusProperties) => {
	const isLedgerModelSupported = useMemo(() => {
		if (!connectedModel) {
			return false;
		}

		return supportedModels.includes(connectedModel);
	}, [connectedModel, supportedModels]);

	return { isLedgerModelSupported };
};
