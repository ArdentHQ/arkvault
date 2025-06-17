import * as Mainsail from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";

import { EnvironmentProvider, useEnvironmentContext } from "./Environment";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { env, render, screen, waitFor, renderHook, act } from "@/utils/testing-library";

const Create = () => {
	const { env, persist } = useEnvironmentContext();

	const handleClick = async () => {
		await env.profiles().create("Test");
		await persist();
	};

	return <button onClick={handleClick}>Create</button>;
};
const Details = () => {
	const context = useEnvironmentContext();
	const count = React.useMemo(() => context.env.profiles().count(), [context]);
	return <h1>Counter {count}</h1>;
};

const App = ({ database }) => {
	env.reset({ coins: { Mainsail }, httpClient, storage: database });

	return (
		<EnvironmentProvider env={env}>
			<Details />
			<Create />
		</EnvironmentProvider>
	);
};

describe("Environment Context", () => {
	let database: Storage;

	beforeEach(() => {
		database = new StubStorage();
	});

	it("throws if useConfiguration is called without the Provider", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		expect(() => {
			renderHook(() => useEnvironmentContext());
		}).toThrow("[useEnvironment] Component not wrapped within a Provider");

		consoleSpy.mockRestore();
	});

	it("should render the wrapper properly", () => {
		env.reset({ coins: { Mainsail }, httpClient, storage: new StubStorage() });

		const { container, asFragment } = render(
			<EnvironmentProvider env={env}>
				<span>Provider testing</span>
			</EnvironmentProvider>,
		);

		expect(screen.getByText("Provider testing")).toBeInTheDocument();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should rerender components when env updates", async () => {
		render(<App database={database} />, { withProviders: false });

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("Counter 1"));

		const profiles = await database.get<any>("profiles");

		expect(Object.keys(profiles)).toHaveLength(1);
	});

	it("should save profile before persist", async () => {
		const profile = await env.profiles().create("foo");

		const ProfilePage = () => {
			const { persist } = useEnvironmentContext();

			const handleClick = async () => {
				profile.settings().set(Contracts.ProfileSetting.Name, "bar");
				await persist();
			};

			return <button onClick={handleClick}>Create</button>;
		};

		const App = () => (
			<EnvironmentProvider env={env}>
				<ProfilePage />
			</EnvironmentProvider>
		);

		const { navigate } = render(<App />);

		act(() => {
			navigate(`/profiles/${profile.id()}`);
		});

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(profile.settings().get(Contracts.ProfileSetting.Name)).toBe("bar"));
	});

	it("should not persist on e2e", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		render(<App database={database} />, { withProviders: false });

		await userEvent.click(screen.getByRole("button"));

		await waitFor(() => expect(screen.getByRole("heading")).toHaveTextContent("Counter 1"));

		const profiles = await database.get<any>("profiles");

		expect(profiles).toBeUndefined();
	});
});
