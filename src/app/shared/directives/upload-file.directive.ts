import { Directive, ElementRef, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[appUploadFile]',
  standalone: true
})
export class UploadFileDirective {

  constructor(
    private elementRef: ElementRef,
  ) {}

  @Input() accept: string;
  @Input() disabled: boolean;
  @Output() file = new EventEmitter<File>();

  private inputElement: HTMLInputElement;

  ngOnInit() {
    const element = this.elementRef.nativeElement as HTMLElement;
    const computedStyle = getComputedStyle(element);
    if(computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'file';
    this.inputElement.accept = this.accept;
    this.inputElement.style.position = 'absolute';
    this.inputElement.style.top = '0';
    this.inputElement.style.left = '0';
    this.inputElement.style.width = '100%';
    this.inputElement.style.height = '100%';
    this.inputElement.style.opacity = '0';
    this.inputElement.style.cursor = 'pointer';
    this.inputElement.style.zIndex = '1';
    this.inputElement.addEventListener('change', (event) => {
      if (this.disabled) {
        return;
      }
      const target = event.target as HTMLInputElement;
      this.file.emit(target.files[0]);
      target.value = null;
    });
    element.appendChild(this.inputElement);
  }

  ngOnChanges() {
    if(this.inputElement) {
      this.inputElement.accept = this.accept;
    }
  }

  ngOnDestroy() {
    this.inputElement?.remove();
  }
}
