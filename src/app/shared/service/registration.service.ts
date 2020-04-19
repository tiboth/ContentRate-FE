import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {User} from '../model/user';
import {Token} from '../model/token';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  private baseUrl = 'http://localhost:4000';
  private authorizationHeader: HttpHeaders;

  constructor(private http: HttpClient) {
    const currentUser = localStorage.getItem('currentUser');
    const token: Token = JSON.parse(currentUser).jwt;
    this.authorizationHeader = new HttpHeaders().set('Authorization', 'Bearer ' + token);
  }

  register(user: User) {
    const username = user.username;
    const password = user.password;
    const password_confirmation = user.password_confirmation;
    // tslint:disable-next-line:variable-name
    const first_name = user.first_name;
    // tslint:disable-next-line:variable-name
    const last_name = user.last_name;
    const email = user.email;
    console.log('registering user:' + last_name + ', ' + first_name);
    // tslint:disable-next-line:max-line-length
    return this.http.post(`${this.baseUrl}/userApi/v1/sign_up`, {user: {email, first_name, last_name, username, password, password_confirmation}});
  }

  update(user: User) {
    const username = user.username;
    const password = user.password;
    const password_confirmation = user.password_confirmation;
    // tslint:disable-next-line:variable-name
    const first_name = user.first_name;
    // tslint:disable-next-line:variable-name
    const last_name = user.last_name;
    const email = user.email;
    const options = {headers: this.authorizationHeader};

    return this.http.put(`${this.baseUrl}/userApi/v1/update`,
      {user: {email, first_name, last_name, username, password, password_confirmation}},
      options);
  }

  getUser(): Observable<User> {
    const options = {headers: this.authorizationHeader};
    return this.http.get<User>(`${this.baseUrl}/userApi/v1/my_user`, options);
  }
}
