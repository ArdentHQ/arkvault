import { renderHook } from "@testing-library/react";
import { useEnterHandler } from "./LedgerTabs.blocks";
import { LedgerTabStep } from "./LedgerTabs.contracts";

describe("useEnterHandler", () => {
	let mockHandleNext: ReturnType<typeof vi.fn>;
	let mockHandleFinish: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockHandleNext = vi.fn();
		mockHandleFinish = vi.fn();
	});

	it("should call handleNext when activeTab is before LedgerImportStep and target is inside ledgerTabs", () => {
		const { result } = renderHook(() =>
			useEnterHandler({
				isNextDisabled: false,
				isSubmitting: false,
				activeTab: LedgerTabStep.LedgerScanStep,
				onHandleNext: mockHandleNext,
				onHandleFinish: mockHandleFinish,
			}),
		);

		const target = { tagName: "BUTTON", closest: vi.fn().mockReturnValue({}) } as unknown as Element;
		result.current.handleEnter({ target } as KeyboardEvent);

		expect(mockHandleNext).toHaveBeenCalledTimes(1);
		expect(mockHandleFinish).not.toHaveBeenCalled();
	});

	it("should call handleFinish when activeTab is LedgerImportStep and target is BODY", () => {
		const { result } = renderHook(() =>
			useEnterHandler({
				isNextDisabled: false,
				isSubmitting: false,
				activeTab: LedgerTabStep.LedgerImportStep,
				onHandleNext: mockHandleNext,
				onHandleFinish: mockHandleFinish,
			}),
		);

		const target = { tagName: "BODY", closest: vi.fn().mockReturnValue(null) } as unknown as Element;
		result.current.handleEnter({ target } as KeyboardEvent);

		expect(mockHandleFinish).toHaveBeenCalledTimes(1);
		expect(mockHandleNext).not.toHaveBeenCalled();
	});

	it("should not call any handler when isNextDisabled is true", () => {
		const { result } = renderHook(() =>
			useEnterHandler({
				isNextDisabled: true,
				isSubmitting: false,
				activeTab: LedgerTabStep.LedgerScanStep,
				onHandleNext: mockHandleNext,
				onHandleFinish: mockHandleFinish,
			}),
		);

		const target = { tagName: "BUTTON", closest: vi.fn().mockReturnValue({}) } as unknown as Element;
		result.current.handleEnter({ target } as KeyboardEvent);

		expect(mockHandleNext).not.toHaveBeenCalled();
		expect(mockHandleFinish).not.toHaveBeenCalled();
	});

	it("should not call any handler when isSubmitting is true", () => {
		const { result } = renderHook(() =>
			useEnterHandler({
				isNextDisabled: false,
				isSubmitting: true,
				activeTab: LedgerTabStep.LedgerScanStep,
				onHandleNext: mockHandleNext,
				onHandleFinish: mockHandleFinish,
			}),
		);

		const target = { tagName: "BUTTON", closest: vi.fn().mockReturnValue({}) } as unknown as Element;
		result.current.handleEnter({ target } as KeyboardEvent);

		expect(mockHandleNext).not.toHaveBeenCalled();
		expect(mockHandleFinish).not.toHaveBeenCalled();
	});

	it("should not call any handler when target is not a component child", () => {
		const mockClosest = vi.fn().mockReturnValue(null);
		const target = { tagName: "SPAN", closest: mockClosest } as unknown as Element;
		const event = { target } as unknown as KeyboardEvent;

		const { result } = renderHook(() =>
			useEnterHandler({
				isNextDisabled: false,
				isSubmitting: false,
				activeTab: LedgerTabStep.LedgerScanStep,
				onHandleNext: mockHandleNext,
				onHandleFinish: mockHandleFinish,
			}),
		);

		result.current.handleEnter(event);

		expect(mockClosest).toHaveBeenCalledWith("#ledgerTabs");
		expect(mockHandleNext).not.toHaveBeenCalled();
		expect(mockHandleFinish).not.toHaveBeenCalled();
	});
});
