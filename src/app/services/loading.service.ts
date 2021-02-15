import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  isLoading = this.loadingSubject.asObservable();

  constructor() { }

  setHttpLoading(loading: boolean, url: string) {
    if (!url) {
      throw new Error('The request URL must be provided to the LoadingService.setHttpLoading() function');
    }

    if (loading === true) {
      this.loadingMap.set(url, loading);
      this.loadingSubject.next(true);
    }
    else if (loading === false && this.loadingMap.has(url)) {
      this.loadingMap.delete(url);
    }

    if (this.loadingMap.size === 0) {
      this.loadingSubject.next(false);
    }
  }
}
