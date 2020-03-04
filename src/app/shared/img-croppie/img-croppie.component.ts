import {
	Component,
	OnInit,
	Output,
    EventEmitter
} from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';


@Component({
  selector: 'app-img-croppie',
  templateUrl: './img-croppie.component.html',
  styleUrls: ['./img-croppie.component.sass']
})
export class ImgCroppieComponent implements OnInit {

	@Output() cropImage: EventEmitter<any> = new EventEmitter();
	public imageBase64: string = '';
	imageChangedEvent: any = '';
	croppedImage: any = '';

	public constructor() {
	
	}
	
	public ngOnInit() {
	}

	imageCropped(event: ImageCroppedEvent) {

		this.imageBase64 = event.base64;
		this.cropImage.emit(event.base64);
	}

	imageLoaded() {
		// show cropper
	}

	cropperReady() {
		// cropper ready
	}

	loadImageFailed() {
		// show message
	}
}

