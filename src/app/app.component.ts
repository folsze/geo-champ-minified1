import { Component } from '@angular/core';
import { GuessingMode } from './enums/guessing-mode';
import { DataService } from './services/data.service';
import { AppPage } from './types/appPage';
import { Store } from '@ngrx/store';
import { selectStoreReady, selectTotalProgress } from './store/selector';
import { loadAppStateFromDatabase } from './store/actions';
import { filter, first } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private readonly guessingModeEnum = GuessingMode;

  public readonly firstMapPageIndex = 2;

  public readonly homePage: AppPage = {
    title: 'Home',
    url: '/home',
    icon: 'home',
  };
  public readonly mapsPage: AppPage = {
    title: 'Maps',
    url: '/maps',
    icon: 'list',
  }
  public readonly settingsPage: AppPage = {
    title: 'Settings',
    url: '/settings',
    icon: 'settings-outline',
  };

  public appPages: AppPage[] = [
    this.homePage,
    this.mapsPage,
    {
      // ORDER: input, output. area, name, number.
      title: 'Guess area by name',
      url: '/guess/area-by-name',
      icon: 'map',
      state: {
        inputMode: this.guessingModeEnum.name,
        outputMode: this.guessingModeEnum.area,
      },
    },
    {
      title: 'Guess area by number',
      url: '/guess/area-by-number',
      icon: 'map-outline',
      state: {
        inputMode: this.guessingModeEnum.number,
        outputMode: this.guessingModeEnum.area,
      },
    },
    {
      title: 'Guess name by area',
      url: '/guess/name-by-area',
      icon: 'text',
      state: {
        inputMode: this.guessingModeEnum.area,
        outputMode: this.guessingModeEnum.name,
      },
    },
    {
      title: 'Guess name by number',
      url: '/guess/name-by-number',
      icon: 'text-outline',
      state: {
        inputMode: this.guessingModeEnum.number,
        outputMode: this.guessingModeEnum.name,
      },
    },
    {
      title: 'Guess number by area',
      url: '/guess/number-by-area',
      icon: 'apps',
      state: {
        inputMode: this.guessingModeEnum.area,
        outputMode: this.guessingModeEnum.number,
      },
    },
    {
      title: 'Guess number by name',
      url: '/guess/number-by-name',
      icon: 'apps-outline',
      state: {
        inputMode: this.guessingModeEnum.name,
        outputMode: this.guessingModeEnum.number,
      },
    },
    this.settingsPage,
  ];

  // https://youtu.be/vCfAe2esboU?t=1087
  constructor(private dataService: DataService, private store: Store) {
    this.dataService.initDatabase().then(() => {
      this.store.dispatch(loadAppStateFromDatabase());
      this.store
        .select(selectStoreReady)
        .pipe(
          filter((ready) => ready),
          first()
        )
        .subscribe((ready) => {
          if (ready) {
            for (let i = this.firstMapPageIndex; i < this.appPages.length - 1; i++) {
              this.appPages[i].totalProgress$ = this.store.select(
                selectTotalProgress(i - this.firstMapPageIndex)
              );
            }
          } else {
            throw new Error('Fatal Error.');
          }
        });
    });
  }
}
