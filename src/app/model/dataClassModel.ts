export class DataClassResult {
  id: string;
  domainType: string;
  label: string;
  dataModel: string;
  breadcrumbs: Breadcrumb[];
  aliases: any[] = [];
  semanticLinks: SemanticLink[];
  classifiers: Classifiers[];
  editable: boolean;
  lastUpdated: Date;
  maxMultiplicity: number;
  minMultiplicity: number;
  parentDataModel: string;
  parentDataClass: string;
  finalised: boolean;
  dateFinalised: string;
  description: string;
}

export class Breadcrumb {
  id: string;
  label: string;
  domainType: string;
  finalised: boolean;
}

export class SemanticLink {
  id: string;
  linkType: string;
  domainType: string;
  source: Source;
  target: Target;
}

export class Source {
  id: string;
  domainType: string;
  label: string;
  dataModel: boolean;
  breadcrumbs: Breadcrumb[];
}

export class Target {
  id: string;
  domainType: string;
  label: string;
  dataModel: boolean;
  breadcrumbs: Breadcrumb[];
}

export class Classifiers {
  id: string;
  label: string;
  lastUpdated: string;
}

export class EditableDataClass {
  constructor() {}

  deletePending: boolean;
  label: string;
  description: string;
  classifiers: Classifiers[] = [];
  aliases: any[] = [];
  visible: boolean;
  waiting: boolean;
  validationError: boolean;

  show() {}
  cancel() {}
  save(parent: any) {}
}
