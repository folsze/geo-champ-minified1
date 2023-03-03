import { Component, OnInit } from '@angular/core';
import {MapModeLocationService} from '../services/map-mode-location.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {

  constructor(private service: MapModeLocationService) { }

  ngOnInit() {
    // console.log(this.service.databaseName);
  }

}
