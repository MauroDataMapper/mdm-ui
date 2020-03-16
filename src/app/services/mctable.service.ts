import {Injectable, PipeTransform} from '@angular/core';
import {BehaviorSubject, Observable, of, pipe, Subject} from 'rxjs';
import {DecimalPipe} from '@angular/common';
import {debounceTime, delay, switchMap, tap} from 'rxjs/operators';
import {SortDirection} from '../directives/sortable.directive';
import {ResourcesService} from './resources.service';


interface SearchResult {
  countries: [];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: string;
  sortDirection: SortDirection;
}

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

// function sort(result: [], column: string, direction: string): Country[] {
//   if (direction === '') {
//     return result;
//   } else {
//     return [...result].sort((a, b) => {
//       const res = compare(a[column], b[column]);
//       return direction === 'asc' ? res : -res;
//     });
//   }
// }
//
// function matches(country: Country, term: string, pipe: PipeTransform) {
//   return country.name.toLowerCase().includes(term)
//       || pipe.transform(country.area).includes(term)
//       || pipe.transform(country.population).includes(term);
// }
@Injectable({
  providedIn: 'root'
})
export class MctableService {
  private resultSubject = new Subject<any>();
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  // private  result :any;
  result: any;
  // private _countries$ = new BehaviorSubject<[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: ''
  };

  constructor(private resourcesService: ResourcesService) {
    // this._search$.pipe(
    //     tap(() => this._loading$.next(true)),
    //     debounceTime(200),
    //     switchMap(() => this._search()),
    //     delay(200),
    //     tap(() => this._loading$.next(false))
    // ).subscribe(result => {
    //   this._countries$.next(result.countries);
    //   this._total$.next(result.total);
    // });
    // this.result = this.ResultGetMessage();
    this.resourcesService.HistoryGet('a61e88e7-c951-4624-baaf-ec03cd09357b', '').subscribe(serverResult => {
      this.result = serverResult;
    });
    if (this.result !== null && this.result !== undefined) {
      this._total$.next(this.result.count);
    }
    this._search$.next();
  }

  // get countries$() { return this._countries$.asObservable(); }
  get total$() {
    return this._total$.asObservable();
  }

  get loading$() {
    return this._loading$.asObservable();
  }

  get page() {
    return this._state.page;
  }

  set page(page: number) {
    this._set({page});
  }

  get pageSize() {
    return this._state.pageSize;
  }

  set pageSize(pageSize: number) {
    this._set({pageSize});
  }

  get searchTerm() {
    return this._state.searchTerm;
  }

  set searchTerm(searchTerm: string) {
    this._set({searchTerm});
  }

  set sortColumn(sortColumn: string) {
    this._set({sortColumn});
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({sortDirection});
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  // private _search(): Observable<SearchResult> {
  //   const {sortColumn, sortDirection, pageSize, page, searchTerm} = this._state;
  //
  //   // 1. sort
  //   let countries = sort(COUNTRIES, sortColumn, sortDirection);
  //
  //   // 2. filter
  //   countries = countries.filter(country => matches(country, searchTerm, this.pipe));
  //   const total = countries.length;
  //
  //   // 3. paginate
  //   countries = countries.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
  //   return of({countries, total});
  // }

  ResultSendMessage(message: any) {
    this.resultSubject.next(message);
    this.result = message;
  }

  ResultGetMessage(): Observable<any> {
    return this.resultSubject.asObservable();
  }

}
