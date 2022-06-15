import { upperFirst } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";

import { HttpClient } from "@/app/services/HttpClient";
import {
	CurrencyData,
	EstimateResponse,
	Order,
	OrderResponse,
	OrderStatusResponse,
} from "@/domains/exchange/exchange.contracts";

// export const exchangeHost = "http://exchange-server.test/api";
export const exchangeHost = "https://exchanges.arkvault.io/api";

/**
 * Implements the ability to perform communicate with exchange providers.
 *
 * @export
 * @class ExchangeService
 */
export class ExchangeService {
	/**
	 * The id of the exchange provider.
	 *
	 * @type {string}
	 * @memberof ExchangeService
	 */
	readonly #provider: string;

	/**
	 * The HTTP client instance.
	 *
	 * @type {HttpClient}
	 * @memberof ExchangeService
	 */
	readonly #httpClient: HttpClient;

	/**
	 * The host of the Exchange API.
	 *
	 * @type {string}
	 * @memberof ExchangeService
	 */
	readonly #host: string = exchangeHost;

	/**
	 * Creates an instance of ExchangeService.
	 *
	 * @param {HttpClient} httpClient
	 * @memberof ExchangeService
	 */
	public constructor(provider: string, httpClient: HttpClient) {
		this.#provider = provider;
		this.#httpClient = httpClient;
	}

	/**
	 * Retrieves a currency by its ticker.
	 *
	 * @returns {Promise<CurrencyData>}
	 * @memberof ExchangeService
	 */
	public async currency(ticker: string): Promise<CurrencyData> {
		const body = await this.get(`currencies/${ticker}`);
		return body.data;
	}

	/**
	 * Retrieves all available currencies.
	 *
	 * @returns {Promise<CurrencyData[]>}
	 * @memberof ExchangeService
	 */
	public async currencies(): Promise<CurrencyData[]> {
		const body = await this.get("currencies");
		return body.data;
	}

	/**
	 * Checks whether an address belongs to the given network.
	 *
	 * @returns {Promise<boolean>}
	 * @memberof ExchangeService
	 */
	public async validateAddress(currency: string, address: string): Promise<boolean> {
		const body = await this.get(`currencies/${currency}/${address}`);
		return body.data;
	}

	/**
	 * Retrieves the minimal exchange amount for a given pair.
	 *
	 * @returns {Promise<number<}
	 * @memberof ExchangeService
	 */
	public async minimalExchangeAmount(from: string, to: string): Promise<number> {
		const body = await this.get(`tickers/${from}/${to}`);
		return body.data;
	}

	/**
	 * Retrieves the estimated exchange amount for a given pair and amount.
	 *
	 * @returns {Promise<EstimateResponse>}
	 * @memberof ExchangeService
	 */
	public async estimateExchangeAmount(from: string, to: string, amount: number): Promise<EstimateResponse> {
		const body = await this.get(`tickers/${from}/${to}/${amount}`);
		return body.data;
	}

	/**
	 * Creates an exchange transaction.
	 *
	 * @returns {Promise<OrderResponse>}
	 * @memberof ExchangeService
	 */
	public async createOrder(parameters: any): Promise<OrderResponse> {
		const result = await this.post("orders", parameters);
		return result.data;
	}

	/**
	 * Retrieves the order status for a given order id.
	 *
	 * @returns {Promise<OrderStatusResponse>}
	 * @memberof ExchangeService
	 */
	public async orderStatus(orderId: string, query = {}): Promise<OrderStatusResponse> {
		const body = await this.get(`orders/${orderId}`, query);

		const status = body.data;

		status.providerId = this.#provider;
		status.status =
			Contracts.ExchangeTransactionStatus[
				upperFirst(status.status) as keyof typeof Contracts.ExchangeTransactionStatus
			];

		return status;
	}

	/**
	 * Sends an HTTP GET request to the Exchange API.
	 *
	 * @private
	 * @param {string} path
	 * @param {*} [query={}]
	 * @returns {Promise<any>}
	 * @memberof ExchangeService
	 */
	private async get(path: string, query = {}): Promise<any> {
		const response = await this.#httpClient.get(`${this.#host}/${this.#provider}/${path}`, query);

		return response.json();
	}

	/**
	 * Sends an HTTP POST request to the Exchange API.
	 *
	 * @private
	 * @param {string} path
	 * @param {*} [query]
	 * @returns {Promise<any>}
	 * @memberof ExchangeService
	 */
	private async post(path: string, query: Order): Promise<any> {
		const response = await this.#httpClient.post(`${this.#host}/${this.#provider}/${path}`, query);

		return response.json();
	}
}
