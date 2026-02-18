import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Paper } from "../../lib/types";
import { inject } from "@angular/core";
import { PapersService } from "../../services/papers.service";

export const paperResolver: ResolveFn<Paper> = (route: ActivatedRouteSnapshot) => {
  const papersService = inject(PapersService);
  return papersService.findMineStudent();
};
