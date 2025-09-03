import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import * as useFeesHook from "@/app/hooks/use-fees";
import { useValidation } from "@/app/hooks";
import { FeeField, GasLimit } from "@/domains/transaction/components/FeeField/FeeField";
import { calculateGasFee } from "@/domains/transaction/components/InputFee/InputFee";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
import { expect } from "vitest";
import { vi } from "vitest";
import { BigNumber } from "@/app/lib/helpers";

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
		const { asFragment } = render(
			<Component
				type="transfer"
				data={{ amount: 1, recipientAddress: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should change fee", async () => {
		render(
			<Component
				type="transfer"
				data={{ amount: 1, recipientAddress: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("Amount")).toHaveLength(3));

		const [minButton, avgButton, maxButton] = screen.getAllByTestId("ButtonGroupOption");

		expect(avgButton).toHaveAttribute("aria-checked", "true");

		await userEvent.click(minButton);

		expect(minButton).toHaveAttribute("aria-checked", "true");

		await userEvent.click(maxButton);

		expect(maxButton).toHaveAttribute("aria-checked", "true");
	});

	it("should set fee to fees.avg when it has no value yet", async () => {
		const calculate = vi.fn().mockResolvedValue({ avg: 30, max: 1, min: 1 });
		const estimateGas = vi.fn().mockResolvedValue(BigNumber.make(21_000));
		const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockImplementation(() => ({ calculate, estimateGas }));

		render(
			<Component
				type="transfer"
				data={{ amount: 1, recipientAddress: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
			/>,
		);

		await waitFor(() => expect(screen.getAllByTestId("Amount")[0]).toHaveTextContent("1 ARK"));

		expect(screen.getByRole("radio", { checked: true })).toHaveTextContent(
			calculateGasFee(BigNumber.make(30), GasLimit.transfer) + " ARK",
		);

		calculate.mockRestore();
		useFeesMock.mockRestore();
	});

	it("should fallback to default gas limit when estimateGas call fail", async () => {
		const calculate = vi.fn().mockResolvedValue({ avg: 30, max: 1, min: 1 });
		const estimateGas = vi.fn().mockImplementation(() => {
			throw new Error("Failed to fetch");
		});

		const useFeesMock = vi.spyOn(useFeesHook, "useFees").mockImplementation(() => ({ calculate, estimateGas }));

		render(
			<Component
				type="transfer"
				data={{ amount: 1, recipientAddress: "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6" }}
			/>,
		);

		await userEvent.click(screen.getByText("Advanced"));

		expect(screen.getByTestId("Input_GasLimit")).toHaveValue("21000");

		estimateGas.mockRestore();
		calculate.mockRestore();
		useFeesMock.mockRestore();
	});
});
