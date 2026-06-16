import { Component, computed, ElementRef, EventEmitter, Inject, Input, input, Optional, Output, Self, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NgControl, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatRipple } from '@angular/material/core';
import { MAT_FORM_FIELD, MatFormField, MatFormFieldControl } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { firstValueFrom, Observable, Subject } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { arrayMap } from '../../../lib/utils';
import { Paginated, PaginatedQuery } from '../../../lib/types';

export interface FilterableSelectConfig<OptionType, ValueType> {
  multiple?: boolean;
  limit?: number;
  clearable?: boolean;
  getOptions: (query: PaginatedQuery<{ search: string; }>) => Observable<Paginated<OptionType>>;
  getSelectedOption: (value: ValueType) => Observable<OptionType>;
  getOptionId?: (option: OptionType) => string | number;
  getOptionValue?: (option: OptionType) => ValueType;
  getOptionLabel?: (option: OptionType) => string;
  getOptionSecondaryLabel?: (option: OptionType) => string;
  showSecondaryLabelInTrigger?: boolean;
  createOption?: () => Observable<OptionType | undefined>;
  createOptionLabel?: string;
}

@Component({
  selector: 'app-filterable-select',
  imports: [
    MatIcon,
    MatButton,
    MatMenuModule,
    MatProgressSpinner,
    MatRipple,
    LoadingComponent,
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: FilterableSelect
    },
  ],
  templateUrl: './filterable-select.html',
  styleUrl: './filterable-select.scss',
})
export class FilterableSelect<OptionType = any, ValueType = any> implements ControlValueAccessor, MatFormFieldControl<ValueType | ValueType[] | undefined> {

