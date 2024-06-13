import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validator, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { AuthService, Profile } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile-editor',
  templateUrl: './user-profile-editor.component.html',
  styleUrls: ['./user-profile-editor.component.scss']
})
export class UserProfileEditorComponent implements OnInit {

  constructor(private user: AuthService, private sb: MatSnackBar,
    @Optional() private dialog: MatDialogRef<UserProfileEditorComponent>) { }

  profileForm = new FormGroup({
    "bio": new FormControl(''),
    "website": new FormControl('', [websiteValidator])
  });

  profilePictureFile: File = null;
  userProfile: Profile;
  base64Photo: ArrayBuffer;
  loading: boolean = false;

  @Input() showReset: boolean = true;
  @Output() profileSaved = new EventEmitter<void>();

  ngOnInit(): void {
    this.user.userData.pipe(take(1)).subscribe(user => {
      this.userProfile = user.profile;
      this.resetForm();
    });
  }

  resetForm() {
    this.profileForm.setValue({
      bio: this.userProfile?.bio || '',
      website: this.userProfile?.website || ''
    });
    this.profilePictureFile = null;
    this.base64Photo = null;
  }

  saveProfile() {
    const { bio, website } = this.profileForm.value;
    this.loading = true;
    this.user.editProfile(this.profilePictureFile, bio, website).subscribe(profile => {
      this.loading = false;
      if(profile) {
        this.sb.open("Profilul a fost salvat.");
        this.userProfile = profile;
        this.resetForm();
        this.profileSaved.emit();
        this.dialog?.close();
      }
    });
  }

  async handleFileChange(target: any) {
    const file: File = target.files[0];
    this.profilePictureFile = file;
    this.base64Photo = await toBase64(file) as ArrayBuffer;
  }
}

function websiteValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if(!value) return null;
  const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);
  return !regex.test(value) ? { notWebsite: true } : null;
}

const toBase64 = (file: File) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});
