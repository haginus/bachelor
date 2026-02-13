import { isPlatformServer } from "@angular/common";
import { inject, Injector, makeStateKey, PLATFORM_ID, runInInjectionContext, TransferState } from "@angular/core";
import { ActivatedRouteSnapshot, Params, RedirectCommand, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { firstValueFrom, Observable } from "rxjs";
import { Paginated, PaginatedQuery } from "./types";

interface PaginatedResolverOptions<T, P extends Record<string | number, any> = {}> {
  pageSizes: number[];
  getData: (params: PaginatedQuery<P>) => Observable<Paginated<T>>;
  getAdditionalParams?: (params: Params) => P | Promise<P>;
};

export interface PaginatedResolverResult<T, P extends Record<string | number, any> = {}> extends Paginated<T> {
  pageSizes: number[];
  page: number;
  pageSize: number;
  params: PaginatedQuery<P>;
}

export const createPaginatedResolver = <T, P extends Record<string | number, any> = {}>(
  options: PaginatedResolverOptions<T, P>
): ResolveFn<PaginatedResolverResult<T, P>> => {
  return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const injector = inject(Injector);
    const platformId = inject(PLATFORM_ID);
    const transferState = inject(TransferState);
    const stateKey = makeStateKey<PaginatedResolverResult<T, P>>(`resolver:${state.url}`);
    if(transferState.hasKey(stateKey)) {
      const data = transferState.get(stateKey, null)!;
      transferState.remove(stateKey);
      return data;
    }
    const params = route.queryParams;
    const page = parseInt(params['page'] || '0', 10);
    const pageSize = parseInt(params['pageSize'] ?? options.pageSizes[0].toString(), 10);
    if(!options.pageSizes.includes(pageSize)) {
      throw new Error(`Invalid pageSize: ${pageSize}`);
    }
    const limit = pageSize;
    const offset = page * pageSize;
    const additionalParams = options.getAdditionalParams ? await options.getAdditionalParams(route.queryParams) : {} as P;
    const getDataParams = { limit, offset, ...additionalParams };
    const data = await runInInjectionContext(injector, () => firstValueFrom(options.getData(getDataParams)));
    const result = {
      ...data,
      params: getDataParams,
      pageSizes: options.pageSizes,
      page,
      pageSize
    };
    if(isPlatformServer(platformId)) {
      transferState.set(stateKey, result);
    }
    return result;
  };
};

interface ResolverOptions<T, P extends Record<string | number, any> = {}> {
  getParams?: (route: ActivatedRouteSnapshot) => P | Promise<P>;
  getData: (params: P) => Observable<T>;
  onError?: (error: any) => RedirectCommand;
};

export interface ResolverResult<T, P extends Record<string | number, any> = {}> {
  params: P;
  data: T;
}

export const createResolver = <T, P extends Record<string | number, any> = {}>(
  options: ResolverOptions<T, P>
): ResolveFn<ResolverResult<T, P>> => {
  return async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const injector = inject(Injector);
    const platformId = inject(PLATFORM_ID);
    const transferState = inject(TransferState);
    const stateKey = makeStateKey<ResolverResult<T, P>>(`resolver:${state.url}`);
    if(transferState.hasKey(stateKey)) {
      const data = transferState.get(stateKey, null)!;
      transferState.remove(stateKey);
      return data;
    }
    const params = options.getParams ? await options.getParams(route) : {} as P;
    try {
      const data = await runInInjectionContext(injector, () => firstValueFrom(options.getData(params)));
      const result = { params, data };
      if(isPlatformServer(platformId)) {
        transferState.set(stateKey, result);
      }
      return result;
    } catch(err) {
      if(options.onError) {
        return runInInjectionContext(injector, () => options.onError!(err));
      }
      throw err;
    }
  };
};

export function parseEnumParam<T extends string>(param: any, validValues: T[]): T | null {
  if(typeof param !== 'string') {
    return null;
  }
  if(validValues.includes(param as T)) {
    return param as T;
  }
  return null;
}

export function parseBooleanParam(param: any): boolean | null {
  if(param === 'true' || param === true || param === 1 || param === '1') {
    return true;
  }
  if(param === 'false' || param === false || param === 0 || param === '0') {
    return false;
  }
  return null;
}

export function parseSortDirectionParam(param: any): 'asc' | 'desc' | null {
  return parseEnumParam(param, ['asc', 'desc']);
}

export function parseIntParam(param: any): number | null {
  const parsed = parseInt(param, 10);
  return isNaN(parsed) ? null : parsed;
}
