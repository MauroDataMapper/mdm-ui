import {Inject, Injectable} from '@angular/core';
import {ValidatorService} from '@mdm/services/validator.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private validatorService: ValidatorService) { }
}
