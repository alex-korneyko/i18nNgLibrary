import {ModuleWithProviders, NgModule} from '@angular/core';
import {TranslatePipe} from './translate.pipe';
import {I18nDirective} from './i18n.directive';
import {I18nSelectorDirective} from './i18n-selector.directive';
import {I18nRouterLinkDirective} from './routing/i18n-router-link.directive';
import {I18nRouterLinkActiveDirective} from './routing/i18n-router-link-active.directive';
import {I18nPageTemplateComponent} from './i18n-page-tamplate/i18n-page-template.component';
import {I18nOptions} from './i18nOptions';
import {I18nLanguage} from './i18n-language';
import {Route, Router} from '@angular/router';



@NgModule({
  declarations: [
    TranslatePipe,
    I18nDirective,
    I18nSelectorDirective,
    I18nRouterLinkDirective,
    I18nRouterLinkActiveDirective,
    I18nPageTemplateComponent
  ],
  imports: [
  ],
  exports: [
    TranslatePipe,
    I18nPageTemplateComponent,
    I18nRouterLinkDirective,
    I18nSelectorDirective,
    I18nRouterLinkActiveDirective
  ]
})
export class I18nModule {

  constructor(router: Router) {
    if (I18nOptions.declaredLanguages == null || I18nOptions.declaredLanguages.length < 1) {
      throw new Error("Not defined any languages");
    }

    let defaultLangs = I18nOptions.declaredLanguages.filter(lang => lang.isDefault);

    if (defaultLangs.length !== 1) {
      I18nOptions.declaredLanguages.forEach(lang => lang.isDefault = false);
      I18nOptions.declaredLanguages[0].isDefault = true;
      console.error("The default language should only be one! " + I18nOptions.declaredLanguages[0].name + " defined as default!")
    }

    if (!I18nOptions.useRouting) {
      return;
    }

    let langRoutes = new Array<Route>();

    I18nOptions.declaredLanguages.forEach(language => {
      if (!language.isDefault) {
        router.config.forEach(route => {
          langRoutes.push({
            path: language.tag + (route.path === "" ? "" : "/") + route.path,
            component: route.component,
            data: route.data,
            pathMatch: route.pathMatch,
            children: route.children
          })
        })
      }
    });

    langRoutes.forEach(langRoute => {
      if (router.config.findIndex(rout => rout.path === langRoute.path) === -1) {
        router.config.push(langRoute);
      }
    });

    let index = router.config.findIndex(route => route.path === "**");
    if (index > -1) {
      let route404 = router.config[index];
      router.config.splice(index, 1);
      router.config.push(route404);
    }
  }

  public static setOptions(options: {languages: I18nLanguage[], useRouting?: boolean}):ModuleWithProviders<I18nModule> {

    I18nOptions.declaredLanguages = options.languages;
    I18nOptions.useRouting = options.useRouting ?? false;

    return {ngModule: I18nModule}
  }
}
