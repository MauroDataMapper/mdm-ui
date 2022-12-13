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
import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
import { UserSettingsHandlerService } from '@mdm/services/utility/user-settings-handler.service';

@Component({
  selector: 'mdm-more-description',
  templateUrl: './more-description.component.html',
  styleUrls: ['./more-description.component.scss']
})
export class MoreDescriptionComponent implements AfterViewChecked {
  @Input() description: string;
  @Input() type: 'editable' | 'preformatted' = 'editable';

  showMore = true;
  isOverflowing = false;
  @ViewChild('descriptionContent', { static: false })
  descriptionContent: ElementRef;

  constructor(
    private userSettingsHandler: UserSettingsHandlerService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.showMore = this.userSettingsHandler.get('expandMoreDescription');
  }

  ngAfterViewChecked(): void {
    this.isOverflowing = this.checkOverflow(
      this.descriptionContent.nativeElement
    );
    // Avoid "ExpressionHasChangedAfterItWasChecked" error because isOverflowing could potentially change
    this.changeDetector.detectChanges();
  }

  toggle() {
    this.showMore = !this.showMore;
  }

  private checkOverflow(element): boolean {
    return element.offsetHeight < element.scrollHeight;
  }
}
