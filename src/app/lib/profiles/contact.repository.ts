import { UUID } from "@ardenthq/sdk-cryptography";

import { Contact } from "./contact.js";
import {
	IContact,
	IContactAddress,
	IContactAddressInput,
	IContactData,
	IContactRepository,
	IProfile,
} from "./contracts.js";
import { DataRepository } from "./data.repository";

export class ContactRepository implements IContactRepository {
	readonly #profile: IProfile;
	readonly #data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IContactRepository.all} */
	public all(): Record<string, IContact> {
		return this.#data.all() as Record<string, IContact>;
	}

	/** {@inheritDoc IContactRepository.first} */
	public first(): IContact {
		return this.#data.first();
	}

	/** {@inheritDoc IContactRepository.last} */
	public last(): IContact {
		return this.#data.last();
	}

	/** {@inheritDoc IContactRepository.keys} */
	public keys(): string[] {
		return this.#data.keys();
	}

	/** {@inheritDoc IContactRepository.values} */
	public values(): IContact[] {
		return this.#data.values();
	}

	/** {@inheritDoc IContactRepository.create} */
	public create(name: string, addresses: IContactAddressInput[]): IContact {
		const contacts: IContact[] = this.values();

		for (const contact of contacts) {
			if (contact.name().toLowerCase() === name.toLowerCase()) {
				throw new Error(`The contact [${name}] already exists.`);
			}
		}

		const id: string = UUID.random();

		const result: IContact = new Contact({ id, name, starred: false }, this.#profile);

		result.setAddresses(addresses);

		this.#data.set(id, result);

		this.#profile.status().markAsDirty();

		return result;
	}

	/** {@inheritDoc IContactRepository.findById} */
	public findById(id: string): IContact {
		const contact: IContact | undefined = this.#data.get(id);

		if (!contact) {
			throw new Error(`Failed to find a contact for [${id}].`);
		}

		return contact;
	}

	/** {@inheritDoc IContactRepository.update} */
	public update(id: string, data: { name?: string; addresses?: IContactAddressInput[] }): void {
		const result = this.findById(id);

		if (data.name) {
			const contacts: IContact[] = this.values();

			for (const contact of contacts) {
				if (contact.id() === id) {
					continue;
				}

				if (contact.name().toLowerCase() === data.name.toLowerCase()) {
					throw new Error(`The contact [${data.name}] already exists.`);
				}
			}

			result.setName(data.name);
		}

		if (data.addresses) {
			result.setAddresses(data.addresses);
		}

		this.#data.set(id, result);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IContactRepository.forget} */
	public forget(id: string): void {
		this.findById(id);

		this.#data.forget(id);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IContactRepository.flush} */
	public flush(): void {
		this.#data.flush();

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IContactRepository.count} */
	public count(): number {
		return this.keys().length;
	}

	/** {@inheritDoc IContactRepository.findByAddress} */
	public findByAddress(value: string): IContact[] {
		return this.#findByColumn("address", value);
	}

	/** {@inheritDoc IContactRepository.findByCoin} */
	public findByCoin(value: string): IContact[] {
		return this.#findByColumn("coin", value);
	}

	/** {@inheritDoc IContactRepository.toObject} */
	public toObject(): Record<string, IContactData> {
		const result: Record<string, IContactData> = {};

		for (const [id, contact] of Object.entries(this.#data.all() as Record<string, IContact>)) {
			result[id] = contact.toObject();
		}

		return result;
	}

	/** {@inheritDoc IContactRepository.fill} */
	public fill(contacts: Record<string, IContactData>): void {
		for (const [id, contactData] of Object.entries(contacts)) {
			const contact: IContact = new Contact(contactData, this.#profile);

			contact.addresses().fill(contactData.addresses);

			this.#data.set(id, contact);
		}
	}

	#findByColumn(column: string, value: string): IContact[] {
		const result: IContact[] = [];

		for (const contact of Object.values(this.all())) {
			const match: IContactAddress | undefined = contact
				.addresses()
				.values()
				.find((address: IContactAddress) => address[column]() === value);

			if (match) {
				result.push(contact);
			}
		}

		return result;
	}
}
