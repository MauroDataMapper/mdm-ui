import { Component, OnInit, Input } from '@angular/core';
import { ElementTypesService } from '../../services/element-types.service';

@Component({
  selector: 'mdm-element-link',
  templateUrl: './element-link.component.html'
})
export class ElementLinkComponent implements OnInit {
  @Input() hideVersionNumber: boolean;
  @Input() justShowCodeForTerm: boolean;
  @Input() showTypeTitle: boolean;
  @Input() element: any;
  @Input() newWindow: boolean;
  @Input() parentDataModel: any;
  @Input() parentDataClass: any;
  @Input() showHref = true;
  @Input() showParentDataModelName: boolean;
  @Input() showLink = true;

  label: string;
  versionNumber: string;
  openLinkLocation: string;
  elementTypeTitle: string;
  types: any[];

  replaceLabelBy: any;
  disableLink: any;

  constructor(private elementTypes: ElementTypesService) {}

  ngOnInit() {
    this.label = '';
    this.versionNumber = '';

    if (!this.hideVersionNumber) {
      this.versionNumber = this.element?.documentationVersion
        ? 'Documentation Version: ' + this.element.documentationVersion
        : '';
    }

    this.label = this.element?.label || this.element?.definition;
    if (this.element?.domainType === 'Term' && !this.justShowCodeForTerm) {
      this.label = this.element.code + ' : ' + this.element.definition;
    }
    if (this.element?.domainType === 'Term' && this.justShowCodeForTerm) {
      this.label = this.element.code;
    }

    if (this.replaceLabelBy) {
      this.label = this.replaceLabelBy;
    }

    if (
      this.showParentDataModelName &&
      this.element?.domainType !== 'DataModel' &&
      this.element?.domainType !== 'Term' &&
      this.element?.domainType !== 'Terminology'
    ) {
      const parentDM =
        this.element?.breadcrumbs && this.element?.breadcrumbs.length > 0
          ? this.element?.breadcrumbs[0]
          : null;
      this.label = parentDM?.label + ' : ' + this.label;
      if (this.label === undefined) {
        this.label = '';
      }
    }

    this.initTypeLabel();
    this.initLink();
  }

  public initTypeLabel(): any {
    this.elementTypeTitle = '';
    this.types = this.elementTypes.getTypes();
    if (
      this.element &&
      this.element.domainType &&
      this.types.filter(x => x.id === this.element.domainType)
    ) {
      this.elementTypeTitle = this.types.filter(
        x => x.id === this.element.domainType
      )[0].title;
    }
  }

  public initLink() {
    this.openLinkLocation = '_self';
    if (this.newWindow) {
      this.openLinkLocation = '_blank';
    }
    // if it's true or it's NOT mentioned then make it true
    if (
      this.showLink === true ||
      this.showLink ||
      this.showLink === undefined
    ) {
      this.showLink = true;
    }
  }

  public getLinkUrl() {
    return this.elementTypes.getLinkUrl(this.element);
  }
}
