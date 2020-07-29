import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { app_strings } from 'src/app/_helpers/constants';

@Component({
  selector: 'app-cnfrm-pwd',
  templateUrl: './cnfrm-pwd.component.html',
  styleUrls: ['./cnfrm-pwd.component.css']
})
export class CnfrmPwdComponent implements OnInit {
  confirmPasswordGrp: FormGroup
  confrmPasswordFlag: boolean = false
  token: any
  constructor(private router: Router, private fb: FormBuilder, 
    private activatedRoute: ActivatedRoute,
    private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.activatedRoute.queryParams
    .subscribe(params => {
      this.token = params['token']
      if(!this.token) this.router.navigateByUrl('/home')
      this.frmCreate()
    })
  }

  frmCreate(){
    this.confirmPasswordGrp = this.fb.group({
      password: ["", Validators.compose([Validators.required])],
      cnfrmPassword: ["", Validators.compose([Validators.required])]
    })
  }

  get f(){ return this.confirmPasswordGrp.controls }

  pwdSubmit(){
    if(this.f.password != this.f.cnfrmPassword){
      this.userQueryService.messagePopup(app_strings.PWD_DO_NOT_MATCH)
      return 
    }
    this.confrmPasswordFlag = true
    
    const obj = {
      password: this.f.password,
      token: this.token
    }

    this.userQueryService.cnfrmPassword(obj)
    .pipe(take(1))
    .subscribe(res => {
      this.confrmPasswordFlag = false
      const { message } = res
      this.userQueryService.messagePopup(message)
    }, err => {
      this.confrmPasswordFlag = false
    })
  }

  goto(type){
    this.router.navigateByUrl(type)
  }

}
