import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap, catchError } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private webService: WebRequestService) { }

  addNewGame(body: Object){
    return this.webService.post(`games/addNewGame`, body).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  addGameOfDay(body: Object){
    return this.webService.post(`games/addGameOfDay`, body).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGamesByType(gameType: string) {
    return this.webService.get(`games?gameType=${gameType}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGameOfTheDay() {
    return this.webService.get(`games/day`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGamesOfDay() {
    return this.webService.get('games/gamesOfTheDay').pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  changeGameOfTheDay(id: string, payload: Object) {
    return this.webService.patch(`games/changeGameOfTheDay/${id}`, payload).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  updateResults(body: Object){
    return this.webService.post(`games/played`, body).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGame(gameType: string, _id: string){
    return this.webService.get(`games/single?gameType=${gameType}&id=${_id}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  getGeographyScore(terms: string){
    return this.webService.get(`geography?terms=${terms}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  sendUnknownGeographyTerms(terms: Array<string>, values: Array<string>){
    return this.webService.post(`geography/requests`, {
      types: terms,
      values: values
    }).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGeographyRequests() {
    return this.webService.get(`geography/requests`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  playGameOfDay(payload: Object){
    return this.webService.patch(`play`, payload).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  getGameOfDay(id: string){
    return this.webService.get(`game/${id}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  getScore(){
    return this.webService.get(`score`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of([err])))
    )
  }

  rejectTerm(id: string){
    return this.webService.delete(`geography/${id}`).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }

  verifyTerm(id: string, payload: Object){
    return this.webService.patch(`geography/${id}`, payload).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>)=>{
        return res;
      },
      catchError(err => of[err]))
    )
  }
}
