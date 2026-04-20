import { render, screen } from "@/utils/testing-library";
import { ExchangeCurrencyAmount } from "./SendTransferSidepanel.blocks";

describe("ExchangeCurrencyAmount", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render if not testnet and ticker & amount are provided", async () => {
		render(<ExchangeCurrencyAmount isTestnet={false} convertedAmount="10" exchangeTicker="ARK" />);

		expect(screen.getByTestId("Amount")).toBeInTheDocument();
	});

	it("should not render if testnet", async () => {
		render(<ExchangeCurrencyAmount isTestnet />);
		expect(screen.queryByTestId("Amount")).not.toBeInTheDocument();
	});
});
