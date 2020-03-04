import { Injectable } from '@angular/core';
import { ResourcesService } from '../services/resources.service';

@Injectable()
export class FolderService {

    constructor(private resources: ResourcesService) {
    }

    async loadModelsToCompare(dataModel) {
        let semanticLinks : any = await this.resources.dataModel.get(dataModel.id, "semanticLinks", {filters: "all=true"}).toPromise();
        let compareToList = [];
        if (semanticLinks && semanticLinks.body.items) {
            semanticLinks.body.items.map(link => {
                if (["Superseded By", "New Version Of"].includes(link.linkType) && link.source.id === dataModel.id) {
                    compareToList.push(link.target);
                }
            });
        }
        return compareToList;
    };

    async loadVersions(dataModel) {
        let targetModels = await this.loadModelsToCompare(dataModel);
        return targetModels;
    }

} 