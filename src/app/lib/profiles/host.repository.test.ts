/* eslint-disable unicorn/no-array-push-push */
import { describeWithContext } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking.js";
import { HostRepository } from "./host.repository.js";
import { Profile } from "./profile.js";

describeWithContext(
	"HostRepository",
	{
		explorer: {
			host: {
				enabled: true,
				host: "https://live.arkscan.io",
				type: "explorer",
			},
			name: "John's Explorer",
			network: "ark.mainnet",
		},
		full: {
			host: {
				enabled: false,
				height: 999_999,
				host: "https://ark-live.arkvault.io/api",
				type: "full",
			},
			name: "John's Relay",
			network: "ark.mainnet",
		},
		musig: {
			host: {
				host: "https://ark-live-musig.arkvault.io",
				type: "musig",
			},
			name: "John's MuSig",
			network: "ark.mainnet",
		},
	},
	({ beforeEach, assert, it }) => {
		beforeEach((context) => {
			bootContainer();

			context.subject = new HostRepository(new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" }));
		});

		it("#all", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context.full);
			context.subject.push(context.musig);
			context.subject.push(context.explorer);

			assert.length(Object.keys(context.subject.all()), 1);
		});

		it("#allByNetwork", (context) => {
			assert.length(context.subject.allByNetwork("ark.mainnet"), 0);

			context.subject.push(context.full);

			assert.array(context.subject.allByNetwork("ark.mainnet"));
		});

		it("#push", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context.full);

			assert.length(context.subject.all().ark.mainnet, 1);

			context.subject.push(context.full);

			assert.length(context.subject.all().ark.mainnet, 2);
		});

		it("#fill", (context) => {
			assert.length(Object.keys(context.subject.all()), 0);

			context.subject.push(context.full);
			context.subject.push(context.full);
			context.subject.push(context.full);

			assert.length(Object.keys(context.subject.all().ark.mainnet), 3);

			context.subject.fill(context.subject.all());

			assert.length(Object.keys(context.subject.all().ark.mainnet), 3);
		});

		it("#forget", (context) => {
			assert.length(context.subject.allByNetwork("ark.mainnet"), 0);

			context.subject.push(context.full);

			context.subject.push({
				...context.full,
				name: "another name",
			});

			assert.length(context.subject.allByNetwork("ark.mainnet"), 2);

			context.subject.forget("ark.mainnet", 0);

			assert.length(context.subject.allByNetwork("ark.mainnet"), 1);
		});
	},
);
