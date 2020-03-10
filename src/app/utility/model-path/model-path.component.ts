import { Component, OnInit, Input } from '@angular/core';
import { ElementTypesService } from "../../services/element-types.service";

@
Component({
    selector: 'model-path',
    templateUrl: './model-path.component.html',
})

export class ModelPathComponent implements OnInit {

    @Input() path: any[];
    @Input("new-window") newWindow: boolean;
    @Input("do-not-display-status") doNotDisplayStatus: boolean;
    @Input("show-href") showHref = true;
    @Input() doNotShowParentDataModel: boolean;

    updatedPath: any[];
    targetWindow;
   
    showAsSimpleText;

    constructor(private elementTypes: ElementTypesService) { }

    ngOnInit() {
        this.updatedPath = [];
        if(this.path)
        this.path.forEach((p,index) => {
            if (index === 0) {
                p.link = this.elementTypes.getLinkUrl({ id: p.id, domainType: "DataModel" });
            } else if (index === 1) {
                p.link = this.elementTypes.getLinkUrl({ id: p.id, dataModel: this.path[0].id, domainType: "DataClass" });
            } else {
                p.link = this.elementTypes.getLinkUrl({ id: p.id, dataModel: this.path[0].id, parentDataClass: this.path[index - 1].id, domainType: "DataClass" });
            }
            this.updatedPath.push(p);
        });

        this.targetWindow = "";
        if(this.newWindow){
            this.targetWindow = "_blank";
        }
    }
}
