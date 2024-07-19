import { NgStyle } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    NgStyle,
  ],
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss'
})
export class SignaturePadComponent {

  @Input() canvasWidth = 250;
  @Input() canvasHeight = 120;
  @ViewChild('signaturePadCanvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

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
  }

  private getCursorPosition(event: PointerEvent) {
    console.log(event);
    const target = event.target as HTMLCanvasElement;
    const positionX = event.offsetX;
    const positionY = event.offsetY;
    if(positionX < 0 || positionX > this.canvasWidth || positionY < 0 || positionY > this.canvasHeight) {
      this.writingMode = false;
    }
    return [positionX, positionY];
  }

}
