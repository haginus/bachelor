import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-signature-pad',
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss'
})
export class SignaturePadComponent {

  protected readonly themeService = inject(ThemeService);

  @Input() canvasWidth = 270;
  @Input() canvasHeight = 130;
  @ViewChild('signaturePadCanvas', { static: true }) private canvas: ElementRef<HTMLCanvasElement>;

  public dirty = false;
  private writingMode = false;
  private ctx: CanvasRenderingContext2D;

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.lineWidth = 3;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
  }

  protected onStartDrawing(event: PointerEvent) {
    this.writingMode = true;
    this.ctx.beginPath();
    const [positionX, positionY] = this.getCursorPosition(event);
    this.ctx.fillRect(positionX, positionY, 2, 2);
    this.ctx.moveTo(positionX, positionY);
  }

  protected onEndDrawing() {
    if(this.writingMode === true) {
      this.dirty = true;
    }
    this.writingMode = false;
  }

  protected onDraw(event: PointerEvent) {
    if (this.writingMode) {
      const [positionX, positionY] = this.getCursorPosition(event);
      this.ctx.lineTo(positionX, positionY);
      this.ctx.stroke();
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.dirty = false;
  }

  private getCursorPosition(event: PointerEvent) {
    const positionX = event.offsetX;
    const positionY = event.offsetY;
    if(positionX < 0 || positionX > this.canvasWidth || positionY < 0 || positionY > this.canvasHeight) {
      this.writingMode = false;
    }
    return [positionX, positionY];
  }

  getBlob() {
    return new Promise<Blob>((resolve) => {
      this.canvas.nativeElement.toBlob(resolve, "image/png");
    });
  }

}
