import { Component, OnInit, Input, ViewChildren, ViewChild, QueryList, OnChanges, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ElementTypesService } from '../../services/element-types.service';
import { ResourcesService } from '../../services/resources.service';
import { StateHandlerService } from '../../services/handlers/state-handler.service';
import { merge, Observable } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { MessageHandlerService } from '../../services/utility/message-handler.service';
import { MatInput } from '@angular/material/input';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'element-owned-data-type-list',
    templateUrl: './element-owned-data-type-list.component.html',
    styleUrls: ['./element-owned-data-type-list.component.sass']
})
export class ElementOwnedDataTypeListComponent implements AfterViewInit {

    @Input() parent: any;
    @Input() type: any;

    @Input('child-owned-data-types') childOwnedDataTypes: any;

    @Input('loading-data') loadingData: boolean;

    @Input('client-side') clientSide: boolean;
    @ViewChildren('filters') filters: QueryList<MatInput>;
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    allDataTypes: any;
    allDataTypesMap: any;
    showStaticRecords: Function;
    loading = false;
    records: any[] = [];
    total: number;
    processing = false;
    failCount: number;
    hideFilters = true;
    displayedColumns: string[];
    totalItemCount: number;
    isLoadingResults: boolean;
    filterEvent = new EventEmitter<string>();
    filter: string;
    deleteInProgress: boolean;
    parentDataModel: any; //TODO find use for this

    checkAllCheckbox = false;


    constructor(private changeRef: ChangeDetectorRef, private messageHandler: MessageHandlerService, private elementTypes: ElementTypesService, private resources: ResourcesService, private stateHandler: StateHandlerService) { }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        // Add 'implements OnInit' to the class.

        if (this.parent.editable && !this.parent.finalised) {
            this.displayedColumns = ['checkbox', 'name', 'description', 'type', 'buttons'];
        } else {
            this.displayedColumns = ['name', 'description', 'type', 'buttons'];
        }

    }

    ngAfterViewInit() {

        this.allDataTypes = this.elementTypes.getAllDataTypesArray();
        this.allDataTypesMap = this.elementTypes.getAllDataTypesMap();



        if (this.type == 'dynamic') {

            this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            this.filterEvent.subscribe(() => this.paginator.pageIndex = 0);


            merge(this.sort.sortChange, this.paginator.page, this.filterEvent)
                .pipe(
                    startWith({}),
                    switchMap(() => {
                        this.isLoadingResults = true;
                        this.changeRef.detectChanges();

                        return this.dataTypesFetch(this.paginator.pageSize,
                            this.paginator.pageIndex,
                            this.sort.active,
                            this.sort.direction,
                            this.filter);
                    }
                    ),
                    map((data: any) => {
                        this.totalItemCount = data.body.count;

                        return data.body['items'];
                    }),
                    catchError(() => {
                        this.isLoadingResults = false;
                        this.changeRef.detectChanges();
                        return [];
                    })
                ).subscribe(data => {
                    debugger;
                    this.records = data;
                    this.isLoadingResults = false;
                    this.changeRef.detectChanges();
                });
        }

        if (this.type == 'static') {
            this.isLoadingResults = true;
            this.records = [];
            this.records = [].concat(this.childOwnedDataTypes.items);
            this.isLoadingResults = false;
            this.changeRef.detectChanges();
        }

    }

    applyFilter = () => {
        let filter: any = '';
        this.filters.forEach((x: any) => {
            let name = x.nativeElement.name;
            let value = x.nativeElement.value;

            if (value !== '') {
                filter += name + '=' + value;
            }
        });
        this.filter = filter;
        this.filterEvent.emit(filter);
    }

    openEdit = (dataType) => {
        if (!dataType || (dataType && !dataType.id)) {
            return ''
        }
        this.stateHandler.NewWindow('dataType', {
            id: dataType.id,
            dataModelId: this.parent.id
        }, null);
    }

    add = () => {
        this.stateHandler.Go('newDataType', {
            parentDataModelId: this.parent.id
        }, null);
    }

    deleteRows = () => {

        this.processing = true;
        this.failCount = 0;
        this.total = 0;



        let chain: any[] = [];
        this.records.forEach((record) => {

            if (record.checked !== true) {
                return;
            }
            this.total++;
            chain.push(
                this.resources.dataType.delete(record.dataModel, record.id).catch((error) => {
                    this.failCount++;
                })
            );
        });


        Observable.forkJoin(chain).subscribe((all) => {


            this.processing = false;
            if (this.failCount === 0) {
                this.messageHandler.showSuccess(this.total + ' Elements deleted successfully');
            } else {
                let successCount = this.total - this.failCount;
                let message = '';
                if (successCount !== 0) {
                    message += successCount + ' Elements deleted successfully.<br>';
                }
                if (this.failCount > 0) {
                    message += 'There was a problem deleting ' + this.failCount + ' elements.';
                }

                if (this.failCount > 0) {
                    this.messageHandler.showError(message, null);
                } else {
                    this.messageHandler.showSuccess(message);
                }
            }

            this.filterEvent.emit();
            this.deleteInProgress = false;

        },
            (error) => {

                this.processing = false;
                this.messageHandler.showError('There was a problem deleting the elements.', error);
            });

    }


    filterClick = () => {
        this.hideFilters = !this.hideFilters;
    }

    dataTypesFetch = (pageSize?, pageIndex?, sortBy?, sortType?, filters?) => {
        let options = {
            pageSize,
            pageIndex,
            sortBy,
            sortType,
            filters
        };

        return this.resources.dataModel.get(this.parent.id, 'dataTypes', options);
    }

    onChecked = () => {

        this.records.forEach(x => x.checked = this.checkAllCheckbox);
    }

}
