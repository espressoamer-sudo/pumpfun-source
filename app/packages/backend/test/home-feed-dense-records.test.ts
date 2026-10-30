import test from 'node:test';
import assert from 'node:assert/strict';
import { HomeFeedStore, HomeFeedSeedError, validateHomeFeedSeed } from '../src/home-feed-store.js';
import seed from '../src/home-feed-seed.json' with {type:'json'};
test('home-feed admission rejects every missing record position',()=>{
 for(const records of [new Array(1),[,structuredClone(seed.records[0])],[structuredClone(seed.records[0]),,]]){
  const input={...structuredClone(seed),records};
  assert.throws(()=>validateHomeFeedSeed(input),HomeFeedSeedError);
  assert.throws(()=>new HomeFeedStore(input),HomeFeedSeedError);
 }
});
test('explicit empty and dense synthetic home-feed snapshots remain valid',()=>{
 assert.equal(validateHomeFeedSeed({...structuredClone(seed),records:[]}).records.length,0);
 assert.equal(validateHomeFeedSeed(structuredClone(seed)).records.length,seed.records.length);
});
