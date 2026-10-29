import test from 'node:test';
import assert from 'node:assert/strict';
import { UserStore, SYNTHETIC_SEED, type User } from '../src/users-store.js';

test('a user store snapshots its seed before constructing indexes', () => {
 const seed=structuredClone(SYNTHETIC_SEED.slice(0,1)) as User[];
 seed[0].group_badges=[{group_id:'group',username:'original',profile_image_url:null,role:'member'}];
 const expected=structuredClone(seed[0]);
 const store=new UserStore(seed,[]);
 seed[0].address='rewritten-address';
 seed[0].group_badges![0].username='rewritten';
 seed.push({...expected,address:'new-address',userId:'new-id'});
 assert.deepEqual(store.getById(expected.address),expected);
 assert.equal(store.list({}).length,1);
 assert.equal(store.getById('new-address'),undefined);
});

test('stores built from the same seed do not share mutable user rows', () => {
 const seed=structuredClone(SYNTHETIC_SEED.slice(0,1)) as User[];
 const first=new UserStore(seed,[]),second=new UserStore(seed,[]);
 const count=seed[0].followers;
 first.getById(seed[0].address)!.followers=count+1;
 assert.equal(second.getById(seed[0].address)!.followers,count);
 assert.equal(seed[0].followers,count);
});
