import React from "react";

import { ExchangeCard } from "./ExchangeCard";
import { render, screen } from "@/utils/testing-library";

const exchange = {
	emailAddress: "support@changenow.io",
	isActive: true,
	logo: {
		dark: "https://exchanges.payvo.com/images/changenow/dark.png",
		light: "https://exchanges.payvo.com/images/changenow/light.png",
		thumbnail: "https://exchanges.payvo.com/images/changenow/thumbnail.png",
	},
	name: "ChangeNOW",
	privacyPolicy: "https://changenow.io/privacy-policy",
	slug: "changenow",
	termsOfService: "https://changenow.io/terms-of-use",
};

describe("ExchangeCard", () => {
	it("should render", () => {
		const { container } = render(<ExchangeCard exchange={exchange} />);

		expect(screen.getByText(exchange.name)).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});

	it("should render when the exchange is not active", () => {
		const { container } = render(<ExchangeCard exchange={{ ...exchange, isActive: false }} />);

		expect(screen.getByText(exchange.name)).toBeInTheDocument();

		expect(container).toMatchSnapshot();
	});
});
