import {Directive, ViewContainerRef} from '@angular/core';

@Directive({
  selector: '[appI18n]'
})
export class I18nDirective {

  constructor(public viewContainerRef: ViewContainerRef) { }

}
