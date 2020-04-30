import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  ViewChild,
  Inject,
  OnDestroy,
  ContentChild,
  ElementRef,
  TemplateRef,
  AfterViewInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import {ValidatorService} from '@mdm/services/validator.service';
import {DOCUMENT} from '@angular/common';
import {ResourcesService} from '@mdm/services/resources.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'mdm-select',
  templateUrl: './mc-select.component.html',
  styleUrls: ['./mc-select.component.sass'],
  host: {'(click)': 'onClick($event)'} // TODO - check if this is needed
})
export class McSelectComponent implements OnInit, AfterViewInit, OnDestroy {


  selectedValue: any[];


  inputText: any;
  defaultVal: any[];
  paginationVal: McSelectPagination;

  @Input() get pagination() {
    return this.paginationVal;
  }

  set pagination(val) {
    this.paginationVal = val;
    this.paginationChanged.emit(val);
  }

  @Input() get defaultValue() {
    return this.defaultVal;
  }

  set defaultValue(val) {
    this.defaultVal = val;
    this.setDefaultValue();
    this.defaultValueChanged.emit(val);
  }

  @Output() paginationChanged = new EventEmitter<any>();
  @Output() defaultValueChanged = new EventEmitter<any>();

  loadingDynamicData: boolean;
  processing: boolean;
  show: boolean;
  showCaret: boolean;
  displayValues: any[];

  inputStyle: any;
  holderStyle: any;

  @Output() selectEvent = new EventEmitter<any>();
  recordVal: any;
  @Output() recordChanged = new EventEmitter<any>();

  @Input()
  get record() {
    return this.recordVal;
  }

  set record(val) {
    this.recordVal = val;
    this.recordChanged.emit(val);
  }

  @Input() loadAllOnClick: boolean;
  @Input() acceptTypedInput: boolean;
  // @Input() defaultValue: any;
  @Input() minInputLength: number;
  @Input() idProperty: any;
  @Input() displayProperty: any;
  @Input() searchProperty: any;
  @Input() valueType: any;
  @Input() width: any;
  @Input() showAllStaticValues: any;
  @Input() onTextUpdated: any;
  @Input() multiSelect: boolean;
  @Input() staticValues: any;
  @Input() loadDynamicValues: any;
  @Input() hasError: any;
  @Input() itemTemplate: any;
  @Input() doNotCloseOnSelect: boolean | false;
  @Input() defaultPlaceholder: any;

  @ViewChildren('mcSelectItem') elements;
  @ViewChild('input', {static: false}) input;
  @ViewChild('mcSelect2', {static: false}) mcSelect2;
  @ViewChild('mcSelectHolder', {static: false}) mcSelectHolder;

  @ContentChild('lineContent', {static: true}) lineContentTmpl: TemplateRef<any>;

  constructor(private changeRef: ChangeDetectorRef, private validator: ValidatorService, @Inject(DOCUMENT) private document: Document, private resourceService: ResourcesService, private elementRef: ElementRef) {
  //  this.setDefaultValue(); ToDo check if it needs here , moved to on Init
 }

  ngOnInit() {
    this.setDefaultValue();
    this.pagination = {offset: undefined, count: undefined};
    this.showCaret = true;

    this.inputStyle = {width: this.width, padding: '6px 40px 6px 12px'};
    this.holderStyle = {width: this.width, 'background-color': '#FFF'};
  }

  ngAfterViewInit() {

  }

  ngOnDestroy(): void {

  }

  onScroll(event) {
    if (event.target.scrollTop + event.target.clientHeight + 300 >= event.target.scrollHeight) {
      this.loadMore();
    }
  }


  setDefaultValue() {

    if (this.defaultValue) {

      if (this.multiSelect === true) {
        this.selectedValue = this.defaultValue;
      } else {
        // if it is an object
        if (typeof this.defaultValue === 'object') {
          this.selectedValue = this.defaultValue;
          const value = this.validator.getProperty(this.selectedValue, this.displayProperty);
          this.inputText = value; // scope.selectedValue[scope.displayProperty];
        } else {
          // if it is not an object, create a default object for it
          this.inputText = this.defaultValue;
          this.selectedValue = [];
          this.selectedValue[this.idProperty] = -1;
          this.selectedValue[this.searchProperty] = this.inputText;
        }
      }
    }
  }

