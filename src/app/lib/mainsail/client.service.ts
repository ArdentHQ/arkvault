/* eslint-disable sonarjs/cognitive-complexity */

import { Collections, Contracts, DTO, IoC, Networks, Services } from "@/app/lib/sdk";
import { DateTime } from "@/app/lib/intl";
import { UsernamesAbi } from "@mainsail/evm-contracts";
import dotify from "node-dotify";

import { decodeFunctionResult, encodeFunctionData } from "viem";

import { TransactionTypes, trimHexPrefix } from "./transaction-type.service";
import { ArkClient } from "@arkecosystem/typescript-client";

type searchParams<T extends Record<string, any> = {}> = T & { page: number; limit?: number };

const wellKnownContracts = {
	consensus: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
	multiPayment: "0x00EFd0D4639191C49908A7BddbB9A11A994A8527",
	username: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
};

export class ClientService extends Services.AbstractClientService {
	readonly #client!: ArkClient;

	public constructor(container: IoC.IContainer) {
		super(container);

		const hostSelector = container.get<Networks.NetworkHostSelector>(IoC.BindingType.NetworkHostSelector);

		const api = hostSelector(container.get(IoC.BindingType.ConfigRepository), "full");
		const evm = hostSelector(container.get(IoC.BindingType.ConfigRepository), "evm");
		const transactions = hostSelector(container.get(IoC.BindingType.ConfigRepository), "tx");

		if (evm) {
			this.#client = new ArkClient({
				api: api.host,
				evm: evm.host,
				transactions: transactions.host,
			});
		}
	}

	public override async transaction(id: string): Promise<Contracts.ConfirmedTransactionData> {
		const body = await this.#client.transactions().get(id);
		return this.dataTransferObjectService.transaction(body.data);
	}

	public override async transactions(
		query: Services.ClientTransactionsInput,
	): Promise<Collections.ConfirmedTransactionDataCollection> {
		const { searchParams } = this.#createSearchParams(query);
		const { limit = 10, page = 1, ...parameters } = searchParams ?? { limit: 10, page: 1 };

		const response = await this.#client.transactions().all(page, limit, parameters);
		return this.dataTransferObjectService.transactions(response.data, this.#createMetaPagination(response));
	}

	public override async wallet(id: Services.WalletIdentifier): Promise<Contracts.WalletData> {
		const body = await this.#client.wallets().get(id.value);

		return this.dataTransferObjectService.wallet(body.data);
	}

	public override async wallets(query: Services.ClientWalletsInput): Promise<Collections.WalletDataCollection> {
		const { searchParams } = this.#createSearchParams(query);
		const { limit = 10, page = 1 } = searchParams ?? { limit: 10, page: 1 };

		const response = await this.#client.wallets().all(page, limit);

		return new Collections.WalletDataCollection(
			response.data.map((wallet) => this.dataTransferObjectService.wallet(wallet)),
			this.#createMetaPagination(response),
		);
	}

	public override async delegate(id: string): Promise<Contracts.WalletData> {
		const body = await this.#client.validators().get(id);
		return this.dataTransferObjectService.wallet(body.data);
	}

	public override async delegates(query?: Contracts.KeyValuePair): Promise<Collections.WalletDataCollection> {
		const { searchParams } = this.#createSearchParams(query ?? {});
		const { limit = 10, page = 1, ...parameters } = searchParams ?? { limit: 10, page: 1 };

		const body = await this.#client.validators().all(page, limit, parameters);

		return new Collections.WalletDataCollection(
			body.data.map((wallet) => this.dataTransferObjectService.wallet(wallet)),
			this.#createMetaPagination(body),
		);
	}

	public override async votes(id: string): Promise<Services.VoteReport> {
		const { data } = await this.#client.wallets().get(id);

		const vote = data.vote || data.attributes?.vote;
		const hasVoted = vote !== undefined;

		return {
			available: hasVoted ? 0 : 1,
			used: hasVoted ? 1 : 0,
			votes: hasVoted
				? [
						{
							amount: 0,
							id: vote,
						},
					]
				: [],
		};
	}

	public override async broadcast(
		transactions: Contracts.SignedTransactionData[],
	): Promise<Services.BroadcastResponse> {
		const transactionToBroadcast: any[] = [];

		for (const transaction of transactions) {
			const data = await transaction.toBroadcast();
			transactionToBroadcast.push(data);
		}

		let response: Contracts.KeyValuePair;

		try {
			response = await this.#client.transactions().create(transactionToBroadcast);
		} catch (error) {
			response = error.response.json();
		}

		const { data, errors } = response;

		const result: Services.BroadcastResponse = {
			accepted: [],
			errors: {},
			rejected: [],
		};

		if (Array.isArray(data.accept)) {
			for (const acceptedIndex of data.accept) {
				result.accepted.push(transactions[acceptedIndex]?.hash());
			}
		}

		if (Array.isArray(data.invalid)) {
			for (const rejected of data.invalid) {
				result.rejected.push(transactions[rejected]?.hash());
			}
		}

		if (errors) {
			const responseErrors: [string, { message: string }][] = Object.entries(errors);

			for (const [key, value] of responseErrors) {
				if (Array.isArray(value)) {
					result.errors[key] = value[0].message;
				} else {
					result.errors[key] = value.message;
				}
			}
		}

		return result;
	}

	public override async evmCall(callData: Contracts.EvmCallData): Promise<Contracts.EvmCallResponse> {
		try {
			// @ts-ignore
			const response = await this.#client.evm().ethCall(callData);

			return {
				id: response.id,
				jsonrpc: response.jsonrpc,
				result: response.result,
			};
		} catch (error) {
			const errorResponse = error.response?.json();
			throw new Error(errorResponse?.error?.message || "Failed to make EVM call");
		}
	}

	public override async usernames(addresses: string[]): Promise<Collections.UsernameDataCollection> {
		try {
			let data;

			try {
				data = encodeFunctionData({
					abi: UsernamesAbi.abi,
					args: [addresses],
					functionName: "getUsernames",
				});
			} catch (encodeError) {
				throw new Error(`Failed to encode function data: ${(encodeError as Error).message}`);
			}

			const response = await this.evmCall({
				data: data,
				to: wellKnownContracts.username,
			});

			let decoded;
			try {
				decoded = decodeFunctionResult({
					abi: UsernamesAbi.abi,
					data: response.result,
					functionName: "getUsernames",
				});
			} catch (decodeError) {
				throw new Error(`Failed to decode function result: ${(decodeError as Error).message}`);
			}

			const usernameDataList = (decoded as any[]).map(
				(user) =>
					new DTO.UsernameData({
						address: user.addr,
						username: user.username,
					}),
			);

			return new Collections.UsernameDataCollection(usernameDataList);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new TypeError("Failed to fetch usernames: Unknown error occurred");
		}
	}

	#createMetaPagination(body): Services.MetaPagination {
		const getPage = (url: string): string | undefined => {
			const match: RegExpExecArray | null = new RegExp(/page=(\d+)/).exec(url);

			return match ? match[1] || undefined : undefined;
		};

		return {
			last: getPage(body.meta.last) || undefined,
			next: getPage(body.meta.next) || undefined,
			prev: getPage(body.meta.previous) || undefined,
			self: getPage(body.meta.self) || undefined,
		};
	}

	#createSearchParams(body: Services.ClientTransactionsInput): {
		body: object | null;
		searchParams: searchParams | null;
	} {
		if (Object.keys(body).length <= 0) {
			return { body: null, searchParams: { limit: 10, page: 1 } };
		}

		const result: any = {
			body,
			searchParams: {},
		};

		const mappings: Record<string, string> = {
			address: "address",
			cursor: "page",
			from: "from",
			limit: "limit",
			memo: "vendorField",
			orderBy: "orderBy",
			senderPublicKey: "senderPublicKey",
			to: "to",
		};

		for (const [alias, original] of Object.entries(mappings)) {
			if (body[alias]) {
				result.searchParams[original] = body[alias];

				delete result.body[alias];
			}
		}

		if (body.identifiers) {
			const identifiers: Services.WalletIdentifier[] = body.identifiers;

			result.searchParams.address = identifiers.map(({ value }) => value).join(",");

			// @ts-ignore
			delete body.identifiers;
		}

		const transactionTypeMap: Record<string, string | undefined> = {
			delegateRegistration: TransactionTypes.RegisterValidator,
			delegateResignation: TransactionTypes.ResignValidator,
			multiPayment: TransactionTypes.MultiPayment,
			transfer: TransactionTypes.Transfer,
			usernameRegistration: TransactionTypes.RegisterUsername,
			usernameResignation: TransactionTypes.ResignUsername,
			vote: [trimHexPrefix(TransactionTypes.Vote), trimHexPrefix(TransactionTypes.Unvote)].join(","),
		};

		// @ts-ignore
		if (body.type) {
			const data = transactionTypeMap[body.type];
			if (data !== undefined) {
				result.searchParams.data = trimHexPrefix(data);
			}

			delete body.type;
		}

		if (body.types) {
			const data: string[] = [];

			for (const type of body.types) {
				const datum = transactionTypeMap[type];

				// a transfer is an empty string, so explicitly check for undefined
				if (datum !== undefined) {
					data.push(trimHexPrefix(datum));
				}
			}

			if (data.length > 0) {
				result.searchParams.data = data.join(",");
			}

			delete body.types;
		}

		if (body.timestamp) {
			const normalizeTimestamps = (timestamp: Services.RangeCriteria) => {
				const epoch: string = this.configRepository.get<string>("network.constants.epoch");

				const normalized = { ...timestamp };

				if (epoch) {
					for (const [key, value] of Object.entries(normalized)) {
						normalized[key] = Math.max(value - DateTime.make(epoch).toUNIX(), 0);
					}
				}

				return normalized;
			};

			const normalized = normalizeTimestamps(body.timestamp);

			result.searchParams.timestamp = normalized;
			delete body.timestamp;
		}

		result.searchParams = dotify({ ...result.searchParams, ...result.body });
		result.body = null;

		return result;
	}
}
