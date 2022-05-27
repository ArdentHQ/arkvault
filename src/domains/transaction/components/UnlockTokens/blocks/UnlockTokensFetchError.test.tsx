import userEvent from "@testing-library/user-event";
import React from "react";

import { UnlockTokensFetchError } from "./UnlockTokensFetchError";
import { buildTranslations } from "@/app/i18n/helpers";
import { render, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensFetchError", () => {
	it("should render", () => {
		const onRetry = jest.fn();

		const { asFragment } = render(<UnlockTokensFetchError onRetry={onRetry} />);

		expect(asFragment()).toMatchSnapshot();

		expect(screen.getByText(translations.COMMON.HERE)).toBeInTheDocument();

		userEvent.click(screen.getByText(translations.COMMON.HERE));

		expect(onRetry).toHaveBeenCalledTimes(1);
	});
});
