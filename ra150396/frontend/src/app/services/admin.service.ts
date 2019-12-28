import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private webService: WebRequestService) { }

  getUnverified(){
    return this.webService.get(`users/unverified`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  verifyUser(id: string){
    return this.webService.patch(`users/verify/${id}`, {}).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  rejectUser(id: string){
    return this.webService.patch(`users/reject/${id}`, {}).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }
}
