// Synthetic local read benchmark. No network, wallets, SDK calls or captured runtime.
import {createHash} from 'node:crypto';
function measure(label:string, count:number, create:()=>{read:()=>unknown}, iterations:number, details:Record<string,unknown>={}) {
 const start=performance.now();const fixture=create();const constructorMs=performance.now()-start;
 let last:unknown;for(let i=0;i<3;i++)last=fixture.read();
 const times:number[]=[];
 for(let trial=0;trial<5;trial++){const start=performance.now();for(let i=0;i<iterations;i++)last=fixture.read();times.push(performance.now()-start);}
 times.sort((a,b)=>a-b);
 console.log(JSON.stringify({label,rows:count,iterations,trials:5,constructorMs,medianMs:times[2],resultSha256:createHash('sha256').update(JSON.stringify(last)).digest('hex'),...details}));
}
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
import {UserStore} from '../src/users-store.js';
import seed from '../src/competitions-seed.json' with {type:'json'};
const comp=structuredClone(seed.find(c=>c.slug==='degen-derby-2024')) as RawCompetition;
const count=3_000;const row=comp.entries[0];
comp.entries=Array.from({length:count},(_,i)=>({...structuredClone(row),entryId:`entry-${i}`,participantId:`user-${i}`,walletAddress:`wallet-${i}`,positions:[],highlightTokens:[],pnlUsd:(i*7919)%count}));
measure('competition-rankings',count,()=>{const store=new CompetitionStore([comp],new UserStore([]));return {read:()=>store.getByIdOrSlug(comp.id,{limit:3,positionsLimit:0})};},60);
