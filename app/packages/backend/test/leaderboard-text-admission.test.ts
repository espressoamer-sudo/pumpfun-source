import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LeaderboardStore} from '../src/leaderboard-store.js';
const fresh=()=>JSON.parse(readFileSync(new URL('../src/leaderboard-seed.json',import.meta.url),'utf8'));
test('leaderboard position text stays within its declared nullable string domain',()=>{
 for(const period of ['daily','weekly','monthly']) for(const field of ['mint','symbol','name','imageUri']){
  for(const value of [42,false,{},[],undefined,...(field==='mint'?[null]:[])]){
   const seed=fresh();seed[period][0].positions[0][field]=value;assert.throws(()=>new LeaderboardStore(seed),TypeError,field);
  }
 }
});
test('anonymous user IDs and nullable metadata remain supported',()=>{
 const seed=fresh();seed.daily[0].userId=null;
 seed.daily[0].positions[0].symbol=null;seed.daily[0].positions[0].name='한글';seed.daily[0].positions[0].imageUri=null;
 const row=new LeaderboardStore(seed).getBoard({period:'daily'}).entries.find(r=>r.walletAddress===seed.daily[0].walletAddress)!;
 assert.equal(row.userId,null);assert.equal(row.topPositions[0].name,'한글');
 for(const value of [1,false,{}]){const input=fresh();input.daily[0].userId=value;assert.throws(()=>new LeaderboardStore(input),TypeError);}
});
