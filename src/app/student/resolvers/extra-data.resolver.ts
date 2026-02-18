import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { UserExtraData } from "../../lib/types";
import { inject } from "@angular/core";
import { AuthService } from "../../services/auth.service";

export const extraDataResolver: ResolveFn<UserExtraData> = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  return authService.getUserExtraData();
};
