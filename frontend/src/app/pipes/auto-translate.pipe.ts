import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'autoTranslate',
  standalone: true,
  pure: false
})
export class AutoTranslatePipe implements PipeTransform {
  private lang = inject(LanguageService);

  transform(value: string | undefined | null): string {
    if (!value) return '';
    return this.lang.autoTranslate(value);
  }
}
