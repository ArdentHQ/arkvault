import { UUID } from "@ardenthq/sdk-cryptography";

import { ContactAddress } from "./contact-address.js";
import {
	IContactAddress,
	IContactAddressData,
	IContactAddressInput,
	IContactAddressRepository,
	IProfile,
} from "./contracts.js";
import { DataRepository } from "./data.repository";

export class ContactAddressRepository implements IContactAddressRepository {
	readonly #profile: IProfile;
	readonly #data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IContactAddressRepository.all} */
	public all(): Record<string, IContactAddress> {
		return this.#data.all() as Record<string, IContactAddress>;
	}

	/** {@inheritDoc IContactAddressRepository.first} */
	public first(): IContactAddress {
		return this.#data.first();
	}

	/** {@inheritDoc IContactAddressRepository.last} */
	public last(): IContactAddress {
		return this.#data.last();
	}

	/** {@inheritDoc IContactAddressRepository.keys} */
	public keys(): string[] {
		return this.#data.keys();
	}

	/** {@inheritDoc IContactAddressRepository.values} */
	public values(): IContactAddress[] {
		return this.#data.values();
	}

	/** {@inheritDoc IContactAddressRepository.create} */
	public create(data: IContactAddressInput): IContactAddress {
		const id: string = UUID.random();

		const address: IContactAddress = new ContactAddress({ id, ...data }, this.#profile);

		this.#data.set(id, address);

		this.#profile.status().markAsDirty();

		return address;
	}

	/** {@inheritDoc IContactAddressRepository.fill} */
	public fill(addresses: IContactAddressData[]): void {
		for (const address of addresses) {
			this.#data.set(address.id, new ContactAddress(address, this.#profile));
		}
	}

	/** {@inheritDoc IContactAddressRepository.findById} */
	public findById(id: string): IContactAddress {
		const contact: IContactAddress | undefined = this.#data.get(id);

		if (!contact) {
			throw new Error(`Failed to find an address for [${id}].`);
		}

		return contact;
	}

	/** {@inheritDoc IContactAddressRepository.findByAddress} */
	public findByAddress(value: string): IContactAddress[] {
		return this.#findByColumn("address", value);
	}

	/** {@inheritDoc IContactAddressRepository.findByCoin} */
	public findByCoin(value: string): IContactAddress[] {
		return this.#findByColumn("coin", value);
	}

	/** {@inheritDoc IContactAddressRepository.exists} */
	public exists({ address, coin }: IContactAddressInput): boolean {
		const value = [address, coin].join("");

		for (const item of this.values()) {
			const compareValue = [item.address(), item.coin()].join("");

			if (value === compareValue) {
				return true;
			}
		}

		return false;
	}

	/** {@inheritDoc IContactAddressRepository.update} */
	public update(id: string, data: Record<string, string>): void {
		const address = this.findById(id);

		if (data.address) {
			address.setAddress(data.address);

			this.#data.set(id, address);

			this.#profile.status().markAsDirty();
		}
	}

	/** {@inheritDoc IContactAddressRepository.forget} */
	public forget(id: string): void {
		this.findById(id);

		this.#data.forget(id);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IContactAddressRepository.flush} */
	public flush(): void {
		this.#data.flush();

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IContactAddressRepository.count} */
	public count(): number {
		return this.#data.count();
	}

	/** {@inheritDoc IContactAddressRepository.toArray} */
	public toArray(): IContactAddressData[] {
		const result: IContactAddressData[] = [];

		for (const address of this.values()) {
			result.push(address.toObject());
		}

		return result;
	}

	#findByColumn(column: string, value: string): IContactAddress[] {
		const result: IContactAddress[] = [];

		for (const _ of Object.values(this.all())) {
			const match: IContactAddress | undefined = this.values().find(
				(address: IContactAddress) => address[column]() === value,
			);

			if (match) {
				result.push(match);
			}
		}

		return result;
	}
}
