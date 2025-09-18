import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import userEvent from "@testing-library/user-event";
import { SelectAddressStep, AddressesTable, ADDRESSES_PER_BATCH } from "./SelectAddressStep";
import { AddressData } from "./HDWalletsTabs.contracts";
import { Networks } from "@/app/lib/mainsail";
import {
	env,
	render,
	screen,
	waitFor,
	getMainsailProfileId,
	getDefaultMainsailWalletMnemonic,
} from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";

const fixtureProfileId = getMainsailProfileId();
const route = `/profiles/${fixtureProfileId}/dashboard`;

const mnemonic = getDefaultMainsailWalletMnemonic();

const addressIndex0 = "0xe37F40bC165c670Eb50367C43f5581cFDA897320";

const mockAddresses: AddressData[] = [
	{
		address: addressIndex0,
		balance: 100,
		levels: { account: 0, addressIndex: 0, change: 0 },
		path: "m/44'/111'/0'/0/0",
	},
	{
		address: "0x27bFB53D7D43Fb438B4C6fF4965A2532a6403CCc",
		balance: 250,
		levels: { account: 0, addressIndex: 1, change: 0 },
		path: "m/44'/111'/0'/0/1",
	},
	{
		address: "0x8C400C31e1b256c90C9DA1068AbaF775E6aEe6A6",
		balance: 0,
		levels: { account: 0, addressIndex: 2, change: 0 },
		path: "m/44'/111'/0'/0/2",
	},
];

describe("AddressesTable", () => {
	let profile: Contracts.IProfile;

	const defaultProps = {
		isLoading: false,
		isSelected: vi.fn().mockReturnValue(false),
		loadMore: vi.fn(),
		network: {} as Networks.Network,
		selectedWallets: [],
		toggleSelect: vi.fn(),
		toggleSelectAll: vi.fn(),
		wallets: mockAddresses,
	};


	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		defaultProps.network = profile.activeNetwork();
	});

	it("should render addresses table", async () => {
		render(<AddressesTable {...defaultProps} />);

		expect(screen.getAllByText(addressIndex0).length).toBeTruthy();
		expect(screen.getAllByText("100 ARK").length).toBeTruthy();
	});

	it("should handle address selection", async () => {
		const user = userEvent.setup();
		const toggleSelect = vi.fn();

		render(<AddressesTable {...defaultProps} toggleSelect={toggleSelect} />);

		const firstCheckbox = screen.getAllByTestId("SelectAddressStep__checkbox-row")[0];
		await user.click(firstCheckbox);

		expect(toggleSelect).toHaveBeenCalledWith(mockAddresses[0]);
	});

	it("should handle select all functionality", async () => {
		const user = userEvent.setup();
		const toggleSelectAll = vi.fn();

		render(<AddressesTable {...defaultProps} toggleSelectAll={toggleSelectAll} />);

		const selectAllCheckbox = screen.getByTestId("SelectAddressStep__select-all");
		await user.click(selectAllCheckbox);

		expect(toggleSelectAll).toHaveBeenCalled();
	});

	it("should show selected state correctly", () => {
		const isSelected = vi.fn().mockImplementation((address) => address.path === "m/44'/111'/0'/0/0");

		render(<AddressesTable {...defaultProps} isSelected={isSelected} selectedWallets={[mockAddresses[0]]} />);

		const checkboxes = screen.getAllByTestId("SelectAddressStep__checkbox-row");
		expect(checkboxes[0]).toBeChecked();
		expect(checkboxes[1]).not.toBeChecked();
	});

	it("should handle load more functionality", async () => {
		const user = userEvent.setup();
		const loadMore = vi.fn();

		render(<AddressesTable {...defaultProps} loadMore={loadMore} />);

		const loadMoreButton = screen.getByTestId("SelectAddressStep__load-more");
		await user.click(loadMoreButton);

		expect(loadMore).toHaveBeenCalled();
	});

	it("should show loading state", () => {
		render(<AddressesTable {...defaultProps} isLoading={true} />);

		expect(screen.getByText(/Loading Addresses/)).toBeInTheDocument();
	});

	it("should show select all as checked when all addresses are selected", () => {
		render(<AddressesTable {...defaultProps} selectedWallets={mockAddresses} />);

		const selectAllCheckbox = screen.getByTestId("SelectAddressStep__select-all");
		expect(selectAllCheckbox).toBeChecked();
	});

	it("should handle mobile view", () => {
		render(<AddressesTable {...defaultProps} />);

		const mobileSelectAll = screen.getByTestId("SelectAddressStep__select-all-mobile");
		expect(mobileSelectAll).toBeInTheDocument();
	});
});

const FormWrapper = ({ children, defaultValues = {} }: { children: React.ReactNode; defaultValues?: any }) => {
	const form = useForm({
		defaultValues: {
			mnemonic,
			...defaultValues,
		},
		mode: "onChange",
	});

	form.register("mnemonic");

	return <FormProvider {...form}>{children}</FormProvider>;
};

describe("SelectAddressStep", () => {
	let profile: Contracts.IProfile;
	let network: any;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		network = profile.activeNetwork();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should render select address step", async () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		expect(screen.getByTestId("SelectAddressStep")).toBeInTheDocument();

		unmount();
	});

	it("should load addresses on mount", async () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		await waitFor(() => expect(screen.queryByText(/Loading Addresses/)).not.toBeInTheDocument());

		// Wait for addresses to be generated and displayed
		expect(screen.getAllByText(addressIndex0).length).toBeTruthy();

		unmount();
	});

	it("should handle address selection", async () => {
		const user = userEvent.setup();

		const { unmount } = render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		await waitFor(() => expect(screen.queryByText(/Loading Addresses/)).not.toBeInTheDocument());

		// Wait for addresses to be generated and displayed
		expect(screen.getAllByText(addressIndex0).length).toBeTruthy();

		const checkbox = screen.getAllByTestId("SelectAddressStep__checkbox-row")[0];
		await user.click(checkbox);

		// Should update form with selected address
		await waitFor(() => {
			expect(checkbox).toBeChecked();
		});

		unmount();
	});

	it("should handle select all functionality", async () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep__select-all")).toBeInTheDocument();
		});

		const selectAllButton = screen.getByTestId("SelectAddressStep__select-all");
		await userEvent.click(selectAllButton);

		const checkboxes = screen.getAllByTestId("SelectAddressStep__checkbox-row");

		// Should select all visible addresses
		await waitFor(() => {
			for (const checkbox of checkboxes) {
				expect(checkbox).toBeChecked();
			}
		});

		unmount();
	});

	it("should load more addresses", async () => {
		const { unmount } = render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		await waitFor(() => {
			expect(screen.getByTestId("SelectAddressStep__load-more")).toBeInTheDocument();
		});

		const loadMoreButton = screen.getByTestId("SelectAddressStep__load-more");
		await userEvent.click(loadMoreButton);

		// Should load more addresses
		await waitFor(() => {
			expect(screen.getAllByTestId("Address__address").length).toBe(12);
		});

		unmount();
	});

	it("should handle empty addresses by showing only first address", async () => {
		render(
			<FormWrapper>
				<SelectAddressStep network={network} profile={profile} />
			</FormWrapper>,
			{ route },
		);

		await waitFor(() => expect(screen.queryByText(/Loading Addresses/)).not.toBeInTheDocument());

		// Component should handle empty addresses properly by showing at least the first one
		const addressRows = screen.getAllByTestId("SelectAddressStep__checkbox-row");
		expect(addressRows.length).toBe(1);
	});
});
