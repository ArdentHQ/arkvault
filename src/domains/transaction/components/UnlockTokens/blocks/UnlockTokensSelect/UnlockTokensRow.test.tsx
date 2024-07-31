import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import userEvent from "@testing-library/user-event";
import React from "react";

import { UnlockTokensRow } from "./UnlockTokensRow";
import { buildTranslations } from "@/app/i18n/helpers";
import { UnlockableBalance } from "@/domains/transaction/components/UnlockTokens/UnlockTokens.contracts";
import { render, screen } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensRow", () => {
	const item: UnlockableBalance = {
		address: "lskbps7ge5n9y7f8nk4222c77zkqcntrj7jyhmkwp",
		amount: BigNumber.make(10),
		height: "123456",
		id: "1",
		isReady: true,
		timestamp: DateTime.make("2020-01-01"),
	};

	it("should render loading", () => {
		render(
			<table>
				<tbody>
					<UnlockTokensRow loading item={{}} ticker="LSK" checked={false} onToggle={vi.fn()} />
				</tbody>
			</table>,
		);

		expect(screen.queryByTestId("Amount")).toBeNull();
	});

	it.each([true, false])("should render with isReady = %s", async (isReady) => {
		const onToggle = vi.fn();

		const { asFragment } = render(
			<table>
				<tbody>
					<UnlockTokensRow
						loading={false}
						item={{ ...item, isReady }}
						ticker="LSK"
						checked
						onToggle={onToggle}
					/>
				</tbody>
			</table>,
		);

		expect(asFragment()).toMatchSnapshot();
		expect(screen.getByTestId("Amount")).toHaveTextContent("10 LSK");
		expect(screen.getByTestId("UnlockableBalanceRow__status")).toHaveTextContent(
			isReady ? translations.TRANSACTION.UNLOCK_TOKENS.UNLOCKABLE : translations.TRANSACTION.UNLOCK_TOKENS.LOCKED,
		);

		// toggle checkbox

		expect(screen.getAllByRole("checkbox")).toHaveLength(1);

		await userEvent.click(screen.getByRole("checkbox"));

		expect(onToggle).toHaveBeenCalledTimes(isReady ? 1 : 0);
	});
});
