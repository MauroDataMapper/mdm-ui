export class FolderResult {
  id: string;
  label: string;
  description: string;
  finalised: boolean;
  deleted: boolean;
  writeableByUsers: any[];
  readableByUsers: any[];
  readableByEveryone: boolean;
  lastUpdated: any;
}

export class SearchResult {
  count: number;
  items: HistoryModel[];
}

export class HistoryModel {
  dateCreated: string;
  createdBy: HistoryPropertiesModel;
  description: string;
}

export class HistoryPropertiesModel {
  id: string;
  emailAddress: string;
  firstName: string;
  lastName: string;
  userRole: string;
  disabled: boolean;
}

export class Editable {
  constructor() {}

  deletePending: boolean;
  label: string;
  description: string;
  visible: boolean;
  waiting: boolean;
  validationError: boolean;

  show() {}
  cancel() {}
  save(parent: any) {}
}
