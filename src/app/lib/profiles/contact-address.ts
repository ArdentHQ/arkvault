import { IContactAddress, IContactAddressData, IProfile } from "./contracts.js";
import { Avatar } from "./helpers/avatar.js";

export class ContactAddress implements IContactAddress {
	readonly #profile: IProfile;
	readonly #data: IContactAddressData;

	public constructor(data: IContactAddressData, profile: IProfile) {
		this.#data = data;
		this.#profile = profile;
	}

	/** {@inheritDoc IContactAddress.id} */
	public id(): string {
		return this.#data.id;
	}

	/** {@inheritDoc IContactAddress.coin} */
	public coin(): string {
		return this.#data.coin;
	}

	/** {@inheritDoc IContactAddress.address} */
	public address(): string {
		return this.#data.address;
	}

	/** {@inheritDoc IContactAddress.avatar} */
	public avatar(): string {
		return Avatar.make(this.address());
	}

	/** {@inheritDoc IContactAddress.toObject} */
	public toObject(): IContactAddressData {
		return {
			address: this.address(),
			coin: this.coin(),
			id: this.id(),
		};
	}

	/** {@inheritDoc IContactAddress.setAddress} */
	public setAddress(address: string): void {
		this.#data.address = address;

		this.#profile.status().markAsDirty();
	}
}
