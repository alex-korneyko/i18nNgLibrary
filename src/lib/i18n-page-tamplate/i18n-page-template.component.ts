import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild
} from '@angular/core';
import {I18nService} from "../i18n.service";
import {I18nDirective} from "../i18n.directive";

@Component({
  selector: 'i18n-page-template',
  templateUrl: './i18n-page-template.component.html',
  styleUrls: ['./i18n-page-template.component.css']
})
export class I18nPageTemplateComponent implements OnInit, OnDestroy {

  @ViewChild("i18nTemplate")
  i18nTemplateRef: ElementRef | undefined;

  @ViewChild(I18nDirective, {static: true})
  contentHost: I18nDirective | undefined;

  @Input()
  templatesSet = new Array<{key: string, template: Type<any>}>()

  constructor(private i18nService: I18nService, private componentFactoryResolver: ComponentFactoryResolver) {
    i18nService.AddLanguageChangeListener(this.langChangeHandler)
  }

  ngOnInit(): void {
    this.langChangeHandler(this.i18nService.currentLangTag)
  }

  ngOnDestroy() {
    this.i18nService.RemoveLanguageChangeListener(this.langChangeHandler)
  }

  private langChangeHandler = (langKey: string): void => {
    let index = this.templatesSet.findIndex(template => template.key === langKey);
    if (index > -1) {
      let template = this.templatesSet[index].template;
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(template);
      let viewContainerRef = this.contentHost?.viewContainerRef;
      viewContainerRef?.clear();
      viewContainerRef?.createComponent(componentFactory);
    }
  }
}
