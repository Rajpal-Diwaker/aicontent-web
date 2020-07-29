import { Injectable } from '@angular/core';

@Injectable()
export class CookieService {
  public isConsented: boolean = false;
  constructor() { }

  getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

  deleteCookie(name) {
    this.setCookie(name, '', -1);
  }

  setCookie(name: string, value: string, expireDays: number, path: string = '') {
    let d: Date = new Date();
    d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
    let expires: string = `expires=${d.toUTCString()}`;
    let cpath: string = path ? `; path=${path}` : '';
    document.cookie = `${name}=${value}; ${expires}${cpath}`;
  }

  consent(isConsent: boolean, e: any) {
    if (!isConsent) {
        return this.isConsented;
    } else if (isConsent) {
        // this.setCookie(COOKIE_CONSENT, '1', COOKIE_CONSENT_EXPIRE_DAYS);
        this.isConsented = true;
        e.preventDefault();
    }
}
}
