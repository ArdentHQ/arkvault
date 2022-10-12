import { UUID } from "@ardenthq/sdk-cryptography";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useCallback } from "react";

import { httpClient } from "@/app/services";
import { OrderStatusResponse } from "@/domains/exchange/exchange.contracts";
import { ExchangeService } from "@/domains/exchange/services/exchange.service";

export const useOrderStatus = () => {
	const checkOrderStatus = useCallback(async (exchangeTransactions: Contracts.IExchangeTransaction[]) => {
		const exchangeServices: Record<string, ExchangeService> = {};

		try {
			const allStatuses = await Promise.all(
				exchangeTransactions.map((exchangeTransaction: Contracts.IExchangeTransaction) => {
					/* istanbul ignore else -- @preserve */
					if (!exchangeServices[exchangeTransaction.provider()]) {
						exchangeServices[exchangeTransaction.provider()] = new ExchangeService(
							exchangeTransaction.provider(),
							httpClient,
						);
					}

					return exchangeServices[exchangeTransaction.provider()].orderStatus(exchangeTransaction.orderId(), {
						t: UUID.random(),
					});
				}),
			);

			const statusMap: Record<string, OrderStatusResponse> = {};

			for (const status of allStatuses) {
				statusMap[status.id] = status;
			}

			return statusMap;
		} catch {
			//
		}
	}, []);

	const prepareParameters = useCallback(
		(exchangeTransaction: Contracts.IExchangeTransaction, orderStatus: OrderStatusResponse) => {
			const result = {
				input: { ...exchangeTransaction.input() },
				output: { ...exchangeTransaction.output() },
				status: orderStatus.status,
			};

			if (orderStatus.payinHash) {
				result.input.hash = orderStatus.payinHash;
			}

			if (orderStatus.payoutHash) {
				result.output.hash = orderStatus.payoutHash;
			}

			if (orderStatus.amountTo && orderStatus.amountTo !== exchangeTransaction.output().amount) {
				result.output.amount = orderStatus.amountTo;
			}

			return result;
		},
		[],
	);

	return {
		checkOrderStatus,
		prepareParameters,
	};
};
