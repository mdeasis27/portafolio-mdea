import {NextResponse, type NextRequest} from 'next/server';
export function proxy(request:NextRequest) {
 const {pathname}=request.nextUrl;
 if(/^\/(en|es)(\/|$)/.test(pathname))return NextResponse.next();
 if(/^\/[a-z]{2}(\/|$)/.test(pathname))return NextResponse.next();
 const url=request.nextUrl.clone();url.pathname=`/en${pathname==='/'?'':pathname}`;return NextResponse.redirect(url);
}
export const config={matcher:['/((?!api(?:/|$)|_next(?:/|$)|opengraph-image$|.*\\.[^/]+$).*)']};
