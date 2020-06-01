import { FoldersTreeComponent } from './folders-tree.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoldersTreeModule } from './folders-tree.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { UIRouterModule } from '@uirouter/angular';
import { ToastrModule } from 'ngx-toastr';

describe('mdm-folders-tree', () => {
    let component: FoldersTreeComponent;
    let fixture: ComponentFixture<FoldersTreeComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          FoldersTreeModule,

          // Transitive dependencies
          MatDialogModule,
          HttpClientModule,
          UIRouterModule.forRoot({ useHash: true }),
          ToastrModule.forRoot()
        ]
      })
      .compileComponents();
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(FoldersTreeComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
