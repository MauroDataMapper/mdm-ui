import {Component, OnInit, ElementRef, ViewChildren, ViewChild, AfterViewInit} from '@angular/core';
import {StateService} from '@uirouter/core';
import {MessageHandlerService} from '../../../services/utility/message-handler.service';
import {ResourcesService} from '../../../services/resources.service';
import {StateHandlerService} from '../../../services/handlers/state-handler.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'mdm-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.sass']
})
export class PluginsComponent implements OnInit, AfterViewInit {

  @ViewChildren('filters', {read: ElementRef}) filters: ElementRef[];
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  displayedColumns = ['displayName', 'version', 'pluginType'];
  totalItemCount: number;
  hideFilters = true;
  dataSource = new MatTableDataSource<any>();

  constructor(private messageHandler: MessageHandlerService,
              private resourcesService: ResourcesService,
              private stateService: StateService,
              private stateHandler: StateHandlerService) {
  }

  ngOnInit() {

    if (this.sort) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    }

    this.requestDataFromMultipleSources();
  }

  ngAfterViewInit() {

    // this.displayedColumns;

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  requestDataFromMultipleSources(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {

    const options = {
      pageSize,
      pageIndex,
      filters,
      sortBy: 'displayName',
      sortType: 'asc'
    };

    this.resourcesService.admin.get('plugins/importers', options).subscribe(resp => {

      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    },
      (err) => {

        this.messageHandler.showError('There was a problem loading the importers.', err);
      });

    this.resourcesService.admin.get('plugins/emailers', options).subscribe(resp => {

      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    },
      (err) => {

        this.messageHandler.showError('There was a problem loading the emailers.', err);
      });

    this.resourcesService.admin.get('plugins/dataLoaders', options).subscribe(resp => {

      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    },
      (err) => {

        this.messageHandler.showError('There was a problem loading the dataLoaders.', err);
      });

    this.resourcesService.admin.get('plugins/exporters', options).subscribe(resp => {

      this.dataSource.data = [...this.dataSource.data, ...resp.body];

      this.totalItemCount = this.dataSource.data.length;
    },
      (err: any) => {

        this.messageHandler.showError('There was a problem loading the exporters.', err);
      });
  }

  // TODO
  applyFilter = () => {

  }
}
