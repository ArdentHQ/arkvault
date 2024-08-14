import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { Profiles } from "./Profiles";

let profile: Contracts.IProfile;

let sliderProfiles: Contracts.IProfile[];

describe("Profiles", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		sliderProfiles = Array.from({ length: 8 }).fill(profile) as Contracts.IProfile[];
	});

	it("should render a list without a slider if number of profiles are less than given threshold", () => {
		render(<Profiles profiles={env.profiles().values()} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getAllByTestId("ProfileRow").length).toBe(2);
		expect(screen.queryByTestId("ProfileSlider")).not.toBeInTheDocument();
	});

	it("should render a slider if number of profiles are more than given threshold", () => {
		render(<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ProfileSlider")).toBeInTheDocument();
	});

	it("should render chunked profiles", () => {
		const { container } = render(
			<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />,
		);

		/* eslint-disable testing-library/no-container, testing-library/no-node-access */

		const firstSlideProfiles = container
			.querySelector('[data-index="0"]')
			?.querySelectorAll('[data-testid="ProfileRow"]');

		expect(firstSlideProfiles?.length).toBe(5);

		const secondSlideProfiles = container
			.querySelector('[data-index="1"]')
			?.querySelectorAll('[data-testid="ProfileRow"]');

		expect(secondSlideProfiles?.length).toBe(3);
	});

	it("should render skeletons if profiles in chunk is less than the given threshold", () => {
		const { container } = render(
			<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />,
		);

		/* eslint-disable testing-library/no-container, testing-library/no-node-access */

		const firstSlideSkeletons = container
			.querySelector('[data-index="0"]')
			?.querySelectorAll('[data-testid="ProfileRowSkeleton"]');

		expect(firstSlideSkeletons?.length).toBe(0);

		const secondSlideSkeletons = container
			.querySelector('[data-index="1"]')
			?.querySelectorAll('[data-testid="ProfileRowSkeleton"]');

		expect(secondSlideSkeletons?.length).toBe(2);
	});
});
