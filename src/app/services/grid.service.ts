import { Injectable, Output, EventEmitter } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class GridService {
  @Output() reloadEvent = new EventEmitter<string>();

  constructor() {}

  applyFilter = (filters: any[]) => {
    var filter: any = "";
    if (filters) {
      filters.forEach((x: any) => {
        var name = x.nativeElement.name;
        var value = x.nativeElement.value;

        if (value !== "") {
          filter += name + "=" + value;
        }
      });
      this.reloadEvent.emit(filter);
    }
  };
}
