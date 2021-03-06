import {Injectable} from "@angular/core";
import {ApiService} from "./api.service";
import {BehaviorSubject, distinctUntilChanged, map, Observable, ReplaySubject} from "rxjs";
import {User} from "../models/user.model";
import { HttpClient, HttpParams } from "@angular/common/http";
import {JwtService} from "./jwt.service";

const users : string = 'users';

@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/users/user')
        .subscribe(
          user => {
            user.token = this.jwtService.getToken();
            this.setAuth(user)
          },
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.token);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type, credentials): Observable<User> {
    const route = (type === 'login') ? '/login' : '/register';
    return this.apiService.post('/users' + route, credentials)
      .pipe(map(
        data => {
          this.setAuth(data);
          return data;
        }
      ));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  // Update the user on the server (email, pass, etc)
  update(user): Observable<User> {
    return this.apiService
      .patch('/users/update', user)
      .pipe(map(data => {
        // Update the currentUser observable
        this.currentUserSubject.next(data);
        return data;
      }));
  }


  getAll(): Observable<User[]> {
    return this.apiService.get(`/${users}/`);
  }

  getById(slug: any): Observable<User> {
    return this.apiService.get(`/${users}/${slug}`);
  }

  getAvatar(): Observable<Blob> {
    return this.apiService.getImage(`/${users}/avatar/`);
  }

  setAvatar(file): Observable<any> {
    return this.apiService.uploadFileToUrl('avatar', file, `/${users}/avatar/`);
  }

}
