import { createPaginatedResolver, parseEnumParam, parseIntParam, parseSortDirectionParam } from "../../lib/resolver-factory";
import { removeEmptyProperties } from "../../lib/utils";
import { inject } from "@angular/core";
import { SubmissionsService } from "../../services/submissions.service";

export const submissionsResolver = createPaginatedResolver({
  pageSizes: [25, 50, 100, 500],
  getData: (params) => inject(SubmissionsService).findAll({ ...params, hasWrittenExam: true }),
  getAdditionalParams: (params) => {
    return removeEmptyProperties({
      sortBy: parseEnumParam(params['sortBy'], ['id', 'student.fullName', 'student.domain.name', 'writtenExamGrade.initialGrade', 'writtenExamGrade.disputeGrade', 'writtenExamGrade.finalGrade']),
      sortDirection: parseSortDirectionParam(params['sortDirection']),
      studentName: params['studentName'],
      domainId: parseIntParam(params['domainId']),
      writtenExamState: parseEnumParam(params['writtenExamState'], ['not_graded', 'absent', 'graded', 'disputed']),
    });
  },
});
