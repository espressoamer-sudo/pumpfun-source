import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>structuredClone(seedData) as RawCompetition[];
test('competition display text cannot escape its declared string domain',()=>{
 for(const field of ['title','description','prizeCopy','imageUrl']) for(const value of [42,false,{},[],undefined,...(field==='imageUrl'?[]:[null])]){
  const seed=fresh();(seed[0] as any)[field]=value;assert.throws(()=>new CompetitionStore(seed),TypeError,field);
 }
 const seed=fresh();(seed[0].prizes[0] as any).amount=42;assert.throws(()=>new CompetitionStore(seed),TypeError);
});
test('competition roster and token projections require their text and boolean facts',()=>{
 const mutate=[
  (s:RawCompetition[])=>{(s[1].entries[0] as any).participantId=42;},
  (s:RawCompetition[])=>{(s[1].entries[0] as any).walletAddress=42;},
  (s:RawCompetition[])=>{(s[2].entries[0].members![0] as any).userId=false;},
  (s:RawCompetition[])=>{(s[2].entries[0].members![0] as any).walletAddress=42;},
  (s:RawCompetition[])=>{(s[2].entries[0].members![0] as any).fresh='true';},
  (s:RawCompetition[])=>{(s[1].entries[0].positions![0] as any).symbol=[];},
  (s:RawCompetition[])=>{(s[1].entries[0].highlightTokens![0] as any).mint=42;},
  (s:RawCompetition[])=>{(s[1].entries[0].highlightTokens![0].members[0] as any).walletAddress=42;},
 ];
 for(const change of mutate){const seed=fresh();change(seed);assert.throws(()=>new CompetitionStore(seed),TypeError);}
});
test('empty display copy, null metadata and omitted scoring wallets stay valid',()=>{
 const seed=fresh();seed[0].description='';seed[0].prizeCopy='';seed[0].imageUrl=null;seed[0].title='한글';
 const view=new CompetitionStore(seed).getByIdOrSlug(seed[0].id)!;
 assert.equal(view.competition.title,'한글');assert.equal(view.competition.description,'');
});
