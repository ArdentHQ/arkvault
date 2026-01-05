import { IProfile, ITokenAddressesAggregate, TokenAddressesQuery } from "./contracts.js";
import { ClientService } from "@/app/lib/mainsail/client.service";
import { TokenAddressesDTOCollection } from "@/app/lib/mainsail/token-addresses-dto.collection";

export class TokenAddressesAggregate implements ITokenAddressesAggregate {
	readonly #profile: IProfile;
	#history: Record<string, TokenAddressesDTOCollection> = {};

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc ITokenAddressesAggregate.all} */
	public async all(query: TokenAddressesQuery): Promise<TokenAddressesDTOCollection> {
		const historyRecords = this.#history;

		const historyKeys: string[] = [];

		historyKeys.push(...query.addresses);

		historyKeys.sort((a, b) => a.localeCompare(b));

		query.orderBy && historyKeys.push(query.orderBy);
		query.limit && historyKeys.push(query.limit.toString());

		const historyKey = historyKeys.join("-");

		const historyRecord = historyRecords[historyKey];

		if (historyRecord && historyRecord.nextPage()) {
			query = { ...query, cursor: historyRecord.nextPage() };
		}

		let response: TokenAddressesDTOCollection;

		const clientService = new ClientService({
			config: this.#profile.activeNetwork().config(),
			profile: this.#profile,
		});

		try {
			response = await clientService.tokenAddresses(query);
		} catch {
			return new TokenAddressesDTOCollection([], {
				last: undefined,
				next: 0,
				prev: undefined,
				self: undefined,
			});
		}

		historyRecords[historyKey] = response;

		return new TokenAddressesDTOCollection(response.items(), {
			last: undefined,
			next: Number(response.nextPage()),
			prev: undefined,
			self: undefined,
		});
	}

	/** {@inheritDoc ITokenAddressesAggregate.flush} */
	public flush(): void {
		this.#history = {};
	}
}
