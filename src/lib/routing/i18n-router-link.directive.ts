import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {ActivatedRoute, Router, RouterLinkWithHref} from "@angular/router";
import {LocationStrategy} from "@angular/common";
import {I18nService} from "../i18n.service";
import {I18nOptions} from "../i18nOptions";

@Directive({
  selector: '[i18nRouterLink]'
})
export class I18nRouterLinkDirective extends RouterLinkWithHref implements AfterViewInit {

  @Input()
  i18nRouterLink = "";

  constructor(router: Router, route: ActivatedRoute, locationStrategy: LocationStrategy, private i18nService: I18nService, private el: ElementRef) {
    super(router, route, locationStrategy)
  }

  ngAfterViewInit() {
    let nativeElement = this.el.nativeElement;

    if (!I18nOptions.useRouting) {
      super.routerLink = this.i18nRouterLink;
      return;
    }

    // let hrefLangLink: string;

    let hrefLangLink = this.i18nService.IsDefaultLang(this.i18nService.currentLangTag)
      ? (this.i18nRouterLink.startsWith("/")
        ? this.i18nRouterLink
        : "/" + this.i18nRouterLink)
      : "/" + this.i18nService.currentLangTag + (this.i18nRouterLink.startsWith("/") ? this.i18nRouterLink : "/" + this.i18nRouterLink);

    if (hrefLangLink.endsWith("/")) {
      hrefLangLink = hrefLangLink.substr(0, hrefLangLink.length - 1);
    }

    nativeElement.href = hrefLangLink;
    super.routerLink = hrefLangLink;

    this.i18nService.AddLanguageChangeListener(langTag => {
      if (this.i18nService.IsDefaultLang(langTag)) {
        super.routerLink = this.i18nRouterLink;
        nativeElement.href = this.i18nRouterLink;
      } else {
        let linkWithLang = "/" + langTag + (this.i18nRouterLink.startsWith("/") ? "" : "/") + this.i18nRouterLink;
        super.routerLink = linkWithLang;
        nativeElement.href = linkWithLang;
      }
      if (nativeElement.href.endsWith("/")) {
        nativeElement.href = nativeElement.href.substr(0, nativeElement.href.length - 1)
      }
    })
  }
}
