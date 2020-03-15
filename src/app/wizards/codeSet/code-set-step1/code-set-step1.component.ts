import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'mdm-code-set-step1',
  templateUrl: './code-set-step1.component.html',
  styleUrls: ['./code-set-step1.component.scss']
})
export class CodeSetStep1Component implements OnInit, OnDestroy, AfterViewInit {
  step: any;
  model: any;

  constructor() {}

  formChangesSubscription: Subscription;
  @ViewChild('myForm', { static: false }) myForm: NgForm;

  ngOnInit() {
    this.model = this.step.scope.model;
    this.step.invalid = true;
  }

  ngOnDestroy() {
    this.formChangesSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.formChangesSubscription = this.myForm.form.valueChanges.subscribe(
      x => {
        this.step.invalid = this.myForm.invalid;
      }
    );
  }
}
