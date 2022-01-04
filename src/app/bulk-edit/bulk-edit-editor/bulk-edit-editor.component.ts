import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CatalogueItemDomainType, MultiFacetAwareDomainType, Profile, ProfileValidationErrorList, Uuid } from '@maurodatamapper/mdm-resources';
import { MdmResourcesService } from '@mdm/modules/resources';
import { BroadcastService, MessageHandlerService } from '@mdm/services';
import { UIRouterGlobals } from '@uirouter/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CheckboxRendererComponent } from '../checkbox-renderer/checkbox-renderer.component';

@Component({
  selector: 'mdm-bulk-edit-editor',
  templateUrl: './bulk-edit-editor.component.html',
  styleUrls: ['./bulk-edit-editor.component.scss']
})
export class BulkEditEditorComponent implements OnInit {

  @Output() backEvent = new EventEmitter();

  @Input('tab') tab: { tabTitle: string; profile:any; multiFacetAwareItems : Array<{ multiFacetAwareItemDomainType: string; multiFacetAwareItemId: Uuid}>; editedProfiles : { body: { count: number; profilesProvided: [{ profile: Profile; profileProviderService: { namespace: string; name: string } }] } }};
  @Output() tabChanged = new EventEmitter();


  frameworkComponents = {
    checkboxRenderer: CheckboxRendererComponent
  };

  validationErrors: any;
  loaded = false;
  totalValidationErrors = 0;
  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;
  columnDefs = new Array<{ headerName: string; field: string; editable?: boolean; cellRenderer?: string }>();
  rowData = new Array<any>();
  cellRules = {
    'rag-red': (params) => {
      return this.showValidationError(params);
    },
  };

  defaultColDef = {
    minWidth: 200
};



  private gridApi;
  private gridColumnApi;

  constructor(private messageHandler: MessageHandlerService, private resouce: MdmResourcesService, private uiRouterGlobals: UIRouterGlobals, private broadcast: BroadcastService) { }


  ngOnInit(): void {

    this.catalogueItemId = this.uiRouterGlobals.params.id;
    this.domainType = this.uiRouterGlobals.params.domainType;
    this.load();

    this.broadcast.on('validateBulkEdit').subscribe(() => {
      this.validate();
    }
    );
  }

  load() {
    this.resouce.profile.getMany(this.domainType, this.catalogueItemId, { multiFacetAwareItems: this.tab.multiFacetAwareItems, profileProviderServices: [{ name: this.tab.profile.name, namespace: this.tab.profile.namespace }] }).pipe(
      catchError(error => {
        this.messageHandler.showError(error);
        return EMPTY;
      })
    ).subscribe((proResult: { body: { count: number; profilesProvided: [{ profile: Profile; profileProviderService: { namespace: string; name: string } }] } }) => {

      const tempColumnDefs = new Array<{ headerName: string; field: string; editable?: boolean; cellRenderer?: string; pinned?: string }>();
      const tempRowData = new Array<any>();

      this.tab.editedProfiles = proResult;

      tempColumnDefs.push({ headerName: 'Element', field: 'Element' , pinned: 'left'});

      proResult.body.profilesProvided[0].profile.sections.forEach(section => {
        section.fields.forEach(field => {
          const col: { headerName: string; field: string; editable?: boolean; cellRenderer?: string; cellStyle?: {}; cellClassRules: any } = { headerName: field.fieldName, field: field.metadataPropertyName, editable: true, cellClassRules: this.cellRules };
          if (field.dataType === 'boolean') {
            col.cellRenderer = 'checkboxRenderer';
            col.editable = false;
            col.cellStyle = { textAlign: 'center' };
          }
          tempColumnDefs.push(col);
        });
      });

      proResult.body.profilesProvided.forEach(profilesProvided => {
        const dataRow = {};
        dataRow['Element'] = profilesProvided.profile.label;
        profilesProvided.profile.sections.forEach(section => {
          section.fields.forEach(field => {
            dataRow[field.metadataPropertyName] = field.currentValue;
          });
        });
        tempRowData.push(dataRow);
      });

      this.columnDefs = tempColumnDefs;
      this.rowData = tempRowData;
      this.validate();
      this.loaded = true;
    }
    );
  }

  onGridReady(params) {

    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.screenResize();
  }

  back() {
    this.backEvent.emit();
  }


  screenResize(){
    const allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.colId);
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds);
  }

  onCellValueChanged(event: any) {
    const element = event.data.Element;
    const item = this.tab.editedProfiles.body.profilesProvided.find(x => x.profile.label === element);

    if (item) {
      Object.keys(event.data as {}).forEach(data => {
        item.profile.sections.forEach(sec => {
          sec.fields.forEach(field => {
            if (field.metadataPropertyName === data) {
              field.currentValue = event.data[data];
            }
          });
        });
      });
    }
  }

  validate() {
    this.totalValidationErrors = 0;

    this.resouce.profile.validateMany(this.domainType, this.catalogueItemId, { profilesProvided: this.tab.editedProfiles.body.profilesProvided }).pipe(
      catchError((error: HttpErrorResponse) => {
        this.validationErrors = error.error as ProfileValidationErrorList;
        this.gridApi.redrawRows();
        return EMPTY;
      })
    )
      .subscribe(() => {
        this.validationErrors = null;
        this.gridApi.redrawRows();
      });
  }

  showValidationError(params): boolean {
    let hasError = false;
    if (this.validationErrors) {
      this.validationErrors.profilesProvided.forEach(profileProvided => {
        if (profileProvided.profile.label === params.data.Element && profileProvided.errors) {
          profileProvided.errors.errors.forEach(error => {
            if (error.metadataPropertyName === params.colDef.field) {
              hasError = true;
              this.totalValidationErrors++;
            }
          });
        }
      });
    }

    return hasError;
  }


}


