import { createPaginatedResolver, parseBooleanParam, parseEnumParam, parseIntParam, parseSortDirectionParam } from "../../lib/resolver-factory";
import { removeEmptyProperties } from "../../lib/utils";
import { PapersService } from "../../services/papers.service";
import { inject } from "@angular/core";

export const papersResolver = createPaginatedResolver({
  pageSizes: [15, 25, 50, 100],
  getData: (params) => inject(PapersService).findAll(params),
  getAdditionalParams: (params) => {
    return removeEmptyProperties({
      sortBy: parseEnumParam(params['sortBy'], ['id', 'title', 'type', 'committee']),
      sortDirection: parseSortDirectionParam(params['sortDirection']),
      type: parseEnumParam(params['type'], ['bachelor', 'diploma', 'master']),
      domainId: parseIntParam(params['domainId']),
      specializationId: parseIntParam(params['specializationId']),
      title: params['title'],
      studentName: params['studentName'],
      submitted: parseBooleanParam(params['submitted']) ?? true,
      assigned: parseBooleanParam(params['assigned']),
      validity: parseEnumParam(params['validity'], ['valid', 'invalid', 'not_validated']),
    });
  },
});
