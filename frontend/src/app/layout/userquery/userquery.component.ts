import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserQueryService } from '../../_services/user-query.service'
import { take, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { app_strings } from 'src/app/_helpers/constants';
import { Options } from 'ng5-slider';
declare var $: any

@Component({
  selector: 'app-userquery',
  templateUrl: './userquery.component.html',
  styleUrls: ['./userquery.component.css']
})
export class UserqueryComponent implements OnInit, OnDestroy {
  userQueryForm: FormGroup
  langArr = []
  currentOffset: number = 0
  suggestionBoxFlag: boolean = false
  charLen: number = app_strings.MAX_LEN;
  options: Options = {
    floor: app_strings.MIN_LEN,
    ceil: app_strings.MAX_LEN
  };
  suggestionArr: any = []
  suggestionArrOther: any = []
  submitFlag: boolean = false
  perVar: number = 0
  article: object = {}
  contentWizToken: any 
  userObj: any = {}
  filterObj: any = {}
  config: any = {
    itemsPerPage: 4,
    currentPage: 1,
    totalItems: 1
  }

  summarizedArticle: any = {}
  constructor(private router: Router, 
    private fb: FormBuilder, 
    private userQueryService: UserQueryService) { }

  ngOnInit() {
    $(document).on('keypress',function(e) {
      if(e.which == 13 && $("#topic").is(":focus")) {
        $("#frmSubmit").click();
      }
    });
    this.userQueryFormCreate()
    this.userQueryForm.controls.topic.valueChanges
    .pipe(debounceTime(1000))
    .subscribe(val => {
      // this.topicSuggestions(val)
      localStorage.setItem("topicValue", val)
    })
    const topicValue = localStorage.getItem("topicValue")
    if(topicValue) this.userQueryForm.get('topic').setValue(topicValue)

    this.initLang()

    let userObj = localStorage.getItem('contentWizToken')
    this.userObj = userObj? JSON.parse(userObj): {}
    
    this.contentWizToken = userObj? JSON.parse(userObj).token: undefined
    const suggestionArr = localStorage.getItem("suggestionArr")

    if(suggestionArr){
      this.suggestionBoxFlag = true
      this.suggestionArr = JSON.parse(suggestionArr)
      this.config.totalItems = this.suggestionArr.length
    }

    this.userQueryService.getFilter()
    .subscribe(ob => {
      const obb = JSON.parse(ob)
      this.filterObj = obb
    })
  }

  pageChanged(event){
    this.config.currentPage = event;
  }

  topicSuggestions(item){
    this.userQueryService.topicSuggestions({topic: item})
      .pipe(take(1))
      .subscribe(res => {
        console.log(res.results, "res.results")
      })
  } 

  initLang() {
    this.userQueryService.language()
      .pipe(take(1))
      .subscribe(res => {
        const { result } = res
        this.langArr = result
        setTimeout(() => {
          $("#targetLang").val($("#targetLang option:first").val());
        }, 0.5 * 1000)
      })
  }

  userQueryFormCreate() {
    this.userQueryForm = this.fb.group({
      lang: ['en'],
      topic: ['', Validators.compose([Validators.required])]
    })
  }

  get lang() { return this.userQueryForm.get('lang').value }
  get topic() { return this.userQueryForm.get('topic').value }

  startLoader() {
    this.perVar = 10
    this.userQueryService.setLoaderPercentage(this.perVar)
    $("body").addClass("loader-active")
    let min = 5;
    let max = 20;
    var random = Math.floor(Math.random() * (+max - +min)) + +min;

    let timer = setInterval(() => {
      if (this.perVar / 10 <= 9.9)
        this.perVar += random
      if(this.perVar>99){
        this.perVar = 99
      }  
      this.userQueryService.setLoaderPercentage(this.perVar)
    }, 5 * 1000)

    return timer
  }

  stopLoader(timer){
    clearTimeout(timer);
    this.perVar = 0
    this.userQueryService.setLoaderPercentage(this.perVar)
    $("body").removeClass("loader-active")
  }

  userQuerySubmit() {
    if (!this.topic) {
      this.userQueryService.messagePopup(app_strings.PLEASE_ENTER_TOPIC)
      return
    }
    let topic = this.topic.match(/\S+/g).join(" ") || ''
    
    topic = topic.toLowerCase()
    this.suggestionBoxFlag = false
    this.submitFlag = true

    const obj = {
      topic,
      flag: 'yes',
      userId: this.userObj.userId 
    }

    this.userQueryService.myArticles(obj)
      .pipe(take(1))
      .subscribe(res => {
        const { result } = res
        this.submitFlag = false

        let suggestionObj = { topic }
     
        if (result && result.length > 0){
          this.suggestionArrOther = [{id: 0, topic}, ...result]
          this.suggestionArr = [{id: 0, topic}]
        }else{
          this.suggestionArr = [suggestionObj]
        }

        this.config.totalItems = this.suggestionArr.length

        localStorage.setItem("suggestionArr", JSON.stringify(this.suggestionArr))

        this.suggestionBoxFlag = true
      })
  }

  callOtherFunc(obbb){
    let {item, timer, nameArr} = obbb
    let introArr = [], bodyArr = [], conclusionArr = []
    
    this.suggestionArrOther.forEach(ob => {
      const { introduction, body, conclusion, data_points } = ob 

      if(introduction) introArr.push(introduction)
      if(body) bodyArr.push(body)
      if(data_points) bodyArr.push(data_points)
      if(conclusion) conclusionArr.push(conclusion)
    })
    const reqBody = {intro: introArr.join("\n"), body: bodyArr.join("\n"), conclusion: conclusionArr.join("\n"), userQuery: (item.topic || this.topic), contentTypes: nameArr, charLen: ((this.charLen<=app_strings.MAX_LEN && this.charLen>=(app_strings.MAX_LEN-100))? 'max': 'other')}
   
    new Promise((resolve, reject) => {
      this.userQueryService.summaryArticle(reqBody)
      .pipe(take(1))
      .subscribe(res => {
        resolve(res.results)
      }, err => {
        reject(err)
      })
    }).then(result => {
      const { body, conclusion, introduction, statistics, images }: any = result
      this.article = { body, conclusion, introduction, statistics, images }
      const articleObj = { topic: (item.topic || this.topic), lang: this.lang, industry: (this.filterObj.industryType || "all") }
      this.moveToArticle(articleObj, timer)
  
    }).catch(errr => {
      this.stopLoader(timer);
    })
  }

  articleBot(item) {
    if(!this.contentWizToken){
      $('#signup').modal('show');
      return
    }
    localStorage.removeItem("topicValue")
    this.suggestionBoxFlag = false
    let timer = this.startLoader()

    let nameArr = []
    if(this.filterObj.contentTypes){
      this.filterObj.contentTypes.forEach(element => {
        const { isChecked, name } = element
        if(isChecked){
          nameArr.push(name)
        }
      });
    }

    if(item.id == 0){
      const obb = {item, timer, nameArr}
      this.callOtherFunc(obb)
      return
    }

    const obj = {
      topic: (item.topic || this.topic),
      contentTypes: nameArr,
      industryType: (this.filterObj.industryType || "all"),
      lang: this.lang
    }
 
    this.userQueryService.userQuery(obj)
      .pipe(take(1))
      .subscribe(res => {
        const { statistics, images, introduction, tweetList } = res.results[0]  
        
        let arr = [], conclusionn = ""
        res.results.forEach(element => {
          const { text, conclusion } = element
          conclusionn = conclusion
          arr.push(text)
        })

        if(item.body){
          this.article = { statistics, body: item.body, conclusion: item.conclusion, images, introduction: item.introduction, quote: tweetList[0] }
        }else{
          this.article = { statistics, body: arr.join("\n"), conclusion: conclusionn, images, introduction, quote: tweetList[0] }
        }

        const articleObj = { topic: (item.topic || this.topic), lang: this.lang, industry: obj.industryType }
        this.moveToArticle(articleObj, timer)
      }, err => {
        this.stopLoader(timer);
        this.submitFlag = false
        this.userQueryService.messagePopup(app_strings.NO_SAID_TOPIC)
      })
  }

  moveToArticle(articleObj, timer){
    if(!articleObj) return

    if(!this.article['body']){
      this.userQueryService.messagePopup(app_strings.NO_SAID_TOPIC)
      return
    }

    this.userQueryService.setArticleState(JSON.stringify(this.article))
    articleObj['charLen'] = this.charLen
    this.userQueryService.setArticleObj(articleObj)
    this.stopLoader(timer);
    this.router.navigateByUrl('article/review')
  }

  togglesuggestionBoxFlag() {
    this.suggestionBoxFlag = !this.suggestionBoxFlag
  }

  removeFilter(item){
    const { name } = item 
    this.filterObj.contentTypes.forEach((element, i) => {
      if(element.name == name){
        delete this.filterObj.contentTypes[i]
      }
    })
  }

  ngOnDestroy(){
    localStorage.removeItem("suggestionArr") 
  }

}
