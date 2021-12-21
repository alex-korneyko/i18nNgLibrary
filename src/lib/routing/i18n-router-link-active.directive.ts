import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {NavigationEnd, Router} from "@angular/router";
import {I18nService} from "../i18n.service";
import {IRouterLinkActiveOptions} from "./irouter-link-active-options";

@Directive({
  selector: '[i18nRouterLinkActive]'
})
export class I18nRouterLinkActiveDirective implements AfterViewInit{

  @Input()
  i18nRouterLinkActive = "";

  @Input()
  i18nRouterLinkActiveOptions: IRouterLinkActiveOptions | undefined;

  constructor(private router: Router, private el: ElementRef, private i18nService: I18nService) { }

  ngAfterViewInit(): void {
    let htmlLInk = this.el.nativeElement as HTMLLinkElement;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let navigationEndEvent = event as NavigationEnd;

        let htmlElemNavigationPath = this.i18nService.GetNavigationPath(htmlLInk.href)

        if (navigationEndEvent.url.startsWith(htmlElemNavigationPath)) {
          if (this.i18nRouterLinkActiveOptions?.exact) {
            //Если нужно точное совпадение, то сравниваю ещё и длинну
            if (htmlElemNavigationPath.length >= navigationEndEvent.url.length) {
              this.el.nativeElement.classList.add(this.i18nRouterLinkActive);
            } else {
              this.el.nativeElement.classList.remove(this.i18nRouterLinkActive);
            }
          } else {
            this.el.nativeElement.classList.add(this.i18nRouterLinkActive);
          }
        } else {
          this.el.nativeElement.classList.remove(this.i18nRouterLinkActive)
        }
      }
    })
  }
}
