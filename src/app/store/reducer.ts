import { AppState } from './appState';
import { createReducer, on } from '@ngrx/store';
import {
  deleteLocationSuccess,
  loadAppStateFromDatabaseSuccess,
  loadNewDifferentRandomLocationsIndex,
  resetProgressSuccess,
  updateLocationProgressSuccess,
} from './actions';
import { Location } from '../types/location';
import { UTIL } from '../util';

export const initialState: AppState = {
  storeReady: false,
  // do not initialize locationArrays or index yet since they do not exist yet
};

export const reducer = createReducer(
  initialState,
  // prettier-ignore
  on(loadAppStateFromDatabaseSuccess,
    (state: AppState, { locationArrays }): AppState => {
      return {
        ...state,
        locationArrays,
        storeReady: true,
      };
    }
  ),
  on(updateLocationProgressSuccess, (state: AppState, action): AppState => {
    if (!state.locationArrays)
      throw new Error(
        'Fatal Error: my assumption that this would never happen proved wrong.'
      );
    const locationArrays: Location[][] = state.locationArrays.map(
      (locationArray: Location[], index) =>
        index === action.modeIndex
          ? locationArray.map((location) =>
              location.id === action.location.id ? action.location : location
            )
          : locationArray
    );
    return {
      ...state,
      locationArrays,
    };
  }),
  on(deleteLocationSuccess, (state: AppState, action): AppState => {
    if (!state.locationArrays)
      throw new Error(
        'Fatal Error: my assumption that this would never happen proved wrong.'
      );
    const locationArrays: Location[][] = state.locationArrays.map(
      (locationArray: Location[], index) =>
        index === action.modeIndex
          ? locationArray.filter(
              (location) => location.id !== action.location.id
            )
          : locationArray
    );
    return {
      ...state,
      locationArrays,
    };
  }),
  // prettier-ignore
  on(loadNewDifferentRandomLocationsIndex,
    (state: AppState, action): AppState => {
      if (!state.storeReady || !state.locationArrays) {
        console.log(state);
        throw new Error('Fatal error: only allowed to call once storageReady');
      } else {
        /** https://stackoverflow.com/a/34184614/20009330 */
        let locationsIndex;
        if (state.locationArrays[action.modeIndex!].length === 1) {
          locationsIndex = 0; // it'd have always returned 1 instead (out of bounds!)
        } else {
          locationsIndex = Math.floor(
            Math.random() * (state.locationArrays[action.modeIndex!].length - 1)
          );
          if (state.locationsIndex && locationsIndex >= state.locationsIndex) {
            locationsIndex++;
          }

          // todo once SQLITE: for each mode store two arrays of indices: mastered & not-mastered
          //  search random in not-mastered first, then in mastered
          // currently already tried 1 location, the current one. Now going to check it.
          let totalTriedLocationsCount = 1; // the amount of tries to find a location with not maxed progress
          while ((state.locationArrays[action.modeIndex!][locationsIndex].progress === UTIL.maxProgress
              && totalTriedLocationsCount < state.locationArrays[action.modeIndex!].length) // once we have tried length locations, then we can give up
              || locationsIndex === state.locationsIndex) {
            if (locationsIndex < state.locationArrays[action.modeIndex!].length - 1) {
              locationsIndex++;
            } else {
              locationsIndex = 0;
            }
            totalTriedLocationsCount++;

            console.log(`District ${locationsIndex} was mastered thus now gonna try district: ${locationsIndex+1}.`, 'Total tries: ', totalTriedLocationsCount);
            console.log('RESULT: ', state.locationArrays[action.modeIndex!][locationsIndex].progress === UTIL.maxProgress,
              totalTriedLocationsCount < state.locationArrays[action.modeIndex!].length, locationsIndex === state.locationsIndex);
          }
        }
        return {
          ...state,
          locationsIndex,
        };
      }
    }
  ),
  // prettier-ignore
  on(resetProgressSuccess,
    (state: AppState, { locationArray, modeIndex }): AppState => {
      if (!state.locationArrays) {
        throw new Error('Fatal error');
      }
      const locationArrays: Location[][] = state.locationArrays.map(
        (oldLocationArray: Location[], index) =>
          index === modeIndex ? locationArray : oldLocationArray
      );

      return {
        ...state,
        locationArrays,
      };
    }
  ),
);
