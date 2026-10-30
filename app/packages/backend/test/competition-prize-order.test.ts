import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>[structuredClone(seedData.find(c=>c.slug==='winter-warfare'))] as RawCompetition[];
test('prize tiers are ascending and do not overlap inclusive rank boundaries',()=>{
 for(const ranges of [[[1,2],[2,3]],[[1,4],[2,3]],[[3,4],[1,2]],[[1,1],[1,1]]]){
  const seed=fresh();seed[0].prizes=ranges.map(([rankFrom,rankTo])=>({rankFrom,rankTo,amount:'synthetic prize'}));
  assert.throws(()=>new CompetitionStore(seed),/prize|overlap|ascending/i);
 }
});
test('gaps and adjacent nonoverlapping ranges preserve supplied prizes',()=>{
 for(const ranges of [[],[[1,1]],[[1,1],[2,3]],[[1,1],[3,4]]]){
  const seed=fresh();seed[0].prizes=ranges.map(([rankFrom,rankTo])=>({rankFrom,rankTo,amount:'2 SOL'}));
  assert.deepEqual(new CompetitionStore(seed).getByIdOrSlug(seed[0].id)!.competition.prizes,seed[0].prizes);
 }
});
