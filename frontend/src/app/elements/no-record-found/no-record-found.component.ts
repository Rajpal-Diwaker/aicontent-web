import { Component, OnInit } from '@angular/core';
import { UserQueryService } from 'src/app/_services/user-query.service';

@Component({
  selector: 'no-record-found',
  templateUrl: './no-record-found.component.html',
  styleUrls: ['./no-record-found.component.css']
})
export class NoRecordFoundComponent implements OnInit {

  constructor(private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.userQueryService.setNoRecord()
  }

}
