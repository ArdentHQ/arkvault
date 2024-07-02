/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react-hooks";
import userEvent from "@testing-library/user-event";
import React from "react";
import { useForm } from "react-hook-form";

import { EnvironmentProvider } from "@/app/contexts";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";

import { InputAddress, InputAddressProperties } from "./InputAddress";

let profile: Contracts.IProfile;

describe("InputAddress", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	const TestInputAddress = (properties: InputAddressProperties) => (
		<EnvironmentProvider env={env}>
			<InputAddress name="address" {...properties} />
		</EnvironmentProvider>
	);

	it("should render", () => {
		const { asFragment } = render(<TestInputAddress coin="ARK" network="ark.devnet" profile={profile} />);

		expect(screen.getByTestId("InputAddress__input")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should validate a wrong address", async () => {
		const { result } = renderHook(() => useForm({ mode: "onChange" }));
		const { register, errors } = result.current;

		render(<TestInputAddress coin="ARK" network="ark.devnet" registerRef={register} profile={profile} />);

		await userEvent.type(screen.getByTestId("InputAddress__input"), "Abc");

		await waitFor(() => {
			expect(errors.address?.message).toBe(commonTranslations.INPUT_ADDRESS.VALIDATION.NOT_VALID);
		});
	});

	it("should validate a valid address and emit event", async () => {
		const onValidAddress = vi.fn();
		const { result } = renderHook(() => useForm({ mode: "onChange" }));
		const { register, errors } = result.current;
		const validAddress = "DT11QcbKqTXJ59jrUTpcMyggTcwmyFYRTM";

		render(
			<TestInputAddress
				coin="ARK"
				network="ark.devnet"
				registerRef={register}
				onValidAddress={onValidAddress}
				profile={profile}
			/>,
		);

		await userEvent.type(screen.getByTestId("InputAddress__input"), validAddress);

		expect(errors.address?.message).toBeUndefined();
		expect(onValidAddress).toHaveBeenCalledWith(validAddress);
	});

	it("should validate with additional rules", async () => {
		const { result } = renderHook(() => useForm({ mode: "onChange" }));
		const { register, errors } = result.current;

		render(
			<TestInputAddress
				profile={profile}
				coin="ARK"
				network="ark.devnet"
				registerRef={register}
				additionalRules={{ minLength: 10 }}
			/>,
		);

		await userEvent.type(screen.getByTestId("InputAddress__input"), "Abc");

		await waitFor(() => {
			expect(errors.address?.type).toBe("minLength");
		});
	});

	it("should not use default validation", async () => {
		const { result } = renderHook(() => useForm({ mode: "onChange" }));
		const { register } = result.current;

		const { asFragment } = render(
			<TestInputAddress useDefaultRules={false} registerRef={register} profile={profile} />,
		);

		expect(asFragment()).toMatchSnapshot();
	});
});
