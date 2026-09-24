import {ledger,summary} from './point-source-ledger.mjs';
import {attributes} from './character-data.mjs';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pointPanel(s,message=''){
 const l=ledger(s);
 return `<p class="attribute-total">能力值已分配／總額：<b>${Object.values(s.attr).reduce((a,b)=>a+b,0)} / 250</b></p>
 <div class="pool-budgets">${['academic','skills'].map(kind=>{const b=summary(s,kind);return `<section class="card pool-budget" data-budget="${kind}"><h3>${kind==='academic'?'Academic · 學科':'Other · 其他技能'}</h3><dl>${[['base','Base · 固定基礎'],['bonus','Bonus · 此刻適用額度'],['total','Total Available · 總可用'],['allocated','Allocated · 已投入'],['remaining','Remaining · 剩餘']].map(([key,label])=>`<div><dt>${label}</dt><dd data-budget-value="${key}">${b[key]}</dd></div>`).join('')}</dl></section>`;}).join('')}</div>
 <p class="hint">Bonus 各自獨立，沒有 Academic／Other 歸屬。同一來源可跨類支付，但只有一份餘額；兩區總可用不能相加。此刻適用額度包含已支付本類的 Bonus 與仍可用於本類的 Bonus 餘額，個別技能仍受適用範圍限制。</p>
 <p class="hint">能力值總額 250、單項上限 65；技能單項上限 75。技能點可保留。調整能力值若使既有技能無法支付，整筆變更會取消。</p>
 ${s.dev?'<p class="point-warning">Developer Override 已啟用：可突破能力值與技能上限，但不額外發放點數；所有技能仍須合法付款。</p>':''}
 <p class="point-error" role="status">${esc(message)}</p>
 <details id="point-sources" class="card" ${s.sourcesOpen?'open':''}><summary>Point Sources / Calculation · 來源與付款紀錄</summary>
 <p class="allocation-proof" data-allocation-status="valid">來源驗證通過：所有投入均有合法來源，餘額非負。</p>
 ${attributes.map(id=>`<p><code>${id} Bonus = max(0, ${s.attr[id]} − 50) = ${Math.max(0,s.attr[id]-50)}</code></p>`).join('')}
 ${l.sources.map(source=>`<section class="point-source" data-source="${source.id}"><h3>${source.label}：${source.amount}</h3><p>已用 ${source.used} ／剩餘 ${source.remaining}</p><p class="hint">可投入：${source.eligibleSkills.map(esc).join('、')}</p><p>實際流向：${source.allocations.map(a=>`${esc(a.name)} ${a.points}`).join('、')||'尚未投入'}</p></section>`).join('')}
 <section class="point-source"><h3>每項技能的 contribution sources</h3>${l.skills.filter(x=>x.allocated).map(x=>`<p>${esc(x.name)} ${x.allocated} = ${Object.entries(x.contributions).map(([id,n])=>`${id} ${n}`).join(' + ')}</p>`).join('')||'<p>尚未投入</p>'}</section></details>`;
}
