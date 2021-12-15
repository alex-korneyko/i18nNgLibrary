import {AfterViewInit, Directive, ElementRef, HostListener, Input} from '@angular/core';
import {I18nService} from "./i18n.service";
import {NavigationEnd, Router} from "@angular/router";
import {I18nOptions} from "./i18nOptions";

@Directive({
  selector: '[i18nSelector]'
})
export class I18nSelectorDirective implements AfterViewInit{

  @Input()
  i18nSelector = "en"

  constructor(private i18nService: I18nService, private el: ElementRef, private router: Router) { }

  @HostListener("click")
  mouseClickHandler() {
    if (!I18nOptions.useRouting) {
      this.i18nService.SetLanguage(this.i18nSelector);
    }
  }

  ngAfterViewInit(): void {
    let HTMLLinkElement = this.el.nativeElement as HTMLLinkElement;

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let navEndEvent = event as NavigationEnd;

        //Если это селектор для текущего выбранного языка, то присвоить ссылке текущий урл и выйти из метода
        if (this.i18nSelector === this.i18nService.currentLangTag) {
          HTMLLinkElement.href = navEndEvent.url;
          return;
        }

        //Если дошли сюда, значит это селектор НЕ для текущего выбранного языка
        // но это селектор для дефолтного языка, значит в текущем урле по любому есть тег языка.
        // Удаляем его и записываем в ссылку
        if (this.i18nService.IsDefaultLang(this.i18nSelector)) {
          HTMLLinkElement.href = navEndEvent.url.substr(this.i18nService.GetDefaultLang().tag.length + 1);
          return;
        }

        //Если дошли сюда, значит это селектор НЕ для текущего выбранного языка и НЕ для дефолтного языка
        //Значит урл может содержать а может и НЕ содержать тег языка
        let urlWithoutLang = navEndEvent.url
        I18nOptions.declaredLanguages.forEach(lang => {
          if (urlWithoutLang.startsWith("/" + lang.tag)) {
            urlWithoutLang = urlWithoutLang.substr(lang.tag.length + 1);
          }
        });
        HTMLLinkElement.href = "/" + this.i18nSelector + urlWithoutLang;
      }
    })
  }
}
