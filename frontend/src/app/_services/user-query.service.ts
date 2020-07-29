import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import Swal from 'sweetalert2'
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class UserQueryService {
  noAuthHeader = { headers: new HttpHeaders({ 'NoAuthOther': 'True' }) };
  article: string = ''
  articleObj: any = {}
  profileObj: any = {}
  noRecord: BehaviorSubject<any> = new BehaviorSubject(false)
  loaderPercentage: BehaviorSubject<any> = new BehaviorSubject(0)
  filter: BehaviorSubject<any> = new BehaviorSubject(JSON.stringify({}))
  constructor(private http: HttpClient, private router: Router) { }

  isAuthenticated() {
    let userObj = localStorage.getItem('contentWizToken')
    return userObj ? JSON.parse(userObj).token : undefined
  }

  userQuery(obj): Observable<any> {
    return this.http.post(environment.pythonBaseUrl + 'userQuery', obj, this.noAuthHeader)
  }

  topicSuggestions(obj): Observable<any> {
    return this.http.post(environment.pythonBaseUrl + 'topicSuggestions', obj, this.noAuthHeader)
  }

  summaryArticle(obj): Observable<any> {
    return this.http.post(environment.pythonBaseUrl + 'summaryArticle', obj, this.noAuthHeader)
  }

  contact(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/contact', obj, this.noAuthHeader)
  }

  signup(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/signup', obj, this.noAuthHeader)
  }

  login(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/login', obj, this.noAuthHeader)
  }

  forgotPassword(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/forgotPassword', obj, this.noAuthHeader)
  }

  reviewNGenerate(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/reviewNGenerate', obj)
  }

  myArticles(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/getArticles', obj, this.noAuthHeader)
  }

  plan(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/plan', obj, this.noAuthHeader)
  }

  profile(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/profile', obj)
  }

  editProfile(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/editProfile', obj)
  }

  transactions(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/transaction', obj)
  }

  downloadReceipt(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/downloadReceipt', obj)
  }

  cnfrmPassword(obj): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/cnfrmPassword', obj)
  }

  language(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/languages', obj, this.noAuthHeader)
  }

  industry(obj = {}): Observable<any> {
    return this.http.post(environment.baseUrl + '/user/industry', obj, this.noAuthHeader)
  }

  setProfile(obj) {
    this.profileObj = obj
  }

  getProfile() {
    return this.profileObj
  }

  setArticleState(article = '') {
    this.article = article
  }

  getArticleState() {
    return this.article
  }
  
  setArticleObj(articleObj) {
    this.articleObj = articleObj
  }

  getArticleObj() {
    return this.articleObj
  }

  logout() {
    const ob = { title: 'Do you want to logout?', btnText: 'Logout' }
    this.confirmBox(ob)
    .then((result) => {
      if (result.value) {
        localStorage.setItem('contentWizToken', JSON.stringify({}))
        this.router.navigateByUrl("refreshhome")
      }
    })
  }

  messagePopup(msg = '') {
    if (!msg) return
    Swal.fire(msg)
  }

  confirmBox(obj){
    const { title, btnText } = obj

    if(!title || !btnText){
      return
    }

    return Swal.fire({
      title: title,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: btnText
    })
  }

  setNoRecord(flag=true){
    this.noRecord.next(flag)
  }

  getNoRecord(){
    return this.noRecord
  }

  internetCheck(){
    return navigator.onLine
  }

  setLoaderPercentage(per){
    this.loaderPercentage.next(per)
  }

  getLoaderPercentage(){
    return this.loaderPercentage
  }

  setFilter(ob){
    this.filter.next(ob)
  }

  getFilter(){
    return this.filter
  }

  ibmKnowlegdeQuery(q){
    if(!q) return
    const url = `https://api.us-east.discovery.watson.cloud.ibm.com/instances/a607376e-f525-41dd-ba40-d49dc3cfaa97/v1/environments/system/collections/news-en/query?version=2018-12-03&deduplicate=false&highlight=true&passages=true&passages.count=5&natural_language_query=${q}`  
  }

  b64toBlob(b64Data, contentType='', sliceSize=512) { console.log(b64Data);
  
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  download(buffer, fileName, TYPE, EXTENSION) {
    const blob = this.b64toBlob(buffer, TYPE);
    const blobUrl = URL.createObjectURL(blob);
    
    FileSaver.saveAs(blobUrl, fileName + '_export_' + new Date().getTime() + EXTENSION);
  }

}
