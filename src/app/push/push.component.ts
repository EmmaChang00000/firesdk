import { AppService } from './../app.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BaseUrl, IResponse, LocalUrl, TCheckPush } from '../config';
import { PlatformLocation } from '@angular/common';
import { Subscription } from 'rxjs/internal/Subscription';

/**
 * 送推播內容給後端
 */
@Component({
  selector: 'app-push',
  templateUrl: './push.component.html',
  styleUrls: ['./push.component.css'],
})
export class PushComponent implements OnInit, OnDestroy {
  subscription: Subscription | null = null;
  checkPush: TCheckPush | null = null;
  apiUrl = '';
  content = '';
  group = '';

  constructor(
    private location: PlatformLocation,
    private http: HttpClient,
    private appService: AppService
  ) {}

  ngOnInit() {
    if (!environment.production || this.location.hostname === 'localhost') {
      this.apiUrl = LocalUrl;
    }
    this.subscription = this.appService
      .isCheckPushIn()
      .subscribe((checkPush) => {
        this.checkPush = checkPush;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  reset() {
    this.content = '';
    this.group = '';
  }

  send() {
    if (this.checkPush !== 'success') return;
    this.http
      .post<IResponse>(`${this.apiUrl}${BaseUrl}/push`, {
        content: this.getPushContent(),
        group: this.group,
      })
      .pipe(take(1))
      .subscribe((response: IResponse) => {
        console.log('Send Response', response);
        this.appService.nextMsg({
          target: 'push',
          states: response.result,
          detail: '',
          timestamp: response.timestamp,
        });
        this.content = '';
      });
  }

  getPushContent() {
    const o = {
      notification: {
        title: '標題ABC',
        body: this.content,
        data: {
          url: "https://www.google.com",
        },
      },
    };
    return o;
  }
}
