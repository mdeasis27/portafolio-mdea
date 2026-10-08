import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SiteFooter} from '@/components/site-footer';
import {SiteNav} from '@/components/site-nav';
import {ThemeProvider} from '@/components/theme-provider';
import {fontVariables} from '@/design-system/fonts';
import {LocaleProvider} from '@/design-system/i18n/context';
import {isLocale} from '@/design-system/i18n/locale';
import {dictionary} from '@/lib/i18n';
import {site} from '@/lib/site';
import '../globals.css';
export function generateStaticParams(){return [{lang:'en'},{lang:'es'}];}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata> {
 const {lang}=await params;
 if(!isLocale(lang))return {};
 const c=dictionary(lang);
 return {
  metadataBase:new URL(site.url),
  title:{default:site.name+' · AI Product',template:'%s · '+site.name},
  description:c.homeIntro,
  alternates:{languages:{en:'/en',es:'/es'}},
  openGraph:{
   title:site.name+' · AI Product',description:c.homeIntro,locale:lang==='es'?'es_MX':'en_US',
   images:[{url:new URL('/opengraph-image',site.url).toString(),width:1200,height:630,alt:site.name+' · AI Product'}],
  },
 };
}
export default async function RootLayout({children,params}:{children:React.ReactNode;params:Promise<{lang:string}>}){const {lang}=await params;if(!isLocale(lang))notFound();return <html lang={lang} suppressHydrationWarning><body className={fontVariables+' min-h-screen bg-background font-sans text-foreground antialiased'}><ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange><LocaleProvider locale={lang}><div className="flex min-h-screen flex-col"><SiteNav/><main className="flex-1">{children}</main><SiteFooter locale={lang}/></div></LocaleProvider></ThemeProvider></body></html>;}
