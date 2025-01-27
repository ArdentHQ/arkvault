import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction"
import { BigNumber } from "@ardenthq/sdk-helpers"
import { Contracts, Environment } from "@ardenthq/sdk-profiles"
import { IProfile } from "@ardenthq/sdk-profiles/distribution/esm/profile.contract"
import { IReadWriteWallet } from "@ardenthq/sdk-profiles/distribution/esm/wallet.contract"
import { useConfiguration, useEnvironmentContext } from "@/app/contexts";
import { useEffect } from "react"

interface PortfolioConfiguration {
	selectedAddresses: string[]
}

function Balance({ wallets }: { wallets: IReadWriteWallet[] }) {
	return {
		total(): BigNumber {
			let balance = BigNumber.make(0)
			for (const wallet of wallets) {
				balance = balance.plus(wallet.balance())
			}

			return balance
		},
		totalConverted(): BigNumber {
			let balance = BigNumber.make(0)
			for (const wallet of wallets) {
				balance = balance.plus(wallet.convertedBalance())
			}

			return balance
		}
	}
}

function SelectedAddresses({ profile, env }: { profile: IProfile, env: Environment }) {
	return {
		all(): string[] {
			const config = profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration, { selectedAddresses: [] }) as PortfolioConfiguration
			return config.selectedAddresses ?? []
		},
		async set(selectedAddresses: string[]): Promise<void> {
			profile.settings().set(Contracts.ProfileSetting.DashboardConfiguration, { selectedAddresses });
			await env.profiles().persist(profile)
		},
		toWallets() {
			const selected = this.all()

			const wallets = profile
				.wallets()
				.values()
				.filter((wallet) => selected.includes(wallet.address()));

			if (wallets.length === 0) {
				// TODO: Define default active wallet none are selected.
				return [profile.wallets().first()];
			}

			return wallets;
		}
	}
}

export const usePortfolio = ({ profile }: { profile: Contracts.IProfile }) => {
	const { env } = useEnvironmentContext()
	const { selectedAddresses, setConfiguration } = useConfiguration();

	const addresses = SelectedAddresses({ env, profile })

	const wallets = addresses.toWallets()
	const balance = Balance({ wallets })

	useEffect(() => {
		setConfiguration({ selectedAddresses: addresses.all() })
	}, [])

	return {
		balance,
		selectedAddresses,
		selectedWallet: wallets.length === 1 ? wallets.at(0) : undefined,
		selectedWallets: wallets,
		setSelectedAddresses: async (selectedAddresses: string[]) => {
			setConfiguration({ selectedAddresses })
			await addresses.set(selectedAddresses)
		}
	}
}
