import { Injectable } from '@angular/core';
import { ResourcesService } from '../resources.service';
import { StateHandlerService } from './state-handler.service';
import { ElementTypesService } from '../element-types.service';
import { environment } from 'src/environments/environment';

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

  removeCookie() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('firstName');
    sessionStorage.removeItem('lastName');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('needsToResetPassword');
    sessionStorage.removeItem('userId');
  }

  getUserFromCookie() {
    if (
      sessionStorage.getItem('username') &&
      sessionStorage.getItem('username').length > 0
    ) {
      return {
        id: sessionStorage.getItem('userId'),
        token: sessionStorage.getItem('token'),
        username: sessionStorage.getItem('username'),
        email: sessionStorage.getItem('username'),
        firstName: sessionStorage.getItem('firstName'),
        lastName: sessionStorage.getItem('lastName'),
        role: sessionStorage.getItem('role'),
        needsToResetPassword: sessionStorage.getItem('needsToResetPassword')
      };
    }
    return null;
  }

  getEmailFromCookies() {
    return sessionStorage.getItem('email');
  }

  addToCookie(user) {
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('token', user.token);
    sessionStorage.setItem('firstName', user.firstName);
    sessionStorage.setItem('lastName', user.lastName);
    sessionStorage.setItem('username', user.username);
    sessionStorage.setItem('userId', user.id);

    // Keep username for 100 days
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 100);
    sessionStorage.setItem('email', user.username); // , expireDate);
    sessionStorage.setItem('role', user.role);
    sessionStorage.setItem('needsToResetPassword', user.needsToResetPassword);
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
            this.addToCookie(currentUser);
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
        this.removeCookie();
        this.stateHandler.Go('appContainer.mainApp.home');
      });
  }

  expireToken() {
    sessionStorage.removeItem('token');
  }

  isValidSession() {
    return this.resources.authentication.get('isValidSession');
  }

  isLoggedIn() {
    return this.getUserFromCookie() != null;
  }

  isAdmin() {
    if (this.isLoggedIn()) {
      const user = this.getUserFromCookie();
      if (user.role === 'administrator') {
        return true;
      }
    }
    return false;
  }

  getCurrentUser() {
    return this.getUserFromCookie();
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
      if (this.getCurrentUser()) {
        // check session and see if it's still valid
        this.isValidSession().subscribe(response => {
          resolve(!response.body);
        });
      } else {
        resolve(false);
      }
    });

    return promise;
  }

  saveLatestURL(url) {
    sessionStorage.setItem('latestURL', url);
  }
  getLatestURL() {
    return sessionStorage.getItem('latestURL');
  }
  removeLatestURL() {
    sessionStorage.removeItem('latestURL');
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
