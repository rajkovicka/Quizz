import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import { shareReplay, tap, catchError, share } from 'rxjs/operators';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private webService: WebRequestService, private router: Router, private http: HttpClient) { }

  login(email: string, password: string){
    return this.webService.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        //the auth tokens are in the header
        if(res[0] !== undefined){
          return;
        }
        this.setSession(res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token'),
          res.headers.get('role')
        );
        this.router.navigate(['/dashboard']);
      },
      catchError(err => of([err]))
      )
    )
  }

  forgotPassword(username: string, jmbg: string){
    return this.webService.get(`users/forgotPassword?username=${username}&jmbg=${jmbg}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  setNewPassword(_id: string, password: string, securityQuestion: string, securityAnswer: string){
    return this.webService.patch(`users/forgotPassword/${_id}`, {
      password,
      securityQuestion,
      securityAnswer
    }).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  changePassword(payload: Object){
    return this.webService.patch(`users/changePassword`, payload).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  signup(user: User){
    return this.webService.signup(user).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        //the auth tokens are in the header
        const message = res.body.message;
        if(!message){
          this.router.navigate(['/login']);
        }
      })
    )
  }

  logout(){
    this.removeSession();
    this.router.navigate(['/home']);
    document.location.reload();
  }

  getAccessToken(){
    return localStorage.getItem('x-access-token');
  }

  setAccessToken(accessToken: string){
    localStorage.setItem('x-access-token', accessToken);
  }

  getRefreshToken(){
    return localStorage.getItem('x-refresh-token');
  }

  setRefreshToken(refreshToken: string){
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  getUserId(){
    return localStorage.getItem('user-id');
  }

  getUserRole() {
    return localStorage.getItem('role');
  }

  private setSession(userId: string, accessToken: string, refreshToken: string, role: string){
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
    localStorage.setItem('role', role);
  }

  private removeSession(){
    localStorage.clear();
  }

  getNewAccessToken(){
    return this.http.get(`${this.webService.ROOT_URL}/users/me/access-token`, {
      headers: {
        'x-refresh-token': this.getRefreshToken(),
        '_id': this.getUserId()
      },
      observe: 'response'
    }).pipe(
      tap((res: HttpResponse<any>)=>{
        this.setAccessToken(res.headers.get('x-access-token'));
      })
    )
  }

}
