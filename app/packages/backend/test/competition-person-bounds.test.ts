import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>structuredClone(seedData) as RawCompetition[];
test('person competition member bounds describe the single trader actually projected',()=>{
 for(const field of ['minMembers','maxMembers'] as const) for(const value of [0,2,-1,1.5]){
  const seed=fresh();seed[0][field]=value;assert.throws(()=>new CompetitionStore(seed),/person|member/i);
 }
});
test('singleton person and existing group bounds retain their values',()=>{
 const seed=fresh();const store=new CompetitionStore(seed);
 for(const comp of seed){const view=store.getByIdOrSlug(comp.id)!.competition;assert.equal(view.minMembers,comp.minMembers);assert.equal(view.maxMembers,comp.maxMembers);}
});
