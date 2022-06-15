import { Contracts, Environment } from "@ardenthq/sdk-profiles";

interface ProfileExportOptions {
	excludeEmptyWallets: boolean;
	excludeLedgerWallets: boolean;
}

export const useProfileExport = ({ profile, env }: { profile: Contracts.IProfile; env: Environment }) => {
	const formatExportData = async (filters: ProfileExportOptions) => {
		let password: string | undefined;

		if (profile.usesPassword()) {
			password = profile.password().get();
		}

		return env.profiles().export(
			profile,
			{
				...filters,
				addNetworkInformation: true,
				saveGeneralSettings: true,
			},
			password,
		);
	};

	return { formatExportData };
};
