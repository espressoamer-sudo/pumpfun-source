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
import {UserStore,type User} from '../src/users-store.js';
import seed from '../src/users-seed.json' with {type:'json'};
const count=5_000;
const rows=Array.from({length:count},(_,i)=>({...structuredClone(seed[0]),userId:`user-${i}`,address:`wallet-${i}`,username:`user-${i}`,group_badges:[],followers:(i*7919)%count} as User));
measure('user-order',count,()=>{const store=new UserStore(rows,[]);return {read:()=>store.list({sort:'followers',order:'desc',offset:0,limit:5})};},100);
