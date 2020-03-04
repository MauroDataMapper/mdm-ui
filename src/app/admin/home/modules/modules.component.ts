import { Component, OnInit, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { StateService } from '@uirouter/core';
import { MessageHandlerService } from '../../../services/utility/message-handler.service';
import { ResourcesService } from '../../../services/resources.service';
import { StateHandlerService } from '../../../services/handlers/state-handler.service';
import { SharedService } from '../../../services/shared.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'app-modules',
	templateUrl: './modules.component.html',
	styleUrls: ['./modules.component.sass']
})
export class ModulesComponent implements OnInit {


	@ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

	activeTab: any;
	records: any[] = [];
	displayedColumns = ['name', 'version'];

	appVersion: string;

	totalItemCount: number;

	hideFilters = true;

	dataSource = new MatTableDataSource<any>();

	constructor(private messageHandler: MessageHandlerService,
		           private resourcesService: ResourcesService,
		           private stateService: StateService,
		           private stateHandler: StateHandlerService,
		           private shared: SharedService) { }

	ngOnInit() {

		this.appVersion = this.shared.appVersion;

		if (this.sort) {
			this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		}


		this.modulesFetch();
	}

	ngAfterViewInit() {

		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;
	}

	applyFilter = () =>
	{
		
	}

	modulesFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?) {

		let options = {
			pageSize,
			pageIndex,
			filters,
			sortBy: 'name',
			sortType: 'asc'
		};

		this.resourcesService.admin.get('modules', options).subscribe(resp => {

			this.records = resp.body;

			this.records.push({ id: '0', name: 'UI', version: this.appVersion, isUI: true });

			this.totalItemCount = this.records.length;
			this.dataSource.data = this.records;

		}),
			(err) => {

				this.messageHandler.showError('There was a problem loading the modules.', err);
			};
	}
}
