(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const h of l.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&i(h)}).observe(document,{childList:!0,subtree:!0});function n(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function i(s){if(s.ep)return;s.ep=!0;const l=n(s);fetch(s.href,l)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Er=globalThis,ei=Er.ShadowRoot&&(Er.ShadyCSS===void 0||Er.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ri=Symbol(),ms=new WeakMap;let So=class{constructor(t,n,i){if(this._$cssResult$=!0,i!==ri)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o;const n=this.t;if(ei&&t===void 0){const i=n!==void 0&&n.length===1;i&&(t=ms.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&ms.set(n,t))}return t}toString(){return this.cssText}};const al=r=>new So(typeof r=="string"?r:r+"",void 0,ri),ae=(r,...t)=>{const n=r.length===1?r[0]:t.reduce((i,s,l)=>i+(h=>{if(h._$cssResult$===!0)return h.cssText;if(typeof h=="number")return h;throw Error("Value passed to 'css' function must be a 'css' function result: "+h+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[l+1],r[0]);return new So(n,r,ri)},ll=(r,t)=>{if(ei)r.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(const n of t){const i=document.createElement("style"),s=Er.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=n.cssText,r.appendChild(i)}},vs=ei?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let n="";for(const i of t.cssRules)n+=i.cssText;return al(n)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:hl,defineProperty:cl,getOwnPropertyDescriptor:ul,getOwnPropertyNames:dl,getOwnPropertySymbols:fl,getPrototypeOf:pl}=Object,jt=globalThis,_s=jt.trustedTypes,gl=_s?_s.emptyScript:"",bn=jt.reactiveElementPolyfillSupport,Ue=(r,t)=>r,Rr={toAttribute(r,t){switch(t){case Boolean:r=r?gl:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let n=r;switch(t){case Boolean:n=r!==null;break;case Number:n=r===null?null:Number(r);break;case Object:case Array:try{n=JSON.parse(r)}catch{n=null}}return n}},ni=(r,t)=>!hl(r,t),ys={attribute:!0,type:String,converter:Rr,reflect:!1,useDefault:!1,hasChanged:ni};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),jt.litPropertyMetadata??(jt.litPropertyMetadata=new WeakMap);let fe=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=ys){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,n);s!==void 0&&cl(this.prototype,t,s)}}static getPropertyDescriptor(t,n,i){const{get:s,set:l}=ul(this.prototype,t)??{get(){return this[n]},set(h){this[n]=h}};return{get:s,set(h){const u=s==null?void 0:s.call(this);l==null||l.call(this,h),this.requestUpdate(t,u,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ys}static _$Ei(){if(this.hasOwnProperty(Ue("elementProperties")))return;const t=pl(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Ue("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ue("properties"))){const n=this.properties,i=[...dl(n),...fl(n)];for(const s of i)this.createProperty(s,n[s])}const t=this[Symbol.metadata];if(t!==null){const n=litPropertyMetadata.get(t);if(n!==void 0)for(const[i,s]of n)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[n,i]of this.elementProperties){const s=this._$Eu(n,i);s!==void 0&&this._$Eh.set(s,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const n=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)n.unshift(vs(s))}else t!==void 0&&n.push(vs(t));return n}static _$Eu(t,n){const i=n.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(n=>n(this))}addController(t){var n;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((n=t.hostConnected)==null||n.call(t))}removeController(t){var n;(n=this._$EO)==null||n.delete(t)}_$E_(){const t=new Map,n=this.constructor.elementProperties;for(const i of n.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ll(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(n=>{var i;return(i=n.hostConnected)==null?void 0:i.call(n)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(n=>{var i;return(i=n.hostDisconnected)==null?void 0:i.call(n)})}attributeChangedCallback(t,n,i){this._$AK(t,i)}_$ET(t,n){var l;const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const h=(((l=i.converter)==null?void 0:l.toAttribute)!==void 0?i.converter:Rr).toAttribute(n,i.type);this._$Em=t,h==null?this.removeAttribute(s):this.setAttribute(s,h),this._$Em=null}}_$AK(t,n){var l,h;const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const u=i.getPropertyOptions(s),g=typeof u.converter=="function"?{fromAttribute:u.converter}:((l=u.converter)==null?void 0:l.fromAttribute)!==void 0?u.converter:Rr;this._$Em=s;const A=g.fromAttribute(n,u.type);this[s]=A??((h=this._$Ej)==null?void 0:h.get(s))??A,this._$Em=null}}requestUpdate(t,n,i){var s;if(t!==void 0){const l=this.constructor,h=this[t];if(i??(i=l.getPropertyOptions(t)),!((i.hasChanged??ni)(h,n)||i.useDefault&&i.reflect&&h===((s=this._$Ej)==null?void 0:s.get(t))&&!this.hasAttribute(l._$Eu(t,i))))return;this.C(t,n,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:i,reflect:s,wrapped:l},h){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,h??n??this[t]),l!==!0||h!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(n=void 0),this._$AL.set(t,n)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[l,h]of this._$Ep)this[l]=h;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[l,h]of s){const{wrapped:u}=h,g=this[l];u!==!0||this._$AL.has(l)||g===void 0||this.C(l,void 0,h,g)}}let t=!1;const n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),(i=this._$EO)==null||i.forEach(s=>{var l;return(l=s.hostUpdate)==null?void 0:l.call(s)}),this.update(n)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(n)}willUpdate(t){}_$AE(t){var n;(n=this._$EO)==null||n.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(n=>this._$ET(n,this[n]))),this._$EM()}updated(t){}firstUpdated(t){}};fe.elementStyles=[],fe.shadowRootOptions={mode:"open"},fe[Ue("elementProperties")]=new Map,fe[Ue("finalized")]=new Map,bn==null||bn({ReactiveElement:fe}),(jt.reactiveElementVersions??(jt.reactiveElementVersions=[])).push("2.1.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Fe=globalThis,kr=Fe.trustedTypes,ws=kr?kr.createPolicy("lit-html",{createHTML:r=>r}):void 0,To="$lit$",Vt=`lit$${Math.random().toFixed(9).slice(2)}$`,Io="?"+Vt,ml=`<${Io}>`,ie=document,Ge=()=>ie.createComment(""),qe=r=>r===null||typeof r!="object"&&typeof r!="function",ii=Array.isArray,vl=r=>ii(r)||typeof(r==null?void 0:r[Symbol.iterator])=="function",An=`[ 	
\f\r]`,Me=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,bs=/-->/g,As=/>/g,Jt=RegExp(`>|${An}(?:([^\\s"'>=/]+)(${An}*=${An}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Es=/'/g,Ss=/"/g,Co=/^(?:script|style|textarea|title)$/i,_l=r=>(t,...n)=>({_$litType$:r,strings:t,values:n}),lt=_l(1),se=Symbol.for("lit-noChange"),z=Symbol.for("lit-nothing"),Ts=new WeakMap,Zt=ie.createTreeWalker(ie,129);function Po(r,t){if(!ii(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return ws!==void 0?ws.createHTML(t):t}const yl=(r,t)=>{const n=r.length-1,i=[];let s,l=t===2?"<svg>":t===3?"<math>":"",h=Me;for(let u=0;u<n;u++){const g=r[u];let A,T,S=-1,C=0;for(;C<g.length&&(h.lastIndex=C,T=h.exec(g),T!==null);)C=h.lastIndex,h===Me?T[1]==="!--"?h=bs:T[1]!==void 0?h=As:T[2]!==void 0?(Co.test(T[2])&&(s=RegExp("</"+T[2],"g")),h=Jt):T[3]!==void 0&&(h=Jt):h===Jt?T[0]===">"?(h=s??Me,S=-1):T[1]===void 0?S=-2:(S=h.lastIndex-T[2].length,A=T[1],h=T[3]===void 0?Jt:T[3]==='"'?Ss:Es):h===Ss||h===Es?h=Jt:h===bs||h===As?h=Me:(h=Jt,s=void 0);const $=h===Jt&&r[u+1].startsWith("/>")?" ":"";l+=h===Me?g+ml:S>=0?(i.push(A),g.slice(0,S)+To+g.slice(S)+Vt+$):g+Vt+(S===-2?u:$)}return[Po(r,l+(r[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};let Vn=class No{constructor({strings:t,_$litType$:n},i){let s;this.parts=[];let l=0,h=0;const u=t.length-1,g=this.parts,[A,T]=yl(t,n);if(this.el=No.createElement(A,i),Zt.currentNode=this.el.content,n===2||n===3){const S=this.el.content.firstChild;S.replaceWith(...S.childNodes)}for(;(s=Zt.nextNode())!==null&&g.length<u;){if(s.nodeType===1){if(s.hasAttributes())for(const S of s.getAttributeNames())if(S.endsWith(To)){const C=T[h++],$=s.getAttribute(S).split(Vt),D=/([.?@])?(.*)/.exec(C);g.push({type:1,index:l,name:D[2],strings:$,ctor:D[1]==="."?bl:D[1]==="?"?Al:D[1]==="@"?El:Br}),s.removeAttribute(S)}else S.startsWith(Vt)&&(g.push({type:6,index:l}),s.removeAttribute(S));if(Co.test(s.tagName)){const S=s.textContent.split(Vt),C=S.length-1;if(C>0){s.textContent=kr?kr.emptyScript:"";for(let $=0;$<C;$++)s.append(S[$],Ge()),Zt.nextNode(),g.push({type:2,index:++l});s.append(S[C],Ge())}}}else if(s.nodeType===8)if(s.data===Io)g.push({type:2,index:l});else{let S=-1;for(;(S=s.data.indexOf(Vt,S+1))!==-1;)g.push({type:7,index:l}),S+=Vt.length-1}l++}}static createElement(t,n){const i=ie.createElement("template");return i.innerHTML=t,i}};function _e(r,t,n=r,i){var h,u;if(t===se)return t;let s=i!==void 0?(h=n._$Co)==null?void 0:h[i]:n._$Cl;const l=qe(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==l&&((u=s==null?void 0:s._$AO)==null||u.call(s,!1),l===void 0?s=void 0:(s=new l(r),s._$AT(r,n,i)),i!==void 0?(n._$Co??(n._$Co=[]))[i]=s:n._$Cl=s),s!==void 0&&(t=_e(r,s._$AS(r,t.values),s,i)),t}let wl=class{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:n},parts:i}=this._$AD,s=((t==null?void 0:t.creationScope)??ie).importNode(n,!0);Zt.currentNode=s;let l=Zt.nextNode(),h=0,u=0,g=i[0];for(;g!==void 0;){if(h===g.index){let A;g.type===2?A=new Xe(l,l.nextSibling,this,t):g.type===1?A=new g.ctor(l,g.name,g.strings,this,t):g.type===6&&(A=new Sl(l,this,t)),this._$AV.push(A),g=i[++u]}h!==(g==null?void 0:g.index)&&(l=Zt.nextNode(),h++)}return Zt.currentNode=ie,s}p(t){let n=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,n),n+=i.strings.length-2):i._$AI(t[n])),n++}};class Xe{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,n,i,s){this.type=2,this._$AH=z,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const n=this._$AM;return n!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=_e(this,t,n),qe(t)?t===z||t==null||t===""?(this._$AH!==z&&this._$AR(),this._$AH=z):t!==this._$AH&&t!==se&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):vl(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==z&&qe(this._$AH)?this._$AA.nextSibling.data=t:this.T(ie.createTextNode(t)),this._$AH=t}$(t){var l;const{values:n,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Vn.createElement(Po(i.h,i.h[0]),this.options)),i);if(((l=this._$AH)==null?void 0:l._$AD)===s)this._$AH.p(n);else{const h=new wl(s,this),u=h.u(this.options);h.p(n),this.T(u),this._$AH=h}}_$AC(t){let n=Ts.get(t.strings);return n===void 0&&Ts.set(t.strings,n=new Vn(t)),n}k(t){ii(this._$AH)||(this._$AH=[],this._$AR());const n=this._$AH;let i,s=0;for(const l of t)s===n.length?n.push(i=new Xe(this.O(Ge()),this.O(Ge()),this,this.options)):i=n[s],i._$AI(l),s++;s<n.length&&(this._$AR(i&&i._$AB.nextSibling,s),n.length=s)}_$AR(t=this._$AA.nextSibling,n){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,n);t!==this._$AB;){const s=t.nextSibling;t.remove(),t=s}}setConnected(t){var n;this._$AM===void 0&&(this._$Cv=t,(n=this._$AP)==null||n.call(this,t))}}let Br=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,i,s,l){this.type=1,this._$AH=z,this._$AN=void 0,this.element=t,this.name=n,this._$AM=s,this.options=l,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=z}_$AI(t,n=this,i,s){const l=this.strings;let h=!1;if(l===void 0)t=_e(this,t,n,0),h=!qe(t)||t!==this._$AH&&t!==se,h&&(this._$AH=t);else{const u=t;let g,A;for(t=l[0],g=0;g<l.length-1;g++)A=_e(this,u[i+g],n,g),A===se&&(A=this._$AH[g]),h||(h=!qe(A)||A!==this._$AH[g]),A===z?t=z:t!==z&&(t+=(A??"")+l[g+1]),this._$AH[g]=A}h&&!s&&this.j(t)}j(t){t===z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}};class bl extends Br{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===z?void 0:t}}class Al extends Br{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==z)}}let El=class extends Br{constructor(t,n,i,s,l){super(t,n,i,s,l),this.type=5}_$AI(t,n=this){if((t=_e(this,t,n,0)??z)===se)return;const i=this._$AH,s=t===z&&i!==z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,l=t!==z&&(i===z||s);s&&this.element.removeEventListener(this.name,this,i),l&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var n;typeof this._$AH=="function"?this._$AH.call(((n=this.options)==null?void 0:n.host)??this.element,t):this._$AH.handleEvent(t)}};class Sl{constructor(t,n,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){_e(this,t)}}const En=Fe.litHtmlPolyfillSupport;En==null||En(Vn,Xe),(Fe.litHtmlVersions??(Fe.litHtmlVersions=[])).push("3.3.1");const Tl=(r,t,n)=>{const i=(n==null?void 0:n.renderBefore)??t;let s=i._$litPart$;if(s===void 0){const l=(n==null?void 0:n.renderBefore)??null;i._$litPart$=s=new Xe(t.insertBefore(Ge(),l),l,void 0,n??{})}return s._$AI(r),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ee=globalThis;let kt=class extends fe{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var n;const t=super.createRenderRoot();return(n=this.renderOptions).renderBefore??(n.renderBefore=t.firstChild),t}update(t){const n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Tl(n,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return se}};var Eo;kt._$litElement$=!0,kt.finalized=!0,(Eo=ee.litElementHydrateSupport)==null||Eo.call(ee,{LitElement:kt});const Sn=ee.litElementPolyfillSupport;Sn==null||Sn({LitElement:kt});(ee.litElementVersions??(ee.litElementVersions=[])).push("4.2.1");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Je=r=>(t,n)=>{n!==void 0?n.addInitializer(()=>{customElements.define(r,t)}):customElements.define(r,t)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Il={attribute:!0,type:String,converter:Rr,reflect:!1,hasChanged:ni},Cl=(r=Il,t,n)=>{const{kind:i,metadata:s}=n;let l=globalThis.litPropertyMetadata.get(s);if(l===void 0&&globalThis.litPropertyMetadata.set(s,l=new Map),i==="setter"&&((r=Object.create(r)).wrapped=!0),l.set(n.name,r),i==="accessor"){const{name:h}=n;return{set(u){const g=t.get.call(this);t.set.call(this,u),this.requestUpdate(h,g,r)},init(u){return u!==void 0&&this.C(h,void 0,r,u),u}}}if(i==="setter"){const{name:h}=n;return function(u){const g=this[h];t.call(this,u),this.requestUpdate(h,g,r)}}throw Error("Unsupported decorator location: "+i)};function ft(r){return(t,n)=>typeof n=="object"?Cl(r,t,n):((i,s,l)=>{const h=s.hasOwnProperty(l);return s.constructor.createProperty(l,i),h?Object.getOwnPropertyDescriptor(s,l):void 0})(r,t,n)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Wt(r){return ft({...r,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ro=(r,t,n)=>(n.configurable=!0,n.enumerable=!0,Reflect.decorate&&typeof t!="object"&&Object.defineProperty(r,t,n),n);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ko(r,t){return(n,i,s)=>{const l=h=>{var u;return((u=h.renderRoot)==null?void 0:u.querySelector(r))??null};return Ro(n,i,{get(){return l(this)}})}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Pl(r){return(t,n)=>{const{slot:i,selector:s}=r??{},l="slot"+(i?`[name=${i}]`:":not([name])");return Ro(t,n,{get(){var g;const h=(g=this.renderRoot)==null?void 0:g.querySelector(l),u=(h==null?void 0:h.assignedElements(r))??[];return s===void 0?u:u.filter(A=>A.matches(s))}})}}var Nl=Object.defineProperty,Rl=(r,t,n)=>t in r?Nl(r,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):r[t]=n,Tn=(r,t,n)=>(Rl(r,typeof t!="symbol"?t+"":t,n),n),kl=(r,t,n)=>{if(!t.has(r))throw TypeError("Cannot "+n)},In=(r,t)=>{if(Object(t)!==t)throw TypeError('Cannot use the "in" operator on this value');return r.has(t)},_r=(r,t,n)=>{if(t.has(r))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(r):t.set(r,n)},Is=(r,t,n)=>(kl(r,t,"access private method"),n);/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Do(r,t){return Object.is(r,t)}/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */let q=null,Ve=!1,Sr=1;const Dr=Symbol("SIGNAL");function pe(r){const t=q;return q=r,t}function Dl(){return q}function Ol(){return Ve}const si={version:0,lastCleanEpoch:0,dirty:!1,producerNode:void 0,producerLastReadVersion:void 0,producerIndexOfThis:void 0,nextProducerIndex:0,liveConsumerNode:void 0,liveConsumerIndexOfThis:void 0,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function Hr(r){if(Ve)throw new Error(typeof ngDevMode<"u"&&ngDevMode?"Assertion error: signal read during notification phase":"");if(q===null)return;q.consumerOnSignalRead(r);const t=q.nextProducerIndex++;if(ye(q),t<q.producerNode.length&&q.producerNode[t]!==r&&jn(q)){const n=q.producerNode[t];zr(n,q.producerIndexOfThis[t])}q.producerNode[t]!==r&&(q.producerNode[t]=r,q.producerIndexOfThis[t]=jn(q)?$o(r,q,t):0),q.producerLastReadVersion[t]=r.version}function xl(){Sr++}function Oo(r){if(!(!r.dirty&&r.lastCleanEpoch===Sr)){if(!r.producerMustRecompute(r)&&!Fl(r)){r.dirty=!1,r.lastCleanEpoch=Sr;return}r.producerRecomputeValue(r),r.dirty=!1,r.lastCleanEpoch=Sr}}function xo(r){if(r.liveConsumerNode===void 0)return;const t=Ve;Ve=!0;try{for(const n of r.liveConsumerNode)n.dirty||Ll(n)}finally{Ve=t}}function $l(){return(q==null?void 0:q.consumerAllowSignalWrites)!==!1}function Ll(r){var t;r.dirty=!0,xo(r),(t=r.consumerMarkedDirty)==null||t.call(r.wrapper??r)}function Ml(r){return r&&(r.nextProducerIndex=0),pe(r)}function Ul(r,t){if(pe(t),!(!r||r.producerNode===void 0||r.producerIndexOfThis===void 0||r.producerLastReadVersion===void 0)){if(jn(r))for(let n=r.nextProducerIndex;n<r.producerNode.length;n++)zr(r.producerNode[n],r.producerIndexOfThis[n]);for(;r.producerNode.length>r.nextProducerIndex;)r.producerNode.pop(),r.producerLastReadVersion.pop(),r.producerIndexOfThis.pop()}}function Fl(r){ye(r);for(let t=0;t<r.producerNode.length;t++){const n=r.producerNode[t],i=r.producerLastReadVersion[t];if(i!==n.version||(Oo(n),i!==n.version))return!0}return!1}function $o(r,t,n){var i;if(oi(r),ye(r),r.liveConsumerNode.length===0){(i=r.watched)==null||i.call(r.wrapper);for(let s=0;s<r.producerNode.length;s++)r.producerIndexOfThis[s]=$o(r.producerNode[s],r,s)}return r.liveConsumerIndexOfThis.push(n),r.liveConsumerNode.push(t)-1}function zr(r,t){var n;if(oi(r),ye(r),typeof ngDevMode<"u"&&ngDevMode&&t>=r.liveConsumerNode.length)throw new Error(`Assertion error: active consumer index ${t} is out of bounds of ${r.liveConsumerNode.length} consumers)`);if(r.liveConsumerNode.length===1){(n=r.unwatched)==null||n.call(r.wrapper);for(let s=0;s<r.producerNode.length;s++)zr(r.producerNode[s],r.producerIndexOfThis[s])}const i=r.liveConsumerNode.length-1;if(r.liveConsumerNode[t]=r.liveConsumerNode[i],r.liveConsumerIndexOfThis[t]=r.liveConsumerIndexOfThis[i],r.liveConsumerNode.length--,r.liveConsumerIndexOfThis.length--,t<r.liveConsumerNode.length){const s=r.liveConsumerIndexOfThis[t],l=r.liveConsumerNode[t];ye(l),l.producerIndexOfThis[s]=t}}function jn(r){var t;return r.consumerIsAlwaysLive||(((t=r==null?void 0:r.liveConsumerNode)==null?void 0:t.length)??0)>0}function ye(r){r.producerNode??(r.producerNode=[]),r.producerIndexOfThis??(r.producerIndexOfThis=[]),r.producerLastReadVersion??(r.producerLastReadVersion=[])}function oi(r){r.liveConsumerNode??(r.liveConsumerNode=[]),r.liveConsumerIndexOfThis??(r.liveConsumerIndexOfThis=[])}/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */function Lo(r){if(Oo(r),Hr(r),r.value===Bn)throw r.error;return r.value}function Vl(r){const t=Object.create(jl);t.computation=r;const n=()=>Lo(t);return n[Dr]=t,n}const Cn=Symbol("UNSET"),Pn=Symbol("COMPUTING"),Bn=Symbol("ERRORED"),jl={...si,value:Cn,dirty:!0,error:null,equal:Do,producerMustRecompute(r){return r.value===Cn||r.value===Pn},producerRecomputeValue(r){if(r.value===Pn)throw new Error("Detected cycle in computations.");const t=r.value;r.value=Pn;const n=Ml(r);let i,s=!1;try{i=r.computation.call(r.wrapper),s=t!==Cn&&t!==Bn&&r.equal.call(r.wrapper,t,i)}catch(l){i=Bn,r.error=l}finally{Ul(r,n)}if(s){r.value=t;return}r.value=i,r.version++}};/**
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
 */function Wl(r){const t=Object.create(Kl);t.value=r;const n=()=>(Hr(t),t.value);return n[Dr]=t,n}function Gl(){return Hr(this),this.value}function ql(r,t){$l()||zl(),r.equal.call(r.wrapper,r.value,t)||(r.value=t,Xl(r))}const Kl={...si,equal:Do,value:void 0};function Xl(r){r.version++,xl(),xo(r)}/**
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
 */const Z=Symbol("node");var Dt;(r=>{var t,n,i,s;class l{constructor(g,A={}){_r(this,n),Tn(this,t);const S=Wl(g)[Dr];if(this[Z]=S,S.wrapper=this,A){const C=A.equals;C&&(S.equal=C),S.watched=A[r.subtle.watched],S.unwatched=A[r.subtle.unwatched]}}get(){if(!(0,r.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.get");return Gl.call(this[Z])}set(g){if(!(0,r.isState)(this))throw new TypeError("Wrong receiver type for Signal.State.prototype.set");if(Ol())throw new Error("Writes to signals not permitted during Watcher callback");const A=this[Z];ql(A,g)}}t=Z,n=new WeakSet,r.isState=u=>typeof u=="object"&&In(n,u),r.State=l;class h{constructor(g,A){_r(this,s),Tn(this,i);const S=Vl(g)[Dr];if(S.consumerAllowSignalWrites=!0,this[Z]=S,S.wrapper=this,A){const C=A.equals;C&&(S.equal=C),S.watched=A[r.subtle.watched],S.unwatched=A[r.subtle.unwatched]}}get(){if(!(0,r.isComputed)(this))throw new TypeError("Wrong receiver type for Signal.Computed.prototype.get");return Lo(this[Z])}}i=Z,s=new WeakSet,r.isComputed=u=>typeof u=="object"&&In(s,u),r.Computed=h,(u=>{var g,A,T,S;function C(R){let P,N=null;try{N=pe(null),P=R()}finally{pe(N)}return P}u.untrack=C;function $(R){var P;if(!(0,r.isComputed)(R)&&!(0,r.isWatcher)(R))throw new TypeError("Called introspectSources without a Computed or Watcher argument");return((P=R[Z].producerNode)==null?void 0:P.map(N=>N.wrapper))??[]}u.introspectSources=$;function D(R){var P;if(!(0,r.isComputed)(R)&&!(0,r.isState)(R))throw new TypeError("Called introspectSinks without a Signal argument");return((P=R[Z].liveConsumerNode)==null?void 0:P.map(N=>N.wrapper))??[]}u.introspectSinks=D;function B(R){if(!(0,r.isComputed)(R)&&!(0,r.isState)(R))throw new TypeError("Called hasSinks without a Signal argument");const P=R[Z].liveConsumerNode;return P?P.length>0:!1}u.hasSinks=B;function O(R){if(!(0,r.isComputed)(R)&&!(0,r.isWatcher)(R))throw new TypeError("Called hasSources without a Computed or Watcher argument");const P=R[Z].producerNode;return P?P.length>0:!1}u.hasSources=O;class tt{constructor(P){_r(this,A),_r(this,T),Tn(this,g);let N=Object.create(si);N.wrapper=this,N.consumerMarkedDirty=P,N.consumerIsAlwaysLive=!0,N.consumerAllowSignalWrites=!1,N.producerNode=[],this[Z]=N}watch(...P){if(!(0,r.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Is(this,T,S).call(this,P);const N=this[Z];N.dirty=!1;const L=pe(N);for(const v of P)Hr(v[Z]);pe(L)}unwatch(...P){if(!(0,r.isWatcher)(this))throw new TypeError("Called unwatch without Watcher receiver");Is(this,T,S).call(this,P);const N=this[Z];ye(N);for(let L=N.producerNode.length-1;L>=0;L--)if(P.includes(N.producerNode[L].wrapper)){zr(N.producerNode[L],N.producerIndexOfThis[L]);const v=N.producerNode.length-1;if(N.producerNode[L]=N.producerNode[v],N.producerIndexOfThis[L]=N.producerIndexOfThis[v],N.producerNode.length--,N.producerIndexOfThis.length--,N.nextProducerIndex--,L<N.producerNode.length){const d=N.producerIndexOfThis[L],f=N.producerNode[L];oi(f),f.liveConsumerIndexOfThis[d]=L}}}getPending(){if(!(0,r.isWatcher)(this))throw new TypeError("Called getPending without Watcher receiver");return this[Z].producerNode.filter(N=>N.dirty).map(N=>N.wrapper)}}g=Z,A=new WeakSet,T=new WeakSet,S=function(R){for(const P of R)if(!(0,r.isComputed)(P)&&!(0,r.isState)(P))throw new TypeError("Called watch/unwatch without a Computed or State argument")},r.isWatcher=R=>In(A,R),u.Watcher=tt;function J(){var R;return(R=Dl())==null?void 0:R.wrapper}u.currentComputed=J,u.watched=Symbol("watched"),u.unwatched=Symbol("unwatched")})(r.subtle||(r.subtle={}))})(Dt||(Dt={}));/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Jl=Symbol("SignalWatcherBrand"),Yl=new FinalizationRegistry(({watcher:r,signal:t})=>{r.unwatch(t)}),Cs=new WeakMap;function Zl(r){return r[Jl]===!0?(console.warn("SignalWatcher should not be applied to the same class more than once."),r):class extends r{constructor(){super(...arguments),this._$St=new Dt.State(0),this._$Si=!1,this._$So=!0,this._$Sh=new Set}_$Sl(){if(this._$Su!==void 0)return;this._$Sv=new Dt.Computed(()=>{this._$St.get(),super.performUpdate()});const t=this._$Su=new Dt.subtle.Watcher(function(){const n=Cs.get(this);n!==void 0&&(n._$Si===!1&&n.requestUpdate(),this.watch())});Cs.set(t,this),Yl.register(this,{watcher:t,signal:this._$Sv}),t.watch(this._$Sv)}_$Sp(){this._$Su!==void 0&&(this._$Su.unwatch(this._$Sv),this._$Sv=void 0,this._$Su=void 0)}performUpdate(){this.isUpdatePending&&(this._$Sl(),this._$Si=!0,this._$St.set(this._$St.get()+1),this._$Si=!1,this._$Sv.get())}update(t){try{this._$So?(this._$So=!1,super.update(t)):this._$Sh.forEach(n=>n.commit())}finally{this.isUpdatePending=!1,this._$Sh.clear()}}requestUpdate(t,n,i){this._$So=!0,super.requestUpdate(t,n,i)}connectedCallback(){super.connectedCallback(),this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),queueMicrotask(()=>{this.isConnected===!1&&this._$Sp()})}_(t){this._$Sh.add(t);const n=this._$So;this.requestUpdate(),this._$So=n}m(t){this._$Sh.delete(t)}}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ql={ATTRIBUTE:1},th=r=>(...t)=>({_$litDirective$:r,values:t});let eh=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,n,i){this._$Ct=t,this._$AM=n,this._$Ci=i}_$AS(t,n){return this.update(t,n)}update(t,n){return this.render(...n)}};/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Dt.State;Dt.Computed;const I=(r,t)=>new Dt.State(r,t),Q=(r,t)=>new Dt.Computed(r,t),rh="World",nh=I(rh),ih=I(0),sh=I(null);Q(()=>{const r=nh.get();return{name:r,greeting:`Hello, ${r}!`,clickCount:ih.get(),lastInteractionTs:sh.get()}});const oh=I(""),ah=I(null),lh=I("idle"),hh=I(null),ch=I(null);Q(()=>({packageName:oh.get(),packageData:ah.get(),status:lh.get(),lastUpdated:hh.get(),errorMessage:ch.get()}));const uh=["web-components","signals","monorepo"],dh=I(uh[0]),fh=I([]),ph=I("idle"),gh=I(null),mh=I(0),vh=I(null),Mo=I(!1),_h=I(!1);Q(()=>({version:mh.get(),topic:dh.get(),tasks:fh.get(),status:ph.get(),lastUpdated:gh.get(),isAutoRefreshing:_h.get(),errorMessage:vh.get()}));function yh(r){Mo.set(r)}if(typeof globalThis=="object"){const r=globalThis;r.__dfPracticeForcePracticeErrorSetter=yh,r.__dfPracticeGetForcePracticeError=()=>Mo.get()}const wh=[{id:"none",label:"None"},{id:"upload",label:"Upload"},{id:"site",label:"Site"},{id:"add",label:"Add"}],bh=I([]),Ah=I("none"),Eh=I(wh);Q(()=>({options:Eh.get(),selectedId:Ah.get(),disabledIds:bh.get()}));const Sh=I("none"),Th=I(""),Ih=I("Select File to Upload"),Ch=I(!1),Ph=I(0),Nh=I(!1),Rh=I("void");Q(()=>({mode:Sh.get(),linkUrl:Th.get(),fileName:Ih.get(),isUploading:Ch.get(),uploadProgress:Ph.get(),isValid:Nh.get(),mediaType:Rh.get()}));const Hn=I(0),Uo=I(""),Tr=I("idle"),Fo=I(null),zn=I(null),kh=Q(()=>({tokenCount:Hn.get(),documentContent:Uo.get(),status:Tr.get(),lastUpdated:Fo.get(),errorMessage:zn.get()}));function Vo(r){return/^\s*---/.test(r)?r.match(/^\s+---/)?{valid:!1,error:"Frontmatter cannot have leading whitespace. Remove spaces before the opening ---"}:r.match(/\n\n---\s*[\r\n]/)?{valid:!1,error:"Frontmatter has invalid structure (blank lines before closing ---). Remove blank lines within frontmatter"}:/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/.test(r)?{valid:!0}:{valid:!1,error:"Frontmatter is not properly structured. Ensure opening and closing --- are on their own lines with content between them"}:{valid:!0}}function Dh(r){if(!r||typeof r!="string")return"";if(!Vo(r).valid)return null;if(!r.startsWith("---"))return r;const n=/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/,i=r.match(n);return i?i[2]:null}function Oh(r){return!r||typeof r!="string"?0:r.split(/[\s\n\r\t.,!?;:(){}[\]"'`~@#$%^&*+=|\\<>/]+/).filter(n=>n.length>0).length}function xh(r){const t=Dh(r);if(t===null){const n=Vo(r);throw new Error(n.error||"Invalid frontmatter structure")}return Oh(t)}async function $h(r){try{Tr.set("counting"),zn.set(null),Uo.set(r);const t=xh(r);Hn.set(t),Tr.set("ready"),Fo.set(Date.now())}catch(t){const n=t instanceof Error?t.message:"Unknown error";Tr.set("error"),zn.set(n),Hn.set(0)}}/**
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
 */const jo=function(r){const t=[];let n=0;for(let i=0;i<r.length;i++){let s=r.charCodeAt(i);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=s&63|128):(s&64512)===55296&&i+1<r.length&&(r.charCodeAt(i+1)&64512)===56320?(s=65536+((s&1023)<<10)+(r.charCodeAt(++i)&1023),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=s&63|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=s&63|128)}return t},Mh=function(r){const t=[];let n=0,i=0;for(;n<r.length;){const s=r[n++];if(s<128)t[i++]=String.fromCharCode(s);else if(s>191&&s<224){const l=r[n++];t[i++]=String.fromCharCode((s&31)<<6|l&63)}else if(s>239&&s<365){const l=r[n++],h=r[n++],u=r[n++],g=((s&7)<<18|(l&63)<<12|(h&63)<<6|u&63)-65536;t[i++]=String.fromCharCode(55296+(g>>10)),t[i++]=String.fromCharCode(56320+(g&1023))}else{const l=r[n++],h=r[n++];t[i++]=String.fromCharCode((s&15)<<12|(l&63)<<6|h&63)}}return t.join("")},Bo={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,t){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<r.length;s+=3){const l=r[s],h=s+1<r.length,u=h?r[s+1]:0,g=s+2<r.length,A=g?r[s+2]:0,T=l>>2,S=(l&3)<<4|u>>4;let C=(u&15)<<2|A>>6,$=A&63;g||($=64,h||(C=64)),i.push(n[T],n[S],n[C],n[$])}return i.join("")},encodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(r):this.encodeByteArray(jo(r),t)},decodeString(r,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(r):Mh(this.decodeStringToByteArray(r,t))},decodeStringToByteArray(r,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<r.length;){const l=n[r.charAt(s++)],u=s<r.length?n[r.charAt(s)]:0;++s;const A=s<r.length?n[r.charAt(s)]:64;++s;const S=s<r.length?n[r.charAt(s)]:64;if(++s,l==null||u==null||A==null||S==null)throw new Uh;const C=l<<2|u>>4;if(i.push(C),A!==64){const $=u<<4&240|A>>2;if(i.push($),S!==64){const D=A<<6&192|S;i.push(D)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class Uh extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Fh=function(r){const t=jo(r);return Bo.encodeByteArray(t,!0)},Ho=function(r){return Fh(r).replace(/\./g,"")},zo=function(r){try{return Bo.decodeString(r,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
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
 */const jh=()=>Vh().__FIREBASE_DEFAULTS__,Bh=()=>{if(typeof process>"u"||typeof Ps>"u")return;const r=Ps.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},Hh=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=r&&zo(r[1]);return t&&JSON.parse(t)},zh=()=>{try{return Lh()||jh()||Bh()||Hh()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Wh=r=>{var t;return(t=zh())===null||t===void 0?void 0:t[`_${r}`]};/**
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
 */function Wo(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}/**
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
 */function At(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Gh(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(At())}function qh(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Kh(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function Xh(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Jh(){try{return typeof indexedDB=="object"}catch{return!1}}function Yh(){return new Promise((r,t)=>{try{let n=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(i),r(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var l;t(((l=s.error)===null||l===void 0?void 0:l.message)||"")}}catch(n){t(n)}})}/**
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
 */const Zh="FirebaseError";class xt extends Error{constructor(t,n,i){super(n),this.code=t,this.customData=i,this.name=Zh,Object.setPrototypeOf(this,xt.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ye.prototype.create)}}class Ye{constructor(t,n,i){this.service=t,this.serviceName=n,this.errors=i}create(t,...n){const i=n[0]||{},s=`${this.service}/${t}`,l=this.errors[t],h=l?Qh(l,i):"Error",u=`${this.serviceName}: ${h} (${s}).`;return new xt(s,u,i)}}function Qh(r,t){return r.replace(tc,(n,i)=>{const s=t[i];return s!=null?String(s):`<${i}?>`})}const tc=/\{\$([^}]+)}/g;/**
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
 */function Go(r){const t=[];for(const[n,i]of Object.entries(r))Array.isArray(i)?i.forEach(s=>{t.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(n)+"="+encodeURIComponent(i));return t.length?"&"+t.join("&"):""}function ec(r,t){const n=new rc(r,t);return n.subscribe.bind(n)}class rc{constructor(t,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{t(this)}).catch(i=>{this.error(i)})}next(t){this.forEachObserver(n=>{n.next(t)})}error(t){this.forEachObserver(n=>{n.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,n,i){let s;if(t===void 0&&n===void 0&&i===void 0)throw new Error("Missing Observer.");nc(t,["next","error","complete"])?s=t:s={next:t,error:n,complete:i},s.next===void 0&&(s.next=Nn),s.error===void 0&&(s.error=Nn),s.complete===void 0&&(s.complete=Nn);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),l}unsubscribeOne(t){this.observers===void 0||this.observers[t]===void 0||(delete this.observers[t],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,t)}sendOne(t,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[t]!==void 0)try{n(this.observers[t])}catch(i){typeof console<"u"&&console.error&&console.error(i)}})}close(t){this.finalized||(this.finalized=!0,t!==void 0&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function nc(r,t){if(typeof r!="object"||r===null)return!1;for(const n of t)if(n in r&&typeof r[n]=="function")return!0;return!1}function Nn(){}/**
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
 */function Wr(r){return r&&r._delegate?r._delegate:r}class Ht{constructor(t,n,i){this.name=t,this.instanceFactory=n,this.type=i,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
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
 */var j;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(j||(j={}));const ic={debug:j.DEBUG,verbose:j.VERBOSE,info:j.INFO,warn:j.WARN,error:j.ERROR,silent:j.SILENT},sc=j.INFO,oc={[j.DEBUG]:"log",[j.VERBOSE]:"log",[j.INFO]:"info",[j.WARN]:"warn",[j.ERROR]:"error"},ac=(r,t,...n)=>{if(t<r.logLevel)return;const i=new Date().toISOString(),s=oc[t];if(s)console[s](`[${i}]  ${r.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class ai{constructor(t){this.name=t,this._logLevel=sc,this._logHandler=ac,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in j))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?ic[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,j.DEBUG,...t),this._logHandler(this,j.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,j.VERBOSE,...t),this._logHandler(this,j.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,j.INFO,...t),this._logHandler(this,j.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,j.WARN,...t),this._logHandler(this,j.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,j.ERROR,...t),this._logHandler(this,j.ERROR,...t)}}const lc=(r,t)=>t.some(n=>r instanceof n);let Ns,Rs;function hc(){return Ns||(Ns=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cc(){return Rs||(Rs=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const qo=new WeakMap,Wn=new WeakMap,Ko=new WeakMap,Rn=new WeakMap,li=new WeakMap;function uc(r){const t=new Promise((n,i)=>{const s=()=>{r.removeEventListener("success",l),r.removeEventListener("error",h)},l=()=>{n(Bt(r.result)),s()},h=()=>{i(r.error),s()};r.addEventListener("success",l),r.addEventListener("error",h)});return t.then(n=>{n instanceof IDBCursor&&qo.set(n,r)}).catch(()=>{}),li.set(t,r),t}function dc(r){if(Wn.has(r))return;const t=new Promise((n,i)=>{const s=()=>{r.removeEventListener("complete",l),r.removeEventListener("error",h),r.removeEventListener("abort",h)},l=()=>{n(),s()},h=()=>{i(r.error||new DOMException("AbortError","AbortError")),s()};r.addEventListener("complete",l),r.addEventListener("error",h),r.addEventListener("abort",h)});Wn.set(r,t)}let Gn={get(r,t,n){if(r instanceof IDBTransaction){if(t==="done")return Wn.get(r);if(t==="objectStoreNames")return r.objectStoreNames||Ko.get(r);if(t==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Bt(r[t])},set(r,t,n){return r[t]=n,!0},has(r,t){return r instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in r}};function fc(r){Gn=r(Gn)}function pc(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...n){const i=r.call(kn(this),t,...n);return Ko.set(i,t.sort?t.sort():[t]),Bt(i)}:cc().includes(r)?function(...t){return r.apply(kn(this),t),Bt(qo.get(this))}:function(...t){return Bt(r.apply(kn(this),t))}}function gc(r){return typeof r=="function"?pc(r):(r instanceof IDBTransaction&&dc(r),lc(r,hc())?new Proxy(r,Gn):r)}function Bt(r){if(r instanceof IDBRequest)return uc(r);if(Rn.has(r))return Rn.get(r);const t=gc(r);return t!==r&&(Rn.set(r,t),li.set(t,r)),t}const kn=r=>li.get(r);function mc(r,t,{blocked:n,upgrade:i,blocking:s,terminated:l}={}){const h=indexedDB.open(r,t),u=Bt(h);return i&&h.addEventListener("upgradeneeded",g=>{i(Bt(h.result),g.oldVersion,g.newVersion,Bt(h.transaction),g)}),n&&h.addEventListener("blocked",g=>n(g.oldVersion,g.newVersion,g)),u.then(g=>{l&&g.addEventListener("close",()=>l()),s&&g.addEventListener("versionchange",A=>s(A.oldVersion,A.newVersion,A))}).catch(()=>{}),u}const vc=["get","getKey","getAll","getAllKeys","count"],_c=["put","add","delete","clear"],Dn=new Map;function ks(r,t){if(!(r instanceof IDBDatabase&&!(t in r)&&typeof t=="string"))return;if(Dn.get(t))return Dn.get(t);const n=t.replace(/FromIndex$/,""),i=t!==n,s=_c.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!(s||vc.includes(n)))return;const l=async function(h,...u){const g=this.transaction(h,s?"readwrite":"readonly");let A=g.store;return i&&(A=A.index(u.shift())),(await Promise.all([A[n](...u),s&&g.done]))[0]};return Dn.set(t,l),l}fc(r=>({...r,get:(t,n,i)=>ks(t,n)||r.get(t,n,i),has:(t,n)=>!!ks(t,n)||r.has(t,n)}));/**
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
 */class yc{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(wc(n)){const i=n.getImmediate();return`${i.library}/${i.version}`}else return null}).filter(n=>n).join(" ")}}function wc(r){const t=r.getComponent();return(t==null?void 0:t.type)==="VERSION"}const qn="@firebase/app",Ds="0.13.2";/**
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
 */const Ot=new ai("@firebase/app"),bc="@firebase/app-compat",Ac="@firebase/analytics-compat",Ec="@firebase/analytics",Sc="@firebase/app-check-compat",Tc="@firebase/app-check",Ic="@firebase/auth",Cc="@firebase/auth-compat",Pc="@firebase/database",Nc="@firebase/data-connect",Rc="@firebase/database-compat",kc="@firebase/functions",Dc="@firebase/functions-compat",Oc="@firebase/installations",xc="@firebase/installations-compat",$c="@firebase/messaging",Lc="@firebase/messaging-compat",Mc="@firebase/performance",Uc="@firebase/performance-compat",Fc="@firebase/remote-config",Vc="@firebase/remote-config-compat",jc="@firebase/storage",Bc="@firebase/storage-compat",Hc="@firebase/firestore",zc="@firebase/ai",Wc="@firebase/firestore-compat",Gc="firebase",qc="11.10.0",Kc={[qn]:"fire-core",[bc]:"fire-core-compat",[Ec]:"fire-analytics",[Ac]:"fire-analytics-compat",[Tc]:"fire-app-check",[Sc]:"fire-app-check-compat",[Ic]:"fire-auth",[Cc]:"fire-auth-compat",[Pc]:"fire-rtdb",[Nc]:"fire-data-connect",[Rc]:"fire-rtdb-compat",[kc]:"fire-fn",[Dc]:"fire-fn-compat",[Oc]:"fire-iid",[xc]:"fire-iid-compat",[$c]:"fire-fcm",[Lc]:"fire-fcm-compat",[Mc]:"fire-perf",[Uc]:"fire-perf-compat",[Fc]:"fire-rc",[Vc]:"fire-rc-compat",[jc]:"fire-gcs",[Bc]:"fire-gcs-compat",[Hc]:"fire-fst",[Wc]:"fire-fst-compat",[zc]:"fire-vertex","fire-js":"fire-js",[Gc]:"fire-js-all"};/**
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
 */const Xc=new Map,Jc=new Map,Os=new Map;function xs(r,t){try{r.container.addComponent(t)}catch(n){Ot.debug(`Component ${t.name} failed to register with FirebaseApp ${r.name}`,n)}}function zt(r){const t=r.name;if(Os.has(t))return Ot.debug(`There were multiple attempts to register component ${t}.`),!1;Os.set(t,r);for(const n of Xc.values())xs(n,r);for(const n of Jc.values())xs(n,r);return!0}function Nt(r){return r==null?!1:r.settings!==void 0}/**
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
 */const Yc={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},hi=new Ye("app","Firebase",Yc);/**
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
 */const Ze=qc;function dt(r,t,n){var i;let s=(i=Kc[r])!==null&&i!==void 0?i:r;n&&(s+=`-${n}`);const l=s.match(/\s|\//),h=t.match(/\s|\//);if(l||h){const u=[`Unable to register library "${s}" with version "${t}":`];l&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),l&&h&&u.push("and"),h&&u.push(`version name "${t}" contains illegal characters (whitespace or "/")`),Ot.warn(u.join(" "));return}zt(new Ht(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}/**
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
 */const Zc="firebase-heartbeat-database",Qc=1,Ke="firebase-heartbeat-store";let On=null;function Xo(){return On||(On=mc(Zc,Qc,{upgrade:(r,t)=>{switch(t){case 0:try{r.createObjectStore(Ke)}catch(n){console.warn(n)}}}}).catch(r=>{throw hi.create("idb-open",{originalErrorMessage:r.message})})),On}async function tu(r){try{const n=(await Xo()).transaction(Ke),i=await n.objectStore(Ke).get(Jo(r));return await n.done,i}catch(t){if(t instanceof xt)Ot.warn(t.message);else{const n=hi.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});Ot.warn(n.message)}}}async function $s(r,t){try{const i=(await Xo()).transaction(Ke,"readwrite");await i.objectStore(Ke).put(t,Jo(r)),await i.done}catch(n){if(n instanceof xt)Ot.warn(n.message);else{const i=hi.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Ot.warn(i.message)}}}function Jo(r){return`${r.name}!${r.options.appId}`}/**
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
 */const eu=1024,ru=30;class nu{constructor(t){this.container=t,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new su(n),this._heartbeatsCachePromise=this._storage.read().then(i=>(this._heartbeatsCache=i,i))}async triggerHeartbeat(){var t,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Ls();if(((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:s}),this._heartbeatsCache.heartbeats.length>ru){const h=ou(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(h,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(i){Ot.warn(i)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=Ls(),{heartbeatsToSend:i,unsentEntries:s}=iu(this._heartbeatsCache.heartbeats),l=Ho(JSON.stringify({version:2,heartbeats:i}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(n){return Ot.warn(n),""}}}function Ls(){return new Date().toISOString().substring(0,10)}function iu(r,t=eu){const n=[];let i=r.slice();for(const s of r){const l=n.find(h=>h.agent===s.agent);if(l){if(l.dates.push(s.date),Ms(n)>t){l.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),Ms(n)>t){n.pop();break}i=i.slice(1)}return{heartbeatsToSend:n,unsentEntries:i}}class su{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Jh()?Yh().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await tu(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return $s(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return $s(this.app,{lastSentHeartbeatDate:(n=t.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}}function Ms(r){return Ho(JSON.stringify({version:2,heartbeats:r})).length}function ou(r){if(r.length===0)return-1;let t=0,n=r[0].date;for(let i=1;i<r.length;i++)r[i].date<n&&(n=r[i].date,t=i);return t}/**
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
 */function au(r){zt(new Ht("platform-logger",t=>new yc(t),"PRIVATE")),zt(new Ht("heartbeat",t=>new nu(t),"PRIVATE")),dt(qn,Ds,r),dt(qn,Ds,"esm2017"),dt("fire-js","")}au("");function Yo(r,t){var n={};for(var i in r)Object.prototype.hasOwnProperty.call(r,i)&&t.indexOf(i)<0&&(n[i]=r[i]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,i=Object.getOwnPropertySymbols(r);s<i.length;s++)t.indexOf(i[s])<0&&Object.prototype.propertyIsEnumerable.call(r,i[s])&&(n[i[s]]=r[i[s]]);return n}function X(r,t,n,i){var s=arguments.length,l=s<3?t:i===null?i=Object.getOwnPropertyDescriptor(t,n):i,h;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")l=Reflect.decorate(r,t,n,i);else for(var u=r.length-1;u>=0;u--)(h=r[u])&&(l=(s<3?h(l):s>3?h(t,n,l):h(t,n))||l);return s>3&&l&&Object.defineProperty(t,n,l),l}function Zo(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const lu=Zo,Qo=new Ye("auth","Firebase",Zo());/**
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
 */const Or=new ai("@firebase/auth");function hu(r,...t){Or.logLevel<=j.WARN&&Or.warn(`Auth (${Ze}): ${r}`,...t)}function Ir(r,...t){Or.logLevel<=j.ERROR&&Or.error(`Auth (${Ze}): ${r}`,...t)}/**
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
 */function Us(r,...t){throw ci(r,...t)}function ta(r,...t){return ci(r,...t)}function ea(r,t,n){const i=Object.assign(Object.assign({},lu()),{[t]:n});return new Ye("auth","Firebase",i).create(t,{appName:r.name})}function Cr(r){return ea(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function ci(r,...t){if(typeof r!="string"){const n=t[0],i=[...t.slice(1)];return i[0]&&(i[0].appName=r.name),r._errorFactory.create(n,...i)}return Qo.create(r,...t)}function U(r,t,...n){if(!r)throw ci(t,...n)}function je(r){const t="INTERNAL ASSERTION FAILED: "+r;throw Ir(t),new Error(t)}function xr(r,t){r||je(t)}function cu(){return Fs()==="http:"||Fs()==="https:"}function Fs(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
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
 */function uu(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(cu()||Kh()||"connection"in navigator)?navigator.onLine:!0}function du(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
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
 */class Qe{constructor(t,n){this.shortDelay=t,this.longDelay=n,xr(n>t,"Short delay should be less than long delay!"),this.isMobile=Gh()||Xh()}get(){return uu()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function fu(r,t){xr(r.emulator,"Emulator should always be set here");const{url:n}=r.emulator;return t?`${n}${t.startsWith("/")?t.slice(1):t}`:n}/**
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
 */class ra{static initialize(t,n,i){this.fetchImpl=t,n&&(this.headersImpl=n),i&&(this.responseImpl=i)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;je("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;je("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;je("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const gu=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],mu=new Qe(3e4,6e4);function na(r,t){return r.tenantId&&!t.tenantId?Object.assign(Object.assign({},t),{tenantId:r.tenantId}):t}async function Gr(r,t,n,i,s={}){return ia(r,s,async()=>{let l={},h={};i&&(t==="GET"?h=i:l={body:JSON.stringify(i)});const u=Go(Object.assign({key:r.config.apiKey},h)).slice(1),g=await r._getAdditionalHeaders();g["Content-Type"]="application/json",r.languageCode&&(g["X-Firebase-Locale"]=r.languageCode);const A=Object.assign({method:t,headers:g},l);return qh()||(A.referrerPolicy="no-referrer"),r.emulatorConfig&&Wo(r.emulatorConfig.host)&&(A.credentials="include"),ra.fetch()(await sa(r,r.config.apiHost,n,u),A)})}async function ia(r,t,n){r._canInitEmulator=!1;const i=Object.assign(Object.assign({},pu),t);try{const s=new vu(r),l=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw yr(r,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const u=l.ok?h.errorMessage:h.error.message,[g,A]=u.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw yr(r,"credential-already-in-use",h);if(g==="EMAIL_EXISTS")throw yr(r,"email-already-in-use",h);if(g==="USER_DISABLED")throw yr(r,"user-disabled",h);const T=i[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(A)throw ea(r,T,A);Us(r,T)}}catch(s){if(s instanceof xt)throw s;Us(r,"network-request-failed",{message:String(s)})}}async function sa(r,t,n,i){const s=`${t}${n}?${i}`,l=r,h=l.config.emulator?fu(r.config,s):`${r.config.apiScheme}://${s}`;return gu.includes(n)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(h).toString():h}class vu{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(t){this.auth=t,this.timer=null,this.promise=new Promise((n,i)=>{this.timer=setTimeout(()=>i(ta(this.auth,"network-request-failed")),mu.get())})}}function yr(r,t,n){const i={appName:r.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);const s=ta(r,t,i);return s.customData._tokenResponse=n,s}/**
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
 */async function _u(r,t){return Gr(r,"POST","/v1/accounts:delete",t)}async function $r(r,t){return Gr(r,"POST","/v1/accounts:lookup",t)}/**
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
 */function Be(r){if(r)try{const t=new Date(Number(r));if(!isNaN(t.getTime()))return t.toUTCString()}catch{}}async function yu(r,t=!1){const n=Wr(r),i=await n.getIdToken(t),s=oa(i);U(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const l=typeof s.firebase=="object"?s.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:s,token:i,authTime:Be(xn(s.auth_time)),issuedAtTime:Be(xn(s.iat)),expirationTime:Be(xn(s.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function xn(r){return Number(r)*1e3}function oa(r){const[t,n,i]=r.split(".");if(t===void 0||n===void 0||i===void 0)return Ir("JWT malformed, contained fewer than 3 sections"),null;try{const s=zo(n);return s?JSON.parse(s):(Ir("Failed to decode base64 JWT payload"),null)}catch(s){return Ir("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Vs(r){const t=oa(r);return U(t,"internal-error"),U(typeof t.exp<"u","internal-error"),U(typeof t.iat<"u","internal-error"),Number(t.exp)-Number(t.iat)}/**
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
 */async function Kn(r,t,n=!1){if(n)return t;try{return await t}catch(i){throw i instanceof xt&&wu(i)&&r.auth.currentUser===r&&await r.auth.signOut(),i}}function wu({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
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
 */class bu{constructor(t){this.user=t,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(t){var n;if(t){const i=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),i}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(t=!1){if(!this.isRunning)return;const n=this.getInterval(t);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(t){(t==null?void 0:t.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Xn{constructor(t,n){this.createdAt=t,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Be(this.lastLoginAt),this.creationTime=Be(this.createdAt)}_copy(t){this.createdAt=t.createdAt,this.lastLoginAt=t.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function Lr(r){var t;const n=r.auth,i=await r.getIdToken(),s=await Kn(r,$r(n,{idToken:i}));U(s==null?void 0:s.users.length,n,"internal-error");const l=s.users[0];r._notifyReloadListener(l);const h=!((t=l.providerUserInfo)===null||t===void 0)&&t.length?aa(l.providerUserInfo):[],u=Eu(r.providerData,h),g=r.isAnonymous,A=!(r.email&&l.passwordHash)&&!(u!=null&&u.length),T=g?A:!1,S={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:u,metadata:new Xn(l.createdAt,l.lastLoginAt),isAnonymous:T};Object.assign(r,S)}async function Au(r){const t=Wr(r);await Lr(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}function Eu(r,t){return[...r.filter(i=>!t.some(s=>s.providerId===i.providerId)),...t]}function aa(r){return r.map(t=>{var{providerId:n}=t,i=Yo(t,["providerId"]);return{providerId:n,uid:i.rawId||"",displayName:i.displayName||null,email:i.email||null,phoneNumber:i.phoneNumber||null,photoURL:i.photoUrl||null}})}/**
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
 */async function Su(r,t){const n=await ia(r,{},async()=>{const i=Go({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:s,apiKey:l}=r.config,h=await sa(r,s,"/v1/token",`key=${l}`),u=await r._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const g={method:"POST",headers:u,body:i};return r.emulatorConfig&&Wo(r.emulatorConfig.host)&&(g.credentials="include"),ra.fetch()(h,g)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Tu(r,t){return Gr(r,"POST","/v2/accounts:revokeToken",na(r,t))}/**
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
 */class ge{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(t){U(t.idToken,"internal-error"),U(typeof t.idToken<"u","internal-error"),U(typeof t.refreshToken<"u","internal-error");const n="expiresIn"in t&&typeof t.expiresIn<"u"?Number(t.expiresIn):Vs(t.idToken);this.updateTokensAndExpiration(t.idToken,t.refreshToken,n)}updateFromIdToken(t){U(t.length!==0,"internal-error");const n=Vs(t);this.updateTokensAndExpiration(t,null,n)}async getToken(t,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(U(this.refreshToken,t,"user-token-expired"),this.refreshToken?(await this.refresh(t,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(t,n){const{accessToken:i,refreshToken:s,expiresIn:l}=await Su(t,n);this.updateTokensAndExpiration(i,s,Number(l))}updateTokensAndExpiration(t,n,i){this.refreshToken=n||null,this.accessToken=t||null,this.expirationTime=Date.now()+i*1e3}static fromJSON(t,n){const{refreshToken:i,accessToken:s,expirationTime:l}=n,h=new ge;return i&&(U(typeof i=="string","internal-error",{appName:t}),h.refreshToken=i),s&&(U(typeof s=="string","internal-error",{appName:t}),h.accessToken=s),l&&(U(typeof l=="number","internal-error",{appName:t}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(t){this.accessToken=t.accessToken,this.refreshToken=t.refreshToken,this.expirationTime=t.expirationTime}_clone(){return Object.assign(new ge,this.toJSON())}_performRefresh(){return je("not implemented")}}/**
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
 */function Ft(r,t){U(typeof r=="string"||typeof r>"u","internal-error",{appName:t})}class wt{constructor(t){var{uid:n,auth:i,stsTokenManager:s}=t,l=Yo(t,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new bu(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=i,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new Xn(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(t){const n=await Kn(this,this.stsTokenManager.getToken(this.auth,t));return U(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(t){return yu(this,t)}reload(){return Au(this)}_assign(t){this!==t&&(U(this.uid===t.uid,this.auth,"internal-error"),this.displayName=t.displayName,this.photoURL=t.photoURL,this.email=t.email,this.emailVerified=t.emailVerified,this.phoneNumber=t.phoneNumber,this.isAnonymous=t.isAnonymous,this.tenantId=t.tenantId,this.providerData=t.providerData.map(n=>Object.assign({},n)),this.metadata._copy(t.metadata),this.stsTokenManager._assign(t.stsTokenManager))}_clone(t){const n=new wt(Object.assign(Object.assign({},this),{auth:t,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(t){U(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=t,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(t){this.reloadListener?this.reloadListener(t):this.reloadUserInfo=t}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(t,n=!1){let i=!1;t.idToken&&t.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(t),i=!0),n&&await Lr(this),await this.auth._persistUserIfCurrent(this),i&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Nt(this.auth.app))return Promise.reject(Cr(this.auth));const t=await this.getIdToken();return await Kn(this,_u(this.auth,{idToken:t})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(t=>Object.assign({},t)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(t,n){var i,s,l,h,u,g,A,T;const S=(i=n.displayName)!==null&&i!==void 0?i:void 0,C=(s=n.email)!==null&&s!==void 0?s:void 0,$=(l=n.phoneNumber)!==null&&l!==void 0?l:void 0,D=(h=n.photoURL)!==null&&h!==void 0?h:void 0,B=(u=n.tenantId)!==null&&u!==void 0?u:void 0,O=(g=n._redirectEventId)!==null&&g!==void 0?g:void 0,tt=(A=n.createdAt)!==null&&A!==void 0?A:void 0,J=(T=n.lastLoginAt)!==null&&T!==void 0?T:void 0,{uid:R,emailVerified:P,isAnonymous:N,providerData:L,stsTokenManager:v}=n;U(R&&v,t,"internal-error");const d=ge.fromJSON(this.name,v);U(typeof R=="string",t,"internal-error"),Ft(S,t.name),Ft(C,t.name),U(typeof P=="boolean",t,"internal-error"),U(typeof N=="boolean",t,"internal-error"),Ft($,t.name),Ft(D,t.name),Ft(B,t.name),Ft(O,t.name),Ft(tt,t.name),Ft(J,t.name);const f=new wt({uid:R,auth:t,email:C,emailVerified:P,displayName:S,isAnonymous:N,photoURL:D,phoneNumber:$,tenantId:B,stsTokenManager:d,createdAt:tt,lastLoginAt:J});return L&&Array.isArray(L)&&(f.providerData=L.map(m=>Object.assign({},m))),O&&(f._redirectEventId=O),f}static async _fromIdTokenResponse(t,n,i=!1){const s=new ge;s.updateFromServerResponse(n);const l=new wt({uid:n.localId,auth:t,stsTokenManager:s,isAnonymous:i});return await Lr(l),l}static async _fromGetAccountInfoResponse(t,n,i){const s=n.users[0];U(s.localId!==void 0,"internal-error");const l=s.providerUserInfo!==void 0?aa(s.providerUserInfo):[],h=!(s.email&&s.passwordHash)&&!(l!=null&&l.length),u=new ge;u.updateFromIdToken(i);const g=new wt({uid:s.localId,auth:t,stsTokenManager:u,isAnonymous:h}),A={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new Xn(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(l!=null&&l.length)};return Object.assign(g,A),g}}/**
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
 */const js=new Map;function Qt(r){xr(r instanceof Function,"Expected a class definition");let t=js.get(r);return t?(xr(t instanceof r,"Instance stored in cache mismatched with class"),t):(t=new r,js.set(r,t),t)}/**
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
 */class la{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(t,n){this.storage[t]=n}async _get(t){const n=this.storage[t];return n===void 0?null:n}async _remove(t){delete this.storage[t]}_addListener(t,n){}_removeListener(t,n){}}la.type="NONE";const Bs=la;/**
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
 */function $n(r,t,n){return`firebase:${r}:${t}:${n}`}class me{constructor(t,n,i){this.persistence=t,this.auth=n,this.userKey=i;const{config:s,name:l}=this.auth;this.fullUserKey=$n(this.userKey,s.apiKey,l),this.fullPersistenceKey=$n("persistence",s.apiKey,l),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(t){return this.persistence._set(this.fullUserKey,t.toJSON())}async getCurrentUser(){const t=await this.persistence._get(this.fullUserKey);if(!t)return null;if(typeof t=="string"){const n=await $r(this.auth,{idToken:t}).catch(()=>{});return n?wt._fromGetAccountInfoResponse(this.auth,n,t):null}return wt._fromJSON(this.auth,t)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(t){if(this.persistence===t)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=t,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(t,n,i="authUser"){if(!n.length)return new me(Qt(Bs),t,i);const s=(await Promise.all(n.map(async A=>{if(await A._isAvailable())return A}))).filter(A=>A);let l=s[0]||Qt(Bs);const h=$n(i,t.config.apiKey,t.name);let u=null;for(const A of n)try{const T=await A._get(h);if(T){let S;if(typeof T=="string"){const C=await $r(t,{idToken:T}).catch(()=>{});if(!C)break;S=await wt._fromGetAccountInfoResponse(t,C,T)}else S=wt._fromJSON(t,T);A!==l&&(u=S),l=A;break}}catch{}const g=s.filter(A=>A._shouldAllowMigration);return!l._shouldAllowMigration||!g.length?new me(l,t,i):(l=g[0],u&&await l._set(h,u.toJSON()),await Promise.all(n.map(async A=>{if(A!==l)try{await A._remove(h)}catch{}})),new me(l,t,i))}}/**
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
 */function Hs(r){const t=r.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(Nu(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(Iu(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(ku(t))return"Blackberry";if(Du(t))return"Webos";if(Cu(t))return"Safari";if((t.includes("chrome/")||Pu(t))&&!t.includes("edge/"))return"Chrome";if(Ru(t))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,i=r.match(n);if((i==null?void 0:i.length)===2)return i[1]}return"Other"}function Iu(r=At()){return/firefox\//i.test(r)}function Cu(r=At()){const t=r.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function Pu(r=At()){return/crios\//i.test(r)}function Nu(r=At()){return/iemobile/i.test(r)}function Ru(r=At()){return/android/i.test(r)}function ku(r=At()){return/blackberry/i.test(r)}function Du(r=At()){return/webos/i.test(r)}/**
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
 */function ha(r,t=[]){let n;switch(r){case"Browser":n=Hs(At());break;case"Worker":n=`${Hs(At())}-${r}`;break;default:n=r}const i=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ze}/${i}`}/**
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
 */class Ou{constructor(t){this.auth=t,this.queue=[]}pushCallback(t,n){const i=l=>new Promise((h,u)=>{try{const g=t(l);h(g)}catch(g){u(g)}});i.onAbort=n,this.queue.push(i);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(t){if(this.auth.currentUser===t)return;const n=[];try{for(const i of this.queue)await i(t),i.onAbort&&n.push(i.onAbort)}catch(i){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:i==null?void 0:i.message})}}}/**
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
 */async function xu(r,t={}){return Gr(r,"GET","/v2/passwordPolicy",na(r,t))}/**
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
 */const $u=6;class Lu{constructor(t){var n,i,s,l;const h=t.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=h.minPasswordLength)!==null&&n!==void 0?n:$u,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=t.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(i=t.allowedNonAlphanumericCharacters)===null||i===void 0?void 0:i.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(l=t.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=t.schemaVersion}validatePassword(t){var n,i,s,l,h,u;const g={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(t,g),this.validatePasswordCharacterOptions(t,g),g.isValid&&(g.isValid=(n=g.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),g.isValid&&(g.isValid=(i=g.meetsMaxPasswordLength)!==null&&i!==void 0?i:!0),g.isValid&&(g.isValid=(s=g.containsLowercaseLetter)!==null&&s!==void 0?s:!0),g.isValid&&(g.isValid=(l=g.containsUppercaseLetter)!==null&&l!==void 0?l:!0),g.isValid&&(g.isValid=(h=g.containsNumericCharacter)!==null&&h!==void 0?h:!0),g.isValid&&(g.isValid=(u=g.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),g}validatePasswordLengthOptions(t,n){const i=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;i&&(n.meetsMinPasswordLength=t.length>=i),s&&(n.meetsMaxPasswordLength=t.length<=s)}validatePasswordCharacterOptions(t,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let i;for(let s=0;s<t.length;s++)i=t.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,i>="a"&&i<="z",i>="A"&&i<="Z",i>="0"&&i<="9",this.allowedNonAlphanumericCharacters.includes(i))}updatePasswordCharacterOptionsStatuses(t,n,i,s,l){this.customStrengthOptions.containsLowercaseLetter&&(t.containsLowercaseLetter||(t.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(t.containsUppercaseLetter||(t.containsUppercaseLetter=i)),this.customStrengthOptions.containsNumericCharacter&&(t.containsNumericCharacter||(t.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(t.containsNonAlphanumericCharacter||(t.containsNonAlphanumericCharacter=l))}}/**
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
 */class Mu{constructor(t,n,i,s){this.app=t,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=i,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new zs(this),this.idTokenSubscription=new zs(this),this.beforeStateQueue=new Ou(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Qo,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=t.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(t,n){return n&&(this._popupRedirectResolver=Qt(n)),this._initializationPromise=this.queue(async()=>{var i,s,l;if(!this._deleted&&(this.persistenceManager=await me.create(this,t),(i=this._resolvePersistenceManagerAvailable)===null||i===void 0||i.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((l=this.currentUser)===null||l===void 0?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const t=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!t)){if(this.currentUser&&t&&this.currentUser.uid===t.uid){this._currentUser._assign(t),await this.currentUser.getIdToken();return}await this._updateCurrentUser(t,!0)}}async initializeCurrentUserFromIdToken(t){try{const n=await $r(this,{idToken:t}),i=await wt._fromGetAccountInfoResponse(this,n,t);await this.directlySetCurrentUser(i)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(t){var n;if(Nt(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(u,u))}):this.directlySetCurrentUser(null)}const i=await this.assertedPersistence.getCurrentUser();let s=i,l=!1;if(t&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,u=s==null?void 0:s._redirectEventId,g=await this.tryRedirectSignIn(t);(!h||h===u)&&(g!=null&&g.user)&&(s=g.user,l=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(s)}catch(h){s=i,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return U(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(t){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,t,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(t){try{await Lr(t)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(t)}useDeviceLanguage(){this.languageCode=du()}async _delete(){this._deleted=!0}async updateCurrentUser(t){if(Nt(this.app))return Promise.reject(Cr(this));const n=t?Wr(t):null;return n&&U(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(t,n=!1){if(!this._deleted)return t&&U(this.tenantId===t.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(t),this.queue(async()=>{await this.directlySetCurrentUser(t),this.notifyAuthListeners()})}async signOut(){return Nt(this.app)?Promise.reject(Cr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(t){return Nt(this.app)?Promise.reject(Cr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Qt(t))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(t){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(t)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const t=await xu(this),n=new Lu(t);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(t){this._errorFactory=new Ye("auth","Firebase",t())}onAuthStateChanged(t,n,i){return this.registerStateListener(this.authStateSubscription,t,n,i)}beforeAuthStateChanged(t,n){return this.beforeStateQueue.pushCallback(t,n)}onIdTokenChanged(t,n,i){return this.registerStateListener(this.idTokenSubscription,t,n,i)}authStateReady(){return new Promise((t,n)=>{if(this.currentUser)t();else{const i=this.onAuthStateChanged(()=>{i(),t()},n)}})}async revokeAccessToken(t){if(this.currentUser){const n=await this.currentUser.getIdToken(),i={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:t,idToken:n};this.tenantId!=null&&(i.tenantId=this.tenantId),await Tu(this,i)}}toJSON(){var t;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(t=this._currentUser)===null||t===void 0?void 0:t.toJSON()}}async _setRedirectUser(t,n){const i=await this.getOrInitRedirectPersistenceManager(n);return t===null?i.removeCurrentUser():i.setCurrentUser(t)}async getOrInitRedirectPersistenceManager(t){if(!this.redirectPersistenceManager){const n=t&&Qt(t)||this._popupRedirectResolver;U(n,this,"argument-error"),this.redirectPersistenceManager=await me.create(this,[Qt(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(t){var n,i;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===t?this._currentUser:((i=this.redirectUser)===null||i===void 0?void 0:i._redirectEventId)===t?this.redirectUser:null}async _persistUserIfCurrent(t){if(t===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(t))}_notifyListenersIfCurrent(t){t===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var t,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const i=(n=(t=this.currentUser)===null||t===void 0?void 0:t.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==i&&(this.lastNotifiedUid=i,this.authStateSubscription.next(this.currentUser))}registerStateListener(t,n,i,s){if(this._deleted)return()=>{};const l=typeof n=="function"?n:n.next.bind(n);let h=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(U(u,this,"internal-error"),u.then(()=>{h||l(this.currentUser)}),typeof n=="function"){const g=t.addObserver(n,i,s);return()=>{h=!0,g()}}else{const g=t.addObserver(n);return()=>{h=!0,g()}}}async directlySetCurrentUser(t){this.currentUser&&this.currentUser!==t&&this._currentUser._stopProactiveRefresh(),t&&this.isProactiveRefreshEnabled&&t._startProactiveRefresh(),this.currentUser=t,t?await this.assertedPersistence.setCurrentUser(t):await this.assertedPersistence.removeCurrentUser()}queue(t){return this.operations=this.operations.then(t,t),this.operations}get assertedPersistence(){return U(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(t){!t||this.frameworks.includes(t)||(this.frameworks.push(t),this.frameworks.sort(),this.clientVersion=ha(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var t;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const i=await((t=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||t===void 0?void 0:t.getHeartbeatsHeader());i&&(n["X-Firebase-Client"]=i);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var t;if(Nt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const n=await((t=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||t===void 0?void 0:t.getToken());return n!=null&&n.error&&hu(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Uu(r){return Wr(r)}class zs{constructor(t){this.auth=t,this.observer=null,this.addObserver=ec(n=>this.observer=n)}get next(){return U(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}function Fu(r,t){const n=(t==null?void 0:t.persistence)||[],i=(Array.isArray(n)?n:[n]).map(Qt);t!=null&&t.errorMap&&r._updateErrorMap(t.errorMap),r._initializeWithPersistence(i,t==null?void 0:t.popupRedirectResolver)}new Qe(3e4,6e4);/**
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
 */new Qe(2e3,1e4);/**
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
 */new Qe(3e4,6e4);/**
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
 */new Qe(5e3,15e3);var Ws="@firebase/auth",Gs="1.10.8";/**
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
 */class Vu{constructor(t){this.auth=t,this.internalListeners=new Map}getUid(){var t;return this.assertAuthConfigured(),((t=this.auth.currentUser)===null||t===void 0?void 0:t.uid)||null}async getToken(t){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(t)}:null}addAuthTokenListener(t){if(this.assertAuthConfigured(),this.internalListeners.has(t))return;const n=this.auth.onIdTokenChanged(i=>{t((i==null?void 0:i.stsTokenManager.accessToken)||null)});this.internalListeners.set(t,n),this.updateProactiveRefresh()}removeAuthTokenListener(t){this.assertAuthConfigured();const n=this.internalListeners.get(t);n&&(this.internalListeners.delete(t),n(),this.updateProactiveRefresh())}assertAuthConfigured(){U(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function ju(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Bu(r){zt(new Ht("auth",(t,{options:n})=>{const i=t.getProvider("app").getImmediate(),s=t.getProvider("heartbeat"),l=t.getProvider("app-check-internal"),{apiKey:h,authDomain:u}=i.options;U(h&&!h.includes(":"),"invalid-api-key",{appName:i.name});const g={apiKey:h,authDomain:u,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:ha(r)},A=new Mu(i,s,l,g);return Fu(A,n),A},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((t,n,i)=>{t.getProvider("auth-internal").initialize()})),zt(new Ht("auth-internal",t=>{const n=Uu(t.getProvider("auth").getImmediate());return(i=>new Vu(i))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),dt(Ws,Gs,ju(r)),dt(Ws,Gs,"esm2017")}/**
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
*/var ui;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(v,d){function f(){}f.prototype=d.prototype,v.D=d.prototype,v.prototype=new f,v.prototype.constructor=v,v.C=function(m,_,w){for(var p=Array(arguments.length-2),It=2;It<arguments.length;It++)p[It-2]=arguments[It];return d.prototype[_].apply(m,p)}}function n(){this.blockSize=-1}function i(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(i,n),i.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(v,d,f){f||(f=0);var m=Array(16);if(typeof d=="string")for(var _=0;16>_;++_)m[_]=d.charCodeAt(f++)|d.charCodeAt(f++)<<8|d.charCodeAt(f++)<<16|d.charCodeAt(f++)<<24;else for(_=0;16>_;++_)m[_]=d[f++]|d[f++]<<8|d[f++]<<16|d[f++]<<24;d=v.g[0],f=v.g[1],_=v.g[2];var w=v.g[3],p=d+(w^f&(_^w))+m[0]+3614090360&4294967295;d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[1]+3905402710&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[2]+606105819&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[3]+3250441966&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[4]+4118548399&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[5]+1200080426&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[6]+2821735955&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[7]+4249261313&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[8]+1770035416&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[9]+2336552879&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[10]+4294925233&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[11]+2304563134&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(w^f&(_^w))+m[12]+1804603682&4294967295,d=f+(p<<7&4294967295|p>>>25),p=w+(_^d&(f^_))+m[13]+4254626195&4294967295,w=d+(p<<12&4294967295|p>>>20),p=_+(f^w&(d^f))+m[14]+2792965006&4294967295,_=w+(p<<17&4294967295|p>>>15),p=f+(d^_&(w^d))+m[15]+1236535329&4294967295,f=_+(p<<22&4294967295|p>>>10),p=d+(_^w&(f^_))+m[1]+4129170786&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[6]+3225465664&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[11]+643717713&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[0]+3921069994&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[5]+3593408605&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[10]+38016083&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[15]+3634488961&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[4]+3889429448&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[9]+568446438&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[14]+3275163606&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[3]+4107603335&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[8]+1163531501&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(_^w&(f^_))+m[13]+2850285829&4294967295,d=f+(p<<5&4294967295|p>>>27),p=w+(f^_&(d^f))+m[2]+4243563512&4294967295,w=d+(p<<9&4294967295|p>>>23),p=_+(d^f&(w^d))+m[7]+1735328473&4294967295,_=w+(p<<14&4294967295|p>>>18),p=f+(w^d&(_^w))+m[12]+2368359562&4294967295,f=_+(p<<20&4294967295|p>>>12),p=d+(f^_^w)+m[5]+4294588738&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[8]+2272392833&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[11]+1839030562&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[14]+4259657740&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[1]+2763975236&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[4]+1272893353&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[7]+4139469664&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[10]+3200236656&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[13]+681279174&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[0]+3936430074&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[3]+3572445317&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[6]+76029189&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(f^_^w)+m[9]+3654602809&4294967295,d=f+(p<<4&4294967295|p>>>28),p=w+(d^f^_)+m[12]+3873151461&4294967295,w=d+(p<<11&4294967295|p>>>21),p=_+(w^d^f)+m[15]+530742520&4294967295,_=w+(p<<16&4294967295|p>>>16),p=f+(_^w^d)+m[2]+3299628645&4294967295,f=_+(p<<23&4294967295|p>>>9),p=d+(_^(f|~w))+m[0]+4096336452&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[7]+1126891415&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[14]+2878612391&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[5]+4237533241&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[12]+1700485571&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[3]+2399980690&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[10]+4293915773&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[1]+2240044497&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[8]+1873313359&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[15]+4264355552&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[6]+2734768916&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[13]+1309151649&4294967295,f=_+(p<<21&4294967295|p>>>11),p=d+(_^(f|~w))+m[4]+4149444226&4294967295,d=f+(p<<6&4294967295|p>>>26),p=w+(f^(d|~_))+m[11]+3174756917&4294967295,w=d+(p<<10&4294967295|p>>>22),p=_+(d^(w|~f))+m[2]+718787259&4294967295,_=w+(p<<15&4294967295|p>>>17),p=f+(w^(_|~d))+m[9]+3951481745&4294967295,v.g[0]=v.g[0]+d&4294967295,v.g[1]=v.g[1]+(_+(p<<21&4294967295|p>>>11))&4294967295,v.g[2]=v.g[2]+_&4294967295,v.g[3]=v.g[3]+w&4294967295}i.prototype.u=function(v,d){d===void 0&&(d=v.length);for(var f=d-this.blockSize,m=this.B,_=this.h,w=0;w<d;){if(_==0)for(;w<=f;)s(this,v,w),w+=this.blockSize;if(typeof v=="string"){for(;w<d;)if(m[_++]=v.charCodeAt(w++),_==this.blockSize){s(this,m),_=0;break}}else for(;w<d;)if(m[_++]=v[w++],_==this.blockSize){s(this,m),_=0;break}}this.h=_,this.o+=d},i.prototype.v=function(){var v=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);v[0]=128;for(var d=1;d<v.length-8;++d)v[d]=0;var f=8*this.o;for(d=v.length-8;d<v.length;++d)v[d]=f&255,f/=256;for(this.u(v),v=Array(16),d=f=0;4>d;++d)for(var m=0;32>m;m+=8)v[f++]=this.g[d]>>>m&255;return v};function l(v,d){var f=u;return Object.prototype.hasOwnProperty.call(f,v)?f[v]:f[v]=d(v)}function h(v,d){this.h=d;for(var f=[],m=!0,_=v.length-1;0<=_;_--){var w=v[_]|0;m&&w==d||(f[_]=w,m=!1)}this.g=f}var u={};function g(v){return-128<=v&&128>v?l(v,function(d){return new h([d|0],0>d?-1:0)}):new h([v|0],0>v?-1:0)}function A(v){if(isNaN(v)||!isFinite(v))return S;if(0>v)return O(A(-v));for(var d=[],f=1,m=0;v>=f;m++)d[m]=v/f|0,f*=4294967296;return new h(d,0)}function T(v,d){if(v.length==0)throw Error("number format error: empty string");if(d=d||10,2>d||36<d)throw Error("radix out of range: "+d);if(v.charAt(0)=="-")return O(T(v.substring(1),d));if(0<=v.indexOf("-"))throw Error('number format error: interior "-" character');for(var f=A(Math.pow(d,8)),m=S,_=0;_<v.length;_+=8){var w=Math.min(8,v.length-_),p=parseInt(v.substring(_,_+w),d);8>w?(w=A(Math.pow(d,w)),m=m.j(w).add(A(p))):(m=m.j(f),m=m.add(A(p)))}return m}var S=g(0),C=g(1),$=g(16777216);r=h.prototype,r.m=function(){if(B(this))return-O(this).m();for(var v=0,d=1,f=0;f<this.g.length;f++){var m=this.i(f);v+=(0<=m?m:4294967296+m)*d,d*=4294967296}return v},r.toString=function(v){if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(D(this))return"0";if(B(this))return"-"+O(this).toString(v);for(var d=A(Math.pow(v,6)),f=this,m="";;){var _=P(f,d).g;f=tt(f,_.j(d));var w=((0<f.g.length?f.g[0]:f.h)>>>0).toString(v);if(f=_,D(f))return w+m;for(;6>w.length;)w="0"+w;m=w+m}},r.i=function(v){return 0>v?0:v<this.g.length?this.g[v]:this.h};function D(v){if(v.h!=0)return!1;for(var d=0;d<v.g.length;d++)if(v.g[d]!=0)return!1;return!0}function B(v){return v.h==-1}r.l=function(v){return v=tt(this,v),B(v)?-1:D(v)?0:1};function O(v){for(var d=v.g.length,f=[],m=0;m<d;m++)f[m]=~v.g[m];return new h(f,~v.h).add(C)}r.abs=function(){return B(this)?O(this):this},r.add=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0,_=0;_<=d;_++){var w=m+(this.i(_)&65535)+(v.i(_)&65535),p=(w>>>16)+(this.i(_)>>>16)+(v.i(_)>>>16);m=p>>>16,w&=65535,p&=65535,f[_]=p<<16|w}return new h(f,f[f.length-1]&-2147483648?-1:0)};function tt(v,d){return v.add(O(d))}r.j=function(v){if(D(this)||D(v))return S;if(B(this))return B(v)?O(this).j(O(v)):O(O(this).j(v));if(B(v))return O(this.j(O(v)));if(0>this.l($)&&0>v.l($))return A(this.m()*v.m());for(var d=this.g.length+v.g.length,f=[],m=0;m<2*d;m++)f[m]=0;for(m=0;m<this.g.length;m++)for(var _=0;_<v.g.length;_++){var w=this.i(m)>>>16,p=this.i(m)&65535,It=v.i(_)>>>16,we=v.i(_)&65535;f[2*m+2*_]+=p*we,J(f,2*m+2*_),f[2*m+2*_+1]+=w*we,J(f,2*m+2*_+1),f[2*m+2*_+1]+=p*It,J(f,2*m+2*_+1),f[2*m+2*_+2]+=w*It,J(f,2*m+2*_+2)}for(m=0;m<d;m++)f[m]=f[2*m+1]<<16|f[2*m];for(m=d;m<2*d;m++)f[m]=0;return new h(f,0)};function J(v,d){for(;(v[d]&65535)!=v[d];)v[d+1]+=v[d]>>>16,v[d]&=65535,d++}function R(v,d){this.g=v,this.h=d}function P(v,d){if(D(d))throw Error("division by zero");if(D(v))return new R(S,S);if(B(v))return d=P(O(v),d),new R(O(d.g),O(d.h));if(B(d))return d=P(v,O(d)),new R(O(d.g),d.h);if(30<v.g.length){if(B(v)||B(d))throw Error("slowDivide_ only works with positive integers.");for(var f=C,m=d;0>=m.l(v);)f=N(f),m=N(m);var _=L(f,1),w=L(m,1);for(m=L(m,2),f=L(f,2);!D(m);){var p=w.add(m);0>=p.l(v)&&(_=_.add(f),w=p),m=L(m,1),f=L(f,1)}return d=tt(v,_.j(d)),new R(_,d)}for(_=S;0<=v.l(d);){for(f=Math.max(1,Math.floor(v.m()/d.m())),m=Math.ceil(Math.log(f)/Math.LN2),m=48>=m?1:Math.pow(2,m-48),w=A(f),p=w.j(d);B(p)||0<p.l(v);)f-=m,w=A(f),p=w.j(d);D(w)&&(w=C),_=_.add(w),v=tt(v,p)}return new R(_,v)}r.A=function(v){return P(this,v).h},r.and=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)&v.i(m);return new h(f,this.h&v.h)},r.or=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)|v.i(m);return new h(f,this.h|v.h)},r.xor=function(v){for(var d=Math.max(this.g.length,v.g.length),f=[],m=0;m<d;m++)f[m]=this.i(m)^v.i(m);return new h(f,this.h^v.h)};function N(v){for(var d=v.g.length+1,f=[],m=0;m<d;m++)f[m]=v.i(m)<<1|v.i(m-1)>>>31;return new h(f,v.h)}function L(v,d){var f=d>>5;d%=32;for(var m=v.g.length-f,_=[],w=0;w<m;w++)_[w]=0<d?v.i(w+f)>>>d|v.i(w+f+1)<<32-d:v.i(w+f);return new h(_,v.h)}i.prototype.digest=i.prototype.v,i.prototype.reset=i.prototype.s,i.prototype.update=i.prototype.u,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=A,h.fromString=T,ui=h}).apply(typeof qs<"u"?qs:typeof self<"u"?self:typeof window<"u"?window:{});var wr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var r,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(e,o,a){return e==Array.prototype||e==Object.prototype||(e[o]=a.value),e};function n(e){e=[typeof globalThis=="object"&&globalThis,e,typeof window=="object"&&window,typeof self=="object"&&self,typeof wr=="object"&&wr];for(var o=0;o<e.length;++o){var a=e[o];if(a&&a.Math==Math)return a}throw Error("Cannot find global object")}var i=n(this);function s(e,o){if(o)t:{var a=i;e=e.split(".");for(var c=0;c<e.length-1;c++){var y=e[c];if(!(y in a))break t;a=a[y]}e=e[e.length-1],c=a[e],o=o(c),o!=c&&o!=null&&t(a,e,{configurable:!0,writable:!0,value:o})}}function l(e,o){e instanceof String&&(e+="");var a=0,c=!1,y={next:function(){if(!c&&a<e.length){var b=a++;return{value:o(b,e[b]),done:!1}}return c=!0,{done:!0,value:void 0}}};return y[Symbol.iterator]=function(){return y},y}s("Array.prototype.values",function(e){return e||function(){return l(this,function(o,a){return a})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},u=this||self;function g(e){var o=typeof e;return o=o!="object"?o:e?Array.isArray(e)?"array":o:"null",o=="array"||o=="object"&&typeof e.length=="number"}function A(e){var o=typeof e;return o=="object"&&e!=null||o=="function"}function T(e,o,a){return e.call.apply(e.bind,arguments)}function S(e,o,a){if(!e)throw Error();if(2<arguments.length){var c=Array.prototype.slice.call(arguments,2);return function(){var y=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(y,c),e.apply(o,y)}}return function(){return e.apply(o,arguments)}}function C(e,o,a){return C=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?T:S,C.apply(null,arguments)}function $(e,o){var a=Array.prototype.slice.call(arguments,1);return function(){var c=a.slice();return c.push.apply(c,arguments),e.apply(this,c)}}function D(e,o){function a(){}a.prototype=o.prototype,e.aa=o.prototype,e.prototype=new a,e.prototype.constructor=e,e.Qb=function(c,y,b){for(var E=Array(arguments.length-2),H=2;H<arguments.length;H++)E[H-2]=arguments[H];return o.prototype[y].apply(c,E)}}function B(e){const o=e.length;if(0<o){const a=Array(o);for(let c=0;c<o;c++)a[c]=e[c];return a}return[]}function O(e,o){for(let a=1;a<arguments.length;a++){const c=arguments[a];if(g(c)){const y=e.length||0,b=c.length||0;e.length=y+b;for(let E=0;E<b;E++)e[y+E]=c[E]}else e.push(c)}}class tt{constructor(o,a){this.i=o,this.j=a,this.h=0,this.g=null}get(){let o;return 0<this.h?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function J(e){return/^[\s\xa0]*$/.test(e)}function R(){var e=u.navigator;return e&&(e=e.userAgent)?e:""}function P(e){return P[" "](e),e}P[" "]=function(){};var N=R().indexOf("Gecko")!=-1&&!(R().toLowerCase().indexOf("webkit")!=-1&&R().indexOf("Edge")==-1)&&!(R().indexOf("Trident")!=-1||R().indexOf("MSIE")!=-1)&&R().indexOf("Edge")==-1;function L(e,o,a){for(const c in e)o.call(a,e[c],c,e)}function v(e,o){for(const a in e)o.call(void 0,e[a],a,e)}function d(e){const o={};for(const a in e)o[a]=e[a];return o}const f="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function m(e,o){let a,c;for(let y=1;y<arguments.length;y++){c=arguments[y];for(a in c)e[a]=c[a];for(let b=0;b<f.length;b++)a=f[b],Object.prototype.hasOwnProperty.call(c,a)&&(e[a]=c[a])}}function _(e){var o=1;e=e.split(":");const a=[];for(;0<o&&e.length;)a.push(e.shift()),o--;return e.length&&a.push(e.join(":")),a}function w(e){u.setTimeout(()=>{throw e},0)}function p(){var e=Kr;let o=null;return e.g&&(o=e.g,e.g=e.g.next,e.g||(e.h=null),o.next=null),o}class It{constructor(){this.h=this.g=null}add(o,a){const c=we.get();c.set(o,a),this.h?this.h.next=c:this.g=c,this.h=c}}var we=new tt(()=>new Sa,e=>e.reset());class Sa{constructor(){this.next=this.g=this.h=null}set(o,a){this.h=o,this.g=a,this.next=null}reset(){this.next=this.g=this.h=null}}let be,Ae=!1,Kr=new It,_i=()=>{const e=u.Promise.resolve(void 0);be=()=>{e.then(Ta)}};var Ta=()=>{for(var e;e=p();){try{e.h.call(e.g)}catch(a){w(a)}var o=we;o.j(e),100>o.h&&(o.h++,e.next=o.g,o.g=e)}Ae=!1};function $t(){this.s=this.s,this.C=this.C}$t.prototype.s=!1,$t.prototype.ma=function(){this.s||(this.s=!0,this.N())},$t.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function et(e,o){this.type=e,this.g=this.target=o,this.defaultPrevented=!1}et.prototype.h=function(){this.defaultPrevented=!0};var Ia=function(){if(!u.addEventListener||!Object.defineProperty)return!1;var e=!1,o=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const a=()=>{};u.addEventListener("test",a,o),u.removeEventListener("test",a,o)}catch{}return e}();function Ee(e,o){if(et.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e){var a=this.type=e.type,c=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;if(this.target=e.target||e.srcElement,this.g=o,o=e.relatedTarget){if(N){t:{try{P(o.nodeName);var y=!0;break t}catch{}y=!1}y||(o=null)}}else a=="mouseover"?o=e.fromElement:a=="mouseout"&&(o=e.toElement);this.relatedTarget=o,c?(this.clientX=c.clientX!==void 0?c.clientX:c.pageX,this.clientY=c.clientY!==void 0?c.clientY:c.pageY,this.screenX=c.screenX||0,this.screenY=c.screenY||0):(this.clientX=e.clientX!==void 0?e.clientX:e.pageX,this.clientY=e.clientY!==void 0?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType=typeof e.pointerType=="string"?e.pointerType:Ca[e.pointerType]||"",this.state=e.state,this.i=e,e.defaultPrevented&&Ee.aa.h.call(this)}}D(Ee,et);var Ca={2:"touch",3:"pen",4:"mouse"};Ee.prototype.h=function(){Ee.aa.h.call(this);var e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var rr="closure_listenable_"+(1e6*Math.random()|0),Pa=0;function Na(e,o,a,c,y){this.listener=e,this.proxy=null,this.src=o,this.type=a,this.capture=!!c,this.ha=y,this.key=++Pa,this.da=this.fa=!1}function nr(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function ir(e){this.src=e,this.g={},this.h=0}ir.prototype.add=function(e,o,a,c,y){var b=e.toString();e=this.g[b],e||(e=this.g[b]=[],this.h++);var E=Jr(e,o,c,y);return-1<E?(o=e[E],a||(o.fa=!1)):(o=new Na(o,this.src,b,!!c,y),o.fa=a,e.push(o)),o};function Xr(e,o){var a=o.type;if(a in e.g){var c=e.g[a],y=Array.prototype.indexOf.call(c,o,void 0),b;(b=0<=y)&&Array.prototype.splice.call(c,y,1),b&&(nr(o),e.g[a].length==0&&(delete e.g[a],e.h--))}}function Jr(e,o,a,c){for(var y=0;y<e.length;++y){var b=e[y];if(!b.da&&b.listener==o&&b.capture==!!a&&b.ha==c)return y}return-1}var Yr="closure_lm_"+(1e6*Math.random()|0),Zr={};function yi(e,o,a,c,y){if(Array.isArray(o)){for(var b=0;b<o.length;b++)yi(e,o[b],a,c,y);return null}return a=Ai(a),e&&e[rr]?e.K(o,a,A(c)?!!c.capture:!1,y):Ra(e,o,a,!1,c,y)}function Ra(e,o,a,c,y,b){if(!o)throw Error("Invalid event type");var E=A(y)?!!y.capture:!!y,H=tn(e);if(H||(e[Yr]=H=new ir(e)),a=H.add(o,a,c,E,b),a.proxy)return a;if(c=ka(),a.proxy=c,c.src=e,c.listener=a,e.addEventListener)Ia||(y=E),y===void 0&&(y=!1),e.addEventListener(o.toString(),c,y);else if(e.attachEvent)e.attachEvent(bi(o.toString()),c);else if(e.addListener&&e.removeListener)e.addListener(c);else throw Error("addEventListener and attachEvent are unavailable.");return a}function ka(){function e(a){return o.call(e.src,e.listener,a)}const o=Da;return e}function wi(e,o,a,c,y){if(Array.isArray(o))for(var b=0;b<o.length;b++)wi(e,o[b],a,c,y);else c=A(c)?!!c.capture:!!c,a=Ai(a),e&&e[rr]?(e=e.i,o=String(o).toString(),o in e.g&&(b=e.g[o],a=Jr(b,a,c,y),-1<a&&(nr(b[a]),Array.prototype.splice.call(b,a,1),b.length==0&&(delete e.g[o],e.h--)))):e&&(e=tn(e))&&(o=e.g[o.toString()],e=-1,o&&(e=Jr(o,a,c,y)),(a=-1<e?o[e]:null)&&Qr(a))}function Qr(e){if(typeof e!="number"&&e&&!e.da){var o=e.src;if(o&&o[rr])Xr(o.i,e);else{var a=e.type,c=e.proxy;o.removeEventListener?o.removeEventListener(a,c,e.capture):o.detachEvent?o.detachEvent(bi(a),c):o.addListener&&o.removeListener&&o.removeListener(c),(a=tn(o))?(Xr(a,e),a.h==0&&(a.src=null,o[Yr]=null)):nr(e)}}}function bi(e){return e in Zr?Zr[e]:Zr[e]="on"+e}function Da(e,o){if(e.da)e=!0;else{o=new Ee(o,this);var a=e.listener,c=e.ha||e.src;e.fa&&Qr(e),e=a.call(c,o)}return e}function tn(e){return e=e[Yr],e instanceof ir?e:null}var en="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ai(e){return typeof e=="function"?e:(e[en]||(e[en]=function(o){return e.handleEvent(o)}),e[en])}function rt(){$t.call(this),this.i=new ir(this),this.M=this,this.F=null}D(rt,$t),rt.prototype[rr]=!0,rt.prototype.removeEventListener=function(e,o,a,c){wi(this,e,o,a,c)};function st(e,o){var a,c=e.F;if(c)for(a=[];c;c=c.F)a.push(c);if(e=e.M,c=o.type||o,typeof o=="string")o=new et(o,e);else if(o instanceof et)o.target=o.target||e;else{var y=o;o=new et(c,e),m(o,y)}if(y=!0,a)for(var b=a.length-1;0<=b;b--){var E=o.g=a[b];y=sr(E,c,!0,o)&&y}if(E=o.g=e,y=sr(E,c,!0,o)&&y,y=sr(E,c,!1,o)&&y,a)for(b=0;b<a.length;b++)E=o.g=a[b],y=sr(E,c,!1,o)&&y}rt.prototype.N=function(){if(rt.aa.N.call(this),this.i){var e=this.i,o;for(o in e.g){for(var a=e.g[o],c=0;c<a.length;c++)nr(a[c]);delete e.g[o],e.h--}}this.F=null},rt.prototype.K=function(e,o,a,c){return this.i.add(String(e),o,!1,a,c)},rt.prototype.L=function(e,o,a,c){return this.i.add(String(e),o,!0,a,c)};function sr(e,o,a,c){if(o=e.i.g[String(o)],!o)return!0;o=o.concat();for(var y=!0,b=0;b<o.length;++b){var E=o[b];if(E&&!E.da&&E.capture==a){var H=E.listener,Y=E.ha||E.src;E.fa&&Xr(e.i,E),y=H.call(Y,c)!==!1&&y}}return y&&!c.defaultPrevented}function Ei(e,o,a){if(typeof e=="function")a&&(e=C(e,a));else if(e&&typeof e.handleEvent=="function")e=C(e.handleEvent,e);else throw Error("Invalid listener argument");return 2147483647<Number(o)?-1:u.setTimeout(e,o||0)}function Si(e){e.g=Ei(()=>{e.g=null,e.i&&(e.i=!1,Si(e))},e.l);const o=e.h;e.h=null,e.m.apply(null,o)}class Oa extends $t{constructor(o,a){super(),this.m=o,this.l=a,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:Si(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Se(e){$t.call(this),this.h=e,this.g={}}D(Se,$t);var Ti=[];function Ii(e){L(e.g,function(o,a){this.g.hasOwnProperty(a)&&Qr(o)},e),e.g={}}Se.prototype.N=function(){Se.aa.N.call(this),Ii(this)},Se.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rn=u.JSON.stringify,xa=u.JSON.parse,$a=class{stringify(e){return u.JSON.stringify(e,void 0)}parse(e){return u.JSON.parse(e,void 0)}};function nn(){}nn.prototype.h=null;function Ci(e){return e.h||(e.h=e.i())}function La(){}var Te={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function sn(){et.call(this,"d")}D(sn,et);function on(){et.call(this,"c")}D(on,et);var le={},Pi=null;function an(){return Pi=Pi||new rt}le.La="serverreachability";function Ni(e){et.call(this,le.La,e)}D(Ni,et);function Ie(e){const o=an();st(o,new Ni(o))}le.STAT_EVENT="statevent";function Ri(e,o){et.call(this,le.STAT_EVENT,e),this.stat=o}D(Ri,et);function ot(e){const o=an();st(o,new Ri(o,e))}le.Ma="timingevent";function ki(e,o){et.call(this,le.Ma,e),this.size=o}D(ki,et);function Ce(e,o){if(typeof e!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){e()},o)}function Pe(){this.g=!0}Pe.prototype.xa=function(){this.g=!1};function Ma(e,o,a,c,y,b){e.info(function(){if(e.g)if(b)for(var E="",H=b.split("&"),Y=0;Y<H.length;Y++){var M=H[Y].split("=");if(1<M.length){var nt=M[0];M=M[1];var it=nt.split("_");E=2<=it.length&&it[1]=="type"?E+(nt+"="+M+"&"):E+(nt+"=redacted&")}}else E=null;else E=b;return"XMLHTTP REQ ("+c+") [attempt "+y+"]: "+o+`
`+a+`
`+E})}function Ua(e,o,a,c,y,b,E){e.info(function(){return"XMLHTTP RESP ("+c+") [ attempt "+y+"]: "+o+`
`+a+`
`+b+" "+E})}function he(e,o,a,c){e.info(function(){return"XMLHTTP TEXT ("+o+"): "+Va(e,a)+(c?" "+c:"")})}function Fa(e,o){e.info(function(){return"TIMEOUT: "+o})}Pe.prototype.info=function(){};function Va(e,o){if(!e.g)return o;if(!o)return null;try{var a=JSON.parse(o);if(a){for(e=0;e<a.length;e++)if(Array.isArray(a[e])){var c=a[e];if(!(2>c.length)){var y=c[1];if(Array.isArray(y)&&!(1>y.length)){var b=y[0];if(b!="noop"&&b!="stop"&&b!="close")for(var E=1;E<y.length;E++)y[E]=""}}}}return rn(a)}catch{return o}}var ln={NO_ERROR:0,TIMEOUT:8},ja={},hn;function or(){}D(or,nn),or.prototype.g=function(){return new XMLHttpRequest},or.prototype.i=function(){return{}},hn=new or;function Lt(e,o,a,c){this.j=e,this.i=o,this.l=a,this.R=c||1,this.U=new Se(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Di}function Di(){this.i=null,this.g="",this.h=!1}var Oi={},cn={};function un(e,o,a){e.L=1,e.v=cr(Ct(o)),e.m=a,e.P=!0,xi(e,null)}function xi(e,o){e.F=Date.now(),ar(e),e.A=Ct(e.v);var a=e.A,c=e.R;Array.isArray(c)||(c=[String(c)]),Ki(a.i,"t",c),e.C=0,a=e.j.J,e.h=new Di,e.g=ds(e.j,a?o:null,!e.m),0<e.O&&(e.M=new Oa(C(e.Y,e,e.g),e.O)),o=e.U,a=e.g,c=e.ca;var y="readystatechange";Array.isArray(y)||(y&&(Ti[0]=y.toString()),y=Ti);for(var b=0;b<y.length;b++){var E=yi(a,y[b],c||o.handleEvent,!1,o.h||o);if(!E)break;o.g[E.key]=E}o=e.H?d(e.H):{},e.m?(e.u||(e.u="POST"),o["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.A,e.u,e.m,o)):(e.u="GET",e.g.ea(e.A,e.u,null,o)),Ie(),Ma(e.i,e.u,e.A,e.l,e.R,e.m)}Lt.prototype.ca=function(e){e=e.target;const o=this.M;o&&Pt(e)==3?o.j():this.Y(e)},Lt.prototype.Y=function(e){try{if(e==this.g)t:{const it=Pt(this.g);var o=this.g.Ba();const de=this.g.Z();if(!(3>it)&&(it!=3||this.g&&(this.h.h||this.g.oa()||es(this.g)))){this.J||it!=4||o==7||(o==8||0>=de?Ie(3):Ie(2)),dn(this);var a=this.g.Z();this.X=a;e:if($i(this)){var c=es(this.g);e="";var y=c.length,b=Pt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){qt(this),Ne(this);var E="";break e}this.h.i=new u.TextDecoder}for(o=0;o<y;o++)this.h.h=!0,e+=this.h.i.decode(c[o],{stream:!(b&&o==y-1)});c.length=0,this.h.g+=e,this.C=0,E=this.h.g}else E=this.g.oa();if(this.o=a==200,Ua(this.i,this.u,this.A,this.l,this.R,it,a),this.o){if(this.T&&!this.K){e:{if(this.g){var H,Y=this.g;if((H=Y.g?Y.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!J(H)){var M=H;break e}}M=null}if(a=M)he(this.i,this.l,a,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,fn(this,a);else{this.o=!1,this.s=3,ot(12),qt(this),Ne(this);break t}}if(this.P){a=!0;let pt;for(;!this.J&&this.C<E.length;)if(pt=Ba(this,E),pt==cn){it==4&&(this.s=4,ot(14),a=!1),he(this.i,this.l,null,"[Incomplete Response]");break}else if(pt==Oi){this.s=4,ot(15),he(this.i,this.l,E,"[Invalid Chunk]"),a=!1;break}else he(this.i,this.l,pt,null),fn(this,pt);if($i(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),it!=4||E.length!=0||this.h.h||(this.s=1,ot(16),a=!1),this.o=this.o&&a,!a)he(this.i,this.l,E,"[Invalid Chunked Response]"),qt(this),Ne(this);else if(0<E.length&&!this.W){this.W=!0;var nt=this.j;nt.g==this&&nt.ba&&!nt.M&&(nt.j.info("Great, no buffering proxy detected. Bytes received: "+E.length),yn(nt),nt.M=!0,ot(11))}}else he(this.i,this.l,E,null),fn(this,E);it==4&&qt(this),this.o&&!this.J&&(it==4?ls(this.j,this):(this.o=!1,ar(this)))}else sl(this.g),a==400&&0<E.indexOf("Unknown SID")?(this.s=3,ot(12)):(this.s=0,ot(13)),qt(this),Ne(this)}}}catch{}finally{}};function $i(e){return e.g?e.u=="GET"&&e.L!=2&&e.j.Ca:!1}function Ba(e,o){var a=e.C,c=o.indexOf(`
`,a);return c==-1?cn:(a=Number(o.substring(a,c)),isNaN(a)?Oi:(c+=1,c+a>o.length?cn:(o=o.slice(c,c+a),e.C=c+a,o)))}Lt.prototype.cancel=function(){this.J=!0,qt(this)};function ar(e){e.S=Date.now()+e.I,Li(e,e.I)}function Li(e,o){if(e.B!=null)throw Error("WatchDog timer not null");e.B=Ce(C(e.ba,e),o)}function dn(e){e.B&&(u.clearTimeout(e.B),e.B=null)}Lt.prototype.ba=function(){this.B=null;const e=Date.now();0<=e-this.S?(Fa(this.i,this.A),this.L!=2&&(Ie(),ot(17)),qt(this),this.s=2,Ne(this)):Li(this,this.S-e)};function Ne(e){e.j.G==0||e.J||ls(e.j,e)}function qt(e){dn(e);var o=e.M;o&&typeof o.ma=="function"&&o.ma(),e.M=null,Ii(e.U),e.g&&(o=e.g,e.g=null,o.abort(),o.ma())}function fn(e,o){try{var a=e.j;if(a.G!=0&&(a.g==e||pn(a.h,e))){if(!e.K&&pn(a.h,e)&&a.G==3){try{var c=a.Da.g.parse(o)}catch{c=null}if(Array.isArray(c)&&c.length==3){var y=c;if(y[0]==0){t:if(!a.u){if(a.g)if(a.g.F+3e3<e.F)mr(a),pr(a);else break t;_n(a),ot(18)}}else a.za=y[1],0<a.za-a.T&&37500>y[2]&&a.F&&a.v==0&&!a.C&&(a.C=Ce(C(a.Za,a),6e3));if(1>=Fi(a.h)&&a.ca){try{a.ca()}catch{}a.ca=void 0}}else Xt(a,11)}else if((e.K||a.g==e)&&mr(a),!J(o))for(y=a.Da.g.parse(o),o=0;o<y.length;o++){let M=y[o];if(a.T=M[0],M=M[1],a.G==2)if(M[0]=="c"){a.K=M[1],a.ia=M[2];const nt=M[3];nt!=null&&(a.la=nt,a.j.info("VER="+a.la));const it=M[4];it!=null&&(a.Aa=it,a.j.info("SVER="+a.Aa));const de=M[5];de!=null&&typeof de=="number"&&0<de&&(c=1.5*de,a.L=c,a.j.info("backChannelRequestTimeoutMs_="+c)),c=a;const pt=e.g;if(pt){const vr=pt.g?pt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(vr){var b=c.h;b.g||vr.indexOf("spdy")==-1&&vr.indexOf("quic")==-1&&vr.indexOf("h2")==-1||(b.j=b.l,b.g=new Set,b.h&&(gn(b,b.h),b.h=null))}if(c.D){const wn=pt.g?pt.g.getResponseHeader("X-HTTP-Session-Id"):null;wn&&(c.ya=wn,W(c.I,c.D,wn))}}a.G=3,a.l&&a.l.ua(),a.ba&&(a.R=Date.now()-e.F,a.j.info("Handshake RTT: "+a.R+"ms")),c=a;var E=e;if(c.qa=us(c,c.J?c.ia:null,c.W),E.K){Vi(c.h,E);var H=E,Y=c.L;Y&&(H.I=Y),H.B&&(dn(H),ar(H)),c.g=E}else os(c);0<a.i.length&&gr(a)}else M[0]!="stop"&&M[0]!="close"||Xt(a,7);else a.G==3&&(M[0]=="stop"||M[0]=="close"?M[0]=="stop"?Xt(a,7):vn(a):M[0]!="noop"&&a.l&&a.l.ta(M),a.v=0)}}Ie(4)}catch{}}var Ha=class{constructor(e,o){this.g=e,this.map=o}};function Mi(e){this.l=e||10,u.PerformanceNavigationTiming?(e=u.performance.getEntriesByType("navigation"),e=0<e.length&&(e[0].nextHopProtocol=="hq"||e[0].nextHopProtocol=="h2")):e=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Ui(e){return e.h?!0:e.g?e.g.size>=e.j:!1}function Fi(e){return e.h?1:e.g?e.g.size:0}function pn(e,o){return e.h?e.h==o:e.g?e.g.has(o):!1}function gn(e,o){e.g?e.g.add(o):e.h=o}function Vi(e,o){e.h&&e.h==o?e.h=null:e.g&&e.g.has(o)&&e.g.delete(o)}Mi.prototype.cancel=function(){if(this.i=ji(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const e of this.g.values())e.cancel();this.g.clear()}};function ji(e){if(e.h!=null)return e.i.concat(e.h.D);if(e.g!=null&&e.g.size!==0){let o=e.i;for(const a of e.g.values())o=o.concat(a.D);return o}return B(e.i)}function za(e){if(e.V&&typeof e.V=="function")return e.V();if(typeof Map<"u"&&e instanceof Map||typeof Set<"u"&&e instanceof Set)return Array.from(e.values());if(typeof e=="string")return e.split("");if(g(e)){for(var o=[],a=e.length,c=0;c<a;c++)o.push(e[c]);return o}o=[],a=0;for(c in e)o[a++]=e[c];return o}function Wa(e){if(e.na&&typeof e.na=="function")return e.na();if(!e.V||typeof e.V!="function"){if(typeof Map<"u"&&e instanceof Map)return Array.from(e.keys());if(!(typeof Set<"u"&&e instanceof Set)){if(g(e)||typeof e=="string"){var o=[];e=e.length;for(var a=0;a<e;a++)o.push(a);return o}o=[],a=0;for(const c in e)o[a++]=c;return o}}}function Bi(e,o){if(e.forEach&&typeof e.forEach=="function")e.forEach(o,void 0);else if(g(e)||typeof e=="string")Array.prototype.forEach.call(e,o,void 0);else for(var a=Wa(e),c=za(e),y=c.length,b=0;b<y;b++)o.call(void 0,c[b],a&&a[b],e)}var Hi=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Ga(e,o){if(e){e=e.split("&");for(var a=0;a<e.length;a++){var c=e[a].indexOf("="),y=null;if(0<=c){var b=e[a].substring(0,c);y=e[a].substring(c+1)}else b=e[a];o(b,y?decodeURIComponent(y.replace(/\+/g," ")):"")}}}function Kt(e){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,e instanceof Kt){this.h=e.h,lr(this,e.j),this.o=e.o,this.g=e.g,hr(this,e.s),this.l=e.l;var o=e.i,a=new De;a.i=o.i,o.g&&(a.g=new Map(o.g),a.h=o.h),zi(this,a),this.m=e.m}else e&&(o=String(e).match(Hi))?(this.h=!1,lr(this,o[1]||"",!0),this.o=Re(o[2]||""),this.g=Re(o[3]||"",!0),hr(this,o[4]),this.l=Re(o[5]||"",!0),zi(this,o[6]||"",!0),this.m=Re(o[7]||"")):(this.h=!1,this.i=new De(null,this.h))}Kt.prototype.toString=function(){var e=[],o=this.j;o&&e.push(ke(o,Wi,!0),":");var a=this.g;return(a||o=="file")&&(e.push("//"),(o=this.o)&&e.push(ke(o,Wi,!0),"@"),e.push(encodeURIComponent(String(a)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a=this.s,a!=null&&e.push(":",String(a))),(a=this.l)&&(this.g&&a.charAt(0)!="/"&&e.push("/"),e.push(ke(a,a.charAt(0)=="/"?Xa:Ka,!0))),(a=this.i.toString())&&e.push("?",a),(a=this.m)&&e.push("#",ke(a,Ya)),e.join("")};function Ct(e){return new Kt(e)}function lr(e,o,a){e.j=a?Re(o,!0):o,e.j&&(e.j=e.j.replace(/:$/,""))}function hr(e,o){if(o){if(o=Number(o),isNaN(o)||0>o)throw Error("Bad port number "+o);e.s=o}else e.s=null}function zi(e,o,a){o instanceof De?(e.i=o,Za(e.i,e.h)):(a||(o=ke(o,Ja)),e.i=new De(o,e.h))}function W(e,o,a){e.i.set(o,a)}function cr(e){return W(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function Re(e,o){return e?o?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function ke(e,o,a){return typeof e=="string"?(e=encodeURI(e).replace(o,qa),a&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function qa(e){return e=e.charCodeAt(0),"%"+(e>>4&15).toString(16)+(e&15).toString(16)}var Wi=/[#\/\?@]/g,Ka=/[#\?:]/g,Xa=/[#\?]/g,Ja=/[#\?@]/g,Ya=/#/g;function De(e,o){this.h=this.g=null,this.i=e||null,this.j=!!o}function Mt(e){e.g||(e.g=new Map,e.h=0,e.i&&Ga(e.i,function(o,a){e.add(decodeURIComponent(o.replace(/\+/g," ")),a)}))}r=De.prototype,r.add=function(e,o){Mt(this),this.i=null,e=ce(this,e);var a=this.g.get(e);return a||this.g.set(e,a=[]),a.push(o),this.h+=1,this};function Gi(e,o){Mt(e),o=ce(e,o),e.g.has(o)&&(e.i=null,e.h-=e.g.get(o).length,e.g.delete(o))}function qi(e,o){return Mt(e),o=ce(e,o),e.g.has(o)}r.forEach=function(e,o){Mt(this),this.g.forEach(function(a,c){a.forEach(function(y){e.call(o,y,c,this)},this)},this)},r.na=function(){Mt(this);const e=Array.from(this.g.values()),o=Array.from(this.g.keys()),a=[];for(let c=0;c<o.length;c++){const y=e[c];for(let b=0;b<y.length;b++)a.push(o[c])}return a},r.V=function(e){Mt(this);let o=[];if(typeof e=="string")qi(this,e)&&(o=o.concat(this.g.get(ce(this,e))));else{e=Array.from(this.g.values());for(let a=0;a<e.length;a++)o=o.concat(e[a])}return o},r.set=function(e,o){return Mt(this),this.i=null,e=ce(this,e),qi(this,e)&&(this.h-=this.g.get(e).length),this.g.set(e,[o]),this.h+=1,this},r.get=function(e,o){return e?(e=this.V(e),0<e.length?String(e[0]):o):o};function Ki(e,o,a){Gi(e,o),0<a.length&&(e.i=null,e.g.set(ce(e,o),B(a)),e.h+=a.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],o=Array.from(this.g.keys());for(var a=0;a<o.length;a++){var c=o[a];const b=encodeURIComponent(String(c)),E=this.V(c);for(c=0;c<E.length;c++){var y=b;E[c]!==""&&(y+="="+encodeURIComponent(String(E[c]))),e.push(y)}}return this.i=e.join("&")};function ce(e,o){return o=String(o),e.j&&(o=o.toLowerCase()),o}function Za(e,o){o&&!e.j&&(Mt(e),e.i=null,e.g.forEach(function(a,c){var y=c.toLowerCase();c!=y&&(Gi(this,c),Ki(this,y,a))},e)),e.j=o}function Qa(e,o){const a=new Pe;if(u.Image){const c=new Image;c.onload=$(Ut,a,"TestLoadImage: loaded",!0,o,c),c.onerror=$(Ut,a,"TestLoadImage: error",!1,o,c),c.onabort=$(Ut,a,"TestLoadImage: abort",!1,o,c),c.ontimeout=$(Ut,a,"TestLoadImage: timeout",!1,o,c),u.setTimeout(function(){c.ontimeout&&c.ontimeout()},1e4),c.src=e}else o(!1)}function tl(e,o){const a=new Pe,c=new AbortController,y=setTimeout(()=>{c.abort(),Ut(a,"TestPingServer: timeout",!1,o)},1e4);fetch(e,{signal:c.signal}).then(b=>{clearTimeout(y),b.ok?Ut(a,"TestPingServer: ok",!0,o):Ut(a,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(y),Ut(a,"TestPingServer: error",!1,o)})}function Ut(e,o,a,c,y){try{y&&(y.onload=null,y.onerror=null,y.onabort=null,y.ontimeout=null),c(a)}catch{}}function el(){this.g=new $a}function rl(e,o,a){const c=a||"";try{Bi(e,function(y,b){let E=y;A(y)&&(E=rn(y)),o.push(c+b+"="+encodeURIComponent(E))})}catch(y){throw o.push(c+"type="+encodeURIComponent("_badmap")),y}}function ur(e){this.l=e.Ub||null,this.j=e.eb||!1}D(ur,nn),ur.prototype.g=function(){return new dr(this.l,this.j)},ur.prototype.i=function(e){return function(){return e}}({});function dr(e,o){rt.call(this),this.D=e,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}D(dr,rt),r=dr.prototype,r.open=function(e,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=e,this.A=o,this.readyState=1,xe(this)},r.send=function(e){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const o={headers:this.u,method:this.B,credentials:this.m,cache:void 0};e&&(o.body=e),(this.D||u).fetch(new Request(this.A,o)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Oe(this)),this.readyState=0},r.Sa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,xe(this)),this.g&&(this.readyState=3,xe(this),this.g)))if(this.responseType==="arraybuffer")e.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Xi(this)}else e.text().then(this.Ra.bind(this),this.ga.bind(this))};function Xi(e){e.j.read().then(e.Pa.bind(e)).catch(e.ga.bind(e))}r.Pa=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var o=e.value?e.value:new Uint8Array(0);(o=this.v.decode(o,{stream:!e.done}))&&(this.response=this.responseText+=o)}e.done?Oe(this):xe(this),this.readyState==3&&Xi(this)}},r.Ra=function(e){this.g&&(this.response=this.responseText=e,Oe(this))},r.Qa=function(e){this.g&&(this.response=e,Oe(this))},r.ga=function(){this.g&&Oe(this)};function Oe(e){e.readyState=4,e.l=null,e.j=null,e.v=null,xe(e)}r.setRequestHeader=function(e,o){this.u.append(e,o)},r.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],o=this.h.entries();for(var a=o.next();!a.done;)a=a.value,e.push(a[0]+": "+a[1]),a=o.next();return e.join(`\r
`)};function xe(e){e.onreadystatechange&&e.onreadystatechange.call(e)}Object.defineProperty(dr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(e){this.m=e?"include":"same-origin"}});function Ji(e){let o="";return L(e,function(a,c){o+=c,o+=":",o+=a,o+=`\r
`}),o}function mn(e,o,a){t:{for(c in a){var c=!1;break t}c=!0}c||(a=Ji(a),typeof e=="string"?a!=null&&encodeURIComponent(String(a)):W(e,o,a))}function G(e){rt.call(this),this.headers=new Map,this.o=e||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}D(G,rt);var nl=/^https?$/i,il=["POST","PUT"];r=G.prototype,r.Ha=function(e){this.J=e},r.ea=function(e,o,a,c){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);o=o?o.toUpperCase():"GET",this.D=e,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():hn.g(),this.v=this.o?Ci(this.o):Ci(hn),this.g.onreadystatechange=C(this.Ea,this);try{this.B=!0,this.g.open(o,String(e),!0),this.B=!1}catch(b){Yi(this,b);return}if(e=a||"",a=new Map(this.headers),c)if(Object.getPrototypeOf(c)===Object.prototype)for(var y in c)a.set(y,c[y]);else if(typeof c.keys=="function"&&typeof c.get=="function")for(const b of c.keys())a.set(b,c.get(b));else throw Error("Unknown input type for opt_headers: "+String(c));c=Array.from(a.keys()).find(b=>b.toLowerCase()=="content-type"),y=u.FormData&&e instanceof u.FormData,!(0<=Array.prototype.indexOf.call(il,o,void 0))||c||y||a.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[b,E]of a)this.g.setRequestHeader(b,E);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ts(this),this.u=!0,this.g.send(e),this.u=!1}catch(b){Yi(this,b)}};function Yi(e,o){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=o,e.m=5,Zi(e),fr(e)}function Zi(e){e.A||(e.A=!0,st(e,"complete"),st(e,"error"))}r.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=e||7,st(this,"complete"),st(this,"abort"),fr(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),fr(this,!0)),G.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?Qi(this):this.bb())},r.bb=function(){Qi(this)};function Qi(e){if(e.h&&typeof h<"u"&&(!e.v[1]||Pt(e)!=4||e.Z()!=2)){if(e.u&&Pt(e)==4)Ei(e.Ea,0,e);else if(st(e,"readystatechange"),Pt(e)==4){e.h=!1;try{const E=e.Z();t:switch(E){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break t;default:o=!1}var a;if(!(a=o)){var c;if(c=E===0){var y=String(e.D).match(Hi)[1]||null;!y&&u.self&&u.self.location&&(y=u.self.location.protocol.slice(0,-1)),c=!nl.test(y?y.toLowerCase():"")}a=c}if(a)st(e,"complete"),st(e,"success");else{e.m=6;try{var b=2<Pt(e)?e.g.statusText:""}catch{b=""}e.l=b+" ["+e.Z()+"]",Zi(e)}}finally{fr(e)}}}}function fr(e,o){if(e.g){ts(e);const a=e.g,c=e.v[0]?()=>{}:null;e.g=null,e.v=null,o||st(e,"ready");try{a.onreadystatechange=c}catch{}}}function ts(e){e.I&&(u.clearTimeout(e.I),e.I=null)}r.isActive=function(){return!!this.g};function Pt(e){return e.g?e.g.readyState:0}r.Z=function(){try{return 2<Pt(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(e){if(this.g){var o=this.g.responseText;return e&&o.indexOf(e)==0&&(o=o.substring(e.length)),xa(o)}};function es(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.H){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch{return null}}function sl(e){const o={};e=(e.g&&2<=Pt(e)&&e.g.getAllResponseHeaders()||"").split(`\r
`);for(let c=0;c<e.length;c++){if(J(e[c]))continue;var a=_(e[c]);const y=a[0];if(a=a[1],typeof a!="string")continue;a=a.trim();const b=o[y]||[];o[y]=b,b.push(a)}v(o,function(c){return c.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function $e(e,o,a){return a&&a.internalChannelParams&&a.internalChannelParams[e]||o}function rs(e){this.Aa=0,this.i=[],this.j=new Pe,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=$e("failFast",!1,e),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=$e("baseRetryDelayMs",5e3,e),this.cb=$e("retryDelaySeedMs",1e4,e),this.Wa=$e("forwardChannelMaxRetries",2,e),this.wa=$e("forwardChannelRequestTimeoutMs",2e4,e),this.pa=e&&e.xmlHttpFactory||void 0,this.Xa=e&&e.Tb||void 0,this.Ca=e&&e.useFetchStreams||!1,this.L=void 0,this.J=e&&e.supportsCrossDomainXhr||!1,this.K="",this.h=new Mi(e&&e.concurrentRequestLimit),this.Da=new el,this.P=e&&e.fastHandshake||!1,this.O=e&&e.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=e&&e.Rb||!1,e&&e.xa&&this.j.xa(),e&&e.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&e&&e.detectBufferingProxy||!1,this.ja=void 0,e&&e.longPollingTimeout&&0<e.longPollingTimeout&&(this.ja=e.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=rs.prototype,r.la=8,r.G=1,r.connect=function(e,o,a,c){ot(0),this.W=e,this.H=o||{},a&&c!==void 0&&(this.H.OSID=a,this.H.OAID=c),this.F=this.X,this.I=us(this,null,this.W),gr(this)};function vn(e){if(ns(e),e.G==3){var o=e.U++,a=Ct(e.I);if(W(a,"SID",e.K),W(a,"RID",o),W(a,"TYPE","terminate"),Le(e,a),o=new Lt(e,e.j,o),o.L=2,o.v=cr(Ct(a)),a=!1,u.navigator&&u.navigator.sendBeacon)try{a=u.navigator.sendBeacon(o.v.toString(),"")}catch{}!a&&u.Image&&(new Image().src=o.v,a=!0),a||(o.g=ds(o.j,null),o.g.ea(o.v)),o.F=Date.now(),ar(o)}cs(e)}function pr(e){e.g&&(yn(e),e.g.cancel(),e.g=null)}function ns(e){pr(e),e.u&&(u.clearTimeout(e.u),e.u=null),mr(e),e.h.cancel(),e.s&&(typeof e.s=="number"&&u.clearTimeout(e.s),e.s=null)}function gr(e){if(!Ui(e.h)&&!e.s){e.s=!0;var o=e.Ga;be||_i(),Ae||(be(),Ae=!0),Kr.add(o,e),e.B=0}}function ol(e,o){return Fi(e.h)>=e.h.j-(e.s?1:0)?!1:e.s?(e.i=o.D.concat(e.i),!0):e.G==1||e.G==2||e.B>=(e.Va?0:e.Wa)?!1:(e.s=Ce(C(e.Ga,e,o),hs(e,e.B)),e.B++,!0)}r.Ga=function(e){if(this.s)if(this.s=null,this.G==1){if(!e){this.U=Math.floor(1e5*Math.random()),e=this.U++;const y=new Lt(this,this.j,e);let b=this.o;if(this.S&&(b?(b=d(b),m(b,this.S)):b=this.S),this.m!==null||this.O||(y.H=b,b=null),this.P)t:{for(var o=0,a=0;a<this.i.length;a++){e:{var c=this.i[a];if("__data__"in c.map&&(c=c.map.__data__,typeof c=="string")){c=c.length;break e}c=void 0}if(c===void 0)break;if(o+=c,4096<o){o=a;break t}if(o===4096||a===this.i.length-1){o=a+1;break t}}o=1e3}else o=1e3;o=ss(this,y,o),a=Ct(this.I),W(a,"RID",e),W(a,"CVER",22),this.D&&W(a,"X-HTTP-Session-Id",this.D),Le(this,a),b&&(this.O?o="headers="+encodeURIComponent(String(Ji(b)))+"&"+o:this.m&&mn(a,this.m,b)),gn(this.h,y),this.Ua&&W(a,"TYPE","init"),this.P?(W(a,"$req",o),W(a,"SID","null"),y.T=!0,un(y,a,null)):un(y,a,o),this.G=2}}else this.G==3&&(e?is(this,e):this.i.length==0||Ui(this.h)||is(this))};function is(e,o){var a;o?a=o.l:a=e.U++;const c=Ct(e.I);W(c,"SID",e.K),W(c,"RID",a),W(c,"AID",e.T),Le(e,c),e.m&&e.o&&mn(c,e.m,e.o),a=new Lt(e,e.j,a,e.B+1),e.m===null&&(a.H=e.o),o&&(e.i=o.D.concat(e.i)),o=ss(e,a,1e3),a.I=Math.round(.5*e.wa)+Math.round(.5*e.wa*Math.random()),gn(e.h,a),un(a,c,o)}function Le(e,o){e.H&&L(e.H,function(a,c){W(o,c,a)}),e.l&&Bi({},function(a,c){W(o,c,a)})}function ss(e,o,a){a=Math.min(e.i.length,a);var c=e.l?C(e.l.Na,e.l,e):null;t:{var y=e.i;let b=-1;for(;;){const E=["count="+a];b==-1?0<a?(b=y[0].g,E.push("ofs="+b)):b=0:E.push("ofs="+b);let H=!0;for(let Y=0;Y<a;Y++){let M=y[Y].g;const nt=y[Y].map;if(M-=b,0>M)b=Math.max(0,y[Y].g-100),H=!1;else try{rl(nt,E,"req"+M+"_")}catch{c&&c(nt)}}if(H){c=E.join("&");break t}}}return e=e.i.splice(0,a),o.D=e,c}function os(e){if(!e.g&&!e.u){e.Y=1;var o=e.Fa;be||_i(),Ae||(be(),Ae=!0),Kr.add(o,e),e.v=0}}function _n(e){return e.g||e.u||3<=e.v?!1:(e.Y++,e.u=Ce(C(e.Fa,e),hs(e,e.v)),e.v++,!0)}r.Fa=function(){if(this.u=null,as(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var e=2*this.R;this.j.info("BP detection timer enabled: "+e),this.A=Ce(C(this.ab,this),e)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ot(10),pr(this),as(this))};function yn(e){e.A!=null&&(u.clearTimeout(e.A),e.A=null)}function as(e){e.g=new Lt(e,e.j,"rpc",e.Y),e.m===null&&(e.g.H=e.o),e.g.O=0;var o=Ct(e.qa);W(o,"RID","rpc"),W(o,"SID",e.K),W(o,"AID",e.T),W(o,"CI",e.F?"0":"1"),!e.F&&e.ja&&W(o,"TO",e.ja),W(o,"TYPE","xmlhttp"),Le(e,o),e.m&&e.o&&mn(o,e.m,e.o),e.L&&(e.g.I=e.L);var a=e.g;e=e.ia,a.L=1,a.v=cr(Ct(o)),a.m=null,a.P=!0,xi(a,e)}r.Za=function(){this.C!=null&&(this.C=null,pr(this),_n(this),ot(19))};function mr(e){e.C!=null&&(u.clearTimeout(e.C),e.C=null)}function ls(e,o){var a=null;if(e.g==o){mr(e),yn(e),e.g=null;var c=2}else if(pn(e.h,o))a=o.D,Vi(e.h,o),c=1;else return;if(e.G!=0){if(o.o)if(c==1){a=o.m?o.m.length:0,o=Date.now()-o.F;var y=e.B;c=an(),st(c,new ki(c,a)),gr(e)}else os(e);else if(y=o.s,y==3||y==0&&0<o.X||!(c==1&&ol(e,o)||c==2&&_n(e)))switch(a&&0<a.length&&(o=e.h,o.i=o.i.concat(a)),y){case 1:Xt(e,5);break;case 4:Xt(e,10);break;case 3:Xt(e,6);break;default:Xt(e,2)}}}function hs(e,o){let a=e.Ta+Math.floor(Math.random()*e.cb);return e.isActive()||(a*=2),a*o}function Xt(e,o){if(e.j.info("Error code "+o),o==2){var a=C(e.fb,e),c=e.Xa;const y=!c;c=new Kt(c||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||lr(c,"https"),cr(c),y?Qa(c.toString(),a):tl(c.toString(),a)}else ot(2);e.G=0,e.l&&e.l.sa(o),cs(e),ns(e)}r.fb=function(e){e?(this.j.info("Successfully pinged google.com"),ot(2)):(this.j.info("Failed to ping google.com"),ot(1))};function cs(e){if(e.G=0,e.ka=[],e.l){const o=ji(e.h);(o.length!=0||e.i.length!=0)&&(O(e.ka,o),O(e.ka,e.i),e.h.i.length=0,B(e.i),e.i.length=0),e.l.ra()}}function us(e,o,a){var c=a instanceof Kt?Ct(a):new Kt(a);if(c.g!="")o&&(c.g=o+"."+c.g),hr(c,c.s);else{var y=u.location;c=y.protocol,o=o?o+"."+y.hostname:y.hostname,y=+y.port;var b=new Kt(null);c&&lr(b,c),o&&(b.g=o),y&&hr(b,y),a&&(b.l=a),c=b}return a=e.D,o=e.ya,a&&o&&W(c,a,o),W(c,"VER",e.la),Le(e,c),c}function ds(e,o,a){if(o&&!e.J)throw Error("Can't create secondary domain capable XhrIo object.");return o=e.Ca&&!e.pa?new G(new ur({eb:a})):new G(e.pa),o.Ha(e.J),o}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function fs(){}r=fs.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function ut(e,o){rt.call(this),this.g=new rs(o),this.l=e,this.h=o&&o.messageUrlParams||null,e=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(e?e["X-WebChannel-Content-Type"]=o.messageContentType:e={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.va&&(e?e["X-WebChannel-Client-Profile"]=o.va:e={"X-WebChannel-Client-Profile":o.va}),this.g.S=e,(e=o&&o.Sb)&&!J(e)&&(this.g.m=e),this.v=o&&o.supportsCrossDomainXhr||!1,this.u=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!J(o)&&(this.g.D=o,e=this.h,e!==null&&o in e&&(e=this.h,o in e&&delete e[o])),this.j=new ue(this)}D(ut,rt),ut.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},ut.prototype.close=function(){vn(this.g)},ut.prototype.o=function(e){var o=this.g;if(typeof e=="string"){var a={};a.__data__=e,e=a}else this.u&&(a={},a.__data__=rn(e),e=a);o.i.push(new Ha(o.Ya++,e)),o.G==3&&gr(o)},ut.prototype.N=function(){this.g.l=null,delete this.j,vn(this.g),delete this.g,ut.aa.N.call(this)};function ps(e){sn.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var o=e.__sm__;if(o){t:{for(const a in o){e=a;break t}e=void 0}(this.i=e)&&(e=this.i,o=o!==null&&e in o?o[e]:void 0),this.data=o}else this.data=e}D(ps,sn);function gs(){on.call(this),this.status=1}D(gs,on);function ue(e){this.g=e}D(ue,fs),ue.prototype.ua=function(){st(this.g,"a")},ue.prototype.ta=function(e){st(this.g,new ps(e))},ue.prototype.sa=function(e){st(this.g,new gs)},ue.prototype.ra=function(){st(this.g,"b")},ut.prototype.send=ut.prototype.o,ut.prototype.open=ut.prototype.m,ut.prototype.close=ut.prototype.close,ln.NO_ERROR=0,ln.TIMEOUT=8,ln.HTTP_ERROR=6,ja.COMPLETE="complete",La.EventType=Te,Te.OPEN="a",Te.CLOSE="b",Te.ERROR="c",Te.MESSAGE="d",rt.prototype.listen=rt.prototype.K,G.prototype.listenOnce=G.prototype.L,G.prototype.getLastError=G.prototype.Ka,G.prototype.getLastErrorCode=G.prototype.Ba,G.prototype.getStatus=G.prototype.Z,G.prototype.getResponseJson=G.prototype.Oa,G.prototype.getResponseText=G.prototype.oa,G.prototype.send=G.prototype.ea,G.prototype.setWithCredentials=G.prototype.Ha}).apply(typeof wr<"u"?wr:typeof self<"u"?self:typeof window<"u"?window:{});const Ks="@firebase/firestore",Xs="4.8.0";/**
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
 */class ct{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}ct.UNAUTHENTICATED=new ct(null),ct.GOOGLE_CREDENTIALS=new ct("google-credentials-uid"),ct.FIRST_PARTY=new ct("first-party-uid"),ct.MOCK_USER=new ct("mock-user");/**
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
 */let qr="11.10.0";/**
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
 */const Mr=new ai("@firebase/firestore");function mt(r,...t){if(Mr.logLevel<=j.DEBUG){const n=t.map(ua);Mr.debug(`Firestore (${qr}): ${r}`,...n)}}function ca(r,...t){if(Mr.logLevel<=j.ERROR){const n=t.map(ua);Mr.error(`Firestore (${qr}): ${r}`,...n)}}function ua(r){if(typeof r=="string")return r;try{/**
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
*/return function(n){return JSON.stringify(n)}(r)}catch{return r}}/**
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
 */function Ur(r,t,n){let i="Unexpected state";typeof t=="string"?i=t:n=t,da(r,i,n)}function da(r,t,n){let i=`FIRESTORE (${qr}) INTERNAL ASSERTION FAILED: ${t} (ID: ${r.toString(16)})`;if(n!==void 0)try{i+=" CONTEXT: "+JSON.stringify(n)}catch{i+=" CONTEXT: "+n}throw ca(i),new Error(i)}function He(r,t,n,i){let s="Unexpected state";typeof n=="string"?s=n:i=n,r||da(t,s,i)}/**
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
 */const F={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class V extends xt{constructor(t,n){super(t,n),this.code=t,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class ze{constructor(){this.promise=new Promise((t,n)=>{this.resolve=t,this.reject=n})}}/**
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
 */class zu{constructor(t,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class Wu{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,n){t.enqueueRetryable(()=>n(ct.UNAUTHENTICATED))}shutdown(){}}class Gu{constructor(t){this.t=t,this.currentUser=ct.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,n){He(this.o===void 0,42304);let i=this.i;const s=g=>this.i!==i?(i=this.i,n(g)):Promise.resolve();let l=new ze;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new ze,t.enqueueRetryable(()=>s(this.currentUser))};const h=()=>{const g=l;t.enqueueRetryable(async()=>{await g.promise,await s(this.currentUser)})},u=g=>{mt("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit(g=>u(g)),setTimeout(()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?u(g):(mt("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new ze)}},0),h()}getToken(){const t=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(i=>this.i!==t?(mt("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):i?(He(typeof i.accessToken=="string",31837,{l:i}),new zu(i.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return He(t===null||typeof t=="string",2055,{h:t}),new ct(t)}}class qu{constructor(t,n,i){this.P=t,this.T=n,this.I=i,this.type="FirstParty",this.user=ct.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Ku{constructor(t,n,i){this.P=t,this.T=n,this.I=i}getToken(){return Promise.resolve(new qu(this.P,this.T,this.I))}start(t,n){t.enqueueRetryable(()=>n(ct.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Js{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Xu{constructor(t,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Nt(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,n){He(this.o===void 0,3512);const i=l=>{l.error!=null&&mt("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.m;return this.m=l.token,mt("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?n(l.token):Promise.resolve()};this.o=l=>{t.enqueueRetryable(()=>i(l))};const s=l=>{mt("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(l=>s(l)),setTimeout(()=>{if(!this.appCheck){const l=this.V.getImmediate({optional:!0});l?s(l):mt("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Js(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(n=>n?(He(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Js(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Ju(r){const t=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(r);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(n);else for(let i=0;i<r;i++)n[i]=Math.floor(256*Math.random());return n}/**
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
 */class Zu{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516);let i="";for(;i.length<20;){const s=Ju(40);for(let l=0;l<s.length;++l)i.length<20&&s[l]<n&&(i+=t.charAt(s[l]%62))}return i}}function _t(r,t){return r<t?-1:r>t?1:0}function Qu(r,t){let n=0;for(;n<r.length&&n<t.length;){const i=r.codePointAt(n),s=t.codePointAt(n);if(i!==s){if(i<128&&s<128)return _t(i,s);{const l=Yu(),h=td(l.encode(Ys(r,n)),l.encode(Ys(t,n)));return h!==0?h:_t(i,s)}}n+=i>65535?2:1}return _t(r.length,t.length)}function Ys(r,t){return r.codePointAt(t)>65535?r.substring(t,t+2):r.substring(t,t+1)}function td(r,t){for(let n=0;n<r.length&&n<t.length;++n)if(r[n]!==t[n])return _t(r[n],t[n]);return _t(r.length,t.length)}/**
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
 */const Zs="__name__";class yt{constructor(t,n,i){n===void 0?n=0:n>t.length&&Ur(637,{offset:n,range:t.length}),i===void 0?i=t.length-n:i>t.length-n&&Ur(1746,{length:i,range:t.length-n}),this.segments=t,this.offset=n,this.len=i}get length(){return this.len}isEqual(t){return yt.comparator(this,t)===0}child(t){const n=this.segments.slice(this.offset,this.limit());return t instanceof yt?t.forEach(i=>{n.push(i)}):n.push(t),this.construct(n)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==t.get(n))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==t.get(n))return!1;return!0}forEach(t){for(let n=this.offset,i=this.limit();n<i;n++)t(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,n){const i=Math.min(t.length,n.length);for(let s=0;s<i;s++){const l=yt.compareSegments(t.get(s),n.get(s));if(l!==0)return l}return _t(t.length,n.length)}static compareSegments(t,n){const i=yt.isNumericId(t),s=yt.isNumericId(n);return i&&!s?-1:!i&&s?1:i&&s?yt.extractNumericId(t).compare(yt.extractNumericId(n)):Qu(t,n)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return ui.fromString(t.substring(4,t.length-2))}}class gt extends yt{construct(t,n,i){return new gt(t,n,i)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const n=[];for(const i of t){if(i.indexOf("//")>=0)throw new V(F.INVALID_ARGUMENT,`Invalid segment (${i}). Paths must not contain // in them.`);n.push(...i.split("/").filter(s=>s.length>0))}return new gt(n)}static emptyPath(){return new gt([])}}const ed=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Yt extends yt{construct(t,n,i){return new Yt(t,n,i)}static isValidIdentifier(t){return ed.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Yt.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Zs}static keyField(){return new Yt([Zs])}static fromServerFormat(t){const n=[];let i="",s=0;const l=()=>{if(i.length===0)throw new V(F.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(i),i=""};let h=!1;for(;s<t.length;){const u=t[s];if(u==="\\"){if(s+1===t.length)throw new V(F.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const g=t[s+1];if(g!=="\\"&&g!=="."&&g!=="`")throw new V(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);i+=g,s+=2}else u==="`"?(h=!h,s++):u!=="."||h?(i+=u,s++):(l(),s++)}if(l(),h)throw new V(F.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new Yt(n)}static emptyPath(){return new Yt([])}}/**
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
 */class te{constructor(t){this.path=t}static fromPath(t){return new te(gt.fromString(t))}static fromName(t){return new te(gt.fromString(t).popFirst(5))}static empty(){return new te(gt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&gt.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,n){return gt.comparator(t.path,n.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new te(new gt(t.slice()))}}function rd(r,t,n,i){if(t===!0&&i===!0)throw new V(F.INVALID_ARGUMENT,`${r} and ${n} cannot be used together.`)}function nd(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}/**
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
 */function K(r,t){const n={typeString:r};return t&&(n.value=t),n}function tr(r,t){if(!nd(r))throw new V(F.INVALID_ARGUMENT,"JSON must be an object");let n;for(const i in t)if(t[i]){const s=t[i].typeString,l="value"in t[i]?{value:t[i].value}:void 0;if(!(i in r)){n=`JSON missing required field: '${i}'`;break}const h=r[i];if(s&&typeof h!==s){n=`JSON field '${i}' must be a ${s}.`;break}if(l!==void 0&&h!==l.value){n=`Expected '${i}' field to equal '${l.value}'`;break}}if(n)throw new V(F.INVALID_ARGUMENT,n);return!0}/**
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
 */const Qs=-62135596800,to=1e6;class k{static now(){return k.fromMillis(Date.now())}static fromDate(t){return k.fromMillis(t.getTime())}static fromMillis(t){const n=Math.floor(t/1e3),i=Math.floor((t-1e3*n)*to);return new k(n,i)}constructor(t,n){if(this.seconds=t,this.nanoseconds=n,n<0)throw new V(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new V(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(t<Qs)throw new V(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new V(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/to}_compareTo(t){return this.seconds===t.seconds?_t(this.nanoseconds,t.nanoseconds):_t(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:k._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(tr(t,k._jsonSchema))return new k(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-Qs;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}k._jsonSchemaVersion="firestore/timestamp/1.0",k._jsonSchema={type:K("string",k._jsonSchemaVersion),seconds:K("number"),nanoseconds:K("number")};function id(r){return r.name==="IndexedDbTransactionError"}/**
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
 */class oe{constructor(t){this.binaryString=t}static fromBase64String(t){const n=function(s){try{return atob(s)}catch(l){throw typeof DOMException<"u"&&l instanceof DOMException?new sd("Invalid base64 string: "+l):l}}(t);return new oe(n)}static fromUint8Array(t){const n=function(s){let l="";for(let h=0;h<s.length;++h)l+=String.fromCharCode(s[h]);return l}(t);return new oe(n)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const i=new Uint8Array(n.length);for(let s=0;s<n.length;s++)i[s]=n.charCodeAt(s);return i}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return _t(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}oe.EMPTY_BYTE_STRING=new oe("");const eo="(default)";class Fr{constructor(t,n){this.projectId=t,this.database=n||eo}static empty(){return new Fr("","")}get isDefaultDatabase(){return this.database===eo}isEqual(t){return t instanceof Fr&&t.projectId===this.projectId&&t.database===this.database}}/**
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
 */class od{constructor(t,n=null,i=[],s=[],l=null,h="F",u=null,g=null){this.path=t,this.collectionGroup=n,this.explicitOrderBy=i,this.filters=s,this.limit=l,this.limitType=h,this.startAt=u,this.endAt=g,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function ad(r){return new od(r)}/**
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
 */class cd{constructor(t,n,i=1e3,s=1.5,l=6e4){this.Fi=t,this.timerId=n,this.d_=i,this.E_=s,this.A_=l,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(t){this.cancel();const n=Math.floor(this.R_+this.p_()),i=Math.max(0,Date.now()-this.m_),s=Math.max(0,n-i);s>0&&mt("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${n} ms, last attempt: ${i} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),t())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
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
 */class di{constructor(t,n,i,s,l){this.asyncQueue=t,this.timerId=n,this.targetTimeMs=i,this.op=s,this.removalCallback=l,this.deferred=new ze,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(h=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,n,i,s,l){const h=Date.now()+i,u=new di(t,n,h,s,l);return u.start(i),u}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new V(F.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var no,io;(io=no||(no={})).Fa="default",io.Cache="cache";/**
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
 */function ud(r){const t={};return r.timeoutSeconds!==void 0&&(t.timeoutSeconds=r.timeoutSeconds),t}/**
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
 */const dd="firestore.googleapis.com",oo=!0;class ao{constructor(t){var n,i;if(t.host===void 0){if(t.ssl!==void 0)throw new V(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=dd,this.ssl=oo}else this.host=t.host,this.ssl=(n=t.ssl)!==null&&n!==void 0?n:oo;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=ld;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<hd)throw new V(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}rd("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ud((i=t.experimentalLongPollingOptions)!==null&&i!==void 0?i:{}),function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new V(F.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(i,s){return i.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class fd{constructor(t,n,i,s){this._authCredentials=t,this._appCheckCredentials=n,this._databaseId=i,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ao({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new V(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new V(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ao(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(i){if(!i)return new Wu;switch(i.type){case"firstParty":return new Ku(i.sessionIndex||"0",i.iamToken||null,i.authTokenFactory||null);case"provider":return i.client;default:throw new V(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const i=so.get(n);i&&(mt("ComponentProvider","Removing Datastore"),so.delete(n),i.terminate())}(this),Promise.resolve()}}/**
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
 */class fi{constructor(t,n,i){this.converter=n,this._query=i,this.type="query",this.firestore=t}withConverter(t){return new fi(this.firestore,t,this._query)}}class bt{constructor(t,n,i){this.converter=n,this._key=i,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new pi(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new bt(this.firestore,t,this._key)}toJSON(){return{type:bt._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,n,i){if(tr(n,bt._jsonSchema))return new bt(t,i||null,new te(gt.fromString(n.referencePath)))}}bt._jsonSchemaVersion="firestore/documentReference/1.0",bt._jsonSchema={type:K("string",bt._jsonSchemaVersion),referencePath:K("string")};class pi extends fi{constructor(t,n,i){super(t,n,ad(i)),this._path=i,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new bt(this.firestore,null,new te(t))}withConverter(t){return new pi(this.firestore,t,this._path)}}/**
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
 */const lo="AsyncQueue";class ho{constructor(t=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new cd(this,"async_queue_retry"),this.oc=()=>{const i=Ln();i&&mt(lo,"Visibility state changed to "+i.visibilityState),this.F_.y_()},this._c=t;const n=Ln();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.ac(),this.uc(t)}enterRestrictedMode(t){if(!this.Xu){this.Xu=!0,this.rc=t||!1;const n=Ln();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.oc)}}enqueue(t){if(this.ac(),this.Xu)return new Promise(()=>{});const n=new ze;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(t().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Zu.push(t),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(t){if(!id(t))throw t;mt(lo,"Operation failed with retryable error: "+t)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(t){const n=this._c.then(()=>(this.nc=!0,t().catch(i=>{throw this.tc=i,this.nc=!1,ca("INTERNAL UNHANDLED ERROR: ",co(i)),i}).then(i=>(this.nc=!1,i))));return this._c=n,n}enqueueAfterDelay(t,n,i){this.ac(),this.sc.indexOf(t)>-1&&(n=0);const s=di.createAndSchedule(this,t,n,i,l=>this.lc(l));return this.ec.push(s),s}ac(){this.tc&&Ur(47125,{hc:co(this.tc)})}verifyOperationInProgress(){}async Pc(){let t;do t=this._c,await t;while(t!==this._c)}Tc(t){for(const n of this.ec)if(n.timerId===t)return!0;return!1}Ic(t){return this.Pc().then(()=>{this.ec.sort((n,i)=>n.targetTimeMs-i.targetTimeMs);for(const n of this.ec)if(n.skipDelay(),t!=="all"&&n.timerId===t)break;return this.Pc()})}dc(t){this.sc.push(t)}lc(t){const n=this.ec.indexOf(t);this.ec.splice(n,1)}}function co(r){let t=r.message||"";return r.stack&&(t=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),t}class pd extends fd{constructor(t,n,i,s){super(t,n,i,s),this.type="firestore",this._queue=new ho,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new ho(t),this._firestoreClient=void 0,await t}}}/**
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
 */class Rt{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Rt(oe.fromBase64String(t))}catch(n){throw new V(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(t){return new Rt(oe.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Rt._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(tr(t,Rt._jsonSchema))return Rt.fromBase64String(t.bytes)}}Rt._jsonSchemaVersion="firestore/bytes/1.0",Rt._jsonSchema={type:K("string",Rt._jsonSchemaVersion),bytes:K("string")};/**
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
 */class fa{constructor(...t){for(let n=0;n<t.length;++n)if(t[n].length===0)throw new V(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Yt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
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
 */class re{constructor(t,n){if(!isFinite(t)||t<-90||t>90)throw new V(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(n)||n<-180||n>180)throw new V(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=t,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return _t(this._lat,t._lat)||_t(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:re._jsonSchemaVersion}}static fromJSON(t){if(tr(t,re._jsonSchema))return new re(t.latitude,t.longitude)}}re._jsonSchemaVersion="firestore/geoPoint/1.0",re._jsonSchema={type:K("string",re._jsonSchemaVersion),latitude:K("number"),longitude:K("number")};/**
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
 */class ne{constructor(t){this._values=(t||[]).map(n=>n)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(i,s){if(i.length!==s.length)return!1;for(let l=0;l<i.length;++l)if(i[l]!==s[l])return!1;return!0}(this._values,t._values)}toJSON(){return{type:ne._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(tr(t,ne._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(n=>typeof n=="number"))return new ne(t.vectorValues);throw new V(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}ne._jsonSchemaVersion="firestore/vectorValue/1.0",ne._jsonSchema={type:K("string",ne._jsonSchemaVersion),vectorValues:K("object")};const gd=new RegExp("[~\\*/\\[\\]]");function md(r,t,n){if(t.search(gd)>=0)throw uo(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,r);try{return new fa(...t.split("."))._internalPath}catch{throw uo(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r)}}function uo(r,t,n,i,s){let l=`Function ${t}() called with invalid data`;l+=". ";let h="";return new V(F.INVALID_ARGUMENT,l+r+h)}/**
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
 */class pa{constructor(t,n,i,s,l){this._firestore=t,this._userDataWriter=n,this._key=i,this._document=s,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new bt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new vd(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const n=this._document.data.field(ga("DocumentSnapshot.get",t));if(n!==null)return this._userDataWriter.convertValue(n)}}}class vd extends pa{data(){return super.data()}}function ga(r,t){return typeof t=="string"?md(r,t):t instanceof fa?t._internalPath:t._delegate._internalPath}class br{constructor(t,n){this.hasPendingWrites=t,this.fromCache=n}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class ve extends pa{constructor(t,n,i,s,l,h){super(t,n,i,s,h),this._firestore=t,this._firestoreImpl=t,this.metadata=l}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const n=new Pr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,n={}){if(this._document){const i=this._document.data.field(ga("DocumentSnapshot.get",t));if(i!==null)return this._userDataWriter.convertValue(i,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new V(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,n={};return n.type=ve._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}}ve._jsonSchemaVersion="firestore/documentSnapshot/1.0",ve._jsonSchema={type:K("string",ve._jsonSchemaVersion),bundleSource:K("string","DocumentSnapshot"),bundleName:K("string"),bundle:K("string")};class Pr extends ve{data(t={}){return super.data(t)}}class We{constructor(t,n,i,s){this._firestore=t,this._userDataWriter=n,this._snapshot=s,this.metadata=new br(s.hasPendingWrites,s.fromCache),this.query=i}get docs(){const t=[];return this.forEach(n=>t.push(n)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,n){this._snapshot.docs.forEach(i=>{t.call(n,new Pr(this._firestore,this._userDataWriter,i.key,i,new br(this._snapshot.mutatedKeys.has(i.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const n=!!t.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new V(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,l){if(s._snapshot.oldDocs.isEmpty()){let h=0;return s._snapshot.docChanges.map(u=>{const g=new Pr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new br(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:g,oldIndex:-1,newIndex:h++}})}{let h=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(u=>l||u.type!==3).map(u=>{const g=new Pr(s._firestore,s._userDataWriter,u.doc.key,u.doc,new br(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let A=-1,T=-1;return u.type!==0&&(A=h.indexOf(u.doc.key),h=h.delete(u.doc.key)),u.type!==1&&(h=h.add(u.doc),T=h.indexOf(u.doc.key)),{type:_d(u.type),doc:g,oldIndex:A,newIndex:T}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new V(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=We._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Zu.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const n=[],i=[],s=[];return this.docs.forEach(l=>{l._document!==null&&(n.push(l._document),i.push(this._userDataWriter.convertObjectMap(l._document.data.value.mapValue.fields,"previous")),s.push(l.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function _d(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Ur(61501,{type:r})}}We._jsonSchemaVersion="firestore/querySnapshot/1.0",We._jsonSchema={type:K("string",We._jsonSchemaVersion),bundleSource:K("string","QuerySnapshot"),bundleName:K("string"),bundle:K("string")};(function(t,n=!0){(function(s){qr=s})(Ze),zt(new Ht("firestore",(i,{instanceIdentifier:s,options:l})=>{const h=i.getProvider("app").getImmediate(),u=new pd(new Gu(i.getProvider("auth-internal")),new Xu(h,i.getProvider("app-check-internal")),function(A,T){if(!Object.prototype.hasOwnProperty.apply(A.options,["projectId"]))throw new V(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fr(A.options.projectId,T)}(h,s),h);return l=Object.assign({useFetchStreams:n},l),u._setSettings(l),u},"PUBLIC").setMultipleInstances(!0)),dt(Ks,Xs,t),dt(Ks,Xs,"esm2017")})();/**
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
 */class Tt extends xt{constructor(t,n,i=0){super(Mn(t),`Firebase Storage: ${n} (${Mn(t)})`),this.status_=i,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Tt.prototype)}get status(){return this.status_}set status(t){this.status_=t}_codeEquals(t){return Mn(t)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(t){this.customData.serverResponse=t,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var Et;(function(r){r.UNKNOWN="unknown",r.OBJECT_NOT_FOUND="object-not-found",r.BUCKET_NOT_FOUND="bucket-not-found",r.PROJECT_NOT_FOUND="project-not-found",r.QUOTA_EXCEEDED="quota-exceeded",r.UNAUTHENTICATED="unauthenticated",r.UNAUTHORIZED="unauthorized",r.UNAUTHORIZED_APP="unauthorized-app",r.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",r.INVALID_CHECKSUM="invalid-checksum",r.CANCELED="canceled",r.INVALID_EVENT_NAME="invalid-event-name",r.INVALID_URL="invalid-url",r.INVALID_DEFAULT_BUCKET="invalid-default-bucket",r.NO_DEFAULT_BUCKET="no-default-bucket",r.CANNOT_SLICE_BLOB="cannot-slice-blob",r.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",r.NO_DOWNLOAD_URL="no-download-url",r.INVALID_ARGUMENT="invalid-argument",r.INVALID_ARGUMENT_COUNT="invalid-argument-count",r.APP_DELETED="app-deleted",r.INVALID_ROOT_OPERATION="invalid-root-operation",r.INVALID_FORMAT="invalid-format",r.INTERNAL_ERROR="internal-error",r.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Et||(Et={}));function Mn(r){return"storage/"+r}function Ad(){const r="An unknown error occurred, please check the error payload for server response.";return new Tt(Et.UNKNOWN,r)}function Ed(){return new Tt(Et.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function Sd(){return new Tt(Et.CANCELED,"User canceled the upload/download.")}function Td(r){return new Tt(Et.INVALID_URL,"Invalid URL '"+r+"'.")}function Id(r){return new Tt(Et.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+r+"'.")}function fo(r){return new Tt(Et.INVALID_ARGUMENT,r)}function va(){return new Tt(Et.APP_DELETED,"The Firebase app was deleted.")}function Cd(r){return new Tt(Et.INVALID_ROOT_OPERATION,"The operation '"+r+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
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
 */class vt{constructor(t,n){this.bucket=t,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const t=encodeURIComponent;return"/b/"+t(this.bucket)+"/o/"+t(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(t,n){let i;try{i=vt.makeFromUrl(t,n)}catch{return new vt(t,"")}if(i.path==="")return i;throw Id(t)}static makeFromUrl(t,n){let i=null;const s="([A-Za-z0-9.\\-_]+)";function l(P){P.path.charAt(P.path.length-1)==="/"&&(P.path_=P.path_.slice(0,-1))}const h="(/(.*))?$",u=new RegExp("^gs://"+s+h,"i"),g={bucket:1,path:3};function A(P){P.path_=decodeURIComponent(P.path)}const T="v[A-Za-z0-9_]+",S=n.replace(/[.]/g,"\\."),C="(/([^?#]*).*)?$",$=new RegExp(`^https?://${S}/${T}/b/${s}/o${C}`,"i"),D={bucket:1,path:3},B=n===ma?"(?:storage.googleapis.com|storage.cloud.google.com)":n,O="([^?#]*)",tt=new RegExp(`^https?://${B}/${s}/${O}`,"i"),R=[{regex:u,indices:g,postModify:l},{regex:$,indices:D,postModify:A},{regex:tt,indices:{bucket:1,path:2},postModify:A}];for(let P=0;P<R.length;P++){const N=R[P],L=N.regex.exec(t);if(L){const v=L[N.indices.bucket];let d=L[N.indices.path];d||(d=""),i=new vt(v,d),N.postModify(i);break}}if(i==null)throw Td(t);return i}}class Pd{constructor(t){this.promise_=Promise.reject(t)}getPromise(){return this.promise_}cancel(t=!1){}}/**
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
 */function Nd(r,t,n){let i=1,s=null,l=null,h=!1,u=0;function g(){return u===2}let A=!1;function T(...O){A||(A=!0,t.apply(null,O))}function S(O){s=setTimeout(()=>{s=null,r($,g())},O)}function C(){l&&clearTimeout(l)}function $(O,...tt){if(A){C();return}if(O){C(),T.call(null,O,...tt);return}if(g()||h){C(),T.call(null,O,...tt);return}i<64&&(i*=2);let R;u===1?(u=2,R=0):R=(i+Math.random())*1e3,S(R)}let D=!1;function B(O){D||(D=!0,C(),!A&&(s!==null?(O||(u=2),clearTimeout(s),S(0)):O||(u=1)))}return S(0),l=setTimeout(()=>{h=!0,B(!0)},n),B}function Rd(r){r(!1)}/**
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
 */function kd(r){return r!==void 0}function po(r,t,n,i){if(i<t)throw fo(`Invalid value for '${r}'. Expected ${t} or greater.`);if(i>n)throw fo(`Invalid value for '${r}'. Expected ${n} or less.`)}function Dd(r){const t=encodeURIComponent;let n="?";for(const i in r)if(r.hasOwnProperty(i)){const s=t(i)+"="+t(r[i]);n=n+s+"&"}return n=n.slice(0,-1),n}var Vr;(function(r){r[r.NO_ERROR=0]="NO_ERROR",r[r.NETWORK_ERROR=1]="NETWORK_ERROR",r[r.ABORT=2]="ABORT"})(Vr||(Vr={}));/**
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
 */function Od(r,t){const n=r>=500&&r<600,s=[408,429].indexOf(r)!==-1,l=t.indexOf(r)!==-1;return n||s||l}/**
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
 */class xd{constructor(t,n,i,s,l,h,u,g,A,T,S,C=!0,$=!1){this.url_=t,this.method_=n,this.headers_=i,this.body_=s,this.successCodes_=l,this.additionalRetryCodes_=h,this.callback_=u,this.errorCallback_=g,this.timeout_=A,this.progressCallback_=T,this.connectionFactory_=S,this.retry=C,this.isUsingEmulator=$,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((D,B)=>{this.resolve_=D,this.reject_=B,this.start_()})}start_(){const t=(i,s)=>{if(s){i(!1,new Ar(!1,null,!0));return}const l=this.connectionFactory_();this.pendingConnection_=l;const h=u=>{const g=u.loaded,A=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(g,A)};this.progressCallback_!==null&&l.addUploadProgressListener(h),l.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&l.removeUploadProgressListener(h),this.pendingConnection_=null;const u=l.getErrorCode()===Vr.NO_ERROR,g=l.getStatus();if(!u||Od(g,this.additionalRetryCodes_)&&this.retry){const T=l.getErrorCode()===Vr.ABORT;i(!1,new Ar(!1,null,T));return}const A=this.successCodes_.indexOf(g)!==-1;i(!0,new Ar(A,l))})},n=(i,s)=>{const l=this.resolve_,h=this.reject_,u=s.connection;if(s.wasSuccessCode)try{const g=this.callback_(u,u.getResponse());kd(g)?l(g):l()}catch(g){h(g)}else if(u!==null){const g=Ad();g.serverResponse=u.getErrorText(),this.errorCallback_?h(this.errorCallback_(u,g)):h(g)}else if(s.canceled){const g=this.appDelete_?va():Sd();h(g)}else{const g=Ed();h(g)}};this.canceled_?n(!1,new Ar(!1,null,!0)):this.backoffId_=Nd(t,n,this.timeout_)}getPromise(){return this.promise_}cancel(t){this.canceled_=!0,this.appDelete_=t||!1,this.backoffId_!==null&&Rd(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Ar{constructor(t,n,i){this.wasSuccessCode=t,this.connection=n,this.canceled=!!i}}function $d(r,t){t!==null&&t.length>0&&(r.Authorization="Firebase "+t)}function Ld(r,t){r["X-Firebase-Storage-Version"]="webjs/"+(t??"AppManager")}function Md(r,t){t&&(r["X-Firebase-GMPID"]=t)}function Ud(r,t){t!==null&&(r["X-Firebase-AppCheck"]=t)}function Fd(r,t,n,i,s,l,h=!0,u=!1){const g=Dd(r.urlParams),A=r.url+g,T=Object.assign({},r.headers);return Md(T,t),$d(T,n),Ld(T,l),Ud(T,i),new xd(A,r.method,T,r.body,r.successCodes,r.additionalRetryCodes,r.handler,r.errorHandler,r.timeout,r.progressCallback,s,h,u)}/**
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
 */function Vd(r){if(r.length===0)return null;const t=r.lastIndexOf("/");return t===-1?"":r.slice(0,t)}function jd(r){const t=r.lastIndexOf("/",r.length-2);return t===-1?r:r.slice(t+1)}/**
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
 */class jr{constructor(t,n){this._service=t,n instanceof vt?this._location=n:this._location=vt.makeFromUrl(n,t.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(t,n){return new jr(t,n)}get root(){const t=new vt(this._location.bucket,"");return this._newRef(this._service,t)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return jd(this._location.path)}get storage(){return this._service}get parent(){const t=Vd(this._location.path);if(t===null)return null;const n=new vt(this._location.bucket,t);return new jr(this._service,n)}_throwIfRoot(t){if(this._location.path==="")throw Cd(t)}}function go(r,t){const n=t==null?void 0:t[yd];return n==null?null:vt.makeFromBucketSpec(n,r)}class Bd{constructor(t,n,i,s,l,h=!1){this.app=t,this._authProvider=n,this._appCheckProvider=i,this._url=s,this._firebaseVersion=l,this._isUsingEmulator=h,this._bucket=null,this._host=ma,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=wd,this._maxUploadRetryTime=bd,this._requests=new Set,s!=null?this._bucket=vt.makeFromBucketSpec(s,this._host):this._bucket=go(this._host,this.app.options)}get host(){return this._host}set host(t){this._host=t,this._url!=null?this._bucket=vt.makeFromBucketSpec(this._url,t):this._bucket=go(t,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(t){po("time",0,Number.POSITIVE_INFINITY,t),this._maxUploadRetryTime=t}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(t){po("time",0,Number.POSITIVE_INFINITY,t),this._maxOperationRetryTime=t}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const t=this._authProvider.getImmediate({optional:!0});if(t){const n=await t.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Nt(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=this._appCheckProvider.getImmediate({optional:!0});return t?(await t.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(t=>t.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(t){return new jr(this,t)}_makeRequest(t,n,i,s,l=!0){if(this._deleted)return new Pd(va());{const h=Fd(t,this._appId,i,s,n,this._firebaseVersion,l,this._isUsingEmulator);return this._requests.add(h),h.getPromise().then(()=>this._requests.delete(h),()=>this._requests.delete(h)),h}}async makeRequestWithTokens(t,n){const[i,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(t,n,i,s).getPromise()}}const mo="@firebase/storage",vo="0.13.14";/**
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
 */const Hd="storage";function zd(r,{instanceIdentifier:t}){const n=r.getProvider("app").getImmediate(),i=r.getProvider("auth-internal"),s=r.getProvider("app-check-internal");return new Bd(n,i,s,t,Ze)}function Wd(){zt(new Ht(Hd,zd,"PUBLIC").setMultipleInstances(!0)),dt(mo,vo,""),dt(mo,vo,"esm2017")}Wd();/**
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
 */class qd{constructor(t,n,i,s){this.app=t,this.auth=null,this.messaging=null,this.appCheck=null,this.serverAppAppCheckToken=null,Nt(t)&&t.settings.appCheckToken&&(this.serverAppAppCheckToken=t.settings.appCheckToken),this.auth=n.getImmediate({optional:!0}),this.messaging=i.getImmediate({optional:!0}),this.auth||n.get().then(l=>this.auth=l,()=>{}),this.messaging||i.get().then(l=>this.messaging=l,()=>{}),this.appCheck||s==null||s.get().then(l=>this.appCheck=l,()=>{})}async getAuthToken(){if(this.auth)try{const t=await this.auth.getToken();return t==null?void 0:t.accessToken}catch{return}}async getMessagingToken(){if(!(!this.messaging||!("Notification"in self)||Notification.permission!=="granted"))try{return await this.messaging.getToken()}catch{return}}async getAppCheckToken(t){if(this.serverAppAppCheckToken)return this.serverAppAppCheckToken;if(this.appCheck){const n=t?await this.appCheck.getLimitedUseToken():await this.appCheck.getToken();return n.error?null:n.token}return null}async getContext(t){const n=await this.getAuthToken(),i=await this.getMessagingToken(),s=await this.getAppCheckToken(t);return{authToken:n,messagingToken:i,appCheckToken:s}}}/**
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
 */const _o="us-central1";class Kd{constructor(t,n,i,s,l=_o,h=(...u)=>fetch(...u)){this.app=t,this.fetchImpl=h,this.emulatorOrigin=null,this.contextProvider=new qd(t,n,i,s),this.cancelAllRequests=new Promise(u=>{this.deleteService=()=>Promise.resolve(u())});try{const u=new URL(l);this.customDomain=u.origin+(u.pathname==="/"?"":u.pathname),this.region=_o}catch{this.customDomain=null,this.region=l}}_delete(){return this.deleteService()}_url(t){const n=this.app.options.projectId;return this.emulatorOrigin!==null?`${this.emulatorOrigin}/${n}/${this.region}/${t}`:this.customDomain!==null?`${this.customDomain}/${t}`:`https://${this.region}-${n}.cloudfunctions.net/${t}`}}const yo="@firebase/functions",wo="0.12.9";/**
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
 */const Xd="auth-internal",Jd="app-check-internal",Yd="messaging-internal";function Zd(r){const t=(n,{instanceIdentifier:i})=>{const s=n.getProvider("app").getImmediate(),l=n.getProvider(Xd),h=n.getProvider(Yd),u=n.getProvider(Jd);return new Kd(s,l,h,u,i)};zt(new Ht(Gd,t,"PUBLIC").setMultipleInstances(!0)),dt(yo,wo,r),dt(yo,wo,"esm2017")}Zd();var Qd="firebase",tf="11.10.0";/**
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
 */dt(Qd,tf,"app");const ef=I(null),rf=I("idle"),nf=I(null),sf=I(!1);Q(()=>({authUser:ef.get(),authState:rf.get(),error:nf.get(),initialized:sf.get()}));const of={showCompleted:!0,priority:"all",tag:"all",search:""},_a=I({...of}),ya=I({status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:5,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"All todos"}),gi=I(null);Q(()=>{const r=gi.get();return r?r.state.get():ya.get()});Q(()=>_a.get());function af(r){if(gi.get())throw new Error("Cannot set demo state after the todo store has been initialized.");ya.set(r)}function lf(r){if(gi.get())throw new Error("Cannot set demo filters after the todo store has been initialized.");_a.set(r)}if(typeof globalThis=="object"){const r=globalThis;r.__dfSetTodoDemoState=af,r.__dfSetTodoDemoFilters=lf}const hf=50,cf=I({status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:hf,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"Latest messages"}),uf=I("idle"),df=I(null),ff=I(null);Q(()=>{const r=ff.get();return r?r.state.get():cf.get()});Q(()=>({status:uf.get(),error:df.get()}));const pf=I("idle"),gf=I(0),mf=I(null),vf=I(null);Q(()=>({status:pf.get(),progress:gf.get(),error:mf.get(),uploadedFile:vf.get()}));I(null);const _f=I({status:"idle",data:null,error:null,lastCalled:null}),yf=I({status:"idle",data:null,error:null,lastCalled:null}),wf=I({status:"idle",data:null,error:null,lastCalled:null});Q(()=>_f.get());Q(()=>yf.get());Q(()=>wf.get());const bf=20,Af={status:"idle",documents:[],error:null,isListening:!1,lastUpdated:null,currentPage:1,pageSize:bf,hasNextPage:!1,hasPreviousPage:!1,queryDescription:"Awaiting authentication"},Ef=I({...Af}),Sf=I(null);I(null);I(null);Q(()=>{const r=Sf.get();return r?r.state.get():Ef.get()});k.fromDate(new Date("2024-01-15")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-16")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-01-17")),k.fromDate(new Date("2024-01-17")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-01-18")),k.fromDate(new Date("2024-01-18")),k.fromDate(new Date("2024-01-28")),k.fromDate(new Date("2024-01-19")),k.fromDate(new Date("2024-01-19")),k.fromDate(new Date("2024-02-05")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-01-20")),k.fromDate(new Date("2024-02-10")),k.fromDate(new Date("2024-01-21")),k.fromDate(new Date("2024-01-21")),k.fromDate(new Date("2024-02-15")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-01-22")),k.fromDate(new Date("2024-02-12")),k.fromDate(new Date("2024-01-23")),k.fromDate(new Date("2024-01-23")),k.fromDate(new Date("2024-02-01")),k.fromDate(new Date("2024-01-24")),k.fromDate(new Date("2024-01-24")),k.fromDate(new Date("2024-02-20")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-01-25")),k.fromDate(new Date("2024-02-18")),k.fromDate(new Date("2024-01-26")),k.fromDate(new Date("2024-01-26")),k.fromDate(new Date("2024-02-08"));const Tf=I([]),If=I(!1),Cf=I("");Q(()=>({users:Tf.get(),loading:If.get(),error:Cf.get()}));/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Pf extends kt{connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){return lt`<span class="shadow"></span>`}}/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Nf=ae`:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Jn=class extends Pf{};Jn.styles=[Nf];Jn=X([Je("md-elevation")],Jn);/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const wa=Symbol("attachableController");let Nr;Nr=new MutationObserver(r=>{var t;for(const n of r)(t=n.target[wa])==null||t.hostConnected()});class ba{get htmlFor(){return this.host.getAttribute("for")}set htmlFor(t){t===null?this.host.removeAttribute("for"):this.host.setAttribute("for",t)}get control(){return this.host.hasAttribute("for")?!this.htmlFor||!this.host.isConnected?null:this.host.getRootNode().querySelector(`#${this.htmlFor}`):this.currentControl||this.host.parentElement}set control(t){t?this.attach(t):this.detach()}constructor(t,n){this.host=t,this.onControlChange=n,this.currentControl=null,t.addController(this),t[wa]=this,Nr==null||Nr.observe(t,{attributeFilter:["for"]})}attach(t){t!==this.currentControl&&(this.setCurrentControl(t),this.host.removeAttribute("for"))}detach(){this.setCurrentControl(null),this.host.setAttribute("for","")}hostConnected(){this.setCurrentControl(this.control)}hostDisconnected(){this.setCurrentControl(null)}setCurrentControl(t){this.onControlChange(this.currentControl,t),this.currentControl=t}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Rf=["focusin","focusout","pointerdown"];class mi extends kt{constructor(){super(...arguments),this.visible=!1,this.inward=!1,this.attachableController=new ba(this,this.onControlChange.bind(this))}get htmlFor(){return this.attachableController.htmlFor}set htmlFor(t){this.attachableController.htmlFor=t}get control(){return this.attachableController.control}set control(t){this.attachableController.control=t}attach(t){this.attachableController.attach(t)}detach(){this.attachableController.detach()}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}handleEvent(t){var n;if(!t[bo]){switch(t.type){default:return;case"focusin":this.visible=((n=this.control)==null?void 0:n.matches(":focus-visible"))??!1;break;case"focusout":case"pointerdown":this.visible=!1;break}t[bo]=!0}}onControlChange(t,n){for(const i of Rf)t==null||t.removeEventListener(i,this),n==null||n.addEventListener(i,this)}update(t){t.has("visible")&&this.dispatchEvent(new Event("visibility-changed")),super.update(t)}}X([ft({type:Boolean,reflect:!0})],mi.prototype,"visible",void 0);X([ft({type:Boolean,reflect:!0})],mi.prototype,"inward",void 0);const bo=Symbol("handledByFocusRing");/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const kf=ae`:host{animation-delay:0s,calc(var(--md-focus-ring-duration, 600ms)*.25);animation-duration:calc(var(--md-focus-ring-duration, 600ms)*.25),calc(var(--md-focus-ring-duration, 600ms)*.75);animation-timing-function:cubic-bezier(0.2, 0, 0, 1);box-sizing:border-box;color:var(--md-focus-ring-color, var(--md-sys-color-secondary, #625b71));display:none;pointer-events:none;position:absolute}:host([visible]){display:flex}:host(:not([inward])){animation-name:outward-grow,outward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) + var(--md-focus-ring-outward-offset, 2px));inset:calc(-1*var(--md-focus-ring-outward-offset, 2px));outline:var(--md-focus-ring-width, 3px) solid currentColor}:host([inward]){animation-name:inward-grow,inward-shrink;border-end-end-radius:calc(var(--md-focus-ring-shape-end-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-end-start-radius:calc(var(--md-focus-ring-shape-end-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-end-radius:calc(var(--md-focus-ring-shape-start-end, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border-start-start-radius:calc(var(--md-focus-ring-shape-start-start, var(--md-focus-ring-shape, var(--md-sys-shape-corner-full, 9999px))) - var(--md-focus-ring-inward-offset, 0px));border:var(--md-focus-ring-width, 3px) solid currentColor;inset:var(--md-focus-ring-inward-offset, 0px)}@keyframes outward-grow{from{outline-width:0}to{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes outward-shrink{from{outline-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-grow{from{border-width:0}to{border-width:var(--md-focus-ring-active-width, 8px)}}@keyframes inward-shrink{from{border-width:var(--md-focus-ring-active-width, 8px)}}@media(prefers-reduced-motion){:host{animation:none}}
`;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Yn=class extends mi{};Yn.styles=[kf];Yn=X([Je("md-focus-ring")],Yn);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Df=th(class extends eh{constructor(r){var t;if(super(r),r.type!==Ql.ATTRIBUTE||r.name!=="class"||((t=r.strings)==null?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(r){return" "+Object.keys(r).filter(t=>r[t]).join(" ")+" "}update(r,[t]){var i,s;if(this.st===void 0){this.st=new Set,r.strings!==void 0&&(this.nt=new Set(r.strings.join(" ").split(/\s/).filter(l=>l!=="")));for(const l in t)t[l]&&!((i=this.nt)!=null&&i.has(l))&&this.st.add(l);return this.render(t)}const n=r.element.classList;for(const l of this.st)l in t||(n.remove(l),this.st.delete(l));for(const l in t){const h=!!t[l];h===this.st.has(l)||(s=this.nt)!=null&&s.has(l)||(h?(n.add(l),this.st.add(l)):(n.remove(l),this.st.delete(l)))}return se}});/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Of={STANDARD:"cubic-bezier(0.2, 0, 0, 1)"};/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const xf=450,Ao=225,$f=.2,Lf=10,Mf=75,Uf=.35,Ff="::after",Vf="forwards";var at;(function(r){r[r.INACTIVE=0]="INACTIVE",r[r.TOUCH_DELAY=1]="TOUCH_DELAY",r[r.HOLDING=2]="HOLDING",r[r.WAITING_FOR_CLICK=3]="WAITING_FOR_CLICK"})(at||(at={}));const jf=["click","contextmenu","pointercancel","pointerdown","pointerenter","pointerleave","pointerup"],Bf=150,Un=window.matchMedia("(forced-colors: active)");class er extends kt{constructor(){super(...arguments),this.disabled=!1,this.hovered=!1,this.pressed=!1,this.rippleSize="",this.rippleScale="",this.initialSize=0,this.state=at.INACTIVE,this.checkBoundsAfterContextMenu=!1,this.attachableController=new ba(this,this.onControlChange.bind(this))}get htmlFor(){return this.attachableController.htmlFor}set htmlFor(t){this.attachableController.htmlFor=t}get control(){return this.attachableController.control}set control(t){this.attachableController.control=t}attach(t){this.attachableController.attach(t)}detach(){this.attachableController.detach()}connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){const t={hovered:this.hovered,pressed:this.pressed};return lt`<div class="surface ${Df(t)}"></div>`}update(t){t.has("disabled")&&this.disabled&&(this.hovered=!1,this.pressed=!1),super.update(t)}handlePointerenter(t){this.shouldReactToEvent(t)&&(this.hovered=!0)}handlePointerleave(t){this.shouldReactToEvent(t)&&(this.hovered=!1,this.state!==at.INACTIVE&&this.endPressAnimation())}handlePointerup(t){if(this.shouldReactToEvent(t)){if(this.state===at.HOLDING){this.state=at.WAITING_FOR_CLICK;return}if(this.state===at.TOUCH_DELAY){this.state=at.WAITING_FOR_CLICK,this.startPressAnimation(this.rippleStartEvent);return}}}async handlePointerdown(t){if(this.shouldReactToEvent(t)){if(this.rippleStartEvent=t,!this.isTouch(t)){this.state=at.WAITING_FOR_CLICK,this.startPressAnimation(t);return}this.checkBoundsAfterContextMenu&&!this.inBounds(t)||(this.checkBoundsAfterContextMenu=!1,this.state=at.TOUCH_DELAY,await new Promise(n=>{setTimeout(n,Bf)}),this.state===at.TOUCH_DELAY&&(this.state=at.HOLDING,this.startPressAnimation(t)))}}handleClick(){if(!this.disabled){if(this.state===at.WAITING_FOR_CLICK){this.endPressAnimation();return}this.state===at.INACTIVE&&(this.startPressAnimation(),this.endPressAnimation())}}handlePointercancel(t){this.shouldReactToEvent(t)&&this.endPressAnimation()}handleContextmenu(){this.disabled||(this.checkBoundsAfterContextMenu=!0,this.endPressAnimation())}determineRippleSize(){const{height:t,width:n}=this.getBoundingClientRect(),i=Math.max(t,n),s=Math.max(Uf*i,Mf),l=Math.floor(i*$f),u=Math.sqrt(n**2+t**2)+Lf;this.initialSize=l,this.rippleScale=`${(u+s)/l}`,this.rippleSize=`${l}px`}getNormalizedPointerEventCoords(t){const{scrollX:n,scrollY:i}=window,{left:s,top:l}=this.getBoundingClientRect(),h=n+s,u=i+l,{pageX:g,pageY:A}=t;return{x:g-h,y:A-u}}getTranslationCoordinates(t){const{height:n,width:i}=this.getBoundingClientRect(),s={x:(i-this.initialSize)/2,y:(n-this.initialSize)/2};let l;return t instanceof PointerEvent?l=this.getNormalizedPointerEventCoords(t):l={x:i/2,y:n/2},l={x:l.x-this.initialSize/2,y:l.y-this.initialSize/2},{startPoint:l,endPoint:s}}startPressAnimation(t){var h;if(!this.mdRoot)return;this.pressed=!0,(h=this.growAnimation)==null||h.cancel(),this.determineRippleSize();const{startPoint:n,endPoint:i}=this.getTranslationCoordinates(t),s=`${n.x}px, ${n.y}px`,l=`${i.x}px, ${i.y}px`;this.growAnimation=this.mdRoot.animate({top:[0,0],left:[0,0],height:[this.rippleSize,this.rippleSize],width:[this.rippleSize,this.rippleSize],transform:[`translate(${s}) scale(1)`,`translate(${l}) scale(${this.rippleScale})`]},{pseudoElement:Ff,duration:xf,easing:Of.STANDARD,fill:Vf})}async endPressAnimation(){this.rippleStartEvent=void 0,this.state=at.INACTIVE;const t=this.growAnimation;let n=1/0;if(typeof(t==null?void 0:t.currentTime)=="number"?n=t.currentTime:t!=null&&t.currentTime&&(n=t.currentTime.to("ms").value),n>=Ao){this.pressed=!1;return}await new Promise(i=>{setTimeout(i,Ao-n)}),this.growAnimation===t&&(this.pressed=!1)}shouldReactToEvent(t){if(this.disabled||!t.isPrimary||this.rippleStartEvent&&this.rippleStartEvent.pointerId!==t.pointerId)return!1;if(t.type==="pointerenter"||t.type==="pointerleave")return!this.isTouch(t);const n=t.buttons===1;return this.isTouch(t)||n}inBounds({x:t,y:n}){const{top:i,left:s,bottom:l,right:h}=this.getBoundingClientRect();return t>=s&&t<=h&&n>=i&&n<=l}isTouch({pointerType:t}){return t==="touch"}async handleEvent(t){if(!(Un!=null&&Un.matches))switch(t.type){case"click":this.handleClick();break;case"contextmenu":this.handleContextmenu();break;case"pointercancel":this.handlePointercancel(t);break;case"pointerdown":await this.handlePointerdown(t);break;case"pointerenter":this.handlePointerenter(t);break;case"pointerleave":this.handlePointerleave(t);break;case"pointerup":this.handlePointerup(t);break}}onControlChange(t,n){for(const i of jf)t==null||t.removeEventListener(i,this),n==null||n.addEventListener(i,this)}}X([ft({type:Boolean,reflect:!0})],er.prototype,"disabled",void 0);X([Wt()],er.prototype,"hovered",void 0);X([Wt()],er.prototype,"pressed",void 0);X([ko(".surface")],er.prototype,"mdRoot",void 0);/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Hf=ae`:host{display:flex;margin:auto;pointer-events:none}:host([disabled]){display:none}@media(forced-colors: active){:host{display:none}}:host,.surface{border-radius:inherit;position:absolute;inset:0;overflow:hidden}.surface{-webkit-tap-highlight-color:rgba(0,0,0,0)}.surface::before,.surface::after{content:"";opacity:0;position:absolute}.surface::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));inset:0;transition:opacity 15ms linear,background-color 15ms linear}.surface::after{background:radial-gradient(closest-side, var(--md-ripple-pressed-color, var(--md-sys-color-on-surface, #1d1b20)) max(100% - 70px, 65%), transparent 100%);transform-origin:center center;transition:opacity 375ms linear}.hovered::before{background-color:var(--md-ripple-hover-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-ripple-hover-opacity, 0.08)}.pressed::after{opacity:var(--md-ripple-pressed-opacity, 0.12);transition-duration:105ms}
`;/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let Zn=class extends er{};Zn.styles=[Hf];Zn=X([Je("md-ripple")],Zn);/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Aa=["role","ariaAtomic","ariaAutoComplete","ariaBusy","ariaChecked","ariaColCount","ariaColIndex","ariaColSpan","ariaCurrent","ariaDisabled","ariaExpanded","ariaHasPopup","ariaHidden","ariaInvalid","ariaKeyShortcuts","ariaLabel","ariaLevel","ariaLive","ariaModal","ariaMultiLine","ariaMultiSelectable","ariaOrientation","ariaPlaceholder","ariaPosInSet","ariaPressed","ariaReadOnly","ariaRequired","ariaRoleDescription","ariaRowCount","ariaRowIndex","ariaRowSpan","ariaSelected","ariaSetSize","ariaSort","ariaValueMax","ariaValueMin","ariaValueNow","ariaValueText"];Aa.map(Ea);function Ea(r){return r.replace("aria","aria-").replace(/Elements?/g,"").toLowerCase()}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function zf(r){for(const t of Aa)r.createProperty(t,{attribute:Ea(t),reflect:!0});r.addInitializer(t=>{const n={hostConnected(){t.setAttribute("role","presentation")}};t.addController(n)})}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const vi=Symbol("internals"),Fn=Symbol("privateInternals");function Wf(r){class t extends r{get[vi](){return this[Fn]||(this[Fn]=this.attachInternals()),this[Fn]}}return t}/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function Gf(r){r.addInitializer(t=>{const n=t;n.addEventListener("click",async i=>{const{type:s,[vi]:l}=n,{form:h}=l;if(!(!h||s==="button")&&(await new Promise(u=>{setTimeout(u)}),!i.defaultPrevented)){if(s==="reset"){h.reset();return}h.addEventListener("submit",u=>{Object.defineProperty(u,"submitter",{configurable:!0,enumerable:!0,get:()=>n})},{capture:!0,once:!0}),l.setFormValue(n.value),h.requestSubmit()}})})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */function qf(r){const t=new MouseEvent("click",{bubbles:!0});return r.dispatchEvent(t),t}function Kf(r){return r.currentTarget!==r.target||r.composedPath()[0]!==r.target||r.target.disabled?!1:!Xf(r)}function Xf(r){const t=Qn;return t&&(r.preventDefault(),r.stopImmediatePropagation()),Jf(),t}let Qn=!1;async function Jf(){Qn=!0,await null,Qn=!1}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Yf=Wf(kt);class ht extends Yf{get name(){return this.getAttribute("name")??""}set name(t){this.setAttribute("name",t)}get form(){return this[vi].form}constructor(){super(),this.disabled=!1,this.href="",this.target="",this.trailingIcon=!1,this.hasIcon=!1,this.type="submit",this.value="",this.handleActivationClick=t=>{!Kf(t)||!this.buttonElement||(this.focus(),qf(this.buttonElement))},this.addEventListener("click",this.handleActivationClick)}focus(){var t;(t=this.buttonElement)==null||t.focus()}blur(){var t;(t=this.buttonElement)==null||t.blur()}render(){var s;const t=this.disabled&&!this.href,n=this.href?this.renderLink():this.renderButton(),i=this.href?"link":"button";return lt`
      ${(s=this.renderElevationOrOutline)==null?void 0:s.call(this)}
      <div class="background"></div>
      <md-focus-ring part="focus-ring" for=${i}></md-focus-ring>
      <md-ripple
        part="ripple"
        for=${i}
        ?disabled="${t}"></md-ripple>
      ${n}
    `}renderButton(){const{ariaLabel:t,ariaHasPopup:n,ariaExpanded:i}=this;return lt`<button
      id="button"
      class="button"
      ?disabled=${this.disabled}
      aria-label="${t||z}"
      aria-haspopup="${n||z}"
      aria-expanded="${i||z}">
      ${this.renderContent()}
    </button>`}renderLink(){const{ariaLabel:t,ariaHasPopup:n,ariaExpanded:i}=this;return lt`<a
      id="link"
      class="button"
      aria-label="${t||z}"
      aria-haspopup="${n||z}"
      aria-expanded="${i||z}"
      href=${this.href}
      target=${this.target||z}
      >${this.renderContent()}
    </a>`}renderContent(){const t=lt`<slot
      name="icon"
      @slotchange="${this.handleSlotChange}"></slot>`;return lt`
      <span class="touch"></span>
      ${this.trailingIcon?z:t}
      <span class="label"><slot></slot></span>
      ${this.trailingIcon?t:z}
    `}handleSlotChange(){this.hasIcon=this.assignedIcons.length>0}}zf(ht),Gf(ht);ht.formAssociated=!0;ht.shadowRootOptions={mode:"open",delegatesFocus:!0};X([ft({type:Boolean,reflect:!0})],ht.prototype,"disabled",void 0);X([ft()],ht.prototype,"href",void 0);X([ft()],ht.prototype,"target",void 0);X([ft({type:Boolean,attribute:"trailing-icon",reflect:!0})],ht.prototype,"trailingIcon",void 0);X([ft({type:Boolean,attribute:"has-icon",reflect:!0})],ht.prototype,"hasIcon",void 0);X([ft()],ht.prototype,"type",void 0);X([ft({reflect:!0})],ht.prototype,"value",void 0);X([ko(".button")],ht.prototype,"buttonElement",void 0);X([Pl({slot:"icon",flatten:!0})],ht.prototype,"assignedIcons",void 0);/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */class Zf extends ht{renderElevationOrOutline(){return lt`<md-elevation part="elevation"></md-elevation>`}}/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const Qf=ae`:host{--_container-color: var(--md-filled-button-container-color, var(--md-sys-color-primary, #6750a4));--_container-elevation: var(--md-filled-button-container-elevation, 0);--_container-height: var(--md-filled-button-container-height, 40px);--_container-shadow-color: var(--md-filled-button-container-shadow-color, var(--md-sys-color-shadow, #000));--_disabled-container-color: var(--md-filled-button-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-elevation: var(--md-filled-button-disabled-container-elevation, 0);--_disabled-container-opacity: var(--md-filled-button-disabled-container-opacity, 0.12);--_disabled-label-text-color: var(--md-filled-button-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-button-disabled-label-text-opacity, 0.38);--_focus-container-elevation: var(--md-filled-button-focus-container-elevation, 0);--_focus-label-text-color: var(--md-filled-button-focus-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-container-elevation: var(--md-filled-button-hover-container-elevation, 1);--_hover-label-text-color: var(--md-filled-button-hover-label-text-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-color: var(--md-filled-button-hover-state-layer-color, var(--md-sys-color-on-primary, #fff));--_hover-state-layer-opacity: var(--md-filled-button-hover-state-layer-opacity, 0.08);--_label-text-color: var(--md-filled-button-label-text-color, var(--md-sys-color-on-primary, #fff));--_label-text-font: var(--md-filled-button-label-text-font, var(--md-sys-typescale-label-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-button-label-text-line-height, var(--md-sys-typescale-label-large-line-height, 1.25rem));--_label-text-size: var(--md-filled-button-label-text-size, var(--md-sys-typescale-label-large-size, 0.875rem));--_label-text-weight: var(--md-filled-button-label-text-weight, var(--md-sys-typescale-label-large-weight, var(--md-ref-typeface-weight-medium, 500)));--_pressed-container-elevation: var(--md-filled-button-pressed-container-elevation, 0);--_pressed-label-text-color: var(--md-filled-button-pressed-label-text-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-color: var(--md-filled-button-pressed-state-layer-color, var(--md-sys-color-on-primary, #fff));--_pressed-state-layer-opacity: var(--md-filled-button-pressed-state-layer-opacity, 0.12);--_disabled-icon-color: var(--md-filled-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-filled-button-disabled-icon-opacity, 0.38);--_focus-icon-color: var(--md-filled-button-focus-icon-color, var(--md-sys-color-on-primary, #fff));--_hover-icon-color: var(--md-filled-button-hover-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-color: var(--md-filled-button-icon-color, var(--md-sys-color-on-primary, #fff));--_icon-size: var(--md-filled-button-icon-size, 18px);--_pressed-icon-color: var(--md-filled-button-pressed-icon-color, var(--md-sys-color-on-primary, #fff));--_container-shape-start-start: var(--md-filled-button-container-shape-start-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-start-end: var(--md-filled-button-container-shape-start-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-end: var(--md-filled-button-container-shape-end-end, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_container-shape-end-start: var(--md-filled-button-container-shape-end-start, var(--md-filled-button-container-shape, var(--md-sys-shape-corner-full, 9999px)));--_leading-space: var(--md-filled-button-leading-space, 24px);--_trailing-space: var(--md-filled-button-trailing-space, 24px);--_with-leading-icon-leading-space: var(--md-filled-button-with-leading-icon-leading-space, 16px);--_with-leading-icon-trailing-space: var(--md-filled-button-with-leading-icon-trailing-space, 24px);--_with-trailing-icon-leading-space: var(--md-filled-button-with-trailing-icon-leading-space, 24px);--_with-trailing-icon-trailing-space: var(--md-filled-button-with-trailing-icon-trailing-space, 16px)}
`;/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const tp=ae`md-elevation{transition-duration:280ms}:host([disabled]) md-elevation{transition:none}md-elevation{--md-elevation-level: var(--_container-elevation);--md-elevation-shadow-color: var(--_container-shadow-color)}:host(:focus-within) md-elevation{--md-elevation-level: var(--_focus-container-elevation)}:host(:hover) md-elevation{--md-elevation-level: var(--_hover-container-elevation)}:host(:active) md-elevation{--md-elevation-level: var(--_pressed-container-elevation)}:host([disabled]) md-elevation{--md-elevation-level: var(--_disabled-container-elevation)}
`;/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ep=ae`:host{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end);box-sizing:border-box;cursor:pointer;display:inline-flex;gap:8px;min-height:var(--_container-height);outline:none;padding-block:calc((var(--_container-height) - max(var(--_label-text-line-height),var(--_icon-size)))/2);padding-inline-start:var(--_leading-space);padding-inline-end:var(--_trailing-space);place-content:center;place-items:center;position:relative;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);text-overflow:ellipsis;text-wrap:nowrap;user-select:none;-webkit-tap-highlight-color:rgba(0,0,0,0);vertical-align:top;--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host([disabled]){cursor:default;pointer-events:none}.button{border-radius:inherit;cursor:inherit;display:inline-flex;align-items:center;justify-content:center;border:none;outline:none;-webkit-appearance:none;vertical-align:middle;background:rgba(0,0,0,0);text-decoration:none;min-width:calc(64px - var(--_leading-space) - var(--_trailing-space));width:100%;z-index:0;height:100%;font:inherit;color:var(--_label-text-color);padding:0;gap:inherit;text-transform:inherit}.button::-moz-focus-inner{padding:0;border:0}:host(:hover) .button{color:var(--_hover-label-text-color)}:host(:focus-within) .button{color:var(--_focus-label-text-color)}:host(:active) .button{color:var(--_pressed-label-text-color)}.background{background-color:var(--_container-color);border-radius:inherit;inset:0;position:absolute}.label{overflow:hidden}:is(.button,.label,.label slot),.label ::slotted(*){text-overflow:inherit}:host([disabled]) .label{color:var(--_disabled-label-text-color);opacity:var(--_disabled-label-text-opacity)}:host([disabled]) .background{background-color:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}@media(forced-colors: active){.background{border:1px solid CanvasText}:host([disabled]){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1;--_disabled-container-opacity: 1;--_disabled-label-text-color: GrayText;--_disabled-label-text-opacity: 1}}:host([has-icon]:not([trailing-icon])){padding-inline-start:var(--_with-leading-icon-leading-space);padding-inline-end:var(--_with-leading-icon-trailing-space)}:host([has-icon][trailing-icon]){padding-inline-start:var(--_with-trailing-icon-leading-space);padding-inline-end:var(--_with-trailing-icon-trailing-space)}::slotted([slot=icon]){display:inline-flex;position:relative;writing-mode:horizontal-tb;fill:currentColor;flex-shrink:0;color:var(--_icon-color);font-size:var(--_icon-size);inline-size:var(--_icon-size);block-size:var(--_icon-size)}:host(:hover) ::slotted([slot=icon]){color:var(--_hover-icon-color)}:host(:focus-within) ::slotted([slot=icon]){color:var(--_focus-icon-color)}:host(:active) ::slotted([slot=icon]){color:var(--_pressed-icon-color)}:host([disabled]) ::slotted([slot=icon]){color:var(--_disabled-icon-color);opacity:var(--_disabled-icon-opacity)}.touch{position:absolute;top:50%;height:48px;left:0;right:0;transform:translateY(-50%)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) 0}:host([touch-target=none]) .touch{display:none}
`;/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */let ti=class extends Zf{};ti.styles=[ep,tp,Qf];ti=X([Je("md-filled-button")],ti);var rp=Object.defineProperty,np=Object.getOwnPropertyDescriptor,Gt=(r,t,n,i)=>{for(var s=i>1?void 0:i?np(t,n):t,l=r.length-1,h;l>=0;l--)(h=r[l])&&(s=(i?h(t,n,s):h(s))||s);return i&&s&&rp(t,n,s),s};let St=class extends Zl(kt){constructor(){super(),this.currentContent="",this.isDirty=!1,this.taggingStatus="idle",this.taggingMessage="",this.tagInput="",this.archiveChecked=!0,this.vscode=typeof acquireVsCodeApi=="function"?acquireVsCodeApi():void 0,this.fileName="...",window.addEventListener("message",r=>{const t=r.data;t.command==="updateContent"&&(this.fileName=t.data.fileName,this.currentContent=t.data.content,this.isDirty=t.data.isDirty??!1,this.taggingStatus="idle",this.taggingMessage=""),t.command==="taggingResult"&&(this.taggingStatus=t.status,this.taggingMessage=t.message)})}async _handleCountTokens(){await $h(this.currentContent)}_handleAddTags(){if(!this.vscode){this.taggingStatus="error",this.taggingMessage="VS Code API unavailable";return}const r=this.tagInput.trim();if(!this.archiveChecked&&!r){this.taggingStatus="error",this.taggingMessage="Enter a tag or enable archive";return}this.taggingStatus="working",this.taggingMessage="Adding tag(s)...",this.vscode.postMessage({command:"addTags",tag:r,includeArchive:this.archiveChecked})}_onTagInput(r){this.tagInput=r.target.value??""}_onArchiveToggle(r){this.archiveChecked=r.target.checked}render(){const r=kh.get(),t=r.status==="error",n=r.status==="counting",i=n||this.isDirty,s=this.isDirty||this.taggingStatus==="working";return lt`
      <div class="container">
        <h2>YAML Tools</h2>

        <div class="file-info">
          <p class="file-name">File: <strong>${this.fileName}</strong></p>

          <!-- Debug: Show isDirty state visibly -->
          <p style="font-size: 0.75rem; opacity: 0.5; margin: 0;">
            ${this.isDirty?"🔴 File has unsaved changes":"🟢 File is saved"}
          </p>

          ${r.tokenCount>0?lt`
            <p class="token-count">
              Token Count: <strong>${r.tokenCount}</strong>
            </p>
          `:lt`
            <p class="token-count" style="opacity: 0.5;">
              Click to count tokens
            </p>
          `}

          <div class="button-container">
            <md-filled-button
              @click=${this._handleCountTokens}
              ?disabled=${i}>
              ${n?"⏳ Counting...":this.isDirty?"💾 Save first":"Count Tokens"}
            </md-filled-button>

            <md-filled-button
              @click=${this._handleAddTags}
              ?disabled=${s}>
              ${this.taggingStatus==="working"?"⏳ Tagging...":this.isDirty?"💾 Save first":"Add Tag(s)"}
            </md-filled-button>
          </div>

          <div class="tag-form">
            <input
              class="tag-input"
              type="text"
              placeholder="Enter a tag (optional)"
              .value=${this.tagInput}
              @input=${this._onTagInput}
            />
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked=${this.archiveChecked}
                @change=${this._onArchiveToggle}
              />
              Include "archive"
            </label>
          </div>

          ${this.isDirty?lt`
            <p class="status" style="opacity: 0.7; color: var(--vscode-editorWarning-foreground, #dcdcaa);">
              ℹ️ Save your changes before counting tokens
            </p>
          `:r.status!=="idle"?lt`
            <p class="status ${t?"error":""}">
              ${n?"⏳ Counting...":t?`❌ ${r.errorMessage}`:"✓ Complete"}
            </p>
          `:""}

          ${this.taggingStatus!=="idle"?lt`
            <p class="status ${this.taggingStatus==="error"?"error":""}">
              ${this.taggingStatus==="working"?"⏳ Tagging...":this.taggingMessage||"Tagging complete"}
            </p>
          `:""}
        </div>
      </div>
    `}};St.styles=ae`
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
    .tag-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .tag-input {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--vscode-input-border, rgba(255, 255, 255, 0.1));
      background: var(--vscode-input-background, #1e1e1e);
      color: var(--vscode-foreground);
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }
  `;Gt([ft({type:String})],St.prototype,"fileName",2);Gt([Wt()],St.prototype,"currentContent",2);Gt([Wt()],St.prototype,"isDirty",2);Gt([Wt()],St.prototype,"taggingStatus",2);Gt([Wt()],St.prototype,"taggingMessage",2);Gt([Wt()],St.prototype,"tagInput",2);Gt([Wt()],St.prototype,"archiveChecked",2);St=Gt([Je("df-yaml-tools-app")],St);
