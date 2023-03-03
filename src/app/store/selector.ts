import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AppState} from "./appState";
import {Location} from "../types/location";
import {UTIL} from "../util";

export const selectHomeState = createFeatureSelector<AppState>('app');

/**
 * A factory selector, different from normal parameterized selectors:
 * https://github.com/ngrx/platform/issues/2980#issuecomment-819551245
 */
export const selectLocations = (modeIndex: number) => createSelector(
  selectHomeState,
  (state: AppState) => state.locationArrays![modeIndex!]
);

export const selectCurrentLocation = (modeIndex: number) => createSelector(
  selectHomeState,
  (state: AppState) => {
    return state.locationArrays![modeIndex!][state.locationsIndex!];
  }
);


/**
 * [0.0;1.0]
 */
export const selectTotalProgress = (modeIndex: number) => createSelector(
  selectHomeState,
  (state: AppState) => {
    let totalProgress = 0;
    if (modeIndex === undefined || modeIndex === null) {
      console.error('Assertion failed');
    }
    // todo find out: does this selector also emit if a different property of a location (e.g. name, not progress) changes?
    if (state.locationArrays?.[modeIndex]) {
      state.locationArrays[modeIndex].forEach(((location: Location) => totalProgress += location.progress));
      const maxTotalProgress = UTIL.maxProgress * state.locationArrays[modeIndex].length;
      return totalProgress/maxTotalProgress;
    } else {
      return -1; // not loaded yet
    }
  }
);

export const selectStoreReady = createSelector(
  selectHomeState,
  (state: AppState) => state.storeReady
);
