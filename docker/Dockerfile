FROM ubuntu:24.04

# prevent apt-get prompting
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    build-essential python-is-python3 libjemalloc-dev curl git ca-certificates postgresql-client jq \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

RUN npm install -g pnpm@latest

# https://rust-lang.org/tools/install/
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:$PATH"

WORKDIR /workspace

# https://docs.mainsailhq.com/mainsail/installation/local-setup#mainsail-setup
RUN git clone https://github.com/ArkEcosystem/mainsail.git . \
    && git checkout feat/api/tokens \
    && pnpm install --frozen-lockfile \
    && pnpm run setup

# https://docs.mainsailhq.com/mainsail/installation/local-setup#configure-and-run-local-network
RUN cat > packages/core/bin/config/devnet/core/.env <<EOF
MAINSAIL_LOG_LEVEL=info
MAINSAIL_LOG_LEVEL_FILE=debug
MAINSAIL_DB_HOST=postgres
MAINSAIL_DB_PORT=5432
MAINSAIL_DB_DATABASE=test_db
MAINSAIL_DB_USERNAME=test_db
MAINSAIL_DB_PASSWORD=password
MAINSAIL_DB_LOGGING_ENABLED=
MAINSAIL_API_SYNC_ENABLED=true
MAINSAIL_P2P_HOST=0.0.0.0
MAINSAIL_P2P_PORT=4000
MAINSAIL_WEBHOOKS_HOST=0.0.0.0
MAINSAIL_WEBHOOKS_PORT=4004
MAINSAIL_API_DEV_ENABLED=true
MAINSAIL_API_DEV_HOST=0.0.0.0
MAINSAIL_API_DEV_PORT=4006
MAINSAIL_API_EVM_DISABLED=
MAINSAIL_API_EVM_HOST=0.0.0.0
MAINSAIL_API_EVM_PORT=4008
MAINSAIL_API_TRANSACTION_POOL_DISABLED=
MAINSAIL_API_TRANSACTION_POOL_HOST=0.0.0.0
MAINSAIL_API_TRANSACTION_POOL_PORT=4007
MAINSAIL_CRYPTO_WORKER_COUNT=2
MAINSAIL_CRYPTO_WORKER_LOGGING_ENABLED=
EOF

# https://docs.mainsailhq.com/mainsail/installation/local-setup#configure-and-run-local-network
RUN jq '.packages += ["@mainsail/api-http", "@mainsail/webhooks"]' \
        packages/core/bin/config/devnet/core/app.json > /tmp/app.json \
 && mv /tmp/app.json packages/core/bin/config/devnet/core/app.json

WORKDIR /workspace/packages/core
CMD ["pnpm", "run", "full:devnet"]
