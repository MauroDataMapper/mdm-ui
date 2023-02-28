/*
Copyright 2020-2023 University of Oxford and NHS England

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

import {MatchThemeColorPatternPipe} from '@mdm/pipes/matchThemeColorPattern.pipe';

describe('MatchThemeColorPatternPipe', () => {
    // This pipe is a pure, stateless function so no need for BeforeEach
    const pipe = new MatchThemeColorPatternPipe();

    it('should detect theme color pattern names', () => {
        // Arrange
        interface TestData {
          stringToTest: string,
          expectedOutcome:  boolean,
        };
        
        const testingCases : TestData[]= [
          {
            stringToTest: "",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.material.colors.primary",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.material.colors.accent",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.material.colors.warn",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.material.typography.fontfamily",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.material.typography.bodyone",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.material.typography.bodytwo",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.material.typography.button",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.regularcolors.requestcount",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.regularcolors.hyperlink",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.contrastcolors.page",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.contrastcolors.unsentrequest",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.contrastcolors.submittedrequest",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.contrastcolors.classrow",
            expectedOutcome: true,
          },
          {
            stringToTest: "explorer.theme.material.colors.primary",
            expectedOutcome: true,
          },
          {
            stringToTest: "email.theme.material.colors.primary",
            expectedOutcome: true,
          },
          {
            stringToTest: "mauro.theme.material.colors.primary",
            expectedOutcome: true,
          },
          {
            stringToTest: "mdm.theme.material.colors.accent",
            expectedOutcome: true,
          },
          {
            stringToTest: "email.theme.material.colors.warn",
            expectedOutcome: true,
          },
          {
            stringToTest: "mdm.color.material.themes.accent",
            expectedOutcome: false,
          },
          {
            stringToTest: "email.colors.material.theme.warn",
            expectedOutcome: false,
          },
          {
            stringToTest: "email.admin_confirm_registration.body",
            expectedOutcome: false,
          },
          {
            stringToTest: "email.password_reset.subject",
            expectedOutcome: false,
          },
          {
            stringToTest: "datatype.date.formats",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.config.root_data_model_path",
            expectedOutcome: false,
          },
          {
            stringToTest: "explorer.theme.color.chip.unsent",
            expectedOutcome: true,
          },
        ];
    
        // Act
        testingCases.forEach((testCase) => {
          const result = pipe.transform(testCase.stringToTest);
          // Uncomment the line below is very useful for debuging the test. 
          //console.log(`For element "${testCase.stringToTest}" expected is "${testCase.expectedOutcome}" actual response is "${result}"`);
          
          // Assert
          expect(result).toBe(testCase.expectedOutcome);
        });
      });

  });