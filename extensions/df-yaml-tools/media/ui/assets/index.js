(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const h of l.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function r(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(s){if(s.ep)return;s.ep=!0;const l=r(s);fetch(s.href,l)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const br=globalThis,ei=br.ShadowRoot&&(br.ShadyCSS===void 0||br.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ri=Symbol(),ms=new WeakMap;let So=class{constructor(t,r,i){if(this._$cssResult$=!0,i!==ri)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=r}get styleSheet(){let t=this.o;const r=this.t;if(ei&&t===void 0){const i=r!==void 0&&r.length===1;i&&(t=ms.get(r)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ms.set(r,t))}return t}toString(){return this.cssText}};const al=n=>new So(typeof n=="string"?n:n+"",void 0,ri),ie=(n,...t)=>{const r=n.length===1?n[0]:t.reduce((i,s,l)=>i+(h=>{if(h._$cssResult$===!0)return h.cssText;if(typeof h=="number")return h;throw Error("Value passed to 'css' function must be a 'css' function result: "+h+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+n[l+1],n[0]);return new So(r,n,ri)},ll=(n,t)=>{if(ei)n.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of t){const i=document.createElement("style"),s=br.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=r.cssText,n.appendChild(i)}},vs=ei?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let r="";for(const i of t.cssRules)r+=i.cssText;return al(r)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:hl,defineProperty:cl,getOwnPropertyDescriptor:ul,getOwnPropertyNames:dl,getOwnPropertySymbols:fl,getPrototypeOf:pl}=Object,Vt=globalThis,_s=Vt.trustedTypes,gl=_s?_s.emptyScript:"",bn=Vt.reactiveElementPolyfillSupport,Le=(n,t)=>n,Pr={toAttribute(n,t){switch(t){case Boolean:n=n?gl:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let r=n;switch(t){case Boolean:r=n!==null;break;case Number:r=n===null?null:Number(n);break;case Object:case Array:try{r=JSON.parse(n)}catch{r=null}}return r}},ni=(n,t)=>!hl(n,t),ys={attribute:!0,type:String,converter:Pr,reflect:!1,useDefault:!1,hasChanged:ni};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Vt.litPropertyMetadata??(Vt.litPropertyMetadata=new WeakMap);let ce=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,r=ys){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(t,r),!r.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,r);s!==void 0&&cl(this.prototype,t,s)}}static getPropertyDescriptor(t,r,i){const{get:s,set:l}=ul(this.prototype,t)??{get(){return this[r]},set(h){this[r]=h}};return{get:s,set(h){const u=s==null?void 0:s.call(this);l==null||l.call(this,h),this.requestUpdate(t,u,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ys}static _$Ei(){if(this.hasOwnProperty(Le("elementProperties")))return;const t=pl(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Le("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Le("properties"))){const r=this.properties,i=[...dl(r),...fl(r)];for(const s of i)this.createProperty(s,r[s])}const t=this[Symbol.metadata];if(t!==null){const r=litPropertyMetadata.get(t);if(r!==void 0)for(const[i,s]of r)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[r,i]of this.elementProperties){const s=this._$Eu(r,i);s!==void 0&&this._$Eh.set(s,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const r=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)r.unshift(vs(s))}else t!==void 0&&r.push(vs(t));return r}static _$Eu(t,r){const i=r.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(r=>this.enableUpdating=r),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(r=>r(this))}addController(t){var r;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((r=t.hostConnected)==null||r.call(t))}removeController(t){var r;(r=this._$EO)==null||r.delete(t)}_$E_(){const t=new Map,r=this.constructor.elementProperties;for(const i of r.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ll(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(r=>{var i;return(i=r.hostConnected)==null?void 0:i.call(r)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(r=>{var i;return(i=r.hostDisconnected)==null?void 0:i.call(r)})}attributeChangedCallback(t,r,i){this._$AK(t,i)}_$ET(t,r){var l;const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const h=(((l=i.converter)==null?void 0:l.toAttribute)!==void 0?i.converter:Pr).toAttribute(r,i.type);this._$Em=t,h==null?this.removeAttribute(s):this.setAttribute(s,h),this._$Em=null}}_$AK(t,r){var l,h;const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const u=i.getPropertyOptions(s),g=typeof u.converter=="function"?{fromAttribute:u.converter}:((l=u.converter)==null?void 0:l.fromAttribute)!==void 0?u.converter:Pr;this._$Em=s;const A=g.fromAttribute(r,u.type);this[s]=A??((h=this._$Ej)==null?void 0:h.get(s))??A,this._$Em=null}}requestUpdate(t,r,i){var s;if(t!==void 0){const l=this.constructor,h=this[t];if(i??(i=l.getPropertyOptions(t)),!((i.hasChanged??ni)(h,r)||i.useDefault&&i.reflect&&h===((s=this._$Ej)==null?void 0:s.get(t))&&!this.hasAttribute(l._$Eu(t,i))))return;this.C(t,r,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,r,{useDefault:i,reflect:s,wrapped:l},h){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,h??r??this[t]),l!==!0||h!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(r=void 0),this._$AL.set(t,r)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[l,h]of this._$Ep)this[l]=h;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[l,h]of s){const{wrapped:u}=h,g=this[l];u!==!0||this._$AL.has(l)||g===void 0||this.C(l,void 0,h,g)}}let t=!1;const r=this._$AL;try{t=this.shouldUpdate(r),t?(this.willUpdate(r),(i=this._$EO)==null||i.forEach(s=>{var l;return(l=s.hostUpdate)==null?void 0:l.call(s)}),this.update(r)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(r)}willUpdate(t){}_$AE(t){var r;(r=this._$EO)==null||r.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(r=>this._$ET(r,this[r]))),this._$EM()}updated(t){}firstUpdated(t){}};ce.elementStyles=[],ce.shadowRootOptions={mode:"open"},ce[Le("elementProperties")]=new Map,ce[Le("finalized")]=new Map,bn==null||bn({ReactiveElement:ce}),(Vt.reactiveElementVersions??(Vt.reactiveElementVersions=[])).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ue=globalThis,Nr=Ue.trustedTypes,ws=Nr?Nr.createPolicy("lit-html",{createHTML:n=>n}):void 0,To="$lit$",Ft=`lit$${Math.random().toFixed(9).slice(2)}$`,Io="?"+Ft,ml=`<${Io}>`,ee=document,ze=()=>ee.createComment(""),We=n=>n===null||typeof n!="object"&&typeof n!="function",ii=Array.isArray,vl=n=>ii(n)||typeof(n==null?void 0:n[Symbol.iterator])=="function",An=`[ 	
\f\r]`,$e=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,bs=/-->/g,As=/>/g,qt=RegExp(`>|${An}(?:([^\\s"'>=/]+)(${An}*=${An}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Es=/'/g,Ss=/"/g,Co=/^(?:script|style|textarea|title)$/i,_l=n=>(t,...r)=>({_$litType$:n,strings:t,values:r}),ct=_l(1),re=Symbol.for("lit-noChange"),z=Symbol.for("lit-nothing"),Ts=new WeakMap,Xt=ee.createTreeWalker(ee,129);function Po(n,t){if(!ii(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return ws!==void 0?ws.createHTML(t):t}const yl=(n,t)=>{const r=n.length-1,i=[];let s,l=t===2?"<svg>":t===3?"<math>":"",h=$e;for(let u=0;u<r;u++){const g=n[u];let A,T,S=-1,C=0;for(;C<g.length&&(h.lastIndex=C,T=h.exec(g),T!==null);)C=h.lastIndex,h===$e?T[1]==="!--"?h=bs:T[1]!==void 0?h=As:T[2]!==void 0?(Co.test(T[2])&&(s=RegExp("</"+T[2],"g")),h=qt):T[3]!==void 0&&(h=qt):h===qt?T[0]===">"?(h=s??$e,S=-1):T[1]===void 0?S=-2:(S=h.lastIndex-T[2].length,A=T[1],h=T[3]===void 0?qt:T[3]==='"'?Ss:Es):h===Ss||h===Es?h=qt:h===bs||h===As?h=$e:(h=qt,s=void 0);const $=h===qt&&n[u+1].startsWith("/>")?" ":"";l+=h===$e?g+ml:S>=0?(i.push(A),g.slice(0,S)+To+g.slice(S)+Ft+$):g+Ft+(S===-2?u:$)}return[Po(n,l+(n[r]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};let Vn=class No{constructor({strings:t,_$litType$:r},i){let s;this.parts=[];let l=0,h=0;const u=t.length-1,g=this.parts,[A,T]=yl(t,r);if(this.el=No.createElement(A,i),Xt.currentNode=this.el.content,r===2||r===3){const S=this.el.content.firstChild;S.replaceWith(...S.childNodes)}for(;(s=Xt.nextNode())!==null&&g.length<u;){if(s.nodeType===1){if(s.hasAttributes())for(const S of s.getAttributeNames())if(S.endsWith(To)){const C=T[h++],$=s.getAttribute(S).split(Ft),D=/([.?@])?(.*)/.exec(C);g.push({type:1,index:l,name:D[2],strings:$,ctor:D[1]==="."?bl:D[1]==="?"?Al:D[1]==="@"?El:Vr}),s.removeAttribute(S)}else S.startsWith(Ft)&&(g.push({type:6,index:l}),s.removeAttribute(S));if(Co.test(s.tagName)){const S=s.textContent.split(Ft),C=S.length-1;if(C>0){s.textContent=Nr?Nr.emptyScript:"";for(let $=0;$<C;$++)s.append(S[$],ze()),Xt.nextNode(),g.push({type:2,index:++l});s.append(S[C],ze())}}}else if(s.nodeType===8)if(s.data===Io)g.push({type:2,index:l});else{let S=-1;for(;(S=s.data.indexOf(Ft,S+1))!==-1;)g.push({type:7,index:l}),S+=Ft.length-1}l++}}static createElement(t,r){const i=ee.createElement("template");return i.innerHTML=t,i}};function ge(n,t,r=n,i){var h,u;if(t===re)return t;let s=i!==void 0?(h=r._$Co)==null?void 0:h[i]:r._$Cl;const l=We(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==l&&((u=s==null?void 0:s._$AO)==null||u.call(s,!1),l===void 0?s=void 0:(s=new l(n),s._$AT(n,r,i)),i!==void 0?(r._$Co??(r._$Co=[]))[i]=s:r._$Cl=s),s!==void 0&&(t=ge(n,s._$AS(n,t.values),s,i)),t}let wl=class{constructor(t,r){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:r},parts:i}=this._$AD,s=((t==null?void 0:t.creationScope)??ee).importNode(r,!0);Xt.currentNode=s;let l=Xt.nextNode(),h=0,u=0,g=i[0];for(;g!==void 0;){if(h===g.index){let A;g.type===2?A=new qe(l,l.nextSibling,this,t):g.type===1?A=new g.ctor(l,g.name,g.strings,this,t):g.type===6&&(A=new Sl(l,this,t)),this._$AV.push(A),g=i[++u]}h!==(g==null?void 0:g.index)&&(l=Xt.nextNode(),h++)}return Xt.currentNode=ee,s}p(t){let r=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,r),r+=i.strings.length-2):i._$AI(t[r])),r++}};class qe{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,r,i,s){this.type=2,this._$AH=z,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=ge(this,t,r),We(t)?t===z||t==null||t===""?(this._$AH!==z&&this._$AR(),this._$AH=z):t!==this._$AH&&t!==re&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):vl(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==z&&We(this._$AH)?this._$AA.nextSibling.data=t:this.T(ee.createTextNode(t)),this._$AH=t}$(t){var l;const{values:r,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Vn.createElement(Po(i.h,i.h[0]),this.options)),i);if(((l=this._$AH)==null?void 0:l._$AD)===s)this._$AH.p(r);else{const h=new wl(s,this),u=h.u(this.options);h.p(r),this.T(u),this._$AH=h}}_$AC(t){let r=Ts.get(t.strings);return r===void 0&&Ts.set(t.strings,r=new Vn(t)),r}k(t){ii(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let i,s=0;for(const l of t)s===r.length?r.push(i=new qe(this.O(ze()),this.O(ze()),this,this.options)):i=r[s],i._$AI(l),s++;s<r.length&&(this._$AR(i&&i._$AB.nextSibling,s),r.length=s)}_$AR(t=this._$AA.nextSibling,r){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,r);t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){var r;this._$AM===void 0&&(this._$Cv=t,(r=this._$AP)==null||r.call(this,t))}}let Vr=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,r,i,s,l){this.type=1,this._$AH=z,this._$AN=void 0,this.element=t,this.name=r,this._$AM=s,this.options=l,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=z}_$AI(t,r=this,i,s){const l=this.strings;let h=!1;if(l===void 0)t=ge(this,t,r,0),h=!We(t)||t!==this._$AH&&t!==re,h&&(this._$AH=t);else{const u=t;let g,A;for(t=l[0],g=0;g<l.length-1;g++)A=ge(this,u[i+g],r,g),A===re&&(A=this._$AH[g]),h||(h=!We(A)||A!==this._$AH[g]),A===z?t=z:t!==z&&(t+=(A??"")+l[g+1]),this._$AH[g]=A}h&&!s&&this.j(t)}j(t){t===z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}};class bl extends Vr{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===z?void 0:t}}class Al extends Vr{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==z)}}let El=class extends Vr{constructor(t,r,i,s,l){super(t,r,i,s,l),this.type=5}_$AI(t,r=this){if((t=ge(this,t,r,0)??z)===re)return;const i=this._$AH,s=t===z&&i!==z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,l=t!==z&&(i===z||s);s&&this.element.removeEventListener(this.name,this,i),l&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var r;typeof this._$AH=="function"?this._$AH.call(((r=this.options)==null?void 0:r.host)??this.element,t):this._$AH.handleEvent(t)}};class Sl{constructor(t,r,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){ge(this,t)}}const En=Ue.litHtmlPolyfillSupport;En==null||En(Vn,qe),(Ue.litHtmlVersions??(Ue.litHtmlVersions=[])).push("3.3.1");const Tl=(n,t,r)=>{const i=(r==null?void 0:r.renderBefore)??t;let s=i._$litPart$;if(s===void 0){const l=(r==null?void 0:r.renderBefore)??null;i._$litPart$=s=new qe(t.insertBefore(ze(),l),l,void 0,r??{})}return s._$AI(n),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Zt=globalThis;let Rt=class extends ce{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var r;const t=super.createRenderRoot();return(r=this.renderOptions).renderBefore??(r.renderBefore=t.firstChild),t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tl(r,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return re}};var Eo;Rt._$litElement$=!0,Rt.finalized=!0,(Eo=Zt.litElementHydrateSupport)==null||Eo.call(Zt,{LitElement:Rt});const Sn=Zt.litElementPolyfillSupport;Sn==null||Sn({LitElement:Rt});(Zt.litElementVersions??(Zt.litElementVersions=[])).push("4.2.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ke=n=>(t,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(n,t)}):customElements.define(n,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Il={attribute:!0,type:String,converter:Pr,reflect:!1,hasChanged:ni},Cl=(n=Il,t,r)=>{const{kind:i,metadata:s}=r;let l=globalThis.litPropertyMetadata.get(s);if(l===void 0&&globalThis.litPropertyMetadata.set(s,l=new Map),i==="setter"&&((n=Object.create(n)).wrapped=!0),l.set(r.name,n),i==="accessor"){const{name:h}=r;return{set(u){const g=t.get.call(this);t.set.call(this,u),this.requestUpdate(h,g,n)},init(u){return u!==void 0&&this.C(h,void 0,n,u),u}}}if(i==="setter"){const{name:h}=r;return function(u){const g=this[h];t.call(this,u),this.requestUpdate(h,g,n)}}throw Error("Unsupported decorator location: "+i)};function ft(n){return(t,r)=>typeof r=="object"?Cl(n,t,r):((i,s,l)=>{const h=s.hasOwnProperty(l);return s.constructor.createProperty(l,i),h?Object.getOwnPropertyDescriptor(s,l):void 0})(n,t,r)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function jr(n){return ft({...n,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ro=(n,t,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(n,t,r),r);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ko(n,t){return(r,i,s)=>{const l=h=>{var u;return((u=h.renderRoot)==null?void 0:u.querySelector(n))??null};return Ro(r,i,{get(){return l(this)}})}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Pl(n){return(t,r)=>{const{slot:i,selector:s}=n??{},l="slot"+(i?`[name=${i}]`:":not([name])");return Ro(t,r,{get(){var g;const h=(g=this.renderRoot)==null?void 0:g.querySelector(l),u=(h==null?void 0:h.assignedElements(n))??[];return s===void 0?u:u.filter(A=>A.matches(s))}})}}var Nl=Object.defineProperty,Rl=(n,t,r)=>t in n?Nl(n,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):n[t]=r,Tn=(n,t,r)=>(Rl(n,typeof t!="symbol"?t+"":t,r),r),kl=(n,t,r)=>{if(!t.has(n))throw TypeError("Cannot "+r)},In=(n,t)=>{if(Object(t)!==t)throw TypeError('Cannot use the "in" operator on this value');return n.has(t)},mr=(n,t,r)=>{if(t.has(n))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(n):t.set(n,r)},Is=(n,t,r)=>(kl(n,t,"access private method"),r);/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Do(n,t){return Object.is(n,t)}/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */let q=null,Me=!1,Ar=1;const Rr=Symbol("SIGNAL");function ue(n){const t=q;return q=n,t}function Dl(){return q}function Ol(){return Me}const si={version:0,lastCleanEpoch:0,dirty:!1,producerNode:void 0,producerLastReadVersion:void 0,producerIndexOfThis:void 0,nextProducerIndex:0,liveConsumerNode:void 0,liveConsumerIndexOfThis:void 0,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function Br(n){if(Me)throw new Error(typeof ngDevMode<"u"&&ngDevMode?"Assertion error: signal read during notification phase":"");if(q===null)return;q.consumerOnSignalRead(n);const t=q.nextProducerIndex++;if(me(q),t<q.producerNode.length&&q.producerNode[t]!==n&&jn(q)){const r=q.producerNode[t];Hr(r,q.producerIndexOfThis[t])}q.producerNode[t]!==n&&(q.producerNode[t]=n,q.producerIndexOfThis[t]=jn(q)?$o(n,q,t):0),q.producerLastReadVersion[t]=n.version}function xl(){Ar++}function Oo(n){if(!(!n.dirty&&n.lastCleanEpoch===Ar)){if(!n.producerMustRecompute(n)&&!Fl(n)){n.dirty=!1,n.lastCleanEpoch=Ar;return}n.producerRecomputeValue(n),n.dirty=!1,n.lastCleanEpoch=Ar}}function xo(n){if(n.liveConsumerNode===void 0)return;const t=Me;Me=!0;try{for(const r of n.liveConsumerNode)r.dirty||Ll(r)}finally{Me=t}}function $l(){return(q==null?void 0:q.consumerAllowSignalWrites)!==!1}function Ll(n){var t;n.dirty=!0,xo(n),(t=n.consumerMarkedDirty)==null||t.call(n.wrapper??n)}function Ul(n){return n&&(n.nextProducerIndex=0),ue(n)}function Ml(n,t){if(ue(t),!(!n||n.producerNode===void 0||n.producerIndexOfThis===void 0||n.producerLastReadVersion===void 0)){if(jn(n))for(let r=n.nextProducerIndex;r<n.producerNode.length;r++)Hr(n.producerNode[r],n.producerIndexOfThis[r]);for(;n.producerNode.length>n.nextProducerIndex;)n.producerNode.pop(),n.producerLastReadVersion.pop(),n.producerIndexOfThis.pop()}}function Fl(n){me(n);for(let t=0;t<n.producerNode.length;t++){const r=n.producerNode[t],i=n.producerLastReadVersion[t];if(i!==r.version||(Oo(r),i!==r.version))return!0}return!1}function $o(n,t,r){var i;if(oi(n),me(n),n.liveConsumerNode.length===0){(i=n.watched)==null||i.call(n.wrapper);for(let s=0;s<n.producerNode.length;s++)n.producerIndexOfThis[s]=$o(n.producerNode[s],n,s)}return n.liveConsumerIndexOfThis.push(r),n.liveConsumerNode.push(t)-1}function Hr(n,t){var r;if(oi(n),me(n),typeof ngDevMode<"u"&&ngDevMode&&t>=n.liveConsumerNode.length)throw new Error(`Assertion error: active consumer index ${t} is out of bounds of ${n.liveConsumerNode.length} consumers)`);if(n.liveConsumerNode.length===1){(r=n.unwatched)==null||r.call(n.wrapper);for(let s=0;s<n.producerNode.length;s++)Hr(n.producerNode[s],n.producerIndexOfThis[s])}const i=n.liveConsumerNode.length-1;if(n.liveConsumerNode[t]=n.liveConsumerNode[i],n.liveConsumerIndexOfThis[t]=n.liveConsumerIndexOfThis[i],n.liveConsumerNode.length--,n.liveConsumerIndexOfThis.length--,t<n.liveConsumerNode.length){const s=n.liveConsumerIndexOfThis[t],l=n.liveConsumerNode[t];me(l),l.producerIndexOfThis[s]=t}}function jn(n){var t;return n.consumerIsAlwaysLive||(((t=n==null?void 0:n.liveConsumerNode)==null?void 0:t.length)??0)>0}function me(n){n.producerNode??(n.producerNode=[]),n.producerIndexOfThis??(n.producerIndexOfThis=[]),n.producerLastReadVersion??(n.producerLastReadVersion=[])}function oi(n){n.liveConsumerNode??(n.liveConsumerNode=[]),n.liveConsumerIndexOfThis??(n.liveConsumerIndexOfThis=[])}/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Lo(n){if(Oo(n),Br(n),n.value===Bn)throw n.error;return n.value}function Vl(n){const t=Object.create(jl);t.computation=n;const r=()=>Lo(t);return r[Rr]=t,r}const Cn=Symbol("UNSET"),Pn=Symbol("COMPUTING"),Bn=Symbol("ERRORED"),jl={...si,value:Cn,dirty:!0,error:null,equal:Do,producerMustRecompute(n){return n.value===Cn||n.value===Pn},producerRecomputeValue(n){if(n.value===Pn)throw new Error("Detected cycle in computations.");const t=n.value;n.value=Pn;const r=Ul(n);let i,s=!1;try{i=n.computation.call(n.wrapper),s=t!==Cn&&t!==Bn&&n.equal.call(n.wrapper,t,i)}catch(l){i=Bn,n.error=l}finally{Ml(n,r)}if(s){n.value=t;return}n.value=i,n.version++}};/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Bl(){throw new Error}let Hl=Bl;function zl(){Hl()}/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Wl(n){const t=Object.create(Kl);t.value=n;const r=()=>(Br(t),t.value);return r[Rr]=t,r}function Gl(){return Br(this),this.value}function ql(n,t){$l()||zl(),n.equal.call(n.wrapper,n.value,t)||(n.value=t,Xl(n))}const Kl={...si,equal:Do,value:void 0};function Xl(n){n.version++,xl(),xo(n)}/**
 * @license
 * Copyright 2024 Bloomberg Finance L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z=Symbol("node");var kt;(n=>{var t,r,i,s;class l{constructor(g,A={}){mr(this,r),Tn(this,t);const S=Wl(g)[Rr];if(this[Z]=S,S.wrapper=this,A){const C=A.equals;C&&(S.equal=C),S.watched=A[n.subtle.watched],S.unwatched=A[n.subtle.unwatched]}}get(){if(!(0,n.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.get");return Gl.call(this[Z])}set(g){if(!(0,n.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.set");if(Ol())throw new Error("Writes to signals not permitted during Watcher callback");const A=this[Z];ql(A,g)}}t=Z,r=new WeakSet,n.isState=u=>typeof u=="object"&&In(r,u),n.State=l;class h{constructor(g,A){mr(this,s),Tn(this,i);const S=Vl(g)[Rr];if(S.consumerAllowSignalWrites=!0,this[Z]=S,S.wrapper=this,A){const C=A.equals;C&&(S.equal=C),S.watched=A[n.subtle.watched],S.unwatched=A[n.subtle.unwatched]}}get(){if(!(0,n.isComputed)(this))throw new TypeError("Wrong receiver type for Signal.Computed.prototype.get");return Lo(this[Z])}}i=Z,s=new WeakSet,n.isComputed=u=>typeof u=="object"&&In(s,u),n.Computed=h,(u=>{var g,A,T,S;function C(R){let P,N=null;try{N=ue(null),P=R()}finally{ue(N)}return P}u.untrack=C;function $(R){var P;if(!(0,n.isComputed)(R)&&!(0,n.isWatcher)(R))throw new TypeError("Called introspectSources without a Computed or Watcher argument");return((P=R[Z].producerNode)==null?void 0:P.map(N=>N.wrapper))??[]}u.introspectSources=$;function D(R){var P;if(!(0,n.isComputed)(R)&&!(0,n.isState)(R))throw new TypeError("Called introspectSinks without a Signal argument");return((P=R[Z].liveConsumerNode)==null?void 0:P.map(N=>N.wrapper))??[]}u.introspectSinks=D;function B(R){if(!(0,n.isComputed)(R)&&!(0,n.isState)(R))throw new TypeError("Called hasSinks without a Signal argument");const P=R[Z].liveConsumerNode;return P?P.length>0:!1}u.hasSinks=B;function O(R){if(!(0,n.isComputed)(R)&&!(0,n.isWatcher)(R))throw new TypeError("Called hasSources without a Computed or Watcher argument");const P=R[Z].producerNode;return P?P.length>0:!1}u.hasSources=O;class tt{constructor(P){mr(this,A),mr(this,T),Tn(this,g);let N=Object.create(si);N.wrapper=this,N.consumerMarkedDirty=P,N.consumerIsAlwaysLive=!0,N.consumerAllowSignalWrites=!1,N.producerNode=[],this[Z]=N}watch(...P){if(!(0,n.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Is(this,T,S).call(this,P);const N=this[Z];N.dirty=!1;const L=ue(N);for(const v of P)Br(v[Z]);ue(L)}unwatch(...P){if(!(0,n.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Is(this,T,S).call(this,P);const N=this[Z];me(N);for(let L=N.producerNode.length-1;L>=0;L--)if(P.includes(N.producerNode[L].wrapper)){Hr(N.producerNode[L],N.producerIndexOfThis[L]);const v=N.producerNode.length-1;if(N.producerNode[L]=N.producerNode[v],N.producerIndexOfThis[L]=N.producerIndexOfThis[v],N.producerNode.length--,N.producerIndexOfThis.length--,N.nextProducerIndex--,L<N.producerNode.length){const d=N.producerIndexOfThis[L],f=N.producerNode[L];oi(f),f.liveConsumerIndexOfThis[d]=L}}}getPending(){if(!(0,n.isWatcher)(this))throw new TypeError("Called getPending without Watcher receiver");return this[Z].producerNode.filter(N=>N.dirty).map(N=>N.wrapper)}}g=Z,A=new WeakSet,T=new WeakSet,S=function(R){for(const P of R)if(!(0,n.isComputed)(P)&&!(0,n.isState)(P))throw new TypeError("Called watch/unwatch without a Computed or State argument")},n.isWatcher=R=>In(A,R),u.Watcher=tt;function J(){var R;return(R=Dl())==null?void 0:R.wrapper}u.currentComputed=J,u.watched=Symbol("watched"),u.unwatched=Symbol("unwatched")})(n.subtle||(n.subtle={}))})(kt||(kt={}));/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Jl=Symbol("SignalWatcherBrand"),Yl=new FinalizationRegistry(({watcher:n,signal:t})=>{n.unwatch(t)}),Cs=new WeakMap;function Zl(n){return n[Jl]===!0?(console.warn("SignalWatcher should not be applied to the same class more than once."),n):class extends n{constructor(){super(...arguments),this._$St=new kt.State(0),this._$Si=!1,this._$So=!0,this._$Sh=new Set}_$Sl(){if(this._$Su!==void 0)return;this._$Sv=new kt.Computed(()=>{this._$St.get(),super.performUpdate()});const t=this._$Su=new kt.subtle.Watcher(function(){const r=Cs.get(this);r!==void 0&&(r._$Si===!1&&r.requestUpdate(),this.watch())});Cs.set(t,this),Yl.register(this,{watcher:t,signal:this._$Sv}),t.watch(this._$Sv)}_$Sp(){this._$Su!==void 0&&(this._$Su.unwatch(this._$Sv),this._$Sv=void 0,this._$Su=void 0)}performUpdate(){this.isUpdatePending&&(this._$Sl(),this._$Si=!0,this._$St.set(this._$St.get()+1),this._$Si=!1,this._$Sv.get())}update(t){try{this._$So?(this._$So=!1,super.update(t)):this._$Sh.forEach(r=>r.commit())}finally{this.isUpdatePending=!1,this._$Sh.clear()}}requestUpdate(t,r,i){this._$So=!0,super.requestUpdate(t,r,i)}connectedCallback(){super.connectedCallback(),this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),queueMicrotask(()=>{this.isConnected===!1&&this._$Sp()})}_(t){this._$Sh.add(t);const r=this._$So;this.requestUpdate(),this._$So=r}m(t){this._$Sh.delete(t)}}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ql={ATTRIBUTE:1},th=n=>(...t)=>({_$litDirective$:n,values:t});let eh=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,i){this._$Ct=t,this._$AM=r,this._$Ci=i}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}};/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */kt.State;kt.Computed;const I=(n,t)=>new kt.State(n,t),Q=(n,t)=>new kt.Computed(n,t),rh="World",nh=I(rh),ih=I(0),sh=I(null);Q(()=>{const n=nh.get();return{name:n,greeting:`Hello, ${n}!`,clickCount:ih.get(),lastInteractionTs:sh.get()}});const oh=I(""),ah=I(null),lh=I("idle"),hh=I(null),ch=I(null);Q(()=>({packageName:oh.get(),packageData:ah.get(),status:lh.get(),lastUpdated:hh.get(),errorMessage:ch.get()}));const uh=["web-components","signals","monorepo"],dh=I(uh[0]),fh=I([]),ph=I("idle"),gh=I(null),mh=I(0),vh=I(null),Uo=I(!1),_h=I(!1);Q(()=>({version:mh.get(),topic:dh.get(),tasks:fh.get(),status:ph.get(),lastUpdated:gh.get(),isAutoRefreshing:_h.get(),errorMessage:vh.get()}));function yh(n){Uo.set(n)}if(typeof globalThis=="object"){const n=globalThis;n.__dfPracticeForcePracticeErrorSetter=yh,n.__dfPracticeGetForcePracticeError=()=>Uo.get()}const wh=[{id:"none",label:"None"},{id:"upload",label:"Upload"},{id:"site",label:"Site"},{id:"add",label:"Add"}],bh=I([]),Ah=I("none"),Eh=I(wh);Q(()=>({options:Eh.get(),selectedId:Ah.get(),disabledIds:bh.get()}));const Sh=I("none"),Th=I(""),Ih=I("Select File to Upload"),Ch=I(!1),Ph=I(0),Nh=I(!1),Rh=I("void");Q(()=>({mode:Sh.get(),linkUrl:Th.get(),fileName:Ih.get(),isUploading:Ch.get(),uploadProgress:Ph.get(),isValid:Nh.get(),mediaType:Rh.get()}));const Hn=I(0),Mo=I(""),Er=I("idle"),Fo=I(null),zn=I(null),kh=Q(()=>({tokenCount:Hn.get(),documentContent:Mo.get(),status:Er.get(),lastUpdated:Fo.get(),errorMessage:zn.get()}));function Vo(n){return/^\s*---/.test(n)?n.match(/^\s+---/)?{valid:!1,error:"Frontmatter cannot have leading whitespace. Remove spaces before the opening ---"}:n.match(/\n\n---\s*[\r\n]/)?{valid:!1,error:"Frontmatter has invalid structure (blank lines before closing ---). Remove blank lines within frontmatter"}:/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/.test(n)?{valid:!0}:{valid:!1,error:"Frontmatter is not properly structured. Ensure opening and closing --- are on their own lines with content between them"}:{valid:!0}}function Dh(n){if(!n||typeof n!="string")return"";if(!Vo(n).valid)return null;if(!n.startsWith("---"))return n;const r=/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/,i=n.match(r);return i?i[2]:null}function Oh(n){return!n||typeof n!="string"?0:n.split(/[\s\n\r\t.,!?;:(){}[\]"'`~@#$%^&*+=|\\<>/]+/).filter(r=>r.length>0).length}function xh(n){const t=Dh(n);if(t===null){const r=Vo(n);throw new Error(r.error||"Invalid frontmatter structure")}return Oh(t)}async function $h(n){try{Er.set("counting"),zn.set(null),Mo.set(n);const t=xh(n);Hn.set(t),Er.set("ready"),Fo.set(Date.now())}catch(t){const r=t instanceof Error?t.message:"Unknown error";Er.set("error"),zn.set(r),Hn.set(0)}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lh=()=>{};var Ps={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jo=function(n){const t=[];let r=0;for(let i=0;i<n.length;i++){let s=n.charCodeAt(i);s<128?t[r++]=s:s<2048?(t[r++]=s>>6|192,t[r++]=s&63|128):(s&64512)===55296&&i+1<n.length&&(n.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++i)&1023),t[r++]=s>>18|240,t[r++]=s>>12&63|128,t[r++]=s>>6&63|128,t[r++]=s&63|128):(t[r++]=s>>12|224,t[r++]=s>>6&63|128,t[r++]=s&63|128)}return t},Uh=function(n){const t=[];let r=0,i=0;for(;r<n.length;){const s=n[r++];if(s<128)t[i++]=String.fromCharCode(s);else if(s>191&&s<224){const l=n[r++];t[i++]=String.fromCharCode((s&31)<<6|l&63)}else if(s>239&&s<365){const l=n[r++],h=n[r++],u=n[r++],g=((s&7)<<18|(l&63)<<12|(h&63)<<6|u&63)-65536;t[i++]=String.fromCharCode(55296+(g>>10)),t[i++]=String.fromCharCode(56320+(g&1023))}else{const l=n[r++],h=n[r++];t[i++]=String.fromCharCode((s&15)<<12|(l&63)<<6|h&63)}}return t.join("")},Bo={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,t){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const r=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<n.length;s+=3){const l=n[s],h=s+1<n.length,u=h?n[s+1]:0,g=s+2<n.length,A=g?n[s+2]:0,T=l>>2,S=(l&3)<<4|u>>4;let C=(u&15)<<2|A>>6,$=A&63;g||($=64,h||(C=64)),i.push(r[T],r[S],r[C],r[$])}return i.join("")},encodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(n):this.encodeByteArray(jo(n),t)},decodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(n):Uh(this.decodeStringToByteArray(n,t))},decodeStringToByteArray(n,t){this.init_();const r=t?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<n.length;){const l=r[n.charAt(s++)],u=s<n.length?r[n.charAt(s)]:0;++s;const A=s<n.length?r[n.charAt(s)]:64;++s;const S=s<n.length?r[n.charAt(s)]:64;if(++s,l==null||u==null||A==null||S==null)throw new Mh;const C=l<<2|u>>4;if(i.push(C),A!==64){const $=u<<4&240|A>>2;if(i.push($),S!==64){const D=A<<6&192|S;i.push(D)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Mh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Fh=function(n){const t=jo(n);return Bo.encodeByteArray(t,!0)},Ho=function(n){return Fh(n).replace(/\./g,"")},zo=function(n){try{return Bo.decodeString(n,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vh(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jh=()=>Vh().__FIREBASE_DEFAULTS__,Bh=()=>{if(typeof process>"u"||typeof Ps>"u")return;const n=Ps.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Hh=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=n&&zo(n[1]);return t&&JSON.parse(t)},zh=()=>{try{return Lh()||jh()||Bh()||Hh()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Wh=n=>{var t;return(t=zh())===null||t===void 0?void 0:t[`_${n}`]};/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wo(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function At(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Gh(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(At())}function qh(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Kh(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Xh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Jh(){try{return typeof indexedDB=="object"}catch{return!1}}function Yh(){return new Promise((n,t)=>{try{let r=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),r||self.indexedDB.deleteDatabase(i),n(!0)},s.onupgradeneeded=()=>{r=!1},s.onerror=()=>{var l;t(((l=s.error)===null||l===void 0?void 0:l.message)||"")}}catch(r){t(r)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zh="FirebaseError";class Ot extends Error{constructor(t,r,i){super(r),this.code=t,this.customData=i,this.name=Zh,Object.setPrototypeOf(this,Ot.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Xe.prototype.create)}}class Xe{constructor(t,r,i){this.service=t,this.serviceName=r,this.errors=i}create(t,...r){const i=r[0]||{},s=`${this.service}/${t}`,l=this.errors[t],h=l?Qh(l,i):"Error",u=`${this.serviceName}: ${h} (${s}).`;return new Ot(s,u,i)}}function Qh(n,t){return n.replace(tc,(r,i)=>{const s=t[i];return s!=null?String(s):`<${i}?>`})}const tc=/\{\$([^}]+)}/g;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Go(n){const t=[];for(const[r,i]of Object.entries(n))Array.isArray(i)?i.forEach(s=>{t.push(encodeURIComponent(r)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(r)+"="+encodeURIComponent(i));return t.length?"&"+t.join("&"):""}function ec(n,t){const r=new rc(n,t);return r.subscribe.bind(r)}class rc{constructor(t,r){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=r,this.task.then(()=>{t(this)}).catch(i=>{this.error(i)})}next(t){this.forEachObserver(r=>{r.next(t)})}error(t){this.forEachObserver(r=>{r.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,r,i){let s;if(t===void 0&&r===void 0&&i===void 0)throw new Error("Missing Observer.");nc(t,["next","error","complete"])?s=t:s={next:t,error:r,complete:i},s.next===void 0&&(s.next=Nn),s.error===void 0&&(s.error=Nn),s.complete===void 0&&(s.complete=Nn);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),l}unsubscribeOne(t){this.observers===void 0||this.observers[t]===void 0||(delete this.observers[t],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let r=0;r<this.observers.length;r++)this.sendOne(r,t)}sendOne(t,r){this.task.then(()=>{if(this.observers!==void 0&&this.observers[t]!==void 0)try{r(this.observers[t])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(t){this.finalized||(this.finalized=!0,t!==void 0&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function nc(n,t){if(typeof n!="object"||n===null)return!1;for(const r of t)if(r in n&&typeof n[r]=="function")return!0;return!1}function Nn(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zr(n){return n&&n._delegate?n._delegate:n}class Bt{constructor(t,r,i){this.name=t,this.instanceFactory=r,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var j;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(j||(j={}));const ic={debug:j.DEBUG,verbose:j.VERBOSE,info:j.INFO,warn:j.WARN,error:j.ERROR,silent:j.SILENT},sc=j.INFO,oc={[j.DEBUG]:"log",[j.VERBOSE]:"log",[j.INFO]:"info",[j.WARN]:"warn",[j.ERROR]:"error"},ac=(n,t,...r)=>{if(t<n.logLevel)return;const i=new Date().toISOString(),s=oc[t];if(s)console[s](`[${i}]  ${n.name}:`,...r);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class ai{constructor(t){this.name=t,this._logLevel=sc,this._logHandler=ac,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in j))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?ic[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,j.DEBUG,...t),this._logHandler(this,j.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,j.VERBOSE,...t),this._logHandler(this,j.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,j.INFO,...t),this._logHandler(this,j.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,j.WARN,...t),this._logHandler(this,j.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,j.ERROR,...t),this._logHandler(this,j.ERROR,...t)}}const lc=(n,t)=>t.some(r=>n instanceof r);let Ns,Rs;function hc(){return Ns||(Ns=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cc(){return Rs||(Rs=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const qo=new WeakMap,Wn=new WeakMap,Ko=new WeakMap,Rn=new WeakMap,li=new WeakMap;function uc(n){const t=new Promise((r,i)=>{const s=()=>{n.removeEventListener("success",l),n.removeEventListener("error",h)},l=()=>{r(jt(n.result)),s()},h=()=>{i(n.error),s()};n.addEventListener("success",l),n.addEventListener("error",h)});return t.then(r=>{r instanceof IDBCursor&&qo.set(r,n)}).catch(()=>{}),li.set(t,n),t}function dc(n){if(Wn.has(n))return;const t=new Promise((r,i)=>{const s=()=>{n.removeEventListener("complete",l),n.removeEventListener("error",h),n.removeEventListener("abort",h)},l=()=>{r(),s()},h=()=>{i(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",l),n.addEventListener("error",h),n.addEventListener("abort",h)});Wn.set(n,t)}let Gn={get(n,t,r){if(n instanceof IDBTransaction){if(t==="done")return Wn.get(n);if(t==="objectStoreNames")return n.objectStoreNames||Ko.get(n);if(t==="store")return r.objectStoreNames[1]?void 0:r.objectStore(r.objectStoreNames[0])}return jt(n[t])},set(n,t,r){return n[t]=r,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function fc(n){Gn=n(Gn)}function pc(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...r){const i=n.call(kn(this),t,...r);return Ko.set(i,t.sort?t.sort():[t]),jt(i)}:cc().includes(n)?function(...t){return n.apply(kn(this),t),jt(qo.get(this))}:function(...t){return jt(n.apply(kn(this),t))}}function gc(n){return typeof n=="function"?pc(n):(n instanceof IDBTransaction&&dc(n),lc(n,hc())?new Proxy(n,Gn):n)}function jt(n){if(n instanceof IDBRequest)return uc(n);if(Rn.has(n))return Rn.get(n);const t=gc(n);return t!==n&&(Rn.set(n,t),li.set(t,n)),t}const kn=n=>li.get(n);function mc(n,t,{blocked:r,upgrade:i,blocking:s,terminated:l}={}){const h=indexedDB.open(n,t),u=jt(h);return i&&h.addEventListener("upgradeneeded",g=>{i(jt(h.result),g.oldVersion,g.newVersion,jt(h.transaction),g)}),r&&h.addEventListener("blocked",g=>r(g.oldVersion,g.newVersion,g)),u.then(g=>{l&&g.addEventListener("close",()=>l()),s&&g.addEventListener("versionchange",A=>s(A.oldVersion,A.newVersion,A))}).catch(()=>{}),u}const vc=["get","getKey","getAll","getAllKeys","count"],_c=["put","add","delete","clear"],Dn=new Map;function ks(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if(Dn.get(t))return Dn.get(t);const r=t.replace(/FromIndex$/,""),i=t!==r,s=_c.includes(r);if(!(r in(i?IDBIndex:IDBObjectStore).prototype)||!(s||vc.includes(r)))return;const l=async function(h,...u){const g=this.transaction(h,s?"readwrite":"readonly");let A=g.store;return i&&(A=A.index(u.shift())),(await Promise.all([A[r](...u),s&&g.done]))[0]};return Dn.set(t,l),l}fc(n=>({...n,get:(t,r,i)=>ks(t,r)||n.get(t,r,i),has:(t,r)=>!!ks(t,r)||n.has(t,r)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yc{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(r=>{if(wc(r)){const i=r.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(r=>r).join(" ")}}function wc(n){const t=n.getComponent();return(t==null?void 0:t.type)==="VERSION"}const qn="@firebase/app",Ds="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dt=new ai("@firebase/app"),bc="@firebase/app-compat",Ac="@firebase/analytics-compat",Ec="@firebase/analytics",Sc="@firebase/app-check-compat",Tc="@firebase/app-check",Ic="@firebase/auth",Cc="@firebase/auth-compat",Pc="@firebase/database",Nc="@firebase/data-connect",Rc="@firebase/database-compat",kc="@firebase/functions",Dc="@firebase/functions-compat",Oc="@firebase/installations",xc="@firebase/installations-compat",$c="@firebase/messaging",Lc="@firebase/messaging-compat",Uc="@firebase/performance",Mc="@firebase/performance-compat",Fc="@firebase/remote-config",Vc="@firebase/remote-config-compat",jc="@firebase/storage",Bc="@firebase/storage-compat",Hc="@firebase/firestore",zc="@firebase/ai",Wc="@firebase/firestore-compat",Gc="firebase",qc="11.10.0",Kc={[qn]:"fire-core",[bc]:"fire-core-compat",[Ec]:"fire-analytics",[Ac]:"fire-analytics-compat",[Tc]:"fire-app-check",[Sc]:"fire-app-check-compat",[Ic]:"fire-auth",[Cc]:"fire-auth-compat",[Pc]:"fire-rtdb",[Nc]:"fire-data-connect",[Rc]:"fire-rtdb-compat",[kc]:"fire-fn",[Dc]:"fire-fn-compat",[Oc]:"fire-iid",[xc]:"fire-iid-compat",[$c]:"fire-fcm",[Lc]:"fire-fcm-compat",[Uc]:"fire-perf",[Mc]:"fire-perf-compat",[Fc]:"fire-rc",[Vc]:"fire-rc-compat",[jc]:"fire-gcs",[Bc]:"fire-gcs-compat",[Hc]:"fire-fst",[Wc]:"fire-fst-compat",[zc]:"fire-vertex","fire-js":"fire-js",[Gc]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xc=new Map,Jc=new Map,Os=new Map;function xs(n,t){try{n.container.addComponent(t)}catch(r){Dt.debug(`Component ${t.name} failed to register with FirebaseApp ${n.name}`,r)}}function Ht(n){const t=n.name;if(Os.has(t))return Dt.debug(`There were multiple attempts to register component ${t}.`),!1;Os.set(t,n);for(const r of Xc.values())xs(r,n);for(const r of Jc.values())xs(r,n);return!0}function Pt(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yc={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},hi=new Xe("app","Firebase",Yc);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Je=qc;function dt(n,t,r){var i;let s=(i=Kc[n])!==null&&i!==void 0?i:n;r&&(s+=`-${r}`);const l=s.match(/\s|\//),h=t.match(/\s|\//);if(l||h){const u=[`Unable to register library "${s}" with version "${t}":`];l&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),l&&h&&u.push("and"),h&&u.push(`version name "${t}" contains illegal characters (whitespace or "/")`),Dt.warn(u.join(" "));return}Ht(new Bt(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zc="firebase-heartbeat-database",Qc=1,Ge="firebase-heartbeat-store";let On=null;function Xo(){return On||(On=mc(Zc,Qc,{upgrade:(n,t)=>{switch(t){case 0:try{n.createObjectStore(Ge)}catch(r){console.warn(r)}}}}).catch(n=>{throw hi.create("idb-open",{originalErrorMessage:n.message})})),On}async function tu(n){try{const r=(await Xo()).transaction(Ge),i=await r.objectStore(Ge).get(Jo(n));return await r.done,i}catch(t){if(t instanceof Ot)Dt.warn(t.message);else{const r=hi.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});Dt.warn(r.message)}}}async function $s(n,t){try{const i=(await Xo()).transaction(Ge,"readwrite");await i.objectStore(Ge).put(t,Jo(n)),await i.done}catch(r){if(r instanceof Ot)Dt.warn(r.message);else{const i=hi.create("idb-set",{originalErrorMessage:r==null?void 0:r.message});Dt.warn(i.message)}}}function Jo(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eu=1024,ru=30;class nu{constructor(t){this.container=t,this._heartbeatsCache=null;const r=this.container.getProvider("app").getImmediate();this._storage=new su(r),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var t,r;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Ls();if(((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((r=this._heartbeatsCache)===null||r===void 0?void 0:r.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:s}),this._heartbeatsCache.heartbeats.length>ru){const h=ou(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(h,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){Dt.warn(i)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const r=Ls(),{heartbeatsToSend:i,unsentEntries:s}=iu(this._heartbeatsCache.heartbeats),l=Ho(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=r,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(r){return Dt.warn(r),""}}}function Ls(){return new Date().toISOString().substring(0,10)}function iu(n,t=eu){const r=[];let i=n.slice();for(const s of n){const l=r.find(h=>h.agent===s.agent);if(l){if(l.dates.push(s.date),Us(r)>t){l.dates.pop();break}}else if(r.push({agent:s.agent,dates:[s.date]}),Us(r)>t){r.pop();break}i=i.slice(1)}return{heartbeatsToSend:r,unsentEntries:i}}class su{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Jh()?Yh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const r=await tu(this.app);return r!=null&&r.heartbeats?r:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var r;if(await this._canUseIndexedDBPromise){const s=await this.read();return $s(this.app,{lastSentHeartbeatDate:(r=t.lastSentHeartbeatDate)!==null&&r!==void 0?r:s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var r;if(await this._canUseIndexedDBPromise){const s=await this.read();return $s(this.app,{lastSentHeartbeatDate:(r=t.lastSentHeartbeatDate)!==null&&r!==void 0?r:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}}function Us(n){return Ho(JSON.stringify({version:2,heartbeats:n})).length}function ou(n){if(n.length===0)return-1;let t=0,r=n[0].date;for(let i=1;i<n.length;i++)n[i].date<r&&(r=n[i].date,t=i);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function au(n){Ht(new Bt("platform-logger",t=>new yc(t),"PRIVATE")),Ht(new Bt("heartbeat",t=>new nu(t),"PRIVATE")),dt(qn,Ds,n),dt(qn,Ds,"esm2017"),dt("fire-js","")}au("");function Yo(n,t){var r={};for(var i in n)Object.prototype.hasOwnProperty.call(n,i)&&t.indexOf(i)<0&&(r[i]=n[i]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,i=Object.getOwnPropertySymbols(n);s<i.length;s++)t.indexOf(i[s])<0&&Object.prototype.propertyIsEnumerable.call(n,i[s])&&(r[i[s]]=n[i[s]]);return r}function X(n,t,r,i){var s=arguments.length,l=s<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,r):i,h;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")l=Reflect.decorate(n,t,r,i);else for(var u=n.length-1;u>=0;u--)(h=n[u])&&(l=(s<3?h(l):s>3?h(t,r,l):h(t,r))||l);return s>3&&l&&Object.defineProperty(t,r,l),l}function Zo(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const lu=Zo,Qo=new Xe("auth","Firebase",Zo());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kr=new ai("@firebase/auth");function hu(n,...t){kr.logLevel<=j.WARN&&kr.warn(`Auth (${Je}): ${n}`,...t)}function Sr(n,...t){kr.logLevel<=j.ERROR&&kr.error(`Auth (${Je}): ${n}`,...t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ms(n,...t){throw ci(n,...t)}function ta(n,...t){return ci(n,...t)}function ea(n,t,r){const i=Object.assign(Object.assign({},lu()),{[t]:r});return new Xe("auth","Firebase",i).create(t,{appName:n.name})}function Tr(n){return ea(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ci(n,...t){if(typeof n!="string"){const r=t[0],i=[...t.slice(1)];return i[0]&&(i[0].appName=n.name),n._errorFactory.create(r,...i)}return Qo.create(n,...t)}function M(n,t,...r){if(!n)throw ci(t,...r)}function Fe(n){const t="INTERNAL ASSERTION FAILED: "+n;throw Sr(t),new Error(t)}function Dr(n,t){n||Fe(t)}function cu(){return Fs()==="http:"||Fs()==="https:"}function Fs(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uu(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(cu()||Kh()||"connection"in navigator)?navigator.onLine:!0}function du(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ye{constructor(t,r){this.shortDelay=t,this.longDelay=r,Dr(r>t,"Short delay should be less than long delay!"),this.isMobile=Gh()||Xh()}get(){return uu()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fu(n,t){Dr(n.emulator,"Emulator should always be set here");const{url:r}=n.emulator;return t?`${r}${t.startsWith("/")?t.slice(1):t}`:r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ra{static initialize(t,r,i){this.fetchImpl=t,r&&(this.headersImpl=r),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Fe("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Fe("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Fe("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pu={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gu=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],mu=new Ye(3e4,6e4);function na(n,t){return n.tenantId&&!t.tenantId?Object.assign(Object.assign({},t),{tenantId:n.tenantId}):t}async function Wr(n,t,r,i,s={}){return ia(n,s,async()=>{let l={},h={};i&&(t==="GET"?h=i:l={body:JSON.stringify(i)});const u=Go(Object.assign({key:n.config.apiKey},h)).slice(1),g=await n._getAdditionalHeaders();g["Content-Type"]="application/json",n.languageCode&&(g["X-Firebase-Locale"]=n.languageCode);const A=Object.assign({method:t,headers:g},l);return qh()||(A.referrerPolicy="no-referrer"),n.emulatorConfig&&Wo(n.emulatorConfig.host)&&(A.credentials="include"),ra.fetch()(await sa(n,n.config.apiHost,r,u),A)})}async function ia(n,t,r){n._canInitEmulator=!1;const i=Object.assign(Object.assign({},pu),t);try{const s=new vu(n),l=await Promise.race([r(),s.promise]);s.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw vr(n,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const u=l.ok?h.errorMessage:h.error.message,[g,A]=u.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw vr(n,"credential-already-in-use",h);if(g==="EMAIL_EXISTS")throw vr(n,"email-already-in-use",h);if(g==="USER_DISABLED")throw vr(n,"user-disabled",h);const T=i[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(A)throw ea(n,T,A);Ms(n,T)}}catch(s){if(s instanceof Ot)throw s;Ms(n,"network-request-failed",{message:String(s)})}}async function sa(n,t,r,i){const s=`${t}${r}?${i}`,l=n,h=l.config.emulator?fu(n.config,s):`${n.config.apiScheme}://${s}`;return gu.includes(r)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(h).toString():h}class vu{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(t){this.auth=t,this.timer=null,this.promise=new Promise((r,i)=>{this.timer=setTimeout(()=>i(ta(this.auth,"network-request-failed")),mu.get())})}}function vr(n,t,r){const i={appName:n.name};r.email&&(i.email=r.email),r.phoneNumber&&(i.phoneNumber=r.phoneNumber);const s=ta(n,t,i);return s.customData._tokenResponse=r,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _u(n,t){return Wr(n,"POST","/v1/accounts:delete",t)}async function Or(n,t){return Wr(n,"POST","/v1/accounts:lookup",t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ve(n){if(n)try{const t=new Date(Number(n));if(!isNaN(t.getTime()))return t.toUTCString()}catch{}}async function yu(n,t=!1){const r=zr(n),i=await r.getIdToken(t),s=oa(i);M(s&&s.exp&&s.auth_time&&s.iat,r.auth,"internal-error");const l=typeof s.firebase=="object"?s.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:s,token:i,authTime:Ve(xn(s.auth_time)),issuedAtTime:Ve(xn(s.iat)),expirationTime:Ve(xn(s.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function xn(n){return Number(n)*1e3}function oa(n){const[t,r,i]=n.split(".");if(t===void 0||r===void 0||i===void 0)return Sr("JWT malformed, contained fewer than 3 sections"),null;try{const s=zo(r);return s?JSON.parse(s):(Sr("Failed to decode base64 JWT payload"),null)}catch(s){return Sr("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Vs(n){const t=oa(n);return M(t,"internal-error"),M(typeof t.exp<"u","internal-error"),M(typeof t.iat<"u","internal-error"),Number(t.exp)-Number(t.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kn(n,t,r=!1){if(r)return t;try{return await t}catch(i){throw i instanceof Ot&&wu(i)&&n.auth.currentUser===n&&await n.auth.signOut(),i}}function wu({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bu{constructor(t){this.user=t,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(t){var r;if(t){const i=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),i}else{this.errorBackoff=3e4;const s=((r=this.user.stsTokenManager.expirationTime)!==null&&r!==void 0?r:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(t=!1){if(!this.isRunning)return;const r=this.getInterval(t);this.timerId=setTimeout(async()=>{await this.iteration()},r)}async iteration(){try{await this.user.getIdToken(!0)}catch(t){(t==null?void 0:t.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xn{constructor(t,r){this.createdAt=t,this.lastLoginAt=r,this._initializeTime()}_initializeTime(){this.lastSignInTime=Ve(this.lastLoginAt),this.creationTime=Ve(this.createdAt)}_copy(t){this.createdAt=t.createdAt,this.lastLoginAt=t.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xr(n){var t;const r=n.auth,i=await n.getIdToken(),s=await Kn(n,Or(r,{idToken:i}));M(s==null?void 0:s.users.length,r,"internal-error");const l=s.users[0];n._notifyReloadListener(l);const h=!((t=l.providerUserInfo)===null||t===void 0)&&t.length?aa(l.providerUserInfo):[],u=Eu(n.providerData,h),g=n.isAnonymous,A=!(n.email&&l.passwordHash)&&!(u!=null&&u.length),T=g?A:!1,S={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:u,metadata:new Xn(l.createdAt,l.lastLoginAt),isAnonymous:T};Object.assign(n,S)}async function Au(n){const t=zr(n);await xr(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}function Eu(n,t){return[...n.filter(i=>!t.some(s=>s.providerId===i.providerId)),...t]}function aa(n){return n.map(t=>{var{providerId:r}=t,i=Yo(t,["providerId"]);return{providerId:r,uid:i.rawId||"",displayName:i.displayName||null,email:i.email||null,phoneNumber:i.phoneNumber||null,photoURL:i.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Su(n,t){const r=await ia(n,{},async()=>{const i=Go({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:s,apiKey:l}=n.config,h=await sa(n,s,"/v1/token",`key=${l}`),u=await n._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const g={method:"POST",headers:u,body:i};return n.emulatorConfig&&Wo(n.emulatorConfig.host)&&(g.credentials="include"),ra.fetch()(h,g)});return{accessToken:r.access_token,expiresIn:r.expires_in,refreshToken:r.refresh_token}}async function Tu(n,t){return Wr(n,"POST","/v2/accounts:revokeToken",na(n,t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class de{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(t){M(t.idToken,"internal-error"),M(typeof t.idToken<"u","internal-error"),M(typeof t.refreshToken<"u","internal-error");const r="expiresIn"in t&&typeof t.expiresIn<"u"?Number(t.expiresIn):Vs(t.idToken);this.updateTokensAndExpiration(t.idToken,t.refreshToken,r)}updateFromIdToken(t){M(t.length!==0,"internal-error");const r=Vs(t);this.updateTokensAndExpiration(t,null,r)}async getToken(t,r=!1){return!r&&this.accessToken&&!this.isExpired?this.accessToken:(M(this.refreshToken,t,"user-token-expired"),this.refreshToken?(await this.refresh(t,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(t,r){const{accessToken:i,refreshToken:s,expiresIn:l}=await Su(t,r);this.updateTokensAndExpiration(i,s,Number(l))}updateTokensAndExpiration(t,r,i){this.refreshToken=r||null,this.accessToken=t||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(t,r){const{refreshToken:i,accessToken:s,expirationTime:l}=r,h=new de;return i&&(M(typeof i=="string","internal-error",{appName:t}),h.refreshToken=i),s&&(M(typeof s=="string","internal-error",{appName:t}),h.accessToken=s),l&&(M(typeof l=="number","internal-error",{appName:t}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(t){this.accessToken=t.accessToken,this.refreshToken=t.refreshToken,this.expirationTime=t.expirationTime}_clone(){return Object.assign(new de,this.toJSON())}_performRefresh(){return Fe("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mt(n,t){M(typeof n=="string"||typeof n>"u","internal-error",{appName:t})}class wt{constructor(t){var{uid:r,auth:i,stsTokenManager:s}=t,l=Yo(t,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new bu(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=r,this.auth=i,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new Xn(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(t){const r=await Kn(this,this.stsTokenManager.getToken(this.auth,t));return M(r,this.auth,"internal-error"),this.accessToken!==r&&(this.accessToken=r,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),r}getIdTokenResult(t){return yu(this,t)}reload(){return Au(this)}_assign(t){this!==t&&(M(this.uid===t.uid,this.auth,"internal-error"),this.displayName=t.displayName,this.photoURL=t.photoURL,this.email=t.email,this.emailVerified=t.emailVerified,this.phoneNumber=t.phoneNumber,this.isAnonymous=t.isAnonymous,this.tenantId=t.tenantId,this.providerData=t.providerData.map(r=>Object.assign({},r)),this.metadata._copy(t.metadata),this.stsTokenManager._assign(t.stsTokenManager))}_clone(t){const r=new wt(Object.assign(Object.assign({},this),{auth:t,stsTokenManager:this.stsTokenManager._clone()}));return r.metadata._copy(this.metadata),r}_onReload(t){M(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=t,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(t){this.reloadListener?this.reloadListener(t):this.reloadUserInfo=t}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(t,r=!1){let i=!1;t.idToken&&t.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(t),i=!0),r&&await xr(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Pt(this.auth.app))return Promise.reject(Tr(this.auth));const t=await this.getIdToken();return await Kn(this,_u(this.auth,{idToken:t})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(t=>Object.assign({},t)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(t,r){var i,s,l,h,u,g,A,T;const S=(i=r.displayName)!==null&&i!==void 0?i:void 0,C=(s=r.email)!==null&&s!==void 0?s:void 0,$=(l=r.phoneNumber)!==null&&l!==void 0?l:void 0,D=(h=r.photoURL)!==null&&h!==void 0?h:void 0,B=(u=r.tenantId)!==null&&u!==void 0?u:void 0,O=(g=r._redirectEventId)!==null&&g!==void 0?g:void 0,tt=(A=r.createdAt)!==null&&A!==void 0?A:void 0,J=(T=r.lastLoginAt)!==null&&T!==void 0?T:void 0,{uid:R,emailVerified:P,isAnonymous:N,providerData:L,stsTokenManager:v}=r;M(R&&v,t,"internal-error");const d=de.fromJSON(this.name,v);M(typeof R=="string",t,"internal-error"),Mt(S,t.name),Mt(C,t.name),M(typeof P=="boolean",t,"internal-error"),M(typeof N=="boolean",t,"internal-error"),Mt($,t.name),Mt(D,t.name),Mt(B,t.name),Mt(O,t.name),Mt(tt,t.name),Mt(J,t.name);const f=new wt({uid:R,auth:t,email:C,emailVerified:P,displayName:S,isAnonymous:N,photoURL:D,phoneNumber:$,tenantId:B,stsTokenManager:d,createdAt:tt,lastLoginAt:J});return L&&Array.isArray(L)&&(f.providerData=L.map(m=>Object.assign({},m))),O&&(f._redirectEventId=O),f}static async _fromIdTokenResponse(t,r,i=!1){const s=new de;s.updateFromServerResponse(r);const l=new wt({uid:r.localId,auth:t,stsTokenManager:s,isAnonymous:i});return await xr(l),l}static async _fromGetAccountInfoResponse(t,r,i){const s=r.users[0];M(s.localId!==void 0,"internal-error");const l=s.providerUserInfo!==void 0?aa(s.providerUserInfo):[],h=!(s.email&&s.passwordHash)&&!(l!=null&&l.length),u=new de;u.updateFromIdToken(i);const g=new wt({uid:s.localId,auth:t,stsTokenManager:u,isAnonymous:h}),A={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Xn(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(l!=null&&l.length)};return Object.assign(g,A),g}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const js=new Map;function Jt(n){Dr(n instanceof Function,"Expected a class definition");let t=js.get(n);return t?(Dr(t instanceof n,"Instance stored in cache mismatched with class"),t):(t=new n,js.set(n,t),t)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class la{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(t,r){this.storage[t]=r}async _get(t){const r=this.storage[t];return r===void 0?null:r}async _remove(t){delete this.storage[t]}_addListener(t,r){}_removeListener(t,r){}}la.type="NONE";const Bs=la;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $n(n,t,r){return`firebase:${n}:${t}:${r}`}class fe{constructor(t,r,i){this.persistence=t,this.auth=r,this.userKey=i;const{config:s,name:l}=this.auth;this.fullUserKey=$n(this.userKey,s.apiKey,l),this.fullPersistenceKey=$n("persistence",s.apiKey,l),this.boundEventHandler=r._onStorageEvent.bind(r),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(t){return this.persistence._set(this.fullUserKey,t.toJSON())}async getCurrentUser(){const t=await this.persistence._get(this.fullUserKey);if(!t)return null;if(typeof t=="string"){const r=await Or(this.auth,{idToken:t}).catch(()=>{});return r?wt._fromGetAccountInfoResponse(this.auth,r,t):null}return wt._fromJSON(this.auth,t)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(t){if(this.persistence===t)return;const r=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=t,r)return this.setCurrentUser(r)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(t,r,i="authUser"){if(!r.length)return new fe(Jt(Bs),t,i);const s=(await Promise.all(r.map(async A=>{if(await A._isAvailable())return A}))).filter(A=>A);let l=s[0]||Jt(Bs);const h=$n(i,t.config.apiKey,t.name);let u=null;for(const A of r)try{const T=await A._get(h);if(T){let S;if(typeof T=="string"){const C=await Or(t,{idToken:T}).catch(()=>{});if(!C)break;S=await wt._fromGetAccountInfoResponse(t,C,T)}else S=wt._fromJSON(t,T);A!==l&&(u=S),l=A;break}}catch{}const g=s.filter(A=>A._shouldAllowMigration);return!l._shouldAllowMigration||!g.length?new fe(l,t,i):(l=g[0],u&&await l._set(h,u.toJSON()),await Promise.all(r.map(async A=>{if(A!==l)try{await A._remove(h)}catch{}})),new fe(l,t,i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hs(n){const t=n.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(Nu(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(Iu(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(ku(t))return"Blackberry";if(Du(t))return"Webos";if(Cu(t))return"Safari";if((t.includes("chrome/")||Pu(t))&&!t.includes("edge/"))return"Chrome";if(Ru(t))return"Android";{const r=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=n.match(r);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function Iu(n=At()){return/firefox\//i.test(n)}function Cu(n=At()){const t=n.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function Pu(n=At()){return/crios\//i.test(n)}function Nu(n=At()){return/iemobile/i.test(n)}function Ru(n=At()){return/android/i.test(n)}function ku(n=At()){return/blackberry/i.test(n)}function Du(n=At()){return/webos/i.test(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ha(n,t=[]){let r;switch(n){case"Browser":r=Hs(At());break;case"Worker":r=`${Hs(At())}-${n}`;break;default:r=n}const i=t.length?t.join(","):"FirebaseCore-web";return`${r}/JsCore/${Je}/${i}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ou{constructor(t){this.auth=t,this.queue=[]}pushCallback(t,r){const i=l=>new Promise((h,u)=>{try{const g=t(l);h(g)}catch(g){u(g)}});i.onAbort=r,this.queue.push(i);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(t){if(this.auth.currentUser===t)return;const r=[];try{for(const i of this.queue)await i(t),i.onAbort&&r.push(i.onAbort)}catch(i){r.reverse();for(const s of r)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xu(n,t={}){return Wr(n,"GET","/v2/passwordPolicy",na(n,t))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $u=6;class Lu{constructor(t){var r,i,s,l;const h=t.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(r=h.minPasswordLength)!==null&&r!==void 0?r:$u,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=t.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(i=t.allowedNonAlphanumericCharacters)===null||i===void 0?void 0:i.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(l=t.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=t.schemaVersion}validatePassword(t){var r,i,s,l,h,u;const g={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(t,g),this.validatePasswordCharacterOptions(t,g),g.isValid&&(g.isValid=(r=g.meetsMinPasswordLength)!==null&&r!==void 0?r:!0),g.isValid&&(g.isValid=(i=g.meetsMaxPasswordLength)!==null&&i!==void 0?i:!0),g.isValid&&(g.isValid=(s=g.containsLowercaseLetter)!==null&&s!==void 0?s:!0),g.isValid&&(g.isValid=(l=g.containsUppercaseLetter)!==null&&l!==void 0?l:!0),g.isValid&&(g.isValid=(h=g.containsNumericCharacter)!==null&&h!==void 0?h:!0),g.isValid&&(g.isValid=(u=g.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),g}validatePasswordLengthOptions(t,r){const i=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;i&&(r.meetsMinPasswordLength=t.length>=i),s&&(r.meetsMaxPasswordLength=t.length<=s)}validatePasswordCharacterOptions(t,r){this.updatePasswordCharacterOptionsStatuses(r,!1,!1,!1,!1);let i;for(let s=0;s<t.length;s++)i=t.charAt(s),this.updatePasswordCharacterOptionsStatuses(r,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(t,r,i,s,l){this.customStrengthOptions.containsLowercaseLetter&&(t.containsLowercaseLetter||(t.containsLowercaseLetter=r)),this.customStrengthOptions.containsUppercaseLetter&&(t.containsUppercaseLetter||(t.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(t.containsNumericCharacter||(t.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(t.containsNonAlphanumericCharacter||(t.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uu{constructor(t,r,i,s){this.app=t,this.heartbeatServiceProvider=r,this.appCheckServiceProvider=i,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new zs(this),this.idTokenSubscription=new zs(this),this.beforeStateQueue=new Ou(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Qo,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=t.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(t,r){return r&&(this._popupRedirectResolver=Jt(r)),this._initializationPromise=this.queue(async()=>{var i,s,l;if(!this._deleted&&(this.persistenceManager=await fe.create(this,t),(i=this._resolvePersistenceManagerAvailable)===null||i===void 0||i.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(r),this.lastNotifiedUid=((l=this.currentUser)===null||l===void 0?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const t=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!t)){if(this.currentUser&&t&&this.currentUser.uid===t.uid){this._currentUser._assign(t),await this.currentUser.getIdToken();return}await this._updateCurrentUser(t,!0)}}async initializeCurrentUserFromIdToken(t){try{const r=await Or(this,{idToken:t}),i=await wt._fromGetAccountInfoResponse(this,r,t);await this.directlySetCurrentUser(i)}catch(r){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",r),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(t){var r;if(Pt(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(u,u))}):this.directlySetCurrentUser(null)}const i=await this.assertedPersistence.getCurrentUser();let s=i,l=!1;if(t&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId,u=s==null?void 0:s._redirectEventId,g=await this.tryRedirectSignIn(t);(!h||h===u)&&(g!=null&&g.user)&&(s=g.user,l=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(s)}catch(h){s=i,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return M(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(t){let r=null;try{r=await this._popupRedirectResolver._completeRedirectFn(this,t,!0)}catch{await this._setRedirectUser(null)}return r}async reloadAndSetCurrentUserOrClear(t){try{await xr(t)}catch(r){if((r==null?void 0:r.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(t)}useDeviceLanguage(){this.languageCode=du()}async _delete(){this._deleted=!0}async updateCurrentUser(t){if(Pt(this.app))return Promise.reject(Tr(this));const r=t?zr(t):null;return r&&M(r.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(r&&r._clone(this))}async _updateCurrentUser(t,r=!1){if(!this._deleted)return t&&M(this.tenantId===t.tenantId,this,"tenant-id-mismatch"),r||await this.beforeStateQueue.runMiddleware(t),this.queue(async()=>{await this.directlySetCurrentUser(t),this.notifyAuthListeners()})}async signOut(){return Pt(this.app)?Promise.reject(Tr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(t){return Pt(this.app)?Promise.reject(Tr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Jt(t))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(t){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const r=this._getPasswordPolicyInternal();return r.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):r.validatePassword(t)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const t=await xu(this),r=new Lu(t);this.tenantId===null?this._projectPasswordPolicy=r:this._tenantPasswordPolicies[this.tenantId]=r}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(t){this._errorFactory=new Xe("auth","Firebase",t())}onAuthStateChanged(t,r,i){return this.registerStateListener(this.authStateSubscription,t,r,i)}beforeAuthStateChanged(t,r){return this.beforeStateQueue.pushCallback(t,r)}onIdTokenChanged(t,r,i){return this.registerStateListener(this.idTokenSubscription,t,r,i)}authStateReady(){return new Promise((t,r)=>{if(this.currentUser)t();else{const i=this.onAuthStateChanged(()=>{i(),t()},r)}})}async revokeAccessToken(t){if(this.currentUser){const r=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:t,idToken:r};this.tenantId!=null&&(i.tenantId=this.tenantId),await Tu(this,i)}}toJSON(){var t;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(t=this._currentUser)===null||t===void 0?void 0:t.toJSON()}}async _setRedirectUser(t,r){const i=await this.getOrInitRedirectPersistenceManager(r);return t===null?i.removeCurrentUser():i.setCurrentUser(t)}async getOrInitRedirectPersistenceManager(t){if(!this.redirectPersistenceManager){const r=t&&Jt(t)||this._popupRedirectResolver;M(r,this,"argument-error"),this.redirectPersistenceManager=await fe.create(this,[Jt(r._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(t){var r,i;return this._isInitialized&&await this.queue(async()=>{}),((r=this._currentUser)===null||r===void 0?void 0:r._redirectEventId)===t?this._currentUser:((i=this.redirectUser)===null||i===void 0?void 0:i._redirectEventId)===t?this.redirectUser:null}async _persistUserIfCurrent(t){if(t===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(t))}_notifyListenersIfCurrent(t){t===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t,r;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const i=(r=(t=this.currentUser)===null||t===void 0?void 0:t.uid)!==null&&r!==void 0?r:null;this.lastNotifiedUid!==i&&(this.lastNotifiedUid=i,this.authStateSubscription.next(this.currentUser))}registerStateListener(t,r,i,s){if(this._deleted)return()=>{};const l=typeof r=="function"?r:r.next.bind(r);let h=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(M(u,this,"internal-error"),u.then(()=>{h||l(this.currentUser)}),typeof r=="function"){const g=t.addObserver(r,i,s);return()=>{h=!0,g()}}else{const g=t.addObserver(r);return()=>{h=!0,g()}}}async directlySetCurrentUser(t){this.currentUser&&this.currentUser!==t&&this._currentUser._stopProactiveRefresh(),t&&this.isProactiveRefreshEnabled&&t._startProactiveRefresh(),this.currentUser=t,t?await this.assertedPersistence.setCurrentUser(t):await this.assertedPersistence.removeCurrentUser()}queue(t){return this.operations=this.operations.then(t,t),this.operations}get assertedPersistence(){return M(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(t){!t||this.frameworks.includes(t)||(this.frameworks.push(t),this.frameworks.sort(),this.clientVersion=ha(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var t;const r={"X-Client-Version":this.clientVersion};this.app.options.appId&&(r["X-Firebase-gmpid"]=this.app.options.appId);const i=await((t=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||t===void 0?void 0:t.getHeartbeatsHeader());i&&(r["X-Firebase-Client"]=i);const s=await this._getAppCheckToken();return s&&(r["X-Firebase-AppCheck"]=s),r}async _getAppCheckToken(){var t;if(Pt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const r=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||t===void 0?void 0:t.getToken());return r!=null&&r.error&&hu(`Error while retrieving App Check token: ${r.error}`),r==null?void 0:r.token}}function Mu(n){return zr(n)}class zs{constructor(t){this.auth=t,this.observer=null,this.addObserver=ec(r=>this.observer=r)}get next(){return M(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}function Fu(n,t){const r=(t==null?void 0:t.persistence)||[],i=(Array.isArray(r)?r:[r]).map(Jt);t!=null&&t.errorMap&&n._updateErrorMap(t.errorMap),n._initializeWithPersistence(i,t==null?void 0:t.popupRedirectResolver)}new Ye(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ye(2e3,1e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ye(3e4,6e4);/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new Ye(5e3,15e3);var Ws="@firebase/auth",Gs="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vu{constructor(t){this.auth=t,this.internalListeners=new Map}getUid(){var t;return this.assertAuthConfigured(),((t=this.auth.currentUser)===null||t===void 0?void 0:t.uid)||null}async getToken(t){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(t)}:null}addAuthTokenListener(t){if(this.assertAuthConfigured(),this.internalListeners.has(t))return;const r=this.auth.onIdTokenChanged(i=>{t((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(t,r),this.updateProactiveRefresh()}removeAuthTokenListener(t){this.assertAuthConfigured();const r=this.internalListeners.get(t);r&&(this.internalListeners.delete(t),r(),this.updateProactiveRefresh())}assertAuthConfigured(){M(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ju(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Bu(n){Ht(new Bt("auth",(t,{options:r})=>{const i=t.getProvider("app").getImmediate(),s=t.getProvider("heartbeat"),l=t.getProvider("app-check-internal"),{apiKey:h,authDomain:u}=i.options;M(h&&!h.includes(":"),"invalid-api-key",{appName:i.name});const g={apiKey:h,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ha(n)},A=new Uu(i,s,l,g);return Fu(A,r),A},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((t,r,i)=>{t.getProvider("auth-internal").initialize()})),Ht(new Bt("auth-internal",t=>{const r=Mu(t.getProvider("auth").getImmediate());return(i=>new Vu(i))(r)},"PRIVATE").setInstantiationMode("EXPLICIT")),dt(Ws,Gs,ju(n)),dt(Ws,Gs,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hu=5*60;Wh("authIdTokenMaxAge");Bu("Browser");var qs=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ui;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(v,d){function f(){}f.prototype=d.prototype,v.D=d.prototype,v.prototype=new f,v.prototype.constructor=v,v.C=function(m,_,w){for(var p=Array(arguments.length-2),Tt=2;Tt<arguments.length;Tt++)p[Tt-2]=arguments[Tt];return d.prototype[_].apply(m,p)}}function r(){this.blockSize=-1}function i(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(i,r),i.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,d,f){f||(f=0);var m=Array(16);if(typeof d=="string")for(var _=0;16>_;++_)m[_]=d.charCodeAt(f++)|d.charCodeAt(f++)<<8|d.charCodeAt(f++)<<16|d.charCodeAt(f++)<<24;else for(_=0;16>_;++_)m[_]=d[f++]|d[f++]<<8|d[f++]<<16|d[f++]<<24;d=v.g[0],f=v.g[1],_=v.g[2];var w=v.g[3],p=d+(w^f&(_^w))+m[0]+3614090360&4294967295;d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[1]+3905402710&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[2]+606105819&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[3]+3250441966&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[4]+4118548399&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[5]+1200080426&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[6]+2821735955&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[7]+4249261313&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[8]+1770035416&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[9]+2336552879&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[10]+4294925233&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[11]+2304563134&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[12]+1804603682&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[13]+4254626195&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[14]+2792965006&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[15]+1236535329&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(_^w&(f^_))+m[1]+4129170786&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[6]+3225465664&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[11]+643717713&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[0]+3921069994&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[5]+3593408605&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[10]+38016083&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[15]+3634488961&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[4]+3889429448&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[9]+568446438&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[14]+3275163606&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[3]+4107603335&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[8]+1163531501&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[13]+2850285829&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[2]+4243563512&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[7]+1735328473&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[12]+2368359562&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(f^_^w)+m[5]+4294588738&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[8]+2272392833&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[11]+1839030562&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[14]+4259657740&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[1]+2763975236&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[4]+1272893353&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[7]+4139469664&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[10]+3200236656&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[13]+681279174&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[0]+3936430074&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[3]+3572445317&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[6]+76029189&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[9]+3654602809&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[12]+3873151461&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[15]+530742520&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[2]+3299628645&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(_^(f|~w))+m[0]+4096336452&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[7]+1126891415&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[14]+2878612391&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[5]+4237533241&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[12]+1700485571&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[3]+2399980690&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[10]+4293915773&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[1]+2240044497&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[8]+1873313359&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[15]+4264355552&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[6]+2734768916&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[13]+1309151649&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[4]+4149444226&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[11]+3174756917&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[2]+718787259&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[9]+3951481745&4294967295,v.g[0]=v.g[0]+d&4294967295,v.g[1]=v.g[1]+(_+(p<<21&4294967295|p>>>11))&4294967295,v.g[2]=v.g[2]+_&4294967295,v.g[3]=v.g[3]+w&4294967295}i.prototype.u=function(v,d){d===void 0&&(d=v.length);for(var f=d-this.blockSize,m=this.B,_=this.h,w=0;w<d;){if(_==0)for(;w<=f;)s(this,v,w),w+=this.blockSize;if(typeof v=="string"){for(;w<d;)if(m[_++]=v.charCodeAt(w++),_==this.blockSize){s(this,m),_=0;break}}else for(;w<d;)if(m[_++]=v[w++],_==this.blockSize){s(this,m),_=0;break}}this.h=_,this.o+=d},i.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var d=1;d<v.length-8;++d)v[d]=0;var f=8*this.o;for(d=v.length-8;d<v.length;++d)v[d]=f&255,f/=256;for(this.u(v),v=Array(16),d=f=0;4>d;++d)for(var m=0;32>m;m+=8)v[f++]=this.g[d]>>>m&255;return v};function l(v,d){var f=u;return Object.prototype.hasOwnProperty.call(f,v)?f[v]:f[v]=d(v)}function h(v,d){this.h=d;for(var f=[],m=!0,_=v.length-1;0<=_;_--){var w=v[_]|0;m&&w==d||(f[_]=w,m=!1)}this.g=f}var u={};function g(v){return-128<=v&&128>v?l(v,function(d){return new h([d|0],0>d?-1:0)}):new h([v|0],0>v?-1:0)}function A(v){if(isNaN(v)||!isFinite(v))return S;if(0>v)return O(A(-v));for(var d=[],f=1,m=0;v>=f;m++)d[m]=v/f|0,f*=4294967296;return new h(d,0)}function T(v,d){if(v.length==0)throw Error("number format error: empty string");if(d=d||10,2>d||36<d)throw Error("radix out of range: "+d);if(v.charAt(0)=="-")return O(T(v.substring(1),d));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var f=A(Math.pow(d,8)),m=S,_=0;_<v.length;_+=8){var w=Math.min(8,v.length-_),p=parseInt(v.substring(_,_+w),d);8>w?(w=A(Math.pow(d,w)),m=m.j(w).add(A(p))):(m=m.j(f),m=m.add(A(p)))}return m}var S=g(0),C=g(1),$=g(16777216);n=h.prototype,n.m=function(){if(B(this))return-O(this).m();for(var v=0,d=1,f=0;f<this.g.length;f++){var m=this.i(f);v+=(0<=m?m:4294967296+m)*d,d*=4294967296}return v},n.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(D(this))return"0";if(B(this))return"-"+O(this).toString(v);for(var d=A(Math.pow(v,6)),f=this,m="";;){var _=P(f,d).g;f=tt(f,_.j(d));var w=((0<f.g.length?f.g[0]:f.h)>>>0).toString(v);if(f=_,D(f))return w+m;for(;6>w.length;)w="0"+w;m=w+m}},n.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function D(v){if(v.h!=0)return!1;for(var d=0;d<v.g.length;d++)if(v.g[d]!=0)return!1;return!0}function B(v){return v.h==-1}n.l=function(v){return v=tt(this,v),B(v)?-1:D(v)?0:1};function O(v){for(var d=v.g.length,f=[],m=0;m<d;m++)f[m]=~v.g[m];return new h(f,~v.h).add(C)}n.abs=function(){return B(this)?O(this):this},n.add=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0,_=0;_<=d;_++){var w=m+(this.i(_)&65535)+(v.i(_)&65535),p=(w>>>16)+(this.i(_)>>>16)+(v.i(_)>>>16);m=p>>>16,w&=65535,p&=65535,f[_]=p<<16|w}return new h(f,f[f.length-1]&-2147483648?-1:0)};function tt(v,d){return v.add(O(d))}n.j=function(v){if(D(this)||D(v))return S;if(B(this))return B(v)?O(this).j(O(v)):O(O(this).j(v));if(B(v))return O(this.j(O(v)));if(0>this.l($)&&0>v.l($))return A(this.m()*v.m());for(var d=this.g.length+v.g.length,f=[],m=0;m<2*d;m++)f[m]=0;for(m=0;m<this.g.length;m++)for(var _=0;_<v.g.length;_++){var w=this.i(m)>>>16,p=this.i(m)&65535,Tt=v.i(_)>>>16,_e=v.i(_)&65535;f[2*m+2*_]+=p*_e,J(f,2*m+2*_),f[2*m+2*_+1]+=w*_e,J(f,2*m+2*_+1),f[2*m+2*_+1]+=p*Tt,J(f,2*m+2*_+1),f[2*m+2*_+2]+=w*Tt,J(f,2*m+2*_+2)}for(m=0;m<d;m++)f[m]=f[2*m+1]<<16|f[2*m];for(m=d;m<2*d;m++)f[m]=0;return new h(f,0)};function J(v,d){for(;(v[d]&65535)!=v[d];)v[d+1]+=v[d]>>>16,v[d]&=65535,d++}function R(v,d){this.g=v,this.h=d}function P(v,d){if(D(d))throw Error("division by zero");if(D(v))return new R(S,S);if(B(v))return d=P(O(v),d),new R(O(d.g),O(d.h));if(B(d))return d=P(v,O(d)),new R(O(d.g),d.h);if(30<v.g.length){if(B(v)||B(d))throw Error("slowDivide_ only works with positive integers.");for(var f=C,m=d;0>=m.l(v);)f=N(f),m=N(m);var _=L(f,1),w=L(m,1);for(m=L(m,2),f=L(f,2);!D(m);){var p=w.add(m);0>=p.l(v)&&(_=_.add(f),w=p),m=L(m,1),f=L(f,1)}return d=tt(v,_.j(d)),new R(_,d)}for(_=S;0<=v.l(d);){for(f=Math.max(1,Math.floor(v.m()/d.m())),m=Math.ceil(Math.log(f)/Math.LN2),m=48>=m?1:Math.pow(2,m-48),w=A(f),p=w.j(d);B(p)||0<p.l(v);)f-=m,w=A(f),p=w.j(d);D(w)&&(w=C),_=_.add(w),v=tt(v,p)}return new R(_,v)}n.A=function(v){return P(this,v).h},n.and=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)&v.i(m);return new h(f,this.h&v.h)},n.or=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)|v.i(m);return new h(f,this.h|v.h)},n.xor=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)^v.i(m);return new h(f,this.h^v.h)};function N(v){for(var d=v.g.length+1,f=[],m=0;m<d;m++)f[m]=v.i(m)<<1|v.i(m-1)>>>31;return new h(f,v.h)}function L(v,d){var f=d>>5;d%=32;for(var m=v.g.length-f,_=[],w=0;w<m;w++)_[w]=0<d?v.i(w+f)>>>d|v.i(w+f+1)<<32-d:v.i(w+f);return new h(_,v.h)}i.prototype.digest=i.prototype.v,i.prototype.reset=i.prototype.s,i.prototype.update=i.prototype.u,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=A,h.fromString=T,ui=h}).apply(typeof qs<"u"?qs:typeof self<"u"?self:typeof window<"u"?window:{});var _r=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(e,o,a){return e==Array.prototype||e==Object.prototype||(e[o]=a.value),e};function r(e){e=[typeof globalThis=="object"&&globalThis,e,typeof window=="object"&&window,typeof self=="object"&&self,typeof _r=="object"&&_r];for(var o=0;o<e.length;++o){var a=e[o];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var i=r(this);function s(e,o){if(o)t:{var a=i;e=e.split(".");for(var c=0;c<e.length-1;c++){var y=e[c];if(!(y in a))break t;a=a[y]}e=e[e.length-1],c=a[e],o=o(c),o!=c&&o!=null&&t(a,e,{configurable:!0,writable:!0,value:o})}}function l(e,o){e instanceof String&&(e+="");var a=0,c=!1,y={next:function(){if(!c&&a<e.length){var b=a++;return{value:o(b,e[b]),done:!1}}return c=!0,{done:!0,value:void 0}}};return y[Symbol.iterator]=function(){return y},y}s("Array.prototype.values",function(e){return e||function(){return l(this,function(o,a){return a})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},u=this||self;function g(e){var o=typeof e;return o=o!="object"?o:e?Array.isArray(e)?"array":o:"null",o=="array"||o=="object"&&typeof e.length=="number"}function A(e){var o=typeof e;return o=="object"&&e!=null||o=="function"}function T(e,o,a){return e.call.apply(e.bind,arguments)}function S(e,o,a){if(!e)throw Error();if(2<arguments.length){var c=Array.prototype.slice.call(arguments,2);return function(){var y=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(y,c),e.apply(o,y)}}return function(){return e.apply(o,arguments)}}function C(e,o,a){return C=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?T:S,C.apply(null,arguments)}function $(e,o){var a=Array.prototype.slice.call(arguments,1);return function(){var c=a.slice();return c.push.apply(c,arguments),e.apply(this,c)}}function D(e,o){function a(){}a.prototype=o.prototype,e.aa=o.prototype,e.prototype=new a,e.prototype.constructor=e,e.Qb=function(c,y,b){for(var E=Array(arguments.length-2),H=2;H<arguments.length;H++)E[H-2]=arguments[H];return o.prototype[y].apply(c,E)}}function B(e){const o=e.length;if(0<o){const a=Array(o);for(let c=0;c<o;c++)a[c]=e[c];return a}return[]}function O(e,o){for(let a=1;a<arguments.length;a++){const c=arguments[a];if(g(c)){const y=e.length||0,b=c.length||0;e.length=y+b;for(let E=0;E<b;E++)e[y+E]=c[E]}else e.push(c)}}class tt{constructor(o,a){this.i=o,this.j=a,this.h=0,this.g=null}get(){let o;return 0<this.h?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function J(e){return/^[\s\xa0]*$/.test(e)}function R(){var e=u.navigator;return e&&(e=e.userAgent)?e:""}function P(e){return P[" "](e),e}P[" "]=function(){};var N=R().indexOf("Gecko")!=-1&&!(R().toLowerCase().indexOf("webkit")!=-1&&R().indexOf("Edge")==-1)&&!(R().indexOf("Trident")!=-1||R().indexOf("MSIE")!=-1)&&R().indexOf("Edge")==-1;function L(e,o,a){for(const c in e)o.call(a,e[c],c,e)}function v(e,o){for(const a in e)o.call(void 0,e[a],a,e)}function d(e){const o={};for(const a in e)o[a]=e[a];return o}const f="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function m(e,o){let a,c;for(let y=1;y<arguments.length;y++){c=arguments[y];for(a in c)e[a]=c[a];for(let b=0;b<f.length;b++)a=f[b],Object.prototype.hasOwnProperty.call(c,a)&&(e[a]=c[a])}}function _(e){var o=1;e=e.split(":");const a=[];for(;0<o&&e.length;)a.push(e.shift()),o--;return e.length&&a.push(e.join(":")),a}function w(e){u.setTimeout(()=>{throw e},0)}function p(){var e=Kr;let o=null;return e.g&&(o=e.g,e.g=e.g.next,e.g||(e.h=null),o.next=null),o}class Tt{constructor(){this.h=this.g=null}add(o,a){const c=_e.get();c.set(o,a),this.h?this.h.next=c:this.g=c,this.h=c}}var _e=new tt(()=>new Sa,e=>e.reset());class Sa{constructor(){this.next=this.g=this.h=null}set(o,a){this.h=o,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let ye,we=!1,Kr=new Tt,_i=()=>{const e=u.Promise.resolve(void 0);ye=()=>{e.then(Ta)}};var Ta=()=>{for(var e;e=p();){try{e.h.call(e.g)}catch(a){w(a)}var o=_e;o.j(e),100>o.h&&(o.h++,e.next=o.g,o.g=e)}we=!1};function xt(){this.s=this.s,this.C=this.C}xt.prototype.s=!1,xt.prototype.ma=function(){this.s||(this.s=!0,this.N())},xt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function et(e,o){this.type=e,this.g=this.target=o,this.defaultPrevented=!1}et.prototype.h=function(){this.defaultPrevented=!0};var Ia=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var e=!1,o=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const a=()=>{};u.addEventListener("test",a,o),u.removeEventListener("test",a,o)}catch{}return e}();function be(e,o){if(et.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e){var a=this.type=e.type,c=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;if(this.target=e.target||e.srcElement,this.g=o,o=e.relatedTarget){if(N){t:{try{P(o.nodeName);var y=!0;break t}catch{}y=!1}y||(o=null)}}else a=="mouseover"?o=e.fromElement:a=="mouseout"&&(o=e.toElement);this.relatedTarget=o,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=e.clientX!==void 0?e.clientX:e.pageX,this.clientY=e.clientY!==void 0?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=typeof e.pointerType=="string"?e.pointerType:Ca[e.pointerType]||"",this.state=e.state,this.i=e,e.defaultPrevented&&be.aa.h.call(this)}}D(be,et);var Ca={2:"touch",3:"pen",4:"mouse"};be.prototype.h=function(){be.aa.h.call(this);var e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var tr="closure_listenable_"+(1e6*Math.random()|0),Pa=0;function Na(e,o,a,c,y){this.listener=e,this.proxy=null,this.src=o,this.type=a,this.capture=!!c,this.ha=y,this.key=++Pa,this.da=this.fa=!1}function er(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function rr(e){this.src=e,this.g={},this.h=0}rr.prototype.add=function(e,o,a,c,y){var b=e.toString();e=this.g[b],e||(e=this.g[b]=[],this.h++);var E=Jr(e,o,c,y);return-1<E?(o=e[E],a||(o.fa=!1)):(o=new Na(o,this.src,b,!!c,y),o.fa=a,e.push(o)),o};function Xr(e,o){var a=o.type;if(a in e.g){var c=e.g[a],y=Array.prototype.indexOf.call(c,o,void 0),b;(b=0<=y)&&Array.prototype.splice.call(c,y,1),b&&(er(o),e.g[a].length==0&&(delete e.g[a],e.h--))}}function Jr(e,o,a,c){for(var y=0;y<e.length;++y){var b=e[y];if(!b.da&&b.listener==o&&b.capture==!!a&&b.ha==c)return y}return-1}var Yr="closure_lm_"+(1e6*Math.random()|0),Zr={};function yi(e,o,a,c,y){if(Array.isArray(o)){for(var b=0;b<o.length;b++)yi(e,o[b],a,c,y);return null}return a=Ai(a),e&&e[tr]?e.K(o,a,A(c)?!!c.capture:!1,y):Ra(e,o,a,!1,c,y)}function Ra(e,o,a,c,y,b){if(!o)throw Error("Invalid event type");var E=A(y)?!!y.capture:!!y,H=tn(e);if(H||(e[Yr]=H=new rr(e)),a=H.add(o,a,c,E,b),a.proxy)return a;if(c=ka(),a.proxy=c,c.src=e,c.listener=a,e.addEventListener)Ia||(y=E),y===void 0&&(y=!1),e.addEventListener(o.toString(),c,y);else if(e.attachEvent)e.attachEvent(bi(o.toString()),c);else if(e.addListener&&e.removeListener)e.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return a}function ka(){function e(a){return o.call(e.src,e.listener,a)}const o=Da;return e}function wi(e,o,a,c,y){if(Array.isArray(o))for(var b=0;b<o.length;b++)wi(e,o[b],a,c,y);else c=A(c)?!!c.capture:!!c,a=Ai(a),e&&e[tr]?(e=e.i,o=String(o).toString(),o in e.g&&(b=e.g[o],a=Jr(b,a,c,y),-1<a&&(er(b[a]),Array.prototype.splice.call(b,a,1),b.length==0&&(delete e.g[o],e.h--)))):e&&(e=tn(e))&&(o=e.g[o.toString()],e=-1,o&&(e=Jr(o,a,c,y)),(a=-1<e?o[e]:null)&&Qr(a))}function Qr(e){if(typeof e!="number"&&e&&!e.da){var o=e.src;if(o&&o[tr])Xr(o.i,e);else{var a=e.type,c=e.proxy;o.removeEventListener?o.removeEventListener(a,c,e.capture):o.detachEvent?o.detachEvent(bi(a),c):o.addListener&&o.removeListener&&o.removeListener(c),(a=tn(o))?(Xr(a,e),a.h==0&&(a.src=null,o[Yr]=null)):er(e)}}}function bi(e){return e in Zr?Zr[e]:Zr[e]="on"+e}function Da(e,o){if(e.da)e=!0;else{o=new be(o,this);var a=e.listener,c=e.ha||e.src;e.fa&&Qr(e),e=a.call(c,o)}return e}function tn(e){return e=e[Yr],e instanceof rr?e:null}var en="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ai(e){return typeof e=="function"?e:(e[en]||(e[en]=function(o){return e.handleEvent(o)}),e[en])}function rt(){xt.call(this),this.i=new rr(this),this.M=this,this.F=null}D(rt,xt),rt.prototype[tr]=!0,rt.prototype.removeEventListener=function(e,o,a,c){wi(this,e,o,a,c)};function st(e,o){var a,c=e.F;if(c)for(a=[];c;c=c.F)a.push(c);if(e=e.M,c=o.type||o,typeof o=="string")o=new et(o,e);else if(o instanceof et)o.target=o.target||e;else{var y=o;o=new et(c,e),m(o,y)}if(y=!0,a)for(var b=a.length-1;0<=b;b--){var E=o.g=a[b];y=nr(E,c,!0,o)&&y}if(E=o.g=e,y=nr(E,c,!0,o)&&y,y=nr(E,c,!1,o)&&y,a)for(b=0;b<a.length;b++)E=o.g=a[b],y=nr(E,c,!1,o)&&y}rt.prototype.N=function(){if(rt.aa.N.call(this),this.i){var e=this.i,o;for(o in e.g){for(var a=e.g[o],c=0;c<a.length;c++)er(a[c]);delete e.g[o],e.h--}}this.F=null},rt.prototype.K=function(e,o,a,c){return this.i.add(String(e),o,!1,a,c)},rt.prototype.L=function(e,o,a,c){return this.i.add(String(e),o,!0,a,c)};function nr(e,o,a,c){if(o=e.i.g[String(o)],!o)return!0;o=o.concat();for(var y=!0,b=0;b<o.length;++b){var E=o[b];if(E&&!E.da&&E.capture==a){var H=E.listener,Y=E.ha||E.src;E.fa&&Xr(e.i,E),y=H.call(Y,c)!==!1&&y}}return y&&!c.defaultPrevented}function Ei(e,o,a){if(typeof e=="function")a&&(e=C(e,a));else if(e&&typeof e.handleEvent=="function")e=C(e.handleEvent,e);else throw Error("Invalid listener argument");return 2147483647<Number(o)?-1:u.setTimeout(e,o||0)}function Si(e){e.g=Ei(()=>{e.g=null,e.i&&(e.i=!1,Si(e))},e.l);const o=e.h;e.h=null,e.m.apply(null,o)}class Oa extends xt{constructor(o,a){super(),this.m=o,this.l=a,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:Si(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ae(e){xt.call(this),this.h=e,this.g={}}D(Ae,xt);var Ti=[];function Ii(e){L(e.g,function(o,a){this.g.hasOwnProperty(a)&&Qr(o)},e),e.g={}}Ae.prototype.N=function(){Ae.aa.N.call(this),Ii(this)},Ae.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rn=u.JSON.stringify,xa=u.JSON.parse,$a=class{stringify(e){return u.JSON.stringify(e,void 0)}parse(e){return u.JSON.parse(e,void 0)}};function nn(){}nn.prototype.h=null;function Ci(e){return e.h||(e.h=e.i())}function La(){}var Ee={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function sn(){et.call(this,"d")}D(sn,et);function on(){et.call(this,"c")}D(on,et);var se={},Pi=null;function an(){return Pi=Pi||new rt}se.La="serverreachability";function Ni(e){et.call(this,se.La,e)}D(Ni,et);function Se(e){const o=an();st(o,new Ni(o))}se.STAT_EVENT="statevent";function Ri(e,o){et.call(this,se.STAT_EVENT,e),this.stat=o}D(Ri,et);function ot(e){const o=an();st(o,new Ri(o,e))}se.Ma="timingevent";function ki(e,o){et.call(this,se.Ma,e),this.size=o}D(ki,et);function Te(e,o){if(typeof e!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){e()},o)}function Ie(){this.g=!0}Ie.prototype.xa=function(){this.g=!1};function Ua(e,o,a,c,y,b){e.info(function(){if(e.g)if(b)for(var E="",H=b.split("&"),Y=0;Y<H.length;Y++){var U=H[Y].split("=");if(1<U.length){var nt=U[0];U=U[1];var it=nt.split("_");E=2<=it.length&&it[1]=="type"?E+(nt+"="+U+"&"):E+(nt+"=redacted&")}}else E=null;else E=b;return"XMLHTTP REQ ("+c+") [attempt "+y+"]: "+o+`
`+a+`
`+E})}function Ma(e,o,a,c,y,b,E){e.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+y+"]: "+o+`
`+a+`
`+b+" "+E})}function oe(e,o,a,c){e.info(function(){return"XMLHTTP TEXT ("+o+"): "+Va(e,a)+(c?" "+c:"")})}function Fa(e,o){e.info(function(){return"TIMEOUT: "+o})}Ie.prototype.info=function(){};function Va(e,o){if(!e.g)return o;if(!o)return null;try{var a=JSON.parse(o);if(a){for(e=0;e<a.length;e++)if(Array.isArray(a[e])){var c=a[e];if(!(2>c.length)){var y=c[1];if(Array.isArray(y)&&!(1>y.length)){var b=y[0];if(b!="noop"&&b!="stop"&&b!="close")for(var E=1;E<y.length;E++)y[E]=""}}}}return rn(a)}catch{return o}}var ln={NO_ERROR:0,TIMEOUT:8},ja={},hn;function ir(){}D(ir,nn),ir.prototype.g=function(){return new XMLHttpRequest},ir.prototype.i=function(){return{}},hn=new ir;function $t(e,o,a,c){this.j=e,this.i=o,this.l=a,this.R=c||1,this.U=new Ae(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Di}function Di(){this.i=null,this.g="",this.h=!1}var Oi={},cn={};function un(e,o,a){e.L=1,e.v=lr(It(o)),e.m=a,e.P=!0,xi(e,null)}function xi(e,o){e.F=Date.now(),sr(e),e.A=It(e.v);var a=e.A,c=e.R;Array.isArray(c)||(c=[String(c)]),Ki(a.i,"t",c),e.C=0,a=e.j.J,e.h=new Di,e.g=ds(e.j,a?o:null,!e.m),0<e.O&&(e.M=new Oa(C(e.Y,e,e.g),e.O)),o=e.U,a=e.g,c=e.ca;var y="readystatechange";Array.isArray(y)||(y&&(Ti[0]=y.toString()),y=Ti);for(var b=0;b<y.length;b++){var E=yi(a,y[b],c||o.handleEvent,!1,o.h||o);if(!E)break;o.g[E.key]=E}o=e.H?d(e.H):{},e.m?(e.u||(e.u="POST"),o["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.A,e.u,e.m,o)):(e.u="GET",e.g.ea(e.A,e.u,null,o)),Se(),Ua(e.i,e.u,e.A,e.l,e.R,e.m)}$t.prototype.ca=function(e){e=e.target;const o=this.M;o&&Ct(e)==3?o.j():this.Y(e)},$t.prototype.Y=function(e){try{if(e==this.g)t:{const it=Ct(this.g);var o=this.g.Ba();const he=this.g.Z();if(!(3>it)&&(it!=3||this.g&&(this.h.h||this.g.oa()||es(this.g)))){this.J||it!=4||o==7||(o==8||0>=he?Se(3):Se(2)),dn(this);var a=this.g.Z();this.X=a;e:if($i(this)){var c=es(this.g);e="";var y=c.length,b=Ct(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){zt(this),Ce(this);var E="";break e}this.h.i=new u.TextDecoder}for(o=0;o<y;o++)this.h.h=!0,e+=this.h.i.decode(c[o],{stream:!(b&&o==y-1)});c.length=0,this.h.g+=e,this.C=0,E=this.h.g}else E=this.g.oa();if(this.o=a==200,Ma(this.i,this.u,this.A,this.l,this.R,it,a),this.o){if(this.T&&!this.K){e:{if(this.g){var H,Y=this.g;if((H=Y.g?Y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!J(H)){var U=H;break e}}U=null}if(a=U)oe(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,fn(this,a);else{this.o=!1,this.s=3,ot(12),zt(this),Ce(this);break t}}if(this.P){a=!0;let pt;for(;!this.J&&this.C<E.length;)if(pt=Ba(this,E),pt==cn){it==4&&(this.s=4,ot(14),a=!1),oe(this.i,this.l,null,"[Incomplete Response]");break}else if(pt==Oi){this.s=4,ot(15),oe(this.i,this.l,E,"[Invalid Chunk]"),a=!1;break}else oe(this.i,this.l,pt,null),fn(this,pt);if($i(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),it!=4||E.length!=0||this.h.h||(this.s=1,ot(16),a=!1),this.o=this.o&&a,!a)oe(this.i,this.l,E,"[Invalid Chunked Response]"),zt(this),Ce(this);else if(0<E.length&&!this.W){this.W=!0;var nt=this.j;nt.g==this&&nt.ba&&!nt.M&&(nt.j.info("Great, no buffering proxy detected. Bytes received: "+E.length),yn(nt),nt.M=!0,ot(11))}}else oe(this.i,this.l,E,null),fn(this,E);it==4&&zt(this),this.o&&!this.J&&(it==4?ls(this.j,this):(this.o=!1,sr(this)))}else sl(this.g),a==400&&0<E.indexOf("Unknown SID")?(this.s=3,ot(12)):(this.s=0,ot(13)),zt(this),Ce(this)}}}catch{}finally{}};function $i(e){return e.g?e.u=="GET"&&e.L!=2&&e.j.Ca:!1}function Ba(e,o){var a=e.C,c=o.indexOf(`
`,a);return c==-1?cn:(a=Number(o.substring(a,c)),isNaN(a)?Oi:(c+=1,c+a>o.length?cn:(o=o.slice(c,c+a),e.C=c+a,o)))}$t.prototype.cancel=function(){this.J=!0,zt(this)};function sr(e){e.S=Date.now()+e.I,Li(e,e.I)}function Li(e,o){if(e.B!=null)throw Error("WatchDog timer not null");e.B=Te(C(e.ba,e),o)}function dn(e){e.B&&(u.clearTimeout(e.B),e.B=null)}$t.prototype.ba=function(){this.B=null;const e=Date.now();0<=e-this.S?(Fa(this.i,this.A),this.L!=2&&(Se(),ot(17)),zt(this),this.s=2,Ce(this)):Li(this,this.S-e)};function Ce(e){e.j.G==0||e.J||ls(e.j,e)}function zt(e){dn(e);var o=e.M;o&&typeof o.ma=="function"&&o.ma(),e.M=null,Ii(e.U),e.g&&(o=e.g,e.g=null,o.abort(),o.ma())}function fn(e,o){try{var a=e.j;if(a.G!=0&&(a.g==e||pn(a.h,e))){if(!e.K&&pn(a.h,e)&&a.G==3){try{var c=a.Da.g.parse(o)}catch{c=null}if(Array.isArray(c)&&c.length==3){var y=c;if(y[0]==0){t:if(!a.u){if(a.g)if(a.g.F+3e3<e.F)pr(a),dr(a);else break t;_n(a),ot(18)}}else a.za=y[1],0<a.za-a.T&&37500>y[2]&&a.F&&a.v==0&&!a.C&&(a.C=Te(C(a.Za,a),6e3));if(1>=Fi(a.h)&&a.ca){try{a.ca()}catch{}a.ca=void 0}}else Gt(a,11)}else if((e.K||a.g==e)&&pr(a),!J(o))for(y=a.Da.g.parse(o),o=0;o<y.length;o++){let U=y[o];if(a.T=U[0],U=U[1],a.G==2)if(U[0]=="c"){a.K=U[1],a.ia=U[2];const nt=U[3];nt!=null&&(a.la=nt,a.j.info("VER="+a.la));const it=U[4];it!=null&&(a.Aa=it,a.j.info("SVER="+a.Aa));const he=U[5];he!=null&&typeof he=="number"&&0<he&&(c=1.5*he,a.L=c,a.j.info("backChannelRequestTimeoutMs_="+c)),c=a;const pt=e.g;if(pt){const gr=pt.g?pt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(gr){var b=c.h;b.g||gr.indexOf("spdy")==-1&&gr.indexOf("quic")==-1&&gr.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(gn(b,b.h),b.h=null))}if(c.D){const wn=pt.g?pt.g.getResponseHeader("X-HTTP-Session-Id"):null;wn&&(c.ya=wn,W(c.I,c.D,wn))}}a.G=3,a.l&&a.l.ua(),a.ba&&(a.R=Date.now()-e.F,a.j.info("Handshake RTT: "+a.R+"ms")),c=a;var E=e;if(c.qa=us(c,c.J?c.ia:null,c.W),E.K){Vi(c.h,E);var H=E,Y=c.L;Y&&(H.I=Y),H.B&&(dn(H),sr(H)),c.g=E}else os(c);0<a.i.length&&fr(a)}else U[0]!="stop"&&U[0]!="close"||Gt(a,7);else a.G==3&&(U[0]=="stop"||U[0]=="close"?U[0]=="stop"?Gt(a,7):vn(a):U[0]!="noop"&&a.l&&a.l.ta(U),a.v=0)}}Se(4)}catch{}}var Ha=class{constructor(e,o){this.g=e,this.map=o}};function Ui(e){this.l=e||10,u.PerformanceNavigationTiming?(e=u.performance.getEntriesByType("navigation"),e=0<e.length&&(e[0].nextHopProtocol=="hq"||e[0].nextHopProtocol=="h2")):e=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Mi(e){return e.h?!0:e.g?e.g.size>=e.j:!1}function Fi(e){return e.h?1:e.g?e.g.size:0}function pn(e,o){return e.h?e.h==o:e.g?e.g.has(o):!1}function gn(e,o){e.g?e.g.add(o):e.h=o}function Vi(e,o){e.h&&e.h==o?e.h=null:e.g&&e.g.has(o)&&e.g.delete(o)}Ui.prototype.cancel=function(){if(this.i=ji(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const e of this.g.values())e.cancel();this.g.clear()}};function ji(e){if(e.h!=null)return e.i.concat(e.h.D);if(e.g!=null&&e.g.size!==0){let o=e.i;for(const a of e.g.values())o=o.concat(a.D);return o}return B(e.i)}function za(e){if(e.V&&typeof e.V=="function")return e.V();if(typeof Map<"u"&&e instanceof Map||typeof Set<"u"&&e instanceof Set)return Array.from(e.values());if(typeof e=="string")return e.split("");if(g(e)){for(var o=[],a=e.length,c=0;c<a;c++)o.push(e[c]);return o}o=[],a=0;for(c in e)o[a++]=e[c];return o}function Wa(e){if(e.na&&typeof e.na=="function")return e.na();if(!e.V||typeof e.V!="function"){if(typeof Map<"u"&&e instanceof Map)return Array.from(e.keys());if(!(typeof Set<"u"&&e instanceof Set)){if(g(e)||typeof e=="string"){var o=[];e=e.length;for(var a=0;a<e;a++)o.push(a);return o}o=[],a=0;for(const c in e)o[a++]=c;return o}}}function Bi(e,o){if(e.forEach&&typeof e.forEach=="function")e.forEach(o,void 0);else if(g(e)||typeof e=="string")Array.prototype.forEach.call(e,o,void 0);else for(var a=Wa(e),c=za(e),y=c.length,b=0;b<y;b++)o.call(void 0,c[b],a&&a[b],e)}var Hi=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Ga(e,o){if(e){e=e.split("&");for(var a=0;a<e.length;a++){var c=e[a].indexOf("="),y=null;if(0<=c){var b=e[a].substring(0,c);y=e[a].substring(c+1)}else b=e[a];o(b,y?decodeURIComponent(y.replace(/\+/g," ")):"")}}}function Wt(e){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,e instanceof Wt){this.h=e.h,or(this,e.j),this.o=e.o,this.g=e.g,ar(this,e.s),this.l=e.l;var o=e.i,a=new Re;a.i=o.i,o.g&&(a.g=new Map(o.g),a.h=o.h),zi(this,a),this.m=e.m}else e&&(o=String(e).match(Hi))?(this.h=!1,or(this,o[1]||"",!0),this.o=Pe(o[2]||""),this.g=Pe(o[3]||"",!0),ar(this,o[4]),this.l=Pe(o[5]||"",!0),zi(this,o[6]||"",!0),this.m=Pe(o[7]||"")):(this.h=!1,this.i=new Re(null,this.h))}Wt.prototype.toString=function(){var e=[],o=this.j;o&&e.push(Ne(o,Wi,!0),":");var a=this.g;return(a||o=="file")&&(e.push("//"),(o=this.o)&&e.push(Ne(o,Wi,!0),"@"),e.push(encodeURIComponent(String(a)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.s,a!=null&&e.push(":",String(a))),(a=this.l)&&(this.g&&a.charAt(0)!="/"&&e.push("/"),e.push(Ne(a,a.charAt(0)=="/"?Xa:Ka,!0))),(a=this.i.toString())&&e.push("?",a),(a=this.m)&&e.push("#",Ne(a,Ya)),e.join("")};function It(e){return new Wt(e)}function or(e,o,a){e.j=a?Pe(o,!0):o,e.j&&(e.j=e.j.replace(/:$/,""))}function ar(e,o){if(o){if(o=Number(o),isNaN(o)||0>o)throw Error("Bad port number "+o);e.s=o}else e.s=null}function zi(e,o,a){o instanceof Re?(e.i=o,Za(e.i,e.h)):(a||(o=Ne(o,Ja)),e.i=new Re(o,e.h))}function W(e,o,a){e.i.set(o,a)}function lr(e){return W(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function Pe(e,o){return e?o?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function Ne(e,o,a){return typeof e=="string"?(e=encodeURI(e).replace(o,qa),a&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function qa(e){return e=e.charCodeAt(0),"%"+(e>>4&15).toString(16)+(e&15).toString(16)}var Wi=/[#\/\?@]/g,Ka=/[#\?:]/g,Xa=/[#\?]/g,Ja=/[#\?@]/g,Ya=/#/g;function Re(e,o){this.h=this.g=null,this.i=e||null,this.j=!!o}function Lt(e){e.g||(e.g=new Map,e.h=0,e.i&&Ga(e.i,function(o,a){e.add(decodeURIComponent(o.replace(/\+/g," ")),a)}))}n=Re.prototype,n.add=function(e,o){Lt(this),this.i=null,e=ae(this,e);var a=this.g.get(e);return a||this.g.set(e,a=[]),a.push(o),this.h+=1,this};function Gi(e,o){Lt(e),o=ae(e,o),e.g.has(o)&&(e.i=null,e.h-=e.g.get(o).length,e.g.delete(o))}function qi(e,o){return Lt(e),o=ae(e,o),e.g.has(o)}n.forEach=function(e,o){Lt(this),this.g.forEach(function(a,c){a.forEach(function(y){e.call(o,y,c,this)},this)},this)},n.na=function(){Lt(this);const e=Array.from(this.g.values()),o=Array.from(this.g.keys()),a=[];for(let c=0;c<o.length;c++){const y=e[c];for(let b=0;b<y.length;b++)a.push(o[c])}return a},n.V=function(e){Lt(this);let o=[];if(typeof e=="string")qi(this,e)&&(o=o.concat(this.g.get(ae(this,e))));else{e=Array.from(this.g.values());for(let a=0;a<e.length;a++)o=o.concat(e[a])}return o},n.set=function(e,o){return Lt(this),this.i=null,e=ae(this,e),qi(this,e)&&(this.h-=this.g.get(e).length),this.g.set(e,[o]),this.h+=1,this},n.get=function(e,o){return e?(e=this.V(e),0<e.length?String(e[0]):o):o};function Ki(e,o,a){Gi(e,o),0<a.length&&(e.i=null,e.g.set(ae(e,o),B(a)),e.h+=a.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],o=Array.from(this.g.keys());for(var a=0;a<o.length;a++){var c=o[a];const b=encodeURIComponent(String(c)),E=this.V(c);for(c=0;c<E.length;c++){var y=b;E[c]!==""&&(y+="="+encodeURIComponent(String(E[c]))),e.push(y)}}return this.i=e.join("&")};function ae(e,o){return o=String(o),e.j&&(o=o.toLowerCase()),o}function Za(e,o){o&&!e.j&&(Lt(e),e.i=null,e.g.forEach(function(a,c){var y=c.toLowerCase();c!=y&&(Gi(this,c),Ki(this,y,a))},e)),e.j=o}function Qa(e,o){const a=new Ie;if(u.Image){const c=new Image;c.onload=$(Ut,a,"TestLoadImage: loaded",!0,o,c),c.onerror=$(Ut,a,"TestLoadImage: error",!1,o,c),c.onabort=$(Ut,a,"TestLoadImage: abort",!1,o,c),c.ontimeout=$(Ut,a,"TestLoadImage: timeout",!1,o,c),u.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=e}else o(!1)}function tl(e,o){const a=new Ie,c=new AbortController,y=setTimeout(()=>{c.abort(),Ut(a,"TestPingServer: timeout",!1,o)},1e4);fetch(e,{signal:c.signal}).then(b=>{clearTimeout(y),b.ok?Ut(a,"TestPingServer: ok",!0,o):Ut(a,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(y),Ut(a,"TestPingServer: error",!1,o)})}function Ut(e,o,a,c,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),c(a)}catch{}}function el(){this.g=new $a}function rl(e,o,a){const c=a||"";try{Bi(e,function(y,b){let E=y;A(y)&&(E=rn(y)),o.push(c+b+"="+encodeURIComponent(E))})}catch(y){throw o.push(c+"type="+encodeURIComponent("_badmap")),y}}function hr(e){this.l=e.Ub||null,this.j=e.eb||!1}D(hr,nn),hr.prototype.g=function(){return new cr(this.l,this.j)},hr.prototype.i=function(e){return function(){return e}}({});function cr(e,o){rt.call(this),this.D=e,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}D(cr,rt),n=cr.prototype,n.open=function(e,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=e,this.A=o,this.readyState=1,De(this)},n.send=function(e){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const o={headers:this.u,method:this.B,credentials:this.m,cache:void 0};e&&(o.body=e),(this.D||u).fetch(new Request(this.A,o)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ke(this)),this.readyState=0},n.Sa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,De(this)),this.g&&(this.readyState=3,De(this),this.g)))if(this.responseType==="arraybuffer")e.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Xi(this)}else e.text().then(this.Ra.bind(this),this.ga.bind(this))};function Xi(e){e.j.read().then(e.Pa.bind(e)).catch(e.ga.bind(e))}n.Pa=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var o=e.value?e.value:new Uint8Array(0);(o=this.v.decode(o,{stream:!e.done}))&&(this.response=this.responseText+=o)}e.done?ke(this):De(this),this.readyState==3&&Xi(this)}},n.Ra=function(e){this.g&&(this.response=this.responseText=e,ke(this))},n.Qa=function(e){this.g&&(this.response=e,ke(this))},n.ga=function(){this.g&&ke(this)};function ke(e){e.readyState=4,e.l=null,e.j=null,e.v=null,De(e)}n.setRequestHeader=function(e,o){this.u.append(e,o)},n.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],o=this.h.entries();for(var a=o.next();!a.done;)a=a.value,e.push(a[0]+": "+a[1]),a=o.next();return e.join(`\r
`)};function De(e){e.onreadystatechange&&e.onreadystatechange.call(e)}Object.defineProperty(cr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(e){this.m=e?"include":"same-origin"}});function Ji(e){let o="";return L(e,function(a,c){o+=c,o+=":",o+=a,o+=`\r
`}),o}function mn(e,o,a){t:{for(c in a){var c=!1;break t}c=!0}c||(a=Ji(a),typeof e=="string"?a!=null&&encodeURIComponent(String(a)):W(e,o,a))}function G(e){rt.call(this),this.headers=new Map,this.o=e||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}D(G,rt);var nl=/^https?$/i,il=["POST","PUT"];n=G.prototype,n.Ha=function(e){this.J=e},n.ea=function(e,o,a,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);o=o?o.toUpperCase():"GET",this.D=e,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():hn.g(),this.v=this.o?Ci(this.o):Ci(hn),this.g.onreadystatechange=C(this.Ea,this);try{this.B=!0,this.g.open(o,String(e),!0),this.B=!1}catch(b){Yi(this,b);return}if(e=a||"",a=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var y in c)a.set(y,c[y]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const b of c.keys())a.set(b,c.get(b));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(a.keys()).find(b=>b.toLowerCase()=="content-type"),y=u.FormData&&e instanceof u.FormData,!(0<=Array.prototype.indexOf.call(il,o,void 0))||c||y||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,E]of a)this.g.setRequestHeader(b,E);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ts(this),this.u=!0,this.g.send(e),this.u=!1}catch(b){Yi(this,b)}};function Yi(e,o){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=o,e.m=5,Zi(e),ur(e)}function Zi(e){e.A||(e.A=!0,st(e,"complete"),st(e,"error"))}n.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=e||7,st(this,"complete"),st(this,"abort"),ur(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ur(this,!0)),G.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Qi(this):this.bb())},n.bb=function(){Qi(this)};function Qi(e){if(e.h&&typeof h<"u"&&(!e.v[1]||Ct(e)!=4||e.Z()!=2)){if(e.u&&Ct(e)==4)Ei(e.Ea,0,e);else if(st(e,"readystatechange"),Ct(e)==4){e.h=!1;try{const E=e.Z();t:switch(E){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break t;default:o=!1}var a;if(!(a=o)){var c;if(c=E===0){var y=String(e.D).match(Hi)[1]||null;!y&&u.self&&u.self.location&&(y=u.self.location.protocol.slice(0,-1)),c=!nl.test(y?y.toLowerCase():"")}a=c}if(a)st(e,"complete"),st(e,"success");else{e.m=6;try{var b=2<Ct(e)?e.g.statusText:""}catch{b=""}e.l=b+" ["+e.Z()+"]",Zi(e)}}finally{ur(e)}}}}function ur(e,o){if(e.g){ts(e);const a=e.g,c=e.v[0]?()=>{}:null;e.g=null,e.v=null,o||st(e,"ready");try{a.onreadystatechange=c}catch{}}}function ts(e){e.I&&(u.clearTimeout(e.I),e.I=null)}n.isActive=function(){return!!this.g};function Ct(e){return e.g?e.g.readyState:0}n.Z=function(){try{return 2<Ct(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(e){if(this.g){var o=this.g.responseText;return e&&o.indexOf(e)==0&&(o=o.substring(e.length)),xa(o)}};function es(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.H){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch{return null}}function sl(e){const o={};e=(e.g&&2<=Ct(e)&&e.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<e.length;c++){if(J(e[c]))continue;var a=_(e[c]);const y=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const b=o[y]||[];o[y]=b,b.push(a)}v(o,function(c){return c.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Oe(e,o,a){return a&&a.internalChannelParams&&a.internalChannelParams[e]||o}function rs(e){this.Aa=0,this.i=[],this.j=new Ie,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Oe("failFast",!1,e),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Oe("baseRetryDelayMs",5e3,e),this.cb=Oe("retryDelaySeedMs",1e4,e),this.Wa=Oe("forwardChannelMaxRetries",2,e),this.wa=Oe("forwardChannelRequestTimeoutMs",2e4,e),this.pa=e&&e.xmlHttpFactory||void 0,this.Xa=e&&e.Tb||void 0,this.Ca=e&&e.useFetchStreams||!1,this.L=void 0,this.J=e&&e.supportsCrossDomainXhr||!1,this.K="",this.h=new Ui(e&&e.concurrentRequestLimit),this.Da=new el,this.P=e&&e.fastHandshake||!1,this.O=e&&e.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=e&&e.Rb||!1,e&&e.xa&&this.j.xa(),e&&e.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&e&&e.detectBufferingProxy||!1,this.ja=void 0,e&&e.longPollingTimeout&&0<e.longPollingTimeout&&(this.ja=e.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=rs.prototype,n.la=8,n.G=1,n.connect=function(e,o,a,c){ot(0),this.W=e,this.H=o||{},a&&c!==void 0&&(this.H.OSID=a,this.H.OAID=c),this.F=this.X,this.I=us(this,null,this.W),fr(this)};function vn(e){if(ns(e),e.G==3){var o=e.U++,a=It(e.I);if(W(a,"SID",e.K),W(a,"RID",o),W(a,"TYPE","terminate"),xe(e,a),o=new $t(e,e.j,o),o.L=2,o.v=lr(It(a)),a=!1,u.navigator&&u.navigator.sendBeacon)try{a=u.navigator.sendBeacon(o.v.toString(),"")}catch{}!a&&u.Image&&(new Image().src=o.v,a=!0),a||(o.g=ds(o.j,null),o.g.ea(o.v)),o.F=Date.now(),sr(o)}cs(e)}function dr(e){e.g&&(yn(e),e.g.cancel(),e.g=null)}function ns(e){dr(e),e.u&&(u.clearTimeout(e.u),e.u=null),pr(e),e.h.cancel(),e.s&&(typeof e.s=="number"&&u.clearTimeout(e.s),e.s=null)}function fr(e){if(!Mi(e.h)&&!e.s){e.s=!0;var o=e.Ga;ye||_i(),we||(ye(),we=!0),Kr.add(o,e),e.B=0}}function ol(e,o){return Fi(e.h)>=e.h.j-(e.s?1:0)?!1:e.s?(e.i=o.D.concat(e.i),!0):e.G==1||e.G==2||e.B>=(e.Va?0:e.Wa)?!1:(e.s=Te(C(e.Ga,e,o),hs(e,e.B)),e.B++,!0)}n.Ga=function(e){if(this.s)if(this.s=null,this.G==1){if(!e){this.U=Math.floor(1e5*Math.random()),e=this.U++;const y=new $t(this,this.j,e);let b=this.o;if(this.S&&(b?(b=d(b),m(b,this.S)):b=this.S),this.m!==null||this.O||(y.H=b,b=null),this.P)t:{for(var o=0,a=0;a<this.i.length;a++){e:{var c=this.i[a];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break e}c=void 0}if(c===void 0)break;if(o+=c,4096<o){o=a;break t}if(o===4096||a===this.i.length-1){o=a+1;break t}}o=1e3}else o=1e3;o=ss(this,y,o),a=It(this.I),W(a,"RID",e),W(a,"CVER",22),this.D&&W(a,"X-HTTP-Session-Id",this.D),xe(this,a),b&&(this.O?o="headers="+encodeURIComponent(String(Ji(b)))+"&"+o:this.m&&mn(a,this.m,b)),gn(this.h,y),this.Ua&&W(a,"TYPE","init"),this.P?(W(a,"$req",o),W(a,"SID","null"),y.T=!0,un(y,a,null)):un(y,a,o),this.G=2}}else this.G==3&&(e?is(this,e):this.i.length==0||Mi(this.h)||is(this))};function is(e,o){var a;o?a=o.l:a=e.U++;const c=It(e.I);W(c,"SID",e.K),W(c,"RID",a),W(c,"AID",e.T),xe(e,c),e.m&&e.o&&mn(c,e.m,e.o),a=new $t(e,e.j,a,e.B+1),e.m===null&&(a.H=e.o),o&&(e.i=o.D.concat(e.i)),o=ss(e,a,1e3),a.I=Math.round(.5*e.wa)+Math.round(.5*e.wa*Math.random()),gn(e.h,a),un(a,c,o)}function xe(e,o){e.H&&L(e.H,function(a,c){W(o,c,a)}),e.l&&Bi({},function(a,c){W(o,c,a)})}function ss(e,o,a){a=Math.min(e.i.length,a);var c=e.l?C(e.l.Na,e.l,e):null;t:{var y=e.i;let b=-1;for(;;){const E=["count="+a];b==-1?0<a?(b=y[0].g,E.push("ofs="+b)):b=0:E.push("ofs="+b);let H=!0;for(let Y=0;Y<a;Y++){let U=y[Y].g;const nt=y[Y].map;if(U-=b,0>U)b=Math.max(0,y[Y].g-100),H=!1;else try{rl(nt,E,"req"+U+"_")}catch{c&&c(nt)}}if(H){c=E.join("&");break t}}}return e=e.i.splice(0,a),o.D=e,c}function os(e){if(!e.g&&!e.u){e.Y=1;var o=e.Fa;ye||_i(),we||(ye(),we=!0),Kr.add(o,e),e.v=0}}function _n(e){return e.g||e.u||3<=e.v?!1:(e.Y++,e.u=Te(C(e.Fa,e),hs(e,e.v)),e.v++,!0)}n.Fa=function(){if(this.u=null,as(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var e=2*this.R;this.j.info("BP detection timer enabled: "+e),this.A=Te(C(this.ab,this),e)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ot(10),dr(this),as(this))};function yn(e){e.A!=null&&(u.clearTimeout(e.A),e.A=null)}function as(e){e.g=new $t(e,e.j,"rpc",e.Y),e.m===null&&(e.g.H=e.o),e.g.O=0;var o=It(e.qa);W(o,"RID","rpc"),W(o,"SID",e.K),W(o,"AID",e.T),W(o,"CI",e.F?"0":"1"),!e.F&&e.ja&&W(o,"TO",e.ja),W(o,"TYPE","xmlhttp"),xe(e,o),e.m&&e.o&&mn(o,e.m,e.o),e.L&&(e.g.I=e.L);var a=e.g;e=e.ia,a.L=1,a.v=lr(It(o)),a.m=null,a.P=!0,xi(a,e)}n.Za=function(){this.C!=null&&(this.C=null,dr(this),_n(this),ot(19))};function pr(e){e.C!=null&&(u.clearTimeout(e.C),e.C=null)}function ls(e,o){var a=null;if(e.g==o){pr(e),yn(e),e.g=null;var c=2}else if(pn(e.h,o))a=o.D,Vi(e.h,o),c=1;else return;if(e.G!=0){if(o.o)if(c==1){a=o.m?o.m.length:0,o=Date.now()-o.F;var y=e.B;c=an(),st(c,new ki(c,a)),fr(e)}else os(e);else if(y=o.s,y==3||y==0&&0<o.X||!(c==1&&ol(e,o)||c==2&&_n(e)))switch(a&&0<a.length&&(o=e.h,o.i=o.i.concat(a)),y){case 1:Gt(e,5);break;case 4:Gt(e,10);break;case 3:Gt(e,6);break;default:Gt(e,2)}}}function hs(e,o){let a=e.Ta+Math.floor(Math.random()*e.cb);return e.isActive()||(a*=2),a*o}function Gt(e,o){if(e.j.info("Error code "+o),o==2){var a=C(e.fb,e),c=e.Xa;const y=!c;c=new Wt(c||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||or(c,"https"),lr(c),y?Qa(c.toString(),a):tl(c.toString(),a)}else ot(2);e.G=0,e.l&&e.l.sa(o),cs(e),ns(e)}n.fb=function(e){e?(this.j.info("Successfully pinged google.com"),ot(2)):(this.j.info("Failed to ping google.com"),ot(1))};function cs(e){if(e.G=0,e.ka=[],e.l){const o=ji(e.h);(o.length!=0||e.i.length!=0)&&(O(e.ka,o),O(e.ka,e.i),e.h.i.length=0,B(e.i),e.i.length=0),e.l.ra()}}function us(e,o,a){var c=a instanceof Wt?It(a):new Wt(a);if(c.g!="")o&&(c.g=o+"."+c.g),ar(c,c.s);else{var y=u.location;c=y.protocol,o=o?o+"."+y.hostname:y.hostname,y=+y.port;var b=new Wt(null);c&&or(b,c),o&&(b.g=o),y&&ar(b,y),a&&(b.l=a),c=b}return a=e.D,o=e.ya,a&&o&&W(c,a,o),W(c,"VER",e.la),xe(e,c),c}function ds(e,o,a){if(o&&!e.J)throw Error("Can't create secondary domain capable XhrIo object.");return o=e.Ca&&!e.pa?new G(new hr({eb:a})):new G(e.pa),o.Ha(e.J),o}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function fs(){}n=fs.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function ut(e,o){rt.call(this),this.g=new rs(o),this.l=e,this.h=o&&o.messageUrlParams||null,e=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(e?e["X-WebChannel-Content-Type"]=o.messageContentType:e={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.va&&(e?e["X-WebChannel-Client-Profile"]=o.va:e={"X-WebChannel-Client-Profile":o.va}),this.g.S=e,(e=o&&o.Sb)&&!J(e)&&(this.g.m=e),this.v=o&&o.supportsCrossDomainXhr||!1,this.u=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!J(o)&&(this.g.D=o,e=this.h,e!==null&&o in e&&(e=this.h,o in e&&delete e[o])),this.j=new le(this)}D(ut,rt),ut.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},ut.prototype.close=function(){vn(this.g)},ut.prototype.o=function(e){var o=this.g;if(typeof e=="string"){var a={};a.__data__=e,e=a}else this.u&&(a={},a.__data__=rn(e),e=a);o.i.push(new Ha(o.Ya++,e)),o.G==3&&fr(o)},ut.prototype.N=function(){this.g.l=null,delete this.j,vn(this.g),delete this.g,ut.aa.N.call(this)};function ps(e){sn.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var o=e.__sm__;if(o){t:{for(const a in o){e=a;break t}e=void 0}(this.i=e)&&(e=this.i,o=o!==null&&e in o?o[e]:void 0),this.data=o}else this.data=e}D(ps,sn);function gs(){on.call(this),this.status=1}D(gs,on);function le(e){this.g=e}D(le,fs),le.prototype.ua=function(){st(this.g,"a")},le.prototype.ta=function(e){st(this.g,new ps(e))},le.prototype.sa=function(e){st(this.g,new gs)},le.prototype.ra=function(){st(this.g,"b")},ut.prototype.send=ut.prototype.o,ut.prototype.open=ut.prototype.m,ut.prototype.close=ut.prototype.close,ln.NO_ERROR=0,ln.TIMEOUT=8,ln.HTTP_ERROR=6,ja.COMPLETE="complete",La.EventType=Ee,Ee.OPEN="a",Ee.CLOSE="b",Ee.ERROR="c",Ee.MESSAGE="d",rt.prototype.listen=rt.prototype.K,G.prototype.listenOnce=G.prototype.L,G.prototype.getLastError=G.prototype.Ka,G.prototype.getLastErrorCode=G.prototype.Ba,G.prototype.getStatus=G.prototype.Z,G.prototype.getResponseJson=G.prototype.Oa,G.prototype.getResponseText=G.prototype.oa,G.prototype.send=G.prototype.ea,G.prototype.setWithCredentials=G.prototype.Ha}).apply(typeof _r<"u"?_r:typeof self<"u"?self:typeof window<"u"?window:{});const Ks="@firebase/firestore",Xs="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ht{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}ht.UNAUTHENTICATED=new ht(null),ht.GOOGLE_CREDENTIALS=new ht("google-credentials-uid"),ht.FIRST_PARTY=new ht("first-party-uid"),ht.MOCK_USER=new ht("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Gr="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $r=new ai("@firebase/firestore");function mt(n,...t){if($r.logLevel<=j.DEBUG){const r=t.map(ua);$r.debug(`Firestore (${Gr}): ${n}`,...r)}}function ca(n,...t){if($r.logLevel<=j.ERROR){const r=t.map(ua);$r.error(`Firestore (${Gr}): ${n}`,...r)}}function ua(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(r){return JSON.stringify(r)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lr(n,t,r){let i="Unexpected state";typeof t=="string"?i=t:r=t,da(n,i,r)}function da(n,t,r){let i=`FIRESTORE (${Gr}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(r!==void 0)try{i+=" CONTEXT: "+JSON.stringify(r)}catch{i+=" CONTEXT: "+r}throw ca(i),new Error(i)}function je(n,t,r,i){let s="Unexpected state";typeof r=="string"?s=r:i=r,n||da(t,s,i)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class V extends Ot{constructor(t,r){super(t,r),this.code=t,this.message=r,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Be{constructor(){this.promise=new Promise((t,r)=>{this.resolve=t,this.reject=r})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zu{constructor(t,r){this.user=r,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Wu{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,r){t.enqueueRetryable(()=>r(ht.UNAUTHENTICATED))}shutdown(){}}class Gu{constructor(t){this.t=t,this.currentUser=ht.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,r){je(this.o===void 0,42304);let i=this.i;const s=g=>this.i!==i?(i=this.i,r(g)):Promise.resolve();let l=new Be;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new Be,t.enqueueRetryable(()=>s(this.currentUser))};const h=()=>{const g=l;t.enqueueRetryable(async()=>{await g.promise,await s(this.currentUser)})},u=g=>{mt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit(g=>u(g)),setTimeout(()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?u(g):(mt("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new Be)}},0),h()}getToken(){const t=this.i,r=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(r).then(i=>this.i!==t?(mt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):i?(je(typeof i.accessToken=="string",31837,{l:i}),new zu(i.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return je(t===null||typeof t=="string",2055,{h:t}),new ht(t)}}class qu{constructor(t,r,i){this.P=t,this.T=r,this.I=i,this.type="FirstParty",this.user=ht.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Ku{constructor(t,r,i){this.P=t,this.T=r,this.I=i}getToken(){return Promise.resolve(new qu(this.P,this.T,this.I))}start(t,r){t.enqueueRetryable(()=>r(ht.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Js{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Xu{constructor(t,r){this.V=r,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Pt(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,r){je(this.o===void 0,3512);const i=l=>{l.error!=null&&mt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.m;return this.m=l.token,mt("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?r(l.token):Promise.resolve()};this.o=l=>{t.enqueueRetryable(()=>i(l))};const s=l=>{mt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(l=>s(l)),setTimeout(()=>{if(!this.appCheck){const l=this.V.getImmediate({optional:!0});l?s(l):mt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Js(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(r=>r?(je(typeof r.token=="string",44558,{tokenResult:r}),this.m=r.token,new Js(r.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ju(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),r=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(r);else for(let i=0;i<n;i++)r[i]=Math.floor(256*Math.random());return r}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yu(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zu{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=62*Math.floor(4.129032258064516);let i="";for(;i.length<20;){const s=Ju(40);for(let l=0;l<s.length;++l)i.length<20&&s[l]<r&&(i+=t.charAt(s[l]%62))}return i}}function _t(n,t){return n<t?-1:n>t?1:0}function Qu(n,t){let r=0;for(;r<n.length&&r<t.length;){const i=n.codePointAt(r),s=t.codePointAt(r);if(i!==s){if(i<128&&s<128)return _t(i,s);{const l=Yu(),h=td(l.encode(Ys(n,r)),l.encode(Ys(t,r)));return h!==0?h:_t(i,s)}}r+=i>65535?2:1}return _t(n.length,t.length)}function Ys(n,t){return n.codePointAt(t)>65535?n.substring(t,t+2):n.substring(t,t+1)}function td(n,t){for(let r=0;r<n.length&&r<t.length;++r)if(n[r]!==t[r])return _t(n[r],t[r]);return _t(n.length,t.length)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs="__name__";class yt{constructor(t,r,i){r===void 0?r=0:r>t.length&&Lr(637,{offset:r,range:t.length}),i===void 0?i=t.length-r:i>t.length-r&&Lr(1746,{length:i,range:t.length-r}),this.segments=t,this.offset=r,this.len=i}get length(){return this.len}isEqual(t){return yt.comparator(this,t)===0}child(t){const r=this.segments.slice(this.offset,this.limit());return t instanceof yt?t.forEach(i=>{r.push(i)}):r.push(t),this.construct(r)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let r=0;r<this.length;r++)if(this.get(r)!==t.get(r))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let r=0;r<this.length;r++)if(this.get(r)!==t.get(r))return!1;return!0}forEach(t){for(let r=this.offset,i=this.limit();r<i;r++)t(this.segments[r])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,r){const i=Math.min(t.length,r.length);for(let s=0;s<i;s++){const l=yt.compareSegments(t.get(s),r.get(s));if(l!==0)return l}return _t(t.length,r.length)}static compareSegments(t,r){const i=yt.isNumericId(t),s=yt.isNumericId(r);return i&&!s?-1:!i&&s?1:i&&s?yt.extractNumericId(t).compare(yt.extractNumericId(r)):Qu(t,r)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return ui.fromString(t.substring(4,t.length-2))}}class gt extends yt{construct(t,r,i){return new gt(t,r,i)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const r=[];for(const i of t){if(i.indexOf("//")>=0)throw new V(F.INVALID_ARGUMENT,`Invalid segment (${i}). Paths must not contain // in them.`);r.push(...i.split("/").filter(s=>s.length>0))}return new gt(r)}static emptyPath(){return new gt([])}}const ed=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Kt extends yt{construct(t,r,i){return new Kt(t,r,i)}static isValidIdentifier(t){return ed.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Kt.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Zs}static keyField(){return new Kt([Zs])}static fromServerFormat(t){const r=[];let i="",s=0;const l=()=>{if(i.length===0)throw new V(F.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);r.push(i),i=""};let h=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new V(F.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const g=t[s+1];if(g!=="\\"&&g!=="."&&g!=="`")throw new V(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);i+=g,s+=2}else u==="`"?(h=!h,s++):u!=="."||h?(i+=u,s++):(l(),s++)}if(l(),h)throw new V(F.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new Kt(r)}static emptyPath(){return new Kt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yt{constructor(t){this.path=t}static fromPath(t){return new Yt(gt.fromString(t))}static fromName(t){return new Yt(gt.fromString(t).popFirst(5))}static empty(){return new Yt(gt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&gt.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,r){return gt.comparator(t.path,r.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new Yt(new gt(t.slice()))}}function rd(n,t,r,i){if(t===!0&&i===!0)throw new V(F.INVALID_ARGUMENT,`${n} and ${r} cannot be used together.`)}function nd(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function K(n,t){const r={typeString:n};return t&&(r.value=t),r}function Ze(n,t){if(!nd(n))throw new V(F.INVALID_ARGUMENT,"JSON must be an object");let r;for(const i in t)if(t[i]){const s=t[i].typeString,l="value"in t[i]?{value:t[i].value}:void 0;if(!(i in n)){r=`JSON missing required field: '${i}'`;break}const h=n[i];if(s&&typeof h!==s){r=`JSON field '${i}' must be a ${s}.`;break}if(l!==void 0&&h!==l.value){r=`Expected '${i}' field to equal '${l.value}'`;break}}if(r)throw new V(F.INVALID_ARGUMENT,r);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qs=-62135596800,to=1e6;class k{static now(){return k.fromMillis(Date.now())}static fromDate(t){return k.fromMillis(t.getTime())}static fromMillis(t){const r=Math.floor(t/1e3),i=Math.floor((t-1e3*r)*to);return new k(r,i)}constructor(t,r){if(this.seconds=t,this.nanoseconds=r,r<0)throw new V(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+r);if(r>=1e9)throw new V(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+r);if(t<Qs)throw new V(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new V(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/to}_compareTo(t){return this.seconds===t.seconds?_t(this.nanoseconds,t.nanoseconds):_t(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:k._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(Ze(t,k._jsonSchema))return new k(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Qs;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}k._jsonSchemaVersion="firestore/timestamp/1.0",k._jsonSchema={type:K("string",k._jsonSchemaVersion),seconds:K("number"),nanoseconds:K("number")};function id(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sd extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(t){this.binaryString=t}static fromBase64String(t){const r=function(s){try{return atob(s)}catch(l){throw typeof DOMException<"u"&&l instanceof DOMException?new sd("Invalid base64 string: "+l):l}}(t);return new ne(r)}static fromUint8Array(t){const r=function(s){let l="";for(let h=0;h<s.length;++h)l+=String.fromCharCode(s[h]);return l}(t);return new ne(r)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(r){return btoa(r)}(this.binaryString)}toUint8Array(){return function(r){const i=new Uint8Array(r.length);for(let s=0;s<r.length;s++)i[s]=r.charCodeAt(s);return i}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return _t(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}ne.EMPTY_BYTE_STRING=new ne("");const eo="(default)";class Ur{constructor(t,r){this.projectId=t,this.database=r||eo}static empty(){return new Ur("","")}get isDefaultDatabase(){return this.database===eo}isEqual(t){return t instanceof Ur&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class od{constructor(t,r=null,i=[],s=[],l=null,h="F",u=null,g=null){this.path=t,this.collectionGroup=r,this.explicitOrderBy=i,this.filters=s,this.limit=l,this.limitType=h,this.startAt=u,this.endAt=g,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function ad(n){return new od(n)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ro,x;(x=ro||(ro={}))[x.OK=0]="OK",x[x.CANCELLED=1]="CANCELLED",x[x.UNKNOWN=2]="UNKNOWN",x[x.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",x[x.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",x[x.NOT_FOUND=5]="NOT_FOUND",x[x.ALREADY_EXISTS=6]="ALREADY_EXISTS",x[x.PERMISSION_DENIED=7]="PERMISSION_DENIED",x[x.UNAUTHENTICATED=16]="UNAUTHENTICATED",x[x.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",x[x.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",x[x.ABORTED=10]="ABORTED",x[x.OUT_OF_RANGE=11]="OUT_OF_RANGE",x[x.UNIMPLEMENTED=12]="UNIMPLEMENTED",x[x.INTERNAL=13]="INTERNAL",x[x.UNAVAILABLE=14]="UNAVAILABLE",x[x.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */new ui([4294967295,4294967295],0);/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ld=41943040;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hd=1048576;function Ln(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cd{constructor(t,r,i=1e3,s=1.5,l=6e4){this.Fi=t,this.timerId=r,this.d_=i,this.E_=s,this.A_=l,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(t){this.cancel();const r=Math.floor(this.R_+this.p_()),i=Math.max(0,Date.now()-this.m_),s=Math.max(0,r-i);s>0&&mt("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${r} ms, last attempt: ${i} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),t())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(t,r,i,s,l){this.asyncQueue=t,this.timerId=r,this.targetTimeMs=i,this.op=s,this.removalCallback=l,this.deferred=new Be,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(h=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,r,i,s,l){const h=Date.now()+i,u=new di(t,r,h,s,l);return u.start(i),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new V(F.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var no,io;(io=no||(no={})).Fa="default",io.Cache="cache";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ud(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const so=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dd="firestore.googleapis.com",oo=!0;class ao{constructor(t){var r,i;if(t.host===void 0){if(t.ssl!==void 0)throw new V(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=dd,this.ssl=oo}else this.host=t.host,this.ssl=(r=t.ssl)!==null&&r!==void 0?r:oo;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=ld;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<hd)throw new V(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}rd("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ud((i=t.experimentalLongPollingOptions)!==null&&i!==void 0?i:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(i,s){return i.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class fd{constructor(t,r,i,s){this._authCredentials=t,this._appCheckCredentials=r,this._databaseId=i,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ao({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new V(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new V(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ao(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(i){if(!i)return new Wu;switch(i.type){case"firstParty":return new Ku(i.sessionIndex||"0",i.iamToken||null,i.authTokenFactory||null);case"provider":return i.client;default:throw new V(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(r){const i=so.get(r);i&&(mt("ComponentProvider","Removing Datastore"),so.delete(r),i.terminate())}(this),Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(t,r,i){this.converter=r,this._query=i,this.type="query",this.firestore=t}withConverter(t){return new fi(this.firestore,t,this._query)}}class bt{constructor(t,r,i){this.converter=r,this._key=i,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new pi(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new bt(this.firestore,t,this._key)}toJSON(){return{type:bt._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,r,i){if(Ze(r,bt._jsonSchema))return new bt(t,i||null,new Yt(gt.fromString(r.referencePath)))}}bt._jsonSchemaVersion="firestore/documentReference/1.0",bt._jsonSchema={type:K("string",bt._jsonSchemaVersion),referencePath:K("string")};class pi extends fi{constructor(t,r,i){super(t,r,ad(i)),this._path=i,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new bt(this.firestore,null,new Yt(t))}withConverter(t){return new pi(this.firestore,t,this._path)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lo="AsyncQueue";class ho{constructor(t=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new cd(this,"async_queue_retry"),this.oc=()=>{const i=Ln();i&&mt(lo,"Visibility state changed to "+i.visibilityState),this.F_.y_()},this._c=t;const r=Ln();r&&typeof r.addEventListener=="function"&&r.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.ac(),this.uc(t)}enterRestrictedMode(t){if(!this.Xu){this.Xu=!0,this.rc=t||!1;const r=Ln();r&&typeof r.removeEventListener=="function"&&r.removeEventListener("visibilitychange",this.oc)}}enqueue(t){if(this.ac(),this.Xu)return new Promise(()=>{});const r=new Be;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(t().then(r.resolve,r.reject),r.promise)).then(()=>r.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Zu.push(t),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(t){if(!id(t))throw t;mt(lo,"Operation failed with retryable error: "+t)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(t){const r=this._c.then(()=>(this.nc=!0,t().catch(i=>{throw this.tc=i,this.nc=!1,ca("INTERNAL UNHANDLED ERROR: ",co(i)),i}).then(i=>(this.nc=!1,i))));return this._c=r,r}enqueueAfterDelay(t,r,i){this.ac(),this.sc.indexOf(t)>-1&&(r=0);const s=di.createAndSchedule(this,t,r,i,l=>this.lc(l));return this.ec.push(s),s}ac(){this.tc&&Lr(47125,{hc:co(this.tc)})}verifyOperationInProgress(){}async Pc(){let t;do t=this._c,await t;while(t!==this._c)}Tc(t){for(const r of this.ec)if(r.timerId===t)return!0;return!1}Ic(t){return this.Pc().then(()=>{this.ec.sort((r,i)=>r.targetTimeMs-i.targetTimeMs);for(const r of this.ec)if(r.skipDelay(),t!=="all"&&r.timerId===t)break;return this.Pc()})}dc(t){this.sc.push(t)}lc(t){const r=this.ec.indexOf(t);this.ec.splice(r,1)}}function co(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}class pd extends fd{constructor(t,r,i,s){super(t,r,i,s),this.type="firestore",this._queue=new ho,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new ho(t),this._firestoreClient=void 0,await t}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Nt(ne.fromBase64String(t))}catch(r){throw new V(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+r)}}static fromUint8Array(t){return new Nt(ne.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Nt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(Ze(t,Nt._jsonSchema))return Nt.fromBase64String(t.bytes)}}Nt._jsonSchemaVersion="firestore/bytes/1.0",Nt._jsonSchema={type:K("string",Nt._jsonSchemaVersion),bytes:K("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{constructor(...t){for(let r=0;r<t.length;++r)if(t[r].length===0)throw new V(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Kt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(t,r){if(!isFinite(t)||t<-90||t>90)throw new V(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(r)||r<-180||r>180)throw new V(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+r);this._lat=t,this._long=r}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return _t(this._lat,t._lat)||_t(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Qt._jsonSchemaVersion}}static fromJSON(t){if(Ze(t,Qt._jsonSchema))return new Qt(t.latitude,t.longitude)}}Qt._jsonSchemaVersion="firestore/geoPoint/1.0",Qt._jsonSchema={type:K("string",Qt._jsonSchemaVersion),latitude:K("number"),longitude:K("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class te{constructor(t){this._values=(t||[]).map(r=>r)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(i,s){if(i.length!==s.length)return!1;for(let l=0;l<i.length;++l)if(i[l]!==s[l])return!1;return!0}(this._values,t._values)}toJSON(){return{type:te._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(Ze(t,te._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(r=>typeof r=="number"))return new te(t.vectorValues);throw new V(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}te._jsonSchemaVersion="firestore/vectorValue/1.0",te._jsonSchema={type:K("string",te._jsonSchemaVersion),vectorValues:K("object")};const gd=new RegExp("[~\\*/\\[\\]]");function md(n,t,r){if(t.search(gd)>=0)throw uo(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new fa(...t.split("."))._internalPath}catch{throw uo(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function uo(n,t,r,i,s){let l=`Function ${t}() called with invalid data`;l+=". ";let h="";return new V(F.INVALID_ARGUMENT,l+n+h)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa{constructor(t,r,i,s,l){this._firestore=t,this._userDataWriter=r,this._key=i,this._document=s,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new bt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new vd(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const r=this._document.data.field(ga("DocumentSnapshot.get",t));if(r!==null)return this._userDataWriter.convertValue(r)}}}class vd extends pa{data(){return super.data()}}function ga(n,t){return typeof t=="string"?md(n,t):t instanceof fa?t._internalPath:t._delegate._internalPath}class yr{constructor(t,r){this.hasPendingWrites=t,this.fromCache=r}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class pe extends pa{constructor(t,r,i,s,l,h){super(t,r,i,s,h),this._firestore=t,this._firestoreImpl=t,this.metadata=l}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const r=new Ir(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(r,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,r={}){if(this._document){const i=this._document.data.field(ga("DocumentSnapshot.get",t));if(i!==null)return this._userDataWriter.convertValue(i,r.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new V(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,r={};return r.type=pe._jsonSchemaVersion,r.bundle="",r.bundleSource="DocumentSnapshot",r.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?r:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),r.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),r)}}pe._jsonSchemaVersion="firestore/documentSnapshot/1.0",pe._jsonSchema={type:K("string",pe._jsonSchemaVersion),bundleSource:K("string","DocumentSnapshot"),bundleName:K("string"),bundle:K("string")};class Ir extends pe{data(t={}){return super.data(t)}}class He{constructor(t,r,i,s){this._firestore=t,this._userDataWriter=r,this._snapshot=s,this.metadata=new yr(s.hasPendingWrites,s.fromCache),this.query=i}get docs(){const t=[];return this.forEach(r=>t.push(r)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,r){this._snapshot.docs.forEach(i=>{t.call(r,new Ir(this._firestore,this._userDataWriter,i.key,i,new yr(this._snapshot.mutatedKeys.has(i.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const r=!!t.includeMetadataChanges;if(r&&this._snapshot.excludesMetadataChanges)throw new V(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===r||(this._cachedChanges=function(s,l){if(s._snapshot.oldDocs.isEmpty()){let h=0;return s._snapshot.docChanges.map(u=>{const g=new Ir(s._firestore,s._userDataWriter,u.doc.key,u.doc,new yr(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:g,oldIndex:-1,newIndex:h++}})}{let h=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>l||u.type!==3).map(u=>{const g=new Ir(s._firestore,s._userDataWriter,u.doc.key,u.doc,new yr(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let A=-1,T=-1;return u.type!==0&&(A=h.indexOf(u.doc.key),h=h.delete(u.doc.key)),u.type!==1&&(h=h.add(u.doc),T=h.indexOf(u.doc.key)),{type:_d(u.type),doc:g,oldIndex:A,newIndex:T}})}}(this,r),this._cachedChangesIncludeMetadataChanges=r),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new V(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=He._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Zu.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const r=[],i=[],s=[];return this.docs.forEach(l=>{l._document!==null&&(r.push(l._document),i.push(this._userDataWriter.convertObjectMap(l._document.data.value.mapValue.fields,"previous")),s.push(l.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function _d(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Lr(61501,{type:n})}}He._jsonSchemaVersion="firestore/querySnapshot/1.0",He._jsonSchema={type:K("string",He._jsonSchemaVersion),bundleSource:K("string","QuerySnapshot"),bundleName:K("string"),bundle:K("string")};(function(t,r=!0){(function(s){Gr=s})(Je),Ht(new Bt("firestore",(i,{instanceIdentifier:s,options:l})=>{const h=i.getProvider("app").getImmediate(),u=new pd(new Gu(i.getProvider("auth-internal")),new Xu(h,i.getProvider("app-check-internal")),function(A,T){if(!Object.prototype.hasOwnProperty.apply(A.options,["projectId"]))throw new V(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ur(A.options.projectId,T)}(h,s),h);return l=Object.assign({useFetchStreams:r},l),u._setSettings(l),u},"PUBLIC").setMultipleInstances(!0)),dt(Ks,Xs,t),dt(Ks,Xs,"esm2017")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ma="firebasestorage.googleapis.com",yd="storageBucket",wd=2*60*1e3,bd=10*60*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St extends Ot{constructor(t,r,i=0){super(Un(t),`Firebase Storage: ${r} (${Un(t)})`),this.status_=i,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,St.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Un(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Et;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Et||(Et={}));function Un(n){return"storage/"+n}function Ad(){const n="An unknown error occurred, please check the error payload for server response.";return new St(Et.UNKNOWN,n)}function Ed(){return new St(Et.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Sd(){return new St(Et.CANCELED,"User canceled the upload/download.")}function Td(n){return new St(Et.INVALID_URL,"Invalid URL '"+n+"'.")}function Id(n){return new St(Et.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function fo(n){return new St(Et.INVALID_ARGUMENT,n)}function va(){return new St(Et.APP_DELETED,"The Firebase app was deleted.")}function Cd(n){return new St(Et.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(t,r){this.bucket=t,this.path_=r}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,r){let i;try{i=vt.makeFromUrl(t,r)}catch{return new vt(t,"")}if(i.path==="")return i;throw Id(t)}static makeFromUrl(t,r){let i=null;const s="([A-Za-z0-9.\\-_]+)";function l(P){P.path.charAt(P.path.length-1)==="/"&&(P.path_=P.path_.slice(0,-1))}const h="(/(.*))?$",u=new RegExp("^gs://"+s+h,"i"),g={bucket:1,path:3};function A(P){P.path_=decodeURIComponent(P.path)}const T="v[A-Za-z0-9_]+",S=r.replace(/[.]/g,"\\."),C="(/([^?#]*).*)?$",$=new RegExp(`^https?://${S}/${T}/b/${s}/o${C}`,"i"),D={bucket:1,path:3},B=r===ma?"(?:storage.googleapis.com|storage.cloud.google.com)":r,O="([^?#]*)",tt=new RegExp(`^https?://${B}/${s}/${O}`,"i"),R=[{regex:u,indices:g,postModify:l},{regex:$,indices:D,postModify:A},{regex:tt,indices:{bucket:1,path:2},postModify:A}];for(let P=0;P<R.length;P++){const N=R[P],L=N.regex.exec(t);if(L){const v=L[N.indices.bucket];let d=L[N.indices.path];d||(d=""),i=new vt(v,d),N.postModify(i);break}}if(i==null)throw Td(t);return i}}class Pd{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nd(n,t,r){let i=1,s=null,l=null,h=!1,u=0;function g(){return u===2}let A=!1;function T(...O){A||(A=!0,t.apply(null,O))}function S(O){s=setTimeout(()=>{s=null,n($,g())},O)}function C(){l&&clearTimeout(l)}function $(O,...tt){if(A){C();return}if(O){C(),T.call(null,O,...tt);return}if(g()||h){C(),T.call(null,O,...tt);return}i<64&&(i*=2);let R;u===1?(u=2,R=0):R=(i+Math.random())*1e3,S(R)}let D=!1;function B(O){D||(D=!0,C(),!A&&(s!==null?(O||(u=2),clearTimeout(s),S(0)):O||(u=1)))}return S(0),l=setTimeout(()=>{h=!0,B(!0)},r),B}function Rd(n){n(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kd(n){return n!==void 0}function po(n,t,r,i){if(i<t)throw fo(`Invalid value for '${n}'. Expected ${t} or greater.`);if(i>r)throw fo(`Invalid value for '${n}'. Expected ${r} or less.`)}function Dd(n){const t=encodeURIComponent;let r="?";for(const i in n)if(n.hasOwnProperty(i)){const s=t(i)+"="+t(n[i]);r=r+s+"&"}return r=r.slice(0,-1),r}var Mr;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Mr||(Mr={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Od(n,t){const r=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,l=t.indexOf(n)!==-1;return r||s||l}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xd{constructor(t,r,i,s,l,h,u,g,A,T,S,C=!0,$=!1){this.url_=t,this.method_=r,this.headers_=i,this.body_=s,this.successCodes_=l,this.additionalRetryCodes_=h,this.callback_=u,this.errorCallback_=g,this.timeout_=A,this.progressCallback_=T,this.connectionFactory_=S,this.retry=C,this.isUsingEmulator=$,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((D,B)=>{this.resolve_=D,this.reject_=B,this.start_()})}start_(){const t=(i,s)=>{if(s){i(!1,new wr(!1,null,!0));return}const l=this.connectionFactory_();this.pendingConnection_=l;const h=u=>{const g=u.loaded,A=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(g,A)};this.progressCallback_!==null&&l.addUploadProgressListener(h),l.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&l.removeUploadProgressListener(h),this.pendingConnection_=null;const u=l.getErrorCode()===Mr.NO_ERROR,g=l.getStatus();if(!u||Od(g,this.additionalRetryCodes_)&&this.retry){const T=l.getErrorCode()===Mr.ABORT;i(!1,new wr(!1,null,T));return}const A=this.successCodes_.indexOf(g)!==-1;i(!0,new wr(A,l))})},r=(i,s)=>{const l=this.resolve_,h=this.reject_,u=s.connection;if(s.wasSuccessCode)try{const g=this.callback_(u,u.getResponse());kd(g)?l(g):l()}catch(g){h(g)}else if(u!==null){const g=Ad();g.serverResponse=u.getErrorText(),this.errorCallback_?h(this.errorCallback_(u,g)):h(g)}else if(s.canceled){const g=this.appDelete_?va():Sd();h(g)}else{const g=Ed();h(g)}};this.canceled_?r(!1,new wr(!1,null,!0)):this.backoffId_=Nd(t,r,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Rd(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class wr{constructor(t,r,i){this.wasSuccessCode=t,this.connection=r,this.canceled=!!i}}function $d(n,t){t!==null&&t.length>0&&(n.Authorization="Firebase "+t)}function Ld(n,t){n["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Ud(n,t){t&&(n["X-Firebase-GMPID"]=t)}function Md(n,t){t!==null&&(n["X-Firebase-AppCheck"]=t)}function Fd(n,t,r,i,s,l,h=!0,u=!1){const g=Dd(n.urlParams),A=n.url+g,T=Object.assign({},n.headers);return Ud(T,t),$d(T,r),Ld(T,l),Md(T,i),new xd(A,n.method,T,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,h,u)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vd(n){if(n.length===0)return null;const t=n.lastIndexOf("/");return t===-1?"":n.slice(0,t)}function jd(n){const t=n.lastIndexOf("/",n.length-2);return t===-1?n:n.slice(t+1)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fr{constructor(t,r){this._service=t,r instanceof vt?this._location=r:this._location=vt.makeFromUrl(r,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,r){return new Fr(t,r)}get root(){const t=new vt(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return jd(this._location.path)}get storage(){return this._service}get parent(){const t=Vd(this._location.path);if(t===null)return null;const r=new vt(this._location.bucket,t);return new Fr(this._service,r)}_throwIfRoot(t){if(this._location.path==="")throw Cd(t)}}function go(n,t){const r=t==null?void 0:t[yd];return r==null?null:vt.makeFromBucketSpec(r,n)}class Bd{constructor(t,r,i,s,l,h=!1){this.app=t,this._authProvider=r,this._appCheckProvider=i,this._url=s,this._firebaseVersion=l,this._isUsingEmulator=h,this._bucket=null,this._host=ma,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=wd,this._maxUploadRetryTime=bd,this._requests=new Set,s!=null?this._bucket=vt.makeFromBucketSpec(s,this._host):this._bucket=go(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=vt.makeFromBucketSpec(this._url,t):this._bucket=go(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){po("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){po("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const r=await t.getToken();if(r!==null)return r.accessToken}return null}async _getAppCheckToken(){if(Pt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new Fr(this,t)}_makeRequest(t,r,i,s,l=!0){if(this._deleted)return new Pd(va());{const h=Fd(t,this._appId,i,s,r,this._firebaseVersion,l,this._isUsingEmulator);return this._requests.add(h),h.getPromise().then(()=>this._requests.delete(h),()=>this._requests.delete(h)),h}}async makeRequestWithTokens(t,r){const[i,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,r,i,s).getPromise()}}const mo="@firebase/storage",vo="0.13.14";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hd="storage";function zd(n,{instanceIdentifier:t}){const r=n.getProvider("app").getImmediate(),i=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new Bd(r,i,s,t,Je)}function Wd(){Ht(new Bt(Hd,zd,"PUBLIC").setMultipleInstances(!0)),dt(mo,vo,""),dt(mo,vo,"esm2017")}Wd();/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gd="functions";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qd{constructor(t,r,i,s){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,Pt(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=r.getImmediate({optional:!0}),this.messaging=i.getImmediate({optional:!0}),this.auth||r.get().then(l=>this.auth=l,()=>{}),this.messaging||i.get().then(l=>this.messaging=l,()=>{}),this.appCheck||s==null||s.get().then(l=>this.appCheck=l,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t==null?void 0:t.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const r=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return r.error?null:r.token}return null}async getContext(t){const r=await this.getAuthToken(),i=await this.getMessagingToken(),s=await this.getAppCheckToken(t);return{authToken:r,messagingToken:i,appCheckToken:s}}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _o="us-central1";class Kd{constructor(t,r,i,s,l=_o,h=(...u)=>fetch(...u)){this.app=t,this.fetchImpl=h,this.emulatorOrigin=null,this.contextProvider=new qd(t,r,i,s),this.cancelAllRequests=new Promise(u=>{this.deleteService=()=>Promise.resolve(u())});try{const u=new URL(l);this.customDomain=u.origin+(u.pathname==="/"?"":u.pathname),this.region=_o}catch{this.customDomain=null,this.region=l}}_delete(){return this.deleteService()}_url(t){const r=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${r}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${r}.cloudfunctions.net/${t}`}}const yo="@firebase/functions",wo="0.12.9";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xd="auth-internal",Jd="app-check-internal",Yd="messaging-internal";function Zd(n){const t=(r,{instanceIdentifier:i})=>{const s=r.getProvider("app").getImmediate(),l=r.getProvider(Xd),h=r.getProvider(Yd),u=r.getProvider(Jd);return new Kd(s,l,h,u,i)};Ht(new Bt(Gd,t,"PUBLIC").setMultipleInstances(!0)),dt(yo,wo,n),dt(yo,wo,"esm2017")}Zd();var Qd="firebase",tf="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */dt(Qd,tf,"app");const ef=I(null),rf=I("idle"),nf=I(null),sf=I(!1);Q(()=>({authUser:ef.get(),authState:rf.get(),error:nf.get(),initialized:sf.get()}));const of={showCompleted:!0,priority:"all",tag:"all",search:""},_a=I({...of}),ya=I({status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:5,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"All todos"}),gi=I(null);Q(()=>{const n=gi.get();return n?n.state.get():ya.get()});Q(()=>_a.get());function af(n){if(gi.get())throw new Error("Cannot set demo state after the todo store has been initialized.");ya.set(n)}function lf(n){if(gi.get())throw new Error("Cannot set demo filters after the todo store has been initialized.");_a.set(n)}if(typeof globalThis=="object"){const n=globalThis;n.__dfSetTodoDemoState=af,n.__dfSetTodoDemoFilters=lf}const hf=50,cf=I({status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:hf,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"Latest messages"}),uf=I("idle"),df=I(null),ff=I(null);Q(()=>{const n=ff.get();return n?n.state.get():cf.get()});Q(()=>({status:uf.get(),error:df.get()}));const pf=I("idle"),gf=I(0),mf=I(null),vf=I(null);Q(()=>({status:pf.get(),progress:gf.get(),error:mf.get(),uploadedFile:vf.get()}));I(null);const _f=I({status:"idle",data:null,error:null,lastCalled:null}),yf=I({status:"idle",data:null,error:null,lastCalled:null}),wf=I({status:"idle",data:null,error:null,lastCalled:null});Q(()=>_f.get());Q(()=>yf.get());Q(()=>wf.get());const bf=20,Af={status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:bf,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"Awaiting authentication"},Ef=I({...Af}),Sf=I(null);I(null);I(null);Q(()=>{const n=Sf.get();return n?n.state.get():Ef.get()});k.fromDate(new Date("2024-01-15")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-01-17")),k.fromDate(new Date("2024-01-17")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-01-18")),k.fromDate(new Date("2024-01-18")),k.fromDate(new Date("2024-01-28")),k.fromDate(new Date("2024-01-19")),k.fromDate(new Date("2024-01-19")),k.fromDate(new Date("2024-02-05")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-02-10")),k.fromDate(new Date("2024-01-21")),k.fromDate(new Date("2024-01-21")),k.fromDate(new Date("2024-02-15")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-02-12")),k.fromDate(new Date("2024-01-23")),k.fromDate(new Date("2024-01-23")),k.fromDate(new Date("2024-02-01")),k.fromDate(new Date("2024-01-24")),k.fromDate(new Date("2024-01-24")),k.fromDate(new Date("2024-02-20")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-02-18")),k.fromDate(new Date("2024-01-26")),k.fromDate(new Date("2024-01-26")),k.fromDate(new Date("2024-02-08"));const Tf=I([]),If=I(!1),Cf=I("");Q(()=>({users:Tf.get(),loading:If.get(),error:Cf.get()}));/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Pf extends Rt{connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){return ct`<span class="shadow"></span>`}}/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Nf=ie`:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Jn=class extends Pf{};Jn.styles=[Nf];Jn=X([Ke("md-elevation")],Jn);/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const wa=Symbol("attachableController");let Cr;Cr=new MutationObserver(n=>{var t;for(const r of n)(t=r.target[wa])==null||t.hostConnected()});class ba{get htmlFor(){return this.host.getAttribute("for")}set htmlFor(t){t===null?this.host.removeAttribute("for"):this.host.setAttribute("for",t)}get control(){return this.host.hasAttribute("for")?!this.htmlFor||!this.host.isConnected?null:this.host.getRootNode().querySelector(`#${this.htmlFor}`):this.currentControl||this.host.parentElement}set control(t){t?this.attach(t):this.detach()}constructor(t,r){this.host=t,this.onControlChange=r,this.currentControl=null,t.addController(this),t[wa]=this,Cr==null||Cr.observe(t,{attributeFilter:["for"]})}attach(t){t!==this.currentControl&&(this.setCurrentControl(t),this.host.removeAttribute("for"))}detach(){this.setCurrentControl(null),this.host.setAttribute("for","")}hostConnected(){this.setCurrentControl(this.control)}hostDisconnected(){this.setCurrentControl(null)}setCurrentControl(t){this.onControlChange(this.currentControl,t),this.currentControl=t}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Rf=["focusin","focusout","pointerdown"];class mi extends Rt{constructor(){super(...arguments),this.visible=!1,this.inward=!1,this.attachableController=new ba(this,this.onControlChange.bind(this))}get htmlFor(){return this.attachableController.htmlFor}set htmlFor(t){this.attachableController.htmlFor=t}get control(){return this.attachableController.control}set control(t){this.attachableController.control=t}attach(t){this.attachableController.attach(t)}detach(){this.attachableController.detach()}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}handleEvent(t){var r;if(!t[bo]){switch(t.type){default:return;case"focusin":this.visible=((r=this.control)==null?void 0:r.matches(":focus-visible"))??!1;break;case"focusout":case"pointerdown":this.visible=!1;break}t[bo]=!0}}onControlChange(t,r){for(const i of Rf)t==null||t.removeEventListener(i,this),r==null||r.addEventListener(i,this)}update(t){t.has("visible")&&this.dispatchEvent(new Event("visibility-changed")),super.update(t)}}X([ft({type:Boolean,reflect:!0})],mi.prototype,"visible",void 0);X([ft({type:Boolean,reflect:!0})],mi.prototype,"inward",void 0);const bo=Symbol("handledByFocusRing");/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const kf=ie`:host{animation-delay:0s,calc(var(--md-focus-ring-duration, 600ms)*.25);animation-duration:calc(var(--md-focus-ring-duration, 600ms)*.25),calc(var(--md-focus-ring-duration, 600ms)*.75);animation-timing-function:cubic-bezier(0.2, 0, 0, 1);box-sizing:border-box;color:var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));display:none;pointer-events:none;position:absolute}:host([visible]){display:flex}:host(:not([inward])){animation-name:outward-grow,outward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));inset:calc(-1*var(--md-focus-ring-outward-offset, 2px));outline:var(--md-focus-ring-width, 3px) solid currentColor}:host([inward]){animation-name:inward-grow,inward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border:var(--md-focus-ring-width, 3px) solid currentColor;inset:var(--md-focus-ring-inward-offset, 0px)}@keyframes outward-grow{from{outline-width:0}to{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes outward-shrink{from{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-grow{from{border-width:0}to{border-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-shrink{from{border-width:var(--md-focus-ring-active-width, 8px)}}@media(prefers-reduced-motion){:host{animation:none}}
`;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Yn=class extends mi{};Yn.styles=[kf];Yn=X([Ke("md-focus-ring")],Yn);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Df=th(class extends eh{constructor(n){var t;if(super(n),n.type!==Ql.ATTRIBUTE||n.name!=="class"||((t=n.strings)==null?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){var i,s;if(this.st===void 0){this.st=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(l=>l!=="")));for(const l in t)t[l]&&!((i=this.nt)!=null&&i.has(l))&&this.st.add(l);return this.render(t)}const r=n.element.classList;for(const l of this.st)l in t||(r.remove(l),this.st.delete(l));for(const l in t){const h=!!t[l];h===this.st.has(l)||(s=this.nt)!=null&&s.has(l)||(h?(r.add(l),this.st.add(l)):(r.remove(l),this.st.delete(l)))}return re}});/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Of={STANDARD:"cubic-bezier(0.2, 0, 0, 1)"};/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const xf=450,Ao=225,$f=.2,Lf=10,Uf=75,Mf=.35,Ff="::after",Vf="forwards";var at;(function(n){n[n.INACTIVE=0]="INACTIVE",n[n.TOUCH_DELAY=1]="TOUCH_DELAY",n[n.HOLDING=2]="HOLDING",n[n.WAITING_FOR_CLICK=3]="WAITING_FOR_CLICK"})(at||(at={}));const jf=["click","contextmenu","pointercancel","pointerdown","pointerenter","pointerleave","pointerup"],Bf=150,Mn=window.matchMedia("(forced-colors: active)");class Qe extends Rt{constructor(){super(...arguments),this.disabled=!1,this.hovered=!1,this.pressed=!1,this.rippleSize="",this.rippleScale="",this.initialSize=0,this.state=at.INACTIVE,this.checkBoundsAfterContextMenu=!1,this.attachableController=new ba(this,this.onControlChange.bind(this))}get htmlFor(){return this.attachableController.htmlFor}set htmlFor(t){this.attachableController.htmlFor=t}get control(){return this.attachableController.control}set control(t){this.attachableController.control=t}attach(t){this.attachableController.attach(t)}detach(){this.attachableController.detach()}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){const t={hovered:this.hovered,pressed:this.pressed};return ct`<div class="surface ${Df(t)}"></div>`}update(t){t.has("disabled")&&this.disabled&&(this.hovered=!1,this.pressed=!1),super.update(t)}handlePointerenter(t){this.shouldReactToEvent(t)&&(this.hovered=!0)}handlePointerleave(t){this.shouldReactToEvent(t)&&(this.hovered=!1,this.state!==at.INACTIVE&&this.endPressAnimation())}handlePointerup(t){if(this.shouldReactToEvent(t)){if(this.state===at.HOLDING){this.state=at.WAITING_FOR_CLICK;return}if(this.state===at.TOUCH_DELAY){this.state=at.WAITING_FOR_CLICK,this.startPressAnimation(this.rippleStartEvent);return}}}async handlePointerdown(t){if(this.shouldReactToEvent(t)){if(this.rippleStartEvent=t,!this.isTouch(t)){this.state=at.WAITING_FOR_CLICK,this.startPressAnimation(t);return}this.checkBoundsAfterContextMenu&&!this.inBounds(t)||(this.checkBoundsAfterContextMenu=!1,this.state=at.TOUCH_DELAY,await new Promise(r=>{setTimeout(r,Bf)}),this.state===at.TOUCH_DELAY&&(this.state=at.HOLDING,this.startPressAnimation(t)))}}handleClick(){if(!this.disabled){if(this.state===at.WAITING_FOR_CLICK){this.endPressAnimation();return}this.state===at.INACTIVE&&(this.startPressAnimation(),this.endPressAnimation())}}handlePointercancel(t){this.shouldReactToEvent(t)&&this.endPressAnimation()}handleContextmenu(){this.disabled||(this.checkBoundsAfterContextMenu=!0,this.endPressAnimation())}determineRippleSize(){const{height:t,width:r}=this.getBoundingClientRect(),i=Math.max(t,r),s=Math.max(Mf*i,Uf),l=Math.floor(i*$f),u=Math.sqrt(r**2+t**2)+Lf;this.initialSize=l,this.rippleScale=`${(u+s)/l}`,this.rippleSize=`${l}px`}getNormalizedPointerEventCoords(t){const{scrollX:r,scrollY:i}=window,{left:s,top:l}=this.getBoundingClientRect(),h=r+s,u=i+l,{pageX:g,pageY:A}=t;return{x:g-h,y:A-u}}getTranslationCoordinates(t){const{height:r,width:i}=this.getBoundingClientRect(),s={x:(i-this.initialSize)/2,y:(r-this.initialSize)/2};let l;return t instanceof PointerEvent?l=this.getNormalizedPointerEventCoords(t):l={x:i/2,y:r/2},l={x:l.x-this.initialSize/2,y:l.y-this.initialSize/2},{startPoint:l,endPoint:s}}startPressAnimation(t){var h;if(!this.mdRoot)return;this.pressed=!0,(h=this.growAnimation)==null||h.cancel(),this.determineRippleSize();const{startPoint:r,endPoint:i}=this.getTranslationCoordinates(t),s=`${r.x}px, ${r.y}px`,l=`${i.x}px, ${i.y}px`;this.growAnimation=this.mdRoot.animate({top:[0,0],left:[0,0],height:[this.rippleSize,this.rippleSize],width:[this.rippleSize,this.rippleSize],transform:[`translate(${s}) scale(1)`,`translate(${l}) scale(${this.rippleScale})`]},{pseudoElement:Ff,duration:xf,easing:Of.STANDARD,fill:Vf})}async endPressAnimation(){this.rippleStartEvent=void 0,this.state=at.INACTIVE;const t=this.growAnimation;let r=1/0;if(typeof(t==null?void 0:t.currentTime)=="number"?r=t.currentTime:t!=null&&t.currentTime&&(r=t.currentTime.to("ms").value),r>=Ao){this.pressed=!1;return}await new Promise(i=>{setTimeout(i,Ao-r)}),this.growAnimation===t&&(this.pressed=!1)}shouldReactToEvent(t){if(this.disabled||!t.isPrimary||this.rippleStartEvent&&this.rippleStartEvent.pointerId!==t.pointerId)return!1;if(t.type==="pointerenter"||t.type==="pointerleave")return!this.isTouch(t);const r=t.buttons===1;return this.isTouch(t)||r}inBounds({x:t,y:r}){const{top:i,left:s,bottom:l,right:h}=this.getBoundingClientRect();return t>=s&&t<=h&&r>=i&&r<=l}isTouch({pointerType:t}){return t==="touch"}async handleEvent(t){if(!(Mn!=null&&Mn.matches))switch(t.type){case"click":this.handleClick();break;case"contextmenu":this.handleContextmenu();break;case"pointercancel":this.handlePointercancel(t);break;case"pointerdown":await this.handlePointerdown(t);break;case"pointerenter":this.handlePointerenter(t);break;case"pointerleave":this.handlePointerleave(t);break;case"pointerup":this.handlePointerup(t);break}}onControlChange(t,r){for(const i of jf)t==null||t.removeEventListener(i,this),r==null||r.addEventListener(i,this)}}X([ft({type:Boolean,reflect:!0})],Qe.prototype,"disabled",void 0);X([jr()],Qe.prototype,"hovered",void 0);X([jr()],Qe.prototype,"pressed",void 0);X([ko(".surface")],Qe.prototype,"mdRoot",void 0);/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Hf=ie`:host{display:flex;margin:auto;pointer-events:none}:host([disabled]){display:none}@media(forced-colors: active){:host{display:none}}:host,.surface{border-radius:inherit;position:absolute;inset:0;overflow:hidden}.surface{-webkit-tap-highlight-color:rgba(0,0,0,0)}.surface::before,.surface::after{content:"";opacity:0;position:absolute}.surface::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));inset:0;transition:opacity 15ms linear,background-color 15ms linear}.surface::after{background:radial-gradient(closest-side, var(--md-ripple-pressed-color, var(--md-sys-color-on-surface, #1d1b20)) max(100% - 70px, 65%), transparent 100%);transform-origin:center center;transition:opacity 375ms linear}.hovered::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-ripple-hover-opacity, 0.08)}.pressed::after{opacity:var(--md-ripple-pressed-opacity, 0.12);transition-duration:105ms}
`;/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Zn=class extends Qe{};Zn.styles=[Hf];Zn=X([Ke("md-ripple")],Zn);/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Aa=["role","ariaAtomic","ariaAutoComplete","ariaBusy","ariaChecked","ariaColCount","ariaColIndex","ariaColSpan","ariaCurrent","ariaDisabled","ariaExpanded","ariaHasPopup","ariaHidden","ariaInvalid","ariaKeyShortcuts","ariaLabel","ariaLevel","ariaLive","ariaModal","ariaMultiLine","ariaMultiSelectable","ariaOrientation","ariaPlaceholder","ariaPosInSet","ariaPressed","ariaReadOnly","ariaRequired","ariaRoleDescription","ariaRowCount","ariaRowIndex","ariaRowSpan","ariaSelected","ariaSetSize","ariaSort","ariaValueMax","ariaValueMin","ariaValueNow","ariaValueText"];Aa.map(Ea);function Ea(n){return n.replace("aria","aria-").replace(/Elements?/g,"").toLowerCase()}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function zf(n){for(const t of Aa)n.createProperty(t,{attribute:Ea(t),reflect:!0});n.addInitializer(t=>{const r={hostConnected(){t.setAttribute("role","presentation")}};t.addController(r)})}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const vi=Symbol("internals"),Fn=Symbol("privateInternals");function Wf(n){class t extends n{get[vi](){return this[Fn]||(this[Fn]=this.attachInternals()),this[Fn]}}return t}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Gf(n){n.addInitializer(t=>{const r=t;r.addEventListener("click",async i=>{const{type:s,[vi]:l}=r,{form:h}=l;if(!(!h||s==="button")&&(await new Promise(u=>{setTimeout(u)}),!i.defaultPrevented)){if(s==="reset"){h.reset();return}h.addEventListener("submit",u=>{Object.defineProperty(u,"submitter",{configurable:!0,enumerable:!0,get:()=>r})},{capture:!0,once:!0}),l.setFormValue(r.value),h.requestSubmit()}})})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function qf(n){const t=new MouseEvent("click",{bubbles:!0});return n.dispatchEvent(t),t}function Kf(n){return n.currentTarget!==n.target||n.composedPath()[0]!==n.target||n.target.disabled?!1:!Xf(n)}function Xf(n){const t=Qn;return t&&(n.preventDefault(),n.stopImmediatePropagation()),Jf(),t}let Qn=!1;async function Jf(){Qn=!0,await null,Qn=!1}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Yf=Wf(Rt);class lt extends Yf{get name(){return this.getAttribute("name")??""}set name(t){this.setAttribute("name",t)}get form(){return this[vi].form}constructor(){super(),this.disabled=!1,this.href="",this.target="",this.trailingIcon=!1,this.hasIcon=!1,this.type="submit",this.value="",this.handleActivationClick=t=>{!Kf(t)||!this.buttonElement||(this.focus(),qf(this.buttonElement))},this.addEventListener("click",this.handleActivationClick)}focus(){var t;(t=this.buttonElement)==null||t.focus()}blur(){var t;(t=this.buttonElement)==null||t.blur()}render(){var s;const t=this.disabled&&!this.href,r=this.href?this.renderLink():this.renderButton(),i=this.href?"link":"button";return ct`
      ${(s=this.renderElevationOrOutline)==null?void 0:s.call(this)}
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${i}></md-focus-ring>
      <md-ripple
        part="ripple"
        for=${i}
        ?disabled="${t}"></md-ripple>
      ${r}
    `}renderButton(){const{ariaLabel:t,ariaHasPopup:r,ariaExpanded:i}=this;return ct`<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-label="${t||z}"
      aria-haspopup="${r||z}"
      aria-expanded="${i||z}">
      ${this.renderContent()}
    </button>`}renderLink(){const{ariaLabel:t,ariaHasPopup:r,ariaExpanded:i}=this;return ct`<a
      id="link"
      class="button"
      aria-label="${t||z}"
      aria-haspopup="${r||z}"
      aria-expanded="${i||z}"
      href=${this.href}
      target=${this.target||z}
      >${this.renderContent()}
    </a>`}renderContent(){const t=ct`<slot
      name="icon"
      @slotchange="${this.handleSlotChange}"></slot>`;return ct`
      <span class="touch"></span>
      ${this.trailingIcon?z:t}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon?t:z}
    `}handleSlotChange(){this.hasIcon=this.assignedIcons.length>0}}zf(lt),Gf(lt);lt.formAssociated=!0;lt.shadowRootOptions={mode:"open",delegatesFocus:!0};X([ft({type:Boolean,reflect:!0})],lt.prototype,"disabled",void 0);X([ft()],lt.prototype,"href",void 0);X([ft()],lt.prototype,"target",void 0);X([ft({type:Boolean,attribute:"trailing-icon",reflect:!0})],lt.prototype,"trailingIcon",void 0);X([ft({type:Boolean,attribute:"has-icon",reflect:!0})],lt.prototype,"hasIcon",void 0);X([ft()],lt.prototype,"type",void 0);X([ft({reflect:!0})],lt.prototype,"value",void 0);X([ko(".button")],lt.prototype,"buttonElement",void 0);X([Pl({slot:"icon",flatten:!0})],lt.prototype,"assignedIcons",void 0);/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Zf extends lt{renderElevationOrOutline(){return ct`<md-elevation part="elevation"></md-elevation>`}}/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Qf=ie`:host{--_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));--_container-elevation: var(--md-filled-button-container-elevation, 0);--_container-height: var(--md-filled-button-container-height, 40px);--_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));--_disabled-container-color: var(--md-filled-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);--_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);--_disabled-label-text-color: var(--md-filled-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);--_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);--_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);--_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-color: var(--md-filled-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));--_label-text-font: var(--md-filled-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filled-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);--_pressed-label-text-color: var(--md-filled-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-color: var(--md-filled-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));--_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-size: var(--md-filled-button-icon-size, 18px);--_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));--_container-shape-start-start: var(--md-filled-button-container-shape-start-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-filled-button-container-shape-start-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-filled-button-container-shape-end-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-filled-button-container-shape-end-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-filled-button-leading-space, 24px);--_trailing-space: var(--md-filled-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px)}
`;/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const tp=ie`md-elevation{transition-duration:280ms}:host([disabled]) md-elevation{transition:none}md-elevation{--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}:host(:focus-within) md-elevation{--md-elevation-level: var(--_focus-container-elevation)}:host(:hover) md-elevation{--md-elevation-level: var(--_hover-container-elevation)}:host(:active) md-elevation{--md-elevation-level: var(--_pressed-container-elevation)}:host([disabled]) md-elevation{--md-elevation-level: var(--_disabled-container-elevation)}
`;/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ep=ie`:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);box-sizing:border-box;cursor:pointer;display:inline-flex;gap:8px;min-height:var(--_container-height);outline:none;padding-block:calc((var(--_container-height) - max(var(--_label-text-line-height),var(--_icon-size)))/2);padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space);place-content:center;place-items:center;position:relative;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);text-overflow:ellipsis;text-wrap:nowrap;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:top;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host([disabled]){cursor:default;pointer-events:none}.button{border-radius:inherit;cursor:inherit;display:inline-flex;align-items:center;justify-content:center;border:none;outline:none;-webkit-appearance:none;vertical-align:middle;background:rgba(0,0,0,0);text-decoration:none;min-width:calc(64px - var(--_leading-space) - var(--_trailing-space));width:100%;z-index:0;height:100%;font:inherit;color:var(--_label-text-color);padding:0;gap:inherit;text-transform:inherit}.button::-moz-focus-inner{padding:0;border:0}:host(:hover) .button{color:var(--_hover-label-text-color)}:host(:focus-within) .button{color:var(--_focus-label-text-color)}:host(:active) .button{color:var(--_pressed-label-text-color)}.background{background-color:var(--_container-color);border-radius:inherit;inset:0;position:absolute}.label{overflow:hidden}:is(.button,.label,.label slot),.label ::slotted(*){text-overflow:inherit}:host([disabled]) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}:host([disabled]) .background{background-color:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}@media(forced-colors: active){.background{border:1px solid CanvasText}:host([disabled]){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1;--_disabled-container-opacity: 1;--_disabled-label-text-color: GrayText;--_disabled-label-text-opacity: 1}}:host([has-icon]:not([trailing-icon])){padding-inline-start:var(--_with-leading-icon-leading-space);padding-inline-end:var(--_with-leading-icon-trailing-space)}:host([has-icon][trailing-icon]){padding-inline-start:var(--_with-trailing-icon-leading-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;flex-shrink:0;color:var(--_icon-color);font-size:var(--_icon-size);inline-size:var(--_icon-size);block-size:var(--_icon-size)}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus-within) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host([disabled]) ::slotted([slot=icon]){color:var(--_disabled-icon-color);opacity:var(--_disabled-icon-opacity)}.touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}:host([touch-target=none]) .touch{display:none}
`;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let ti=class extends Zf{};ti.styles=[ep,tp,Qf];ti=X([Ke("md-filled-button")],ti);var rp=Object.defineProperty,np=Object.getOwnPropertyDescriptor,qr=(n,t,r,i)=>{for(var s=i>1?void 0:i?np(t,r):t,l=n.length-1,h;l>=0;l--)(h=n[l])&&(s=(i?h(t,r,s):h(s))||s);return i&&s&&rp(t,r,s),s};let ve=class extends Zl(Rt){constructor(){super(),this.currentContent="",this.isDirty=!1,this.fileName="...",window.addEventListener("message",n=>{const t=n.data;t.command==="updateContent"&&(this.fileName=t.data.fileName,this.currentContent=t.data.content,this.isDirty=t.data.isDirty??!1)})}async _handleCountTokens(){await $h(this.currentContent)}render(){const n=kh.get(),t=n.status==="error",r=n.status==="counting",i=r||this.isDirty;return ct`
      <div class="container">
        <h2>YAML Tools</h2>

        <div class="file-info">
          <p class="file-name">File: <strong>${this.fileName}</strong></p>

          <!-- Debug: Show isDirty state visibly -->
          <p style="font-size: 0.75rem; opacity: 0.5; margin: 0;">
            ${this.isDirty?"🔴 File has unsaved changes":"🟢 File is saved"}
          </p>

          ${n.tokenCount>0?ct`
            <p class="token-count">
              Token Count: <strong>${n.tokenCount}</strong>
            </p>
          `:ct`
            <p class="token-count" style="opacity: 0.5;">
              Click to count tokens
            </p>
          `}

          <div class="button-container">
            <md-filled-button
              @click=${this._handleCountTokens}
              ?disabled=${i}>
              ${r?"⏳ Counting...":this.isDirty?"💾 Save first":"Count Tokens"}
            </md-filled-button>
          </div>

          ${this.isDirty?ct`
            <p class="status" style="opacity: 0.7; color: var(--vscode-editorWarning-foreground, #dcdcaa);">
              ℹ️ Save your changes before counting tokens
            </p>
          `:n.status!=="idle"?ct`
            <p class="status ${t?"error":""}">
              ${r?"⏳ Counting...":t?`❌ ${n.errorMessage}`:"✓ Complete"}
            </p>
          `:""}
        </div>
      </div>
    `}};ve.styles=ie`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--vscode-font-family, sans-serif);
      color: var(--vscode-foreground);
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    .file-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background-color: var(--vscode-editor-background);
      border-radius: 4px;
    }
    .file-name {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
    .token-count {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--vscode-foreground);
    }
    .token-count strong {
      color: var(--vscode-symbolIcon-numberForeground, #b5cea8);
    }
    .status {
      margin: 0;
      opacity: 0.6;
      font-size: 0.85rem;
    }
    .status.error {
      color: var(--vscode-errorForeground, #f48771);
      opacity: 1;
    }
    .button-container {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    md-filled-button {
      flex: 1;
    }
  `;qr([ft({type:String})],ve.prototype,"fileName",2);qr([jr()],ve.prototype,"currentContent",2);qr([jr()],ve.prototype,"isDirty",2);ve=qr([Ke("df-yaml-tools-app")],ve);
