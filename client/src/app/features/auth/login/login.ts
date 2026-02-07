import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Added RouterLink
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step = 1;
  submitted = false;
  loading = false;
  errorMessage = '';
  tempPhone = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      phoneNumber: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', Validators.required]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.requireOtp) {
          this.step = 2;
          this.tempPhone = this.loginForm.get('phoneNumber')?.value;
          this.toastr.info(res.message);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || 'Echec de connexion';
        this.toastr.error(this.errorMessage, 'Erreur');
      }
    });
  }

  onVerifyOtp() {
    this.errorMessage = '';
    if (this.otpForm.invalid) return;

    this.loading = true;
    const data = {
      phoneNumber: this.tempPhone,
      otp: this.otpForm.get('otp')?.value
    };

    this.authService.verifyOtp(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.toastr.success('Connexion réussie!', 'Bienvenue');

        // SAVE USER DATA TO STORAGE
        localStorage.setItem('token', res.token); // Ensure token is saved if not already
        localStorage.setItem('user', JSON.stringify(res.user));
        console.log('✅ User data saved:', res.user);

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
