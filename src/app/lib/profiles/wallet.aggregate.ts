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
		for (const wallet of this.#profile.wallets().values()) {
			total = total.plus(wallet.convertedBalance());
		}

		return total.toNumber();
	}
}
