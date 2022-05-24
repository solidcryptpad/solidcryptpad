import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileExplorerComponent } from './components/file-explorer/file-explorer.component';
import { KeystoreComponent } from './components/keystore/keystore.component';
import { ToastrModule } from 'ngx-toastr';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { NgxEditorModule } from 'ngx-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { EnterMasterPasswordComponent } from './components/enter-master-password/enter-master-password.component';
import { MatDialogModule } from '@angular/material/dialog';
import { GlobalErrorHandlerService } from './services/global-error-handler/global-error-handler.service';
import { TreeNestedExplorerComponent } from './components/tree-nested-explorer/tree-nested-explorer.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClientModule } from '@angular/common/http';
import { FaqComponent } from './components/faq/faq.component';
import { MatListModule } from '@angular/material/list';
import { LoggedInDirective } from './directives/logged-in/logged-in.directive';
import { MatMenuModule } from '@angular/material/menu';
import { FileUploadComponent } from './components/dialogs/file-upload/file-upload.component';
import { FilePreviewComponent } from './components/file-preview/file-preview.component';
import { MarkdownModule } from 'ngx-markdown';
import { DragAndDropDirective } from './directives/drag-and-drop/drag-and-drop.directive';
import {
  MockSolidAuthenticationService,
  shouldMockAuthenticationService,
} from './services/authentication/solid-authentication.service.mock';
import { SolidAuthenticationService } from './services/authentication/solid-authentication.service';
import { SimpleSolidAuthenticationService } from './services/authentication/simple-solid-authentication.service';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    HomeComponent,
    TextEditorComponent,
    FileExplorerComponent,
    KeystoreComponent,
    NavbarComponent,
    EnterMasterPasswordComponent,
    TreeNestedExplorerComponent,
    FaqComponent,
    LoggedInDirective,
    FileUploadComponent,
    FilePreviewComponent,
    DragAndDropDirective,
  ],
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTreeModule,
    MatExpansionModule,
    MatToolbarModule,
    MatDialogModule,
    MatButtonModule,
    FormsModule,
    HttpClientModule,
    NgxEditorModule,
    ToastrModule.forRoot({ closeButton: true }),
    MatProgressBarModule,
    MatIconModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    ReactiveFormsModule,
    MatListModule,
    MatMenuModule,
    MarkdownModule.forRoot(),
  ],
  providers: [
    {
      provide: SolidAuthenticationService,
      useClass: shouldMockAuthenticationService()
        ? MockSolidAuthenticationService
        : SimpleSolidAuthenticationService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (service: SolidAuthenticationService) => () =>
        service.initializeLoginStatus(),
      deps: [SolidAuthenticationService],
      multi: true,
    },
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
