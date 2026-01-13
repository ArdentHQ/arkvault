import { env, getMainsailProfileId, render, screen, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

import { TokensTable } from "./TokensTable";
import { LayoutBreakpoint } from "@/types";
import { Contracts } from "@/app/lib/profiles";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import * as useRandomNumberHook from "@/app/hooks/use-random-number";
import * as useWalletActionsHook from "@/domains/wallet/hooks";

let profile: Contracts.IProfile;
let route: string;
let useRandomNumberSpy: vi.SpyInstance;

describe("TokensTable", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		route = `/profiles/${profile.id()}/tokens`;

		useRandomNumberSpy = vi.spyOn(useRandomNumberHook, "useRandomNumber").mockImplementation(() => 1);
	});

	afterAll(() => {
		useRandomNumberSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(<TokensTable />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s", (breakpoint) => {
		const { asFragment } = renderResponsiveWithRoute(<TokensTable />, breakpoint as LayoutBreakpoint, { route });
		expect(asFragment()).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should not render in %s with tokens", (breakpoint) => {
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile
			.wallets()
			.first()
			.tokens()
			.create({
				token: new TokenDTO(fixtureData),
				walletToken: new WalletTokenDTO(walletTokenData),
			});

		const { asFragment } = renderResponsiveWithRoute(<TokensTable />, breakpoint as LayoutBreakpoint, { route });
		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onClick when a token row is clicked", async () => {
		const user = userEvent.setup();
		const onClickMock = vi.fn();

		render(<TokensTable onClick={onClickMock} />, { route });

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const row = screen.getAllByTestId("TokensTableRow")[0];
		await user.click(row);

		expect(onClickMock).toHaveBeenCalled();
	});

	it("should call handleSend when send button is clicked", async () => {
		const user = userEvent.setup();
		const handleSendMock = vi.fn();

		vi.spyOn(useWalletActionsHook, "useWalletActions").mockReturnValue({
			handleSend: handleSendMock,
		});

		render(<TokensTable />, { route });

		await waitFor(() => {
			expect(screen.getAllByTestId("TokensTableRow")[0]).toBeInTheDocument();
		});

		const sendButton = screen.getAllByRole("button", { name: /send/i })[0];
		await user.click(sendButton);

		expect(handleSendMock).toHaveBeenCalledTimes(1);
	});

	it("should toggle hide dust tokens", async () => {
		render(<TokensTable />, {
			route,
		});

		expect(screen.getByTestId("TokenList")).toBeInTheDocument();

		await userEvent.click(screen.getAllByTestId("HideDustTokens")[0]);

		expect(screen.getAllByTestId("HideDustTokens")[0]).toBeEnabled();
	});

	it("should show manage actions when Manage button is clicked", async () => {
		render(<TokensTable />, {
			route,
		});

		await expect(screen.findAllByTestId("TokensTable_Manage")).resolves.toHaveLength(2);

		await userEvent.click(screen.getAllByTestId("TokensTable_Manage")[0]);

		expect(screen.queryByTestId("TokensTable_Manage")).not.toBeInTheDocument();

		expect(screen.getAllByTestId("TokensTable_Cancel")).toHaveLength(2);
		expect(screen.getAllByTestId("TokensTable_Save")).toHaveLength(2);
	});
});
