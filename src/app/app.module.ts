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
import { FormsModule } from '@angular/forms';
import { FileEditorComponent } from './components/file-editor/file-editor.component';
import { KeystoreComponent } from './components/keystore/keystore.component';
import { ToastrModule } from 'ngx-toastr';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { NgxEditorModule } from 'ngx-editor';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GlobalErrorHandlerService } from './services/global_error_handler/global-error-handler.service';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatButtonModule,
    FormsModule,
    NgxEditorModule,
    ToastrModule.forRoot({ closeButton: true }),
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
