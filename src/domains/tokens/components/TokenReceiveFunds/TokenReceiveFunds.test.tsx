import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { TokenReceiveFunds } from "./TokenReceiveFunds";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;
let route: string;

describe("TokenReceiveFunds", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render closed by default", async () => {
		render(<TokenReceiveFunds profile={profile} wallets={[profile.wallets().first()]} />, {
			route,
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(0));
	});

	it("should render directly receive funds modal for one wallet", async () => {
		const closeMock = vi.fn();
		render(
			<TokenReceiveFunds profile={profile} wallets={[profile.wallets().first()]} isOpen onClose={closeMock} />,
			{
				route,
			},
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));

		await userEvent.click(screen.getByTestId("Modal__close-button"));
		expect(closeMock).toHaveBeenCalled();
	});

	it("should render wallet selection for multiple wallets", async () => {
		const closeMock = vi.fn();
		render(
			<TokenReceiveFunds profile={profile} wallets={profile.wallets().values()} isOpen onClose={closeMock} />,
			{
				route,
			},
		);

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(profile.wallets().count()));
		await userEvent.click(screen.getByTestId("Modal__close-button"));
		expect(closeMock).toHaveBeenCalled();
	});
});
