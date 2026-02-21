import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { Submission } from "../../lib/types";
import { inject } from "@angular/core";
import { SubmissionsService } from "../../services/submissions.service";

export const submissionResolver: ResolveFn<Submission> = (route: ActivatedRouteSnapshot) => {
  const submissionsService = inject(SubmissionsService);
  return submissionsService.findMine();
};
