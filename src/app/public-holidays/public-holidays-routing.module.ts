import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicHolidaysComponent } from './public-holidays.component';

const routes: Routes = [
  { path: '', component: PublicHolidaysComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicHolidaysRoutingModule { }
