import { Component, OnInit } from '@angular/core';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transactionsList: any = []
  constructor(private userQueryService: UserQueryService) { }

  ngOnInit() {
  }

  transactions(){
    this.userQueryService.transactions()
    .pipe(take(1))
    .subscribe(res => {
      const { code, message, result } = res 
      this.transactionsList = result  
    })
  }

  downloadReceipt(){
    this.userQueryService.downloadReceipt()
    .pipe(take(1))
    .subscribe(res => {
    })
  }

}
