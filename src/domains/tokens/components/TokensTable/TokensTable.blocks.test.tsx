import { render } from "@/utils/testing-library";

import { TokensTableFooter } from "./TokensTable.blocks";

describe("TokensTableFooter", () => {
	it("should render empty state", () => {
		const { asFragment } = render(<TokensTableFooter tokensCount={0} columnsCount={0} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render null when tokens count > 0", () => {
		const { asFragment } = render(<TokensTableFooter tokensCount={1} columnsCount={1} />);

		expect(asFragment()).toMatchSnapshot();
	});
});