  constructor(
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  private static nextId = 0;

  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('filterInput') filterInput!: ElementRef<HTMLInputElement>;

  stateChanges = new Subject<void>();
  id = `filterable-select-${FilterableSelect.nextId++}`;
  controlType = 'filterable-select';
  placeholder: string = '';
  focused = false;

  @Input()
  get value(): ValueType | ValueType[] | null | undefined {
    return this._underlyingValue;
  }
  set value(value: ValueType | ValueType[] | null | undefined) {
    this._underlyingValue = value;
    this.writeValue(value);
  }

  @Output()
  valueChange = new EventEmitter<ValueType | ValueType[] | null | undefined>();

  get empty() {
    return (this._underlyingValue instanceof Array && this._underlyingValue.length === 0) || this._underlyingValue === null || this._underlyingValue === undefined;
  }

  get shouldLabelFloat() {
    return !this.empty;
  }

  get required() {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }

  get disabled() {
    return this.ngControl?.control?.disabled ?? false;
  }

  get errorState() {
    return !!this.ngControl?.control?.invalid && (!!this.ngControl?.control?.dirty || !!this.ngControl?.control?.touched);
  }

  setDescribedByIds(ids: string[]): void {}

  onContainerClick(event: PointerEvent): void {
    if(this.disabled) return;
    this.openMenu(event);
  }

  private debounceTimer: any;
  configInput = input.required<FilterableSelectConfig<OptionType, ValueType>>({ alias: 'config' });
  protected config = computed(() => ({
    multiple: false,
    limit: 20,
    clearable: true,
    getOptionId: (option: OptionType) => (option as any).id || option as any,
    getOptionValue: (option: OptionType) => (option as any) as ValueType,
    getOptionLabel: (option: OptionType) => (option as any) as string,
    getOptionSecondaryLabel: (option: OptionType) => '',
    showSecondaryLabelInTrigger: false,
    ...this.configInput(),
  }));

  protected search = signal('');
  protected isFirstLoad = signal(true);
  protected isLoading = signal(false);
  protected isLoadingMore = signal(false);
  protected optionCount = signal(0);
  private offset = 0;
  protected options = signal<OptionType[]>([]);
  protected loadMoreCount = computed(() => Math.min(this.optionCount() - this.options().length, this.config().limit));
  protected selectedOptions = signal<OptionType[]>([]);
  selectedOptionsDict = computed(() => arrayMap(this.selectedOptions(), this.config().getOptionId));
  private _underlyingValue: ValueType | ValueType[] | null | undefined;
  private onChange: (value: ValueType | ValueType[] | null | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  protected menuContentWidth = signal(0);

  async writeValue(value: ValueType | ValueType[] | null | undefined): Promise<void> {
    this._underlyingValue = value;
    const optionValues = [this._underlyingValue].flat().filter(v => v != null) as ValueType[];
    if(optionValues.length === 0) {
      this.selectedOptions.set([]);
      return;
    }
    const optionsDictByValue = arrayMap(this.options(), this.config().getOptionValue as any);
    try {
      const selectedOptions = await Promise.all(optionValues.map(async (value) => {
        return optionsDictByValue[value as any] || firstValueFrom(this.config().getSelectedOption(value));
      }));
      this.selectedOptions.set(selectedOptions);
    } catch (error) {
      this.selectedOptions.set([]);
      this._underlyingValue = this.config().multiple ? [] : null;
      this.onChange(this._underlyingValue);
      this.valueChange.emit(this._underlyingValue);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  openMenu(event?: PointerEvent) {
    let triggerElementRef: ElementRef = (this.menuTrigger as any)._element;
    if(this._formField) {
      const formFieldElement = (this._formField._elementRef.nativeElement as HTMLElement).firstElementChild;
      triggerElementRef = new ElementRef(formFieldElement);
      (this.menuTrigger as any)._element = triggerElementRef;
    }
    this.menuContentWidth.set(triggerElementRef.nativeElement.getBoundingClientRect().width);
    this.menuTrigger.openMenu();
    this.loadOptions();
    this.focused = true;
    if(event?.pointerType === 'mouse') {
      this.filterInput?.nativeElement.focus();
    }
    this.stateChanges.next();
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  onMenuClosed() {
    this.focused = false;
    this.onTouched();
    this.stateChanges.next();
  }

  async loadOptions() {
    this.isLoading.set(true);
    try {
      const query = { search: this.search(), limit: this.config().limit, offset: 0 };
      const { rows, count } = await firstValueFrom(this.config().getOptions(query));
      this.options.set(rows);
      this.optionCount.set(count);
      this.offset = rows.length;
      if(this.isFirstLoad()) {
        // Reposition the menu after the first load to ensure it is positioned correctly with the new content size
        setTimeout(() => {
          const overlayRef = (this.menuTrigger as any)._overlayRef;
          const strategy = overlayRef?.getConfig().positionStrategy as any;
          strategy?.withLockedPosition(false);
          overlayRef?.updatePosition();
          strategy?.withLockedPosition(true);
        });
      }
      this.isFirstLoad.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreOptions() {
    this.isLoadingMore.set(true);
    try {
      const query = { search: this.search(), limit: this.config().limit, offset: this.offset };
      const { rows, count } = await firstValueFrom(this.config().getOptions(query));
      this.options.set([...this.options(), ...rows]);
      this.optionCount.set(count);
      this.offset += rows.length;
    } catch (error) {
    } finally {
      this.isLoadingMore.set(false);
    }
  }

  selectOption(option: OptionType) {
    if(this.config().multiple) {
      const getOptionId = this.config().getOptionId;
      if(this.selectedOptionsDict()[getOptionId(option)]) {
        this.selectedOptions.set([...this.selectedOptions().filter(o => getOptionId(o) !== getOptionId(option))]);
      } else {
        this.selectedOptions.set([...this.selectedOptions(), option]);
      }
    } else {
      this.selectedOptions.set([option]);
      this.closeMenu();
    }
    this._underlyingValue = this.config().multiple
      ? this.selectedOptions().map(this.config().getOptionValue)
      : this.config().getOptionValue(option);
    this.onChange(this._underlyingValue);
    this.valueChange.emit(this._underlyingValue);
    this.onTouched();
  }

  isOptionSelected(option: OptionType) {
    return !!this.selectedOptionsDict()[this.config().getOptionId(option)];
  }

  async onCreateOption() {
    const createOption = this.config().createOption;
    if(!createOption) return;
    const newOption = await firstValueFrom(createOption());
    if(!newOption) return;
    this.options.update(options => [newOption, ...options]);
    this.optionCount.update(count => count + 1);
    this.selectOption(newOption);
  }

  onInputChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.search.set(input.value);
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.loadOptions();
    }, 300);
  }

  clearSelection() {
    this.selectedOptions.set([]);
    this._underlyingValue = this.config().multiple ? [] : null;
    this.onChange(this._underlyingValue);
    this.valueChange.emit(this._underlyingValue);
    this.onTouched();
    if(!this.config().multiple) {
      this.closeMenu();
    }
  }
}

