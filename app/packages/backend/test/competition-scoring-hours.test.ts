import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>structuredClone(seedData) as RawCompetition[];
test('scoring endpoints must land on a UTC hour as documented',()=>{
 for(const field of ['startsAt','endsAt'] as const) for(const value of ['2025-01-01T00:01:00Z','2025-01-01T00:00:01Z','2025-01-01T00:00:00.001Z']){
  const seed=fresh();seed[0][field]=value;assert.throws(()=>new CompetitionStore(seed),/hour/i);
 }
});
test('null and offset-spelled exact UTC hours remain supported',()=>{
 for(const field of ['startsAt','endsAt'] as const) for(const value of [null,'2025-01-01T00:00:00Z','2025-01-01T01:00:00+01:00']){
  const seed=fresh();seed[0][field]=value;assert.doesNotThrow(()=>new CompetitionStore(seed));
 }
});
