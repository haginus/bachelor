import { createPaginatedResolver, parseBooleanParam, parseEnumParam, parseSortDirectionParam } from "../../lib/resolver-factory";
import { removeEmptyProperties } from "../../lib/utils";
import { TeachersService } from "../../services/teachers.service";
import { inject } from "@angular/core";

export const teachersResolver = createPaginatedResolver({
  pageSizes: [25, 50, 100],
  getData: (params) => inject(TeachersService).findAll(params),
  getAdditionalParams: (params) => {
    return removeEmptyProperties({
      sortBy: parseEnumParam(params['sortBy'], ['id', 'firstName', 'lastName', 'email', 'offerCount', 'paperCount', 'plagiarismReportCount']),
      sortDirection: parseSortDirectionParam(params['sortDirection']),
      firstName: params['firstName'],
      lastName: params['lastName'],
      email: params['email'],
      onlyMissingPlagiarismReports: parseBooleanParam(params['onlyMissingPlagiarismReports']),
      detailed: true,
    });
  },
});
