import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactFrm: FormGroup;
  submitted: boolean = false
  constructor(private fb: FormBuilder,
     private userService: UserQueryService) { }

  ngOnInit() {
    this.contactFrmCreate()
  }

  contactFrmCreate(){
    this.contactFrm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.pattern(/^[a-zA-z ]{1,30}$/)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      subject: ['', Validators.compose([Validators.required])],
      message: ['', Validators.compose([Validators.required])]
    })
  }

  get f() { return this.contactFrm.controls; }
  get name(){ return this.contactFrm.get('name').value }
  get email(){ return this.contactFrm.get('email').value }
  get subject(){ return this.contactFrm.get('subject').value }
  get message(){ return this.contactFrm.get('message').value }

  contactSubmit(){
    this.submitted = true
    if(!this.contactFrm.invalid){
      const obj = {
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message
      }

      this.userService.contact(obj)
      .pipe(take(1))
      .subscribe(res => {
        const { message } = res
        this.submitted = false
        this.contactFrm.reset()
        this.userService.messagePopup(message)
      }, err => {
        this.submitted = false
      })
    }else{
      console.log("Invalid")
      setTimeout( () => {
        this.submitted = false
      }, 5 * 1000 )
    }
  }

}
