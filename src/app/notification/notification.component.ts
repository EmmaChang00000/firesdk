import { Subscription } from 'rxjs/internal/Subscription';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { from } from 'rxjs/internal/observable/from';
import { concatMap, take } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';
import { AppService } from '../app.service';
import { Observable } from 'rxjs/internal/Observable';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { BaseUrl, IResponse, LocalUrl } from '../config';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp } from '@angular/fire/app';
import {
  MessagePayload,
  getMessaging,
  getToken,
  onMessage,
} from '@angular/fire/messaging';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  registration: ServiceWorkerRegistration | null = null;
  notificationPermission: NotificationPermission = 'default';
  apiUrl = '';
  group = '';

  constructor(
    private location: PlatformLocation,
    private appService: AppService,
    private http: HttpClient,
    public firebaseApp: FirebaseApp
  ) {}

  ngOnInit() {
    if (!environment.production || this.location.hostname === 'localhost') {
      this.apiUrl = LocalUrl;
    }

    this.appService.nextNotificationPermission(Notification.permission);

    this.subscription = this.appService
      .isSWRegistrationIn()
      .subscribe((registration) => {
        this.registration = registration;
      });

    this.listen();
  }

  listen() {
    const messaging = getMessaging(this.firebaseApp);

    onMessage(messaging, (payload: MessagePayload) => {
      if (payload && this.registration) {
        this.registration.showNotification(payload?.notification?.body || '');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  requestPermission() {
    // 瀏覽器跳出是否允許通知
    const permission$: Observable<NotificationPermission> = from(
      Notification.requestPermission()
    );

    // 此網站推播的訂閱物件
    const messaging = getMessaging(this.firebaseApp);
    const token$: Observable<string> = from(
      getToken(messaging, {
        vapidKey: environment.publicKey,
      })
    );

    const notification$ = permission$.pipe(
      concatMap((notificationPermission: NotificationPermission | null) => {
        if (notificationPermission) {
          this.notificationPermission = notificationPermission;
        }
        if (this.notificationPermission === 'granted') {
          if (this.notificationPermission === 'granted' && this.registration) {
            this.registration.showNotification('感謝您按下允許！');
          }
          return token$;
        } else {
          console.log('notificationPermission denied!!');
          return of(null);
        }
      })
    );

    notification$.pipe(take(1)).subscribe((token: string | null) => {
      console.log('token::', token);
      if (token) {
        this.registerNotification(token);
      }
    });
  }

  registerNotification(token: string) {
    this.http
      .post<IResponse>(`${this.apiUrl}${BaseUrl}/register`, {
        token: token,
        group: this.group,
      })
      .pipe(take(1))
      .subscribe((response: IResponse) => {
        this.appService.nextNotificationPermission(this.notificationPermission);
      });
  }
}