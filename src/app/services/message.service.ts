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
import {Injectable, EventEmitter, Output, OnDestroy} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {

  @Output() changeUserGroupAccess: EventEmitter<boolean> = new EventEmitter();

  @Output() changeSearch: EventEmitter<boolean> = new EventEmitter();

  @Output() changeShareReadWithEveryone: EventEmitter<boolean> = new EventEmitter();

  @Output() editMode: EventEmitter<boolean> = new EventEmitter();

  isUserGroupAccess = false;
  isSearch = false;
  isShareReadWithEveryone = false;
  isEditMode = false;
  loggedInChange = new Subject<any>();
  dataModelDataChange = new Subject<any>();
  elementSelectorSendMessage = new Subject<any>();

  dataChange = new Subject<any>();
  dataChanged$ = this.dataChange.asObservable();
  loggedInChanged$ = this.loggedInChange.asObservable();
  dataModelDataChange$ = this.dataModelDataChange.asObservable();
  elementSelector = this.elementSelectorSendMessage.asObservable();
  folderPermissions;

  private lastErrorVar = {};
  private errorMessageVar = {};
  private subjUserDetails = new Subject<any>();
  private UserGroupAccessSubject = new Subject<any>();
  /** Generic message functions */

    // A map to store subjects/channels
  private subjects: Map<string, Subject<any>> = new Map();
  private FolderSubject = new Subject<any>();



  get lastError(): any {
    return this.lastErrorVar;
  }

  set lastError(value: any) {
    this.lastErrorVar = value;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get errorMessage(): {} {
    return this.errorMessageVar;
  }

  set errorMessage(value: {}) {
    this.errorMessageVar = value;
  }

  sendUserDetails(data) {
    this.subjUserDetails.next(data);
  }

  getUserDetails(): Observable<any> {
    return this.subjUserDetails.asObservable();
  }

  dataChanged(data) {
    this.dataChange.next(data);
  }

  loggedInChanged(data) {
    this.loggedInChange.next(data);
  }

  dataModelDataChanged(data) {
    this.dataModelDataChange.next(data);
  }

  elementSelectorSendData(data) {
    this.elementSelectorSendMessage.next(data);
  }

  toggleUserGroupAccess() {
    this.isUserGroupAccess = !this.isUserGroupAccess;
    this.changeUserGroupAccess.emit(this.isUserGroupAccess);
    if (this.isUserGroupAccess) {
      this.isSearch = false;
      this.changeSearch.emit(this.isSearch);
    }
  }

  toggleSearch() {
    this.isSearch = !this.isSearch;
    this.changeSearch.emit(this.isSearch);
    if (this.isSearch) {
      this.isUserGroupAccess = false;
      this.changeUserGroupAccess.emit(this.isUserGroupAccess);
    }
  }

  toggleShareReadWithEveryone() {
    this.isShareReadWithEveryone = !this.isShareReadWithEveryone;
    this.changeShareReadWithEveryone.emit(this.isShareReadWithEveryone);

  }

  showEditMode(showEdit: boolean) {
    this.editMode.emit(showEdit);
  }

  FolderSendMessage(message: any) {
    this.folderPermissions = message;
    this.FolderSubject.next(message);
  }

  FolderSendClearMessages() {
    this.FolderSubject.next();
  }

  FolderGetMessage(): Observable<any> {
    return this.FolderSubject.asObservable();
  }

  getFolderPermissions() {
    if (this.folderPermissions != null) {

      return this.folderPermissions;
    }
    // else{      add a call in else condition to get folders
    //   this.FoldersPermissionGet();
    //   return this.permissionsData;
    // }
  }

  DataModelSendMessage(message: any) {
    this.folderPermissions = message;
    this.FolderSubject.next(message);
  }

  /**
   * Broadcast to all subscribers of a given subject.
   *
   * @param subject name of subject/channel to broadcast to
   * @param message message to broadcast
   */
  broadcast(subject, ...message: any) {
    // Create the named Subject if not exists
    if (!this.subjects.has(subject)) {
      this.subjects.set(subject, new Subject());
    }

    this.subjects.get(subject).next(message);
  }

  /**
   * Get the named subject
   *
   * @param subject name of subject to get
   */
  getSubject(subject) {
    // Create the named Subject if not exists
    if (!this.subjects.has(subject)) {
      this.subjects.set(subject, new Subject());
    }

    return this.subjects.get(subject);
  }

  /**
   * Subscribe to named subject/channel
   *
   * @param subject subject to subscribe to
   * @param callback message handler
   */
  subscribe(subject, handler) {
    // Create the named Subject if not exists
    if (!this.subjects.has(subject)) {
      this.subjects.set(subject, new Subject());
    }

    return this.subjects.get(subject).subscribe(handler);
  }

  on(subject, handler) {
    return this.subscribe(subject, handler);
  }

  /**
   * Clear the subjects map when destroy
   */
  ngOnDestroy(): void {
    this.subjects.forEach((subject, key) => {
      subject.complete();
      this.subjects.delete(key);
    });
  }
}
