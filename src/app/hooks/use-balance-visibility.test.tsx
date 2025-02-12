import { useBalanceVisibility } from './use-balance-visibility';
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";

let profile: Contracts.IProfile;

describe("useBalanceVisibility", () => {
    beforeAll(async () => {
        profile = env.profiles().findById(getDefaultProfileId());
        await env.profiles().restore(profile);
        await profile.sync();
    });

	it("should hide balance on click", async () => {
        const TestComponent: React.FC = () => {
            const { hideBalance, setHideBalance } = useBalanceVisibility({ profile });
    
            return <button data-testid="HideBalance-button" onClick={() => setHideBalance(!hideBalance)}>Hide Balance</button>;
        };

		render(<TestComponent />);

        expect(profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration)).toStrictEqual({ hideBalance: false });

        const button = screen.getByTestId("HideBalance-button");
        await userEvent.click(button);

        expect(profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration)).toStrictEqual({ hideBalance: true });
	});

    it("should assign false by default if the setting is not set", async() => {
        const TestComponent2: React.FC = () => {
            return (
                <button data-testid="ForgetSetting-button" onClick={() => profile.settings().forget(Contracts.ProfileSetting.DashboardConfiguration)}>Forget Setting</button>
            );
        };

        render(<TestComponent2 />);

        const button = screen.getByTestId("ForgetSetting-button");
        await userEvent.click(button);

        expect(profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration)).toStrictEqual(undefined);

        render(<TestComponent />);

        expect(screen.getByTestId("HideBalance-button")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("HideBalance-button"));

        expect(profile.settings().get(Contracts.ProfileSetting.DashboardConfiguration)).toStrictEqual({ hideBalance: true });
    });

    it("should return false if the profile is not set", () => {
        const TestComponent3: React.FC = () => {
            const { hideBalance } = useBalanceVisibility({ profile: undefined });
    
            return <div data-testid="HideBalance-button">{hideBalance ? "true" : "false"}</div>;
        };
    
        render(<TestComponent3 />);
    
        expect(screen.getByTestId("HideBalance-button")).toHaveTextContent("false");
    });
});