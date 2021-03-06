import {Injectable} from "@angular/core";
import {ApiService} from "./api.service";
import {Observable} from "rxjs";
import {Ticket} from "../models/ticket.model";

const tickets : string = 'tickets';

@Injectable()
export class TicketService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<Ticket[]> {
    return this.apiService.get(`/${tickets}/`);
  }

  getById(slug: any): Observable<Ticket> {
    return this.apiService.get(`/${tickets}/${slug}`);
  }

  getBySeanceId(slug: any): Observable<Ticket[]> {
    return this.apiService.get(`/${tickets}/seance/${slug}`);
  }
}
