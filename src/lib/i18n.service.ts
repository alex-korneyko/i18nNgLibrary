import { Injectable } from '@angular/core';
import {I18nOptions} from "./i18nOptions";
import {NavigationStart, Router} from "@angular/router";
import {I18nLanguage} from "./i18n-language";

@Injectable({
  providedIn: 'root'
})
export class I18nService {

  currentLangTag = "en"
  platformLanguage = "platformLanguage"
  private langChangeListeners = new Array<(lang: string) => void>();
  browserLanguageTag: string;


  constructor(private router: Router) {
    this.browserLanguageTag = window.navigator.language ?? this.GetDefaultLang().tag;
    this.browserLanguageTag = this.browserLanguageTag.substr(0, 2).toLowerCase();
    this.browserLanguageTag = this.GetLanguageByTagOrDefault(this.browserLanguageTag).tag;
    let localStorageLanguage = localStorage.getItem(this.platformLanguage);
    this.currentLangTag = localStorageLanguage ?? this.browserLanguageTag;

    this.SetLanguageFromPathUrl();
  }

  GetDeclaredLanguages(): Array<I18nLanguage> {
    return I18nOptions.declaredLanguages;
  }

  SetLanguage(lang: string) {
    this.currentLangTag = lang;
    localStorage.setItem(this.platformLanguage, lang);
    this.langChangeListeners.forEach(listener => listener(lang));

    if (I18nOptions.useRouting) {
      let currentRoute = this.router.url;
      I18nOptions.declaredLanguages.forEach(language => {
        if (currentRoute.startsWith("/" + language.tag + "/") || (currentRoute.startsWith("/" + language.tag) && currentRoute.length === language.tag.length + 1)) {
          currentRoute = currentRoute.substr(language.tag?.length + 1)
        }
      });
      currentRoute = (this.IsDefaultLang(lang) ? "" : lang) + (currentRoute === "/" ? "" : currentRoute);
      this.router.navigateByUrl(currentRoute);
    }
  }

  SetLanguageFromPathUrl() {
    if (!I18nOptions.useRouting) {
      return;
    }

    this.router.events.subscribe((value) => {
      //инициализация переменной тега языка из урла тегом дефолтного языка
      let langTagByUrl = this.GetDefaultLang().tag;

      if (value instanceof NavigationStart) {
        let navStartEvent = value as NavigationStart;
        //Перебираем все зарегистрированные языки
        I18nOptions.declaredLanguages.forEach(language => {
          //Если урл начинается с тега языка...
          if (navStartEvent.url.startsWith("/" + language.tag)) {
            //...и это дефолтный язык
            if (this.IsDefaultLang(language.tag)) {
              //...то ставлю дефолтный язык как текущий язык приложения
              this.currentLangTag = langTagByUrl;
              localStorage.setItem(this.platformLanguage, langTagByUrl);
              this.langChangeListeners.forEach(listener => listener(langTagByUrl));
              //...и переход по этому же урлу но без тега языка
              this.router.navigateByUrl(navStartEvent.url.substr(langTagByUrl.length + 1))
            }
            //...и это НЕ дефолтный язык, то записываю в переменную хранящую тег языка из урла и выход из forEach
            langTagByUrl = language.tag;
            return;
          }
        });

        //Если в урле не оказалось тега языка и в localStorage нет сохранённого тега
        if (localStorage.getItem(this.platformLanguage) == null) {

          localStorage.setItem(this.platformLanguage, this.browserLanguageTag);
          this.langChangeListeners.forEach(listener => listener(this.browserLanguageTag));

          if (this.IsDefaultLang(this.browserLanguageTag)) {
            this.router.navigateByUrl(navStartEvent.url.length === 1 ? "" : navStartEvent.url)
          } else {
            this.router.navigateByUrl("/" + this.browserLanguageTag + (navStartEvent.url.length === 1 ? "" : navStartEvent.url))
          }
          return;
        }

        this.currentLangTag = langTagByUrl;
        localStorage.setItem(this.platformLanguage, langTagByUrl);
        this.langChangeListeners.forEach(listener => listener(langTagByUrl));
      }
    });
  }

  GetLanguageByTagOrDefault(tag: string): I18nLanguage {
    let index = I18nOptions.declaredLanguages.findIndex(lang => lang.tag === tag);
    if (index > -1) {
      return I18nOptions.declaredLanguages[index];
    } else {
      return this.GetDefaultLang();
    }
  }

  GetTranslate(key: string, lang?: string): string {
    let currentLangModule: any;

    let requestedLang = lang ?? this.currentLangTag;

    let index = I18nOptions.declaredLanguages.findIndex(language => language.tag === requestedLang);
    if (index > -1) {
      currentLangModule = I18nOptions.declaredLanguages[index].localeJsonModule;
    } else {
      index = I18nOptions.declaredLanguages.findIndex(language => language.isDefault);
      console.error(`Requested by tag '${requestedLang}' language module not found.
      Will be used default language: '${I18nOptions.declaredLanguages[index].name}'`)
      currentLangModule = I18nOptions.declaredLanguages[index].localeJsonModule;
    }

    if (currentLangModule == null) {
      return "";
    }

    let valuesChain = key.split(".");

    let result = currentLangModule;
    valuesChain.forEach(value => result = result[value])

    return result;
  }

  AddLanguageChangeListener(action: (lang: string) => void) {
    this.langChangeListeners.push(action);
  }

  RemoveLanguageChangeListener(action: (lang: string) => void) {
    let index = this.langChangeListeners.findIndex(act => act === action);
    if (index > -1) {
      this.langChangeListeners.splice(index, 1);
    }
  }

  IsDefaultLang(langTag: string) {
    return this.GetDefaultLang().tag === langTag;
  }

  GetDefaultLang(): I18nLanguage {
    let index = I18nOptions.declaredLanguages.findIndex(lang => lang.isDefault);
    if (index > -1) {
      return I18nOptions.declaredLanguages[index];
    }

    I18nOptions.declaredLanguages[0].isDefault = true;
    return I18nOptions.declaredLanguages[0];
  }

  GetNavigationPath(url: string): string {
    if (url === "") {
      return "";
    }

    let urlWithoutParams = url.split("?")[0];
    let splitUrl = urlWithoutParams.split("://");
    let urlNavigationPart = "";
    let urlSegments: string[];

    if (splitUrl.length > 1) {
      urlSegments = splitUrl[1].split("/");
      urlSegments.splice(0, 1);
    } else {
      urlSegments = splitUrl[0].split("/");
    }

    urlSegments.forEach(segment => urlNavigationPart += ("/" + segment));

    return urlNavigationPart;
  }
}
