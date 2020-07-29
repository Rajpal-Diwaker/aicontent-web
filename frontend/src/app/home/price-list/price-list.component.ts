import { Component, OnInit } from '@angular/core';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css']
})
export class PriceListComponent implements OnInit {
  priceList: any = []
  constructor(private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.priceListFunc()
  }

  priceListFunc(){
    this.userQueryService.plan()
    .pipe(take(1))
    .subscribe(res => {
      const { result } = res 
      this.priceList = result
    })
  }

  freeTrial(plan){
    switch(plan){
      case 1:
      break;
      case 2:
      break;
      case 3: 
      break;
      default:
      break;
    }
  }

}
