import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,readFile} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const output=process.env.BROWSER_OUTPUT||'/tmp/npc-generator-browser';
await mkdir(output,{recursive:true});
const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1','--directory','web'],{stdio:'ignore'});
const url='http://127.0.0.1:8776/npc-generator/';
let browser;
const key='cbl-npc-generator-v2';
const forbidden=/SECRET|undefined|personality|dislikes|unlikedTalent|familyDynamic/;
try{
 for(let i=0;i<50;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);await page.waitForSelector('.card',{state:'attached'});assert.equal(await page.locator('.card').count(),12);
 assert.ok(await page.locator('#copy').isDisabled());
 await page.locator('#spin').click();
 for(let i=0;i<12;i++)await page.locator('#spin').click();
 assert.equal(await page.locator('.card .value').filter({hasText:'？？？'}).count(),0);
 assert.equal(await page.locator('#warnings').isVisible(),false);
 const value=await page.locator('[data-field="hair"] .value').innerText();
 await page.locator('[data-field="hair"] .lock').click();await page.locator('#spin').click();assert.equal(await page.locator('[data-field="hair"] .value').innerText(),value);
 await page.locator('#lockAll').click();const before=await page.locator('#grid').innerText();await page.locator('#spin').click();assert.equal(await page.locator('#grid').innerText(),before);
 await page.locator('#unlock').click();await page.locator('[data-field="core"] .mini').click();assert.equal(await page.locator('#warnings').isVisible(),false);
 await page.locator('#copy').click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.ok(copied.includes('【身體】'));assert.equal(copied.split('\n').filter(x=>x.includes('：')).length,12);assert.ok(!/cm|身體比例|眼距|膚色底調|髮量|鞋履|配件/.test(copied));assert.ok(!forbidden.test(copied));
 const dl=page.waitForEvent('download');await page.locator('#download').click();const download=await dl;await download.saveAs(path.join(output,'appearance.txt'));assert.equal(await readFile(path.join(output,'appearance.txt'),'utf8'),copied);
 await page.locator('#archBtn').click();const history=await page.locator('#log').innerText();assert.ok(!forbidden.test(history));
 const hd=page.waitForEvent('download');await page.locator('#exportHistory').click();await (await hd).saveAs(path.join(output,'history.txt'));assert.equal(await readFile(path.join(output,'history.txt'),'utf8'),history);
 await page.reload();await page.waitForSelector('.card',{state:'attached'});const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.version,4);assert.equal(Object.keys(saved.values).length,12);
 for(const width of [320,390,768,1536]){
  await page.setViewportSize({width,height:900});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
  assert.equal(await page.locator('.card:visible').count(),12);
  if(width<=390){assert.ok(await page.locator('#grid').evaluate(el=>el.getBoundingClientRect().height<1250),'mobile result too tall');}
  await page.screenshot({path:path.join(output,`appearance-${width}.png`),fullPage:true});
 }
 await page.locator('#clear').click();assert.ok(await page.locator('#copy').isDisabled());assert.ok(await page.locator('#grid').isHidden());
 await page.locator('#archBtn').click();assert.equal(await page.locator('#log').innerText(),history);
 await page.reload();await page.waitForSelector('.card',{state:'attached'});assert.ok(await page.locator('#copy').isDisabled());await page.locator('#spin').click();assert.ok(!(await page.locator('#copy').isDisabled()));
 // Old current values, history, locks, metadata and recent lists are all cleaned.
 await page.evaluate(k=>{const s=JSON.parse(localStorage.getItem(k));s.version=3;s.values.personality={label:'SECRET'};s.values.hair.likes='SECRET';s.recent.dislikes=['SECRET'];s.locked.personality=true;s.history[0].values.familyDynamic={label:'SECRET'};localStorage.setItem(k,JSON.stringify(s));},key);
 await page.reload();await page.waitForSelector('.card',{state:'attached'});assert.ok(!forbidden.test(await page.evaluate(k=>localStorage.getItem(k),key)));assert.ok(!(await page.locator('#log').innerText()).includes('SECRET'));
 // Blocked clipboard keeps history available as a copy fallback.
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('blocked')}}}));await page.locator('#copy').click();assert.ok(await page.locator('#arch').isVisible());assert.ok((await page.locator('#notice').innerText()).includes('未允許複製'));
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('blocked')}});await page.locator('#spin').click();assert.ok((await page.locator('#saveState').innerText()).includes('無法保存'));assert.equal(await page.locator('.card .value').filter({hasText:'？？？'}).count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: 12 compact primary fields; generation/reroll/locks; clipboard and text download; history export; reload/clear; v3 cleanup; blocked storage/clipboard; 320/390/768/1536px without overflow; no page errors.');
}finally{await browser?.close();server.kill();}
