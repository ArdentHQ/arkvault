import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import React from "react";

import { data } from "@/tests/fixtures/coins/ark/devnet/delegates.json";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { ValidatorRowMobile } from "./ValidatorRowMobile";

let wallet: Contracts.IReadWriteWallet;
let validator: Contracts.IReadOnlyWallet;

describe("DelegateRowMobile", () => {
	beforeAll(() => {
		const profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().values()[0];

		validator = new ReadOnlyWallet({
			address: data[0].address,
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: data[0].publicKey,
			username: data[0].username,
		});
	});

	it("should render", () => {
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getAllByTestId("DelegateRowMobile")[0]).toBeInTheDocument();
	});

	it("should render mobile skeleton while loading", () => {
		render(
			<table>
				<tbody>
					<ValidatorRowMobile
						index={0}
						validator={validator}
						selectedVotes={[]}
						selectedUnvotes={[]}
						isLoading={true}
						availableBalance={wallet.balance()}
						setAvailableBalance={vi.fn()}
						toggleUnvotesSelected={vi.fn()}
						toggleVotesSelected={vi.fn()}
						selectedWallet={wallet}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getAllByTestId("ValidatorRowMobileSkeleton")[0]).toBeInTheDocument();
	});
});
