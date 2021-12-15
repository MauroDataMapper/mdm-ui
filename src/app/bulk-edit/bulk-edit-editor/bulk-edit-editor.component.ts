import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { StateHandlerService } from '@mdm/services';

@Component({
  selector: 'mdm-bulk-edit-editor',
  templateUrl: './bulk-edit-editor.component.html',
  styleUrls: ['./bulk-edit-editor.component.scss']
})
export class BulkEditEditorComponent implements OnInit {

  @Output() backEvent = new EventEmitter();

  tabs : Array<{tabTile:string}>;

  constructor(private stateHandler: StateHandlerService) { }


  ngOnInit(): void {
  }

  cancel() {
    this.stateHandler.GoPrevious();
  }

  back() {
    this.backEvent.emit();
  }
}


