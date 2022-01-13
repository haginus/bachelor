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

export function canApply(sessionSettings: SessionSettings) {
  const now = Date.now();
  return parseDate(sessionSettings.applyStartDate).getTime() <= now && now <= parseDate(sessionSettings.applyEndDate).getTime();
}

export function parseDate(dateStr: string) {
  const date = new Date(dateStr);
  return date;
}

