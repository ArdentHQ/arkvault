import { Contracts } from "@ardenthq/sdk-profiles";

export interface WalletsListProperties {
	wallets: Contracts.IReadWriteWallet[];
	itemsPerPage: number;
	showPagination?: boolean;
	className?: string;
}
