import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { HomeComponent } from './components/home/home.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { KeystoreComponent } from './components/keystore/keystore.component';

const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'keystore', component: KeystoreComponent },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthenticatedGuard],
  },

  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
