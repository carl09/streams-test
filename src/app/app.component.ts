import { Subject } from 'rxjs/Subject';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { WebSocketSubject, WebSocketSubjectConfig } from 'rxjs/observable/dom/WebSocketSubject';
import { AjaxObservable } from 'rxjs/observable/dom/AjaxObservable';

import 'rxjs/add/operator/map';

export class ChatService {
  public websocket: WebSocketSubject<any>;

  constructor() {

    const config: WebSocketSubjectConfig = {
      url: 'ws://localhost:5000',
    };

    this.websocket = WebSocketSubject.create(config);
  }

  public sendMessage(message: string) {
    this.websocket.next(message);
  }

  close() {
    this.websocket.complete(); // ?not sure
  }
}


export class ChatService22 {
  private url = 'ws://localhost:5000';
  private socket: Subject<MessageEvent>;

  constructor() {
    this.socket = this.create(this.url);
  }

  sendMessage(message) {
    this.socket.next(message);
  }

  getMessages(): Observable<any> {
    return this.socket.asObservable().map(x => x.data); ;
  }

  close() {
    this.socket.unsubscribe();
  }

  private create(url): Subject<MessageEvent> {
    const ws = new WebSocket(url);
    const observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      }
    );
    const observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      },
    };
    return Subject.create(observer, observable);
  }
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'app works!';
  public messages: Array<string>;
  private connection;
  public message;

  constructor(private chatService: ChatService) {
    this.messages = new Array<string>();
  }

  public sendMessage() {

    // const ajax = AjaxObservable.create('https://api.github.com/users/odetocode').subscribe(x => {
    //   console.log(x);
    // },
    //   (s) => console.log(s));



    this.chatService.sendMessage(this.message);
    this.message = '';
  }

  public ngOnInit() {
    this.connection = this.chatService.websocket.subscribe(message => {
      this.messages.push(message);
    });
  }

  public ngOnDestroy() {
    this.chatService.close();
  }
}
