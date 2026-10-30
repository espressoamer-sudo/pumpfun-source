import test from 'node:test';
import assert from 'node:assert/strict';
import {UserStore} from '../src/users-store.js';
test('sorted pages remain detached after repeated reads in every supported order',()=>{
 const store=new UserStore();
 for(const sort of ['followers','following','address','username'])for(const order of ['asc','desc']){
  const options={sort,order,offset:0,limit:2};const before=store.list(options);const changed=store.list(options);
  changed[0].username='changed';changed[0].followers=-1;
  assert.deepEqual(store.list(options),before);
 }
});
test('unknown sort keys retain insertion order and empty pages remain empty',()=>{
 const store=new UserStore();
 assert.deepEqual(store.list({sort:'unknown',order:'desc',limit:2}),store.list({limit:2}));
 assert.deepEqual(store.list({sort:'followers',offset:1_000_000,limit:2}),[]);
});
