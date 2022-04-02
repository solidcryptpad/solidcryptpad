# Contributing

This document contains guidelines and developing tips for contributors.

## Git strategy

### Integrating with development

This projects has a healthy development branch, that is ready to be deployed. Therefore, before integrating updates into development, pull and merge development into your branch, wait until the test suite succeeds, and then merge back into development.

### Integration frequency

The goal is to integrate back with the development branch as soon and often as possible. This helps detecting conflicting changes early in the process and results in many small merges. When integrating with development, make sure that make sure that the tests cover the updates and only completed features are accessible via the UI.

To allow frequent integration with development, features can be merged even when not fully finished. When some functionality is implemented and tested, you can integrate it into development. However, users should only have access to complete features. As an example for a partial feature integration: You develop and write tests for a text editor, but when integrating with development, hide the "enter edit mode" button in the UI. So if you updated an encryption component, or added a new feature to the file explorer, these changes quickly are integrated into the development branch. Other developers then can use the updated components and/or see if there is a conflicting change.

### Branching convention

Branches start with the issue number, if available, and have a descriptive name. For example: `9-development-guidelines`. If the branch is related to a user story, the identifier should be included after the issue number: `10-S1-encrypted-upload`.

### Git messages convention

Commit messages have the form `<type>: <subject>[. Ref #<issue-number>]`. The commit body can contain a more detailed description. If there is a related issue, it must be referenced.

Following types are suggested:

- `build`: changes to the build system (e.g. `build: add firefox to .browserslistrc. Ref #12`)
- `ci`: changes to CI configuration (e.g. `ci: add angular tests to pipeline`)
- `docs`: changes to documentation (e.g. `docs: add git strategy to CONTRIBUTING.md`)
- `feat`: implements new functionality (e.g. `feat: upload of files to pod. Ref #123`)
- `fix`: bug fix (e.g. `fix: correct sorting of items in file explorer. Ref #123`)
- `refactor`: code modification that does not change functionality (`refactor: extract datasource from file explorer`)
- `test`: changes to tests and test suite (e.g. `test: edge case of empty file explorer`)

## Formatting

Code is automatically formatted with Prettier on every commit.

## Linting

Code is automatically linted with ESlint on every commit. If the linter cannot fix errors automatically, then fix the errors manually, stage the changes and commit again.

## Working with Angular

As a prerequisite, you will need to install the Angular CLI (`npm install -g @angular/cli`).

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component components/component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
