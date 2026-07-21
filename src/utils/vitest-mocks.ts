import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";

/**
 * Mock canvas.getContext globally so TextMeasurer.measureText  (in @/app/components/MiddleTruncation)
 * doesn't throw "Not implemented: HTMLCanvasElement's getContext() method: without installing the canvas npm package" in jsdom.
 *
 * Also mock offsetWidth on elements so MiddleTruncator doesn't truncate text
 * (jsdom inline elements report offsetWidth = 0).
 */
export function mockCanvas() {
	const originalCreateElement = document.createElement.bind(document);
	document.createElement = ((tag: string) => {
		if (tag === "canvas") {
			return {
				getContext: () => ({
					font: "",
					measureText: vi.fn(() => ({ width: 0 })),
				}),
			} as unknown as HTMLCanvasElement;
		}
		const el = originalCreateElement(tag);

		// jsdom inline elements (e.g. <span>) report offsetWidth = 0,
		// which causes MiddleTruncator to truncate even when text fits.
		Object.defineProperty(el, "offsetWidth", { value: 9999 });
		return el;
	}) as typeof document.createElement;
}

export function createLedgerTransportFactoryMock() {
	return class LedgerTransportFactoryMock {
		supportedTransport() {
			return Promise.resolve({
				list: () => [],
				listen: () => {},
				openConnected: async () => openTransportReplayer(RecordStore.fromString("")),
			});
		}
	};
}
