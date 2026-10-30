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
import {PostStore,type RawPost} from '../src/posts-store.js';
import {UserStore} from '../src/users-store.js';
import seed from '../src/posts-seed.json' with {type:'json'};
const row=(postId:string):RawPost=>({...structuredClone(seed[0]) as RawPost,postId,authorId:'unknown',mentions:[],kind:'root',deleted:false,hidden:false,parentPostId:null,rootPostId:null,quotedPostId:null,repostedPostId:null});
const parents=Array.from({length:100},(_,i)=>row(`parent-${i}`));
const children=Array.from({length:10_000},(_,i)=>({...row(`post-${i}`),kind:i%2?'reply':'quote',parentPostId:`parent-${i%100}`,quotedPostId:i%2?null:`parent-${i%100}`} as RawPost));
measure('post-relations',children.length+parents.length,()=>{const store=new PostStore([...parents,...children],new UserStore([]));return {read:()=>[store.getReplies('parent-0',{limit:3}),store.getQuotes('parent-0',{limit:3})]};},100);
