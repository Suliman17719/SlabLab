/* SlabLab – one-way slab engine (mirrors Slabs_Design_EC2.xlsx, sheet "One Way Slabs") */
(function(root){
const DEF={fck:25,fyk:460,fctm:2.9,cover:25,h:250,phi:12,phiL:8,b:1000,gc:1.5,gs:1.15,acc:0.85,Kl:0.167,cot:2.5,wk:0.3,a6:1.5,gconc:25,frac:0.5,Lsp:7000,Amax:0.04,gmin:1.0,spanDiff:0.15,qgRatio:1.25,qMax:5,
 dead:{'Waterproofing':0.1,'Finishes':0.4,'Ceiling':0.25,'MEP services':0.3,'Partitions':1.2,'Screed to slope':0.70875},Qk:3,gG:1.35,gQ:1.5,psi2:0.3};
const CASES={'Simply supported':[0.125,0,0.5,1.0],'End span':[0.086,0.086,0.6,1.3],'Interior span':[0.063,0.063,0.5,1.5],'Cantilever':[0,0.5,1.0,0.4]};
const SIG=[160,200,240,280,320,360],TAB={0.4:[300,250,200,150,100,50],0.3:[200,150,100,50,0,0],0.2:[100,50,0,0,0,0]};
const f25=x=>Math.floor(x/25+1e-9)*25;
function smax(s,wk){const r=TAB[wk]||TAB[0.3];if(s<=160)return r[0];if(s>=360)return r[5];let k=0;while(SIG[k+1]<=s)k++;return r[k]+(r[k+1]-r[k])*(s-SIG[k])/(SIG[k+1]-SIG[k]);}
function cont(a,b,c,fa,fc,wmx,wmn){const big=1e9;
 const g1=a>0?(fa==='Fixed'?{k:4/a,f:1/12}:{k:3/a,f:1/8}):{k:fa==='Fixed'?big:0,f:0};
 const g2=c>0?(fc==='Fixed'?{k:4/c,f:1/12}:{k:3/c,f:1/8}):{k:fc==='Fixed'?big:0,f:0};
 const A11=g1.k+4/b,A12=2/b,A22=4/b+g2.k,D=A11*A22-A12*A12;
 const P=[[wmn,wmx,wmn],[wmx,wmx,wmn],[wmn,wmx,wmx],[wmx,wmx,wmx]];const pats=[];
 P.forEach(w=>{const wa=w[0],wb=w[1],wc=w[2];const B1=-(wa*a*a*g1.f-wb*b*b/12),B2=-(wb*b*b/12-wc*c*c*g2.f);
  const t1=(B1*A22-A12*B2)/D,t2=(A11*B2-A12*B1)/D;const h1=wb*b*b/12-(2/b)*(2*t1+t2),h2=(2/b)*(t1+2*t2)+wb*b*b/12;
  const vl=wb*b/2+(h1-h2)/b,vr=wb*b-vl;const ms=(vl>0&&vl<wb*b)?vl*vl/(2*wb)-h1:0;pats.push({h1,h2,vl,vr,ms});});
 const mx=k=>Math.max(...pats.map(p=>p[k]));const Ms=Math.max(0,mx('ms')),Mh1=Math.max(0,mx('h1')),Mh2=Math.max(0,mx('h2'));
 return{Ms,Mh1,Mh2,Mh:Math.max(Mh1,Mh2),V:Math.max(...pats.map(p=>Math.max(Math.abs(p.vl),Math.abs(p.vr)))),pats,wmx,wmn};}
function derive(c){const o={};o.fcd=c.acc*c.fck/c.gc;o.fyd=c.fyk/c.gs;o.Ab=Math.PI/4*c.phi*c.phi;o.Al=Math.PI/4*c.phiL*c.phiL;o.r0=Math.sqrt(c.fck)/1000;
 o.fctd=0.7*c.fctm/c.gc;o.fbd=2.25*o.fctd;o.lb=(c.phi/4)*(o.fyd/o.fbd);o.Gsup=Object.values(c.dead).reduce((a,b)=>a+b,0);o.k2=2*c.acc/c.gc;return o;}
function loads(c,h,addG,qov){const o=derive(c);const Gk=o.Gsup+h/1000*c.gconc+(addG||0);const Qk=(qov==null||qov==='')?c.Qk:qov;return{Gk,Qk,n:c.gG*Gk+c.gQ*Qk,q:Gk+c.psi2*Qk,Gsup:o.Gsup,sw:h/1000*c.gconc};}
function flex(c,o,M,d,h,ld){ if(!(M>0))return null;const r={M,d};
 r.K=M*1e6/(c.b*d*d*c.fck);r.z=Math.min(0.95*d,d*(0.5+Math.sqrt(0.25-Math.min(r.K,c.Kl)/o.k2)));
 r.Ar=Math.min(r.K,c.Kl)*c.fck*c.b*d*d/(o.fyd*r.z);r.Amin=Math.max(0.26*(c.fctm/c.fyk)*c.b*d,0.0013*c.b*d);r.Au=Math.max(r.Ar,r.Amin);
 r.sg=o.fyd*(r.Ar/r.Au)*(ld.q/ld.n);r.scr=h<=200?400:smax(r.sg,c.wk);r.sreq=o.Ab*c.b/r.Au;
 r.sp=Math.max(Math.min(f25(r.sreq),f25(r.scr),Math.min(3*h,400)),25);r.txt='H'+c.phi+' @'+r.sp+'mm C/C';r.Ap=o.Ab*c.b/r.sp;
 r.chk=r.K>c.Kl?"NOT OK (K>K')":(r.Ap>c.Amax*c.b*h?'NOT OK (As>As,max)':'OK');return r;}
function design(inp,cin){const c=Object.assign({},DEF,cin||{});const o=derive(c);const h=inp.hov||c.h;const L=+inp.L;
 const ld=loads(c,h,+inp.addG||0,inp.qov);const d=h-c.cover-c.phi/2;const Lm=L/1000;
 const meth=inp.meth==='Continuous strip',Ll=+inp.Ll||0,Lr=+inp.Lr||0,lc=Ll>0||inp.el==='Fixed',rc=Lr>0||inp.er==='Fixed';
 const cu=meth?(lc&&rc?'Interior span':(lc||rc?'End span':'Simply supported')):inp.cs;const cf=CASES[cu];
 const R={inp,c,o,h,d,L,ld,cf,cu,meth};
 if(meth){R.cn=cont(Ll/1000,Lm,Lr/1000,inp.el||'Pinned',inp.er||'Pinned',ld.n,c.gmin*ld.Gk);R.Ms=R.cn.Ms;R.Mh=R.cn.Mh;R.V=R.cn.V;}
 else{R.Ms=cf[0]*ld.n*Lm*Lm;R.Mh=cf[1]*ld.n*Lm*Lm;R.V=cf[2]*ld.n*Lm;
  if(cu!=='Simply supported'&&cu!=='Cantilever'){const dd=x=>x>0&&Math.abs(x-L)/Math.max(x,L)>c.spanDiff;
   R.cv=(dd(Ll)||dd(Lr))?'NOT OK (adjacent spans differ – use Continuous strip)':((ld.Qk>c.qgRatio*ld.Gk||ld.Qk>c.qMax)?'NOT OK (loads outside coefficient limits)':'OK');}}
 R.fs=flex(c,o,R.Ms,d,h,ld);R.fh=flex(c,o,R.Mh,d,h,ld);
 const Am=R.fs?R.fs.Ap:(R.fh?R.fh.Ap:0);const sec={};sec.Ar=Math.max(0.2*Am,0.0013*c.b*d);sec.sreq=o.Ab*c.b/sec.Ar;
 sec.sp=Math.max(Math.min(f25(sec.sreq),Math.min(3.5*h,450)),25);sec.txt='H'+c.phi+' @'+sec.sp+'mm C/C';R.sec=sec;
 if((cu==='Simply supported'||cu==='End span')&&R.fs){const Ae=0.25*R.fs.Ap;const se=Math.max(Math.min(f25(o.Ab*c.b/Ae),Math.min(3*h,400)),25);R.end={Ae,sp:se,txt:'H'+c.phi+' @'+se+'mm C/C'};}
 // shear
 const s={};s.As1=Math.max(c.frac*(R.fs?R.fs.Ap:0),R.fh?R.fh.Ap:0);s.rho=Math.min(0.02,s.As1/(c.b*d));s.k=Math.min(1+Math.sqrt(200/d),2);s.vmin=0.035*Math.pow(s.k,1.5)*Math.sqrt(c.fck);
 s.vc=Math.max((0.18/c.gc)*s.k*Math.pow(100*s.rho*c.fck,1/3),s.vmin)*c.b*d/1000;s.need=R.V>s.vc;s.vmax=0.6*(1-c.fck/250)*0.9*d*c.b*o.fcd/(c.cot+1/c.cot)/1000;
 s.aws=R.V*1000/(0.9*d*o.fyd*c.cot);s.legs=Math.ceil(s.aws*0.75*d/o.Al);s.chk=!s.need?'OK (no links)':(R.V<=s.vmax?'OK (provide links)':'NOT OK (increase h)');R.sh=s;
 // deflection
 const Ar=R.fs?R.fs:R.fh;if(Ar){const df={};df.rho=Ar.Ar/(c.b*d);df.K=cf[3];
  df.lim=o.r0>df.rho?df.K*(11+1.5*Math.sqrt(c.fck)*(o.r0/df.rho)+3.2*Math.sqrt(c.fck)*Math.pow(o.r0/df.rho-1,1.5)):df.K*(11+1.5*Math.sqrt(c.fck)*o.r0/df.rho);
  df.f1=Math.min(Ar.Ap/Ar.Ar*(500/c.fyk),1.5);df.f2=L>c.Lsp?c.Lsp/L:1;df.mod=df.lim*df.f1*df.f2;df.act=L/d;df.chk=df.mod>df.act?'OK':'NOT OK';R.df=df;}
 // crack
 const ck=(f)=>{if(!f)return null;const sg=o.fyd*(f.Ar/f.Ap)*(ld.q/ld.n);const sm=smax(sg,c.wk);return{sg,sm,chk:h<=200?'OK (h≤200)':(f.sp<=sm?'OK':'NOT OK')};};R.cs=ck(R.fs);R.ch=ck(R.fh);
 // anchorage
 const lb=(f)=>f?Math.max(o.lb*f.Ar/f.Ap,0.3*o.lb,10*c.phi,100):null;R.lbs=lb(R.fs);R.lbh=lb(R.fh);R.l0=Math.max(R.lbs||0,R.lbh||0)*c.a6;
 // status
 const bad=x=>String(x||'').indexOf('NOT OK')>=0;const sp=[R.fs&&R.fs.sp,R.fh&&R.fh.sp,sec.sp].filter(x=>x!=null);
 R.st={flex:(bad(R.fs&&R.fs.chk)||bad(R.fh&&R.fh.chk))?'NOT OK':'OK',spacing:sp.every(x=>x>=75)?'OK':'NOT OK',shear:s.chk,defl:R.df?R.df.chk:'NOT OK (no design moment)',crack:(bad(R.cs&&R.cs.chk)||bad(R.ch&&R.ch.chk))?'NOT OK':'OK'};
 R.st.cv=R.cv||'-';R.st.overall=Object.values(R.st).some(bad)?'NOT OK':'OK';return R;}
const g=(x,n)=>{const s=(+x).toFixed(n);return s.indexOf('.')>=0?s.replace(/0+$/,'').replace(/\.$/,''):s;};
function steps(R){const c=R.c,o=R.o,f=R.fs||R.fh,M=R.fs?R.Ms:R.Mh,t=R.fs?'sagging':'hogging',cap=R.fs?'':' (hogging)';const L=[];
 L.push({t:'Design load',r:[['Gk','Gk = Σ dead + h·γ',`= ${g(R.ld.Gsup,3)} + ${g(R.ld.sw,3)} = ${g(R.ld.Gk,3)} kN/m²`],['n','n = γG·Gk + γQ·Qk',`= ${c.gG}·${g(R.ld.Gk,3)} + ${c.gQ}·${g(R.ld.Qk,2)} = ${g(R.ld.n,3)} kN/m²`,1]]});
 if(R.meth){const q=R.cn;L.push({t:'Continuous strip analysis',r:[['Loads','w max = n ; w min = γG,min·Gk',`= ${g(q.wmx,3)} ; ${g(q.wmn,3)} kN/m`],['Model',`span b = ${g(R.L/1000,3)} m · a = ${g((+R.inp.Ll||0)/1000,3)} m · c = ${g((+R.inp.Lr||0)/1000,3)} m`,`ends: ${R.inp.el||'Pinned'} / ${R.inp.er||'Pinned'} → ${R.cu}`],['Patterns','P1 b · P2 a+b · P3 b+c · P4 all',`M sag max = ${g(q.Ms,3)} kNm/m`],['Hogging','max of supports',`left ${g(q.Mh1,3)} · right ${g(q.Mh2,3)} → ${g(q.Mh,3)} kNm/m`],['V Ed','envelope',`= ${g(q.V,3)} kN/m`,1]]});}else L.push({t:'Analysis (per 1 m)',r:[['Coefficients',R.inp.cs,`αs = ${R.cf[0]} · αh = ${R.cf[1]} · βv = ${R.cf[2]}`],['M sagging','M = αs·n·L²',`= ${R.cf[0]}·${g(R.ld.n,3)}·${g(R.L/1000,3)}² = ${g(R.Ms,3)} kNm/m`],['M hogging','M = αh·n·L²',`= ${g(R.Mh,3)} kNm/m`],['V Ed','V = βv·n·L',`= ${g(R.V,3)} kN/m`,1]].concat(R.cv?[['Coefficient validity','span difference ≤ 15% · Qk ≤ 1.25·Gk · Qk ≤ 5',R.cv,R.cv==='OK'?0:1]]:[])});
 if(f)L.push({t:'Flexure · '+t,r:[['Effective depth','d = h − c − Φ/2',`= ${g(R.h,0)} − ${c.cover} − ${c.phi}/2 = ${g(R.d,0)} mm`],['Moment factor','K = M·10⁶ / (b·d²·fck)',`= ${g(M,3)}·10⁶ / (${c.b}·${g(R.d,0)}²·${c.fck}) = ${g(f.K,4)}`],['Lever arm','z = min(0.95d , d[0.5+√(0.25−K/(2αcc/γc))])',`= ${g(f.z,1)} mm`],['Steel area','As = K·fck·b·d² / (fyd·z)',`= ${g(f.Ar,0)} mm²/m`],['Minimum steel','As,min = max(0.26·fctm/fyk·b·d , 0.0013·b·d)',`= ${g(f.Amin,0)} mm²/m`+(f.Amin>f.Ar?'   ← governs':''),f.Amin>f.Ar?1:0]]});
 if(f)L.push({t:'Bars & spacing',r:[['Stress (SLS)','σs = fyd·(As,req/As,use)·(q/n)',`= ${g(f.sg,0)} N/mm²`],['Crack limit','s max (EC2 Table 7.3N)',`= ${g(f.scr,0)} mm`],['Spacing','s = min(floor25(Ab·b/As) , s crack , min(3h,400))',`= ${f.sp} mm`],['Provided','Ab·b/s',`${f.txt}  (${g(f.Ap,0)} mm²/m)`,1]]});
 const s=R.sh;L.push({t:'Shear',r:[['k, ρ1','k = min(1+√(200/d),2)',`k = ${g(s.k,3)} · ρ1 = ${g(s.rho,5)}`],['VRd,c','max(0.18/γc·k·(100ρ1·fck)^⅓ , vmin)·b·d',`= ${g(s.vc,1)} kN/m`],['Check','V Ed vs VRd,c',`${g(R.V,2)} ${s.need?'>':'≤'} ${g(s.vc,1)} → ${s.chk}`,1]]});
 if(R.df)L.push({t:'Deflection',r:[['L/d actual','L / d',`= ${g(R.df.act,2)}`],['L/d limit','K·[11+1.5√fck·ρ0/ρ+3.2√fck(ρ0/ρ−1)^1.5]',`= ${g(R.df.lim,1)}`],['Modified','limit·(500/fyk·As,prov/As,req ≤1.5)·f(span)',`= ${g(R.df.mod,1)}`],['Check','modified > actual',R.df.chk,1]]});
 L.push({t:'Crack control',r:[['Sagging',R.cs?`σs ${g(R.cs.sg,0)} → s max ${g(R.cs.sm,0)} mm`:'-',R.cs?R.cs.chk:'-',1],['Hogging',R.ch?`σs ${g(R.ch.sg,0)} → s max ${g(R.ch.sm,0)} mm`:'-',R.ch?R.ch.chk:'-']]});
 L.push({t:'Anchorage & lap',r:[['lb,rqd','(Φ/4)·(fyd/fbd)',`= ${g(o.lb,0)} mm`],['lbd bottom','max(lb·As,req/As,prov , 0.3lb , 10Φ , 100)',R.lbs?`= ${g(R.lbs,0)} mm`:'-'],['Lap l0','α6·max(lbd)',`= ${g(R.l0,0)} mm`,1]]});
 return L;}
const API={DEF,CASES,design,cont,flex,smax,f25,steps,derive,loads,g};
if(typeof module!=='undefined')module.exports=API;else root.SL=API;})(this);
