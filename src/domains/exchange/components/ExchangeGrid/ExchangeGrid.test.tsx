import userEvent from "@testing-library/user-event";
import React from "react";

import { ExchangeGrid } from "./ExchangeGrid";
import { render, screen } from "@/utils/testing-library";

const exchange = {
	emailAddress: "support@changenow.io",
	isActive: true,
	logo: {
		dark: "https://exchanges.arkvault.io/images/changenow/dark.png",
		light: "https://exchanges.arkvault.io/images/changenow/light.png",
		thumbnail: "https://exchanges.arkvault.io/images/changenow/thumbnail.png",
	},
	name: "ChangeNOW",
	privacyPolicy: "https://changenow.io/privacy-policy",
	slug: "changenow",
	termsOfService: "https://changenow.io/terms-of-use",
};

describe("ExchangeGrid", () => {
	it("should render", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[exchange]} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render empty", () => {
		const { asFragment } = render(<ExchangeGrid exchanges={[]} />);

		expect(screen.getByTestId("ExchangeGrid__empty-message")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should execute onClick callback", async () => {
		const onClick = vi.fn();

		render(<ExchangeGrid exchanges={[exchange]} onClick={onClick} />);

		await userEvent.click(screen.getByTestId("Card"));

		expect(onClick).toHaveBeenCalledWith(exchange.slug);
	});
});
