import {Observable} from 'rxjs';

export const DB_MODES: any[] = [ // todo: any -> Location
  {id: 1, mapId: 1},
  {id: 2, mapId: 2},
  {id: 3, mapId: 3},
  {id: 4, mapId: 3},
];


export const modes: Mode[] = [
  {
    title: 'Guess area by name',
    icon: 'map',
  },
  {
    title: 'Guess area by number',
    icon: 'map-outline',
  },
  {
    title: 'Guess name by area',
    icon: 'text',
  },
  {
    title: 'Guess name by number',
    icon: 'text-outline',
  },
  {
    title: 'Guess number by area',
    icon: 'apps',
  },
  {
    title: 'Guess number by name',
    icon: 'apps-outline',
  },
];

class Mode {
  title: string;
  icon: string;
  totalProgress$?: Observable<number>; // [0.0;1.0]
}
