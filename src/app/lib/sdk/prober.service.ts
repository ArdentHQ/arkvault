/* istanbul ignore file */
/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */

import { NotImplemented } from "./exceptions";
import { ProberService } from "./prober.contract";

export class AbstractProberService implements ProberService {
	public async evaluate(host: string): Promise<boolean> {
		throw new NotImplemented(this.constructor.name, this.evaluate.name);
	}
}
