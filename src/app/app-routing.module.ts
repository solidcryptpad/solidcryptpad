import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { HomeComponent } from './components/home/home.component';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { FileExplorerComponent } from './components/file-explorer/file-explorer.component';
import { KeystoreComponent } from './components/keystore/keystore.component';
import { FaqComponent } from './components/faq/faq.component';
import { FilePreviewComponent } from './components/file-preview/file-preview.component';
import { ShareComponent } from './components/share/share.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'keystore', component: KeystoreComponent },
  {
    path: 'files',
    component: FileExplorerComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'preview',
    component: FilePreviewComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'editor',
    component: TextEditorComponent,
    canActivate: [AuthenticatedGuard],
  },
  {
    path: 'share',
    component: ShareComponent,
  },
  {
    path: 'faq',
    component: FaqComponent,
  },
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
