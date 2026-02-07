import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html', // Separated for clarity in viewing, but I'll inline if preferred. I'll write 'register.html' separately.
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  otpForm: FormGroup;
  step = 1; // 1: Details, 2: OTP
  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(?:\+222)?(2|3|4)\d{7}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['Male', Validators.required],
      role: ['Client']
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmitDetails() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) return;

    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastr.success(res.message, 'Succès');
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        // Set error message for the alert
        this.errorMessage = err.error.message || 'Erreur lors de l\'inscription';
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    });
  }

  onVerifyOtp() {
    this.errorMessage = '';
    if (this.otpForm.invalid) return;

    this.loading = true;
    const data = {
      phoneNumber: this.registerForm.get('phoneNumber')?.value,
      otp: this.otpForm.get('otp')?.value
    };

    this.authService.verifyOtp(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastr.success('Vérification réussie! Vous êtes connecté.', 'Bienvenue');
        if (res.user.role === 'Manager') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/shop']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Code OTP invalide';
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    });
  }
}
