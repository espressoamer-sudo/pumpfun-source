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
import {FollowingStore} from '../src/following-store.js';
import {UserStore} from '../src/users-store.js';
const count=20_000;
const edges=Array.from({length:count},(_,i)=>({follower_id:`actor-${i}`,following_id:`target-${i%32}`,timestamp:i}));
measure('follow-counts',count,()=>{const store=new FollowingStore(new UserStore([]),edges);return {read:()=>[store.countFollowers('target-1'),store.countFollowing('actor-1'),store.countFollowers('unknown')]};},250);
