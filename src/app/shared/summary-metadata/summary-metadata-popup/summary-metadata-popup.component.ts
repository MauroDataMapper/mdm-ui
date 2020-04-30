import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ChartDataSets, ChartOptions, ChartType} from "chart.js";
import {Label} from "ng2-charts";
import {MatTableModule} from "@angular/material/table";
import {SummaryMetadataChartComponent} from "../summary-metadata-chart/summary-metadata-chart.component";

@Component({
  selector: 'mdm-summary-metadata-popup',
  templateUrl: './summary-metadata-popup.component.html',
  styleUrls: ['./summary-metadata-popup.component.scss']
})
export class SummaryMetadataPopupComponent extends SummaryMetadataChartComponent implements OnInit {

  constructor(protected dialogRef: MatDialogRef<SummaryMetadataPopupComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    super()
    this.summary = data
  }

  public tableDataForTable = [];

  public reportIndex: number;



  ngOnInit(): void {
    super.ngOnInit();
    if (this.summary.summaryMetadataType === "number") {
      this.summaryMetadataReports.forEach(report => {
        this.tableDataForTable.push({keyColor: null, category: report.reportDate, value: report.reportValue})
      })
    }
  }

  drawBarChart(): void {
    super.drawBarChart()
    if(this.summary.summaryMetadataType === "map") {
      this.tableDataForTable = [];
      Object.keys(this.selectedReport.reportValue).forEach( (x, idx) => {
        this.tableDataForTable.push({keyColor: this.chartColors[0].backgroundColor[idx], category: x, value: this.selectedReport.reportValue[x]})
      })
    }
  }

  dateFirst() {
    if(this.reportIndex != 0) {
      this.reportIndex = 0
      this.drawBarChart();
    }

  }
  datePrev() {
    if(this.reportIndex > 0) {
      this.reportIndex = this.reportIndex-1
      this.drawBarChart();
    }
  }
  dateNext() {
    if(this.reportIndex < this.data.summaryMetadataReports.length-1) {
      this.reportIndex = this.reportIndex + 1
      this.drawBarChart();
    }
  }
  dateLast() {
    if(this.reportIndex != this.data.summaryMetadataReports.length-1) {
      this.reportIndex = this.data.summaryMetadataReports.length-1
      this.drawBarChart();
    }
  }

  close(): void {
    this.dialogRef.close()
  }
}
