import { IContact, IContactAddressInput, IContactData } from "./contracts.js";

/**
 * Defines the implementation contract for the contact repository.
 *
 * @export
 * @interface IContactRepository
 */
export interface IContactRepository {
	/**
	 * Get all keys and values.
	 *
	 * @returns {Record<string, IContact>}
	 * @memberof IContactRepository
	 */
	all(): Record<string, IContact>;

	/**
	 * Get the first contact.
	 *
	 * @returns {IContact}
	 * @memberof IContactRepository
	 */
	first(): IContact;

	/**
	 * Get the last contact.
	 *
	 * @returns {IContact}
	 * @memberof IContactRepository
	 */
	last(): IContact;

	/**
	 * Get all keys.
	 *
	 * @returns {string[]}
	 * @memberof IContactRepository
	 */
	keys(): string[];

	/**
	 * Get all values.
	 *
	 * @returns {IContact[]}
	 * @memberof IContactRepository
	 */
	values(): IContact[];

	/**
	 * Create a new contact.
	 *
	 * @param {string} name
	 * @param {IContactAddressInput[]} addresses
	 * @returns {IContact}
	 * @memberof IContactRepository
	 */
	create(name: string, addresses: IContactAddressInput[]): IContact;

	/**
	 * Fill the storage with contact data.
	 *
	 * @param {Record<string, IContactData>} contacts
	 * @memberof IContactRepository
	 */
	fill(contacts: Record<string, IContactData>): void;

	/**
	 * Find a contact by its ID.
	 *
	 * @param {string} id
	 * @returns {IContact}
	 * @memberof IContactRepository
	 */
	findById(id: string): IContact;

	/**
	 * Update a contact.
	 *
	 * @param {string} id
	 * @param {{ name?: string; addresses?: IContactAddressInput[] }} data
	 * @returns {void}
	 * @memberof IContactRepository
	 */
	update(id: string, data: { name?: string; addresses?: IContactAddressInput[] }): void;

	/**
	 * Remove a contact by its ID.
	 *
	 * @param {string} id
	 * @memberof IContactRepository
	 */
	forget(id: string): void;

	/**
	 * Remove all contacts.
	 *
	 * @memberof IContactRepository
	 */
	flush(): void;

	/**
	 * Count how many contacts there are.
	 *
	 * @returns {number}
	 * @memberof IContactRepository
	 */
	count(): number;

	/**
	 * Find many contacts by their address.
	 *
	 * @param {string} value
	 * @returns {IContact[]}
	 * @memberof IContactRepository
	 */
	findByAddress(value: string): IContact[];

	/**
	 * Find many contacts by their coin.
	 *
	 * @param {string} value
	 * @returns {IContact[]}
	 * @memberof IContactRepository
	 */
	findByCoin(value: string): IContact[];

	/**
	 * Turn the contacts into a normalised object.
	 *
	 * @returns {Record<string, IContactData>}
	 * @memberof IContactRepository
	 */
	toObject(): Record<string, IContactData>;
}
