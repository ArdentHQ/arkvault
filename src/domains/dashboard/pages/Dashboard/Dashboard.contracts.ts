export interface DashboardConfiguration {
    hideBalance: boolean;
	walletsDisplayType: "all" | "starred" | "ledger";
	selectedNetworkIds: string[];
	selectedAddresses?: string[];
}
