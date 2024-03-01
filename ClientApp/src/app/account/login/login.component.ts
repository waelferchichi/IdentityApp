import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';
import { AccountService } from '../account.service';
import { take } from 'rxjs';
import { User } from '../../shared/models/account/user';
import { DOCUMENT } from '@angular/common';
import { LoginWithExternal } from 'src/app/shared/models/account/loginWithExternal';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';

declare const FB: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('googleButton',{static: true}) googleButton: ElementRef = new ElementRef({});

  loginForm: FormGroup= new FormGroup({});
  submitted =false;
  errorMessages: string[] = [];
  returnUrl: string | null = null;

  constructor(private accountService:AccountService,
    // private sharedService:SharedService,
    private formBuilder:FormBuilder,
    private router:Router,
     private activatedRoute: ActivatedRoute,
     private sharedService:SharedService,
     private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document){
      this.accountService.user$.pipe(take(1)).subscribe({
        next : (user: User | null) => {
          if(user){
            this.router.navigateByUrl('/');
          } else {
            this.activatedRoute.queryParamMap.subscribe({
              next: (params: any) => {
                if (params){
                  this.returnUrl = params.get('returnUrl');
                }
              }
            })
          }
        }
      })
    }

    ngOnInit(): void {
      // throw new Error('Method not implemented.');
      this.initiazeGoogleButton();
      this.initializeForm();
    }

    ngAfterViewInit(){
      const script1 = this._renderer2.createElement('script');
      script1.src = 'https://accounts.google.com/gsi/client';
      script1.async = 'true';
      script1.defer = 'true';
      this._renderer2.appendChild(this._document.body,script1);
    }


  initializeForm(){

    this.loginForm = this.formBuilder.group({
      // username:['', Validators.required],
      userName:['', Validators.required],
      password:['', Validators.required],

    })
  }

  login(){

    this.submitted = true;
    this.errorMessages =[];

    if (this.loginForm.valid){

      this.accountService.login(this.loginForm.value).subscribe({
        // next:(response: any)=>{
        next: _ =>{
          // this.sharedService.showNotification(true, response.value.title, response.value.message);
          // this.router.navigateByUrl('/account/login');
          ////console.log(response);
          if (this.returnUrl){
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigateByUrl('/');
          }
        },
        error: error =>{
          // console.log(error);
          if (error.error.errors){
            this.errorMessages = error.error.errors;
          
          } else {
            this.errorMessages.push(error.error);
          }
          // console.log(error);
        }
      })


    }
  }


  loginWithFacebook(){
    FB.login(async (fbResult: any) => {
      if (fbResult.authResponse) {
        // console.log(fbResult);
        const accessToken = fbResult.authResponse.accessToken;
        const userId = fbResult.authResponse.userID;
        // console.log(fbResult);

        this.accountService.loginWithThirdParty(new LoginWithExternal(accessToken, userId, "facebook")).subscribe({
          // next: _ => {
          next: () => {
              if (this.returnUrl){
                this.router.navigateByUrl(this.returnUrl);
              } else {
                this.router.navigateByUrl('/');
              }
            },
            error: error =>{
              ///// console.log(error);
              // if (error.error.errors){
              //   this.errorMessages = error.error.errors;
              
              // } else {
              //   this.errorMessages.push(error.error);
              // }
              this.sharedService.showNotification(false, "Failed", error.error);
              console.log(error);
            }
        })
        
      } else {
        this.sharedService.showNotification(false, "Failed", "Unable to login with your Facebook");
      }
    })

    }

  resendEmailConfirmationLink(){
    this.router.navigateByUrl('/account/send-email/resend-email-confirmation-link');
  }


  private initiazeGoogleButton(){
    // (window as any).onGoogleLibraryLoad = () => {
    ( window as any).onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: '710224229353-q36l0ljh1jaod8n5l4nrr67sng9kfa7l.apps.googleusercontent.com',
        callback: this.googleCallBack.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
        this.googleButton.nativeElement,
        {size: 'medium', shape: 'rectangular', text: 'signin_with', logo_alignment: 'center'}
      );
    };
   }
   private async googleCallBack(response: CredentialResponse){
    // console.log(response);
    const decodedToken: any = jwtDecode(response.credential);
    // this.router.navigateByUrl(`/account/register/third-party/google?access_token=${response.credential}&userId=${decodedToken.sub}`);
    this.accountService.loginWithThirdParty(new LoginWithExternal(response.credential, decodedToken.sub, "google")).subscribe({
      next: _ =>{
        if (this.returnUrl){
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigateByUrl('/');
        }
      }, error: error => {
        this.sharedService.showNotification(false,"Failed",error.error);
      }
    })
   }

}
