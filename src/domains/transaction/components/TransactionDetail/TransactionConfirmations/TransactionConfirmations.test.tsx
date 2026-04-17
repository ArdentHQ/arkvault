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
					isSuccess: () => false,
					wallet: () => ({}),
					data: () => ({
						receipt: () => ({
							hasUnknownError: () => true,
							error: () => null,
						}),
					}),
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
					isSuccess: () => false,
					wallet: () => ({}),
					data: () => ({
						receipt: () => ({
							hasUnknownError: () => false,
							error: () => "Some error",
							prettyError: () => "Pretty error",
						}),
					}),
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
				value: "isAwaitingConfirmation" as const,
				label: "Awaiting Confirmation",
				icon: "",
				className: "",
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
});
