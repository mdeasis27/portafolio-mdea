import type {Locale} from '@/design-system/i18n/locale';
import {en} from './en';
import {es} from './es';
export function dictionary(locale:Locale) {return locale==='es'?es:en;}
