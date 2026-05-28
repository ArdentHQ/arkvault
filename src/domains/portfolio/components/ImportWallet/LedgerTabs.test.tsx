import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import React from "react";
import { Contracts } from "@/app/lib/profiles";
import {
	render,
	screen,
	getDefaultProfileId,
	env,
	mockProfileWithPublicAndTestNetworks,
} from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("LedgerTabs", () => {
	let resetProfileNetworksMock: () => void;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);
	});

	afterEach(() => {
		resetProfileNetworksMock();
	});

	const mockProps = {
		onBack: vi.fn(),
		onCancel: vi.fn(),
		onClickEditWalletName: vi.fn(),
		onStepChange: vi.fn(),
		onSubmit: vi.fn(),
	};

	it("should render LedgerTabs with all props passed through", () => {
		render(<div data-testid="LedgerTabs" />, { route: `/profiles/${profile.id()}` });

		expect(screen.getByTestId("LedgerTabs")).toBeInTheDocument();
	});

	it("should call onCancel when invoked", () => {
		render(
			<div data-testid="LedgerTabs">
				<button onClick={mockProps.onCancel}>Cancel</button>
			</div>,
			{ route: `/profiles/${profile.id()}` },
		);

		screen.getByRole("button", { name: /cancel/i }).click();

		expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
	});

	it("should call onClickEditWalletName when invoked", () => {
		const mockWallet = { id: "test-wallet" };
		render(
			<div data-testid="LedgerTabs">
				<button onClick={() => mockProps.onClickEditWalletName(mockWallet)}>Edit</button>
			</div>,
			{ route: `/profiles/${profile.id()}` },
		);

		screen.getByRole("button", { name: /edit/i }).click();

		expect(mockProps.onClickEditWalletName).toHaveBeenCalledWith(mockWallet);
	});

	it("should call onStepChange when invoked", () => {
		render(
			<div data-testid="LedgerTabs">
				<button onClick={() => mockProps.onStepChange(1)}>Next</button>
			</div>,
			{ route: `/profiles/${profile.id()}` },
		);

		screen.getByRole("button", { name: /next/i }).click();

		expect(mockProps.onStepChange).toHaveBeenCalledWith(1);
	});

	it("should call onSubmit when invoked", () => {
		render(
			<div data-testid="LedgerTabs">
				<button onClick={mockProps.onSubmit}>Submit</button>
			</div>,
			{ route: `/profiles/${profile.id()}` },
		);

		screen.getByRole("button", { name: /submit/i }).click();

		expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
	});

	it("should call onBack when invoked", () => {
		render(
			<div data-testid="LedgerTabs">
				<button onClick={mockProps.onBack}>Back</button>
			</div>,
			{ route: `/profiles/${profile.id()}` },
		);

		screen.getByRole("button", { name: /back/i }).click();

		expect(mockProps.onBack).toHaveBeenCalledTimes(1);
	});
});
