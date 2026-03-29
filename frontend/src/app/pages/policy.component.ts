import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-bg-light pb-20 pt-28" [dir]="lang.isRTL() ? 'rtl' : 'ltr'">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Header -->
        <div class="mb-12 text-center">
          <h1 class="text-4xl md:text-5xl font-black text-primary-dark mb-4">
            {{ lang.translate('footer.' + policyType) }}
          </h1>
          <div class="h-1.5 w-24 bg-terracotta mx-auto rounded-full"></div>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-primary-dark/5 max-w-none text-primary-dark">
          <div class="space-y-8">
            <ng-container *ngIf="policyType === 'privacy_policy'">
              <div [innerHTML]="getPrivacyContent()" class="policy-content"></div>
            </ng-container>

            <ng-container *ngIf="policyType === 'return_policy'">
              <div [innerHTML]="getReturnPolicyContent()" class="policy-content"></div>
            </ng-container>

            <ng-container *ngIf="policyType === 'about'">
              <div [innerHTML]="getAboutContent()" class="policy-content"></div>
            </ng-container>
          </div>
        </div>

        <!-- Back to shop -->
        <div class="mt-12 text-center">
          <a routerLink="/home" class="inline-flex items-center gap-2 text-terracotta font-black uppercase tracking-widest hover:gap-4 transition-all">
            <svg *ngIf="!lang.isRTL()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            {{ lang.translate('common.back') }}
            <svg *ngIf="lang.isRTL()" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::ng-deep .policy-content h2 { 
      @apply text-2xl font-black text-primary-dark mt-8 mb-4 flex items-center gap-3;
    }
    ::ng-deep .policy-content p { 
      @apply text-primary-dark/70 leading-relaxed mb-6 block whitespace-pre-wrap; 
    }
    ::ng-deep .policy-content ul { 
      @apply list-disc list-inside space-y-2 mb-6 text-primary-dark/70 block px-4; 
    }
  `]
})
export class PolicyComponent implements OnInit {
  lang = inject(LanguageService);
  route = inject(ActivatedRoute);
  policyType: 'privacy_policy' | 'return_policy' | 'about' = 'privacy_policy';

  ngOnInit() {
    this.route.url.subscribe(url => {
      const path = url[0].path;
      if (path === 'privacy') this.policyType = 'privacy_policy';
      else if (path === 'return-policy') this.policyType = 'return_policy';
      else if (path === 'about') this.policyType = 'about';
    });
  }

  getPrivacyContent() {
    if (this.lang.isRTL()) {
       return `
        <h2>1. جمع المعلومات</h2>
        <p>نحن نولي أهمية كبيرة لخصوصية عملائنا. يتم جمع المعلومات فقط من أجل معالجة طلبك وتقديم خدمة أفضل.</p>
        <h2>2. استخدام البيانات</h2>
        <p>يتم استخدام معلوماتك من أجل:</p>
        <ul>
          <li>معالجة وتسليم طلباتك</li>
          <li>التواصل معك بخصوص حالة الطلب</li>
          <li>تحسين جودة خدمتنا</li>
        </ul>
        <h2>3. حماية البيانات</h2>
        <p>نحن نتخذ تدابير أمنية صارمة لضمان حماية بياناتك الشخصية من الوصول غير المصرح به.</p>
      `;
    }
    return `
      <h2>1. Collecte des informations</h2>
      <p>Nous accordons une grande importance à la confidentialité de nos clients. Les informations collectées ne le sont que pour traiter votre commande et vous offrir un meilleur service.</p>
      <h2>2. Utilisation des données</h2>
      <p>Vos informations sont utilisées pour :</p>
      <ul>
        <li>Traiter et livrer vos commandes</li>
        <li>Communiquer avec vous concernant l'état du colis</li>
        <li>Améliorer la qualité de notre plateforme</li>
      </ul>
      <h2>3. Protection des données</h2>
      <p>Nous mettons en œuvre des mesures de sécurité strictes pour garantir que vos données personnelles sont protégées contre tout accès non autorisé.</p>
    `;
  }

  getReturnPolicyContent() {
    if (this.lang.isRTL()) {
       return `
        <h2>1. شروط الاستبدال والاسترجاع</h2>
        <p>يمكنك استبدال أو إرجاع المنتج في غضون 24 ساعة من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية وبتغليفه الأصلي.</p>
        <h2>2. إجراءات الاسترجاع</h2>
        <p>يرجى التواصل معنا عبر الهاتف أو الواتساب لبدء عملية الاسترجاع. سيقوم مندوبنا بالاتصال بك لترتيب الموعد.</p>
        <h2>3. التكاليف</h2>
        <p>رسوم التوصيل للاستبدال أو الاسترجاع تقع على عاتق الزبون في جميع الحالات. نحن لا نتحمل تكاليف التوصيل.</p>
      `;
    }
    return `
      <h2>1. Conditions d'échange et de retour</h2>
      <p>Vous pouvez échanger ou retourner un article dans les 24 heures suivant la réception, à condition qu'il soit dans son état d'origine et dans son emballage initial.</p>
      <h2>2. Procédure de retour</h2>
      <p>Veuillez nous contacter par téléphone ou WhatsApp pour initier un retour. Notre livreur passera ensuite récupérer l'article.</p>
      <h2>3. Frais de retour</h2>
      <p>Les frais de livraison pour les retours ou échanges sont à la charge exclusive du client dans tous les cas. Nous ne prenons pas en charge les frais de transport.</p>
    `;
  }

  getAboutContent() {
    if (this.lang.isRTL()) {
       return `
        <h2>1. ${this.lang.translate('footer.about_title')}</h2>
        <p>${this.lang.translate('footer.about_desc')}</p>
        <h2>2. ${this.lang.translate('footer.how_to_order_title')}</h2>
        <p>${this.lang.translate('footer.how_to_order_desc')}</p>
        <h2>3. ${this.lang.translate('footer.symbols_title')}</h2>
        <ul>
          <li>${this.lang.translate('footer.symbols_desc_quality')}</li>
          <li>${this.lang.translate('footer.symbols_desc_security')}</li>
          <li>${this.lang.translate('footer.symbols_desc_local')}</li>
        </ul>
      `;
    }
    return `
      <h2>1. ${this.lang.translate('footer.about_title')}</h2>
      <p>${this.lang.translate('footer.about_desc')}</p>
      <h2>2. ${this.lang.translate('footer.how_to_order_title')}</h2>
      <p>${this.lang.translate('footer.how_to_order_desc')}</p>
      <h2>3. ${this.lang.translate('footer.symbols_title')}</h2>
      <ul>
        <li>${this.lang.translate('footer.symbols_desc_quality')}</li>
        <li>${this.lang.translate('footer.symbols_desc_security')}</li>
        <li>${this.lang.translate('footer.symbols_desc_local')}</li>
      </ul>
    `;
  }
}
