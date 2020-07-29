import { Component, OnInit } from '@angular/core';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CookieService } from 'src/app/_services/cookie.service';
declare var $: any

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  signupFrm: FormGroup
  loginFrm: FormGroup
  forgotPasswordFrm: FormGroup
  otpfrm: FormGroup
  signupSubmitted: boolean = false
  loginSubmitted: boolean = false
  contentWizToken: any 
  userObj: any = {}
  errMessage: string = ''
  forgotPasswordFlag: boolean = false
  footerClass: boolean = false
  cookieUser: any
  perVar: number = 0 
  filterForm: FormGroup
  industryArr: any = []
  contentTypes: FormArray;
  constructor(private cookieService: CookieService, private router: Router, 
    private userQueryService: UserQueryService, private fb: FormBuilder, 
    private _scrollToService: ScrollToService) { }

  ngOnInit() {
    this.userQueryService.getLoaderPercentage()
    .subscribe(per => {
      this.perVar = per
    })
    this.userQueryService.getNoRecord()
    .subscribe(flag => {
      this.footerClass = flag
    })

    let userObj = localStorage.getItem('contentWizToken')
    this.userObj = userObj? JSON.parse(userObj): {}
    
    this.contentWizToken = userObj? JSON.parse(userObj).token: undefined
    this.createSignupForm()
    this.createLoginFrm()
    this.createForgotPasswordFrm()
    this.createOtpFrm()
    this.filterFormCreate()

    this.cookieUser = this.cookieService.getCookie('rememberme')
    this.industry()

    let contentTypesArr = ['Images', 'Charts', 'Statistics', 'Quotes']
    
    contentTypesArr.forEach(item => {
      this.addItem(item)
    })
  }

  industry(){
    this.userQueryService.industry()
      .pipe(take(1))
      .subscribe(res => {
      const { result } = res
      this.industryArr = result
    })
  }

  filterFormCreate(){
    this.filterForm = this.fb.group({
      contentTypes: this.fb.array([]),
      industryType: ['all', Validators.compose([Validators.required])]
    })
  }

  createItem(item): FormGroup { 
    return this.fb.group({
      name: item,
      isChecked: 0
    });
  }

  addItem(item): void {
    this.contentTypes = this.filterForm.get('contentTypes') as FormArray;
    this.contentTypes.push(this.createItem(item));
  }

  createOtpFrm(){
    this.otpfrm = this.fb.group({
      first: ["", Validators.compose([Validators.required])],
      second: ["", Validators.compose([Validators.required])],
      third: ["", Validators.compose([Validators.required])],
      fourth: ["", Validators.compose([Validators.required])]
    })
  }

  get otpF() { return this.otpfrm.controls }

  createForgotPasswordFrm(){
    this.forgotPasswordFrm = this.fb.group({
      email: ["", Validators.compose([Validators.required])]
    })
  }

  get forgotF() { return this.forgotPasswordFrm.controls }

  createSignupForm(){
    this.signupFrm = this.fb.group({
      name: ["", Validators.compose([Validators.required])],
      phone: ["", Validators.compose([Validators.required])],
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: ["", Validators.compose([Validators.required])],
      company_name: ["", Validators.compose([Validators.required])],
      designation: ["", Validators.compose([Validators.required])]
    })
  }

  get f() { return this.signupFrm.controls }

  createLoginFrm(){
    this.loginFrm = this.fb.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: ["", Validators.compose([Validators.required])]
    })

    this.loginFrm.get('email').setValue(this.cookieUser)
  }

  get loginF() { return this.loginFrm.controls }

  signup(){
    this.signupSubmitted = true
    const obj = {
      name: this.f.name.value,
      phone: this.f.phone.value,
      email: this.f.email.value,
      password: this.f.password.value,
      company_name: this.f.company_name.value,
      designation: this.f.designation.value
    }

    if(!this.signupFrm.invalid){
      this.userQueryService.signup(obj)
      .pipe(take(1))
      .subscribe(res => {
        const { message } = res
        this.signupSubmitted = false
        this.signupFrm.reset()
        this.userQueryService.messagePopup(message)
      }, err => {
        this.signupSubmitted = false
      })
    }else{
      console.log("Invalid")
      setTimeout( () => {
        this.signupSubmitted = false
      }, 5 * 1000 )
    }
  }

  login(){
    this.loginSubmitted = true
    const obj = {
      email: this.loginF.email.value,
      password: this.loginF.password.value
    }
    if(!this.loginFrm.invalid){
      this.userQueryService.login(obj)
      .pipe(take(1))
      .subscribe(res => {
        this.loginSubmitted = false
        
        const { result } = res
        const { token, name, email, phone, userId } = result
        localStorage.setItem("contentWizToken", JSON.stringify({token, name, email, phone, userId}))
        $('#signin').modal('toggle');
        this.router.navigateByUrl("/refreshhome")
        this.loginFrm.reset()
      }, err => {
        this.errMessage = err
        this.loginSubmitted = false
      })
    }else{
      console.log("Invalid")
      this.f.email.markAsTouched()
      this.f.password.markAsTouched()
      setTimeout( () => {
        this.loginSubmitted = false
      }, 5 * 1000 )
    }
  }

  forgotPassword(){
    this.forgotPasswordFlag = true
    const obj = {
      email: this.forgotF.email.value
    }

    this.userQueryService.forgotPassword(obj)
    .pipe(take(1))
    .subscribe(res => {
      const { message } = res
      this.forgotPasswordFlag = false
      this.forgotPasswordFrm.reset()
      this.userQueryService.messagePopup(message)
    }, err => {
      this.forgotPasswordFlag = false
    })
  }

  otpFrmSubmit(){
    let otp = this.otpF.first.value + this.otpF.second.value + this.otpF.third.value + this.otpF.fourth.value
    const obj = {
      otp
    }
  }

  triggerScrollTo(id) {
    const config: ScrollToConfigOptions = {
      target: id
    };
 
    this._scrollToService.scrollTo(config);
  }

  goto(type){
    this.router.navigateByUrl(type)
  }

  rememberMe(val){
    if(val) {
      let setVal = this.loginFrm.get('email').value || ''
      this.cookieService.setCookie('rememberme', setVal, 365, '/home')
    }else{
      this.cookieService.deleteCookie('rememberme')
    }
  }

  filter(){
    const obj = {
      contentTypes: this.filterForm.get('contentTypes').value,
      industryType: this.filterForm.get('industryType').value
    }

    const ob = JSON.stringify(obj)

    this.userQueryService.setFilter(ob)

    $(".close").click()
  }

}
