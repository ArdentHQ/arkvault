import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { env, getMainsailProfileId, render, screen, act } from "@/utils/testing-library";
import { Profiles } from "./Profiles";

let profile: Contracts.IProfile;

let sliderProfiles: Contracts.IProfile[];

describe("Profiles", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getMainsailProfileId());

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

	it("should render scrollable view when viewport height is less than threshold and profiles exceed limit", () => {
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 600,
			writable: true,
		});

		const mockGetBoundingClient = vi.fn(() => ({
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 100,
			width: 0,
		}));

		const mockDiv = {
			getBoundingClientRect: mockGetBoundingClient,
		};

		vi.spyOn(React, "useRef").mockReturnValue({ current: mockDiv });

		render(<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ScrollableProfileList")).toBeInTheDocument();
		expect(screen.queryByTestId("ProfileSlider")).not.toBeInTheDocument();
	});

	it("should handle resize events and update scrollable view accordingly", async () => {
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 600,
			writable: true,
		});

		const mockGetBoundingClient = vi.fn(() => ({
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 100,
			width: 0,
		}));

		const mockDiv = {
			getBoundingClientRect: mockGetBoundingClient,
		};

		vi.spyOn(React, "useRef").mockReturnValue({ current: mockDiv });

		render(<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ScrollableProfileList")).toBeInTheDocument();

		Object.defineProperty(window, "innerHeight", {
			value: 800,
		});

		await act(async () => {
			window.dispatchEvent(new Event("resize"));
		});

		expect(screen.queryByTestId("ScrollableProfileList")).not.toBeInTheDocument();
		expect(screen.getByTestId("ProfileSlider")).toBeInTheDocument();
	});

	it("should set minimum of 2 profiles when calculated max is less than 2", () => {
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 300,
			writable: true,
		});

		const mockGetBoundingClient = vi.fn(() => ({
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 200,
			width: 0,
		}));

		const mockDiv = {
			getBoundingClientRect: mockGetBoundingClient,
		};

		vi.spyOn(React, "useRef").mockReturnValue({ current: mockDiv });

		const manyProfiles = Array.from({ length: 10 }).fill(profile) as Contracts.IProfile[];
		render(<Profiles profiles={manyProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ScrollableProfileList")).toBeInTheDocument();
	});

	it("should handle onSelect events in scrollable view", () => {
		const mockOnSelect = vi.fn();
		const mockAction = { label: "Test Action", value: "test" };

		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 600,
			writable: true,
		});

		const mockGetBoundingClient = vi.fn(() => ({
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 100,
			width: 0,
		}));

		const mockDiv = {
			getBoundingClientRect: mockGetBoundingClient,
		};

		vi.spyOn(React, "useRef").mockReturnValue({ current: mockDiv });

		render(<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={mockOnSelect} actions={[mockAction]} />);

		expect(screen.getByTestId("ScrollableProfileList")).toBeInTheDocument();
	});

	it("should cleanup resize event listener on unmount", () => {
		const addEventListenerSpy = vi.spyOn(window, "addEventListener");
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		const { unmount } = render(
			<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />,
		);

		expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
	});

	it("should not use scrollable view when profiles length is less than or equal to PROFILES_PER_SLIDE even with low height", () => {
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 500,
			writable: true,
		});

		const shortProfilesList = Array.from({ length: 3 }).fill(profile) as Contracts.IProfile[];

		render(<Profiles profiles={shortProfilesList} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ProfileList")).toBeInTheDocument();
		expect(screen.queryByTestId("ScrollableProfileList")).not.toBeInTheDocument();
	});

	it("should handle height threshold calculations correctly", () => {
		Object.defineProperty(window, "innerHeight", {
			configurable: true,
			value: 699,
			writable: true,
		});

		const mockGetBoundingClient = vi.fn(() => ({
			bottom: 0,
			height: 0,
			left: 0,
			right: 0,
			top: 50,
			width: 0,
		}));

		const mockDiv = {
			getBoundingClientRect: mockGetBoundingClient,
		};

		vi.spyOn(React, "useRef").mockReturnValue({ current: mockDiv });

		render(<Profiles profiles={sliderProfiles} onClick={vi.fn()} onSelect={vi.fn()} actions={[]} />);

		expect(screen.getByTestId("ScrollableProfileList")).toBeInTheDocument();
	});
});
