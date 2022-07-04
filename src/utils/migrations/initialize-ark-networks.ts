import { ARK } from "@ardenthq/sdk-ark";
import { Environment } from "@ardenthq/sdk-profiles";
import { isE2E } from "@/utils/test-helpers";

export const initializeArkNetworks = (env: Environment) => (
  async ({ profile, data }) => {
    if (typeof data.networks === "object" && Object.keys(data.networks).length > 0) {
      // Networks already assigned to profile, skipping migration
      return;
    }

    // Assign default networks to profile
    const initialNetworks = {
      "ark.mainnet": ARK.manifest.networks["ark.mainnet"],
    };

    if (isE2E()) {
      initialNetworks["ark.devnet"] = ARK.manifest.networks["ark.devnet"];
    }

    profile.networks().fill(initialNetworks);

    await env.persist();
  }
);
