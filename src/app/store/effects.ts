import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import {catchError, map, mergeMap, of, switchMap} from 'rxjs';
import { DataService } from '../services/data.service';
import {
  deleteLocation,
  deleteLocationFailure,
  deleteLocationSuccess,
  loadAppStateFromDatabase,
  loadAppStateFromDatabaseFailure,
  loadAppStateFromDatabaseSuccess,
  resetProgress,
  resetProgressFailure,
  resetProgressSuccess,
  updateLocationProgress,
  updateLocationProgressFailure,
  updateLocationProgressSuccess,
} from './actions';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AppEffects {
  failure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        loadAppStateFromDatabaseFailure,
        updateLocationProgressFailure,
        deleteLocationFailure,
        resetProgressFailure
      ),
      switchMap((error) => {
        this.failureToast(error).catch(console.error);
        return of({ type: 'ERROR IN EFFECT' });
      })
    )
  );
  //----------------------------------------------------------------------------------------------------------------------
  loadAppStateFromDatabase$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAppStateFromDatabase),
      mergeMap(() => {
        return this.dataService.getLocationArrays$().pipe(
          map((locationArrays) =>
            loadAppStateFromDatabaseSuccess({ locationArrays })
          ),
          catchError((error) => of(loadAppStateFromDatabaseFailure({ error })))
        );
      })
    )
  );
  updateLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateLocationProgress),
      mergeMap(({ location, modeIndex }) =>
        this.dataService.setLocation$(location, modeIndex).pipe(
          map(() => updateLocationProgressSuccess({ location, modeIndex })),
          catchError((error) => of(updateLocationProgressFailure(error)))
        )
      )
    )
  );
  deleteLocation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteLocation),
      mergeMap(({ location, modeIndex }) =>
        this.dataService.deleteLocation$(location, modeIndex).pipe(
          map(() => deleteLocationSuccess({ location, modeIndex })),
          catchError((error) => of(deleteLocationFailure(error)))
        )
      )
    )
  );
  resetProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resetProgress),
      mergeMap(({ modeIndex }) =>
        this.dataService.resetProgress$(modeIndex).pipe(
          map((locationArrays) =>
            resetProgressSuccess({
              locationArray: locationArrays[modeIndex],
              modeIndex,
            })
          ),
          catchError((error) => of(resetProgressFailure(error)))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dataService: DataService,
    private toastController: ToastController
  ) {}

  private async failureToast(error: any): Promise<void> {
    console.log('✅', error);
    const toast = await this.toastController.create({
      message: error.message,
      duration: 3000,
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          handler: () => {
            console.log('Dismiss clicked');
          },
        },
      ],
    });

    await toast.present();
    const { role } = await toast.onDidDismiss();
    console.log(role);
  }
}
