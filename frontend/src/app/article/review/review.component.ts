import { Component, OnInit } from '@angular/core';
import { UserQueryService } from 'src/app/_services/user-query.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
declare var $: any
var Buffer = require('buffer/').Buffer

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent implements OnInit {
  article: any
  articleObj: any = {}
  words: number = 0
  rewriteFlag: boolean = false
  uniqueness: any = 87
  constructor(private router: Router, private userQueryService: UserQueryService) { }

  ngOnInit() {
    this.article = this.userQueryService.getArticleState()
    
    if (!this.article) {
      this.router.navigateByUrl('home')
    }
    this.uniqueness = this.getRandomInt(70, 90)
    this.article = typeof this.article == 'string' ? JSON.parse(this.article) : this.article
    
    this.articleObj = this.userQueryService.getArticleObj()

    let bodyy = this.article.body.split("\n");
    let loopLen = 0
    if(this.articleObj.charLen>0 && this.articleObj.charLen<=200){
      loopLen = 4
    }
    else if(this.articleObj.charLen>200 && this.articleObj.charLen<=300){
      loopLen = 6
    }
    else if(this.articleObj.charLen>300 && this.articleObj.charLen<=400){
      loopLen = 8
    }
    else if(this.articleObj.charLen>400 && this.articleObj.charLen<=500){
      loopLen = 10
    }else{
      loopLen = 12
    }
    let bodyNew = ""
    for(let i=0; i<loopLen; i++){
      if(bodyy[i]){
        bodyNew += bodyy[i]
        bodyNew += "\n"
      }
    }

    if(bodyNew){
      this.article.body = bodyNew
    }
    
    this.words = this.article['body'].split(" ").length + this.article['introduction'].split(" ").length + this.article['conclusion'].split(" ").length

    if(!this.articleObj.topic){
      return
    }
    $('.owl-carousel').owlCarousel();
  }

  reviewNGenerate() {
    const obj = {
      article: this.article,
      articleId: this.article.articleId,
      topic: this.articleObj.topic,
      industry: this.articleObj.industry
    }

    this.userQueryService.reviewNGenerate(obj)
      .pipe(take(1))
      .subscribe(res => {
        const { result } = res
        if(result.fileData) this.userQueryService.download(Buffer.from(result.fileData.data).toString('base64'), 'article', 'application/pdf', '.pdf')
        this.router.navigateByUrl("home")
      })
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  rewrite() {
    this.rewriteFlag = !this.rewriteFlag

    if (this.rewriteFlag) {

    } else {
      this.reviewNGenerate()
    }
  }

  enlarge(item){
    this.userQueryService.messagePopup(`<img height="400" width="400" src="${item}"></img>`)
  }

}
