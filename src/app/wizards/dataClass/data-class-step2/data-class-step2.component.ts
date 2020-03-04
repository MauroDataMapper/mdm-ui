import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ViewChildren,
  ElementRef,
  EventEmitter,
  Inject
} from "@angular/core";
import { ValidatorService } from "../../../services/validator.service";
import { NgForm } from "@angular/forms";
import { Subscription, Observable, ObservableInput, of } from "rxjs";
import { MessageHandlerService } from "../../../services/utility/message-handler.service";
import { ResourcesService } from "../../../services/resources.service";
import { BroadcastService } from "../../../services/broadcast.service";
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: "app-data-class-step2",
  templateUrl: "./data-class-step2.component.html",
  styleUrls: ["./data-class-step2.component.sass"]
})
export class DataClassStep2Component implements OnInit {
  step: any;
  model: any;
  scope: any;
  multiplicityError: any;
  selectedDataClassesStr = "";
  defaultCheckedMap: any;
  loaded = false;
  totalItemCount = 0;

  processing: any;
  isProcessComplete: any;
  finalResult = {};
  successCount = 0;
  failCount = 0;

  formChangesSubscription: Subscription;

  @ViewChild("myForm", { static: false }) myForm: NgForm;
  @ViewChildren("filters", { read: ElementRef }) filters: ElementRef[];
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  filterEvent = new EventEmitter<string>();
  filter: string;
  hideFilters: boolean = true;
  displayedColumns = ["name", "description", "status"];

  dataSource: any;

  constructor(
    private validator: ValidatorService,
    private resources: ResourcesService,
    private messageHandler: MessageHandlerService,
    private broadcastSvc: BroadcastService
  ) {}

  ngOnInit() {
    this.model = this.step.scope.model;
    this.scope = this.step.scope;

    this.dataSource = new MatTableDataSource<any>(
      this.model.selectedDataClasses
    );
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(
      x => {
        //  this.validate(x);
      }
    );
  }

  onLoad() {
    this.defaultCheckedMap = this.model.selectedDataClassesMap;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.model.selectedDataClassesMap) {
      this.createSelectedArray();
      this.validate();
    }

    this.loaded = true;
  }

  createSelectedArray = () => {
    this.model.selectedDataClasses = [];
    for (var id in this.model.selectedDataClassesMap) {
      if (this.model.selectedDataClassesMap.hasOwnProperty(id)) {
        var element = this.model.selectedDataClassesMap[id];
        this.model.selectedDataClasses.push(element.node);
      }
    }
    this.totalItemCount = this.model.selectedDataClasses.length;
  }

  onCheck = (node, parent, checkedMap) => {
    this.model.selectedDataClassesMap = checkedMap;
    this.createSelectedArray();
    this.dataSource.data = this.model.selectedDataClasses;
    this.dataSource._updateChangeSubscription();
    this.validate();
  };

  validate = (newValue?) => {
    var invalid = false;
    if (this.model.createType === "new") {
      if (newValue) {
        //check Min/Max
        this.multiplicityError = this.validator.validateMultiplicities(
          newValue.minMultiplicity,
          newValue.maxMultiplicity
        );

        //Check Mandatory fields
        if (
          !newValue.label ||
          newValue.label.trim().length === 0 ||
          this.multiplicityError
        ) {
          this.step.invalid = true;
          return;
        }
      }

      invalid = this.myForm.invalid;
    }
    if (this.model.createType === "copy") {
      if (this.model.selectedDataClasses.length === 0) {
        this.step.invalid = true;
        return;
      }
    }

    this.step.invalid = invalid;
  };

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  saveCopiedDataClasses = () => {
    this.processing = true;
    this.isProcessComplete = false;

    let promise = Promise.resolve();

    this.model.selectedDataClasses.forEach((dc: any) => {
      promise = promise
        .then((result: any) => {
          var link = "dataClasses/" + dc.dataModel + "/" + dc.id;
          this.successCount++;
          this.finalResult[dc.id] = { result: result, hasError: false };
          if (this.model.parent.domainType === "DataClass") {
            return this.resources.dataClass
              .post(
                this.model.parent.dataModel,
                this.model.parent.id,
                link,
                null
              )
              .toPromise();
          } else {
            return this.resources.dataModel
              .post(this.model.parent.id, link, null)
              .toPromise();
          }
        })
        .catch(error => {
          this.failCount++;
          var errorText = this.messageHandler.getErrorText(error);
          this.finalResult[dc.id] = { result: errorText, hasError: true };
        });
    });

    promise
      .then(result => {
        this.processing = false;
        this.step.isProcessComplete = true;
        this.broadcastSvc.broadcast("$reloadFoldersTree");
      })
      .catch(error => {
        this.processing = false;
        this.step.isProcessComplete = true;
      });
  };
}
