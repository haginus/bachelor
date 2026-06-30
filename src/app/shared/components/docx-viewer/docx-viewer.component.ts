import { Component, ElementRef, input, ViewChild, effect, output, ViewEncapsulation, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from "@angular/material/icon";
import { clamp } from '../../../lib/utils';

@Component({
  selector: 'app-docx-viewer',
  imports: [
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './docx-viewer.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './docx-viewer.component.scss',
})
export class DocxViewerComponent {

  @ViewChild('docxContainer', { static: true })
  docxContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('docxStage', { static: true })
  docxStage!: ElementRef<HTMLDivElement>;

  @ViewChild('docxContent', { static: true })
  docxContent!: ElementRef<HTMLDivElement>;

  file = input.required<File>();
  docxLoaded = output<void>();

  zoomLevel = 1;
  private readonly minZoom = 0.1;
  private readonly maxZoom = 2;
  private readonly zoomStep = 0.1;

  constructor() {
    effect(() => {
      if (this.file()) {
        this.renderDocx(this.file());
      }
    });
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.02 : 0.02;
    this.setZoom(this.zoomLevel + delta, false);
  }

  private async renderDocx(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const { renderAsync } = await import('docx-preview');
    this.docxContent.nativeElement.innerHTML = '';
    await renderAsync(arrayBuffer, this.docxContent.nativeElement);
    this.autoFitZoom();
    this.docxLoaded.emit();
  }

  zoomIn() {
    this.setZoom(this.zoomLevel + this.zoomStep);
  }

  zoomOut() {
    this.setZoom(this.zoomLevel - this.zoomStep);
  }

  private setZoom(nextZoom: number, roundToStep = true) {
    const rounded = roundToStep
      ? Math.round(nextZoom * 10) / 10
      : Math.round(nextZoom * 100) / 100;
    this.zoomLevel = clamp(rounded, this.minZoom, this.maxZoom);
    this.applyZoom();
  }

  private autoFitZoom() {
    const container = this.docxContainer.nativeElement;
    const wrapper = this.docxContent.nativeElement.querySelector<HTMLElement>('.docx-wrapper');
    if (!wrapper) {
      return;
    }

    const containerWidth = Math.max(container.clientWidth - 4, 0);
    const documentWidth = wrapper.scrollWidth;

    if (!containerWidth || !documentWidth) {
      this.setZoom(1, false);
      return;
    }

    this.setZoom(containerWidth / documentWidth, false);
  }

  private applyZoom() {
    const wrapper = this.docxContent.nativeElement.querySelector<HTMLElement>('.docx-wrapper');
    if (!wrapper) {
      return;
    }

    const container = this.docxContainer.nativeElement;
    const stage = this.docxStage.nativeElement;
    const content = this.docxContent.nativeElement;
    const documentWidth = wrapper.scrollWidth;
    const documentHeight = wrapper.scrollHeight;
    const scaledWidth = documentWidth * this.zoomLevel;
    const scaledHeight = documentHeight * this.zoomLevel;
    const stageWidth = Math.max(container.clientWidth, scaledWidth);
    const horizontalOffset = Math.max((stageWidth - scaledWidth) / 2, 0);

    stage.style.width = `${stageWidth}px`;
    stage.style.height = `${scaledHeight}px`;
    content.style.left = `${horizontalOffset}px`;
    content.style.transformOrigin = 'top left';
    content.style.transform = `scale(${this.zoomLevel})`;
  }

}
