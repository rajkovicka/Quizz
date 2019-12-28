import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { HttpResponse } from '@angular/common/http';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private web: WebRequestService) { }

  getTop() {
      return this.web.get(`users/top`).pipe(
        shareReplay(),
        tap((res: HttpResponse<any>)=>{
          return res;
        },
        catchError(err => of[err]))
      )
  }

  getTopHome() {
    return this.web.get(`top`).pipe(
        shareReplay(),
        tap((res: HttpResponse<any>)=>{
          return res;
        },
        catchError(err => of[err]))
      )
  }
}
