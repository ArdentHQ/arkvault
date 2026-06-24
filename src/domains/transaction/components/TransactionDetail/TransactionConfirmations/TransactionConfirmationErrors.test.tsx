import { TransactionConfirmationErrors } from "./TransactionConfirmationErrors";
import { render, screen } from "@/utils/testing-library";

describe("TransactionConfirmationErrors", () => {
	it("should render error with message", () => {
		const prettyErrorSpy = vi.fn().mockReturnValue("Execution reverted.");

		render(
			<TransactionConfirmationErrors
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => "Some error",
							hasUnknownError: () => false,
							prettyError: prettyErrorSpy,
						}),
					}),
				}}
			/>,
		);

		expect(
			screen.getByText("Error encountered during contract execution: Execution reverted."),
		).toBeInTheDocument();
		expect(prettyErrorSpy).toHaveBeenCalled();
	});

	it("should render generic error when it has unknown error", () => {
		render(
			<TransactionConfirmationErrors
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => null,
							hasUnknownError: () => true,
							prettyError: () => "Ignored",
						}),
					}),
				}}
			/>,
		);

		expect(screen.getByText("Error encountered during contract execution.")).toBeInTheDocument();
	});

	it("should render nothing when there is no error", () => {
		const { container } = render(
			<TransactionConfirmationErrors
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => null,
							hasUnknownError: () => false,
							prettyError: () => "",
						}),
					}),
				}}
			/>,
		);

		expect(container.querySelector("p")).not.toBeInTheDocument();
	});
});
