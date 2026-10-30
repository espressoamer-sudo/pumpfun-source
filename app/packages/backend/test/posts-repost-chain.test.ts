import test from 'node:test';
import assert from 'node:assert/strict';
import {PostStore,SYNTHETIC_POSTS_SEED,type RawPost} from '../src/posts-store.js';
const row=(postId:string,kind:RawPost['kind'],target:string|null=null):RawPost=>({...structuredClone(SYNTHETIC_POSTS_SEED[0]),postId,kind,repostedPostId:target,hidden:false,deleted:false});
test('a live wrapper cannot make an unavailable repost target servable',()=>{
 for(const unavailable of [undefined,{...row('leaf','root'),hidden:true},{...row('leaf','root'),deleted:true}]){
  const rows=[row('outer','repost','middle'),row('middle','repost','leaf'),...(unavailable?[unavailable]:[])];
  const store=new PostStore(rows);
  assert.equal(store.getLivePost('middle'),undefined);
  assert.equal(store.getLivePost('outer'),undefined);
  assert.deepEqual(store.batch(['outer','middle']),[]);
 }
});
test('self and multi-post repost cycles have no servable terminal target',()=>{
 for(const rows of [[row('one','repost','one')],[row('one','repost','two'),row('two','repost','one')]]){
  const store=new PostStore(rows);
  assert.deepEqual(store.batch(rows.map(r=>r.postId)),[]);
 }
});
test('an ordinary live terminal target preserves existing bounded hydration',()=>{
 const store=new PostStore([row('outer','repost','middle'),row('middle','repost','leaf'),row('leaf','root')]);
 assert.equal(store.getLivePost('outer')?.reposted?.postId,'middle');
 assert.equal(store.getLivePost('middle')?.reposted?.postId,'leaf');
});
