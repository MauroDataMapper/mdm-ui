import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdmDashboardComponent } from '@mdm/mdm-dashboard/mdm-dashboard.component';
import { MdmFavouritesComponent } from '../mdm-favourites/mdm-favourites.component';
import { MdmCommentsComponent } from '../mdm-comments/mdm-comments.component';
import { MdmRecentlyAddedDataModelsComponent } from '../mdm-recently-added-data-models/mdm-recently-added-data-models.component';
import { MdmRecentActivityComponent } from '../mdm-recent-activity/mdm-recent-activity.component';
import { MdmTasksComponent } from '../mdm-tasks/mdm-tasks.component';
import { GridsterModule } from 'angular-gridster2';
import { CatalogueModule } from '@mdm/modules/catalogue/catalogue.module';
import { SharedModule } from '@mdm/modules/shared/shared.module';
import { MaterialModule } from '@mdm/modules/material/material.module';



@NgModule({
  declarations: [
    MdmDashboardComponent,
    MdmFavouritesComponent,
    MdmCommentsComponent,
    MdmRecentlyAddedDataModelsComponent,
    MdmRecentActivityComponent,
    MdmTasksComponent 
  ],
  imports: [
    CommonModule,
    GridsterModule,
    SharedModule,
    CatalogueModule,
    MaterialModule
  ],
  exports: [
    MdmDashboardComponent,
    MdmFavouritesComponent,
    MdmCommentsComponent,
    MdmRecentlyAddedDataModelsComponent,
    MdmRecentActivityComponent,
    MdmTasksComponent
  ]
})
export class DashboardModule { }
