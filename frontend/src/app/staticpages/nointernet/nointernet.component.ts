import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nointernet',
  templateUrl: './nointernet.component.html',
  styleUrls: ['./nointernet.component.css']
})
export class NointernetComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  refresh(){
    //this.router.navigateByUrl("/home")
  }

}
