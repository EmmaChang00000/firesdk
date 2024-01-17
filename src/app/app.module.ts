import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { NotificationComponent } from './notification/notification.component';
import { PushComponent } from './push/push.component';
import { LogComponent } from './log/log.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TimestampPipe } from './timestamp.pipe';

@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
    PushComponent,
    LogComponent,
    TimestampPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerImmediately',
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
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
