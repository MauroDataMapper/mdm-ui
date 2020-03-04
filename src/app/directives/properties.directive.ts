import {Directive, Input} from '@angular/core';

@Directive({
  selector: '[appProperties]'
})
export class PropertiesDirective {
  private aliases_: any;
  private classifiers_: any;
  private multiplicity_ : any;
  constructor() { }

  get aliases(): any
  {
    return this.aliases_;
  }

  @Input("aliases")
  set aliases(aliases: any)
  {
    if(this.aliases_ === aliases)
      return;

    this.aliases_ = aliases;

  }

  get classifiers(): any
  {
    return this.classifiers_;
  }

  @Input("classifiers")
  set classifiers(classifiers: any)
  {
    if(this.classifiers_ === classifiers)
      return;

    this.classifiers_ = classifiers;

  }

  get multiplicity(): any
  {
    return this.multiplicity_;
  }

  @Input("multiplicity")
  set multiplicity(multiplicity: any)
  {
    if(this.multiplicity_ === multiplicity)
      return;

    this.multiplicity_ = multiplicity;

  }

}
