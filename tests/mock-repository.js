// Usado somente pela interceptação HTTP do teste. Nunca importado em produção.
import {normalize,applyOperation} from './finance.js';
let observer,authObserver;
let data=normalize({receitas:[{nome:'Salário antigo',valor:3000}],despesas:[{nome:'Compra antiga',valor:100,parcelas:2,meses:['Nov','Dez'],ano:'2026',tipo:'Fixa'}],itens:['<img src=x onerror="window.injected=true">']});
window.testBackend={fail:false,get data(){return data;}};
export function watchAuth(callback){authObserver=callback;queueMicrotask(()=>callback({uid:'test-user'}));}
export function watchFinance(uid,callback){observer=callback;queueMicrotask(()=>callback(structuredClone(data)));return()=>{};}
export async function getProfile(){return {nome:'Alex',sobrenome:'Teste'};}
export async function saveProfile(){}
export async function mutate(uid,operation){await new Promise(resolve=>setTimeout(resolve,50));if(window.testBackend.fail)throw new Error('Falha simulada ao salvar.');data=applyOperation(data,operation);observer(structuredClone(data));}
export async function login(){authObserver({uid:'test-user'});}
export async function register(){authObserver({uid:'test-user'});}
export async function resetPassword(){}
export async function logout(){authObserver(null);}