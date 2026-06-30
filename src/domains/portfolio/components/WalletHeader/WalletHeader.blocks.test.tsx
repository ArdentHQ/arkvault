import { render, screen } from "@/utils/testing-library";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { WalletActions } from "./WalletHeader.blocks";
import { Contracts } from "@/app/lib/profiles";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

beforeAll(async () => {
	profile = env.profiles().findById(getMainsailProfileId());
	await env.profiles().restore(profile);
	wallet = profile.wallets().first();
});

describe("WalletActions", () => {
	const renderComponent = (isUpdatingTransactions?: boolean) =>
		render(
			<WalletActions
				profile={profile}
				wallet={wallet}
				isUpdatingTransactions={isUpdatingTransactions}
				onUpdate={() => {}}
			/>,
		);

	it("should render the refresh button with tooltip", () => {
		renderComponent();

		const refreshButton = screen.getByTestId("WalletHeader__refresh");
		expect(refreshButton).toBeInTheDocument();
	});

	it("should show updating tooltip when syncing", async () => {
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);

		renderComponent();

		const refreshButton = screen.getByTestId("WalletHeader__refresh");

		expect(refreshButton).toBeInTheDocument();
	});

	it("should disable the button while syncing", async () => {
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);

		const result = renderComponent();

		const refreshButton = screen.getByTestId("WalletHeader__refresh");
		expect(refreshButton).toBeInTheDocument();

		result.unmount();
	});

	it("should trigger sync on button click", async () => {
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);

		const result = render(
			<WalletActions profile={profile} wallet={wallet} isUpdatingTransactions={undefined} onUpdate={() => {}} />,
		);

		const user = userEvent.setup();
		const refreshButton = screen.getByTestId("WalletHeader__refresh");

		expect(refreshButton).not.toBeDisabled();

		await user.click(refreshButton);

		result.unmount();
	});

	it("should not call update when isUpdatingTransactions is set", async () => {
		vi.spyOn(wallet, "hasSyncedWithNetwork").mockReturnValue(true);

		const onUpdate = vi.fn();

		render(<WalletActions profile={profile} wallet={wallet} isUpdatingTransactions={true} onUpdate={onUpdate} />);

		expect(onUpdate).not.toHaveBeenCalled();
	});
});
