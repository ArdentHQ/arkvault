import { Contracts } from "@payvo/sdk-profiles";

export const isFullySynced = (wallet: Contracts.IReadWriteWallet): boolean =>
	wallet.hasBeenFullyRestored() && (wallet.hasSyncedWithNetwork() || wallet.balance() === 0);
