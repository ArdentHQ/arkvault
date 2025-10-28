import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { ConfigurationProvider } from "@/app/contexts";
import { env, getMainsailProfileId, render, screen } from "@/utils/testing-library";
import { MigrationResultModal } from "./MigrationResultModal";
import { ProfileData } from "@/app/lib/profiles/profile.enum.contract";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;

const Wrapper = ({ profileIsSyncing = false }: { profileIsSyncing?: boolean }) => (
	<ConfigurationProvider defaultConfiguration={{ profileIsSyncing }}>
		<MigrationResultModal profile={profile} />
	</ConfigurationProvider>
);

describe("MigrationResultModal", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());
	});

	beforeEach(() => {
		profile.data().set(ProfileData.MigrationResult, {});
	});

	it("should not render modal when there is no migration result", () => {
		render(<Wrapper />);

		expect(screen.queryByText("Migration Result")).not.toBeInTheDocument();
	});

	it("should render modal with cold addresses", () => {
		const migrationResult = {
			coldAddresses: [{ ADDRESS: "0x123456789" }, { ADDRESS: "0xabcdefghi" }],
			coldContacts: [],
			duplicateAddresses: [],
			duplicateContacts: [],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper />);

		expect(screen.getByText("Cold addresses & contacts")).toBeInTheDocument();
		expect(screen.getByText(/0x123456789/)).toBeInTheDocument();
		expect(screen.getByText(/0xabcdefghi/)).toBeInTheDocument();
	});

	it("should render modal with cold contacts", () => {
		const migrationResult = {
			coldAddresses: [],
			coldContacts: [
				{ address: "0xalice123", name: "Alice" },
				{ address: "0xbob456", name: "Bob" },
			],
			duplicateAddresses: [],
			duplicateContacts: [],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper />);

		expect(screen.getByText("Cold addresses & contacts")).toBeInTheDocument();
		expect(screen.getByText(/Alice/)).toBeInTheDocument();
		expect(screen.getByText(/0xalice123/)).toBeInTheDocument();
		expect(screen.getByText(/Bob/)).toBeInTheDocument();
		expect(screen.getByText(/0xbob456/)).toBeInTheDocument();
	});

	it("should render modal with duplicate addresses", () => {
		const migrationResult = {
			coldAddresses: [],
			coldContacts: [],
			duplicateAddresses: [
				{
					ADDRESS: "0xold1",
					duplicateAddress: "0xold2",
					newAddress: "0xnew1",
				},
			],
			duplicateContacts: [],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper />);

		expect(screen.getByText("Duplicate addresses & contacts")).toBeInTheDocument();
		expect(screen.getByText(/0xold1/)).toBeInTheDocument();
		expect(screen.getByText(/0xold2/)).toBeInTheDocument();
		expect(screen.getByText(/0xnew1/)).toBeInTheDocument();
	});

	it("should render modal with duplicate contacts", () => {
		const migrationResult = {
			coldAddresses: [],
			coldContacts: [],
			duplicateAddresses: [],
			duplicateContacts: [
				{
					addresses: [{ address: "0xcontactnew", oldAddress: "0xcontact1old" }],
					duplicateContact: {
						oldAddress: "0xcontact2old",
						oldName: "Contact2",
					},
					name: "MergedContact",
					oldName: "Contact1",
				},
			],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper />);

		expect(screen.getByText("Duplicate addresses & contacts")).toBeInTheDocument();
		expect(screen.getByText(/Contact1/)).toBeInTheDocument();
		expect(screen.getByText(/Contact2/)).toBeInTheDocument();
		expect(screen.getByText(/MergedContact/)).toBeInTheDocument();
		expect(screen.getByText(/0xcontact1old/)).toBeInTheDocument();
		expect(screen.getByText(/0xcontact2old/)).toBeInTheDocument();
		expect(screen.getByText(/0xcontactnew/)).toBeInTheDocument();
	});

	it("should clear migration result when Continue button is clicked", async () => {
		const user = userEvent.setup();

		const migrationResult = {
			coldAddresses: [{ ADDRESS: "0x123456789" }],
			coldContacts: [],
			duplicateAddresses: [],
			duplicateContacts: [],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper />);

		expect(screen.getByText("Migration Result")).toBeInTheDocument();

		await user.click(screen.getByTestId("WelcomeModal-next"));

		expect(profile.data().get(ProfileData.MigrationResult)).toEqual({});
	});

	it("should not show modal when profileIsSyncing is true", () => {
		const migrationResult = {
			coldAddresses: [{ ADDRESS: "0x123456789" }],
			coldContacts: [],
			duplicateAddresses: [],
			duplicateContacts: [],
		};

		profile.data().set(ProfileData.MigrationResult, migrationResult);

		render(<Wrapper profileIsSyncing={true} />);

		expect(screen.queryByText("Migration Result")).not.toBeInTheDocument();
	});
});
