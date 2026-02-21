import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { SubmissionsService } from "../../services/submissions.service";

export const submissionStatsResolver: ResolveFn<any> = (route: ActivatedRouteSnapshot) => {
  const submissionsService = inject(SubmissionsService);
  return submissionsService.getStats();
};
