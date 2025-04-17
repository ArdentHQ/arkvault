import { BIP38, PBKDF2 } from "@ardenthq/sdk-cryptography";

import { Profile } from "./profile";
import { WalletData } from "./contracts";
import { WalletFactory } from "./wallet.factory.js";
import { bootContainer } from "../test/mocking";
import { describe } from "@ardenthq/sdk-test";

describe("WalletFactory", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll((context) => {
		bootContainer();

		context.subject = new WalletFactory(new Profile({ avatar: "avatar", data: "", id: "id", name: "name" }));
	});

	beforeEach(async () => {
		nock.fake("https://ark-test.arkvault.io")
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.persist();

		nock.fake("https://ark-live.arkvault.io")
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/coins/ark/mainnet/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/coins/ark/mainnet/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/coins/ark/mainnet/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/coins/ark/mainnet/syncing.json"))
			.get("/api/wallets/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX")
			.reply(200, loader.json("test/fixtures/coins/ark/mainnet/wallets/AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX.json"))
			.persist();

		nock.fake("http://51.75.183.27:3100", { encodedQueryParams: true })
			.post(
				"/",
				'{"query":"\\n\\t\\t\\t{\\n\\t\\t\\t\\ttransactions(\\n\\t\\t\\t\\t\\twhere: {\\n\\t\\t\\t\\t\\t\\t_or: [\\n\\t\\t\\t\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\t\\t\\t\\tinputs: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\taddress: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t_in: [\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\"addr_test1qqy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmn8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw96paj\\"\\n\\"addr_test1qrhvwtn8sa3duzkm93v5kjjxlv5lvg67j530wyeumngu23lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4s8xvh\\"\\n\\"addr_test1qrtlcnmfdyarpscqxa6nthjz0na7xyz3fa8vt3yjw2y5gs8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33saf6px4\\"\\n\\"addr_test1qzawae46edstqpdy84hhymuldnflyup0kjrp9ss5mgzvgplk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sfwe8sv\\"\\n\\"addr_test1qr37u32sathht33rxpfk80yrexxkypqyl9hg5c77lw5n58lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sy2mmsd\\"\\n\\"addr_test1qz6uqrj8jqtylttlrtn0wsh084jp58z8r2fkfhuun5nasw8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s06dfg3\\"\\n\\"addr_test1qzvq73tc9m40m0jnmttkmf74p2lx5thuhsclu03chd0xkshk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sqqr8zu\\"\\n\\"addr_test1qqq2jxjrrq8apv4u3gy9mjrufvs42myzasd65crwuhyvlp0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s883mq6\\"\\n\\"addr_test1qrlge3t2tmlh7t2mmaas5gy7a82q5cdsuddhlff949xntmlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sncpvd9\\"\\n\\"addr_test1qpf2jx3ndwqmldj89e9vpqcwmsw6h4wejp4gywz40wckmzlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suyy5ja\\"\\n\\"addr_test1qq9nms699rfkkmrs9m4kml466kk034uvhz48p0plq2lld00k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33snh2d4v\\"\\n\\"addr_test1qpkm28ylwmxrh73mv040c0x6jqkh2mcrwx4a47yv80aq3vlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7ula50\\"\\n\\"addr_test1qpdc0wjy4jw296ky85fw8jf2c8d4x7fm2qxvdrlfq4jyvlhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4y4raa\\"\\n\\"addr_test1qqycmygp5pv2hn9kk8vljt98gpjpg3ywzd8ysdynwpa78llk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7n2y6a\\"\\n\\"addr_test1qqszcuht5uxtectkcpurxszpj7jt8uywynf6gde37ea6w40k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33st8yn6n\\"\\n\\"addr_test1qrmxlw04xwvyrpt2n6q36f4m0xu4lwnted6y9q5v7uldp78k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sul03vu\\"\\n\\"addr_test1qzxzfv4c7n30np5yv34sywv6vz095r3sd98a4f7nkfqqrk0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s30txsp\\"\\n\\"addr_test1qrta0j6hx8ajchhzje9qg033940llyku5h83k5ttckar3jhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sym3tvw\\"\\n\\"addr_test1qqchxm32j5pr7a758kzv462tuvdx8nxlwas7wzt83u7gt9hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suvg52n\\"\\n\\"addr_test1qqxgjqsmcgc8h47pk63u33976pdsgdcej0eeyztkn6ygve8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9dqqr4\\"\\n\\"addr_test1qzfjfm724nv9qz6nfyagmj0j2uppr35gzv5qee8s7489wxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scc4thv\\"\\n\\"addr_test1qzdcehzqelgwyzdzswc8f7743xvr3sywjq63s0auft8g0d8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sjv0ust\\"\\n\\"addr_test1qz2t57ujlkxdtv86pwehqq74a4t93xz60vvesnvgt3qz6g0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sp6hm22\\"\\n\\"addr_test1qrgpsfs4dpnzxksd9de06hetvgje7c0nganpeff7ja9wctlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4y89zq\\"\\n\\"addr_test1qqkuyrhjxa4zwtdrm2a7asueyghu5c9y54fugp5r9cyk3p0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shmyva7\\"\\n\\"addr_test1qqngtymqpmhsk4fsys722uthmdnf8a3ag0q4cy9qlq0vzy8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdr5v70\\"\\n\\"addr_test1qq2vqlqrln0uu7rw87kexcd2pr63jy8g5ymf2kukv3phqw0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7jtsz8\\"\\n\\"addr_test1qpsvmsvfy5xcm958mpyxq4tl94jv335z0qscrz20hud3rqlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33savcd3z\\"\\n\\"addr_test1qrv5xqcdudp0tcsxu56ys6ytwl7vl3sfhnss5ualnzghpvhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33slyedse\\"\\n\\"addr_test1qq94krqrkxd9j8vzpnq937heprm37hlktjezfh5sn63us30k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s8feequ\\"\\n\\"addr_test1qztgk69s33xmmn6u68k60fm94dvxgj6qxxq82gqwn2t5xh8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scqy2t5\\"\\n\\"addr_test1qrux7uxa9k5jrrxzqs2qn6ap4u88xswefzl3v83zslwjl0hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5kxdpx\\"\\n\\"addr_test1qz7jrlx9ptrwf6jtyksyfk5zqlp20y87lqvtytcsnyrmma0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sqccac0\\"\\n\\"addr_test1qr75rhcc6qt7ecu3v8fcautu43facv85g3ckhgcym5tvgl8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33skcqy5k\\"\\n\\"addr_test1qrelq0ht86rsvul5c3udeeplvcp8l9w67y2guru8qt52k3hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33schfcfr\\"\\n\\"addr_test1qrc9tpfyk9d4ywn8ezr45jqrvlx9qplt22qk3dz6am2dxclk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suny99x\\"\\n\\"addr_test1qqguca5n5u9vc8lqk8utketux84q7hlrecnj9s9c04246y0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sgwdwxs\\"\\n\\"addr_test1qrn2qj4wu67csfmfzfkk2kawql42qsgz4kzsfr8hqdtvtg8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s2k7z3s\\"\\n\\"addr_test1qq7ua3j55nzsz5wvhhga77nkcxx2x93rztlcehzdq9ssqshk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sq7qer4\\"\\n\\"addr_test1qr5yfvk0wf3ccfwld3psnaxht9lyne6wdv3r92cxd8tx8rhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33syxyqc9\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\t\\t\\toutputs: {\\n\\t\\t\\t\\t\\t\\t\\t\\taddress: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t_in: [\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\"addr_test1qqy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmn8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw96paj\\"\\n\\"addr_test1qrhvwtn8sa3duzkm93v5kjjxlv5lvg67j530wyeumngu23lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4s8xvh\\"\\n\\"addr_test1qrtlcnmfdyarpscqxa6nthjz0na7xyz3fa8vt3yjw2y5gs8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33saf6px4\\"\\n\\"addr_test1qzawae46edstqpdy84hhymuldnflyup0kjrp9ss5mgzvgplk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sfwe8sv\\"\\n\\"addr_test1qr37u32sathht33rxpfk80yrexxkypqyl9hg5c77lw5n58lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sy2mmsd\\"\\n\\"addr_test1qz6uqrj8jqtylttlrtn0wsh084jp58z8r2fkfhuun5nasw8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s06dfg3\\"\\n\\"addr_test1qzvq73tc9m40m0jnmttkmf74p2lx5thuhsclu03chd0xkshk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sqqr8zu\\"\\n\\"addr_test1qqq2jxjrrq8apv4u3gy9mjrufvs42myzasd65crwuhyvlp0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s883mq6\\"\\n\\"addr_test1qrlge3t2tmlh7t2mmaas5gy7a82q5cdsuddhlff949xntmlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sncpvd9\\"\\n\\"addr_test1qpf2jx3ndwqmldj89e9vpqcwmsw6h4wejp4gywz40wckmzlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suyy5ja\\"\\n\\"addr_test1qq9nms699rfkkmrs9m4kml466kk034uvhz48p0plq2lld00k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33snh2d4v\\"\\n\\"addr_test1qpkm28ylwmxrh73mv040c0x6jqkh2mcrwx4a47yv80aq3vlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7ula50\\"\\n\\"addr_test1qpdc0wjy4jw296ky85fw8jf2c8d4x7fm2qxvdrlfq4jyvlhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4y4raa\\"\\n\\"addr_test1qqycmygp5pv2hn9kk8vljt98gpjpg3ywzd8ysdynwpa78llk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7n2y6a\\"\\n\\"addr_test1qqszcuht5uxtectkcpurxszpj7jt8uywynf6gde37ea6w40k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33st8yn6n\\"\\n\\"addr_test1qrmxlw04xwvyrpt2n6q36f4m0xu4lwnted6y9q5v7uldp78k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sul03vu\\"\\n\\"addr_test1qzxzfv4c7n30np5yv34sywv6vz095r3sd98a4f7nkfqqrk0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s30txsp\\"\\n\\"addr_test1qrta0j6hx8ajchhzje9qg033940llyku5h83k5ttckar3jhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sym3tvw\\"\\n\\"addr_test1qqchxm32j5pr7a758kzv462tuvdx8nxlwas7wzt83u7gt9hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suvg52n\\"\\n\\"addr_test1qqxgjqsmcgc8h47pk63u33976pdsgdcej0eeyztkn6ygve8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9dqqr4\\"\\n\\"addr_test1qzfjfm724nv9qz6nfyagmj0j2uppr35gzv5qee8s7489wxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scc4thv\\"\\n\\"addr_test1qzdcehzqelgwyzdzswc8f7743xvr3sywjq63s0auft8g0d8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sjv0ust\\"\\n\\"addr_test1qz2t57ujlkxdtv86pwehqq74a4t93xz60vvesnvgt3qz6g0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sp6hm22\\"\\n\\"addr_test1qrgpsfs4dpnzxksd9de06hetvgje7c0nganpeff7ja9wctlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4y89zq\\"\\n\\"addr_test1qqkuyrhjxa4zwtdrm2a7asueyghu5c9y54fugp5r9cyk3p0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shmyva7\\"\\n\\"addr_test1qqngtymqpmhsk4fsys722uthmdnf8a3ag0q4cy9qlq0vzy8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdr5v70\\"\\n\\"addr_test1qq2vqlqrln0uu7rw87kexcd2pr63jy8g5ymf2kukv3phqw0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7jtsz8\\"\\n\\"addr_test1qpsvmsvfy5xcm958mpyxq4tl94jv335z0qscrz20hud3rqlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33savcd3z\\"\\n\\"addr_test1qrv5xqcdudp0tcsxu56ys6ytwl7vl3sfhnss5ualnzghpvhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33slyedse\\"\\n\\"addr_test1qq94krqrkxd9j8vzpnq937heprm37hlktjezfh5sn63us30k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s8feequ\\"\\n\\"addr_test1qztgk69s33xmmn6u68k60fm94dvxgj6qxxq82gqwn2t5xh8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scqy2t5\\"\\n\\"addr_test1qrux7uxa9k5jrrxzqs2qn6ap4u88xswefzl3v83zslwjl0hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5kxdpx\\"\\n\\"addr_test1qz7jrlx9ptrwf6jtyksyfk5zqlp20y87lqvtytcsnyrmma0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sqccac0\\"\\n\\"addr_test1qr75rhcc6qt7ecu3v8fcautu43facv85g3ckhgcym5tvgl8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33skcqy5k\\"\\n\\"addr_test1qrelq0ht86rsvul5c3udeeplvcp8l9w67y2guru8qt52k3hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33schfcfr\\"\\n\\"addr_test1qrc9tpfyk9d4ywn8ezr45jqrvlx9qplt22qk3dz6am2dxclk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suny99x\\"\\n\\"addr_test1qqguca5n5u9vc8lqk8utketux84q7hlrecnj9s9c04246y0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sgwdwxs\\"\\n\\"addr_test1qrn2qj4wu67csfmfzfkk2kawql42qsgz4kzsfr8hqdtvtg8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s2k7z3s\\"\\n\\"addr_test1qq7ua3j55nzsz5wvhhga77nkcxx2x93rztlcehzdq9ssqshk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sq7qer4\\"\\n\\"addr_test1qr5yfvk0wf3ccfwld3psnaxht9lyne6wdv3r92cxd8tx8rhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33syxyqc9\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t) {\\n\\t\\t\\t\\t\\tinputs {\\n\\t\\t\\t\\t\\t\\taddress\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\toutputs {\\n\\t\\t\\t\\t\\t\\taddress\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}\\n\\t\\t\\t}"}',
			)
			.reply(200, loader.json("test/fixtures/coins/ada/testnet/transactions-1.json"))
			.post(
				"/",
				`{"query":"\\n\\t\\t\\t{\\n\\t\\t\\t\\ttransactions(\\n\\t\\t\\t\\t\\twhere: {\\n\\t\\t\\t\\t\\t\\t_or: [\\n\\t\\t\\t\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\t\\t\\t\\tinputs: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\taddress: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t_in: [\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\"addr_test1qqhf69gcp89xp4dkyd4jzz3axeup7xtxvptpqggv4f4nfmhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7qn5uk\\"\\n\\"addr_test1qqa0w8qtytzgunhd6s4thsv8h0mrtp2m3c6tccg4mwfg388k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33smte8pt\\"\\n\\"addr_test1qz2uw8hxrczh73und9penx04g3tpa8maj2mcgc7phv02w7hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33su5mde6\\"\\n\\"addr_test1qrjktdnhhs40uwjk6u5e9vu2h7xu4qreadq2kg6yz49n68hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sd08l30\\"\\n\\"addr_test1qpapny0v7xdvmlsds3esnvu0p02drqt6k08jptfta7ngmslk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sj8rerf\\"\\n\\"addr_test1qzf49j427l4mkdhgjnpu5wtthkrj0jstwkyzhzaljnlh9p0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33szrvfkr\\"\\n\\"addr_test1qzaxxvwhv0z86skaeg5hxrcfkew8rpa8lv8kmvru82r2u00k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33swmwyxx\\"\\n\\"addr_test1qr30kfyxw2nd2rur3wxkmzpzjkv5r42qeluz9t5jzedv2yhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9cycgp\\"\\n\\"addr_test1qqazaenjahua73wcgygxt58jw538r74vf6nt9k99ur9xj20k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh4rn6j\\"\\n\\"addr_test1qrjmqgdq0r65mshrwfhtwnvtxs80x9k5trdvlcqp9zd6gh0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh6dk2u\\"\\n\\"addr_test1qrzpmzs4xmxzec2ey6rjf49ttg8c7h5yaghyjg9fl7fs6flk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh8v6lw\\"\\n\\"addr_test1qqp446a8qtnwh6g48wx8m66f2d69lwp0yacg0t60730kgxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33smpqk4m\\"\\n\\"addr_test1qq6g0vlen2ggahx6q7n7aka2n26s4s8zpeell80lwpl57zlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssc9pvh\\"\\n\\"addr_test1qp56zmrkv7sngg8qdgrff0xea5pjawtgmcvnsz6gvxendvhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33spxzhk0\\"\\n\\"addr_test1qzh2mp5wmlsfc3swwqr7xearc9d2uuzyep0faxpjnxclnwhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssfhuew\\"\\n\\"addr_test1qpg6gskxjh3wdqvl4p7lvgp5yjhysrpkzd5t76c6hg0j9ehk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s64xp5g\\"\\n\\"addr_test1qp5pt79pama6xwmjjzsnw45vlzj7326e0d4d3u762std62hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw99yqy\\"\\n\\"addr_test1qqg46x0v5ct7gcquwhw5mdq3sq6xqxmgh4w5zgrf7z489lhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s0yra0e\\"\\n\\"addr_test1qzr0w6rs3pctsma73yesltu8f9mvamcmetvrzpvvtmdgx6hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5rnytc\\"\\n\\"addr_test1qpjap4xx3u9ukp2630tk3qcjtfz0xnkhafu2mdpkfexw4xhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shvu4gy\\"\\n\\"addr_test1qpdyxp7zjqm5et2q50v55cmac7zhc8yzh284sp5mre779s0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33su8dmal\\"\\n\\"addr_test1qq30rvplcsa3rhn50p52f83dfkezehppu3wlk2mf5jczrhhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33swvws26\\"\\n\\"addr_test1qqxryd8gvvw5pz9cnx242u6m7z5jlzxj0hq4hre32nazts8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33srsz322\\"\\n\\"addr_test1qzj6pfq7vaezyhysat4c0k40ffamsvem5pk88pafyenavclk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdv857j\\"\\n\\"addr_test1qp06jdf6ekcf0kny2gqn29fv8am0ekl78489wjq7z65dsn0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s8rdgk6\\"\\n\\"addr_test1qr9397hzvays3ru6xk8zcr6czy2la9x807rxnf53dd9227lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sth5glt\\"\\n\\"addr_test1qz9umzpuywvala2dl94af97sdtqt32ym9c7cmwfmgsc3vl0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suk9etg\\"\\n\\"addr_test1qp60r8q7fazt990z2hlz2mxvu4f5sldd0zhs9qd9zyrrmu8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33svcqy3s\\"\\n\\"addr_test1qptwzrr8g5jv6tm2xvefxyzn4jppquaet6yd0l6vuvzj5p8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4ksh2m\\"\\n\\"addr_test1qpln7e2g6v4lvewgfuflj8vl0wzv0la06r3r85ye6dxgmu8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sxjjc7w\\"\\n\\"addr_test1qr3n2eev8az86dr6yte8ck5sj9gtqqtqyqq2j8u7j2jadphk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdf9k84\\"\\n\\"addr_test1qp4rt425q7nfdglmn0vsufy8ru67lgrwehty66xcqvsmwghk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh0a3vz\\"\\n\\"addr_test1qpr2hulhfamuv90c3z59aj6d654xh8ajcuqtas6jkatys40k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33st9szql\\"\\n\\"addr_test1qq430wdqxz4x0jr0fewxmu3v0j89e3hkyyp705qf5a5feglk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssje98q\\"\\n\\"addr_test1qz4pehf06rzruludzps2mh2c6dkqk3q35f43rtscvj9tl6hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s0rfqut\\"\\n\\"addr_test1qq4ae8392x679z2l9eev2nv5twqyjuxq8ge59l5a8yrzuchk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sr65lvk\\"\\n\\"addr_test1qzy35fjzfypgzv4ej9r7pk6xsa664l0mvaurps6x9wfzg8hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shzvnps\\"\\n\\"addr_test1qrzp426evrkr7ycqaxg0sm3gp0dnnnsg9u92ldxqkrveallk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sv9yq03\\"\\n\\"addr_test1qzqz7zwsx402tmm3je7p9r4v3axfgw9m3y3yfxp7tf8z6ghk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5ag3l6\\"\\n\\"addr_test1qp254ez65pq5c2vtvg77gh23ty73xzlzcfuumyh8mdy6r5hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9c9aka\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t{\\n\\t\\t\\t\\t\\t\\t\\toutputs: {\\n\\t\\t\\t\\t\\t\\t\\t\\taddress: {\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t_in: [\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\"addr_test1qqhf69gcp89xp4dkyd4jzz3axeup7xtxvptpqggv4f4nfmhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s7qn5uk\\"\\n\\"addr_test1qqa0w8qtytzgunhd6s4thsv8h0mrtp2m3c6tccg4mwfg388k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33smte8pt\\"\\n\\"addr_test1qz2uw8hxrczh73und9penx04g3tpa8maj2mcgc7phv02w7hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33su5mde6\\"\\n\\"addr_test1qrjktdnhhs40uwjk6u5e9vu2h7xu4qreadq2kg6yz49n68hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sd08l30\\"\\n\\"addr_test1qpapny0v7xdvmlsds3esnvu0p02drqt6k08jptfta7ngmslk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sj8rerf\\"\\n\\"addr_test1qzf49j427l4mkdhgjnpu5wtthkrj0jstwkyzhzaljnlh9p0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33szrvfkr\\"\\n\\"addr_test1qzaxxvwhv0z86skaeg5hxrcfkew8rpa8lv8kmvru82r2u00k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33swmwyxx\\"\\n\\"addr_test1qr30kfyxw2nd2rur3wxkmzpzjkv5r42qeluz9t5jzedv2yhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9cycgp\\"\\n\\"addr_test1qqazaenjahua73wcgygxt58jw538r74vf6nt9k99ur9xj20k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh4rn6j\\"\\n\\"addr_test1qrjmqgdq0r65mshrwfhtwnvtxs80x9k5trdvlcqp9zd6gh0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh6dk2u\\"\\n\\"addr_test1qrzpmzs4xmxzec2ey6rjf49ttg8c7h5yaghyjg9fl7fs6flk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh8v6lw\\"\\n\\"addr_test1qqp446a8qtnwh6g48wx8m66f2d69lwp0yacg0t60730kgxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33smpqk4m\\"\\n\\"addr_test1qq6g0vlen2ggahx6q7n7aka2n26s4s8zpeell80lwpl57zlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssc9pvh\\"\\n\\"addr_test1qp56zmrkv7sngg8qdgrff0xea5pjawtgmcvnsz6gvxendvhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33spxzhk0\\"\\n\\"addr_test1qzh2mp5wmlsfc3swwqr7xearc9d2uuzyep0faxpjnxclnwhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssfhuew\\"\\n\\"addr_test1qpg6gskxjh3wdqvl4p7lvgp5yjhysrpkzd5t76c6hg0j9ehk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s64xp5g\\"\\n\\"addr_test1qp5pt79pama6xwmjjzsnw45vlzj7326e0d4d3u762std62hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw99yqy\\"\\n\\"addr_test1qqg46x0v5ct7gcquwhw5mdq3sq6xqxmgh4w5zgrf7z489lhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s0yra0e\\"\\n\\"addr_test1qzr0w6rs3pctsma73yesltu8f9mvamcmetvrzpvvtmdgx6hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5rnytc\\"\\n\\"addr_test1qpjap4xx3u9ukp2630tk3qcjtfz0xnkhafu2mdpkfexw4xhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shvu4gy\\"\\n\\"addr_test1qpdyxp7zjqm5et2q50v55cmac7zhc8yzh284sp5mre779s0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33su8dmal\\"\\n\\"addr_test1qq30rvplcsa3rhn50p52f83dfkezehppu3wlk2mf5jczrhhk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33swvws26\\"\\n\\"addr_test1qqxryd8gvvw5pz9cnx242u6m7z5jlzxj0hq4hre32nazts8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33srsz322\\"\\n\\"addr_test1qzj6pfq7vaezyhysat4c0k40ffamsvem5pk88pafyenavclk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdv857j\\"\\n\\"addr_test1qp06jdf6ekcf0kny2gqn29fv8am0ekl78489wjq7z65dsn0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s8rdgk6\\"\\n\\"addr_test1qr9397hzvays3ru6xk8zcr6czy2la9x807rxnf53dd9227lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sth5glt\\"\\n\\"addr_test1qz9umzpuywvala2dl94af97sdtqt32ym9c7cmwfmgsc3vl0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33suk9etg\\"\\n\\"addr_test1qp60r8q7fazt990z2hlz2mxvu4f5sldd0zhs9qd9zyrrmu8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33svcqy3s\\"\\n\\"addr_test1qptwzrr8g5jv6tm2xvefxyzn4jppquaet6yd0l6vuvzj5p8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4ksh2m\\"\\n\\"addr_test1qpln7e2g6v4lvewgfuflj8vl0wzv0la06r3r85ye6dxgmu8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sxjjc7w\\"\\n\\"addr_test1qr3n2eev8az86dr6yte8ck5sj9gtqqtqyqq2j8u7j2jadphk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sdf9k84\\"\\n\\"addr_test1qp4rt425q7nfdglmn0vsufy8ru67lgrwehty66xcqvsmwghk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sh0a3vz\\"\\n\\"addr_test1qpr2hulhfamuv90c3z59aj6d654xh8ajcuqtas6jkatys40k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33st9szql\\"\\n\\"addr_test1qq430wdqxz4x0jr0fewxmu3v0j89e3hkyyp705qf5a5feglk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33ssje98q\\"\\n\\"addr_test1qz4pehf06rzruludzps2mh2c6dkqk3q35f43rtscvj9tl6hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s0rfqut\\"\\n\\"addr_test1qq4ae8392x679z2l9eev2nv5twqyjuxq8ge59l5a8yrzuchk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sr65lvk\\"\\n\\"addr_test1qzy35fjzfypgzv4ej9r7pk6xsa664l0mvaurps6x9wfzg8hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33shzvnps\\"\\n\\"addr_test1qrzp426evrkr7ycqaxg0sm3gp0dnnnsg9u92ldxqkrveallk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sv9yq03\\"\\n\\"addr_test1qzqz7zwsx402tmm3je7p9r4v3axfgw9m3y3yfxp7tf8z6ghk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s5ag3l6\\"\\n\\"addr_test1qp254ez65pq5c2vtvg77gh23ty73xzlzcfuumyh8mdy6r5hk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s9c9aka\\"\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t) {\\n\\t\\t\\t\\t\\tinputs {\\n\\t\\t\\t\\t\\t\\taddress\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\toutputs {\\n\\t\\t\\t\\t\\t\\taddress\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}\\n\\t\\t\\t}"}`,
			)
			.reply(200, loader.json("test/fixtures/coins/ada/testnet/transactions-2.json"))
			.post(
				"/",
				`{"query":"\\n\\t\\t\\t{\\n\\t\\t\\t\\tutxos_aggregate(\\n\\t\\t\\t\\t\\twhere: {\\n\\t\\t\\t\\t\\t\\taddress: {\\n\\t\\t\\t\\t\\t\\t\\t_in: [\\n\\t\\t\\t\\t\\t\\t\\t\\t\\"addr_test1qqy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmn8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw96paj\\"\\n\\"addr_test1qrhvwtn8sa3duzkm93v5kjjxlv5lvg67j530wyeumngu23lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4s8xvh\\"\\n\\"addr_test1qrtlcnmfdyarpscqxa6nthjz0na7xyz3fa8vt3yjw2y5gs8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33saf6px4\\"\\n\\"addr_test1qzawae46edstqpdy84hhymuldnflyup0kjrp9ss5mgzvgplk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sfwe8sv\\"\\n\\"addr_test1qzfjfm724nv9qz6nfyagmj0j2uppr35gzv5qee8s7489wxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scc4thv\\"\\n\\"addr_test1qzdcehzqelgwyzdzswc8f7743xvr3sywjq63s0auft8g0d8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sjv0ust\\"\\n\\"addr_test1qz2t57ujlkxdtv86pwehqq74a4t93xz60vvesnvgt3qz6g0k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sp6hm22\\"\\n\\t\\t\\t\\t\\t\\t\\t]\\n\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t) {\\n\\t\\t\\t\\t\\taggregate {\\n\\t\\t\\t\\t\\t\\tsum {\\n\\t\\t\\t\\t\\t\\t\\tvalue\\n\\t\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t\\t}\\n\\t\\t\\t\\t}\\n\\t\\t\\t}"}`,
			)
			.reply(200, loader.json("test/fixtures/coins/ada/testnet/utxos_aggregate.json"))
			.persist();
	});

	it("#fromMnemonicWithBIP39 - should create a wallet using BIP39", async (context) => {
		const wallet = await context.subject.fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
			network: "ark.devnet",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});

	// it("#fromMnemonicWithBIP39 - should throw if BIP39 is requested but extended public keys are used", async (context) => {
	// 	await assert.rejects(
	// 		() =>
	// 			context.subject.fromMnemonicWithBIP39({
	// 				coin: "ADA",
	// 				mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 				network: "ada.testnet",
	// 			}),
	// 		"The configured network uses extended public keys with BIP44 for derivation.",
	// 	);
	// });

	it("#fromMnemonicWithBIP39 - should create a wallet using BIP39 with encryption", async (context) => {
		const wallet = await context.subject.fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
			network: "ark.devnet",
			password: "password",
		});

		await wallet.synchroniser().identity();
		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
		assert.string(wallet.data().get(WalletData.EncryptedSigningKey));

		assert.is(
			await PBKDF2.decrypt(wallet.data().get(WalletData.EncryptedSigningKey), "password"),
			"bomb open frame quit success evolve gain donate prison very rent later",
		);
	});

	// it("#fromMnemonicWithBIP44 - should create a wallet using BIP44 (mnemonic > address) for ADA", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP44({
	// 		coin: "ADA",
	// 		levels: { account: 0 },
	// 		mnemonic:
	// 			"excess behave track soul table wear ocean cash stay nature item turtle palm soccer lunch horror start stumble month panic right must lock dress",
	// 		network: "ada.testnet",
	// 	});

	// 	assert.is(
	// 		wallet.address(),
	// 		"addr_test1qqy6nhfyks7wdu3dudslys37v252w2nwhv0fw2nfawemmn8k8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33sw96paj",
	// 	);
	// });

	// it("#fromMnemonicWithBIP44 - should create a wallet using BIP44 (mnemonic > address) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP44({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(wallet.address(), "n16aeukbAKUZPh3iefK3DjpyJAc6TUHw9C");
	// });

	// it("#fromMnemonicWithBIP44 - should create a wallet using BIP44 (mnemonic > extended public key) for ADA", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP44({
	// 		coin: "ADA",
	// 		levels: { account: 0 },
	// 		mnemonic:
	// 			"excess behave track soul table wear ocean cash stay nature item turtle palm soccer lunch horror start stumble month panic right must lock dress",
	// 		network: "ada.testnet",
	// 	});

	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"xpub14mpsxvx74mxaw5p3jksdwvp9d7h0sup8qg43hhd8eg9xr09q540y64667k5nhh6fqk3hqtadah69r6jcg7gayvadayykt4sghtzhxpqca4vve",
	// 	);
	// });

	// it("#fromMnemonicWithBIP44 - should create a wallet using BIP44 (mnemonic > extended public key) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP44({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"tpubDDdFbnZcaQhDWfstrSh8cWxcSFzJZfeteebCDwXUeis9JuvajhA4qwjhoDN8Em3gKX1t1A8FcVNMNWPPUMAmWKLtneA2cj4kci1boqmKf4m",
	// 	);
	// });

	// it("#fromMnemonicWithBIP49 - should create a wallet using BIP49 (mnemonic > address) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP49({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(wallet.address(), "2NDqSnogr4eQeLrPWM5GmgBvNuMbwdyh1Bi");
	// });

	// it("#fromMnemonicWithBIP49 - should create a wallet using BIP49 (mnemonic > extended public key) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP49({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"tpubDDtBpveGs7uW1X715ZzEHtH1KinDUTW71E3u1ourxCameEdmWrQMLdFGAAYmgTWbLxWw8Dcb6PAV37eNCZDSUu3s2uc2ZTvXRodnUcTLJ8u",
	// 	);
	// });

	// it("#fromMnemonicWithBIP84 - should create a wallet using BIP84 (mnemonic > address) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP84({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(wallet.address(), "tb1quhtzwu2pm7apf4r0c4sgj73cvdrspy6ez4jxjn");
	// });

	// it("#fromMnemonicWithBIP84 - should create a wallet using BIP84 (mnemonic > extended public key) for BTC", async (context) => {
	// 	const wallet = await context.subject.fromMnemonicWithBIP84({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: "bomb open frame quit success evolve gain donate prison very rent later",
	// 		network: "btc.testnet",
	// 	});

	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"tpubDDVt9raAkiwRY7hvDoYYP3aAJMVc6rUN4sAEPFHUamgpupZKQAFZeBJ9S83UksWoGUTqseKEuwerpgqPytYuhSxXMKVYz7tFMinkt5iGk4g",
	// 	);
	// });

	it("#fromAddress", async (context) => {
		const wallet = await context.subject.fromAddress({
			address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			coin: "ARK",
			network: "ark.devnet",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");

		const mainnetWallet = await context.subject.fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		assert.is(mainnetWallet.address(), "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX");
	});

	it("#fromPublicKey - for ARK", async (context) => {
		const wallet = await context.subject.fromPublicKey({
			coin: "ARK",
			network: "ark.devnet",
			publicKey: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});

	// it("#fromPublicKey - for BTC (testnet)", async (context) => {
	// 	const wallet = await context.subject.fromPublicKey({
	// 		bip44: { account: 0 },
	// 		coin: "BTC",
	// 		network: "btc.testnet",
	// 		publicKey:
	// 			"tpubDCdFvjrda9JXDYFb518YfcEEWSj3gRfRAU69PGnNS4dYx3bBARVhKQNRC1wBYComzGCyXea7rpYW2YjxahrEPzapLQpfSMky4bdz3YPTgTJ",
	// 	});

	// 	assert.is(wallet.address(), "mp2Ucb5WLX5v3aD3wmwbTi5xsbLESKhQDf");
	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"tpubDCdFvjrda9JXDYFb518YfcEEWSj3gRfRAU69PGnNS4dYx3bBARVhKQNRC1wBYComzGCyXea7rpYW2YjxahrEPzapLQpfSMky4bdz3YPTgTJ",
	// 	);
	// });

	// it("#fromPublicKey - for BTC (livenet)", async (context) => {
	// 	const wallet = await context.subject.fromPublicKey({
	// 		bip44: { account: 0 },
	// 		coin: "BTC",
	// 		network: "btc.livenet",
	// 		publicKey:
	// 			"xpub6Bk8X5Y1FN7pSecqoqkHe8F8gNaqMVApCrmMxZnRvSw4JpgqeM5T83Ze6uD4XEMiCSwZiwysnny8uQj5F6XAPF9FNKYNHTMoAu97bDXNtRe",
	// 	});

	// 	assert.is(wallet.address(), "12KRAVpawWmzWNnv9WbqqKRHuhs7nFiQro");
	// 	assert.is(
	// 		wallet.publicKey(),
	// 		"xpub6Bk8X5Y1FN7pSecqoqkHe8F8gNaqMVApCrmMxZnRvSw4JpgqeM5T83Ze6uD4XEMiCSwZiwysnny8uQj5F6XAPF9FNKYNHTMoAu97bDXNtRe",
	// 	);
	// });

	it("#fromPrivateKey", async (context) => {
		const wallet = await context.subject.fromPrivateKey({
			coin: "ARK",
			network: "ark.devnet",
			privateKey: "e2511a6022953eb399fbd48f84619c04c894f735aee107b02a7690075ae67617",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});

	it("#fromAddressWithDerivationPath", async (context) => {
		const wallet = await context.subject.fromAddressWithDerivationPath({
			address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			coin: "ARK",
			network: "ark.devnet",
			path: "m/44",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});

	it("#fromWIF - should create it with a WIF", async (context) => {
		const wallet = await context.subject.fromWIF({
			coin: "ARK",
			network: "ark.devnet",
			wif: "SHA89yQdW3bLFYyCvEBpn7ngYNR8TEojGCC1uAJjT5esJPm1NiG3",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});

	it("#fromWIF - should create it with a WIF and encryption", async (context) => {
		const stubEncrypt = stub(BIP38, "encrypt").returnValue(
			"6PYRydorcUPgUAtyd8KQCPd3YHo3vBAmSkBmwFcbEj7W4wBWoQ4JjxLj2d",
		);
		const stubDecrypt = stub(BIP38, "decrypt").returnValue({
			compressed: true,
			privateKey: Buffer.from("e2511a6022953eb399fbd48f84619c04c894f735aee107b02a7690075ae67617", "hex"),
		});

		const wallet = await context.subject.fromWIF({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			wif: "6PYRydorcUPgUAtyd8KQCPd3YHo3vBAmSkBmwFcbEj7W4wBWoQ4JjxLj2d",
		});

		await wallet.synchroniser().identity();

		assert.is(wallet.address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(wallet.publicKey(), "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd");
	});
});
