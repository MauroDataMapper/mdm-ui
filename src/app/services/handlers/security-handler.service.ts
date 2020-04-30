import { Injectable } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { StateHandlerService } from './state-handler.service';
import { ElementTypesService } from '../element-types.service';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class SecurityHandlerService {
  loginModalDisplayed = false;
  in_AuthLoginRequiredCheck = false;
  constructor(
    private elementTypes: ElementTypesService,
    private resources: ResourcesService,
    private stateHandler: StateHandlerService
  ) {}

  removeLocalStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('needsToResetPassword');
    localStorage.removeItem('userId');
  }

  getUserFromLocalStorage() {
    // if (this.isValidSession()) {

    if (
      localStorage.getItem('username') &&
      localStorage.getItem('username').length > 0
    ) {
      return {
        id: localStorage.getItem('userId'),
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username'),
        email: localStorage.getItem('username'),
        firstName: localStorage.getItem('firstName'),
        lastName: localStorage.getItem('lastName'),
        role: localStorage.getItem('role'),
        needsToResetPassword: localStorage.getItem('needsToResetPassword')
      };
    }
    return null;
  // }
  //   return null;
  }

getEmailFromStorage() {
    return localStorage.getItem('email');
  }

addToLocalStorage(user) {
    localStorage.setItem('userId', user.id);
    localStorage.setItem('token', user.token);
    localStorage.setItem('firstName', user.firstName);
    localStorage.setItem('lastName', user.lastName);
    localStorage.setItem('username', user.username);
    localStorage.setItem('userId', user.id);

    // Keep username for 100 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 100);
    localStorage.setItem('email', user.username); // , expireDate);
    localStorage.setItem('role', user.role);
    localStorage.setItem('needsToResetPassword', user.needsToResetPassword);
  }

login(username, password) {
    // //ignoreAuthModule: true
    // //This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
    // //as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
    // var deferred = $q.defer();
    const resource = { username, password };

    const promise = new Promise((resolve, reject) => {
      this.resources.authentication
        .post(
          'login',
          { resource },
          { login: true, ignoreAuthModule: true, withCredentials: true }
        )
        .subscribe(
          res => {
            const result = res.body;
            const currentUser = {
              id: result.id,
              token: result.token,
              firstName: result.firstName,
              lastName: result.lastName,
              username: result.emailAddress,
              role: result.userRole ? result.userRole.toLowerCase() : '',
              needsToResetPassword: result.needsToResetPassword ? true : false
            };
            this.addToLocalStorage(currentUser);
            return resolve(currentUser);
          },
          error => {
            return reject(error);
          }
        );
    });
    return promise;
  }

  //       login2(username, password) {
  //           var resource = {username:username,password:password};
  //           this.resources.authenticationPost("login", {resource:resource}, {login:true, ignoreAuthModule: true, withCredentials: true})
  //           // this.http.post(url)
  //               .map((res: Response)=>{
  //     console.log("res")
  // })
  // .catch((error:any)=>{
  //     // Observable.throw(error);
  //     console.log('login test fails')
  // })
  //       }

logout() {
    return this.resources.authentication
      .post('logout', null, { responseType: 'text' })
      .subscribe(result => {
        this.removeLocalStorage();
        this.stateHandler.Go('appContainer.mainApp.home');
      });
  }

expireToken() {
    localStorage.removeItem('token');
  }

// isValidSession() {
//      this.resources.authentication.get('isValidSession').subscribe(result => {
//        if (result.body === false) {
//           this.removeLocalStorage();
//           return false;
//        }
//        if (result.body === true) {
//           return true;
//        }
//          });
//      return false;
//   }

  isValidSession() {
    return this.resources.authentication.get('isValidSession');
  }


isLoggedIn() {
    return this.getUserFromLocalStorage() != null;
  }

isAdmin() {
    if (this.isLoggedIn()) {
      const user = this.getUserFromLocalStorage();
      if (user.role === 'administrator') {
        return true;
      }
    }
    return false;
  }

getCurrentUser() {
    return this.getUserFromLocalStorage();
  }

