import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>structuredClone(seedData) as RawCompetition[];
test('fresh member counts cannot contradict the materialized roster',()=>{
 for(const count of [-1,0,1,3,1.5]){const seed=fresh();seed[2].entries[0].membersFresh=count;assert.throws(()=>new CompetitionStore(seed),/fresh/i);}
 for(const count of [-1,2,1.5]){const seed=fresh();seed[1].entries[0].membersFresh=count;assert.throws(()=>new CompetitionStore(seed),/fresh/i);}
});
test('a matching refreshed roster and person zero-or-one counts remain accepted',()=>{
 const seed=fresh();seed[2].entries[0].members![0].fresh=false;seed[2].entries[0].membersFresh=1;
 for(const count of [0,1]){seed[1].entries[0].membersFresh=count;assert.doesNotThrow(()=>new CompetitionStore(seed));}
});
