import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AgEditorComponent } from 'ag-grid-angular';

@Component({
  selector: 'mdm-date-cell-editor',
  templateUrl: './date-cell-editor.component.html',
  styleUrls: ['./date-cell-editor.component.scss']
})
export class DateCellEditorComponent  implements AgEditorComponent, AfterViewInit {

  @ViewChild('container', { static: true }) public container;

  params: any;
  value: Date;


  agInit(params: any): void {
    this.params = params;

    if (this.params.value) {
      const dateArray = this.params.value.split('/');

      const day = parseInt(dateArray[0], 10);
      const month = parseInt(dateArray[1], 10);
      const year = parseInt(dateArray[2], 10);

      this.value = new Date(year, month - 1, day);
    }
  }

  // open the calendar when grid enters edit mode, i.e. the datepicker is rendered
  ngAfterViewInit() {
    this.container.toggle();
  }

  // ensures that once a date is selected, the grid will exit edit mode and take the new date
  // otherwise, to exit edit mode after a selecting a date, click on another cell or press enter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelect(event) {
    this.params.api.stopEditing(false);
  }

  getValue() {
    const d = this.value;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }



}
