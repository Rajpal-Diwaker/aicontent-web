import { Component, OnInit } from '@angular/core';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-myarticles',
  templateUrl: './myarticles.component.html',
  styleUrls: ['./myarticles.component.css']
})
export class MyarticlesComponent implements OnInit {
  userObj: any = {}
  myArticlesArr: any = []
  myArticlesArrBkup: any = []
  constructor(private userQueryService: UserQueryService) { }

  ngOnInit() {
    let user = localStorage.getItem('contentWizToken')
    this.userObj = user? JSON.parse(user): {}
    this.myArticles()  
  }

  myArticles(){
    if(!this.userObj) return
    let userId = this.userObj.userId  
    this.userQueryService.myArticles({userId})
    .pipe(take(1))
    .subscribe(res => {
      const { result } = res 
      if(result.length>0){
        this.userQueryService.setNoRecord(false)
      }
      this.myArticlesArr = result
      this.myArticlesArrBkup = this.myArticlesArr
    })
  }

  localSearch(searchTxt){
    if(!searchTxt) {
      this.userQueryService.setNoRecord(false)
      this.myArticlesArr = this.myArticlesArrBkup
      return
    }

    this.myArticlesArr = this.myArticlesArrBkup.filter(obj => obj.topic.toLowerCase().indexOf(searchTxt.toLowerCase()) >= 0 )

  }

  download(item){
   const { id } = item
   const obj = { id }
   
   this.userQueryService.downloadReceipt(obj)
   .pipe(take(1))
   .subscribe(res => {
     const { result } = res 
     const { type, data } = result

     if(type=='Buffer'){
       let dta = data.toString('base64')
       this.userQueryService.download(dta, "article", "application/pdf", "pdf")
     }
    })
  }

}
