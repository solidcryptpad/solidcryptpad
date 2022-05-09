import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { HomeComponent } from './components/home/home.component';
import { SolidAuthenticationService } from './services/authentication/solid-authentication.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileEditorComponent } from './components/file-editor/file-editor.component';
import { KeystoreComponent } from './components/keystore/keystore.component';
import { ToastrModule } from 'ngx-toastr';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { NgxEditorModule } from 'ngx-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GlobalErrorHandlerService } from './services/global_error_handler/global-error-handler.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { FaqComponent } from './components/faq/faq.component';
import { MatListModule } from '@angular/material/list';
import { LoggedInDirective } from './directives/logged-in.directive';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    HomeComponent,
    TextEditorComponent,
    FileEditorComponent,
    KeystoreComponent,
    NavbarComponent,
    FaqComponent,
    LoggedInDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    FormsModule,
    HttpClientModule,
    NgxEditorModule,
    ToastrModule.forRoot({ closeButton: true }),
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatIconModule,
    ReactiveFormsModule,
    MatListModule,
    MatMenuModule,
  ],
  providers: [
    SolidAuthenticationService,
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
