import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GastoPage } from './gasto.page';

const routes: Routes = [
  {
    path: '',
    component: GastoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GastoPageRoutingModule {}
