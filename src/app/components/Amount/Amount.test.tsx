import React from "react";

import { Amount } from "./Amount";
import { env, getMainsailProfileId, renderWithoutRouter as render, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";
import { Contracts } from "@/app/lib/profiles";
import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";

let profile: Contracts.IProfile;

describe("Amount", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());

		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should format crypto or fiat depending on the ticker", () => {
		const { rerender } = render(<Amount value={123.456} ticker="EUR" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^€123.46$/);

		rerender(<Amount value={123.456} ticker="ARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^123.456 ARK$/);
	});

	it("should format crypto", () => {
		const { rerender } = render(<Amount value={1} ticker="ARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^1 ARK$/);

		rerender(<Amount value={1234.56} ticker=" " />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^1,234.56$/);

		rerender(<Amount value={123_456} ticker="BTC" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^123,456 BTC$/);

		rerender(<Amount value={0} ticker="DARK" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^0 DARK$/);

		rerender(<Amount value={10} ticker="ARK" showSign />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\+ 10 ARK$/);

		rerender(<Amount value={10} ticker="ARK" showSign isNegative />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^- 10 ARK$/);

		rerender(<Amount value={10} ticker="ARK" showTicker={false} />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^10$/);
	});

	it("should format fiat", () => {
		const { rerender } = render(<Amount value={123.456} ticker="USD" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$123.46$/);

		rerender(<Amount value={1} ticker="USD" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$1.00$/);

		rerender(<Amount value={1} ticker="USD" showSign />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\+ \$1.00$/);

		rerender(<Amount value={1} ticker="USD" showSign isNegative />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^- \$1.00$/);
	});

	it("should respect the balance visibility context when allowHideBalance is true", async () => {
		const TestComponent = () => {
			const { hideBalance, setHideBalance } = useBalanceVisibility({ profile });
			return (
				<>
					<Amount value={123.456} ticker="USD" allowHideBalance profile={profile} />
					<button onClick={() => setHideBalance(!hideBalance)}>Toggle</button>
				</>
			);
		};

		render(<TestComponent />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$123.46$/);

		await userEvent.click(screen.getByRole("button"));
		expect(screen.getByTestId("Amount")).toHaveTextContent("****");
	});

	it("should not hide balance by default", () => {
		render(<Amount value={123.456} ticker="USD" />);

		expect(screen.getByTestId("Amount")).toHaveTextContent(/^\$123.46$/);
	});
});
