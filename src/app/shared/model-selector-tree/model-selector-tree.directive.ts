import { Directive, ElementRef, Injector, Input, Output, EventEmitter} from '@angular/core';
import { UpgradeComponent } from '@angular/upgrade/static';

@Directive({
    selector: 'model-selector-tree3'

})
export class ModelSelectorTreeDirective extends UpgradeComponent {

    @Input() root: any;
    @Output() rootChange = new EventEmitter<any>();

    @Input('default-elements') defaultElements: any;

    @Input('default-checked-map') defaultCheckedMap: any;

    @Input('on-select') onSelect: any;
    @Output() onSelectChange = new EventEmitter<any>();

    @Input('on-check') onCheck: any;
    @Output() onCheckChange = new EventEmitter<any>();

    @Input('ng-model') ngModel: any;

    @Output() ngModelChange = new EventEmitter<any>();

    @Input('is-required') isRequired: any;
    @Input('show-validation-error') showValidationError: any;
    @Input('do-not-show-data-classes') doNotShowDataClasses: any;
    @Input('do-not-show-terms') doNotShowTerms: any;
    @Input('just-show-folders') justShowFolders: any;

    @Input() placeholder: any;
    @Output() placeholderChange = new EventEmitter<any>();

    @Input() accepts: any;
    @Input('tree-search-domain-type') treeSearchDomainType: any; // "Folder" or "DataClass" or "DataModel" use as DomainType=xxx when searching in tree/search?domainType=DataModel
    @Input('read-only-search-input') readOnlySearchInput: any;
    @Input() multiple: any;
    @Input() processing: any;
    @Input('hide-selected-elements') hideSelectedElements: any;
    @Input('always-show-tree') alwaysShowTree: any;
    @Input('show-checkbox-for') showCheckboxFor: any; // ['DataClass','DataModel','Folder']"
    @Input('propagate-checkbox') propagateCheckbox: any;
    @Input('used-in-modal-dialogue') usedInModalDialogue: any;
    @Input('do-not-apply-settings-filter') doNotApplySettingsFilter: any;

    constructor(elementRef: ElementRef, injector: Injector) {
        super('modelSelectorTree', elementRef, injector);
    }
}




