import { render, screen } from "@testing-library/react";
import { LedgerTabsFooter } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("LedgerTabsFooter", () => {
	const mockOnBack = vi.fn();
	const mockOnContinue = vi.fn();
	const mockHandleRetry = vi.fn();

	it("should return null when showFooter is false", () => {
		render(
			<LedgerTabsFooter
				showFooter={false}
				showRetry={false}
				activeTab={LedgerTabStep.LedgerScanStep}
				onBack={mockOnBack}
				onContinue={mockOnContinue}
				handleRetry={mockHandleRetry}
				isContinueDisabled={false}
				isLoading={false}
				isSubmitDisabled={false}
			/>,
		);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("should render ImportActionToolbar when showFooter is true and showRetry false", () => {
		render(
			<LedgerTabsFooter
				showFooter={true}
				showRetry={false}
				activeTab={LedgerTabStep.LedgerScanStep}
				onBack={mockOnBack}
				onContinue={mockOnContinue}
				handleRetry={mockHandleRetry}
				isContinueDisabled={false}
				isLoading={true}
				isSubmitDisabled={false}
			/>,
		);

		expect(screen.getByTestId("ImportWallet__continue-button")).toBeInTheDocument();
	});

	it("should render error footer with Back and Retry buttons when showRetry is true", () => {
		render(
			<LedgerTabsFooter
				showFooter={true}
				showRetry={true}
				activeTab={LedgerTabStep.LedgerScanStep}
				onBack={mockOnBack}
				onContinue={mockOnContinue}
				handleRetry={mockHandleRetry}
				isContinueDisabled={false}
				isLoading={false}
				isSubmitDisabled={false}
			/>,
		);

		expect(screen.getByTestId("LedgerFooter__backToSelection")).toBeInTheDocument();
		expect(screen.getByTestId("LedgerFooter__retry")).toBeInTheDocument();

		const backButton = screen.getByTestId("LedgerFooter__backToSelection");
		const retryButton = screen.getByTestId("LedgerFooter__retry");

		backButton.click();
		expect(mockOnBack).toHaveBeenCalledTimes(1);

		retryButton.click();
		expect(mockHandleRetry).toHaveBeenCalledTimes(1);
	});

	it("should set showButtons to false when activeTab is LedgerImportStep", () => {
		const { asFragment } = render(
			<LedgerTabsFooter
				showFooter={true}
				showRetry={false}
				activeTab={LedgerTabStep.LedgerImportStep}
				onBack={mockOnBack}
				onContinue={mockOnContinue}
				handleRetry={mockHandleRetry}
				isContinueDisabled={false}
				isLoading={false}
				isSubmitDisabled={false}
			/>,
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should set showPortfolioButton to true when activeTab is LedgerImportStep", () => {
		render(
			<LedgerTabsFooter
				showFooter={true}
				showRetry={false}
				activeTab={LedgerTabStep.LedgerImportStep}
				onBack={mockOnBack}
				onContinue={mockOnContinue}
				handleRetry={mockHandleRetry}
				isContinueDisabled={false}
				isLoading={false}
				isSubmitDisabled={false}
			/>,
		);

		const toolbar = screen.getByTestId("ImportWallet__finish-button");
		expect(toolbar).toBeInTheDocument();
	});
});
