import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlertController } from '@ionic/angular';
import { resetProgress } from '../store/actions';
import { modes } from '../data/modes';
import { selectStoreReady, selectTotalProgress } from '../store/selector';
import { filter, first } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  public modes = modes;
  modeIndex: number = 0;

  constructor(private store: Store, private alertController: AlertController) {}

  ngOnInit() {
    this.store
      .select(selectStoreReady)
      .pipe(
        filter((ready) => ready),
        first()
      )
      .subscribe((ready) => {
        if (ready) {
          for (let i = 0; i < this.modes.length; i++) {
            this.modes[i].totalProgress$ = this.store.select(
              selectTotalProgress(i)
            );
          }
        } else {
          throw new Error('Fatal Error.');
        }
      });
  }

  async openResetAlert(modeIndex: number) {
    const alert = await this.alertController.create({
      header: `Are you sure? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role === 'confirm') {
      this.store.dispatch(resetProgress({ modeIndex: modeIndex }));
    }
  }
}