  onClick(event) {

    if (this.processing) {
      return;
    }

    // if clicking on input
    if (event.target === this.input.nativeElement || event.target === this.mcSelect2.nativeElement) {

      if (this.valueType === 'static') {
        // load all values
        this.displayValues = this.staticValues;
        this.input.nativeElement.focus();

        this.show = true;
        event.stopPropagation();
      } else {
        this.input.nativeElement.focus();
        this.showCaret = false;
        this.input.nativeElement.setAttribute('placeholder', (this.defaultPlaceholder ? this.defaultPlaceholder : 'Search...'));

        if (this.loadAllOnClick) {
          this.inputText = '';
          this.textUpdated();
        }
      }

    } else {

      this.showCaret = true;
      this.input.nativeElement.setAttribute('placeholder', (this.defaultPlaceholder ? this.defaultPlaceholder : ''));

      if (this.multiSelect === true) {
        // clear the input
        this.inputText = '';
        if (this.input.val !== undefined) {
        this.input.val('');
        }
        this.show = false;
      } else {
        // if we have selected element, show it
        if (this.selectedValue && this.selectedValue[this.idProperty] !== -1) {
          const value = this.validator.getProperty(this.selectedValue, this.displayProperty);
          this.input.nativeElement.value = value;
        } else if (this.inputText) {
          if (this.acceptTypedInput && this.inputText.trim().length !== 0) {
            this.input.nativeElement.value = this.inputText;
            this.recordChanged.emit(this.inputText);

          } else {
            // clear the input
            this.inputText = '';
            this.input.nativeElement.value = '';
          }
        } else {
          // clear the input
          this.inputText = '';
          this.input.nativeElement.value = '';
        }
        this.show = false;
      }
    }
  }

  onInputKeyDown(event) {
    // if Escape is pressed, then close the div
    if (event.keyCode === 27) {
      this.show = false;
    } else if (event.keyCode === 40) { // down arrow key
      if (this.displayValues && this.displayValues.length === 0) {
        return false;
      }

      const currentElements = this.mcSelectHolder.nativeElement.querySelectorAll('#current');


      if (currentElements.length > 0) {
        const nextElement = this.elements._results[this.elements._results.findIndex(x => x.nativeElement === currentElements[0]) + 1];
        if (nextElement.length === 0) {
          return;
        }
        currentElements.forEach(x => {
          x.id = '';
          x.className = 'mcSelectItem';
        });
        nextElement.nativeElement.id = 'current';
        nextElement.nativeElement.className = 'mcSelectItem current';

        const elPosition = this.elementPositionInHolder(nextElement);
        const elHeight = nextElement.nativeElement.offsetHeight;
        const holderHeight = this.mcSelectHolder.nativeElement.offsetHeight;

        if (elPosition + elHeight > holderHeight) {
          this.mcSelectHolder.nativeElement.scrollTop = elPosition;
        }

      } else {
        this.elements._results[0].nativeElement.id = 'current';
        this.elements._results[0].nativeElement.className = 'mcSelectItem current';

      }
    } else if (event.keyCode === 38) { // UP arrow key
      if (this.displayValues && this.displayValues.length === 0) {
        return false;
      }

      const currentElements = this.mcSelectHolder.nativeElement.querySelectorAll('.current');

      if (currentElements.length > 0) {
        const prevElement = this.elements._results[this.elements._results.findIndex(x => x.nativeElement === currentElements[0]) - 1];
        if (prevElement.length === 0) {
          return;
        }
        currentElements.forEach(x => {
          x.id = '';
          x.className = 'mcSelectItem';
        });
        prevElement.nativeElement.id = 'current';
        prevElement.nativeElement.className = 'mcSelectItem current';

        const elPosition = this.elementPositionInHolder(prevElement);
        const holderScrollTop = this.mcSelectHolder.nativeElement.scrollTop;

        if (elPosition < holderScrollTop) {
          this.mcSelectHolder.nativeElement.scrollTop = elPosition;
        }

      } else {
        this.elements._result[0].nativeElement.className = 'mcSelectItem current';
      }
    } else if (event.keyCode === 13) {
      const currentElement = this.mcSelectHolder.nativeElement.querySelectorAll('.current');
      currentElement[0].click();
      this.show = false;
    }
  }

  elementPositionInHolder(el) {
    let fromTop = 0;
    const indexOfElement = this.elements._results.findIndex(x => x === el);

    this.elements._results.slice(0, indexOfElement).forEach((prev) => {
      fromTop += prev.nativeElement.clientHeight + 10; // 10: [3(padding) + 2(margin)]*2(up and bottom)
    });
    return fromTop;
  }

