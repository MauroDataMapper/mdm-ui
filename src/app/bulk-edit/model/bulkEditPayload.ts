import { DataElementDetail, ProfileSummary } from '@maurodatamapper/mdm-resources';

export class BulkEditPayload {
    selectedElements: Array<DataElementDetail>;
    selectedProfiles: Array<ProfileSummary>;
}