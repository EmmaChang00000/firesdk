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
  Messaging,
  getMessaging,
  getToken,
  onMessage,
} from '@angular/fire/messaging';

/**
 * 1.瀏覽器跳出權限視窗
 * 2.拿service worker產生的認證物件
 */
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
    public firebaseApp: FirebaseApp,
    private swPush: SwPush
  ) {}

  ngOnInit() {
    console.log(environment.production, this.location.hostname);
    if (!environment.production || this.location.hostname === 'localhost') {
      this.apiUrl = LocalUrl;
    }

    this.swPush.messages.subscribe((message) => {
      console.log('Message received： ', message);
    });

    this.subscription = this.appService
      .isSWRegistrationIn()
      .subscribe((registration) => {
        this.registration = registration;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  requestPermission() {
    if (!this.registration) return;
    // 瀏覽器跳出是否允許通知
    const permission$: Observable<NotificationPermission> = from(
      Notification.requestPermission()
    );

    const messaging = getMessaging(this.firebaseApp);
    // 此網站推播的訂閱物件
    const token$: Observable<string> = from(
      getToken(messaging, {
        vapidKey: environment.publicKey,
        serviceWorkerRegistration: this.registration,
      })
    );

    const notification$ = permission$.pipe(
      concatMap((notificationPermission: NotificationPermission | null) => {
        if (notificationPermission) {
          this.notificationPermission = notificationPermission;
        }
        if (this.notificationPermission === 'granted') {
          this.registration!.showNotification('感謝您按下允許！');
          return token$;
        } else {
          console.log('notificationPermission denied!!');
          this.appService.nextCheckPush('permissionNot');
          return of(null);
        }
      })
    );

    notification$.pipe(take(1)).subscribe((token: string | null) => {
      console.log('token::', token);
      if (token) {
        this.registerNotification(token);
      } else {
        this.appService.nextCheckPush('tokenNot');
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
        this.appService.nextCheckPush(
          response.result === 'success' ? response.result : 'apiNot'
        );
      });
  }
}
