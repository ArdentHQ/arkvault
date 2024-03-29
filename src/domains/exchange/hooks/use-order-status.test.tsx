import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";

import { useOrderStatus } from "./use-order-status";
import { env, getDefaultProfileId, render, waitFor } from "@/utils/testing-library";
import { requestMock, server } from "@/tests/mocks/server";

let profile: Contracts.IProfile;
let exchangeTransaction: Contracts.IExchangeTransaction;

describe("useOrderStatus", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		exchangeTransaction = profile.exchangeTransactions().create({
			input: {
				address: "inputAddress",
				amount: 1,
				ticker: "btc",
			},
			orderId: "id",
			output: {
				address: "outputAddress",
				amount: 100,
				ticker: "ark",
			},
			provider: "changenow",
		});
	});

	describe("#checkOrderStatus", () => {
		it("should check the order status", async () => {
			server.use(
				requestMock("https://exchanges.arkvault.io/api/changenow/orders/id", {
					data: { id: "id", status: "waiting" },
				}),
			);

			const Component = () => {
				const [status, setStatus] = useState<Contracts.ExchangeTransactionStatus>();

				const { checkOrderStatus } = useOrderStatus();

				useEffect(() => {
					const fetchStatus = async () => {
						const responses = await checkOrderStatus([exchangeTransaction]);
						setStatus(responses.id.status);
					};

					fetchStatus();
				}, []);

				return <span>status: {status}</span>;
			};

			const { container } = render(<Component />);

			await waitFor(() => {
				expect(container).toHaveTextContent(Contracts.ExchangeTransactionStatus.Waiting);
			});
		});
	});
});
