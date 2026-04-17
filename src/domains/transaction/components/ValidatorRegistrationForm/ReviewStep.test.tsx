import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { ReviewStep } from "./ReviewStep";
import * as useFeesHook from "@/app/hooks/use-fees";
import { BigNumber } from "@/app/lib/helpers";
import { env, getDefaultProfileId, render, screen, syncValidators, waitFor } from "@/utils/testing-library";
import { vi } from "vitest";

let profile: Contracts.IProfile;
let wallet: Contracts.IReadWriteWallet;

const renderComponent = (properties?: any) => {
	const defaultValues = properties?.defaultValues ?? {
		fee: "2",
		gasPrice: "1",
		gasLimit: "1",
		validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
	};

	const Component = () => {
		const form = useForm<any>({ defaultValues, mode: "onChange" });

		useEffect(() => {
			form.register("fee");
			form.register("fees");
			form.register("inputFeeSettings");
			form.register("gasPrice");
			form.register("gasLimit");
			form.register("validatorPublicKey");
		}, [form]);

		return (
			<FormProvider {...form}>
				<ReviewStep wallet={wallet} profile={profile} />
			</FormProvider>
		);
	};

	return render(<Component />, {
		route: `/profiles/${profile.id()}`,
	});
};

describe("ReviewStep", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await env.profiles().restore(profile);
		await profile.sync();

		wallet = profile.wallets().first();

		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		await syncValidators(profile);

		vi.spyOn(useFeesHook, "useFees").mockReturnValue({
			calculate: () => Promise.resolve({ avg: 1.354, max: 10, min: 0 } as any),
			estimateGas: () => Promise.resolve(BigNumber.make(21000)),
		});
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should render review step", async () => {
		const { asFragment } = renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render lockedFee error alert when error is present", async () => {
		let hasSetError = false;

		const TestWrapper = () => {
			const form = useForm<any>({
				defaultValues: {
					fee: "2",
					gasPrice: "1",
					gasLimit: "1",
					validatorPublicKey: "02147bf63839be7abb44707619b012a8b59ad3eda90be1c6e04eb9c630232268de",
				},
				mode: "onChange",
			});

			useEffect(() => {
				if (!hasSetError) {
					hasSetError = true;
					form.setError("lockedFee", { type: "manual", message: "Locked fee error" });
				}
			}, [form]);

			return (
				<FormProvider {...form}>
					<ReviewStep wallet={wallet} profile={profile} />
				</FormProvider>
			);
		};

		render(<TestWrapper />, { route: `/profiles/${profile.id()}` });

		await waitFor(() => expect(screen.getByText("Locked fee error")).toBeInTheDocument());
	});

	it("should show locked amount when wallet is not a validator", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByText(/Locked Amount|LOCKED_AMOUNT/)).toBeInTheDocument();
	});

	it("should show validator registration method when wallet is not a validator", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("ValidatorRegistrationForm__review-step")).toBeInTheDocument();
	});

	it("should show update validator method when wallet is a validator", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(true);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("ValidatorRegistrationForm__review-step")).toBeInTheDocument();
	});

	it("should show fiat amount when not on testnet", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		const networkMock = vi.spyOn(wallet.network(), "isTest").mockReturnValue(false);

		const exchangeMock = vi.spyOn(profile.exchangeRates(), "exchange").mockReturnValue(100);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByTestId("ValidatorRegistrationForm__review-step")).toBeInTheDocument();

		exchangeMock.mockRestore();
		networkMock.mockRestore();
	});

	it("should render fee field with correct type for validator registration", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(false);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByText("Transaction Fee")).toBeInTheDocument();
	});

	it("should render fee field with correct type for update validator", async () => {
		vi.spyOn(wallet, "isValidator").mockReturnValue(true);

		renderComponent();

		await expect(screen.findByTestId("ValidatorRegistrationForm__review-step")).resolves.toBeVisible();

		expect(screen.getByText("Transaction Fee")).toBeInTheDocument();
	});
});
