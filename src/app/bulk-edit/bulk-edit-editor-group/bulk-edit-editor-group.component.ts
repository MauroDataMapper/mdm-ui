import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MultiFacetAwareItem } from '@maurodatamapper/mdm-resources';
import { BroadcastService } from '@mdm/services';
import { BulkEditContext, BulkEditProfileContext } from '../types/bulk-edit-types';

@Component({
  selector: 'mdm-bulk-edit-editor-group',
  templateUrl: './bulk-edit-editor-group.component.html',
  styleUrls: ['./bulk-edit-editor-group.component.scss']
})
export class BulkEditEditorGroupComponent implements OnInit {
  @Output() onCancel = new EventEmitter<void>();
  @Output() onPrevious = new EventEmitter<void>();
  @Output() onValidate = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any[]>();

  /** Two way binding */
  @Input() context: BulkEditContext;
  @Output() contextChanged = new EventEmitter<BulkEditContext>();

  tabs: BulkEditProfileContext[];

  ngOnInit(): void {
    this.tabs = this.context.profiles.map<BulkEditProfileContext>(profile => {
      const multiFacetAwareItems = this.context.elements.map<MultiFacetAwareItem>(element => {
        return {
          multiFacetAwareItemDomainType: element.domainType,
          multiFacetAwareItemId: element.id
        }
      });

      return {
        displayName: profile.displayName,
        profile,
        multiFacetAwareItems,
        editedProfiles: null
      };
    });
  }

  cancel() {
    this.onCancel.emit();
  }

  previous() {
    this.onPrevious.emit();
  }

  validate() {
    this.onValidate.emit();
  }

  save() {
    const profiles: Array<any> = [];

    this.tabs.forEach((tab) => {
      profiles.push(...tab.editedProfiles.profilesProvided);
    });

    this.onSave.emit(profiles);
  }
}
