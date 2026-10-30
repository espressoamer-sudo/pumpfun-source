import test from 'node:test';
import assert from 'node:assert/strict';
import {PostStore,SYNTHETIC_POSTS_SEED} from '../src/posts-store.js';
const fresh=()=>structuredClone(SYNTHETIC_POSTS_SEED.slice(0,1));
test('posts reject invalid nullable text before serving malformed JSON',()=>{
 for(const field of ['content','mediaUrl','parentPostId','rootPostId','quotedPostId','repostedPostId'] as const){
  for(const value of [42,false,{},[],undefined]){const seed=fresh();(seed[0] as any)[field]=value;assert.throws(()=>new PostStore(seed),TypeError,field);}
  for(const value of [null,'','Unicode: 한글 🐱']){const seed=fresh();seed[0][field]=value;assert.doesNotThrow(()=>new PostStore(seed));}
 }
});
test('post mentions require complete dense text records',()=>{
 for(const mentions of [null,{},[null],new Array(1),[{userId:1,username:'x',walletAddress:null}],[{userId:'x',username:false,walletAddress:null}],[{userId:'x',username:'x',walletAddress:42}]]){
  const seed=fresh();seed[0].mentions=mentions as never;assert.throws(()=>new PostStore(seed),TypeError);
 }
 const seed=fresh();seed[0].mentions=[{userId:'u',username:'한글',walletAddress:null}];
 assert.deepEqual(new PostStore(seed).getLivePost(seed[0].postId)?.mentions,seed[0].mentions);
});
