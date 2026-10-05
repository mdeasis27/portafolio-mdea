"use client";

import {useState} from 'react';
import type {Locale} from '@/design-system/i18n/locale';

interface Scenario {title:string;input:string;observation:string;}
export function CaseExperiment({scenarios,mechanism,locale}:{scenarios:Scenario[];mechanism:string;locale:Locale}) {
  const [active,setActive]=useState(0);
  const en=locale==='en';
  const scenario=scenarios[active];
  if(!scenario)return null;
  return <section className="mt-10 border-y border-border py-8" aria-label={en?'Explore the business decision':'Explora la decisión de negocio'}>
    <p className="font-mono text-xs uppercase tracking-[.18em] text-accent">{en?'Your first experiment':'Tu primer experimento'}</p>
    <h2 className="mt-3 text-2xl font-medium tracking-tight">{en?'One workflow. Two different consequences.':'Un proceso. Dos consecuencias distintas.'}</h2>
    <div className="mt-5 grid gap-2 sm:grid-cols-2">{scenarios.map((item,index)=><button type="button" key={item.title} aria-pressed={index===active} onClick={()=>setActive(index)} className={`rounded-xl border px-4 py-4 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${index===active?'border-accent bg-accent/10':'border-border hover:border-accent/50'}`}><span className="mr-2 font-mono text-xs text-accent">0{index+1}</span>{item.title}</button>)}</div>
    <dl className="mt-6 grid gap-5 border-l-2 border-accent pl-5" aria-live="polite">{[[en?'Change the conditions':'Cambia las condiciones',scenario.input],[en?'Follow the process':'Sigue el proceso',mechanism],[en?'Expected behavior in the demo':'Comportamiento esperado en la demo',scenario.observation]].map(([title,text])=><div key={title}><dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{title}</dt><dd className="mt-2 text-sm leading-7">{text}</dd></div>)}</dl>
    <p className="mt-6 text-xs leading-5 text-muted-foreground">{en?'This previews the scenario. Open the interactive demo to edit its inputs and compute the result.':'Esta vista explica el escenario. Abre la demo interactiva para editar sus datos y calcular el resultado.'}</p>
  </section>;
}
