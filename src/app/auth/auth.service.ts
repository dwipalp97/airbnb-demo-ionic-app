import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _userIsAuthenticated = true;
  private _userId = 'def';

  constructor() { }

   get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }
  get userId() {
    return this._userId;
  } 

  logInUser(){
    this._userIsAuthenticated = true;
  }

  logOutUser(){
    this._userIsAuthenticated = false;
  }
}
