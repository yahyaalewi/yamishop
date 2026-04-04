import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private lang = inject(LanguageService);

  private readonly siteName = 'YamiShop';

  updateTags(config: {
    title?: string;
    description?: string;
    image?: string;
    keywords?: string;
    type?: string;
  } = {}) {
    const title = config.title 
      ? `${config.title} | ${this.siteName}` 
      : this.lang.translate('seo.home_title');
    
    const description = config.description || this.lang.translate('seo.home_description');
    const keywords = config.keywords || this.lang.translate('seo.home_keywords');

    this.title.setTitle(title);
    
    // Primary Meta Tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    
    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: config.image || 'https://yamishop.store/banner.png' });
    this.meta.updateTag({ property: 'og:type', content: config.type || 'website' });
    
    // Twitter
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: config.image || 'https://yamishop.store/banner.png' });
  }
}
