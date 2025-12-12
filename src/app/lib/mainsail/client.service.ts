/* eslint-disable sonarjs/cognitive-complexity */

import { Collections, Contracts, DTO, Services } from "@/app/lib/mainsail";
import { ConfigKey, ConfigRepository } from "@/app/lib/mainsail";
import { TransactionTypes, trimHexPrefix } from "./transaction-type.service";
import { decodeFunctionResult, encodeFunctionData } from "viem";

import { ArkClient } from "@arkecosystem/typescript-client";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto";
import { ConfirmedTransactionDataCollection } from "@/app/lib/mainsail/transactions.collection";
import { DateTime } from "@/app/lib/intl";
import { IProfile } from "@/app/lib/profiles/profile.contract";
import { SignedTransactionData } from "./signed-transaction.dto";
import { UsernamesAbi } from "@mainsail/evm-contracts";
import { WalletData } from "./wallet.dto";
import dotify from "node-dotify";
import { UnconfirmedTransactionData } from "./unconfirmed-transaction.dto";
import { UnconfirmedTransactionDataCollection } from "@/app/lib/mainsail/unconfirmed-transactions.collection";
import { TokenRepository } from "@/app/lib/profiles/token.repository";
import { WalletTokenRepository } from "@/app/lib/profiles/wallet-token.repository";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import { WalletTokenData } from "@/app/lib/profiles/token.contracts";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";

type searchParams<T extends Record<string, any> = {}> = T & { page: number; limit?: number };

const wellKnownContracts = {
	consensus: "0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1",
	multiPayment: "0x00EFd0D4639191C49908A7BddbB9A11A994A8527",
	username: "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6",
};

export class ClientService {
	readonly #client!: ArkClient;
	#config: ConfigRepository;

	public constructor({ config, profile }: { config: ConfigRepository; profile: IProfile }) {
		this.#config = config;

		const api = config.host("full", profile);
		const evm = config.host("evm", profile);
		const transactions = config.host("tx", profile);

		this.#client = new ArkClient({
			api,
			evm,
			transactions,
		});
	}

	public async transaction(
		id: string,
		query?: Record<string, string | number | boolean | null>,
	): Promise<ConfirmedTransactionData> {
		const body = await this.#client.transactions().get(id, query);
		return new ConfirmedTransactionData().configure(body.data);
	}

	public async tokens(): Promise<TokenRepository> {
		const response = await this.#client.tokens().all();
		const tokens = new TokenRepository();
		tokens.fill(response.data);
		return tokens;
	}

	public async walletTokens(address: string): Promise<WalletTokenDTO[]> {
		const response = await this.#client.tokens().byWalletAddress(address);
		return response.data.map((tokenData: WalletTokenData) => new WalletTokenDTO(tokenData));
	}

	public async tokenHolders(contractAddress: string): Promise<WalletTokenRepository> {
		const response = await this.#client.tokens().holders(contractAddress);
		const holders = new WalletTokenRepository();
		holders.fill(response.results);
		return holders;
	}

	public async tokenByContractAddress(contractAddress: string): Promise<TokenDTO> {
		const response = await this.#client.tokens().get(contractAddress);
		return new TokenDTO(response.data);
	}

	public async transactions(
		query: Services.ClientTransactionsInput,
	): Promise<Collections.ConfirmedTransactionDataCollection> {
		const { searchParams } = this.#createSearchParams(query);
		const { limit = 10, page = 1, ...parameters } = searchParams;

		const response = await this.#client.transactions().all(page, limit, parameters);

		return new ConfirmedTransactionDataCollection(
			response.data.map((transaction) => new ConfirmedTransactionData().configure(transaction)),
			this.#createMetaPagination(response),
		);
	}

	public async unconfirmedTransactions(
		query: Services.ClientTransactionsInput = {},
	): Promise<Collections.UnconfirmedTransactionDataCollection> {
		const { searchParams } = this.#createSearchParams(query);
		const { limit = 10, page = 1, ...parameters } = searchParams;

		const response = await this.#client.transactions().allUnconfirmed(page, limit, parameters);

		return new UnconfirmedTransactionDataCollection(
			response.data.map((transaction) => new UnconfirmedTransactionData().configure(transaction)),
			this.#createMetaPagination(response),
		);
	}

	public async wallet(id: Services.WalletIdentifier): Promise<Contracts.WalletData> {
		const body = await this.#client.wallets().get(id.value);
		return new WalletData({ config: this.#config }).fill(body.data);
	}

	public async wallets(query: Services.ClientWalletsInput): Promise<Collections.WalletDataCollection> {
		const { searchParams } = this.#createSearchParams(query);
		const { limit = 10, page = 1 } = searchParams;

		const response = await this.#client.wallets().all(page, limit);

		return new Collections.WalletDataCollection(
			response.data.map((wallet) => new WalletData({ config: this.#config }).fill(wallet)),
			this.#createMetaPagination(response),
		);
	}

	public async validator(id: string): Promise<Contracts.WalletData> {
		const body = await this.#client.validators().get(id);
		return new WalletData({ config: this.#config }).fill(body.data);
	}

	public async validators(query?: Contracts.KeyValuePair): Promise<Collections.WalletDataCollection> {
		const { searchParams } = this.#createSearchParams(query ?? {});
		const { limit = 10, page = 1, ...parameters } = searchParams;

		const body = await this.#client.validators().all(page, limit, parameters);

		return new Collections.WalletDataCollection(
			body.data.map((wallet) => new WalletData({ config: this.#config }).fill(wallet)),
			this.#createMetaPagination(body),
		);
	}

	public async votes(id: string): Promise<Services.VoteReport> {
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

	public async broadcast(transactions: SignedTransactionData[]): Promise<Services.BroadcastResponse> {
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

	public async evmCall(callData: Contracts.EvmCallData): Promise<Contracts.EvmCallResponse> {
		try {
			// @ts-ignore
			const response = await this.#client.evm().call({
				id: 1,
				method: "eth_call",
				params: [callData, "latest"],
			});

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

	public async usernames(addresses: string[]): Promise<Collections.UsernameDataCollection> {
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

			return match?.[1] || undefined;
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
		searchParams: searchParams;
	} {
		if (Object.keys(body).length <= 0) {
			return { body: null, searchParams: { limit: 10, page: 1 } };
		}

		const result: any = {
			body,
			searchParams: {
				limit: 10,
				page: 1,
			},
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

			const addresses = identifiers.map(({ value }) => value).join(",");
			if (addresses.length > 0) {
				result.searchParams.address = addresses;
			}

			// @ts-ignore
			delete body.identifiers;
		}

		const transactionTypeMap: Record<string, string | undefined> = {
			multiPayment: TransactionTypes.MultiPayment,
			transfer: TransactionTypes.Transfer,
			updateValidator: TransactionTypes.UpdateValidator,
			usernameRegistration: TransactionTypes.RegisterUsername,
			usernameResignation: TransactionTypes.ResignUsername,
			validatorRegistration: TransactionTypes.RegisterValidator,
			validatorResignation: TransactionTypes.ResignValidator,
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
				const epoch: string = this.#config.get<string>(ConfigKey.Epoch);

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
