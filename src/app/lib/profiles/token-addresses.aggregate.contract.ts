import { Services } from "@/app/lib/mainsail";

import { TokenAddressesDTOCollection } from "@/app/lib/mainsail/token-addresses-dto.collection";

export type TokenAddressesQuery = {
	addresses: string[];
} & Services.ClientPagination;

/**
 * Defines the implementation contract for the token addresses aggregate.
 *
 * @export
 * @interface ITokenAddressesAggregate
 */
export interface ITokenAddressesAggregate {
	/**
	 * Aggregate tokens for the given addresses.
	 *
	 * @param {TokenAddressesQuery} query
	 * @return {Promise<TokenAddressesDTOCollection>}
	 * @memberof ITokenAddressesAggregate
	 */
	all(query: TokenAddressesQuery): Promise<TokenAddressesDTOCollection>;

	/**
	 * Remove all token addresses that have been aggregated.
	 *
	 * @memberof ITokenAddressesAggregate
	 */
	flush(): void;
}
