import Transport from "@ledgerhq/hw-transport";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";

import { LedgerImportStep } from "./LedgerImportStep";
import { LedgerData } from "@/app/contexts";
import { LedgerProvider } from "@/app/contexts/Ledger/Ledger";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { env, getDefaultProfileId, renderResponsive, screen, waitFor } from "@/utils/testing-library";

describe("LedgerImportStep", () => {
	let profile: Contracts.IProfile;
	let transport: typeof Transport;

	const derivationPath = "m/44'/1'/0'/0/3";

	const ledgerWallets: LedgerData[] = [
		{ address: "DJpFwW39QnQvQRQJF2MCfAoKvsX4DJ28jq", balance: 0, path: derivationPath },
		{ address: "DRgF3PvzeGWndQjET7dZsSmnrc6uAy23ES", isNew: true, path: derivationPath },
	];

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		for (const { address, path } of ledgerWallets) {
			const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
				address,
				coin: "ARK",
				network: "ark.devnet",
				path,
			});

			profile.wallets().push(wallet);

			wallet.mutator().alias(
				getDefaultAlias({
					network: wallet.network(),
					profile,
				}),
			);
		}

		vi.useFakeTimers({shouldAdvanceTime: true});
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();

		for (const { address } of ledgerWallets) {
			const wallet = profile.wallets().findByAddressWithNetwork(address, "ark.devnet");

			if (wallet) {
				profile.wallets().forget(wallet.id());
			}
		}
	});

	const renderComponent = (breakpoint: string, wallets: LedgerData[] = ledgerWallets) => {
		const onClickEditWalletName = vi.fn();

		const network = profile.wallets().findByAddressWithNetwork(wallets[0].address, "ark.devnet")?.network();

		const Component = () => {
			const form = useForm<any>({
				defaultValues: { network },
			});

			return (
				<FormProvider {...form}>
					<LedgerProvider transport={transport}>
						<LedgerImportStep
							onClickEditWalletName={onClickEditWalletName}
							wallets={wallets}
							profile={profile}
						/>
					</LedgerProvider>
				</FormProvider>
			);
		};

		return {
			...renderResponsive(<Component />, breakpoint),
			onClickEditWalletName,
		};
	};

	it.each(["xs", "lg"])("should render with single import (%s)", (breakpoint) => {
		const { container, onClickEditWalletName } = renderComponent(breakpoint, ledgerWallets.slice(1));

		userEvent.click(screen.getByTestId("LedgerImportStep__edit-alias"));

		//@TODO: Fix this test
		/* expect(onClickEditWalletName).toHaveBeenCalledTimes(1); */
		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "lg"])("should render with multiple import", async (breakpoint) => {
		const { container, onClickEditWalletName } = renderComponent(breakpoint);

		await waitFor(() => expect(screen.getAllByTestId("LedgerImportStep__edit-alias")).toHaveLength(2));

		userEvent.click(screen.getAllByTestId("LedgerImportStep__edit-alias")[0]);

		//@TODO: Fix this test
		/* expect(onClickEditWalletName).toHaveBeenCalledTimes(1); */
		expect(container).toMatchSnapshot();
	});
});