  onElementSelect(selectedElement) {
    if (this.multiSelect === true) {
      this.selectedValue = this.selectedValue || [];
      // if it doesn't exist, then add it
      let found = false;
      for (let i = 0; i < this.selectedValue.length && !found; i++) {
        if (selectedElement[this.idProperty] === this.selectedValue[i][this.idProperty]) {
          found = true;
        }
      }
      if (!found) {
        this.selectedValue.push(selectedElement);
      }
    } else {
      this.selectedValue = selectedElement;
    }

    if (this.selectEvent) {
      this.selectEvent.emit([this.selectedValue, this.record]);
    }
  }

  textUpdated() {

    if (this.onTextUpdated) {
      this.onTextUpdated(this.inputText, this.record);
    }

    this.pagination = {
      offset: undefined,
      count: undefined
    };

    let searchText = this.inputText;

    if (this.minInputLength && this.inputText.trim().length < this.minInputLength) {
      searchText = '';
    }

    this.filterValues(searchText).then((result) => {
      this.show = true;
      this.displayValues = Object.assign([], result);

      if (this.acceptTypedInput) {
        const selected = {};
        selected[this.searchProperty] = this.inputText;
        this.recordChanged.emit(this.inputText);
        if (this.idProperty) {
          selected[this.idProperty] = -1;
        }
        this.onElementSelect(selected);
      }
    });
    }

  filterValues(inputValue) {


    const found = [];

    const p = new Promise((resolve, error) => {

      if (this.valueType === 'static') {
        if (inputValue.trim().length === 0) {
          resolve(this.staticValues);
        }

        if (this.staticValues !== undefined) {
          this.staticValues.forEach((staticValue) => {
            if (staticValue[this.searchProperty].toLowerCase().indexOf(inputValue.toLowerCase()) > -1) {
              found.push(staticValue);
            }
          });

          resolve(found);
        } else {
          resolve([]);
        }
      } else if (this.valueType === 'dynamic') {

        if ((inputValue && inputValue.trim().length === 0) || !this.loadDynamicValues) {

          resolve([]);
        }
        let loadAll = false;
        if (!inputValue && this.loadAllOnClick) {
          loadAll = true;
        }

        const query = this.loadDynamicValues(inputValue, loadAll, this.pagination.offset, this.pagination.limit);


        this.loadingDynamicData = true;
        query.subscribe((result) => {

            if (result.body.count != null && result.body.count !== undefined) {
              this.pagination.count = result.body.count;
            }

            resolve(result.body.items);
            this.loadingDynamicData = false;
          },
          (error2) => {
            this.loadingDynamicData = false;
          });

      }
    });

    return p;
  }

  loadMore() {
    // if dynamic and is not loading
    // if it's loading, so do not load it again
    if (this.valueType === 'dynamic' && this.loadingDynamicData === false) {

      // console.log("In loadMore");

      const loadedSoFar = this.pagination.offset + this.pagination.limit;
      if (loadedSoFar > 0 && this.pagination.count <= loadedSoFar) {
        return;
      }

      const inputValue = this.inputText;
      this.loadingDynamicData = true;

      this.pagination.offset += this.pagination.limit;
      this.changeRef.detectChanges();

      // console.log("loadMore......");
      this.loadDynamicValues(inputValue, false, this.pagination.offset, this.pagination.limit).subscribe((result) => {
        // console.log("done");

        // append to this.displayValues
        this.displayValues = this.displayValues.concat(result.body.items);
        this.loadingDynamicData = false;
      }, (error) => {
        this.loadingDynamicData = false;
      });
    }
  }

  remove(event, element?) {
    if (this.processing) {
      return;
    }

    if (this.multiSelect) {
      const found = false;
      for (let i = 0; i < this.selectedValue.length && !found; i++) {
        if (element[this.idProperty] === this.selectedValue[i][this.idProperty]) {
          this.selectedValue.splice(i, 1);
          break;
        }
      }
      if (this.selectEvent) {
        this.selectEvent.emit([this.selectedValue, this.record]);
      }
    } else {
      this.selectedValue = null;
      this.inputText = '';
      this.input.nativeElement.value = '';

      if (this.selectEvent) {
        this.selectEvent.emit([null, this.record]);
      }
    }

    event.stopPropagation();
    return false;
  }

  getDisplayValue = function(element, displayProperty) {
    if (element) {
      return this.validator.getProperty(element, displayProperty);
    }
  };

  itemClicked(event, item) {

    if (this.doNotCloseOnSelect) {
      event.preventDefault();
      event.stopPropagation();
      this.show = true;
    } else {
      this.show = false;
    }

    this.onElementSelect(item);
    this.loadingDynamicData = false;
  }


}

export interface McSelectPagination {
  offset?: number;
  limit?: number;
  count?: number;
}
