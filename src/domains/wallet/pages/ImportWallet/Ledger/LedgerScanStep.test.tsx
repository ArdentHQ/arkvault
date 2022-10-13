import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import nock from "nock";
import React from "react";
import { FormProvider, useForm, UseFormMethods } from "react-hook-form";

import { Networks } from "@ardenthq/sdk";
import { LedgerScanStep } from "./LedgerScanStep";
import { env, getDefaultProfileId, render, renderResponsive, screen, waitFor } from "@/utils/testing-library";
import { toasts } from "@/app/services";
import { vi } from "vitest";
import { server, requestMockOnce, requestMock } from "@/tests/mocks/server";
let formReference: UseFormMethods<{ network: Networks.Network }>;

const validLedgerWallet = () =>
	expect(formReference.getValues("wallets")).toMatchObject([{ address: "DQseW3VJ1db5xN5xZi4Qhn6AFWtcwSwzpG" }]);

describe("LedgerScanStep", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let publicKeyPaths: Map<string, string>;

	beforeEach(async () => {
		server.use(
			requestMockOnce("https://ark-test.arkvault.io/api/wallets", {
				data: [
					{
						address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
						balance: "2",
					},
					{
						address: "DSyG9hK9CE8eyfddUoEvsga4kNVQLdw2ve",
						balance: "3",
					},
				],
				meta: {},
			}),
			requestMock("https://ark-test.arkvault.io/api/wallets", { data: [], meta: {} }),
		);

		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();
		await wallet.synchroniser().identity();

		publicKeyPaths = new Map([
			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/0'/0/1", "03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff"],
			["m/44'/1'/0'/0/2", "025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca"],
			["m/44'/1'/0'/0/3", "024d5eacc5e05e1b05c476b367b7d072857826d9b271e07d3a3327224db8892a21"],
			["m/44'/1'/0'/0/4", "025d7298a7a472b1435e40df13491e98609b9b555bf3ef452b2afea27061d11235"],

			["m/44'/1'/0'/0/0", "027716e659220085e41389efc7cf6a05f7f7c659cf3db9126caabce6cda9156582"],
			["m/44'/1'/1'/0/0", wallet.publicKey()!],
			["m/44'/1'/2'/0/0", "020aac4ec02d47d306b394b79d3351c56c1253cd67fe2c1a38ceba59b896d584d1"],
			["m/44'/1'/3'/0/0", "033a5474f68f92f254691e93c06a2f22efaf7d66b543a53efcece021819653a200"],
			["m/44'/1'/4'/0/0", "03d3c6889608074b44155ad2e6577c3368e27e6e129c457418eb3e5ed029544e8d"],
		]);

		vi.spyOn(wallet.coin().ledger(), "getPublicKey").mockImplementation((path) =>
			Promise.resolve(publicKeyPaths.get(path)!),
		);

		vi.spyOn(wallet.coin().ledger(), "getExtendedPublicKey").mockResolvedValue(wallet.publicKey()!);
	});

	const Component = ({ isCancelling = false }: { isCancelling?: boolean }) => {
		formReference = useForm({
			defaultValues: {
				network: wallet.network(),
			},
		});

		return (
			<FormProvider {...formReference}>
				<LedgerScanStep profile={profile} cancelling={isCancelling} />
			</FormProvider>
		);
	};

	it("should handle select", async () => {
		render(<Component />);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		userEvent.click(screen.getByTestId("LedgerScanStep__select-all"));

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(2));

		// Unselect All

		userEvent.click(screen.getByTestId("LedgerScanStep__select-all"));

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(2));

		// Select just first

		userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(formReference.getValues("wallets")).toHaveLength(1));

		userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(formReference.getValues("wallets")).toHaveLength(0));
	});

	it.each(["xs", "lg"])("should render responsive (%s)", async (breakpoint) => {
		const { container } = renderResponsive(<Component />, breakpoint);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		await expect(screen.findByText("DQseW3VJ1db5xN5xZi4Qhn6AFWtcwSwzpG")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(2));

		await waitFor(() =>
			expect(formReference.getValues("wallets")).toMatchObject([
				{
					address: "DQseW3VJ1db5xN5xZi4Qhn6AFWtcwSwzpG",
					balance: 0,
					path: "m/44'/1'/0'/0/0",
				},
			]),
		);

		const checkboxSelectAll = screen.getAllByRole("checkbox")[0];
		const checkboxFirstItem = screen.getAllByRole("checkbox")[1];

		userEvent.click(checkboxSelectAll);

		await waitFor(() => expect(formReference.getValues("wallets")).toMatchObject([]));

		userEvent.click(checkboxSelectAll);

		await waitFor(validLedgerWallet);

		userEvent.click(checkboxFirstItem);

		await waitFor(() => expect(formReference.getValues("wallets")).toMatchObject([]));

		userEvent.click(checkboxFirstItem);

		await waitFor(validLedgerWallet);

		expect(container).toMatchSnapshot();
	});

	it("should render compact table", async () => {
		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, true);

		const { container } = render(<Component />);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		expect(container).toMatchSnapshot();

		profile.settings().set(Contracts.ProfileSetting.UseExpandedTables, false);
	});

	it("should update the toast messages if already added", async () => {
		const toastUpdateSpy = vi.spyOn(toasts, "update");

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(false);

		vi.spyOn(toasts, "isActive").mockReturnValueOnce(true);

		render(<Component />);

		await waitFor(() => expect(screen.getAllByRole("row")).toHaveLength(6));

		await expect(screen.findByText("DQseW3VJ1db5xN5xZi4Qhn6AFWtcwSwzpG")).resolves.toBeVisible();

		await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(2));

		expect(toastUpdateSpy).toHaveBeenCalledTimes(1);

		expect(toastUpdateSpy).toHaveBeenCalledWith("wallet-loading", "success", expect.anything());

		vi.restoreAllMocks();
	});

	it("should render cancelling screen", async () => {
		const { container } = render(<Component isCancelling />);
		// eslint-disable-next-line testing-library/prefer-explicit-assert
		await screen.findByTestId("LedgerCancellingScreen");

		expect(container).toMatchSnapshot();
	});
});
