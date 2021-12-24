import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { QueryParameters, Uuid } from '@maurodatamapper/mdm-resources';
import { FederatedDataModel } from '@mdm/model/federated-data-model';
import { MdmResourcesService } from '@mdm/modules/resources';
import { GridService, MessageHandlerService, StateHandlerService } from '@mdm/services';
import { MdmPaginatorComponent } from '@mdm/shared/mdm-paginator/mdm-paginator';
import { EMPTY, merge } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

@Component({
  selector: 'mdm-newer-versions',
  templateUrl: './newer-versions.component.html',
  styleUrls: ['./newer-versions.component.scss']
})
export class NewerVersionsComponent implements AfterViewInit {

  @ViewChild(MdmPaginatorComponent, {static:false}) paginator : MdmPaginatorComponent;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  @Input('catalogueItem') catalogueItem: FederatedDataModel;
  @Input() catalogueId: Uuid;

  displayedColumns = ['label','version','navigate'];

  isLoadingResults: boolean;
  totalNewVersionCount: number;
  newVersionsRecords: any;

  constructor(private resouces: MdmResourcesService, private messagingServer: MessageHandlerService, private gridService: GridService, private stateHandler: StateHandlerService) { }

  ngAfterViewInit(): void {
    merge(this.sort.sortChange, this.paginator.page).pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.fetchNewerVersions(this.paginator.pageSize, this.paginator.pageOffset, this.sort.active, this.sort.direction);
    }),
      map((data: any) => {
        this.totalNewVersionCount = data.body.newerPublishedModels.length;
        this.isLoadingResults = false;
        return data.body.newerPublishedModels;

      }),
      catchError(() => {
        this.isLoadingResults = false;
        return [];
      })).subscribe(data => {
        this.newVersionsRecords = data;

      });
  }

  fetchNewerVersions(pageSize? : number, pageIndex? : number, sortBy? : string, sortType? :string) {
    const options : QueryParameters = this.gridService.constructOptions(pageSize, pageIndex, sortBy, sortType);
    return this.resouces.subscribedCatalogues.newerVersions(this.catalogueId, this.catalogueItem.modelId,options).pipe(catchError(error => {
      this.messagingServer.showError(error);
      return EMPTY;
    }));
  }

  navigateToNewerVersion(record: FederatedDataModel)
  {
    this.stateHandler.Go('appContainer.mainApp.twoSidePanel.catalogue.federatedDataModel', {parentId:this.catalogueId, id:record.modelId});
  }

}
