import React from "react";

import { WalletListItemSkeleton } from "./WalletListItemSkeleton";
import { render, screen } from "@/utils/testing-library";

describe("WalletListItemSkeleton", () => {
	it.each([true, false])("should render wallet list skeleton when isCompact = %s", (isCompact: boolean) => {
		const { container } = render(
			<table>
				<tbody data-testid="WalletListSkeleton">
					<WalletListItemSkeleton isCompact={isCompact} />
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("WalletListSkeleton")).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});
});
