import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { initialLocationArray } from '../data/data';
import { Location } from '../types/location';
import { UTIL } from '../util';
import {
  BehaviorSubject,
  filter,
  from,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';

const LOCATION_ARRAYS = 'LOCATION_ARRAYS';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private storageReady$ = new BehaviorSubject(false);

  constructor(private storage: Storage) {}

  public async initDatabase(): Promise<void> {
    await this.storage.defineDriver(CordovaSQLiteDriver);
    await this.storage.create();
    const locations = await this.storage.get(LOCATION_ARRAYS);
    if (!locations) {
      await this.storage.set(LOCATION_ARRAYS, [
        UTIL.clone(initialLocationArray),
        UTIL.clone(initialLocationArray),
        UTIL.clone(initialLocationArray),
        UTIL.clone(initialLocationArray),
        UTIL.clone(initialLocationArray),
        UTIL.clone(initialLocationArray),
      ]);
    }
    this.storageReady$.next(true);
  }

  /**
   * Only used to initialize the AppState, such that the user can see progress on each mode when starting the app
   * again after having already played
   */
  public getLocationArrays$(): Observable<Location[][]> {
    return this.storageReady$.pipe(
      filter((ready) => ready),
      switchMap(
        (_) =>
          from(this.storage.get(LOCATION_ARRAYS)) ||
          throwError(() => 'Fatal error: got undefined from from')
      )
    );
  }

  /**
   * all the switching here:
   *
   * boolean=>currentLocations(now make the DB-call with currentLocations)=>DB-call-response
   */
  public setLocation$(
    location: Location,
    modeIndex: number
  ): Observable<Location[][]> {
    return this.storageReady$.pipe(
      filter((ready) => ready),
      switchMap((_) =>
        /*
        Why switchMap is used here above this line:
          It's just a safety measure. In case that in the future the storageReady$ emits a value again,
          we would want to cancel the old setLocation$ subscription.

          Additionally, the DB-calls are actually a single-time emit observable, which makes it all even more redundant.

          SO: Map would work too, you would just have to figure out some issues with mapping Promise->Value->Observable.
         */
        this.getLocationArrays$().pipe(
          switchMap((locationArrays) => {
            const locationIndex = location.id - 1;
            locationArrays[modeIndex][locationIndex] = location;
            return from(this.storage.set(LOCATION_ARRAYS, locationArrays));
          })
        )
      )
    );
  }

  public deleteLocation$(
    location: Location,
    modeIndex: number
  ): Observable<Location[][]> {
    return this.storageReady$.pipe(
      filter((ready) => ready),
      switchMap((_) =>
        this.getLocationArrays$().pipe(
          switchMap((locationArrays) => {
            const locationIndex = location.id - 1;
            locationArrays[modeIndex].splice(locationIndex, 1);
            return from(this.storage.set(LOCATION_ARRAYS, locationArrays));
          })
        )
      )
    );
  }

  public resetProgress$(modeIndex: number): Observable<Location[][]> {
    return this.storageReady$.pipe(
      filter((ready) => ready),
      switchMap((_) =>
        this.getLocationArrays$().pipe(
          switchMap((locationArrays) => {
            locationArrays[modeIndex].forEach(location => location.progress = 0);
            return from(this.storage.set(LOCATION_ARRAYS, locationArrays));
          })
        )
      )
    );
  }
}
