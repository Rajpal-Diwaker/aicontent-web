import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-refreshhome',
  templateUrl: './refreshhome.component.html',
  styleUrls: ['./refreshhome.component.css']
})
export class RefreshhomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.navigateByUrl("home")
  }

}
