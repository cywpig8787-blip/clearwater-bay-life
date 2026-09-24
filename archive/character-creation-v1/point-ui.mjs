import {rules,attributes,AllocationEngine,sum,validateCharacter,validateAllocation} from './points.mjs?v=ledger-v3';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pointPanel(character,message='') {
  const engine=new AllocationEngine(character),result=engine.ledger(),errors=validateCharacter(character);
  const verification=validateAllocation(character,result.skills);
  const budgets=['academic','skills'].map(kind=>engine.summary(kind));
  return `<p class="attribute-total">能力值已分配／總額：<b>${sum(character.attr)} / ${rules.attributeTotal}</b></p>
    <div class="pool-budgets">${budgets.map(b=>`<section class="card pool-budget" aria-label="${b.kind==='academic'?'Academic':'Other'} 點數預算" data-budget="${b.kind}"><h3>${b.kind==='academic'?'Academic Skills · 學科':'Other Skills · 其他技能'}</h3><dl>${[['base','Base · 基礎'],['bonus','Bonus · 加成摘要'],['total','Total Available · 總可用'],['allocated','Allocated · 已支付投入'],['remaining','Remaining · 剩餘']].map(([key,label])=>`<div><dt>${label}</dt><dd data-budget-value="${key}">${b[key]}</dd></div>`).join('')}</dl>
    <div class="allocation-proof" data-allocation-status="${verification.valid?'valid':'invalid'}"><p><b>${verification.valid?'來源驗證通過':'來源驗證失敗：總額相符不代表合法'}</b></p><p>Base 實際已用：${result.sources.find(s=>s.id===(b.kind==='academic'?'academic':'general')).used} / 200</p></div>
    ${b.unfunded?`<p class="point-error">草稿要求 ${b.requested} 點，其中 ${b.unfunded} 點未支付。請降低技能值或調整能力值；此配置無法完成創角。</p>`:''}</section>`).join('')}</div>
    <p class="hint">Bonus 是獨立來源，沒有分類歸屬。加成摘要＝已支付本類技能的加成＋仍可支付本類技能的來源餘額；共用來源只存在一份，兩區總可用不可直接相加。實際能否投入依各技能的合法來源判定。</p>
    <p class="hint">一般創角：能力值單項上限 65，技能單項上限 75。能力值需分配完 250 點；技能點可保留。</p>
    ${character.dev?'<p class="point-warning">Developer Override 已啟用：可突破能力值總額與單項上限、技能單項上限；仍須由合法點數來源支付，不額外免費發點。</p>':''}
    <p class="point-error" role="status">${escape(message||errors.join(' '))}</p>
    <details id="point-sources" class="card" ${character.sourcesOpen?'open':''}><summary>Point Sources / Calculation · 點數來源／計算方式</summary>
      <p class="hint">同一份 Bonus 只有一個額度，不會按技能群重複發放。手動調整時會重新尋找合法付款組合；重骰只釋放並分配所選分類的付款。能力值 ≤ 50 不扣基礎點。</p>
      ${result.sources.map(source=>`<section class="point-source" data-source="${source.id}"><h3>${source.label}：${source.amount} 點</h3>
        ${attributes.includes(source.id)?`<p><code>${source.id} Bonus = max(0, ${character.attr[source.id]} - ${rules.baseline}) = ${source.amount}</code></p>`:'<p>所有角色固定獲得 200 點，只支付所列分類的合法技能。</p>'}
        <p>已用 ${source.used} ／剩餘 ${source.remaining}</p><p class="hint">可投入：${source.eligibleSkills.join('、')}</p>
        <p class="hint">實際流向：${source.allocations.map(a=>`${a.name} ${a.points}`).join('、')||'尚未投入'}</p></section>`).join('')}
      <section class="point-source"><h3>Skill Allocation · 每項技能的點數來源</h3>${result.skills.filter(skill=>skill.allocated>0).map(skill=>`<p>${skill.name} ${skill.allocated} = ${skill.sources.map(payment=>`${result.sources.find(s=>s.id===payment.poolId).label} ${payment.points}`).join(' + ')||'0'}${skill.unfunded?` + 未支付 ${skill.unfunded}`:''}</p>`).join('')||'<p>尚未分配技能點。</p>'}</section>
      ${result.unfunded?`<p class="point-error">尚有 ${result.unfunded} 點沒有可用來源。未支付點數不計入 Allocated，且會阻擋完成創角。</p>`:''}
    </details>`;
}
