/*
Copyright 2020-2025 University of Oxford and NHS England

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
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SummaryMetadataChartComponent } from '../summary-metadata-chart/summary-metadata-chart.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'mdm-summary-metadata-popup',
    templateUrl: './summary-metadata-popup.component.html',
    styleUrls: ['./summary-metadata-popup.component.scss'],
    standalone: true,
    imports: [
        MatButton,
        NgIf,
        BaseChartDirective,
        MatTable,
        MatColumnDef,
        MatHeaderCellDef,
        MatHeaderCell,
        MatCellDef,
        MatCell,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
    ],
})
export class SummaryMetadataPopupComponent extends SummaryMetadataChartComponent implements OnInit {
  public tableDataForTable = [];

  public reportIndex: number;

  constructor(
    protected dialogRef: MatDialogRef<SummaryMetadataPopupComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    super();
    this.summary = data;
  }

  ngOnInit(): void {
    super.ngOnInit();
    if (this.summary.summaryMetadataType.toLowerCase() === 'number') {
      this.summaryMetadataReports.forEach((report) => {
        this.tableDataForTable.push({
          keyColor: null,
          category: report.reportDate,
          value: report.reportValue,
        });
      });
    }
  }

  drawBarChart(): void {
    super.drawBarChart();
    if (this.summary.summaryMetadataType.toLowerCase() === 'map') {
      this.tableDataForTable = [];
      Object.keys(this.selectedReport.reportValue as { [p: string]: number } | ArrayLike<number>).forEach((x, idx) => {
        this.tableDataForTable.push({
          keyColor: this.chartBackgroundColors[idx],
          keyBorderColor: this.chartBorderColors[idx],
          category: x,
          value: this.selectedReport.reportValue[x] });
      });
    }
  }

  dateFirst() {
    if (this.reportIndex !== 0) {
      this.reportIndex = 0;
      this.drawBarChart();
    }
  }

  datePrev() {
    if (this.reportIndex > 0) {
      this.reportIndex = this.reportIndex - 1;
      this.drawBarChart();
    }
  }

  dateNext() {
    if (this.reportIndex < this.data.summaryMetadataReports.length - 1) {
      this.reportIndex = this.reportIndex + 1;
      this.drawBarChart();
    }
  }

  dateLast() {
    if (this.reportIndex !== this.data.summaryMetadataReports.length - 1) {
      this.reportIndex = this.data.summaryMetadataReports.length - 1;
      this.drawBarChart();
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
