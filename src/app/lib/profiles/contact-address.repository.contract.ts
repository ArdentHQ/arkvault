import { IContactAddress, IContactAddressData, IContactAddressInput } from "./contracts.js";

/**
 * Defines the implementation contract for the contact address repository.
 *
 * @export
 * @interface IContactAddressRepository
 */
export interface IContactAddressRepository {
	/**
	 * Get all keys and values.
	 *
	 * @returns {Record<string, IContactAddress>}
	 * @memberof IContactAddressRepository
	 */
	all(): Record<string, IContactAddress>;

	/**
	 * Get the first entry.
	 *
	 * @returns {IContactAddress}
	 * @memberof IContactAddressRepository
	 */
	first(): IContactAddress;

	/**
	 * Get the last entry.
	 *
	 * @returns {IContactAddress}
	 * @memberof IContactAddressRepository
	 */
	last(): IContactAddress;

	/**
	 * Get all keys.
	 *
	 * @returns {string[]}
	 * @memberof IContactAddressRepository
	 */
	keys(): string[];

	/**
	 * Get all values.
	 *
	 * @returns {IContactAddress[]}
	 * @memberof IContactAddressRepository
	 */
	values(): IContactAddress[];

	/**
	 * Create a new contact address.
	 *
	 * @param {IContactAddressInput} data
	 * @returns {IContactAddress}
	 * @memberof IContactAddressRepository
	 */
	create(data: IContactAddressInput): IContactAddress;

	/**
	 * Fill a dump of contact addresses into the storage.
	 *
	 * @param {IContactAddressData[]} addresses
	 * @returns {void}
	 * @memberof IContactAddressRepository
	 */
	fill(addresses: IContactAddressData[]): void;

	/**
	 * Find a contact address by its id.
	 *
	 * @param {string} id
	 * @returns {IContactAddress}
	 * @memberof IContactAddressRepository
	 */
	findById(id: string): IContactAddress;

	/**
	 * Find many contact addresses by their address.
	 *
	 * @param {string} value
	 * @returns {IContactAddress[]}
	 * @memberof IContactAddressRepository
	 */
	findByAddress(value: string): IContactAddress[];

	/**
	 * Find many contact addresses by their coin.
	 *
	 * @param {string} value
	 * @returns {IContactAddress[]}
	 * @memberof IContactAddressRepository
	 */
	findByCoin(value: string): IContactAddress[];

	/**
	 * Check if an item exists with the same coin, and address.
	 *
	 * @param {IContactAddressInput} value
	 * @return {boolean}
	 * @memberOf IContactAddressRepository
	 */
	exists(value: IContactAddressInput): boolean;

	/**
	 * Update a contact address by its id.
	 *
	 * @param {string} id
	 * @param {Record<string, string>} data
	 * @memberof IContactAddressRepository
	 */
	update(id: string, data: Record<string, string>): void;

	/**
	 * Delete a contact address by its id.
	 *
	 * @param {string} id
	 * @memberof IContactAddressRepository
	 */
	forget(id: string): void;

	/**
	 * Delete all contact addresses.
	 *
	 * @memberof IContactAddressRepository
	 */
	flush(): void;

	/**
	 * Count how many contact addresses there are.
	 *
	 * @returns {number}
	 * @memberof IContactAddressRepository
	 */
	count(): number;

	/**
	 * Return all contact addresses as normalised objects.
	 *
	 * @returns {IContactAddressData[]}
	 * @memberof IContactAddressRepository
	 */
	toArray(): IContactAddressData[];
}
