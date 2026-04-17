import { TransactionConfirmations } from "./TransactionConfirmations";
import { render, screen } from "@/utils/testing-library";
import * as useMultiSignatureStatus from "@/domains/transaction/hooks/use-multisignature-status";

describe("TransactionConfirmations", () => {
	it("should render pending confirmation", () => {
		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={0}
				transaction={{
					isSuccess: () => true,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("PendingConfirmationAlert")).toBeInTheDocument();
	});

	it("should render confirmed transaction", () => {
		render(
			<TransactionConfirmations
				isConfirmed={true}
				confirmations={100}
				transaction={{
					isSuccess: () => true,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("TransactionSuccessAlert")).toBeInTheDocument();
	});

	it("should render pending status text for broadcasted", () => {
		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={0}
				transaction={{
					isSuccess: () => true,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("PendingConfirmationAlert")).toBeInTheDocument();
	});

	it("should render failed transaction with unknown error", () => {
		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={10}
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => null,
							hasUnknownError: () => true,
						}),
					}),
					isSuccess: () => false,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("TransactionFailedAlert")).toBeInTheDocument();
	});

	it("should render failed transaction with error message", () => {
		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={10}
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => "Some error",
							hasUnknownError: () => false,
							prettyError: () => "Pretty error",
						}),
					}),
					isSuccess: () => false,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("TransactionFailedAlert")).toBeInTheDocument();
	});

	it("should render different status label when not broadcasted", () => {
		vi.spyOn(useMultiSignatureStatus, "useMultiSignatureStatus").mockReturnValue({
			canBeBroadcasted: false,
			canBeSigned: false,
			isAwaitingFinalSignature: false,
			isAwaitingOurFinalSignature: false,
			status: {
				className: "",
				icon: "",
				label: "Awaiting Confirmation",
				value: "isAwaitingConfirmation" as const,
			},
		});

		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={0}
				transaction={{
					isSuccess: () => true,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("PendingConfirmationAlert")).toHaveTextContent("Awaiting Confirmation");
	});

	it("should render failed transaction with both unknown and regular error", () => {
		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={10}
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => "Regular error",
							hasUnknownError: () => true,
							prettyError: () => undefined,
						}),
					}),
					isSuccess: () => false,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("TransactionFailedAlert")).toBeInTheDocument();
		expect(screen.getByText("Error encountered during contract execution.")).toBeInTheDocument();
	});

	it("should render failed transaction with error and pretty error message", () => {
		const prettyError = vi.fn().mockReturnValue("CustomPrettyError");

		render(
			<TransactionConfirmations
				isConfirmed={false}
				confirmations={10}
				transaction={{
					data: () => ({
						receipt: () => ({
							error: () => "Custom error",
							hasUnknownError: () => false,
							prettyError,
						}),
					}),
					isSuccess: () => false,
					wallet: () => ({}),
				}}
			/>,
		);

		expect(screen.getByTestId("TransactionFailedAlert")).toBeInTheDocument();
		expect(prettyError).toHaveBeenCalled();
	});
});
