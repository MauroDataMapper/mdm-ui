import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ResourcesService } from '../services/resources.service';
import { SearchResult } from '../model/folderModel';
import { ElementTypesService } from '../services/element-types.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';


@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    // styleUrls: ['./history.component.sass']
})

export class HistoryComponent implements OnInit {

    public result: SearchResult;
    public dataSetResult: any[];
    displayedColumns: string[] = ['createdBy', 'dateCreated', 'description'];
    public totalItemCount: number;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    options;
    elementMap: any[];
    @Input() parent: any;
    @Input() parentType: string;
    @Input() parentId: string;
    parentVal;
    parentTypeVal;
    parentIdVal;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    dataSource = new MatTableDataSource();
    isLoading = false;
    constructor(public resourcesService: ResourcesService, private elementTypeService: ElementTypesService) {

    }

    public getServerData($event) {
        // var offset = $event.pageIndex * $event.pageSize;
        this.fetch($event.pageSize, $event.pageIndex, $event.pageIndex, this.sort.active, this.sort.direction, null);
    }

    public getSortedData($event) {
        this.fetch(this.paginator.pageSize, this.paginator.pageIndex, this.paginator.pageIndex, $event.active, $event.direction, null);
    }

    ngOnInit() {
        this.parentTypeVal = this.parentType;
        this.parentIdVal = this.parentId ? this.parentId : this.parent.id;
        this.parentVal = this.parent;
        this.fetch(10, 0, 0, null, '', '');

    }
    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }


    public fetch(pageSize: number, offset: number, pageIndex, sortBy, sortType, filters): any {
        this.isLoading = true;

        this.options = {
            pageSize,
            pageIndex: offset,
            sortBy,
            sortType,
            filters
        };


        this.elementMap = this.elementTypeService.getBaseWithUserTypes();
        let resource = this.elementMap.find(x => x.id === this.parentType);

        for (let type in this.elementMap) {
            if (this.elementMap[type].id == this.parentTypeVal) {
                resource = this.elementMap[type];
                break;
            }
        }
        if (resource) {
            this.resourcesService[resource.resourceName].get(this.parentIdVal, 'edits', this.options
            ).subscribe(result => {
                this.result = result.body;
                this.dataSource = new MatTableDataSource<unknown>(this.result.items);
                // this.dataSetResult = this.result.items;
                this.totalItemCount = this.result.count;

            });
        } else {
            this.resourcesService.dataModel.get(this.parent, 'edits', this.options).subscribe(result => {
                this.result = result.body;
            });

        }
        this.isLoading = false;

    }

}



