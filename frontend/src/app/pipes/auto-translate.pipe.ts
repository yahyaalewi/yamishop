import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'autoTranslate',
  standalone: true,
  pure: false  // must be impure to react to cacheVersion signal updates
})
export class AutoTranslatePipe implements PipeTransform {
  private lang = inject(LanguageService);

  transform(value: string | undefined | null): string {
    if (!value) return '';
    // Reading cacheVersion() registers this pipe as a dependent of the signal,
    // so Angular re-evaluates when new batch translations arrive.
    this.lang.cacheVersion();
    return this.lang.autoTranslate(value);
  }
}
