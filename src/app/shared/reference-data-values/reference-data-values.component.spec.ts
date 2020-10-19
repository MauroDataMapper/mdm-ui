import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdmResourcesService } from '@mdm/modules/resources';
import { empty } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MdmPaginatorComponent } from '../mdm-paginator/mdm-paginator';
import { ReferenceDataValuesComponent } from './reference-data-values.component';

describe('ReferenceDataValuesComponent', () => {
   let component: ReferenceDataValuesComponent;
   let fixture: ComponentFixture<ReferenceDataValuesComponent>;

   beforeEach(async(() => {
      TestBed.configureTestingModule({
         imports: [
            MatPaginatorModule,
            MatDialogModule,
            NgxSkeletonLoaderModule,
            MatTableModule,
            MatSortModule,
            NoopAnimationsModule
         ],
         providers: [
            {
               provide: MdmResourcesService,
               useValue: {
                  referenceDataValue: {
                     // tslint:disable-next-line: deprecation
                     list: () => empty()
                  }
               }
            }
         ],
         declarations: [
            ReferenceDataValuesComponent,
            MdmPaginatorComponent
         ]
      })
         .compileComponents();
   }));

   beforeEach(() => {
      fixture = TestBed.createComponent(ReferenceDataValuesComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });
});
