export class I18nLanguage {
  tag = "";
  name: string | undefined;
  localeJsonModule: any;
  isDefault = false;

  constructor(tag: string, name: string | undefined, localeJsonModule: any, isDefault = false) {
    this.tag = tag;
    this.name = name;
    this.localeJsonModule = localeJsonModule;
    this.isDefault = isDefault;
  }
}
