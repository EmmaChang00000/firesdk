import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideFirebaseApp,initializeApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyAm_zoqGlX07ABxPAL0hHFf7YTvYm1Ou1U',
        authDomain: 'fire-demo-a766b.firebaseapp.com',
        projectId: 'fire-demo-a766b',
        storageBucket: 'fire-demo-a766b.appspot.com',
        messagingSenderId: '205007761014',
        appId: '1:205007761014:web:5deca532d48f2ac78d3957',
      })
    ),
    provideMessaging(() => getMessaging()),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
