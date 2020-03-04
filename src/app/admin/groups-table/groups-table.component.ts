import { Component, OnInit, ElementRef, ViewChild, ViewChildren, EventEmitter } from '@angular/core';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { ResourcesService } from '../../services/resources.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'app-groups-table',
	templateUrl: './groups-table.component.html',
	styleUrls: ['./groups-table.component.sass']
})
export class GroupsTableComponent implements OnInit {

	@ViewChildren('filters', { read: ElementRef }) filters: ElementRef[];
	@ViewChild(MatSort, { static: true }) sort: MatSort;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

	filterEvent = new EventEmitter<string>();
	isLoadingResults: boolean;
	filter: string;
	totalItemCount: number;
	hideFilters = true;

	dataSource = new MatTableDataSource<any>();

	displayedColumns = ['name', 'description', 'icons'];
	records: any[] = [];

	constructor(
		private messageHandlerService: MessageHandlerService,
		private resourcesService: ResourcesService,
		private stateHandlerService: StateHandlerService) {

		this.dataSource = new MatTableDataSource(this.records);
	}

	ngOnInit() {

		this.groupsFetch();
	}

	ngAfterViewInit() {

		this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
		this.filterEvent.subscribe(() => this.paginator.pageIndex = 0);

		this.dataSource.sort = this.sort;

		merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
			.pipe(
				startWith({}),
				switchMap(() => {

					this.isLoadingResults = true;

					return this.groupsFetch(this.paginator.pageSize,
						this.paginator.pageIndex,
						this.sort.active,
						this.sort.direction,
						this.filter);
				}
				),
				map((data: any) => {

					this.totalItemCount = data.body.count;
					this.isLoadingResults = false;
					return data.body['items'];
				}),
				catchError(() => {

					this.isLoadingResults = false;
					return [];
				})
			).subscribe(data => {

				this.records = data;
				this.dataSource.data = this.records;
			});
	}

	// TODO: sorting, paging and filtering without backend call
	groupsFetch2() {

		this.resourcesService.userGroup.get(null, null, null).subscribe(resp => {

			this.records = resp.body.items;
			this.totalItemCount = this.records.length;
			this.dataSource.data = this.records;
		}),
			(err) => {
				this.messageHandlerService.showError('There was a problem loading groups.', err);
			};
	}

	groupsFetch(pageSize?, pageIndex?, sortBy?, sortType?, filters?): Observable<any> {

		let options = {
			pageSize,
			pageIndex,
			filters,
			sortBy,
			sortType
		};

		return this.resourcesService.userGroup.get(null, null, options);
	}

	applyFilter = () => {
		let filter: any = '';
		this.filters.forEach((x: any) => {
			let name = x.nativeElement.name;
			let value = x.nativeElement.value;

			if (value !== '') {
				filter += name + '=' + value + '&';
			}
		});
		this.filter = filter;
		this.filterEvent.emit(filter);
	}

	filterClick = () => {

		this.hideFilters = !this.hideFilters;
	}

	editUser(row) {

		if (row) {
			this.stateHandlerService.Go('admin.group',
				{
					id: row.id,
				},
				null
			);
		}
	}

	deleteUser(row) {

		this.resourcesService.userGroup.delete(row.id, null).subscribe(resp => {

			this.messageHandlerService.showSuccess('Group deleted successfully.');

			this.groupsFetch(this.paginator.pageSize,
				this.paginator.pageIndex,
				this.sort.active,
				this.sort.direction,
				this.filter).subscribe(data => {

					this.records = data.body.items;
					this.dataSource.data = this.records;
				}),
				(err) => {
					this.messageHandlerService.showError('There was a problem loading the groups.', err);
				};
		}),
			(err) => {
				this.messageHandlerService.showError('There was a problem deleting the group.', err);
			};
	}

	add = () => {

		this.stateHandlerService.Go('admin.group', { id: null }, null);
	}
}
