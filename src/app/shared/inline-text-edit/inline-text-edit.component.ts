import { Component, OnInit, Input, Output,  EventEmitter, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-inline-text-edit',
  templateUrl: './inline-text-edit.component.html',
  styleUrls: ['./inline-text-edit.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InlineTextEditComponent),
      multi: true
    }
  ]
})
export class InlineTextEditComponent implements ControlValueAccessor, OnInit {
  @Output() editableFormChanged = new EventEmitter<any>();

  @Input() inEditMode: boolean;
  @Input() isRequired: boolean;
  @Input() styleCss: any;
  @Input() name: any;

  constructor() {}

  val: any;

  writeValue(obj: any): void {
    this.ngValue = obj;
  }

  registerOnChange(fn: any): void {
    this.propChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  ngOnInit() {
    if (!this.inEditMode) {
      this.inEditMode = false;
    }
  }

  set ngValue(val) {
    // this value is updated by programmatic changes if( val !== undefined && this.val !== val){
    this.val = val;
    this.propChange(val);
  }

  get ngValue() {
    return this.val;
  }

  propChange: any = () => {};
}
