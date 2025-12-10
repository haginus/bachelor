import { SessionSettings, UserData } from "../services/auth.service";
import { DOMAIN_TYPES, USER_TYPES } from "./constants";

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

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

export function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export function dateToDatetimeLocal(dateStr: string | Date | null) {
  if(!dateStr) return null as any as string;
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getUserDescription(user: UserData) {
  let str = capitalize(USER_TYPES[user.type]);
  if(user.student) {
    str += ` · ${capitalize(DOMAIN_TYPES[user.student.domain.type])}, ${user.student.specialization.name} (${user.student.studyForm.toLocaleUpperCase()})`;
    str += ` · Gr. ${user.student.group}`;
    str += ` · ${user.student.promotion}`;
  }
  return str;
}
