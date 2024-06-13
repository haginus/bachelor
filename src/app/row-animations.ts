import { animate, state, style, transition, trigger } from '@angular/animations';

export const rowAnimation = trigger('rowAnimation', [
  transition('* => void', [animate('0ms', style({ display: 'none' }))]),
]);

export const detailExpand = trigger('detailExpand', [
  state('collapsed,void', style({height: '0px', minHeight: '0'})),
  state('expanded', style({height: '*'})),
  transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
]);
