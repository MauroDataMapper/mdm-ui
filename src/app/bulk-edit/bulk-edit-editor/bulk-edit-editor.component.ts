import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, MultiFacetAwareDomainType, Profile, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { MessageHandlerService, StateHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BulkEditPayload } from '../model/bulkEditPayload';

@Component({
  selector: 'mdm-bulk-edit-editor',
  templateUrl: './bulk-edit-editor.component.html',
  styleUrls: ['./bulk-edit-editor.component.scss']
})
export class BulkEditEditorComponent implements OnInit {

  @Output() backEvent = new EventEmitter();

  @Input() bulkEditPayload: BulkEditPayload;
  @Output() bulkEditPayloadChanged = new EventEmitter<BulkEditPayload>();

  tabs = new Array<{ tabTitle: string; columnDefs: any; rowData: any }>();

  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;
  editedProfiles: { body: { count: number; profilesProvided: [{ profile: Profile }] } };

  constructor(private stateHandler: StateHandlerService, private resouce: MdmResourcesService, private uiRouterGlobals: UIRouterGlobals, private messageHandler: MessageHandlerService) { }


  ngOnInit(): void {

    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;

    const multiFacetAwareItems = new Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid }>();

    this.bulkEditPayload.selectedElements.forEach(element => {
      multiFacetAwareItems.push({ multiFacetAwareItemId: element.id, multiFacetAwareItemDomainType: element.domainType });
    });

    // build tabs
    this.bulkEditPayload.selectedProfiles.forEach(profile => {

      this.resouce.profile.getMany(this.domainType, this.catalogueItemId, { multiFacetAwareItems, profileProviderServices: [{ name: profile.name, namespace: profile.namespace }] }).pipe(
        catchError(error => {
          this.messageHandler.showError(error);
          return EMPTY;
        })
      ).subscribe((proResult: { body: { count: number; profilesProvided: [{ profile: Profile }] } }) => {

        const columnDefs = new Array<{ headerName: string; field: string; editable?: boolean }>();
        const rowData = new Array<any>();
        this.editedProfiles = proResult;

        columnDefs.push({headerName: 'Element', field: 'Element' });

        proResult.body.profilesProvided[0].profile.sections.forEach(section => {
          section.fields.forEach(field => {
            columnDefs.push({ headerName: field.fieldName, field: field.metadataPropertyName, editable: true});
              });
        });

        proResult.body.profilesProvided.forEach(profilesProvided => {
          const dataRow = {};
          dataRow['Element'] = profilesProvided.profile.label;
            profilesProvided.profile.sections.forEach(section => {
             section.fields.forEach(field =>{
                dataRow[field.metadataPropertyName] = field.currentValue;
             });
          });
          rowData.push(dataRow);
        });

        this.tabs.push({ tabTitle: profile.displayName, columnDefs, rowData });
      }
      );


    });

  }

  onGridReady(params) {
    const gridColumnApi = params.columnApi;
    const allColumnIds = [];
    gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    gridColumnApi.sizeColumnsToFit();
  }

  cancel() {
    this.stateHandler.GoPrevious();
  }

  back() {
    this.backEvent.emit();
  }

  onCellValueChanged(event : any) {
    const element = event.data.Element;
    const item = this.editedProfiles.body.profilesProvided.find(x => x.profile.label === element);

    if(item)
    {
      Object.keys(event.data as {}).forEach(data => {
         item.profile.sections.forEach(sec => {
           sec.fields.forEach(field => {
              if(field.metadataPropertyName === data)
              {
                field.currentValue =  event.data[data];
              }
           });
         });
      });
    }
  }

  save()
  {
    console.log('Data',this.editedProfiles);
  }
}


