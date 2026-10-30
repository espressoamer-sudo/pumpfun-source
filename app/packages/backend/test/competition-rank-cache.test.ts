import test from 'node:test';
import assert from 'node:assert/strict';
import seedData from '../src/competitions-seed.json' with {type:'json'};
import {CompetitionStore,type RawCompetition} from '../src/competitions-store.js';
const fresh=()=>structuredClone(seedData.find(c=>c.slug==='degen-derby-2024')) as RawCompetition;
test('repeated internal ranking reads retain isolation and request-specific limits',()=>{
 const seed=fresh();const store=new CompetitionStore([seed]);
 const before=store.getByIdOrSlug(seed.id,{limit:2,positionsLimit:1})!;
 const changed=store.getByIdOrSlug(seed.id,{limit:2,positionsLimit:1})!;
 changed.leaderboard.entries[0].pnlUsd=-100;changed.competition.title='changed';
 assert.deepEqual(store.getByIdOrSlug(seed.id,{limit:2,positionsLimit:1}),before);
 assert.equal(store.getByIdOrSlug(seed.id,{limit:1,positionsLimit:0})!.leaderboard.entries.length,1);
 assert.equal(store.getByIdOrSlug(seed.id,{limit:1,positionsLimit:0})!.leaderboard.entries[0].topPositions.length,0);
});
test('public raw competition views still observe caller mutations',()=>{
 const raw=fresh();const store=new CompetitionStore([raw]);store.getByIdOrSlug(raw.id);
 const before=store.toCompetitionView(raw).top[0].entryId;
 const next=raw.entries.find(e=>e.entryId!==before)!;next.pnlUsd=Number.MAX_SAFE_INTEGER;
 assert.equal(store.toCompetitionView(raw).top[0].entryId,next.entryId);
 next.pnlUsd=-Number.MAX_SAFE_INTEGER;
 assert.notEqual(store.toCompetitionView(raw).top[0].entryId,next.entryId);
});
