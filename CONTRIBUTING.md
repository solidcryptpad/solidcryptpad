# Contributing

This document contains guidelines and developing tips for contributors.

## Git strategy

This projects has a healthy main branch, that is ready to be deployed. Therefore, before integrating updates into main, pull and merge main into your branch, wait until the test suite succeeds, and then merge back into main.

For any modification, create a new branch based on the current main branch. The goal is to integrate back with the main branch as soon and often as possible. This helps detecting conflicting changes early in the process and results in many small merges. When integrating with main, make sure that make sure that the tests cover the updates and only completed features are accessible via the UI.

To allow frequent integration with main, features can be merged even when not fully finished. When some functionality is implemented and tested, you can integrate it into main. However, users should only have access to complete features. As an example for a partial feature integration: You develop and write tests for a text editor, but when integrating with main, hide the "enter edit mode" button in the UI. So if you updated an encryption component, or added a new feature to the file explorer, these changes quickly are integrated into the main branch. Other developers then can use the updated components and/or see if there is a conflicting change.

## Working with Angular

As a prerequisite, you will need to install the Angular CLI (`npm install -g @angular/cli`).

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

### Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
