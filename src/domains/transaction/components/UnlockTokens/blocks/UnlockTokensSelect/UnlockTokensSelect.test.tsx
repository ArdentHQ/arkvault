import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { UnlockTokensSelect } from "./UnlockTokensSelect";
import * as useFeesHook from "@/app/hooks/use-fees";
import { buildTranslations } from "@/app/i18n/helpers";
import {
	UnlockableBalance,
	UnlockTokensFormState,
} from "@/domains/transaction/components/UnlockTokens/UnlockTokens.contracts";
import { env, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";

const translations = buildTranslations();

describe("UnlockTokensSelect", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	const fee = 1.1;

	const items: UnlockableBalance[] = [
		{
			address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			amount: BigNumber.make(10),
			height: "123",
			id: "1",
			isReady: true,
			timestamp: DateTime.make("2020-06-01T00:00:00.000Z"), // 1 month ago
		},
		{
			address: "D9YiyRYMBS2ofzqkufjrkB9nHofWgJLM7f",
			amount: BigNumber.make(20),
			height: "234",
			id: "2",
			isReady: true,
			timestamp: DateTime.make("2020-06-15T00:00:00.000Z"), // 2 weeks ago
		},
		{
			address: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
			amount: BigNumber.make(30),
			height: "345",
			id: "3",
			isReady: false,
			timestamp: DateTime.make("2020-08-01T00:00:00.000Z"), // unlockable in 1 month
		},
		{
			address: "DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
			amount: BigNumber.make(40),
			height: "456",
			id: "4",
			isReady: false,
			timestamp: DateTime.make("2020-09-01T00:00:00.000Z"), // unlockable in 2 months
		},
	];

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		wallet = profile.wallets().first();

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: fee, max: fee, min: fee, static: fee }),
		});
	});

	const Wrapper = ({ children }: any) => {
		const form = useForm<UnlockTokensFormState>({
			defaultValues: {
				amount: 0,
				fee: 0,
				selectedObjects: [],
			},
			mode: "onChange",
		});

		const { register } = form;

		useEffect(() => {
			register("amount");
			register("fee");
			register("selectedObjects");
		}, [register]);

		return <FormProvider {...form}>{children}</FormProvider>;
	};

	it("should render", async () => {
		const onClose = vi.fn();

		const { asFragment } = render(
			<Wrapper>
				<UnlockTokensSelect
					items={items}
					loading={false}
					wallet={wallet}
					profile={profile}
					onClose={onClose}
					onUnlock={vi.fn()}
				/>
			</Wrapper>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(4));

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByText(translations.COMMON.CLOSE));

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("should render loading", async () => {
		render(
			<Wrapper>
				<UnlockTokensSelect
					items={[]}
					loading={true}
					wallet={wallet}
					profile={profile}
					onClose={vi.fn()}
					onUnlock={vi.fn()}
				/>
			</Wrapper>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(3));

		// eslint-disable-next-line testing-library/no-node-access
		expect(screen.getAllByTestId("TableRow")[0].querySelector(".react-loading-skeleton")).toBeInTheDocument();
	});

	it("should render empty", async () => {
		const { asFragment } = render(
			<Wrapper>
				<UnlockTokensSelect
					items={[]}
					loading={false}
					wallet={wallet}
					profile={profile}
					onClose={vi.fn()}
					onUnlock={vi.fn()}
				/>
			</Wrapper>,
		);

		await expect(screen.findByTestId("EmptyBlock")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should pre-select unlockable items on first load", async () => {
		render(
			<Wrapper>
				<UnlockTokensSelect
					isFirstLoad={true}
					items={items}
					loading={false}
					wallet={wallet}
					profile={profile}
					onClose={vi.fn()}
					onUnlock={vi.fn()}
				/>
			</Wrapper>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(4));

		expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(3);
	});

	it("should allow selection of unlockable items", async () => {
		const onUnlock = vi.fn();

		render(
			<Wrapper>
				<UnlockTokensSelect
					items={items}
					loading={false}
					wallet={wallet}
					profile={profile}
					onClose={vi.fn()}
					onUnlock={onUnlock}
				/>
			</Wrapper>,
		);

		await waitFor(() => expect(screen.getAllByTestId("TableRow")).toHaveLength(4));

		const getAmount = () => within(screen.getAllByTestId("UnlockTokensTotal")[0]).getByTestId("Amount").textContent;
		const getFees = () => within(screen.getAllByTestId("UnlockTokensTotal")[1]).getByTestId("Amount").textContent;

		expect(getAmount()).toBe("0 DARK");
		expect(getFees()).toBe("0 DARK");

		expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(5); // one for selectAll + one for each item

		// select single

		await userEvent.click(screen.getAllByRole("checkbox")[1]);

		expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(1);
		expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(4);

		await waitFor(() => expect(getAmount()).toBe("+ 10 DARK"));

		expect(getFees()).toBe("- 1.1 DARK");

		// toggle select single

		userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(5));

		expect(getAmount()).toBe("0 DARK");
		expect(getFees()).toBe("0 DARK");

		// select all

		userEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(3));

		expect(getAmount()).toBe("+ 30 DARK");
		expect(getFees()).toBe("- 1.1 DARK");

		// toggle select all (uncheck all)

		userEvent.click(screen.getAllByRole("checkbox")[0]);

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: false })).toHaveLength(5));

		expect(getAmount()).toBe("0 DARK");
		expect(getFees()).toBe("0 DARK");

		// unlock

		await userEvent.click(screen.getAllByRole("checkbox")[1]);

		await waitFor(() => expect(screen.getAllByRole("checkbox", { checked: true })).toHaveLength(1));

		await userEvent.click(screen.getByText(translations.TRANSACTION.UNLOCK_TOKENS.UNLOCK));

		expect(onUnlock).toHaveBeenCalledTimes(1);
	});
});
