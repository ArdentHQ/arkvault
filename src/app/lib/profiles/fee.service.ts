import { Services } from "@/app/lib/mainsail";

import { IProfile } from "./contracts.js";
import { DataRepository } from "./data.repository.js";

export class ProfileFeeService {
	readonly #dataRepository: DataRepository = new DataRepository();

	/** {@inheritDoc IFeeService.all} */
	public all(network: string): Services.TransactionFees {
		const result: Services.TransactionFees | undefined = this.#dataRepository.get(`${network}.fees`);

		if (result === undefined) {
			throw new Error(
				`The fees for [${network}] have not been synchronized yet. Please call [syncFees] before using this method.`,
			);
		}

		return result;
	}

	/** {@inheritDoc IFeeService.findByType} */
	public findByType(network: string, type: string): Services.TransactionFee {
		return this.all(network)[type];
	}

	/** {@inheritDoc IFeeService.sync} */
	public async sync(profile: IProfile): Promise<void> {
		this.#dataRepository.set(`${profile.activeNetwork().id()}.fees`, await profile.activeNetwork().fees().all());
	}
}
