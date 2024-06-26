/* eslint-disable @typescript-eslint/require-await */
import { renderHook } from "@testing-library/react";

import { useQRCode } from "./hooks";
import * as themeUtils from "@/utils/theme";
import { waitFor } from "@/utils/testing-library";

const QRCode = {
	dark: "data:image/png;base64,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",
	light: "data:image/png;base64,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",
};

const renderQRCode = () =>
	renderHook(() =>
		useQRCode({
			address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
			amount: "10",
			coin: "ARK",
			memo: "test",
			nethash: "2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		}),
	);

describe("useQRCode hook", () => {
	let darkModeSpy: vi.SpyInstance;

	beforeAll(() => {
		Object.defineProperty(window, "location", {
			value: {
				origin: "example.com",
			},
		});
	});

	beforeEach(() => {
		darkModeSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(false);
	});

	afterEach(() => {
		darkModeSpy.mockRestore();
	});

	it.each([false, true])("should generate qr code in darkMode = %s", async (shouldUseDarkColors) => {
		const themeSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

		const { result } = renderQRCode();

		await waitFor(() =>
			expect(result.current.uri).toBe(
				"example.com/#/?memo=test&amount=10&method=transfer&recipient=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD&coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
			),
		);

		expect(result.current.image).toStrictEqual(shouldUseDarkColors ? QRCode.dark : QRCode.light);

		themeSpy.mockRestore();
	});

	it("should generate qr code with dark colors", async () => {
		const { result } = renderQRCode();

		const darkColorsMock = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(true);

		// eslint-disable-next-line sonarjs/no-identical-functions
		await waitFor(() =>
			expect(result.current.uri).toBe(
				"example.com/#/?memo=test&amount=10&method=transfer&recipient=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD&coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
			),
		);

		expect(result.current.image).toBe(
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAD6CAYAAACI7Fo9AAAAAklEQVR4AewaftIAABFzSURBVO3BUYolya5t0RlGdCQlUv1vzwKpK/Hq0xEHzPHrO7PKnsb4+mW/f/gXqBRPmAdXlaIzD+6oFE+YB1eV4g7zYKdSdOZBVyl2zIOuUnTmwVWl6MyDrlLsmAddpejMg6tK8aeZB1eV4gnz4G9bjDGOtxhjHG8xxjjeYoxxvG/+h0rxSebBE+ZBVymuzIM7KsWOedBVih3z4I5K0ZkHO5VixzzoKkVnHnSV4so86CpFZx5cVYquUnTmwRPmwU6luMM82DEPukrxRKX4JPPgajHGON5ijHG8xRjjeIsxxvG+uck8eKJSPGEedJWiMw+uKkVnHnTmQVcpdsyDT6oUO+ZBVyl2zIM7zIMd86CrFFfmwVvMgyfMgzsqxY558EnmwROVYmcxxjjeYoxxvMUY43iLMcbxvvn/VKXYqRR3mAc7laIzD3YqxROV4m+rFJ9kHuxUijvMg51K0ZkHXaX4t1mMMY63GGMcbzHGON43/yHmQVcp3mIePFEprsyDpyrFlXnQVYrOPPjbKsVbzIOrStFVih3zoKsUb6kU/wWLMcbxFmOM4y3GGMdbjDGO981NleJvqxSdeXBVKbpK0ZkHXaW4Mg/uMA+eqBQ7leKJSvGUeXBVKe4wD64qxR3mQVcprsyDT6oUnXnwJ1WKT1mMMY63GGMcbzHGON5ijHG8b/4H8+Ak5kFXKTrz4KpSdOZBVymuzIM7zIOuUlyZB12leMI86CrFE+ZBVymuzIOuUrylUnTmwVWl6MyDrlI8YR50lWLHPPiTFmOM4y3GGMdbjDGOtxhjHO+7UvyXVYonzIOuUuxUis48uKoUnXnQVYrOPLiqFG+pFJ9kHlxVijsqxU6luKNSfIp50FWKnUrxty3GGMdbjDGOtxhjHO/bPOgqRWcefFKluKoUd5gHO5XiCfOgqxQ75sHfZh78aZVixzx4S6XozIOdStGZB12luDIPOvOgqxRX5sEnVYqdxRjjeIsxxvEWY4zjLcYYx/v6Zb9/eKhSXJkHXaW4wzy4qhRPmAddpXiLebBTKe4wD7pKcWUevKVS3GEeXFWKzjx4olL8SeZBVyk682CnUnySebBTKe4wD64WY4zjLcYYx1uMMY63GGMc7+vnHzTmwVsqRWcevKVSvMU8uKoUd5gHb6kUbzAPukrRmQddpbgyD7pK8UnmwU6l6MyDnUrxSebBTqXozIOdSvHEYoxxvMUY43iLMcbxvn7+wUvMgzsqxY558ESl6MyDk1SKzjzYqRSdebBTKTrz4C2VojMPrirFW8yDrlJ05sFOpXjCPOgqRWceXFWKJxZjjOMtxhjHW4wxjrcYYxzv65f9/uElleIO86CrFFfmwROV4g7zYKdSdObBTqXozIM7KsWOedBVih3zoKsUnXmwUyneYh50leLKPLijUjxhHnxKpbjDPHiiUuwsxhjHW4wxjrcYYxxvMcY43nel6MyDrlJ05sETlWKnUtxhHuyYB12l2DEP7qgUO5XiDvNgp1I8USmeqBSdedBViivz4I5K0ZkHV5WiMw/+tkrRmQc75kFXKTrz4KpS3GEeXC3GGMdbjDGOtxhjHG8xxjje1y/7/UNTKe4wD/5tKkVnHtxRKXbMg7dUis48uKoUbzEPukrxt5kHXaW4Mg/uqBSfYh50lWLHPOgqRWcedJXiyjy4o1JcLcYYx1uMMY63GGMc7+uX/f7hhkrRmQdPVIrOPPgvqBSdebBTKZ4wD56oFHeYB2+pFFfmwVOVYsc86CrFlXlwR6XYMQ/uqBQ75kFXKTrz4KpS3GEeXC3GGMdbjDGOtxhjHG8xxjje1y/7/cNLKsUd5kFXKd5gHjxVKT7FPOgqRWceXFWKzjz4pErxKeZBVyk682CnUuyYB12leIt5sFMp7jAPnqgUO4sxxvEWY4zjLcYYx1uMMY739ct+//BQpbgyD7pK8UnmwU6l+JPMg6cqxZV50FWKzjx4olJ05sETlWLHPHiiUrzFPOgqRWce7FSKt5gHXaW4Mg+eWIwxjrcYYxxvMcY43tcv+/3DDZXiLeZBVymuzIOuUuyYB09Vih3z4C2VojMPripFZx50leLKPOgqxSeZB1eV4g7zoKsUV+bBWypFZx50lWLHPNipFH/bYoxxvMUY43iLMcbxFmOM433zYeZBVyneYh48USl2zIO3VIo7KsVOpejMg7eYBzuVYsc86CrFE5XiCfOgMw/uMA+uKkVXKXbMgzsqRWceXFWKzjzoKsXVYoxxvMUY43iLMcbxFmOM431XijvMg65S7FSKzjz4lErRmQededBVip1K0ZkHT5gHO5WiMw92KsUnmQc7leKOStGZBzuVojMPrirFU+bBjnnQVYqrSnGHedBViivzoKsUO4sxxvEWY4zjLcYYx1uMMY739ct+/9BUijvMg6tK0ZkHXaXozIM3VIrOPHiiUnTmwSdVih3zoKsUT5gHb6kUV+ZBVynuMA+eqBRX5kFXKTrz4IlK0ZkHV5WiMw+eqBR3mAdXizHG8RZjjOMtxhjH+/plv39oKkVnHnxSpdgxD95SKTrz4KpSPGEedJWiMw92KsUd5sFbKsWOefBEpejMg51KcYd5cFUpPsk86CrFlXnQVYrOPOgqxY550FWKq8UY43iLMcbxFmOM4y3GGMf7rhRPVYod86CrFJ9SKe4wD95iHlxVis48+JMqxVPmwVWleIt50FWKJ8yDJ8yDrlJ05sET5sETleJTFmOM4y3GGMdbjDGOtxhjHO/r5x805kFXKXbMg0+qFH+SedBVis48uKoUT5kHV5XiDvPgT6oUnXlwVSk686CrFDvmwVsqRWce/FdVis48uFqMMY63GGMcbzHGON43H1YpnjAPOvOgqxRPmAddpdgxD3bMg7eYB12l2KkUT5kHO+bBjnnQVYpPqhRX5sEdlaIzD56oFE+YB12luDIPOvNgZzHGON5ijHG8xRjjeIsxxvG+zYOuUnTmwVvMg65S7FSKJ8yDJyrFJ5kHXaX4FPOgqxQ7leIt5sEdlWKnUnTmwVWluMM86CrFjnmwYx50leKJSvHEYoxxvMUY43iLMcbxFmOM431Xis486CrFjnlwR6V4i3lwVSm6SvGEefBEpbijUnTmwadUiifMgzsqxadUis486CrFjnnwJ1WKp8yDq0rxxGKMcbzFGON4izHG8RZjjON9/fyDxjz4r6gUT5gHXaXYMQ92KsUd5kFXKZ4wDz6lUnTmwU6leMo82KkUnXlwVSnuMA+6SrFjHnxSpbgyD7pK0ZkHV4sxxvEWY4zjLcYYx/v6Zb9/uKFSdObBE5XiCfOgqxRX5sFbKkVnHnSV4so86CrFW8yDrlJcmQdPVYor8+COSvEnmQddpdgxDz6pUuyYB09Uis482FmMMY63GGMcbzHGON5ijHG8r59/8IeZB12luDIPukrRmQc7laIzD3YqxVvMg65S7JgHXaV4i3mwUyn+NPPgT6oUT5gHO5WiMw+6SvEpizHG8RZjjOMtxhjHW4wxjvf1y37/8JJK0ZkHXaV4i3mwUyk68+CJSvFJ5sGnVIq3mAdvqRSdeXBVKTrzoKsUV+bBU5XiyjzoKsWOeXBHpejMg6tK8cRijHG8xRjjeIsxxvG++QvMg51K0ZkHO5WiMw+eqBRPmAdPVYonzIOrStGZB12l2DEP7qgUT5gHO+ZBVyk68+CqUrylUnTmQVcp3lIprsyDOyrF1WKMcbzFGON4izHG8RZjjON9/bLfP/xhlaIzD64qRWcedJVixzzoKkVnHvwXVIod8+COSvEp5kFXKe4wD56oFFfmwVsqxR3mwVWl6MyDOyrFE+bB1WKMcbzFGON4izHG8RZjjON9/bLfP7ykUtxhHjxRKTrz4KpSdOZBVyl2zIOuUnTmwVWl6MyDOyrFE+bBn1QpOvPgqlJ05sETleKTzIOuUnyKeXBHpdgxD7pKcbUYYxxvMcY43mKMcbzFGON435XiLebBHZWiMw92zIO3mAc7leIJ8+COSvGEebBTKTrzoKsUT5gHXaV4olI8YR50leLKPHjKPLiqFJ158JZK0ZkHV5XiDvPgajHGON5ijHG8xRjjeF8//+APMw92KkVnHuxUis486CpFZx7sVIod8+COStGZB1eV4gnzoKsUT5gHT1SKzjz42yrFHebBVaXozIOuUlyZB12leMI8uKNSXC3GGMdbjDGOtxhjHG8xxjje188/eMg82KkUT5gHn1QpdsyDOyrFlXlwR6XYMQ/+qypFZx68pVI8YR58UqXYMQ/uqBRPmAdXizHG8RZjjOMtxhjHW4wxjvf18w8a86CrFG8xD7pK8V9lHlxVis486CrFjnnQVYrOPNipFHeYB1eV4gnzoKsUd5gHb6gUnXlwR6XYMQ+6SvEW8+CqUjyxGGMcbzHGON5ijHG8r59/cIN5sFMp3mIePFEpOvOgqxQ75kFXKT7JPPiTKsWOeXBHpbgyD7pK8RbzoKsUV+bBn1YprsyDt1SKJxZjjOMtxhjHW4wxjrcYYxzv6+cfNOZBVyk68+BvqxRX5sEdlaIzD64qxSeZB12luDIPukqxYx50laIzD7pKsWMe7FSKzjzoKkVnHjxRKf5tzIOuUtxhHuxUip3FGON4izHG8RZjjOMtxhjH++b/oFJcmQd3VIonzIPOPLiqFJ150JkHO+bBHZXiyjzoKsUd5sFVpejMg51K8ZR5cFUp3lIp/ivMg6tK0ZkHO5WiMw/uqBRX5kFnHnSV4moxxjjeYoxxvMUY43iLMcbxvs2Dp8yDJ8yDrlJcmQddpejMgyvz4N/IPLijUuxUis48+BTzoKsUnXmwYx68pVJ05sFOpejMg65S7FSKt1SKzjy4qhRPLMYYx1uMMY63GGMc77tSdOZBZx50leK/oFK8xTx4S6V4S6W4Mg+6StFVih3z4Anz4JPMg51K0ZkHXaXozIOdStGZBzuVojMPukqxYx50leJqMcY43mKMcbzFGON4izHG8b75HyrFHebBVaW4wzzoKsWnmAddpdgxD+4wD3YqRWcedJXiCfNgxzz4kyrFW8yDOyrFlXnQVYrOPNipFJ158IR5cId5sFMpdhZjjOMtxhjHW4wxjrcYYxzv6+cf/AuZB12l2DEPnqoUT5gHV5XiKfPgDZXiKfPgDZXik8yDrlLsmAefVCmeMA+6SrFjHuwsxhjHW4wxjrcYYxzv2zz4N6gUV5XiDvPgiUrRmQc7laKrFDvmQVcpdipFZx48YR50lWKnUtxhHuyYB2+pFJ15sFMp3mIe7JgHXaW4wzy4qhRdpdhZjDGOtxhjHG8xxjjeYoxxvG/+h0rxSebBjnnQVYqdSvFUpfiTzIOuUuxUis482KkUbzEPukpxZR50leKTKsWVeXCHedBViivz4IlK8Unmwc5ijHG8xRjjeIsxxvEWY4zjfXOTefBEpfjbzIM7KsWVedBVirdUis48uKoUnXmwYx68xTzoKsVOpXjKPNipFJ15cFUpnjIPripFZx505sFbKsWVedBVip3FGON4izHG8RZjjOMtxhjH++Y/xDzoKsWVefCWStGZB12luDIP7jAPukrxKZXiLeZBVymuzIOuUtxRKXbMg65S7JgHXaXozIMr8+CJStGZB12leMI82FmMMY63GGMcbzHGON43/yGVYqdSdOZBVyk68+BPqhRPVIrOPHiLebBTKXYqxVPmwU6l6MyDnUpxR6V4wjy4Mg+6StGZB12luKoUnXmwsxhjHG8xxjjeYoxxvMUY43hfv+z3D02l+CTzoKsUO+ZBVyk+xTx4olJ05sFbKsUT5kFXKT7FPOgqxRPmQVcpdsyDOypFZx5cVYo/zTy4qhSdedBViqvFGON4izHG8RZjjOMtxhjH+/plv3/4F6gUV+bBWypFZx48USl2zIOuUjxhHjxRKe4wDz6lUnTmQVcpOvNgp1J05sFVpbjDPOgqxRPmwVsqxZV50FWKncUY43iLMcbxFmOM4/0/F1eioCntG7wAAAAASUVORK5CYII=",
		);

		darkColorsMock.mockRestore();
	});

	it("should generate without amount and memo", async () => {
		const { result,  } = renderHook(() =>
			useQRCode({
				address: "D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
				coin: "ARK",
				nethash: "2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
			} as any),
		);

		await waitFor(() =>
			expect(result.current.uri).toBe(
				"example.com/#/?method=transfer&recipient=D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD&coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
			),
		);

		expect(result.current.image).toBe(
			"data:image/png;base64,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",
		);
	});

	it("should return undefined if address is not provided", async () => {
		const { result } = renderHook(() =>
			useQRCode({ nethash: "2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867" } as any),
		);

		await waitFor(() => expect(result.current.uri).toBeUndefined());
		await waitFor(() => expect(result.current.image).toBeUndefined());
	});
});
