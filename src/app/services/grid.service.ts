import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridService {
  @Output() reloadEvent = new EventEmitter<string>();

  constructor() {}

  applyFilter = (filters: any[]) => {
    let filter: any = '';
    if (filters) {
      filters.forEach((x: any) => {
        const name = x.nativeElement.name;
        const value = x.nativeElement.value;

        if (value !== '') {
          filter += name + '=' + value;
        }
      });
      this.reloadEvent.emit(filter);
    }
  };
}
