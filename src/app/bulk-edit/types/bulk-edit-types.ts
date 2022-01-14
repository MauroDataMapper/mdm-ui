import { CatalogueItemDomainType, DataElementDetail, MultiFacetAwareDomainType, MultiFacetAwareItem, Profile, ProfileContextCollection, ProfileSummary, Uuid } from "@maurodatamapper/mdm-resources";

export enum BulkEditStep {
  Selection,
  Editor
}

export class BulkEditContext {
  catalogueItemId: Uuid;
  domainType: CatalogueItemDomainType | MultiFacetAwareDomainType;
  elements: DataElementDetail[];
  profiles: ProfileSummary[];
}

export interface BulkEditProfileContext {
  displayName: string;
  profile: any;
  multiFacetAwareItems: MultiFacetAwareItem[];
  editedProfiles: ProfileContextCollection;
}

export interface BulkEditDataRow {
  element: string;
  profile: Profile;
  [key: string]: any;
}