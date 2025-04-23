import { BigNumber } from "@/app/lib/helpers";
import { IProfile, IWalletAggregate } from "./contracts.js";

type NetworkType = "live" | "test";

export class WalletAggregate implements IWalletAggregate {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IWalletAggregate.balance} */
	public balance(networkType: NetworkType = "live"): number {
		return +this.balancesByNetworkType()[networkType].toHuman();
	}

	/** {@inheritDoc IWalletAggregate.balancesByNetworkType} */
	public balancesByNetworkType(): Record<NetworkType, BigNumber> {
		const totals: Record<NetworkType, BigNumber> = {
			live: BigNumber.ZERO,
			test: BigNumber.ZERO,
		};

		// works directly on the iterator
		for (const wallet of this.#profile.wallets().values()) {
			const networkType: NetworkType = wallet.network().isLive() ? "live" : "test";
			totals[networkType] = totals[networkType].plus(wallet.balance());
		}

		return totals;
	}

	/** {@inheritDoc IWalletAggregate.convertedBalance} */
	public convertedBalance(): number {
		let total = BigNumber.ZERO;

		// same here—no .reduce, just loop
		for (const wallet of this.#profile.wallets().valuesWithCoin()) {
			total = total.plus(wallet.convertedBalance());
		}

		return total.toNumber();
	}

	/** {@inheritDoc IWalletAggregate.balancePerCoin} */
	public balancePerCoin(networkType: NetworkType = "live"): Record<string, { total: string; percentage: string }> {
		const result: Record<string, { total: string; percentage: string }> = {};
		const totalByProfile = this.balance(networkType);
		const walletsByCoin = this.#profile.wallets().allByCoin();

		for (const [coin, wallets] of Object.entries(walletsByCoin)) {
			const matchingWallets = Object.values(wallets).filter(
				(w) => w.network().isLive() === (networkType === "live"),
			);

			if (matchingWallets.length > 0) {
				let totalByCoin = BigNumber.ZERO;
				for (const w of matchingWallets) {
					totalByCoin = totalByCoin.plus(w.balance());
				}

				result[coin] = {
					// exactly as before
					percentage:
						totalByProfile === 0 ? "0.00" : totalByCoin.divide(totalByProfile).times(100).toFixed(2),
					total: totalByCoin.toString(),
				};
			}
		}

		return result;
	}
}
