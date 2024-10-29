import { Contracts } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";
import React from "react";
import { act } from "react-test-renderer";

import { useWelcomeModal } from "./use-welcome-modal";
import { ConfigurationProvider } from "@/app/contexts/Configuration";
import { env, getDefaultProfileId, waitFor } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const wrapper = ({ children }: any) => (
	<ConfigurationProvider defaultConfiguration={{ profileIsSyncing: false }}>{children}</ConfigurationProvider>
);

describe("useWelcomeModal", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());
	});

	afterEach(() => {
		profile.flush();
	});

	it("should not show if in preview mode", async () => {
		process.env.NODE_ENV = "development";
		const wrapper = ({ children }: any) => (
			<ConfigurationProvider defaultConfiguration={{ profileIsSyncing: false }}>{children}</ConfigurationProvider>
		);

		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		await waitFor(() => expect(result.current.show).toBeFalsy(), { timeout: 4000 });
		process.env.NODE_ENV = "production";
	});

	it("should show tutorial for the new profile", () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "hasCompletedIntroductoryTutorial").mockReturnValue(false);
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should able to skip tutorial", () => {
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		act(() => {
			result.current.onClose();
		});

		expect(result.current.show).toBeFalsy();
	});

	it("should not mark as complete when closed", () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "markIntroductoryTutorialAsComplete");

		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		act(() => {
			result.current.onClose();
		});

		expect(mockHasCompletedTutorial).not.toHaveBeenCalled();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should mark as complete when closed an marked as not show again", () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "markIntroductoryTutorialAsComplete");
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		act(() => {
			result.current.toggleShowAgain();
		});

		expect(result.current.showAgain).toBeFalsy();

		act(() => {
			result.current.onClose();
		});

		expect(mockHasCompletedTutorial).toHaveBeenCalledWith();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should not mark as complete when is in a random step", () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "markIntroductoryTutorialAsComplete");

		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		act(() => {
			result.current.setStep(3);
		});

		act(() => {
			result.current.onClose();
		});

		expect(mockHasCompletedTutorial).not.toHaveBeenCalled();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should mark as complete when is in the last step", () => {
		const mockHasCompletedTutorial = vi.spyOn(profile, "markIntroductoryTutorialAsComplete");
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.show).toBeTruthy();

		act(() => {
			result.current.setStep(4);
		});

		act(() => {
			result.current.onClose();
		});

		expect(mockHasCompletedTutorial).toHaveBeenCalledWith();

		mockHasCompletedTutorial.mockRestore();
	});

	it("should go to the next step", () => {
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		expect(result.current.step).toBe(1);

		act(() => {
			result.current.goToNextStep();
		});

		expect(result.current.step).toBe(2);
	});

	it("should go to the previous step", () => {
		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		act(() => {
			result.current.setStep(3);
		});

		expect(result.current.step).toBe(3);

		act(() => {
			result.current.goToPreviousStep();
		});

		expect(result.current.step).toBe(2);
	});

	it("should wait for profile syncing", async () => {
		const wrapper = ({ children }: any) => (
			<ConfigurationProvider defaultConfiguration={{ profileIsSyncing: true }}>{children}</ConfigurationProvider>
		);

		const { result } = renderHook(() => useWelcomeModal(env, profile), { wrapper });

		await waitFor(() => expect(result.current.show).toBeFalsy(), { timeout: 4000 });
	});
});
