"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {buttonVariants} from './ui/button';
export function NotFoundContent(){const pathname=usePathname();const es=/^\/es(?:\/|$)/.test(pathname);const locale=es?'es':'en';return <div className="mx-auto max-w-2xl px-6 py-28"><p className="font-mono text-xs text-foreground/50">404</p><h1 className="mt-6 text-4xl font-medium tracking-tight">{es?'No encontramos esta página.':'This page could not be found.'}</h1><p className="mt-6 text-lg leading-8 text-foreground/65">{es?'Puedes volver al inicio o explorar los proyectos del portafolio.':'Return home or explore the portfolio projects.'}</p><div className="mt-9 flex gap-3"><Link href={`/${locale}`} className={buttonVariants()}>{es?'Inicio':'Home'}</Link><Link href={`/${locale}/projects`} className={buttonVariants({variant:'outline'})}>{es?'Proyectos':'Projects'}</Link></div></div>;}
