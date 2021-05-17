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
import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';

@Component({
  selector: 'mdm-summary-metadata-chart',
  templateUrl: './summary-metadata-chart.component.html',
  styleUrls: ['./summary-metadata-chart.component.scss']
})
export class SummaryMetadataChartComponent implements OnInit {
  @Input() summary: any;

  public displayChart: boolean;

  public chartColors: any[] = [
    {
      backgroundColor: [
        'rgba(30,84,37,0.5)',
        'rgba(45,81,113,0.5)',
        'rgba(242,148,65,0.5)',
        'rgba(170,64,122,0.5)',
        'rgba(68,166,156,0.5)',
        'rgba(218,0,51,0.5)',
        'rgba(51,123,187,0.5)',
        'rgba(99,199,77,0.5)',
        'rgba(106,52,83,0.5)',
        'rgba(44,232,245,0.5)',
        'rgba(178,77,42,0.5)',
        'rgba(255,245,64,0.5)',
        'rgba(244,161,176,0.5)',
        'rgba(115,47,32,0.5)',
        'rgba(112,112,112,0.5)',
        'rgba(191,191,191,0.5)',
      ],
    },
  ];

  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{ ticks: {
          beginAtZero: true
        }}] },

    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    },
    maintainAspectRatio: false
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType;
  public barChartLegend = false;
  //  public barChartPlugins = [pluginDataLabels];

  public summaryMetadataReports: any[];

  public barChartData: ChartDataSets[] = [];

  public reportIndex: number;
  public reportDate: string;
  protected selectedReport: any;

  ngOnInit() {
    if (this.summary.summaryMetadataReports && this.summary.summaryMetadataReports.length > 0) {
      this.displayChart = true;

      this.summaryMetadataReports = this.summary.summaryMetadataReports.sort((a, b) => this.sortReportsByDate(a, b));

      if (this.summary.summaryMetadataType === 'map') {
        this.barChartType = 'bar';
        this.reportIndex = this.summary.summaryMetadataReports.length - 1;
        this.drawBarChart();
      } else if (this.summary.summaryMetadataType === 'number') {
        this.barChartType = 'line';
        this.barChartOptions.scales.xAxes[0].type = 'time';
        this.barChartData = [{ data: [] }];
        this.summaryMetadataReports.forEach((report) => {
          this.barChartData[0].data.push(report.reportValue);
          this.barChartLabels.push(report.reportDate);
        });
      } else {
        this.displayChart = false;
      }
    } else {
      this.displayChart = false;
    }
  }

  drawBarChart(): void {
    this.selectedReport = this.summary.summaryMetadataReports[this.reportIndex];
    this.barChartData = [];
    this.barChartData.push({data: Object.values(this.selectedReport.reportValue) as number[]});
    this.barChartLabels = Object.keys(this.selectedReport.reportValue);
    this.reportDate = this.selectedReport.reportDate;
  }

  sortReportsByDate(a: any, b: any): number {
    if (Date.parse(a.reportDate as string) > Date.parse(b.reportDate as string)) {
      return 1;
    }
    if (Date.parse(a.reportDate as string) < Date.parse(b.reportDate as string)) {
      return -1;
    }
    return 0;
  }
}
