import {Observable} from "rxjs";

export interface AppPage { // kind of like a route, but only pages
  title: string;
  url: string;
  icon: string;
  state?: {[p: string]: any} | undefined; // rn this is just the mode actually (input & output)
  totalProgress$?: Observable<number>;
}
