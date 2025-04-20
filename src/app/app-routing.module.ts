import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditDinnerComponent } from './components/edit-dinner/edit-dinner.component';
import { AuthGuard } from './guards/auth.guard';
import { BecomeHostComponent } from './components/become-host/become-host.component';

const routes: Routes = [
  {
    path: 'edit-dinner/:id',
    component: EditDinnerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'host',
    component: BecomeHostComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 