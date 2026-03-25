import { Injectable, signal, computed } from '@angular/core';

export type Locale = 'fr' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLocale = signal<Locale>('ar');
  
  isRTL = computed(() => this.currentLocale() === 'ar');

  private translations: Record<Locale, Record<string, string>> = {
    fr: {
      'nav.home': 'Accueil',
      'nav.shop': 'Boutique',
      'nav.cart': 'Panier',
      'nav.profile': 'Profil',
      'nav.register': 'S\'INSCRIRE',
      'nav.login': 'Connexion',
      'nav.logout': 'Déconnexion',
      'nav.search': 'Rechercher un produit...',
      'footer.made_in': 'Fièrement fabriqué en Mauritanie',
      'footer.developed_by': 'plateforme développée par',
      'home.shop_now': 'ACHETEZ MAINTENANT',
      'home.cat_msg': 'Collections sélectionnées pour vous',
      'home.all_msg': 'Les articles les plus convoités',
      'home.categories': 'Nos Catégories',
      'home.category_label': 'Catégorie',
      'home.all_products': 'Nos Pépites',
      'home.full_catalog': 'Catalogue Complet',
      'product.add_to_cart': 'AJOUTER AU PANIER',
      'product.buy_now': 'ACHETER MAINTENANT',
      'product.stock_in': 'En stock',
      'product.stock_out': 'Rupture',
      'product.description': 'Description',
      'product.colors': 'Couleurs',
      'product.sizes': 'Tailles',
      'product.features': 'Caractéristiques',
      'product.shipping_info': 'Nouakchott uniquement',
      'common.price_label': 'MRU',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.back': 'Retour',
      'common.contact': 'Contact :',
      'cart.title': 'Mon Panier',
      'cart.empty': 'Votre panier est vide',
      'cart.empty_msg': 'Il semble que vous n\'ayez pas encore trouvé votre bonheur. Explorez nos dernières collections !',
      'cart.total': 'Total',
      'cart.checkout': 'COMMANDER',
      'cart.clear': 'Vider le panier',
      'cart.quality_badge': 'Produit de qualité',
      'cart.vat_included': 'TVA Incluse',
      'cart.security_badge': 'Sécurité 100%',
      'checkout.title': 'Finaliser la commande',
      'checkout.delivery': 'Détails de livraison',
      'checkout.name': 'Nom complet',
      'checkout.address': 'Adresse de livraison',
      'checkout.phone': 'Numéro de téléphone',
      'checkout.confirm': 'CONFIRMER LA COMMANDE',
      'checkout.district_placeholder': 'Sélectionner votre quartier',
      'checkout.fill_fields': 'Veuillez remplir tous les champs obligatoires',
      'checkout.exact_amount': 'Préparez le montant exact pour faciliter l\'échange avec le livreur.',
      'district.tevragh': 'Tevragh Zeina',
      'district.ksar': 'Ksar',
      'district.teyarett': 'Teyarett',
      'district.darnaim': 'Dar Naim',
      'district.toujounine': 'Toujounine',
      'district.arafat': 'Arafat',
      'district.sebkha': 'Sebkha',
      'district.elmina': 'El Mina',
      'district.riyadh': 'Riyadh',
      'checkout.district_label': 'Quartier / Côté de la ville',
      'checkout.address_label': 'Emplacement précis',
      'checkout.payment_method': 'Mode de paiement',
      'checkout.payment_cash': 'Paiement à la livraison',
      'checkout.summary': 'Récapitulatif',
      'checkout.subtotal': 'Sous-total',
      'checkout.shipping_fee': 'Frais de livraison',
      'checkout.success_title': 'Commande confirmée !',
      'checkout.success_msg': 'Merci pour votre confiance. Notre livreur vous contactera sous peu au numéro indiqué pour la remise de votre colis.',
      'checkout.order_num': 'Numéro de commande',
      'checkout.track_order': 'Suivre ma commande',
      'auth.register_title': 'Créer un compte',
      'auth.please_login': 'Veuillez vous inscrire ou vous connecter pour commander',
      'auth.remember_me': 'Mémoriser',
      'auth.forgot_pwd': 'Mot de passe oublié ?',
      'auth.no_account': 'Pas de compte ?',
      'auth.have_account': 'Déjà un compte ?',
      'auth.otp_verify': 'Vérification du code',
      'auth.otp_msg': 'Un code vous a été envoyé pour vérifier votre identité.',
      'auth.otp_expire': 'Expire dans',
      'auth.resend_otp': 'Renvoyer le code',
      'admin.dashboard': 'Tableau de Bord',
      'admin.stats': 'Statistiques',
      'admin.catalog': 'Mon Catalogue',
      'admin.orders': 'Commandes Client',
      'admin.settings': 'Configuration',
      'admin.control_panel': 'Panneau de Contrôle',
      'profile.title': 'Mon Profil',
      'profile.orders': 'Mes Commandes',
      'profile.email_optional': 'Email (optionnel)',
      'profile.password_change': 'Changer le mot de passe',
      'profile.password_placeholder': 'Laisser vide pour conserver',
      'profile.save': 'Enregistrer',
      'profile.no_orders': 'Aucune commande',
      'profile.no_orders_msg': 'Vous n\'avez pas encore passé de commande chez YamiShop.',
      'profile.order_prefix': 'Commande',
      'profile.order_confirmed': 'Confirmée',
      'profile.order_pending': 'En attente',
      'profile.loading_orders': 'Chargement de vos commandes...',
      'profile.updated': 'Profil mis à jour !',
      'profile.invoice': 'Facture',
      'profile.download_invoice': 'Télécharger la facture',
      'cat.fashion': 'Vêtements',
      'cat.electronics': 'Électronique',
      'cat.home': 'Appareils de la Maison',
      'cat.beauty': 'Cosmétiques',
      'msg.added_to_cart': 'Produit ajouté au panier',
      'msg.item_removed': 'Produit retiré',
      'msg.logged_in': 'Connexion réussie',
      'msg.logged_out': 'Déconnexion réussie',
      'msg.order_placed': 'Commande effectuée avec succès !',
      'msg.error_occurred': 'Une erreur est survenue',
      'msg.profile_updated': 'Profil mis à jour !',
      'msg.register_success': 'Compte créé avec succès !',
      'msg.welcome': 'Bienvenue',
      'auth.error_required': 'Champ requis',
      'auth.error_phone': 'Numéro invalide (ex: 4XXXXXXX)',
      'auth.error_pwd_len': 'Minimum 6 caractères',
      'auth.error_pwd_match': 'Les mots de passe ne correspondent pas',
      'welcome.title': 'Bienvenue sur',
      'welcome.subtitle': 'Votre destination e-commerce numéro 1. Paiement à la livraison, simple et sécurisé.',
      'welcome.start': 'COMMENCER MES ACHATS',
      'welcome.login': 'SE CONNECTER',
      'shop.no_products': 'Aucun produit trouvé',
      'shop.no_products_msg': 'Nous n\'avons aucun article correspondant à ces critères pour le moment.',
      'shop.reset_filters': 'Réinitialiser les filtres'
    },
    ar: {
      'nav.home': 'الرئيسية',
      'nav.shop': 'المتجر',
      'nav.cart': 'السلة',
      'nav.profile': 'الملف الشخصي',
      'nav.register': 'إنشاء حساب',
      'nav.login': 'تسجيل الدخول',
      'nav.logout': 'تسجيل الخروج',
      'nav.search': 'ابحث عن منتج...',
      'footer.made_in': 'صنع بكل فخر في موريتانيا',
      'footer.developed_by': 'تم تطوير المنصة بواسطة',
      'home.shop_now': 'تسوق الآن',
      'home.cat_msg': 'تشكيلة مختارة لك',
      'home.all_msg': 'القطع الأكثر طلباً',
      'home.categories': 'أقسامنا',
      'home.category_label': 'القسم',
      'home.all_products': 'منتجاتنا المختارة',
      'home.full_catalog': 'المتجر الكامل',
      'product.add_to_cart': 'أضف للسلة',
      'product.buy_now': 'اشتري الآن',
      'product.stock_in': 'متوفر',
      'product.stock_out': 'نفذ',
      'product.description': 'الوصف',
      'product.colors': 'الألوان',
      'product.sizes': 'المقاسات',
      'product.features': 'المميزات',
      'product.shipping_info': 'نواكشوط فقط',
      'common.price_label': 'أوقية',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.back': 'رجوع',
      'common.contact': 'اتصل بنا :',
      'cart.title': 'سلة التسوق',
      'cart.empty': 'سلة التسوق فارغة حالياً',
      'cart.empty_msg': 'يبدو أنك لم تجد ما تبحث عنه بعد. استكشف أحدث مجموعاتنا!',
      'cart.total': 'الإجمالي',
      'cart.checkout': 'إتمام الطلب',
      'cart.clear': 'تفريغ السلة',
      'cart.quality_badge': 'منتج عالي الجودة',
      'cart.vat_included': 'شامل الضريبة',
      'cart.security_badge': 'أمان 100%',
      'checkout.title': 'تأكيد الطلب',
      'checkout.delivery': 'تفاصيل التوصيل',
      'checkout.name': 'الاسم الكامل',
      'checkout.address': 'عنوان التوصيل',
      'checkout.phone': 'رقم الهاتف',
      'checkout.confirm': 'تأكيد الشراء',
      'checkout.district_placeholder': 'اختر الحي الخاص بك',
      'checkout.fill_fields': 'يرجى ملء جميع الحقول المطلوبة',
      'checkout.exact_amount': 'يرجى تحضير المبلغ المحدد لتسهيل عملية التبادل مع المندوب.',
      'district.tevragh': 'تفرغ زينة',
      'district.ksar': 'لكصر',
      'district.teyarett': 'تيارت',
      'district.darnaim': 'دار النعيم',
      'district.toujounine': 'توجنين',
      'district.arafat': 'عرفات',
      'district.sebkha': 'السبخة',
      'district.elmina': 'الميناء',
      'district.riyadh': 'الرياض',
      'checkout.district_label': 'المقاطعة / الحي',
      'checkout.address_label': 'العنوان الدقيق',
      'checkout.payment_method': 'طريقة الدفع',
      'checkout.payment_cash': 'الدفع عند الاستلام',
      'checkout.summary': 'ملخص الطلب',
      'checkout.subtotal': 'المجموع الفرعي',
      'checkout.shipping_fee': 'رسوم التوصيل',
      'checkout.success_title': 'تم تأكيد طلبك!',
      'checkout.success_msg': 'شكراً لثقتكم بنا. سيتصل بكم عمال التوصيل قريباً على الرقم المسجل لتسليم طلبكم.',
      'checkout.order_num': 'رقم الطلب',
      'checkout.track_order': 'تتبع طلبي',
      'auth.register_title': 'إنشاء حساب جديد',
      'auth.please_login': 'يرجى التسجيل أو تسجيل الدخول لإتمام الطلب',
      'auth.remember_me': 'تذكرني',
      'auth.forgot_pwd': 'نسيت كلمة المرور؟',
      'auth.no_account': 'ليس لديك حساب؟',
      'auth.have_account': 'لديك حساب بالفعل؟',
      'auth.otp_verify': 'تأكيد رمز التحقق',
      'auth.otp_msg': 'تم إرسال رمز للتحقق من هويتكم.',
      'auth.otp_expire': 'تنتهي الصلاحية خلال',
      'auth.resend_otp': 'إعادة إرسال الرمز',
      'admin.dashboard': 'لوحة التحكم',
      'admin.stats': 'الإحصائيات',
      'admin.catalog': 'كتالوج المنتجات',
      'admin.orders': 'طلبات العملاء',
      'admin.settings': 'الإعدادات',
      'admin.control_panel': 'مركز الإدارة',
      'profile.title': 'ملفي الشخصي',
      'profile.orders': 'طلباتي',
      'profile.email_optional': 'البريد الإلكتروني (اختياري)',
      'profile.password_change': 'تغيير كلمة المرور',
      'profile.password_placeholder': 'اتركه فارغاً للحفاظ على الحالية',
      'profile.save': 'حفظ التغييرات',
      'profile.no_orders': 'لا توجد طلبات بعد',
      'profile.no_orders_msg': 'لم تقم بإجراء أي عمليات شراء في يامي شوب حتى الآن.',
      'profile.order_prefix': 'طلب رقم',
      'profile.order_confirmed': 'تم التأكيد',
      'profile.order_pending': 'قيد الانتظار',
      'profile.loading_orders': 'جاري تحميل طلباتك...',
      'profile.updated': 'تم تحديث الملف الشخصي بنجاح!',
      'profile.invoice': 'الفاتورة',
      'profile.download_invoice': 'تحميل الفاتورة',
      'cat.fashion': 'الملابس',
      'cat.electronics': 'إلكترونيات',
      'cat.home': 'الأجهزة المنزلية',
      'cat.beauty': 'مستحضرات التجميل',
      'msg.added_to_cart': 'تمت الإضافة إلى السلة بنجاح',
      'msg.item_removed': 'تمت إزالة المنتج من السلة',
      'msg.logged_in': 'تم تسجيل الدخول بنجاح',
      'msg.logged_out': 'تم تسجيل الخروج بنجاح',
      'msg.order_placed': 'تم إرسال طلبك بنجاح!',
      'msg.error_occurred': 'حدث خطأ ما، يرجى المحاولة لاحقاً',
      'msg.profile_updated': 'تم تحديث بياناتك بنجاح!',
      'msg.register_success': 'تم إنشاء حسابك بنجاح!',
      'msg.welcome': 'مرحباً',
      'auth.error_required': 'هذا الحقل مطلوب',
      'auth.error_phone': 'رقم غير صالح (مثال: 4XXXXXXX)',
      'auth.error_pwd_len': 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      'auth.error_pwd_match': 'كلمات المرور غير متطابقة',
      'welcome.title': 'مرحباً بكم في',
      'welcome.subtitle': 'وجهتكم الأولى للتسوق الإلكتروني. الدفع عند الاستلام، سهل وآمن.',
      'welcome.start': 'ابدأ التسوق',
      'welcome.login': 'تسجيل الدخول',
      'shop.no_products': 'لم يتم العثور على أي منتجات',
      'shop.no_products_msg': 'ليس لدينا أي عناصر تطابق هذه المعايير في الوقت الحالي.',
      'shop.reset_filters': 'إعادة ضبط الفلاتر'
    }
  };

  setLocale(locale: Locale) {
    this.currentLocale.set(locale);
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    localStorage.setItem('yamishop_locale', locale);
  }

  translate(key: string, locale?: Locale): string {
    const targetLocale = locale || this.currentLocale();
    return this.translations[targetLocale][key] || key;
  }

  translateCategory(category: string | undefined, locale?: Locale): string {
    if (!category) return '';
    const map: Record<string, string> = {
      'Mode': 'cat.fashion',
      'Vêtements': 'cat.fashion',
      'Électronique': 'cat.electronics',
      'Maison': 'cat.home',
      'Appareils de la Maison': 'cat.home',
      'Beauté': 'cat.beauty',
      'Cosmétiques': 'cat.beauty'
    };
    const key = map[category] || category;
    return this.translate(key, locale);
  }

  private translationCache = new Map<string, string>();

  async translateText(text: string, targetLocale: Locale): Promise<string> {
    if (!text || text.trim().length === 0) return text;
    
    // Auto-detect is best, but we assume source is either fr or ar.
    // If target is same as source (if we knew source), we'd skip.
    // Here we just use the cache.
    const cacheKey = `${targetLocale}:${text}`;
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey)!;
    }

    try {
      // Unofficial Google Translate API (client=gtx)
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLocale}&dt=t&q=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      // Data format: [[["translated_text", "source_text", ...]]]
      const translated = data[0].map((s: any) => s[0]).join('');
      
      this.translationCache.set(cacheKey, translated);
      return translated;
    } catch (e) {
      console.error('Translation failed', e);
      return text; // Fallback to original
    }
  }

  constructor() {
    const saved = localStorage.getItem('yamishop_locale') as Locale || 'ar';
    this.setLocale(saved);
  }
}
