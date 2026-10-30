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
import {LeaderboardStore,type RawLeaderboardEntry} from '../src/leaderboard-store.js';
import {UserStore} from '../src/users-store.js';
import seed from '../src/leaderboard-seed.json' with {type:'json'};
const count=5_000;
const rows=Array.from({length:count},(_,i)=>({...structuredClone(seed.daily[0]),userId:null,walletAddress:`wallet-${i}`,positions:[],pnlUsd:(i*7919)%count,realizedPnlUsd:(i*619)%count,unrealizedPnlUsd:(i*43)%count} as RawLeaderboardEntry));
measure('pnl-rankings',count*3,()=>{const store=new LeaderboardStore({daily:rows,weekly:rows,monthly:rows},new UserStore([]));return {read:()=>store.getBoard({period:'daily',sort:'realized',limit:5,positionsLimit:0})};},100);
