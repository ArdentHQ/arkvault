/**
 * Defines the input that is needed for creating a contact address.
 *
 * @export
 * @interface IContactAddressInput
 */
export interface IContactAddressInput {
	coin: string;
	address: string;
}

/**
 * Defines the structure that represents a contact address.
 *
 * @export
 * @interface IContactAddressData
 */
export interface IContactAddressData {
	id: string;
	coin: string;
	address: string;
}

/**
 * Defines the implementation contract for a contact address.
 *
 * @export
 * @interface IContactAddress
 */
export interface IContactAddress {
	/**
	 *
	 *
	 * @returns {string}
	 * @memberof IContactAddress
	 */
	id(): string;

	/**
	 *
	 *
	 * @returns {string}
	 * @memberof IContactAddress
	 */
	coin(): string;

	/**
	 *
	 *
	 * @returns {string}
	 * @memberof IContactAddress
	 */
	address(): string;

	/**
	 *
	 *
	 * @returns {string}
	 * @memberof IContactAddress
	 */
	avatar(): string;

	/**
	 *
	 *
	 * @returns {IContactAddressData}
	 * @memberof IContactAddress
	 */
	toObject(): IContactAddressData;

	/**
	 *
	 *
	 * @param {string} address
	 * @memberof IContactAddress
	 */
	setAddress(address: string): void;
}
