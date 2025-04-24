import { Contracts } from "@/app/lib/profiles";

export const isFullySynced = (wallet: Contracts.IReadWriteWallet): boolean =>
	wallet.hasBeenFullyRestored() && (wallet.hasSyncedWithNetwork() || wallet.balance() === 0);
