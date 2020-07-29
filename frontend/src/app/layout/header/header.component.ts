import { Component, OnInit } from '@angular/core';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';
import { Options } from 'ng5-slider';
import { Router } from '@angular/router';
import { UserQueryService } from 'src/app/_services/user-query.service';
declare var $: any

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  options: Options = {
    floor: 0,
    ceil: 700
  };
  contentWizToken: any 
  userObj: any = {}
  constructor(private user: UserQueryService, private router: Router, private _scrollToService: ScrollToService) { }

  ngOnInit() {
    window.addEventListener('online',  () => {
      this.router.navigateByUrl("home")
    });
    window.addEventListener('offline', () => {
      this.router.navigateByUrl("no-internet")
    });
  
    this.user.setNoRecord(false)
    $('#myHeader').removeClass('fixed-header');
    $(window).scroll(function () {
      if ($(window).scrollTop() >= 40) {
        $('#myHeader').addClass('fixed-header');
      }
      else {
        $('#myHeader').removeClass('fixed-header');
      }
    });

    $('.navbar-toggle,.close-menu').on('click', function () {
      $('.navbar-default').toggleClass('active');
      $('html').toggleClass('menu_open');
    });
    let userObj = localStorage.getItem('contentWizToken')
    this.userObj = userObj? JSON.parse(userObj): {}
    
    this.contentWizToken = userObj? JSON.parse(userObj).token: undefined
  }

  triggerScrollTo(id) {
    this.router.navigateByUrl('home')
    const config: ScrollToConfigOptions = {
      target: id
    };

    this._scrollToService.scrollTo(config);
  }

  goto(type){
    this.router.navigateByUrl(type)
  }

  logout(){
    this.user.logout()
  }

}
