import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  constructor(private accountService: AccountService){}

  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.refreshUser();
  }

  private refreshUser(){
    const jwt = this.accountService.getJWT();
    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: _ => {},
        error: _ => {
          this.accountService.logout();
        }
      })
    } else {
      this.accountService.refreshUser(null).subscribe();
    }
  }

  // title = 'ClientApp';
}
