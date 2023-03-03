import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { SQLiteService } from './sqlite.service';
import { DbnameVersionService } from './dbname-version.service';
import { environment } from 'src/environments/environment';
import {mapModeLocationVersionUpgrades} from '../upgrades/upgrade-statements';
import {DB_MAPS} from '../data/maps';
import {DB_MODES} from '../data/modes';

import {DB_MODE} from '../data/DB_MODE';
import {DB_MAP} from '../data/DB_MAP';

import { IdsSeq } from '../models/ids-seq';

@Injectable()
export class MapModeLocationService {
  public databaseName: string;
  public modeList: BehaviorSubject<DB_MODE[]> = new BehaviorSubject<DB_MODE[]>([]);
  public mapList: BehaviorSubject<DB_MAP[]> = new BehaviorSubject<DB_MAP[]>([]);
  public idsSeqList: BehaviorSubject<IdsSeq[]> = new BehaviorSubject<IdsSeq[]>([]);

  private isModeReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isMapReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isIdsSeqReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private versionUpgrades = mapModeLocationVersionUpgrades;
  private loadToVersion = mapModeLocationVersionUpgrades[mapModeLocationVersionUpgrades.length-1].toVersion;
  private mDb!: SQLiteDBConnection;

  constructor(  private sqliteService: SQLiteService,
                private dbVerService: DbnameVersionService,
  ) {
    this.databaseName = environment.databaseNames[0].name; // for multiple dbs: .filter(x => x.name.includes('modes'))
  }

  async initializeDatabase() {
    // create upgrade statements
    await this.sqliteService // NOTE: this initializes
        .addUpgradeStatement({ database: this.databaseName,
        upgrade: this.versionUpgrades});
    // create and/or open the database
    console.log('LIST: ', this.mDb?.getTableList());
    await this.openDatabase();
    console.log('LIST: ', this.mDb.getTableList());
    this.dbVerService.set(this.databaseName,this.loadToVersion);
    const isData = await this.mDb.query("select * from sqlite_sequence");
    // create database initial data
    if(isData.values!.length === 0) {
      await this.createInitialData();
    }
    if( this.sqliteService.platform === 'web') {
      await this.sqliteService.sqliteConnection.saveToStore(this.databaseName);
    }
    await this.getAllData();
  }
  async openDatabase() {
    console.log('openDatabase', this.databaseName, this.loadToVersion);
    this.mDb = await this.sqliteService
      .openDatabase(this.databaseName, false, "no-encryption",
        this.loadToVersion,false);
  }
  async getAllData() {
    await this.getAllModes();
    this.isModeReady.next(true);

    await this.getAllMaps();
    this.isMapReady.next(true);
    await this.getAllIdsSeq();
    this.isIdsSeqReady.next(true);
  }

  /**
   * Return Mode state
   * @returns
   */
  modeState(): Observable<boolean> {
    return this.isModeReady.asObservable();
  }
  /**
   * Return Map state
   * @returns
   */
  mapState(): Observable<boolean> {
    return this.isMapReady.asObservable();
  }
  /**
   * Return Ids Sequence state
   * @returns
   */
  idsSeqState(): Observable<boolean> {
    return this.isIdsSeqReady.asObservable();
  }

  /**
   * Fetch Modes
   * @returns
   */
  fetchModes(): Observable<DB_MODE[]> {
    return this.modeList.asObservable();
  }
  /**
   * Fetch Maps
   * @returns
   */
  fetchMaps(): Observable<DB_MAP[]> {
    return this.mapList.asObservable();
  }
  /**
   * Fetch Ids Sequence
   * @returns
   */
  fetchIdsSeq(): Observable<IdsSeq[]> {
    return this.idsSeqList.asObservable();
  }
  /**
   * Get, Create, Update an Mode
   * @returns
   */
  async getMode(jsonMode: DB_MODE): Promise<DB_MODE> {
    let retMode = await this.sqliteService.findOneBy(this.mDb, "mode", {id: jsonMode.id}) as DB_MODE;
    if(!retMode) {
      if(jsonMode.id) { // TODO: when is this not the case???
        // create a new Mode
        const mode: DB_MODE = await this.createMode(jsonMode);
        await this.sqliteService.save(this.mDb, "mode", mode);
        retMode = await this.sqliteService.findOneBy(this.mDb, "mode", {id: jsonMode.id}) as DB_MODE;
        return retMode;
      } else {
        // post not in the database
        const mMode = new DB_MODE();
        mMode.id = -1;
        return mMode;
      }
    } else {
      if(Object.keys(jsonMode).length > 1) {
        // update an existing Mode
        const updMode = await this.createMode(jsonMode);
        await this.sqliteService.save(this.mDb, "mode", updMode, {id: jsonMode.id});
        const mode = (await this.sqliteService.findOneBy(this.mDb, "mode", {id: jsonMode.id})) as DB_MODE;
        if(mode) {
          return mode;
        } else {
          return Promise.reject(`failed to getMode for id ${jsonMode.id}`);
        }
      } else {
        return retMode;
      }
    }
  }

