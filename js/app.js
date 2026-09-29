import {today,money,displayDate,cents,validDate,makeEntry,normalize,summarize,occurrencesFor,economyBalance} from './finance.js';
const $ = id => document.getElementById(id);
const state = {uid:null,data:normalize(),ready:false,profile:{},unsubscribe:null,session:0,editing:null,dirty:false,writing:false,settling:null,customMonths:[],clearRevision:0,currentPage:'inicio',visitedPages:new Set(),dashboardAnimated:false,metricAnimationToken:0,connectionNotified:false};
let repository, noticeTimer;
const stored = (key,fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
const remember = (key,value) => { try { localStorage.setItem(key,value); } catch { /* Preferência não impede o uso. */ } };
function notify(message,error=false) { $('notice').textContent=message; $('notice').classList.toggle('error',error); $('notice').hidden=false; clearTimeout(noticeTimer); noticeTimer=setTimeout(()=>$('notice').hidden=true,8000); }
function errorMessage(error) {
  if (!error.code) return error.message || 'Não foi possível concluir. Tente novamente.';
  const messages = {'auth/invalid-login-credentials':'E-mail ou senha inválidos.','auth/invalid-credential':'E-mail ou senha inválidos.','auth/wrong-password':'E-mail ou senha inválidos.','auth/user-not-found':'E-mail ou senha inválidos.','auth/email-already-in-use':'Este e-mail já está cadastrado.','auth/weak-password':'Use uma senha com pelo menos 6 caracteres.','auth/invalid-email':'Informe um e-mail válido.','auth/network-request-failed':'Sem conexão. Verifique sua internet.','auth/too-many-requests':'Muitas tentativas. Aguarde um pouco e tente novamente.','permission-denied':'Acesso negado ao banco de dados. Verifique as permissões da conta.','unavailable':'Não foi possível conectar. Seus campos foram preservados para tentar novamente.','resource-exhausted':'O armazenamento atingiu um limite. Exporte seus dados e contate o suporte.'};
  return messages[error.code] || 'Não foi possível concluir. Seus dados não foram confirmados. Tente novamente.';
}
async function formTask(form,errorId,action) {
  if (form.dataset.busy) return;
  form.dataset.busy='true'; $(errorId).textContent='';
  const controls=[...form.querySelectorAll('input,select,button')].map(node=>[node,node.disabled]);
  controls.forEach(([node])=>node.disabled=true); form.setAttribute('aria-busy','true');
  try { await action(); } catch(error) { $(errorId).textContent=errorMessage(error); }
  finally {controls.forEach(([node,disabled])=>node.disabled=disabled);delete form.dataset.busy;form.removeAttribute('aria-busy');}
}
async function write(operation) {
  if (!state.ready || !state.uid) throw new Error('Aguarde os dados da conta carregarem.');
  if (state.writing) throw new Error('Aguarde a gravação atual terminar.');
  const uid=state.uid, session=state.session;
  state.writing=true; updateConnection();
  try { await repository.mutate(uid,operation); if(session!==state.session) throw new Error('A sessão mudou. Entre novamente para conferir o resultado.'); }
  finally {state.writing=false;updateConnection();}
}
function showAuth(id) { for(const form of $('auth').querySelectorAll('form')) form.hidden=form.id!==id; $('authError').textContent=''; }
for(const button of document.querySelectorAll('[data-auth]')) button.addEventListener('click',()=>showAuth(button.dataset.auth));
$('loginForm').addEventListener('submit',e=>{e.preventDefault();const email=$('emailLogin').value.trim(),password=$('senhaLogin').value,keep=$('rememberLogin').checked;formTask(e.currentTarget,'authError',()=>repository.login(email,password,keep));});
$('resetForm').addEventListener('submit',e=>{e.preventDefault();const email=$('emailRecuperacao').value.trim();formTask(e.currentTarget,'authError',async()=>{await repository.resetPassword(email);notify('Se houver uma conta para este e-mail, você receberá as instruções.');});});
$('registerForm').addEventListener('submit',e=>{e.preventDefault();const nome=$('nomeCadastro').value.trim();const profile={nome,sobrenome:$('sobrenomeCadastro').value.trim(),apelido:$('apelidoCadastro').value.trim()||nome,email:$('emailCadastro').value.trim(),temaPadrao:'claro',fontePadrao:'Urbanist, sans-serif'};const password=$('senhaCadastro').value,confirm=$('confirmaSenha').value,file=$('fotoCadastro').files[0];formTask(e.currentTarget,'authError',async()=>{
  if(!profile.nome || !profile.sobrenome) throw new Error('Preencha nome e sobrenome.');
  if(password!==confirm) throw new Error('As senhas não coincidem.');
  if(file) profile.fotoPerfil=await readPhoto(file);
  try {await repository.register(profile.email,password,profile);} catch(error) {notify(errorMessage(error),true);throw error;}
  if(state.uid){state.profile=profile;renderProfile();}notify('Conta criada com sucesso.');
});});
async function readPhoto(file) {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>5*1024*1024) throw new Error('Escolha uma imagem PNG, JPEG ou WebP de até 5 MB.');
  const bitmap=await createImageBitmap(file); const canvas=document.createElement('canvas');
  const ratio=Math.min(1,160/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*ratio));canvas.height=Math.max(1,Math.round(bitmap.height*ratio));
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();return canvas.toDataURL('image/jpeg',.8);
}
function safePhoto(value) { return typeof value==='string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length<150000 ? value : ''; }
function renderProfile() {
  const profile=state.profile, photo=safePhoto(profile.fotoPerfil),displayName=profile.apelido||profile.nome||'Minha conta';
  $('userName').textContent=displayName;$('avatarInitials').textContent=(displayName || 'U').slice(0,1).toUpperCase();
  $('avatarImage').hidden=!photo;$('avatarInitials').hidden=!!photo;
  if(photo) $('avatarImage').src=photo; else $('avatarImage').removeAttribute('src');
  $('profileName').value=profile.nome || '';$('profileSurname').value=profile.sobrenome || '';$('profileNickname').value=profile.apelido || profile.nome || '';
  $('photoPreview').hidden=!photo;if(photo) $('photoPreview').src=photo;else $('photoPreview').removeAttribute('src');
}
function applyAppearance(){document.body.classList.toggle('dark',$('themeSelect').value==='escuro');document.body.style.fontFamily=$('fontSelect').value;}
const savedTheme=stored('temaSolon','claro'),savedFont=stored('fonteSolon','Urbanist, sans-serif');$('themeSelect').value=['claro','escuro'].includes(savedTheme)?savedTheme:'claro';$('fontSelect').value=[...$('fontSelect').options].some(option=>option.value===savedFont)?savedFont:'Urbanist, sans-serif';applyAppearance();
$('profileForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget;if(form.dataset.busy)return;const session=state.session,uid=state.uid;
  const nome=$('profileName').value.trim(),sobrenome=$('profileSurname').value.trim(),apelido=$('profileNickname').value.trim()||nome,file=$('profilePhoto').files[0];
  const theme=$('themeSelect').value,font=$('fontSelect').value;
  form.dataset.busy='true';const button=form.querySelector('[type=submit]');const controls=[...form.querySelectorAll('input,select,button')];controls.forEach(control=>control.disabled=true);
  try {if(!nome||!sobrenome)throw new Error('Preencha nome e sobrenome.');const profile={nome,sobrenome,apelido,temaPadrao:theme,fontePadrao:font};if(file)profile.fotoPerfil=await readPhoto(file);await repository.saveProfile(uid,profile);if(state.session!==session)return;state.profile={...state.profile,...profile};remember('temaSolon',theme);remember('fonteSolon',font);applyAppearance();renderProfile();$('profilePhoto').value='';notify('Configurações salvas.');}
  catch(error){notify(errorMessage(error),true);}finally{delete form.dataset.busy;controls.forEach(control=>control.disabled=false);}
});
$('profilePhoto').addEventListener('change',async()=>{const session=state.session;try{const file=$('profilePhoto').files[0];if(file){const photo=await readPhoto(file);if(session===state.session){$('photoPreview').src=photo;$('photoPreview').hidden=false;}}}catch(error){$('profilePhoto').value='';notify(errorMessage(error),true);}});
const desktop=matchMedia('(min-width:900px)');
const mobileNavigation=matchMedia('(max-width:899px)');
const pageOrder=['inicio','receitas','despesas','economia','configuracoes'];
const appShell=document.querySelector('.app-shell');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
function setSidebarCollapsed(collapsed,persist=true){
  appShell.classList.toggle('sidebar-collapsed',collapsed);
  $('sidebarCollapse').setAttribute('aria-pressed',String(collapsed));
  $('sidebarCollapse').setAttribute('aria-label',collapsed?'Expandir menu lateral':'Recolher menu lateral');
  if(persist)remember('sidebarCollapsed',String(collapsed));
}
setSidebarCollapsed(stored('sidebarCollapsed','false')==='true',false);
$('sidebarCollapse').addEventListener('click',()=>setSidebarCollapsed(!appShell.classList.contains('sidebar-collapsed')));
function setSettingsMenu(open,focus=false){
  $('settingsMenu').hidden=!open;$('settingsToggle').setAttribute('aria-expanded',String(open));
  if(focus){if(open)$('settingsMenu').querySelector('button').focus();else $('settingsToggle').focus();}
}
$('settingsToggle').addEventListener('click',()=>setSettingsMenu($('settingsMenu').hidden,true));
document.addEventListener('click',e=>{if(!$('settingsMenu').hidden&&!e.target.closest('.settings-anchor'))setSettingsMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('settingsMenu').hidden){e.preventDefault();setSettingsMenu(false,true);}});
function animatePage(target,direction){
  if(reducedMotion.matches)return;
  target.classList.remove('page-enter-forward','page-enter-back');void target.offsetWidth;
  target.classList.add(direction==='back'?'page-enter-back':'page-enter-forward');
  target.addEventListener('animationend',()=>target.classList.remove('page-enter-forward','page-enter-back'),{once:true});
}
function showPage(page,{direction,focus=true,animate=true}={}){
  if(!pageOrder.includes(page))return;
  const previous=state.currentPage,from=pageOrder.indexOf(previous),to=pageOrder.indexOf(page);
  const target=$(`page-${page}`);state.currentPage=page;
  document.querySelectorAll('.page').forEach(el=>el.hidden=el!==target);
  document.querySelectorAll('[data-page]').forEach(button=>{if(button.dataset.page===page)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
  if(page==='configuracoes')$('settingsToggle').setAttribute('aria-current','page');else $('settingsToggle').removeAttribute('aria-current');
  setSettingsMenu(false);
  const visitFirst=!state.visitedPages.has(page);state.visitedPages.add(page);
  if(animate&&(previous!==page||visitFirst))animatePage(target,direction||(to<from?'back':'forward'));
  if(page==='inicio'&&state.ready&&!state.dashboardAnimated)render();
  if(focus)$('main').focus({preventScroll:true});
}
for(const button of document.querySelectorAll('[data-page]'))button.addEventListener('click',()=>showPage(button.dataset.page));
async function logout(){if(state.writing){notify('Aguarde a gravação terminar.',true);return;}try{await repository.logout();}catch(error){notify(errorMessage(error),true);}}
$('headerLogoutButton').addEventListener('click',logout);for(const button of document.querySelectorAll('[data-logout]'))button.addEventListener('click',logout);
$('notificationButton').addEventListener('click',()=>notify('A central de notificações já está preparada para uma próxima etapa.'));
function updateConnection(){
  const el=$('connectionStatus');let status='loading',text='Carregando dados…';
  if(!navigator.onLine){status='offline';text='Sem conexão. Os dados exibidos podem estar desatualizados; reconecte para salvar.';}
  else if(state.writing){status='saving';text='Salvando…';}
  else if(state.ready){status='ready';text='Dados carregados. Alterações são confirmadas na nuvem.';if(!state.connectionNotified){state.connectionNotified=true;notify('Dados sincronizados com a nuvem.');}}
  el.dataset.state=status;el.textContent=text;
}
addEventListener('online',updateConnection);addEventListener('offline',updateConnection);
let swipeStart=null;
$('main').addEventListener('touchstart',e=>{
  if(!mobileNavigation.matches||e.touches.length!==1||document.querySelector('dialog[open]')||e.target.closest('input,select,textarea,button,label'))return;
  const touch=e.touches[0];swipeStart={x:touch.clientX,y:touch.clientY,page:state.currentPage};
},{passive:true});
$('main').addEventListener('touchend',e=>{
  if(!swipeStart||!mobileNavigation.matches){swipeStart=null;return;}
  const touch=e.changedTouches[0],dx=touch.clientX-swipeStart.x,dy=touch.clientY-swipeStart.y;swipeStart=null;
  if(Math.abs(dx)<64||Math.abs(dx)<Math.abs(dy)*1.25)return;
  const index=pageOrder.indexOf(state.currentPage),next=index+(dx<0?1:-1);if(next<0||next>=pageOrder.length)return;
  showPage(pageOrder[next],{direction:dx<0?'forward':'back'});
},{passive:true});
$('monthFilter').value=today().slice(0,7);$('monthFilter').addEventListener('change',render);
function node(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
function action(text,handler,label=text){const button=node('button',text);button.type='button';button.setAttribute('aria-label',label);button.addEventListener('click',handler);return button;}
function list(id,items,renderer,empty){const target=$(id);target.replaceChildren();if(!items.length){target.append(node('li',empty,'empty'));return;}items.forEach(item=>target.append(renderer(item)));}
function dashboardBreakdown(summary){
  const incomeRows=summary.rows.filter(row=>row.collection==='receitas'),expenseRows=summary.rows.filter(row=>row.collection==='despesas');
  const sum=(rows,key)=>rows.reduce((total,row)=>total+(row[key]||0),0);
  return {incomeReceived:sum(incomeRows,'paymentCents'),incomeReceivable:sum(incomeRows,'outstandingCents'),expensePaid:sum(expenseRows,'paymentCents'),expensePayable:sum(expenseRows,'outstandingCents')};
}
function setDashboardMetrics(summary,breakdown,commitment,animate=false){
  $('balanceTotal').className=summary.balance<0?'expense':'income';$('actualBalanceTotal').className=breakdown.incomeReceived-breakdown.expensePaid<0?'expense':'income';
  const incomePct=summary.income?Math.min(100,breakdown.incomeReceived/summary.income*100):0,expensePct=summary.expenses?Math.min(100,breakdown.expensePaid/summary.expenses*100):0;
  const setFrame=(progress)=>{
    const eased=1-Math.pow(1-progress,3);
    const actualBalance=breakdown.incomeReceived-breakdown.expensePaid;
    $('incomeTotal').textContent=money(Math.round(summary.income*eased));$('expenseTotal').textContent=money(Math.round(summary.expenses*eased));$('balanceTotal').textContent=money(Math.round(summary.balance*eased));$('actualBalanceTotal').textContent=money(Math.round(actualBalance*eased));
    $('incomeReceived').textContent=money(Math.round(breakdown.incomeReceived*eased));$('incomeReceivable').textContent=money(Math.round(breakdown.incomeReceivable*eased));$('expensePaid').textContent=money(Math.round(breakdown.expensePaid*eased));$('expensePayable').textContent=money(Math.round(breakdown.expensePayable*eased));
    $('incomeProgressBar').style.width=`${incomePct*eased}%`;$('expenseProgressBar').style.width=`${expensePct*eased}%`;$('incomeProgressLabel').textContent=`${Math.round(incomePct*eased)}%`;$('expenseProgressLabel').textContent=`${Math.round(expensePct*eased)}%`;
    $('commitmentValue').textContent=commitment===null?(progress<1?'0%':'Sem renda'):`${Math.round(commitment*eased)}%`;
  };
  if(!animate||reducedMotion.matches){setFrame(1);if(state.currentPage==='inicio')state.dashboardAnimated=true;return;}
  state.dashboardAnimated=true;const token=++state.metricAnimationToken,start=performance.now(),duration=760;const grid=document.querySelector('.dashboard-grid');grid?.classList.add('first-load');
  const tick=now=>{if(token!==state.metricAnimationToken)return;const progress=Math.min(1,(now-start)/duration);setFrame(progress);if(progress<1)requestAnimationFrame(tick);else setTimeout(()=>grid?.classList.remove('first-load'),520);};requestAnimationFrame(tick);
}
function renderCommitments(rows){
  const target=$('commitmentList'),todayValue=today();target.replaceChildren();
  const pending=rows.filter(row=>row.collection==='despesas'&&row.outstandingCents>0).sort((a,b)=>{const ao=!a.estimated&&a.date<todayValue,bo=!b.estimated&&b.date<todayValue;if(ao!==bo)return ao?-1:1;return a.date.localeCompare(b.date);});
  $('commitmentCount').textContent=pending.length===1?'1 próximo':`${pending.length} próximos`;
  if(!pending.length){target.append(node('li','Nenhum compromisso pendente.','empty'));return;}
  pending.slice(0,5).forEach(row=>{const li=node('li'),button=node('button',undefined,'commitment-item');button.type='button';const copy=node('span',undefined,'commitment-copy');copy.append(node('strong',row.name));const overdue=!row.estimated&&row.date<todayValue,detail=row.estimated?'Dia a confirmar':`${overdue?'Venceu':'Vence'} ${displayDate(row.date)}`;copy.append(node('small',detail));const amount=node('span',undefined,'commitment-amount');amount.append(node('strong',money(row.outstandingCents)));amount.append(node('small',row.partial?'Parcial':overdue?'Atrasada':'A pagar',overdue?'overdue':''));button.append(copy,amount);button.addEventListener('click',()=>settle(row));li.append(button);target.append(li);});
}
function dashboardDetailRows(rows){const body=$('dashboardDetailBody');body.replaceChildren();rows.forEach(([label,value])=>{const row=node('div',undefined,'dashboard-detail-row');row.append(node('span',label),node('strong',value));body.append(row);});}
function openDashboardDetail(kind){
  const month=$('monthFilter').value,summary=summarize(state.data,month),breakdown=dashboardBreakdown(summary),dialog=$('dashboardDetailDialog'),action=$('dashboardDetailAction');
  const labels={receitas:['Receitas','Detalhes das receitas'],despesas:['Despesas','Detalhes das despesas'],fluxo:['Fluxo','Resumo do período']};const [eyebrow,title]=labels[kind]||labels.fluxo;$('dashboardDetailEyebrow').textContent=eyebrow;$('dashboardDetailTitle').textContent=title;
  if(kind==='receitas'){dashboardDetailRows([['Previsto',money(summary.income)],['Recebido',money(breakdown.incomeReceived)],['A receber',money(breakdown.incomeReceivable)]]);action.hidden=false;action.textContent='Abrir receitas';action.dataset.targetPage='receitas';}
  else if(kind==='despesas'){dashboardDetailRows([['Previsto',money(summary.expenses)],['Pago',money(breakdown.expensePaid)],['A pagar',money(breakdown.expensePayable)]]);action.hidden=false;action.textContent='Abrir despesas';action.dataset.targetPage='despesas';}
  else {dashboardDetailRows([['Balanço atual',money(breakdown.incomeReceived-breakdown.expensePaid)],['Balanço previsto',money(summary.balance)],['Comprometimento',summary.commitment===null?'Sem renda':`${Math.round(summary.commitment)}%`]]);action.hidden=true;delete action.dataset.targetPage;}
  dialog.showModal();
}
for(const card of document.querySelectorAll('[data-dashboard-detail]'))card.addEventListener('click',()=>openDashboardDetail(card.dataset.dashboardDetail));
$('closeDashboardDetail').addEventListener('click',()=>$('dashboardDetailDialog').close());$('dashboardDetailAction').addEventListener('click',()=>{const target=$('dashboardDetailAction').dataset.targetPage;if(target){$('dashboardDetailDialog').close();showPage(target);}});
function reviewIssues(){
  const issues=[];
  for(const collection of ['receitas','despesas'])for(const entry of state.data[collection]){
    if(entry.pendingReview)issues.push({collection,id:entry.id,name:entry.name,detail:'Datas pendentes. Este lançamento está fora dos totais.'});
    else if(entry.mode==='legacy'&&entry.occurrences.some(item=>item.estimated))issues.push({collection,id:entry.id,name:entry.name,detail:'Confirme os dias preservados na migração antiga.'});
  }
  return issues;
}
function focusIssue(issue){
  showPage(issue.collection,{direction:pageOrder.indexOf(issue.collection)>=pageOrder.indexOf(state.currentPage)?'forward':'back'});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const listId=issue.collection==='receitas'?'incomeList':'expenseList',target=[...$(listId).querySelectorAll('[data-entry-id]')].find(el=>el.dataset.entryId===issue.id);
    if(!target)return;target.classList.remove('issue-highlight');void target.offsetWidth;target.classList.add('issue-highlight');target.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'center'});target.focus({preventScroll:true});setTimeout(()=>target.classList.remove('issue-highlight'),1700);
  }));
}
function renderReviewNotice(){
  const issues=reviewIssues(),notice=$('reviewNotice');notice.replaceChildren();notice.hidden=!issues.length;if(!issues.length)return;
  const head=node('div',undefined,'warning-head');head.append(node('span','!','warning-symbol'),node('span',issues.length===1?'1 ajuste precisa da sua atenção':`${issues.length} ajustes precisam da sua atenção`));notice.append(head);
  issues.forEach(issue=>{const button=node('button',undefined,'warning-item');button.type='button';const copy=node('span',undefined,'warning-copy');copy.append(node('strong',issue.name),node('small',issue.detail));button.append(copy,node('span','→','warning-arrow'));button.addEventListener('click',()=>focusIssue(issue));notice.append(button);});
}
function render(){
  if(!state.ready)return;
  const month=$('monthFilter').value;if(!/^\d{4}-\d{2}$/.test(month))return;
  const summary=summarize(state.data,month),breakdown=dashboardBreakdown(summary);
  $('actualSummary').textContent=`No período selecionado: ${money(breakdown.incomeReceived)} recebidos − ${money(breakdown.expensePaid)} pagos = ${money(breakdown.incomeReceived-breakdown.expensePaid)} de balanço atual.`;
  const commitment=summary.commitment;setDashboardMetrics(summary,breakdown,commitment,state.currentPage==='inicio'&&!state.dashboardAnimated);
  const status=!summary.income&&!summary.expenses?'Sem dados':summary.balance<0?'Déficit':commitment>80?'Atenção':'Positivo';$('monthStatus').textContent=status;
  $('monthDescription').textContent=summary.balance<0?'Despesas previstas acima das receitas.':'Previsto e realizado no período.';
  renderReviewNotice();renderCommitments(summary.rows);
  list('incomeList',state.data.receitas,e=>renderEntry(e,'receitas'),'Nenhuma receita adicionada.');list('expenseList',state.data.despesas,e=>renderEntry(e,'despesas'),'Nenhuma despesa adicionada.');
  $('economyBalance').textContent=money(economyBalance(state.data));$('economyBalance').className=economyBalance(state.data)<0?'expense':'income';
  list('economyList',state.data.economia||[],renderEconomyItem,'Nenhuma movimentação na sua reserva.');
  list('notesList',state.data.itens,item=>{const li=node('li');li.append(node('span',item.text));const actions=node('div',undefined,'row-actions');actions.append(action('Excluir',()=>remove('itens',item),`Excluir anotação: ${item.text}`));li.append(actions);return li;},'Nenhuma anotação.');
}
function renderEntry(entry,collection){
  const li=node('li'),head=node('div',undefined,'entry-heading');li.dataset.entryId=entry.id;li.tabIndex=-1;if(entry.pendingReview||(entry.mode==='legacy'&&entry.occurrences.some(p=>p.estimated)))li.classList.add('has-issue');head.append(node('strong',entry.name),node('span',money(entry.amountCents),`amount ${collection==='receitas'?'income':'expense'}`));li.append(head);
  const occurrences=entry.occurrences;const modeLabel=entry.mode==='monthly'?'mensalidade(s) — valor por mês':entry.mode==='custom'?'competência(s) escolhida(s) — valor por competência':'parcela(s) — valor total';li.append(node('p',entry.pendingReview?'Revisão pendente: defina as datas para incluir nos totais.':`${occurrences.length} ${modeLabel} · ${displayDate(occurrences[0]?.date)} a ${displayDate(occurrences.at(-1)?.date)}`));
  if(entry.mode==='legacy'&&occurrences.some(p=>p.estimated))li.append(node('p','Dias de vencimento a confirmar; meses originais preservados.'));else if(occurrences.some(p=>p.estimated))li.append(node('p','Competências mensais preservadas do sistema anterior.'));
  const actions=node('div',undefined,'row-actions');actions.append(action('Editar',()=>openEntry(collection,entry),`Editar ${entry.name}`),action('Excluir',()=>remove(collection,entry),`Excluir ${entry.name}`));li.append(actions);return li;
}
function renderOccurrence(row){
  const li=node('li'),head=node('div',undefined,'entry-heading');head.append(node('strong',row.name),node('span',money(row.cents),`amount ${row.collection==='receitas'?'income':'expense'}`));li.append(head);
  const verb=row.collection==='receitas'?'Recebido':'Pago';let status;
  if(row.settled)status=`${verb} integralmente${row.settledDate?` em ${displayDate(row.settledDate)}`:''}`;
  else if(row.partial)status=`${verb} parcialmente: ${money(row.paymentCents)} · resta ${money(row.outstandingCents)}`;
  else status=row.estimated?'Dia a confirmar':row.date<today()?'Em atraso':'Pendente';
  li.append(node('p',`${row.estimated?row.date.slice(0,7).split('-').reverse().join('/') : displayDate(row.date)} · ${row.index}/${row.count} · ${status}`));
  const actionLabel=row.settled?'Ver pagamentos':row.partial?(row.collection==='receitas'?'Registrar outro recebimento':'Registrar outro pagamento'):(row.collection==='receitas'?'Registrar recebimento':'Registrar pagamento');
  const actions=node('div',undefined,'row-actions');actions.append(action(actionLabel,()=>settle(row)));li.append(actions);return li;
}
function renderEconomyItem(item){
  const li=node('li'),head=node('div',undefined,'entry-heading'),signed=item.kind==='withdraw'?-item.cents:item.cents;
  head.append(node('strong',item.name),node('span',`${signed>=0?'+':'−'} ${money(Math.abs(signed))}`,`amount ${signed>=0?'income':'expense'}`));li.append(head,node('p',`${item.kind==='withdraw'?'Retirada':'Depósito'} · ${displayDate(item.date)}`));
  const actions=node('div',undefined,'row-actions');actions.append(action('Excluir',()=>remove('economia',item),`Excluir movimentação ${item.name}`));li.append(actions);return li;
}
async function remove(collection,entry){const label=collection==='itens'?'esta anotação':collection==='economia'?`a movimentação “${entry.name}”`:`“${entry.name}” e todas as suas competências`;if(!confirm(`Excluir ${label}?`))return;try{await write({type:'remove',collection,id:entry.id,expectedRevision:entry.revision});notify('Item excluído.');}catch(error){notify(errorMessage(error),true);}}
$('noteForm').addEventListener('submit',async e=>{e.preventDefault();const text=$('noteText').value.trim();if(!text||state.writing)return;const id=crypto.randomUUID();const button=e.currentTarget.querySelector('button');button.disabled=true;$('noteText').disabled=true;try{await write({type:'add',collection:'itens',id,entry:{id,text}});$('noteText').value='';notify('Anotação salva.');}catch(error){notify(errorMessage(error),true);}finally{button.disabled=false;$('noteText').disabled=false;}});
$('economyDate').value=today();
$('economyForm').addEventListener('submit',e=>{e.preventDefault();const id=crypto.randomUUID();let value;try{value=cents($('economyValue').value);if(!$('economyName').value.trim())throw new Error('Informe o motivo da movimentação.');if(!validDate($('economyDate').value))throw new Error('Informe uma data válida.');}catch(error){$('economyError').textContent=errorMessage(error);return;}const entry={id,name:$('economyName').value.trim(),kind:$('economyKind').value,cents:value,date:$('economyDate').value,revision:0};formTask(e.currentTarget,'economyError',async()=>{await write({type:'add',collection:'economia',id,entry});e.currentTarget.reset();$('economyDate').value=today();notify('Movimentação da reserva salva.');});});
for(const button of document.querySelectorAll('[data-add]'))button.addEventListener('click',()=>openEntry(button.dataset.add));
function renderCustomMonths(){
  const target=$('customMonthList');target.replaceChildren();
  state.customMonths.sort().forEach(month=>{const chip=node('span',undefined,'month-chip');chip.append(node('span',month.split('-').reverse().join('/')));const removeButton=action('×',()=>{state.customMonths=state.customMonths.filter(value=>value!==month);state.dirty=true;renderCustomMonths();previewSchedule();},`Remover ${month}`);removeButton.className='month-chip-remove';chip.append(removeButton);target.append(chip);});
}
$('addCustomMonth').addEventListener('click',()=>{const month=$('customMonthInput').value;if(!/^\d{4}-\d{2}$/.test(month)){notify('Escolha uma competência válida.',true);return;}if(!state.customMonths.includes(month))state.customMonths.push(month);$('customMonthInput').value='';state.dirty=true;renderCustomMonths();previewSchedule();});
function openEntry(collection,entry=null){
  if(!state.ready){notify('Aguarde os dados carregarem.',true);return;}
  state.editing={collection,entry:entry?structuredClone(entry):null,id:entry?.id||crypto.randomUUID()};state.dirty=false;state.customMonths=entry?.mode==='custom'?(entry.occurrences||[]).map(p=>p.date.slice(0,7)):[];
  $('entryForm').reset();renderCustomMonths();$('entryError').textContent='';$('entryTitle').textContent=`${entry?'Editar':'Adicionar'} ${collection==='receitas'?'receita':'despesa'}`;
  $('entryName').value=entry?.name||'';$('entryValue').value=entry ? (entry.amountCents/100).toFixed(2) : '';
  const legacy=entry?.mode==='legacy'&&!entry.pendingReview;
  $('entryMode').querySelector('[value=legacy]').hidden=!legacy;
  $('entryMode').value=legacy?'legacy':entry?.mode==='legacy'?'installments':entry?.mode||'single';
  $('entryDate').value=entry?.firstDate||today();$('entryCount').value=entry?.count||1;$('entryCategory').value=entry?.category||'Fixa';$('categoryField').hidden=collection==='receitas';
  $('legacyDatesList').replaceChildren();
  if(legacy)entry.occurrences.forEach((p,i)=>{const label=node('label',`Vencimento ${i+1}`);label.htmlFor=`legacy-date-${i}`;const input=node('input');input.id=label.htmlFor;input.type='date';input.value=p.date;input.required=true;input.min='1900-01-01';input.max='9999-12-31';$('legacyDatesList').append(label,input);});
  const settled=entry?.occurrences.some(p=>(p.payments||[]).length);
  $('entryHelp').textContent=settled?'Este lançamento já tem pagamentos ou recebimentos registrados. Você pode ajustar descrição e tipo; valores e competências ficam preservados.':entry?.pendingReview?'O registro antigo foi preservado. Informe a modalidade e as competências corretas.':'Mensal repete o valor por mês. Parcelada divide o valor total. Personalizada aplica o valor informado em cada mês escolhido.';
  updateEntryFields();$('entryDialog').showModal();$('entryName').focus();
}
function updateEntryFields(){
  const mode=$('entryMode').value,settled=state.editing?.entry?.occurrences.some(p=>(p.payments||[]).length),legacy=mode==='legacy',custom=mode==='custom';
  $('valueLabel').textContent=(mode==='monthly'||custom)?'Valor por competência (R$)':mode==='single'?'Valor (R$)':'Valor total (R$)';$('dateLabel').textContent=mode==='single'?'Data prevista':'Primeiro vencimento';
  $('countField').hidden=mode==='single'||legacy||custom;$('legacyDates').hidden=!legacy;$('customDates').hidden=!custom;$('entryDate').parentElement.hidden=legacy||custom;
  for(const id of ['entryMode','entryValue','entryDate','entryCount','customMonthInput','addCustomMonth'])$(id).disabled=!!settled||(legacy&&['entryDate','entryCount'].includes(id));
  $('entryCount').required=!['single','legacy','custom'].includes(mode);$('entryDate').required=!legacy&&!custom;
  $('legacyDatesList').querySelectorAll('input').forEach(input=>input.disabled=!!settled||!legacy);$('customMonthList').querySelectorAll('button').forEach(button=>button.disabled=!!settled);
  previewSchedule();
}
function draftEntry(){
  const {entry,id}=state.editing;
  if(entry?.occurrences.some(p=>(p.payments||[]).length))return {...structuredClone(entry),name:$('entryName').value.trim(),category:$('entryCategory').value};
  if($('entryMode').value==='legacy'){
    const amount=cents($('entryValue').value),dates=[...$('legacyDatesList').querySelectorAll('input')].map(input=>input.value);
    if(dates.some(date=>!validDate(date))||new Set(dates).size!==dates.length)throw new Error('Confirme as datas, sem vencimentos duplicados.');
    if(amount<dates.length)throw new Error('Cada parcela precisa ter ao menos R$ 0,01.');
    const occurrences=entry.occurrences.map((p,i)=>({...p,date:dates[i],estimated:false,cents:Math.floor(amount/dates.length)+(i<amount%dates.length?1:0)})).sort((a,b)=>a.date.localeCompare(b.date));
    return {...structuredClone(entry),name:$('entryName').value.trim(),category:$('entryCategory').value,amountCents:amount,firstDate:occurrences[0].date,occurrences,pendingReview:false};
  }
  const result=makeEntry({id,name:$('entryName').value,value:$('entryValue').value,date:$('entryDate').value,count:$('entryCount').value,mode:$('entryMode').value,months:state.customMonths,category:$('entryCategory').value,revision:entry?.revision||0});
  if(entry?.legacy)result.legacy=structuredClone(entry.legacy);
  return result;
}
function previewSchedule(){try{const entry=draftEntry(),rows=entry.occurrences;const total=rows.reduce((s,p)=>s+p.cents,0);$('schedulePreview').textContent=`${rows.length} vencimento(s): ${displayDate(rows[0].date)} a ${displayDate(rows.at(-1).date)}. Total do período: ${money(total)}.`;}catch{$('schedulePreview').textContent='Preencha os dados para conferir os vencimentos.';}}
$('entryForm').addEventListener('input',()=>{state.dirty=true;previewSchedule();});$('entryMode').addEventListener('change',updateEntryFields);
function closeEntry(){if($('entryForm').dataset.busy)return;if(state.dirty&&!confirm('Descartar as alterações não salvas?'))return;$('entryDialog').close();state.editing=null;state.dirty=false;}
$('entryDialog').addEventListener('cancel',e=>{e.preventDefault();closeEntry();});$('closeEntry').addEventListener('click',closeEntry);$('cancelEntry').addEventListener('click',closeEntry);
$('entryForm').addEventListener('submit',e=>{
  e.preventDefault();let draft;try{draft=draftEntry();if(!draft.name||draft.name.length>160)throw new Error('Informe uma descrição com até 160 caracteres.');}catch(error){$('entryError').textContent=errorMessage(error);return;}
  const editing=state.editing;
  formTask(e.currentTarget,'entryError',async()=>{await write({type:editing.entry?'edit':'add',collection:editing.collection,id:editing.id,entry:draft,expectedRevision:editing.entry?.revision});state.dirty=false;$('entryDialog').close();state.editing=null;notify('Lançamento salvo.');});
});
function renderPaymentHistory(row){
  const target=$('paymentHistory');target.replaceChildren();
  if(!(row.payments||[]).length){target.append(node('p','Nenhuma baixa registrada ainda.','muted'));return;}
  target.append(node('strong',row.collection==='receitas'?'Recebimentos registrados':'Pagamentos registrados'));
  for(const payment of [...row.payments].sort((a,b)=>b.date.localeCompare(a.date))){
    const line=node('div',undefined,'payment-line');const when=payment.estimated?`${payment.date.slice(0,7).split('-').reverse().join('/')} · data exata não registrada`:displayDate(payment.date);const copy=node('span',`${when} · ${money(payment.cents)}`);const removeButton=action('Remover',async()=>{if(state.writing)return;if(!confirm(`Remover a baixa de ${money(payment.cents)}?`))return;removeButton.disabled=true;try{await write({type:'removePayment',collection:row.collection,id:row.entryId,occurrenceId:row.id,paymentId:payment.id,expectedRevision:row.revision});$('settleDialog').close();notify('Baixa removida.');}catch(error){removeButton.disabled=false;notify(errorMessage(error),true);}});removeButton.className='link danger-link';line.append(copy,removeButton);target.append(line);
  }
}
async function settle(row){
  state.settling=row;const receiving=row.collection==='receitas';$('settleTitle').textContent=receiving?'Registrar recebimento':'Registrar pagamento';
  $('settleDate').value=today();$('settleDate').max=today();$('settleDate').min='1900-01-01';$('settleError').textContent='';
  $('settleSummary').textContent=`Previsto: ${money(row.cents)} · já ${receiving?'recebido':'pago'}: ${money(row.paymentCents)} · restante: ${money(row.outstandingCents)}.`;
  $('settleValue').value=row.outstandingCents>0?(row.outstandingCents/100).toFixed(2):'';$('settleValue').max=(row.outstandingCents/100).toFixed(2);$('settleValue').disabled=row.outstandingCents===0;$('settleForm').querySelector('[type=submit]').disabled=row.outstandingCents===0;
  renderPaymentHistory(row);$('settleDialog').showModal();
}
$('cancelSettle').addEventListener('click',()=>{if(!$('settleForm').dataset.busy)$('settleDialog').close();});$('settleDialog').addEventListener('cancel',e=>{if($('settleForm').dataset.busy)e.preventDefault();});
$('settleForm').addEventListener('submit',e=>{e.preventDefault();const row=state.settling,date=$('settleDate').value;let amount;try{amount=cents($('settleValue').value);if(amount>row.outstandingCents)throw new Error(`O valor ultrapassa o restante de ${money(row.outstandingCents)}.`);}catch(error){$('settleError').textContent=errorMessage(error);return;}formTask(e.currentTarget,'settleError',async()=>{await write({type:'payment',collection:row.collection,id:row.entryId,occurrenceId:row.id,paymentId:crypto.randomUUID(),expectedRevision:row.revision,cents:amount,date});$('settleDialog').close();notify(row.collection==='receitas'?'Recebimento registrado.':'Pagamento registrado.');});});
$('exportButton').addEventListener('click',()=>{if(!state.ready)return;const blob=new Blob([JSON.stringify(state.data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`meu-financeiro-${today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('clearButton').addEventListener('click',()=>{if(!state.ready)return;state.clearRevision=state.data.revision;$('clearForm').reset();$('clearError').textContent='';$('clearDialog').showModal();});
$('cancelClear').addEventListener('click',()=>{if(!$('clearForm').dataset.busy)$('clearDialog').close();});$('clearDialog').addEventListener('cancel',e=>{if($('clearForm').dataset.busy)e.preventDefault();});
$('clearForm').addEventListener('submit',e=>{e.preventDefault();if($('clearConfirmation').value!=='APAGAR')return;formTask(e.currentTarget,'clearError',async()=>{await write({type:'clear',expectedRevision:state.clearRevision});$('clearDialog').close();notify('Dados financeiros apagados.');});});
async function authChanged(user){
  const session=++state.session;state.unsubscribe?.();state.unsubscribe=null;state.uid=user?.uid||null;state.ready=false;state.profile={};state.data=normalize();
  setSettingsMenu(false);document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());state.editing=null;state.dirty=false;state.currentPage='inicio';state.visitedPages=new Set();state.dashboardAnimated=false;state.metricAnimationToken++;state.connectionNotified=false;$('notice').hidden=true;
  for(const id of ['commitmentList','incomeList','expenseList','economyList','notesList'])$(id).replaceChildren();for(const id of ['incomeTotal','expenseTotal','balanceTotal','actualBalanceTotal','incomeReceived','incomeReceivable','expensePaid','expensePayable','economyBalance'])$(id).textContent='R$ 0,00';$('actualSummary').textContent='';$('reviewNotice').hidden=true;
  renderProfile();$('commitmentValue').textContent='0%';$('commitmentCount').textContent='0 próximos';$('incomeProgressBar').style.width='0%';$('expenseProgressBar').style.width='0%';$('incomeProgressLabel').textContent='0%';$('expenseProgressLabel').textContent='0%';$('monthStatus').textContent='Sem dados';$('monthDescription').textContent='';$('profilePhoto').value='';$('noteText').value='';$('auth').hidden=!!user;$('app').hidden=!user;$('authLoading').hidden=true;
  $('senhaLogin').value='';$('senhaCadastro').value='';$('confirmaSenha').value='';
  if(!user){showAuth('loginForm');renderProfile();return;}
  showPage('inicio',{animate:false,focus:false});updateConnection();
  state.unsubscribe=repository.watchFinance(user.uid,data=>{if(session!==state.session)return;state.data=data;state.ready=true;updateConnection();render();},error=>{if(session!==state.session)return;state.ready=false;$('connectionStatus').textContent=errorMessage(error);notify(errorMessage(error),true);});
  try{const profile=await repository.getProfile(user.uid);if(session===state.session){state.profile=profile;const cloudTheme=['claro','escuro'].includes(profile.temaPadrao)?profile.temaPadrao:$('themeSelect').value;const cloudFont=[...$('fontSelect').options].some(option=>option.value===profile.fontePadrao)?profile.fontePadrao:$('fontSelect').value;$('themeSelect').value=cloudTheme||'claro';$('fontSelect').value=cloudFont||'Urbanist, sans-serif';remember('temaSolon',$('themeSelect').value);remember('fonteSolon',$('fontSelect').value);applyAppearance();renderProfile();if(!profile.nome||!profile.sobrenome)notify('Complete seu nome e sobrenome em Configurações.');}}catch(error){if(session===state.session)notify(errorMessage(error),true);}
}
try{repository=await import('./repository.js');repository.watchAuth(authChanged);}catch{ $('authLoading').hidden=true;$('authError').textContent='Não foi possível carregar o acesso. Verifique sua conexão e recarregue a página.'; }

addEventListener('beforeunload',event=>{if(state.dirty||state.writing){event.preventDefault();event.returnValue='';}});