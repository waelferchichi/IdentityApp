import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { SharedService } from './../../shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from 'src/app/shared/models/account/user';
import { ConfirmEmail } from './../../shared/models/account/confirmEmail';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit {
  success = true;

  constructor(private accoountService: AccountService,
    private SharedService: SharedService,
    private router: Router,
    private ActivatedRoute: ActivatedRoute){}


  ngOnInit(): void {
    // throw new Error('Method not implemented.');
    this.accoountService.user$.pipe(take(1)).subscribe({
      next:(user: User | null) =>{
        if (user) {
          this.router.navigateByUrl('/');
        }else {
          this.ActivatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              // console.log(params.get('token'));
              // console.log(params.get('email'));

              const confirmEmail : ConfirmEmail = {
                token: params.get('token'),
                email: params.get('email'),
              }

              this.accoountService.confirmEmail(confirmEmail).subscribe({
                next:(reponse: any) =>{
                  this.SharedService.showNotification(true, reponse.value.title,reponse.value.message);
                }, error: error => {
                  this.success = false;
                  this.SharedService.showNotification(false,"Failed",error.error);
                }
              })
            }
          })
        }
      }
    })
  }

  resendEmailConfirmationLink(){
    this.router.navigateByUrl('/account/send-email/resend-email-confirmation-link');
  }

}
