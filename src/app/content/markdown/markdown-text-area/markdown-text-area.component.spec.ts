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
import { fakeAsync, tick } from '@angular/core/testing';
import { ElementSelectorDialogueService, MessageService } from '@mdm/services';
import {
  ComponentHarness,
  setupTestModuleForComponent
} from '@mdm/testing/testing.helpers';
import { of } from 'rxjs';
import { MarkdownTextAreaComponent } from './markdown-text-area.component';

type MdEditorAction =
  | 'bold'
  | 'italic'
  | 'heading'
  | 'quote'
  | 'bulletlist'
  | 'numberlist';

describe('MarkdownTextAreaComponent', () => {
  let harness: ComponentHarness<MarkdownTextAreaComponent>;

  const messageServiceStub = {
    elementSelector: of(null)
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MarkdownTextAreaComponent, {
      providers: [
        {
          provide: ElementSelectorDialogueService,
          useValue: jest.fn()
        },
        {
          provide: MessageService,
          useValue: messageServiceStub
        }
      ]
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('editing', () => {
    beforeEach(() => {
      harness.component.inEditMode = true;
      harness.detectChanges();
    });

    it.each(['text', 'more text', 'even more text'])(
      'should emit that description text %p has changed',
      (text) => {
        const emitSpy = jest.spyOn(harness.component.descriptionChange, 'emit');

        harness.component.description = text;
        harness.component.onEditorChanged();

        expect(emitSpy).toHaveBeenCalledWith(text);
      }
    );

    describe('preview', () => {
      it('should turn preview on', () => {
        harness.component.showPreview = false;
        harness.component.togglePreview();
        expect(harness.component.showPreview).toBe(true);
      });

      it('should turn preview off', fakeAsync(() => {
        const focusSpy = jest.spyOn(
          harness.component.textArea.nativeElement,
          'focus'
        );

        harness.component.showPreview = true;
        harness.component.togglePreview();

        // Simulate setTimeout() to complete
        tick();

        expect(harness.component.showPreview).toBe(false);
        expect(focusSpy).toHaveBeenCalled();
      }));
    });

    describe('text manipulation', () => {
      // Test cases:
      // action,
      // originl text,
      // expected result,
      // initial selection (optional)
      const cases: [MdEditorAction, string, string, string][] = [
        ['bold', 'Hello world', 'Hello world**text**', undefined],
        ['bold', 'Hello world', 'Hello **world**', 'world'],
        [
          'bold',
          'Hello world, how are you?',
          'Hello **world**, how are you?',
          'world'
        ],
        ['italic', 'Hello world', 'Hello world_text_', undefined],
        ['italic', 'Hello world', 'Hello _world_', 'world'],
        [
          'italic',
          'Hello world, how are you?',
          'Hello _world_, how are you?',
          'world'
        ],
        [
          'heading',
          'Hello world',
          `Hello world

# heading`,
          undefined
        ],
        [
          'heading',
          'Hello world',
          `Hello world

# heading`,
          'world'
        ],
        [
          'quote',
          'Hello world',
          `Hello world

> quote`,
          undefined
        ],
        [
          'quote',
          'Hello world',
          `Hello world

> quote`,
          'world'
        ],
        [
          'bulletlist',
          'Hello world',
          `Hello world

- text`,
          undefined
        ],
        [
          'bulletlist',
          'Hello world',
          `Hello world

- text`,
          'world'
        ],
        [
          'numberlist',
          'Hello world',
          `Hello world

1. text`,
          undefined
        ],
        [
          'numberlist',
          'Hello world',
          `Hello world

1. text`,
          'world'
        ]
      ];

      const performTextManipulationTest = async (
        original: string,
        expected: string,
        selection: string,
        action: () => void
      ) => {
        // Set and bind text to control
        harness.component.description = original;
        harness.detectChanges();

        // description input is bound to ngModel and these updates are asynchronous.
        // Wait for stability before continuing to ensure values are set correctly
        await harness.fixture.whenStable();

        if (selection) {
          const selIndex = original.indexOf(selection);

          harness.component.textArea.nativeElement.setSelectionRange(
            selIndex,
            selIndex + selection.length,
            'forward'
          );
        }

        const focusSpy = jest.spyOn(
          harness.component.textArea.nativeElement,
          'focus'
        );

        action();

        expect(harness.component.description).toBe(expected);
        expect(focusSpy).toHaveBeenCalled();
      };

      it.each(cases)(
        'should perform %p on original text %p and return %p when initial selection is %p',
        async (action, original, expected, selection) => {
          await performTextManipulationTest(
            original,
            expected,
            selection,
            () => {
              switch (action) {
                case 'bold':
                  harness.component.insertBold();
                  break;
                case 'italic':
                  harness.component.insertItalic();
                  break;
                case 'heading':
                  harness.component.insertHeading();
                  break;
                case 'quote':
                  harness.component.insertQuote();
                  break;
                case 'bulletlist':
                  harness.component.insertBulletList();
                  break;
                case 'numberlist':
                  harness.component.insertNumberList();
                  break;
              }
            }
          );
        }
      );

      it.each(cases)(
        'should activate keyboard shortcut for %p on original text %p and return %p when initial selection is %p',
        async (action, original, expected, selection) => {
          await performTextManipulationTest(
            original,
            expected,
            selection,
            () => {
              let event: KeyboardEvent;
              switch (action) {
                case 'bold':
                  event = new KeyboardEvent('keydown', {
                    code: 'KeyB',
                    ctrlKey: true
                  });
                  break;
                case 'italic':
                  event = new KeyboardEvent('keydown', {
                    code: 'KeyI',
                    ctrlKey: true
                  });
                  break;
                case 'heading':
                  event = new KeyboardEvent('keydown', {
                    code: 'KeyH',
                    ctrlKey: true
                  });
                  break;
                case 'quote':
                  event = new KeyboardEvent('keydown', {
                    code: 'Quote',
                    ctrlKey: true
                  });
                  break;
                case 'bulletlist':
                  event = new KeyboardEvent('keydown', {
                    code: 'KeyL',
                    ctrlKey: true
                  });
                  break;
                case 'numberlist':
                  event = new KeyboardEvent('keydown', {
                    code: 'KeyL',
                    ctrlKey: true,
                    altKey: true
                  });
                  break;
              }

              harness.component.textArea.nativeElement.dispatchEvent(event);
            }
          );
        }
      );
    });
  });
});
