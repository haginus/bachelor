import { SessionSettings } from "../services/auth.service";

// export interface UrlParam {
//   name: string;
//   value: string | number;
// }


// export function constructUrlWithParams(url: string, params: UrlParam[]) {
//   const paramsStr = params.reduce((str, param) => {
//     if(typeof param === "number") {
//       return "&" + param;
//     } else {
//       return !!param ? 
//     }
//   })
// }

export function inclusiveDate(dateStr: string | Date, timezoneOffset: number = 0) {
  const date = parseDate(dateStr, timezoneOffset);
  date.setDate(date.getDate() + 1);
  return date;
}

export function parseDate(dateStr: string | Date, timezoneOffset: number = null) {
  if(timezoneOffset == null) {
    return new Date(dateStr);
  }
  const offset = Math.abs(timezoneOffset);
  const hourOffset = ('' + Math.floor(offset / 60)).padStart(2, '0');
  const minuteOffset = ('' + offset % 60).padStart(2, '0');
  const sign = timezoneOffset > 0 ? '-' : '+';
  const timezone = `UTC${sign}${hourOffset}${minuteOffset}`;
  const date = new Date(`${dateStr} ${timezone}`);
  console.log(dateStr, date);
  return date;
}

export function arrayMap<T, K extends keyof any>(arr: T[], getKey: (item: T) => K) {
  return arr.reduce((map, val) => {
    map[getKey(val)] = val;
    return map;
  }, {} as Record<K, T>);
}

