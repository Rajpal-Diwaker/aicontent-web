import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  editProfile: FormGroup
  previewSrc: any = 'thumbnail.png'
  profile: any = {}
  keysFrm: any = ['name', 'email', 'phone', 'company', 'designation', 'address']
  file: any
  constructor(private fb: FormBuilder, private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.editProfileFrmCreate()
    this.profileData()
  }

  profileData(){
    this.profile = this.userQueryService.getProfile()

    for(let key in this.profile){
      const val = this.profile[key]
      
      if(this.keysFrm.indexOf(key)>=0) this.editProfile.get(key).setValue(val)
    }
  }

  editProfileFrmCreate(){
    this.editProfile = this.fb.group({
      name: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required])],
      phone: ['', Validators.compose([Validators.required])],
      company: ['', Validators.compose([Validators.required])],
      designation: ['', Validators.compose([Validators.required])],
      address: ['', Validators.compose([Validators.required])]
    })
  }

  get f(){ return this.editProfile.controls }

  editProfileFrmSubmit(){ 
    const fd = new FormData()
    
    if(this.file) fd.append('userpic', this.file)

    fd.append('name', this.f.name.value)
    fd.append('email', this.f.email.value)
    fd.append('phone', this.f.phone.value)
    fd.append('company', this.f.company.value)
    fd.append('designation', this.f.designation.value)
    fd.append('address', this.f.address.value)

    this.userQueryService.editProfile(fd)
    .pipe(take(1))
    .subscribe(res => {

    })
  }

  preview(e){
    const file = e.target.files[0]
    this.file = file
    const reader = new FileReader()

    reader.onload = () => {
      this.previewSrc = reader.result;
    }

    if(file)
      reader.readAsDataURL(file)
  }

}
