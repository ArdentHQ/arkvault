import { env, getMainsailProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { TokenReceiveFunds } from "./TokenReceiveFunds";
import { Contracts } from "@/app/lib/profiles";

let profile: Contracts.IProfile;
let route: string;

describe("TokenReceiveFunds", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;
	});

	it("should render directly receive funds modal for one wallet", async () => {
		render(<TokenReceiveFunds profile={profile} wallets={[profile.wallets().first()]} isOpen />, {
			route,
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiveFunds__Name_Address")).toHaveLength(1));
	});

	it("should render wallet selection for multiple wallets", async () => {
		render(<TokenReceiveFunds profile={profile} wallets={profile.wallets().values()} isOpen />, {
			route,
		});

		await waitFor(() => expect(screen.queryAllByTestId("ReceiverItem")).toHaveLength(profile.wallets().count()));
	});
});
