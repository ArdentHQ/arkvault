import React from "react";

import { render, screen } from "@/utils/testing-library";
import { QRCameraReader } from "./QRCameraReader";

const mockGetUserMedia = jest.fn(async () => {
	console.log("mockding");
	return {};
});

Object.defineProperty(window, "MediaRecorder", {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		start: jest.fn(),
		ondataavailable: jest.fn(),
		onerror: jest.fn(),
		state: "",
		stop: jest.fn(),
		pause: jest.fn(),
		resume: jest.fn(),
	})),
});

Object.defineProperty(MediaRecorder, "isTypeSupported", {
	writable: true,
	value: () => true,
});

Object.defineProperty(global.window.HTMLMediaElement.prototype, "play", {
	// Define the property getter
	get() {
		console.log("play");
		return () => {};
	},
});

Object.defineProperty(global.navigator, "mediaDevices", {
	value: {
		getUserMedia: () => {
			return new Promise((resolve) => {
				resolve({
					active: true,
					id: "1p2kTHBiaF9EGYw6N8cfu5KSD4XIDHBKHtBT",
					getVideoTracks: () => {
						console.log("video tracks");
						return [
							{
								id: "1",
								kind: "video",
							},
						];
					},
				});
			});
		},
	},
});

// Object.defineProperty(global.navigator, "mediaDevices", {
// 	value: {
// 		mediaDevices: jest.fn()
// 	},
// });

describe("QRCameraReader", () => {
	it("should render", () => {
		// jest.spyOn(navigator, "getUserMedia").mockResolvedValue(true);

		const { asFragment } = render(<QRCameraReader />);
		expect(asFragment()).toMatchSnapshot();
	});
});
