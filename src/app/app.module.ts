import { APP_INITIALIZER, NgModule } from '@angular/core';
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
import { ToastrModule } from 'ngx-toastr';
import { KeystoreComponent } from './components/keystore/keystore.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    HomeComponent,
    FileEditorComponent,
    KeystoreComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatExpansionModule,
    MatButtonModule,
    FormsModule,
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
