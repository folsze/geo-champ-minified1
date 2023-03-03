import { Location } from '../types/location';

/**
 * Currently the only thing that is tracked by the UI-State is the progress
 * of locations. All other values are static and thus also not selectable.
 *
 * Later we will have streaks saved too for SRS,
 * those will be dynamic & selectable as well.
 *
 * UI-State interaction summarized:
 * 1. initial load in app component:
 *    1. load the arrays from the database into the state
 *    2. load all 6 modes' progress
 * 2. ...
 */
export interface AppState {
  locationArrays?: Location[][]; // uninitialized(=>undefined) as long as not yet received from the database

  /**
   * Index of the currently played map
   */
  locationsIndex?: number;

  /**
   * Storage has been:
   * 1. created
   * 2. initialized
   * 3. its data was loaded into the store
   */
  storeReady: boolean;
}
