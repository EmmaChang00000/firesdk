import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs/internal/observable/from';
import { map, take } from 'rxjs/operators';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  registration: ServiceWorkerRegistration | null = null;
  waitLimit = 3;

  constructor(private appService: AppService) {}

  ngOnInit(): void {
    this.checkServiceWorkerActivation();
  }

  checkServiceWorkerController() {
    if (!('serviceWorker' in navigator && navigator.serviceWorker.controller)) {
      console.log('!navigator.serviceWorker.controller');
      this.nextServiceWorkerActivation(false);
      return;
    } else {
      this.nextServiceWorkerActivation(true);
    }
  }

  nextServiceWorkerActivation(isHasControl: boolean) {
    if (isHasControl) {
      this.checkServiceWorkerActivation();
    } else {
      if (!!this.waitLimit) {
        this.waitLimit = this.waitLimit - 1;
        this.appService.nextMsg({
          target: 'notification',
          timestamp: Date.now(),
          states: 'wait',
          detail: '',
        });

        //延遲三秒再確認一次
        setTimeout(() => {
          this.checkServiceWorkerController();
        }, 3000);
      } else {
        // 超過最多等待次數 終止判斷sw
        this.appService.nextMsg({
          target: 'notification',
          timestamp: Date.now(),
          states: 'fail',
          detail: 'By WaitLimit',
        });
      }
    }
  }

  checkServiceWorkerActivation() {
    from(navigator.serviceWorker.ready)
      .pipe(
        map((registration) => {
          return registration.active ? registration : null;
        }),
        take(1)
      )
      .subscribe((registration) => {
        this.appService.nextMsg({
          target: 'notification',
          timestamp: Date.now(),
          states: !!registration ? 'success' : 'fail',
          detail: !!registration ? '' : 'By RegistrationNull',
        });
        this.appService.nextSWRegistration(registration);
      });
  }
}
