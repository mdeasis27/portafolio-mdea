"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ThemeToggle} from './theme-toggle';
import {LanguageSwitch} from '@/design-system/components/language-switch';
import {useLocale} from '@/design-system/i18n/context';
import {dictionary} from '@/lib/i18n';
export function SiteNav(){const locale=useLocale();const c=dictionary(locale);const pathname=usePathname();return <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4"><Link href={'/'+locale} className="font-mono text-sm font-semibold tracking-tight">MdA<span className="ml-3 hidden font-sans font-normal text-foreground/50 sm:inline">AI Product</span></Link><nav className="flex items-center gap-2">{[['',c.home],['/projects',c.projects],['/about',c.about]].map(([path,label])=><Link key={path} href={'/'+locale+path} className={'px-2 py-1 text-sm '+(pathname==='/'+locale+path?'text-foreground':'text-foreground/55')}>{label}</Link>)}<LanguageSwitch locale={locale}/><ThemeToggle/></nav></div></header>;}
