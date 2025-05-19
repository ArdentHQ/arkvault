import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import * as useFeesHook from "@/app/hooks/use-fees";
import { translations } from "@/domains/transaction/i18n";
import { BigNumber } from "@/app/lib/helpers";
import { useValidation } from "@/app/hooks";
import { FeeField, GasLimit, MIN_GAS_PRICE } from "@/domains/transaction/components/FeeField/FeeField";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { expect } from "vitest";
import { vi } from "vitest";

describe("FeeField", () => {
	let profile: Contracts.IProfile;
	let networks: Networks.Network;

	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		networks = profile.activeNetwork();
	});

	const Component = ({ balance = 10, network = networks, type, data }: any) => {
		const form = useForm({ mode: "onChange" });

		const { register, watch } = form;
		const { common } = useValidation();
		const { fees } = watch();

		register("fee");
		register("fees", common.fee(balance, network, fees));
		register("inputFeeSettings");
		register("gasPrice");
		register("gasLimit");

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

	describe("when network's fee type is size", () => {
		it("should override fee when it is lower than the minimum fees", async () => {
			let useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
				calculate: () => Promise.resolve({ avg: 3, isDynamic: true, max: 5, min: 1, static: 3 }),
			});

			const { rerender } = render(
				<Component
					type="transfer"
					network={networks}
					data={{ amount: 1, to: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
				/>,
			);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 ARK"));

			expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("3 ARK");
			expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("5 ARK");
			expect(screen.getAllByRole("radio")[1]).toBeChecked();

			await waitFor(() => {
				expect(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED)).toBeEnabled();
			});

			await userEvent.click(screen.getByText(translations.INPUT_FEE_VIEW_TYPE.ADVANCED));

			await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("3"));

			useFeesSpy.mockRestore();

			useFeesSpy = vi.spyOn(useFeesHook, "useFees").mockReturnValue({
				calculate: () => Promise.resolve({ avg: 9, isDynamic: false, max: 12, min: 6, static: 3 }),
			});

			rerender(
				<Component
					type="transfer"
					network={networks}
					data={{ amount: 2, to: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
				/>,
			);

			await waitFor(() => expect(screen.getByTestId("Input_GasPrice")).toHaveValue("3"), { timeout: 4000 });

			useFeesSpy.mockRestore();
		});

		it.each(["transfer", "multiPayment", "vote", "validatorRegistration"])(
			"should use env transaction fee when %s data is undefined",
			async (transactionType) => {

				const envFeesSpy = vi.spyOn(env.fees(), "findByType").mockReturnValue({
					avg: BigNumber.make(3),
					isDynamic: true,
					max: BigNumber.make(4),
					min: BigNumber.make(1),
					static: BigNumber.make(2),
				});

				render(<Component type={transactionType} network={networks} data={undefined} />);

				await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

				const amounts = screen.getAllByTestId("Amount");

				expect(amounts[0]).toHaveTextContent(calculateGasFee(1, GasLimit[transactionType]) + " ARK");
				expect(amounts[1]).toHaveTextContent(calculateGasFee(3, GasLimit[transactionType]) + " ARK");
				expect(amounts[2]).toHaveTextContent(calculateGasFee(4, GasLimit[transactionType]) + " ARK");

				envFeesSpy.mockRestore();
			},
		);

		it.each(["transfer", "multiPayment", "vote", "validatorRegistration"])(
			"should show 0 fee when %s data is not available yet",
			async (transactionType) => {

				render(<Component type={transactionType} network={networks} data={{}} />);

				await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

				expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("0 ARK");
				expect(screen.getAllByTestId("Amount")[1]).toHaveTextContent("0 ARK");
				expect(screen.getAllByTestId("Amount")[2]).toHaveTextContent("0 ARK");

			},
		);

		it("should recalculate fees on data changes", async () => {
			const calculate = vi.fn().mockResolvedValue({ avg: 2, isDynamic: false, max: 2, min: 2, static: 2 });
			const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockImplementation(() => ({ calculate }));

			const properties = { network: networks, type: "transfer" };

			const { rerender } = render(<Component {...properties} data={{}} />);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("0.000042 ARK"));

			rerender(
				<Component {...properties} data={{ amount: 1, to: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }} />,
			);

			await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("2 ARK"));

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

		render(<Component type="transfer" data={{ amount: 1, to: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }} />);

		await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 ARK"));

		expect(screen.getByRole("radio", { checked: true })).toHaveTextContent(
			calculateGasFee(30, GasLimit.transfer) + " ARK",
		);

		calculate.mockRestore();
		useFeesMock.mockRestore();
	});
});
