import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileObj: any = {}
  constructor(private router: Router, private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.profile()
  }

  goto(type){
    if(type == 'user/edit' && this.profileObj) this.userQueryService.setProfile(this.profileObj)
    this.router.navigateByUrl(type)
  }

  profile(){
    this.userQueryService.profile()
    .pipe(take(1))
    .subscribe(res => {
      const { result } = res 
      this.profileObj = result
    })
  }

}
