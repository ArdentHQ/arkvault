// TODO: Cleanup and move the rest to profile settings.
export interface DashboardConfiguration {
	hideBalance: boolean;
	walletsDisplayType?: "all" | "starred" | "ledger";
	selectedAddressesByNetwork: Record<string, string[]>;
	selectedAddresses: string[];
	activeNetworkId?: string;
}
