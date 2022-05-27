import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";

import { useExchangeContext } from "./Exchange";
import { httpClient } from "@/app/services";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import { render, screen, waitFor } from "@/utils/testing-library";

const Test = () => {
	const { exchangeProviders, fetchProviders } = useExchangeContext();
	return (
		<>
			<span>provider count: {exchangeProviders?.length}</span>
			<button onClick={fetchProviders} />
		</>
	);
};

describe("Exchange Context", () => {
	afterEach(() => httpClient.clearCache());

	it("should throw without provider", () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		const Test = () => {
			const { exchangeProviders } = useExchangeContext();
			return <span>provider counts: {exchangeProviders.length}</span>;
		};

		expect(() => render(<Test />)).toThrow("[useExchangeContext] Component not wrapped within a Provider");

		consoleSpy.mockRestore();
	});

	it("should successfully fetch providers", async () => {
		const { container } = render(
			<ExchangeProvider>
				<Test />
			</ExchangeProvider>,
		);

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(container).toHaveTextContent("provider count: 2");
		});
	});

	it("should handle error when fetching providers", async () => {
		nock.cleanAll();

		nock("https://exchanges.payvo.com").get("/api").reply(404);

		const { container } = render(
			<ExchangeProvider>
				<Test />
			</ExchangeProvider>,
		);

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(container).toHaveTextContent("provider count: 0");
		});
	});

	it("should instantiate ExchangeService after setting provider", async () => {
		const Test = () => {
			const { exchangeService, setProvider } = useExchangeContext();

			return (
				<>
					<button onClick={() => setProvider({ slug: "provider" })} />
					<span>exchangeService is {exchangeService ? "set" : "undefined"}</span>;
				</>
			);
		};

		const { container } = render(
			<ExchangeProvider>
				<Test />
			</ExchangeProvider>,
		);

		expect(container).toHaveTextContent("exchangeService is undefined");

		userEvent.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(container).toHaveTextContent("exchangeService is set");
		});
	});
});
