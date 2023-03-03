import { createAction, props } from '@ngrx/store';
import { Location } from '../types/location';

export const loadAppStateFromDatabase = createAction(
  '[DB] loadAppStateFromDatabase'
);

export const loadAppStateFromDatabaseSuccess = createAction(
  '[App] loadAppStateFromDatabaseSuccess',
  props<{ locationArrays: Location[][] }>()
);

export const loadAppStateFromDatabaseFailure = createAction(
  '[App] loadAppStateFromDatabaseFailure',
  props<{ error: any }>()
);

/**
 * Updates location in the currently played mode
 */
export const updateLocationProgress = createAction(
  '[DB] updateLocationProgress',
  props<{ location: Location; modeIndex: number }>()
);

/**
 * Eventually this will be by id and will take in a number of how hard to increase the progress (when streaks count!)
 *
 * Updates location in the currently played mode
 */
export const updateLocationProgressSuccess = createAction(
  '[App] updateLocationProgressSuccess',
  props<{ location: Location; modeIndex: number }>()
);

export const updateLocationProgressFailure = createAction(
  '[App] updateLocationProgressFailure',
  props<{ error: any }>()
);

export const deleteLocation = createAction(
  '[DB] deleteLocation',
  props<{ location: Location; modeIndex: number }>()
);

export const deleteLocationSuccess = createAction(
  '[App] deleteLocationSuccess',
  props<{ location: Location; modeIndex: number }>()
);

export const deleteLocationFailure = createAction(
  '[App] deleteLocationFailure',
  props<{ error: any; }>()
);

export const loadNewDifferentRandomLocationsIndex = createAction(
  '[App] loadNewDifferentRandomLocationsIndex',
  props<{ modeIndex: number }>()
);

export const resetProgress = createAction(
  '[DB] resetProgress',
  props<{ modeIndex: number }>()
)

export const resetProgressSuccess = createAction(
  '[App] resetProgressSuccess',
  props<{ locationArray: Location[], modeIndex: number }>()
)

export const resetProgressFailure = createAction(
  '[App] resetProgressFailure',
  props<{ error: any }>()
)
