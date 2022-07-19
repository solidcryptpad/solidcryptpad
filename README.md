# Solidcryptpad

Encrypted file storage and collaborative editory using the Solid specification.

The current main version is automatically deployed to: https://solidcryptpad.github.io/solidcryptpad/.

# Features

The key features of SolidCryptPad are:

- End-to-End encryption of all files in /solidcryptpad/
- Link-sharing for files and folders
- Live-collaboration on text files
- End-to-End tested with cypress + community-solid-server

A file explorer allows navigating through the encrypted files with many common functionalities (upload, download, preview, creation, deletion).

# Limitations

SolidCryptPad only works with solid pods that support WebAcl. We've manually tested it with NSS and used automated tests for CSS.

# Techstack

We've used following technologies:

- Solid (specification)
- Angular (TS Framework)
- Material.io (design)
- Karma (unit tests)
- Cypress (end-to-end tests)

# Documentation

The encryption scheme and link sharing is explained in [Encryption-Scheme.md](./docs/Encryption-Scheme.md). This also contains some nice diagrams and illustrations <3.

# Tests

We use Karma for the unit tests and Cypress + community-solid-server for E2E tests.

# Contributing

We are happy if you want to contribute something. You can also take a look at [CONTRIBUTING.md](./CONTRIBUTING.md).
