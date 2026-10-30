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
import users from '../src/users-seed.json' with {type:'json'};
const row={...structuredClone(users[0]),group_badges:Array.from({length:500},(_,i)=>({group_id:`group-${i}`,username:`group-${i}`,role:'member',profile_image_url:null}))} as User;
measure('verify-profile-with-badges',1,()=>{const store=new UserStore([row], [row.address]);return {read:()=>[store.isVerified(row.address),store.isVerified(row.userId!),store.isVerified('unknown')]};},250,{badges:500});
