/*
Copyright 2020-2021 University of Oxford
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
import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'mchighlighter'})
export class HighlighterPipe implements PipeTransform {

  transform(value: string, phrase: string, wildcardMatch?: boolean) {
    let text = value;
    if (phrase && value && phrase.trim().length > 0 && value.trim().length > 0) {
      // if wildcardMatch then for "patient demographic" it should match patient and demographic
      if (wildcardMatch) {
        const sections: string[] = phrase.split(' ');
        sections.forEach(section => {
          text = value.replace(new RegExp('(' + escape(section) + ')', 'gi'), '<span class="mchighlighter">$1</span>');
        });
      } else {
        text = value.replace(new RegExp('(' + escape(phrase) + ')', 'gi'), '<span class="mchighlighter">$1</span>');
      }
    }
    return text;
  }

}
