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

export function formatDate(date: Date | string) {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return [year, month, day].join('-');
}

export function inclusiveDate(dateStr: string | Date) {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + 1);
  return date;
}

export function parseDate(dateStr: string | Date) {
  return new Date(dateStr);
}

export function arrayMap<T, K extends keyof any>(arr: T[], getKey: (item: T) => K) {
  return arr.reduce((map, val) => {
    map[getKey(val)] = val;
    return map;
  }, {} as Record<K, T>);
}

export function toFixedTruncate(number: number, digits: number) {
  let re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)");
  let m = number.toString().match(re);
  return m ? parseFloat(m[1]) : number.valueOf();
};

export function copyObject<Type = Object>(object: Type): Type {
  return JSON.parse(JSON.stringify(object));
}
