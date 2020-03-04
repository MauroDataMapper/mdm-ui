import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

    constructor() { }
    index(obj,i) {return obj[i];}
    getProperty (obj, str) {
        return str.split('.').reduce(this.index, obj);
    };



    capitalize (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    validateEmail (email){
        var pattern = /^[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+(\.[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+)*@[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-\+]+)*(\.[A-Za-z]{2,})$/;
        return pattern.test(email);
    };

    isDate(date: any): Boolean {
        if (!isNaN(date)) {
            return date instanceof Date;
        }
        return false;
    }

    isEmpty(str: string): Boolean {
        if (str === null || str === undefined) {
            return true;
        }

        if (typeof str === 'string' && str.trim().length === 0) {
            return true;
        }
        return false;
    }

    validateMultiplicities (min, max){
        if( (min==null && max==null) ||
            (min==undefined && max==undefined)){
            return null;
        }

        if(min == undefined || min ==null){
            min = "";
        }

        if(max == undefined || max ==null){
            max = "";
        }


        if(min.trim().length == 0 && max.trim().length ==0){
            return null;
        }

        if(min == "*"){
            min = "-1";
        }

        if(max == "*"){
            max = "-1";
        }

        if(min.length>0 && (parseInt(min)< -1 || isNaN(min) || min.indexOf(".")!=-1)){
            return "Invalid Min Multiplicity";
        }

        if(max.length>0 && (parseInt(max)< -1 || isNaN(max) || max.indexOf(".")!=-1)){
            return "Invalid Max Multiplicity";
        }


        if(min.trim().length == 0 && max.trim().length >0){
            return "Min Multiplicity should have a value";
        }


        if(max.trim().length == 0 && min.trim().length >0) {
            return "Max Multiplicity should have a value";
        }


        if(min.length>0 && max.length>0){

            var minInt = parseInt(min);
            var maxInt = parseInt(max);

            if(minInt == -1) {
                minInt = Number.MAX_VALUE;
            }

            if(maxInt == -1) {
                maxInt = Number.MAX_VALUE;
            }

            if(minInt > maxInt){
                return "Min Multiplicity should be Equal or Less than Max Multiplicity";
            }

            if(minInt == 0 && maxInt == 0){
                return "Min and Max Multiplicities can not both be 0";
            }

            if(minInt == Number.MAX_VALUE && maxInt == Number.MAX_VALUE){
                return "Min and Max Multiplicities can not both be unbound";
            }

        }
        return null;
    };

    guid() {
	    function s4() {
		    return Math.floor((1 + Math.random()) * 0x10000)
			    .toString(16)
			    .substring(1);
	    }
	    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		    s4() + '-' + s4() + s4() + s4();
    };
}
