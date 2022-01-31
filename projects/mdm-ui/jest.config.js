/*
Copyright 2020-2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
module.exports = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/projects/mdm-ui/src/setupJest.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/jestSetup.ts',
    '<rootDir>/node_modules/',
    '.module.ts',
    '.html'
  ],
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  globals: {
    'ts - jest': {
      tsconfig: '<rootDir>/projects/mdm-ui/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html'
    }
  },
  moduleNameMapper: {
    '^@mdm/(.*)$': '<rootDir>/projects/mdm-ui/src/app/$1',
    '^@env/(.*)$': '<rootDir>/projects/mdm-ui/src/environments/$1'
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: "test-report/mdm-ui"
    }],
    ['jest-html-reporter', {
      pageTitle: "Mauro Data Mapper User Interface: Test Results",
      outputPath: "test-report/mdm-ui/jest-report.html",
      includeFailureMsg: true
    }],
    ['jest-sonar', {
      outputDirectory: "test-report/mdm-ui"
    }]
  ],
  watchPathIgnorePatterns: ['test-report/', 'junit.xml'],
  transformIgnorePatterns: [
    'node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic)' // Ignore files inside node_modules folder
  ],
  cacheDirectory: '/tmp/jest_' + (process.env.JOB_BASE_NAME || 'cache')
};
