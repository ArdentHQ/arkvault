import { ARK } from "@ardenthq/sdk-ark";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";

import { EnvironmentProvider, useEnvironmentContext } from "./Environment";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import { env, render, screen, waitFor } from "@/utils/testing-library";

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
	env.reset({ coins: { ARK }, httpClient, storage: database });

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

	it("should throw without provider", () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const Test = () => {
			const { env } = useEnvironmentContext();
			return <p>{env.profiles().count()}</p>;
		};

		expect(() => render(<Test />, { withProviders: false })).toThrow(
			"[useEnvironment] Component not wrapped within a Provider",
		);

		consoleSpy.mockRestore();
	});

	it("should render the wrapper properly", () => {
		env.reset({ coins: { ARK }, httpClient, storage: new StubStorage() });

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
		const history = createHashHistory();
		history.push(`/profiles/${profile.id()}`);

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

		render(<App />, { history });

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
