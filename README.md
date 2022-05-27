# ARKVault

![ARKVault](./banner.png)

[![Build Status](https://badgen.now.sh/github/status/PayvoHQ/wallet)](https://github.com/PayvoHQ/wallet/actions?query=branch%3Adevelop)
[![Latest Version](https://badgen.now.sh/github/release/PayvoHQ/wallet)](https://github.com/PayvoHQ/wallet/releases)
[![License: MIT](https://badgen.now.sh/badge/license/MIT/green)](https://opensource.org/licenses/MIT)

> Lead Maintainer: [Brian Faust](https://github.com/faustbrian)

## Development

### Requirements

#### Ubuntu

In Ubuntu the development files of `libudev` are necessary:

```
sudo apt-get install libudev-dev libusb-1.0-0-dev
```

#### Node 16

To download, head over to [here](https://nodejs.org/en/) and download Node 16.

Due to a bug in the V8 JavaScript Engine that effects NodeJS version 16.10.x and above we recommend installing version 16.9.x

If you already have npm installed, you can run

```
npm install -g n
sudo n 16.9
```

#### pnpm

Install the pnpm dependency manager

```
npm install -g pnpm
```

### Commands

<details><summary>List of commands</summary>

```bash
# Install dependencies
pnpm install

# Execute the application. Making changes in the code, updates the application (hot reloading).
pnpm dev

# Runs linter and applies code formatting
pnpm format

# Runs linter over the files
pnpm lint

# Try to automatically fix lint errors
pnpm lint

# Try to automatically fix lint errors
pnpm prettier

# Builds the production code for the react application
pnpm build

# Run the default test switch in default watch mode
pnpm test

# Run unit tests and generate and display the coverage report
pnpm test:coverage
```

</details>

## Security

If you discover a security vulnerability within this package, please send an e-mail to security@ark.io. All security vulnerabilities will be promptly addressed.

## Credits

This project exists thanks to all the people who [contribute](../../contributors).

## License

[MIT](LICENSE) © [Payvo](https://arkvault.io)
