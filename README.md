# MC-UI2 (MetadatCatalogue UI)


## Development server

Run `npm start` for a dev server. 
Navigate to `http://localhost:8005/`. The app will automatically reload if you change any of the source files.


## Build

Run `npm build` to build the project. The build artifacts will be stored in the `dist/` directory.


## Running unit tests

Run `npm test` to execute the unit tests via [Karma](https://karma-runner.github.io) on Chrome.


## Running unit tests in Jenkins (using PhantomJS headless browser)

Run `npm build test:dist` to execute test in PhantomJS headless browser.
The test result will be saved on `test_results` and Jenkins should display the test result based on the XML result file which is in this directory.

