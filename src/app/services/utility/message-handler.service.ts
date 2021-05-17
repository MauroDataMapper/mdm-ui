/*
Copyright 2020-2021 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';


@Injectable({
    providedIn: 'root'
})
export class MessageHandlerService {

    constructor(private ngToast: ToastrService) { }
    showError(defaultMessage, error?) {
        let text = defaultMessage;
        if (error && error.status === 422) {
            const result = this.getErrorText(error);
            if (result) {
                text = result;
            }
        }
        this.ngToast.error(text);

    }

    showSuccess(message) {
        this.ngToast.success(message);
    }

    showWarning(message) {
        this.ngToast.warning(message);
    }

    showInfo(message: string) {
        this.ngToast.info(message);
    }

    getErrorText(error) {
        let errorText = '';

        if (error.error && error.error.errors) {
            errorText = error.error.errors[0].message;
        }
        if (error.error && error.error.validationErrors && error.error.validationErrors.errors) {
            errorText = error.error.validationErrors.errors[0].message;
        }
        return errorText;

    }


}
