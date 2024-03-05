import { Component, HostListener, OnInit } from '@angular/core';
import { from } from 'rxjs/internal/observable/from';
import { map, take } from 'rxjs/operators';
import { AppService } from './app.service';

/**
 * 確認service worker的狀態
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  registration: ServiceWorkerRegistration | null = null;
  waitLimit = 3;

  deferredPrompt: any;
  showButton = false;

  constructor(private appService: AppService) {}

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: any) {
    console.log(9971, e);
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showButton = true;
  }

  addToHomeScreen() {
    // hide our user interface that shows our A2HS button
    this.showButton = false;
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt');
      } else {
        console.log('User dismissed the A2HS prompt');
      }
      this.deferredPrompt = null;
    });
  }

  ngOnInit(): void {
    console.log(55);
    this.checkServiceWorkerController();
  }

  checkServiceWorkerController() {
    if (!('serviceWorker' in navigator && navigator.serviceWorker.controller)) {
      console.log('!navigator.serviceWorker.controller');
      this.nextServiceWorkerActivation(false);
      return;
    } else {
      console.log('navigator.serviceWorker.controller exist!!');
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
