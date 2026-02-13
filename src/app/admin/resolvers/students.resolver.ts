import { createPaginatedResolver, parseEnumParam, parseIntParam, parseSortDirectionParam } from "../../lib/resolver-factory";
import { removeEmptyProperties } from "../../lib/utils";
import { StudentsService } from "../../services/students.service";
import { inject } from "@angular/core";

export const studentsResolver = createPaginatedResolver({
  pageSizes: [25, 50, 100],
  getData: (params) => inject(StudentsService).findAll(params),
  getAdditionalParams: (params) => {
    return removeEmptyProperties({
      sortBy: parseEnumParam(params['sortBy'], ['id', 'firstName', 'lastName', 'email', 'domain', 'group', 'promotion']),
      sortDirection: parseSortDirectionParam(params['sortDirection']),
      domainId: parseIntParam(params['domainId']),
      specializationId: parseIntParam(params['specializationId']),
      group: params['group'],
      promotion: params['promotion'],
      firstName: params['firstName'],
      lastName: params['lastName'],
      email: params['email'],
    });
  },
});
