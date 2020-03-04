import { Injectable } from '@angular/core';
import { ToastrService } from "ngx-toastr";


@Injectable({
    providedIn: 'root'
})
export class MessageHandlerService {

    constructor(private ngToast: ToastrService) { }
    showError(defaultMessage, error) {
        var text = defaultMessage;
        if (error && error.status === 422) {
            var result = this.getErrorText(error);
            if (result) {
                text = result;
            }
        }
        this.ngToast.error(text);

    };

    showSuccess(message) {
        this.ngToast.success(message);
    };

    showWarning(message, timeout, className) {
        this.ngToast.warning(message);
    };

    getErrorText(error) {
        var errorText = "";

        if (error.error && error.error.errors) {
            errorText = error.error.errors[0].message;
        }
        if (error.error && error.error.validationErrors && error.error.validationErrors.errors) {
            errorText = error.error.validationErrors.errors[0].message;
        }
        return errorText;

    }


}
