import { DataElementDetail, MultiFacetAwareItem, ProfileContextCollection, ProfileSummary } from "@maurodatamapper/mdm-resources";

export class BulkEditContext {
  elements: DataElementDetail[];
  profiles: ProfileSummary[];
}

export interface BulkEditProfileContext {
  tabTitle: string;
  profile: any;
  multiFacetAwareItems: MultiFacetAwareItem[];
  editedProfiles: ProfileContextCollection;
}