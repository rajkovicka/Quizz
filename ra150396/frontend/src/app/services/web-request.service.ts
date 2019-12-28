import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL;

  constructor(private http: HttpClient) { 
    this.ROOT_URL = 'http://localhost:3000';
  }

  get(uri: string) {
    return this.http.get(`${this.ROOT_URL}/${uri}`).pipe(
      catchError(err => of([err]))
    );
  }

  getWithBody(uri: string, payload: Object) {
    return this.http.get(`${this.ROOT_URL}/${uri}`, payload).pipe(
      catchError(err => of([err]))
    );
  }

  post(uri: string, payload: Object) {
    return this.http.post(`${this.ROOT_URL}/${uri}`, payload).pipe(
      catchError(err => of([err]))
    );
  }

  patch(uri: string, payload: Object) {
    return this.http.patch(`${this.ROOT_URL}/${uri}`, payload).pipe(
      catchError(err => of([err]))
    );
  }

  delete(uri: string){
    return this.http.delete(`${this.ROOT_URL}/${uri}`).pipe(
      catchError(err => of([err]))
    );;
  }

  login(email: string, password: string){
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email,
      password
    }, {
      observe: 'response'
    }).pipe(
      catchError(err => of([err]))
    );
  }

  signup(user: User){
    return this.http.post(`${this.ROOT_URL}/users`, user, {
      observe: 'response'
    });
  }

  upload(file: File){
    const fd = new FormData();
    fd.append('picture', file);
    return this.http.post(`${this.ROOT_URL}/uploadphoto`, fd, {
      observe: 'response'
    });
  }
}
