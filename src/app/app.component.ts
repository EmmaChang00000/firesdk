import { Component } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(private firebaseApp: FirebaseApp) {}

  ngOnInit() {
    // const messaging = getMessaging(this.firebaseApp);
    // from(
    //   getToken(messaging, {
    //     vapidKey:
    //       'BJD7XKX8M2cXsZd7tNwR98X0z5TKGVeHg0J8HLlwRfxSw8dqoifUOm00EbtZYCSJxNIQ89fYYj83Rbpfy7TYvH8',
    //   })
    // )
    //   .pipe(take(1))
    //   .subscribe((res)=>{
    //     console.log(222,res)
    //   });
  }
}
