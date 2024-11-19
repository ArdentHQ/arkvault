import { Networks } from "@ardenthq/sdk";
import { ARK } from "@ardenthq/sdk-ark";
import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import * as useFeesHook from "@/app/hooks/use-fees";
import { toasts } from "@/app/services";
import { translations } from "@/domains/transaction/i18n";

import { useValidation } from "@/app/hooks";
import { FeeField } from "@/domains/transaction/components/FeeField/FeeField";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

describe("FeeField", () => {
	let profile: Contracts.IProfile;

	const networks = new Networks.Network(ARK.manifest, ARK.manifest.networks["ark.devnet"]);

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	const Component = ({ balance = 10, network = networks, type, data }: any) => {
		const form = useForm({ mode: "onChange" });

		const { register, watch } = form;
		const { common } = useValidation();
		const { fees } = watch();

		register("fee");
		register("fees", common.fee(balance, network, fees));
		register("inputFeeSettings");

		return (
			<FormProvider {...form}>
				<FeeField type={type} data={data} network={network} profile={profile} />
			</FormProvider>
		);
	};

	it("should render", async () => {
		const { asFragment } = render(<Component type="transfer" />);

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not show warning toast when transaction fees are equal to the previous fees", async () => {
		let useFeesSpy: vi.SpyInstance;

		useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: 1, isDynamic: true, max: 1, min: 1, static: 1 }),
		});

		const toastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const { rerender } = render(
			<Component type="transfer" data={{ amount: 1, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }} />,
		);

		await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK"));

		useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: 1, isDynamic: true, max: 1, min: 1, static: 1 }),
		});

		rerender(<Component type="transfer" data={{ amount: 1, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }} />);

		await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK"));

		await waitFor(() => expect(toastSpy).not.toHaveBeenCalled());

		useFeesSpy.mockRestore();
	});

	describe("when network's fee type is size", () => {
		it("should override fee when it is lower than the minimum fees", async () => {
			const feeTypeSpy = vi.spyOn(networks, "feeType").mockReturnValueOnce("size");

			let useFeesSpy: vi.SpyInstance;

			const toastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

			useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
				calculate: () => Promise.resolve({ avg: 3, isDynamic: true, max: 5, min: 1, static: 3 }),
			});

			const { rerender } = render(
				<Component
					type="transfer"
					network={networks}
					data={{ amount: 1, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }}
				/>,
			);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK"));

			expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("3 DARK");
			expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("5 DARK");
			expect(screen.getAllByRole("radio")[1]).toBeChecked();

			await waitFor(() => {
				expect(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED)).toBeEnabled();
			});

			await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("3"));

			useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
				calculate: () => Promise.resolve({ avg: 9, isDynamic: false, max: 12, min: 6, static: 3 }),
			});

			rerender(
				<Component
					type="transfer"
					network={networks}
					data={{ amount: 2, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }}
				/>,
			);

			await waitFor(() => expect(screen.getByTestId("InputCurrency")).toHaveValue("3"), { timeout: 4000 });

			expect(toastSpy).toHaveBeenCalledWith(translations.PAGE_TRANSACTION_SEND.FORM_STEP.FEE_UPDATE);

			feeTypeSpy.mockRestore();
			toastSpy.mockRestore();
			useFeesSpy.mockRestore();
		});
		it.each(["transfer", "multiPayment", "vote", "delegateRegistration"])(
			"should show 0 when %s data is undefined",
			async (transactionType) => {
				const feeTypeSpy = vi.spyOn(networks, "feeType").mockReturnValueOnce("size");

				render(<Component type={transactionType} network={networks} data={undefined} />);

				await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

				expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("0 DARK");
				expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("0 DARK");
				expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("0 DARK");

				feeTypeSpy.mockRestore();
			},
		);

		it.each(["transfer", "multiPayment", "vote", "delegateRegistration"])(
			"should show 0 %s data is not available yet",
			async (transactionType) => {
				const feeTypeSpy = vi.spyOn(networks, "feeType").mockReturnValueOnce("size");

				render(<Component type={transactionType} network={networks} data={{}} />);

				await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

				expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("0 DARK");
				expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("0 DARK");
				expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("0 DARK");

				feeTypeSpy.mockRestore();
			},
		);

		it("should recalculate fees on data changes", async () => {
			const feeTypeSpy = vi.spyOn(networks, "feeType").mockReturnValueOnce("size");
			const calculate = vi.fn().mockResolvedValue({ avg: 2, isDynamic: false, max: 2, min: 2, static: 2 });
			const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockImplementation(() => ({ calculate }));

			const properties = { network: networks, type: "transfer" };

			const { rerender } = render(<Component {...properties} data={{}} />);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("0 DARK"));

			rerender(<Component {...properties} data={{ amount: 1, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }} />);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("2 DARK"));

			feeTypeSpy.mockRestore();
			calculate.mockRestore();
			useFeesMock.mockRestore();
		});
	});

	it("should change fee", async () => {
		render(<Component type="transfer" />);

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		const [minButton, avgButton, maxButton] = screen.getAllByTestId("ButtonGroupOption");

		expect(avgButton).toHaveAttribute("aria-checked", "true");

		await userEvent.click(minButton);

		expect(minButton).toHaveAttribute("aria-checked", "true");

		await userEvent.click(maxButton);

		expect(maxButton).toHaveAttribute("aria-checked", "true");
	});

	it("should set fee to fees.avg when it has no value yet", async () => {
		const calculate = vi.fn().mockResolvedValue({ avg: 30, isDynamic: true, max: 1, min: 1, static: 1 });
		const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockImplementation(() => ({ calculate }));

		render(<Component type="transfer" data={{ amount: 1, to: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD" }} />);

		await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 DARK"));

		expect(screen.getByRole("radio", { checked: true })).toHaveTextContent("30 DARK");

		calculate.mockRestore();
		useFeesMock.mockRestore();
	});
});
