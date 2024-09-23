/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useTranslation } from "react-i18next";
import { Route } from "react-router-dom";

import { AddParticipant } from "./AddParticipant";
import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import walletFixture from "@/tests/fixtures/coins/ark/devnet/wallets/D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib.json";
import coldWalletFixture from "@/tests/fixtures/coins/ark/devnet/wallets/DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P.json";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { server, requestMock } from "@/tests/mocks/server";

const ARKTestURL = "https://ark-test.arkvault.io";
const walletsURLPath = "/api/wallets";
const dataErrorText = "data-errortext";

describe("Add Participant", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;
	let wallet2: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		wallet = profile.wallets().first();
		wallet2 = profile.wallets().last();

		await profile.sync();
	});

	it("should fail to find", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyiba");

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyiba");
		});

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();
		});

		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
			dataErrorText,
			t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_NOT_FOUND"),
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle exception on find and show address not found error", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		const walletFindMock = vi.spyOn(profile.wallets(), "findByAddressWithNetwork").mockImplementation(() => {
			throw new Error("error");
		});

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyiba");

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyiba");
		});

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();
		});

		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
			dataErrorText,
			t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_NOT_FOUND"),
		);
		expect(asFragment()).toMatchSnapshot();

		walletFindMock.mockRestore();
	});

	it("should fail with cold wallet", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(
				`${ARKTestURL}${walletsURLPath}`,
				{
					data: [coldWalletFixture.data],
					meta: { count: 1, pageCount: 1, totalCount: 1 },
				},
				{
					query: {
						address: "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
					},
				},
			),
		);

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P");

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P");
		});

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();
		});

		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
			dataErrorText,
			t("TRANSACTION.MULTISIGNATURE.ERROR.PUBLIC_KEY_NOT_FOUND"),
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should fail with a duplicate address", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant
					profile={profile}
					wallet={wallet}
					defaultParticipants={[
						{
							address: wallet.address(),
							publicKey: wallet.publicKey()!,
						},
					]}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet.address());

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(wallet.address());
		});

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();
		});

		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
			dataErrorText,
			t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_ALREADY_ADDED"),
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should fail if cannot find the address remotely", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		server.use(
			requestMock(
				`${ARKTestURL}${walletsURLPath}`,
				{
					data: [],
					meta: { count: 0, pageCount: 1, totalCount: 0 },
				},
				{
					query: {
						address: "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
					},
				},
			),
		);

		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), "DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq20");

		await waitFor(() => {
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq20");
		});

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => {
			expect(screen.getAllByTestId("Input__error")[0]).toBeVisible();
		});

		expect(screen.getAllByTestId("Input__error")[0]).toHaveAttribute(
			dataErrorText,
			t("TRANSACTION.MULTISIGNATURE.ERROR.ADDRESS_NOT_FOUND"),
		);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should work with an imported wallet", async () => {
		const onChange = vi.fn();
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} onChange={onChange} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), profile.wallets().last().address());

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));

		expect(onChange).toHaveBeenCalledWith([
			{
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				alias: "ARK Wallet 1",
				publicKey: "03df6cd794a7d404db4f1b25816d8976d0e72c5177d17ac9b19a92703b62cdbbbc",
			},
			{
				address: "D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
				alias: "ARK Wallet 2",
				publicKey: "03af2feb4fc97301e16d6a877d5b135417e8f284d40fac0f84c09ca37f82886c51",
			},
		]);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should work with a remote wallet", async () => {
		server.use(
			requestMock(`${ARKTestURL}${walletsURLPath}`, {
				data: [walletFixture.data],
				meta: { count: 1, pageCount: 1, totalCount: 1 },
			}),
		);

		render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await userEvent.type(screen.getByTestId("SelectDropdown__input"), walletFixture.data.address);

		await waitFor(() =>
			expect(screen.getByTestId("SelectDropdown__input")).toHaveValue(walletFixture.data.address),
		);

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));
	});

	it("should render custom participants", () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId">
				<AddParticipant
					profile={profile}
					wallet={wallet}
					defaultParticipants={[
						{
							address: wallet2.address(),
							publicKey: wallet2.publicKey()!,
						},
					]}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should clear participant field when address is added", async () => {
		server.use(
			requestMock(`${ARKTestURL}${walletsURLPath}`, {
				data: [walletFixture.data],
				meta: { count: 1, pageCount: 1, totalCount: 1 },
			}),
		);

		render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		expect(screen.queryAllByTestId("AddParticipantItem")).toHaveLength(1);

		expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue();

		// add participant
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), wallet2.address());

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.queryAllByTestId("AddParticipantItem")).toHaveLength(2));

		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue());

		// add participant
		await userEvent.type(screen.getByTestId("SelectDropdown__input"), walletFixture.data.address);

		await userEvent.click(screen.getByText(transactionTranslations.MULTISIGNATURE.ADD_PARTICIPANT));

		await waitFor(() => expect(screen.queryAllByTestId("AddParticipantItem")).toHaveLength(3));

		await waitFor(() => expect(screen.getByTestId("SelectDropdown__input")).not.toHaveValue());
	});

	it.each([
		"AddParticipantItem--deleteButton",
		"AddParticipantItem--mobile-deleteButton"
	])("should remove participant", async (selector) => {
		const onChange = vi.fn();

		render(
			<Route path="/profiles/:profileId">
				<AddParticipant
					profile={profile}
					wallet={wallet}
					onChange={onChange}
					defaultParticipants={[
						{
							address: wallet.address(),
							publicKey: wallet.publicKey()!,
						},
						{
							address: wallet2.address(),
							publicKey: wallet2.publicKey()!,
						},
					]}
				/>
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(2));

		expect(screen.getAllByTestId(selector)[1]).not.toBeDisabled();

		await userEvent.click(screen.getAllByTestId(selector)[1]);

		expect(onChange).toHaveBeenCalledWith([
			{
				address: wallet.address(),
				publicKey: wallet.publicKey()!,
			},
		]);
	});

	it("should not remove own address", async () => {
		render(
			<Route path="/profiles/:profileId">
				<AddParticipant profile={profile} wallet={wallet} />
			</Route>,
			{
				route: `/profiles/${profile.id()}`,
			},
		);

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(1));

		expect(screen.getByTestId("AddParticipantItem--deleteButton")).toBeDisabled();

		await userEvent.click(screen.getByTestId("AddParticipantItem--deleteButton"));

		await waitFor(() => expect(screen.getAllByTestId("AddParticipantItem")).toHaveLength(1));
	});
});