showIfRoleIsWritable(element) {
    // if this app is NOT 'editable', return false
    const isEditable = environment.appIsEditable;
    if (isEditable !== null && isEditable === false) {
      return false;
    } else if (isEditable !== null && isEditable /* === true*/) {
      // Now app is editable, lets check if the user has writable role
      const user = this.getCurrentUser();

      // if the user is not logged-in
      if (!user) {
        return false;
      }

      // because of circular dependencies between stateRoleAccess and SecurityHandler, we load it locally instead of injecting it
      // var stateRoleAccess: StateRoleAccessService = this.inject.get(StateRoleAccessService);

      // check if the user role is a writable one and return false if it is NOT
      // var allRoles = stateRoleAccess.getAllRoles();
      // if (user && user.role && allRoles[user.role]) {
      //    if (allRoles[user.role].writable === false) {
      //        return false;
      //    }
      // } else {
      //    return false;
      // }

      // if a value is provided, we need to check if the user has writable access to the element
      if (element) {
        if (element.editable && !element.finalised) {
          return true;
        }
        return false;
      }

      return true;
    }

    return false;
  }

isCurrentSessionExpired() {
    const promise = new Promise(resolve => {
      // var deferred = $q.defer();
      if (this.getCurrentUser()) { // Check for valid session when getting user from local storage
        // check session and see if it's still valid

        this.isValidSession().subscribe(response => {
          if (response.body === false) {
            this.removeLocalStorage();
          }
          resolve(!response.body);
        });
      } else {
        resolve(false);
      }
    });

    return promise;
  }



saveLatestURL(url) {
    localStorage.setItem('latestURL', url);
  }
getLatestURL() {
    return localStorage.getItem('latestURL');
  }
removeLatestURL() {
    localStorage.removeItem('latestURL');
  }

dataModelAccess(element) {
    return {
      showEdit: element.editable && !element.finalised,
      showNewVersion: element.editable && element.finalised,
      showFinalise: element.editable && !element.finalised,
      showPermission: element.editable || this.isAdmin(),
      showDelete: this.isAdmin(),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.editable && !element.finalised
    };
  }

termAccess(element) {
    return {
      showEdit: element.editable && !element.finalised,
      showNewVersion: element.editable && element.finalised,
      showFinalise: element.editable && !element.finalised,
      showPermission: element.editable || this.isAdmin(),
      showDelete: this.isAdmin(),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.editable
    };
  }

dataElementAccess(element) {
    return {
      showEdit: element.editable,
      showDelete: this.isAdmin(),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.editable && !element.finalised
    };
  }

dataClassAccess(element) {
    return {
      showEdit: element.editable,
      showDelete: this.isAdmin(),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.editable && !element.finalised
    };
  }

dataTypeAccess(element) {
    return {
      showEdit: element.editable,
      showDelete: this.isAdmin(),
      canAddAnnotation: this.isLoggedIn(),
      canAddMetadata: this.isLoggedIn(),

      canAddLink: element.editable && !element.finalised
    };
  }

datFlowAccess(dataFlow) {
    return {
      showEdit: dataFlow.editable,
      canAddAnnotation: dataFlow.editable,
      canAddMetadata: this.isLoggedIn()
    };
  }

elementAccess(element) {
    if (
      element.domainType === 'DataModel' ||
      element.domainType === 'Terminology' ||
      element.domainType === 'CodeSet'
    ) {
      return this.dataModelAccess(element);
    }

    if (element.domainType === 'Term') {
      return this.termAccess(element);
    }

    if (element.domainType === 'DataElement') {
      return this.dataElementAccess(element);
    }

    if (element.domainType === 'DataClass') {
      return this.dataClassAccess(element);
    }

    const dataTypes = this.elementTypes.getAllDataTypesMap();
    if (dataTypes[element.domainType]) {
      return this.dataTypeAccess(element);
    }

    if (element.domainType === 'DataFlow') {
      return this.datFlowAccess(element);
    }
  }

folderAccess(folder) {
    return {
      showEdit: folder.editable,
      showPermission: folder.editable || this.isAdmin(),
      showDelete: this.isAdmin()
    };
  }

  // return factoryObject;
  // };
}
