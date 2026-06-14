import { FilterableSelectConfig } from "./filterable-select";
import { inject } from "@angular/core";
import { Teacher } from "../../../lib/types";
import { TeachersService } from "../../../services/teachers.service";

export const getTeacherSelectConfig = (): FilterableSelectConfig<Teacher, number> => {
  const teachersService = inject(TeachersService);
  return {
    clearable: true,
    getOptions: (query) => teachersService.findAll({ ...query }),
    getSelectedOption: (value) => teachersService.findOne(value),
    getOptionLabel: (option) => [option.firstName, option.lastName].filter(Boolean).join(' '),
    getOptionValue: (option) => option.id,
    getOptionSecondaryLabel: (option) => option.email,
    showSecondaryLabelInTrigger: true,
  };
};
