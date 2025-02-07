export interface DashboardConfiguration {
	selectedAddresses?: string[];
	selectedAddressesByNetwork: Record<string, string[]>;
	activeNetworkId?: string;
}