  /**
   * Get all Modes
   * @returns
   */
  async getAllModes(): Promise<void> {
    // Query the mode table
    const stmt = `select id, mode.name as name, title, map.mapid as map_mapid, map.name as map_name,
    map.location as location from mode
    INNER JOIN map ON  map_mapid = mode.mapid
    ORDER BY map_name, id ASC
    `; // TODO: bad syntac!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const modes = (await this.mDb.query(stmt)).values;
    const modesData: DB_MODE[] = [];
    for (const mode of modes!) {
      const modeData = new DB_MODE();
      modeData.id = mode.id;
      modeData.mapId = mode.mapId; // TODO: this will be used for complex object mappings
      modesData.push(modeData);
    }
    this.modeList.next(modesData);

  }

  /**
   * Get, Create, Update a Map
   * @returns
   */
  async getMap(jsonMap: DB_MAP): Promise<DB_MAP> {
    let map = await this.sqliteService.findOneBy(this.mDb, "map", {id: jsonMap.id});
    if(!map) {
      if(jsonMap.id) { // TODO: when is this not the case???
        // create a new map
        map = new DB_MAP();
        map.id = jsonMap.id;

        await this.sqliteService.save(this.mDb, "map", map);
        map = await this.sqliteService.findOneBy(this.mDb, "map", {id: jsonMap.id});
        if(map) {
          return map;
        } else {
          return Promise.reject(`failed to getMap for id ${jsonMap.id}`);
        }
      } else {
        // map not in the database
        map = new DB_MAP();
        map.id = -1;
        return map;
      }
    } else {
      if(Object.keys(jsonMap).length > 1) {
        // update and existing map
        const updMap = new DB_MAP();
        updMap.id = jsonMap.id;

        await this.sqliteService.save(this.mDb, "map", updMap, {id: jsonMap.id});
        map = await this.sqliteService.findOneBy(this.mDb, "map", {id: jsonMap.id});
        if(map) {
          return map;
        } else {
          return Promise.reject(`failed to getMap for id ${jsonMap.id}`);
        }
      } else {
        return map;
      }
    }
  }
  /**
   * Get all Maps
   * @returns
   */
  async getAllMaps(): Promise<void> {
    const maps: DB_MAP[] = (await this.mDb.query("select * from map")).values as DB_MAP[];
    this.mapList.next(maps);
  }
  /**
   * Get
   * all Ids Sequence
   * @returns
   */
  async getAllIdsSeq(): Promise<void> {
    const idsSeq: IdsSeq[] = (await this.mDb.query("select * from sqlite_sequence")).values as IdsSeq[];
    this.idsSeqList.next(idsSeq);
  }
  /**
   * Get Mode from ModeData
   * @param mode
   * @returns
   */
  getModeFromModeData(mode: DB_MODE): DB_MODE {
    const modeJson: DB_MODE = new DB_MODE();
    modeJson.id = mode.id;
    modeJson.mapId = mode.mapId; // todo: simplification mapping
    return modeJson;
  }

  /*********************
   * Private Functions *
   *********************/

  /**
   * Create Database Initial Data
   * @returns
   */
  private async createInitialData(): Promise<void> {
    // create maps
    for (const map of DB_MAPS) {
      await this.getMap(map);
    }

    // create modes
    for (const mode of DB_MODES) {
      await this.getMode(mode);
    }
  }
  /**
   * Create Mode
   * @returns
   */
  private async createMode(jsonMode:DB_MODE): Promise<DB_MODE> {// TODO: what was this for???
    const mode = new DB_MODE();
    mode.id = jsonMode.id;
    mode.mapId = jsonMode.mapId;
    return mode;
  }

}
