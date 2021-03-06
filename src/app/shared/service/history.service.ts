import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private URL = 'https://analysis-history.gigalixirapp.com/history/v1/';
    constructor( private http: HttpClient){}

    getHistory(){
        return this.http.get(this.URL);
    }
}
