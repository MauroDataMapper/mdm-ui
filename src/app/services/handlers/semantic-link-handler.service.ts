import { Injectable } from '@angular/core';
import { ResourcesService } from '../resources.service';

@Injectable({
    providedIn: 'root'
})
export class SemanticLinkHandlerService {

    constructor(private resources: ResourcesService) { }

    private findSemanticLinkType(source, target) {
        if (source.domainType === 'Term') {
            if (target.domainType === 'Term') {
                // Term->Term
                return 'TermSemanticLink';
            } else {
                // Term->CI
                return 'TermCatalogueSemanticLink';
            }
        } else {
            if (source.domainType !== 'Term' && target.domainType === 'Term') {
                // CI->Term
                return 'CatalogueTermSemanticLink';
            } else {
                // CI->CI
                return 'CatalogueSemanticLink';
            }
        }
    }

    private action(source, target, linkId, linkType, operation) {

        const resource = {
            target: { id: target.id },
            linkType,
            domainType: this.findSemanticLinkType(source, target)
        };

        if (source.domainType === 'Term') {

            if (operation === 'POST') {
                return this.resources.term.post(source.terminology, source.id, 'semanticLinks', { resource });
            } else {
                return this.resources.term.put(source.terminology, source.id, 'semanticLinks/' + linkId, { resource });
            }
        } else {
            if (operation === 'POST') {
               return this.resources.catalogueItem.post(source.id, 'semanticLinks', { resource });

            } else {
               return this.resources.catalogueItem.put(source.id, 'semanticLinks', linkId, { resource });
            }
        }
    }

    post = (source, target, linkType) => {
        return this.action(source, target, null, linkType, 'POST');
    };

    put = (source, target, linkId, linkType) => {
        return this.action(source, target, linkId, linkType, 'PUT');
    }
}
