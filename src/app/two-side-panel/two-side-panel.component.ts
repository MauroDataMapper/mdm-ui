/*
Copyright 2020-2024 University of Oxford and NHS England

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
import { Component, HostListener, OnInit } from '@angular/core';

const mobileWidth = 768;

@Component({
  selector: 'mdm-two-side-panel',
  templateUrl: './two-side-panel.component.html',
  styleUrls: ['./two-side-panel.component.scss']
})
export class TwoSidePanelComponent implements OnInit {
  isOpen = true;
  splitDirection: 'horizontal' | 'vertical';

  ngOnInit(): void {
    this.checkSidePanelVisibility();
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkSidePanelVisibility();
  }

  private checkSidePanelVisibility() {
    const width = window.innerWidth;
    this.splitDirection = width > mobileWidth ? 'horizontal' : 'vertical';
    if (width > mobileWidth) {
      // Always open the model tree in tablet/desktop width
      this.isOpen = true;
    }
  }
}
