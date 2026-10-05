import type {Locale} from '@/design-system/i18n/locale';
import {dictionary} from '@/lib/i18n';
import {site} from '@/lib/site';
export function SiteFooter({locale='en'}:{locale?:Locale}){const c=dictionary(locale);return <footer className="mt-16 border-t border-border"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10"><div><p className="text-sm">{site.name}</p><p className="mt-2 text-xs text-foreground/50">{c.role} · {site.author.location}</p></div><div className="flex gap-6 text-sm text-foreground/60"><a href={site.author.linkedin}>{c.profile} ↗</a><a href={'mailto:'+site.author.email}>{c.email}</a><span className="font-mono text-xs">© {new Date().getFullYear()}</span></div></div></footer>;}
