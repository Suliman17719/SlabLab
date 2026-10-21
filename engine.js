/* SlabLab – one-way slab engine (mirrors Slabs_Design_EC2.xlsx, sheet "One Way Slabs") */
(function(root){
const DEF={fck:25,fyk:460,fctm:2.6,cover:25,h:250,phi:12,phiL:8,b:1000,gc:1.5,gs:1.15,acc:0.85,Kl:0.167,cot:2.5,wk:0.3,a6:1.5,gconc:25,frac:0.5,Lsp:7000,Amax:0.04,gmin:1.0,spanDiff:0.15,qgRatio:1.25,qMax:5,
 dead:{'Waterproofing':0.1,'Finishes':0.4,'Ceiling':0.25,'MEP services':0.3,'Partitions':1.2,'Screed to slope':0.70875},Qk:3,gG:1.35,gQ:1.5,psi2:0.3};
const CASES={'Simply supported':[0.125,0,0.5,1.0],'End span':[0.086,0.086,0.6,1.3],'Interior span':[0.063,0.063,0.5,1.5],'Cantilever':[0,0.5,1.0,0.4]};
const SIG=[160,200,240,280,320,360],TAB={0.4:[300,300,250,200,150,100],0.3:[300,250,200,150,100,50],0.2:[200,150,100,50,null,null]};
const f25=x=>Math.floor(x/25+1e-9)*25;
// EC2 EN 1992-1-1:2004 Table 7.3N. null means the simplified spacing table is not applicable at this stress.
function smax(s,wk){const r=TAB[Number(wk)];if(!r||!Number.isFinite(s)||s<0)return null;if(s<=160)return r[0];if(s>360)return null;let k=0;while(k<SIG.length-2&&SIG[k+1]<s)k++;if(s===SIG[k])return r[k];if(s===SIG[k+1])return r[k+1];const a=r[k],b=r[k+1];if(a==null||b==null)return null;return a+(b-a)*(s-SIG[k])/(SIG[k+1]-SIG[k]);}
function cont(a,b,c,fa,fc,wmx,wmn){const big=1e9;
 const g1=a>0?(fa==='Fixed'?{k:4/a,f:1/12}:{k:3/a,f:1/8}):{k:fa==='Fixed'?big:0,f:0};
 const g2=c>0?(fc==='Fixed'?{k:4/c,f:1/12}:{k:3/c,f:1/8}):{k:fc==='Fixed'?big:0,f:0};
 const A11=g1.k+4/b,A12=2/b,A22=4/b+g2.k,D=A11*A22-A12*A12;
 const P=[];for(let mask=0;mask<8;mask++)P.push([0,1,2].map(j=>(mask&(1<<j))?wmx:wmn));const pats=[];
 P.forEach(w=>{const wa=w[0],wb=w[1],wc=w[2];const B1=-(wa*a*a*g1.f-wb*b*b/12),B2=-(wb*b*b/12-wc*c*c*g2.f);
  const t1=(B1*A22-A12*B2)/D,t2=(A11*B2-A12*B1)/D;const h1=wb*b*b/12-(2/b)*(2*t1+t2),h2=(2/b)*(t1+2*t2)+wb*b*b/12;
  const vl=wb*b/2+(h1-h2)/b,vr=wb*b-vl;const ms=(vl>0&&vl<wb*b)?vl*vl/(2*wb)-h1:0;pats.push({h1,h2,vl,vr,ms});});
 const mx=k=>Math.max(...pats.map(p=>p[k]));const Ms=Math.max(0,mx('ms')),Mh1=Math.max(0,mx('h1')),Mh2=Math.max(0,mx('h2'));
 return{Ms,Mh1,Mh2,Mh:Math.max(Mh1,Mh2),V:Math.max(...pats.map(p=>Math.max(Math.abs(p.vl),Math.abs(p.vr)))),pats,wmx,wmn};}
// Stage 47: continuous strip with any number of spans (2…10) and a different uniform design load on every span.
// Slope-deflection analysis (constant EI, no sway): spans in m, loads in kN/m. Ends: 'Pinned' or 'Fixed'.
// Moments are sagging-positive. Returns support moments, shear at both ends of every span and 0.1 m-class diagram points.
function multiSpan(spans,el,er,np){
 const n=spans.length;if(!(n>=1))throw new RangeError('Enter at least one span.');
 spans.forEach((s,i)=>{if(!(Number.isFinite(+s.L)&&+s.L>0))throw new RangeError('Span '+(i+1)+': length must be positive.');if(!(Number.isFinite(+s.w)&&+s.w>=0))throw new RangeError('Span '+(i+1)+': design load must be zero or positive.');});
 const N=n+1,fix=new Array(N).fill(false);fix[0]=el==='Fixed';fix[n]=er==='Fixed';
 const idx=[];for(let j=0;j<N;j++)if(!fix[j])idx.push(j);
 const A=idx.map(()=>idx.map(()=>0)),B=idx.map(()=>0),pos=j=>idx.indexOf(j);
 // end moments: M_ab = 2/L(2θa+θb)+FEMab ; M_ba = 2/L(θa+2θb)+FEMba (EI = 1)
 spans.forEach((s,i)=>{const L=+s.L,w=+s.w,F=w*L*L/12,a=i,b=i+1,k=2/L;
  if(!fix[a]){const r=pos(a);A[r][r]+=2*k;if(!fix[b])A[r][pos(b)]+=k;B[r]-=-F;}
  if(!fix[b]){const r=pos(b);A[r][r]+=2*k;if(!fix[a])A[r][pos(a)]+=k;B[r]-=F;}});
 const m=idx.length,th=new Array(N).fill(0);
 if(m){const M=A.map((r,i)=>r.concat([B[i]]));
  for(let c=0;c<m;c++){let p=c;for(let r=c+1;r<m;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;[M[c],M[p]]=[M[p],M[c]];if(Math.abs(M[c][c])<1e-12)throw new RangeError('The strip is unstable (check the end conditions).');
   for(let r=0;r<m;r++){if(r===c)continue;const f=M[r][c]/M[c][c];for(let q=c;q<=m;q++)M[r][q]-=f*M[c][q];}}
  idx.forEach((j,i)=>{th[j]=M[i][m]/M[i][i];});}
 const out=[],sup=new Array(N).fill(0);
 spans.forEach((s,i)=>{const L=+s.L,w=+s.w,F=w*L*L/12,k=2/L,Mab=k*(2*th[i]+th[i+1])-F,Mba=k*(th[i]+2*th[i+1])+F;
  const MsA=Mab,MsB=-Mba,VA=(MsB-MsA)/L+w*L/2,VB=VA-w*L;sup[i]=MsA;sup[i+1]=MsB;
  const pts=[];const steps=Math.max(20,np||40);let ms=-Infinity,xm=0;
  for(let q=0;q<=steps;q++){const x=L*q/steps,Vx=VA-w*x,Mx=MsA+VA*x-w*x*x/2;pts.push({x,V:Vx,M:Mx});}
  if(w>0&&VA>0&&VA<w*L){xm=VA/w;ms=MsA+VA*xm-w*xm*xm/2;}else{ms=Math.max(MsA,MsB);xm=MsA>=MsB?0:L;}
  out.push({L,w,MsA,MsB,VA,VB,pts,Ms:Math.max(0,ms),xm});});
 return {n,spans:out,sup,Mhog:sup.map(v=>Math.max(0,-v)),EI:1};
}
function derive(c){const o={};o.fcd=c.acc*c.fck/c.gc;o.fyd=c.fyk/c.gs;o.Ab=Math.PI/4*c.phi*c.phi;o.Al=Math.PI/4*c.phiL*c.phiL;o.r0=Math.sqrt(c.fck)/1000;
 o.fctd=0.7*c.fctm/c.gc;o.eta1=1.0; o.eta2=c.phi<=32?1.0:(132-c.phi)/100; o.fbd=2.25*o.eta1*o.eta2*o.fctd;o.lb=(c.phi/4)*(o.fyd/o.fbd);o.Gsup=Object.values(c.dead).reduce((a,b)=>a+b,0);o.k2=2*c.acc/c.gc;return o;}

function deflectionCheck(f,c,o,L,d,K){
 if(!f||!(L>0&&d>0&&c.b>0&&f.Ar>0&&f.Ap>0))return null;
 // Use at least minimum tension reinforcement for rho to avoid a spurious,
 // excessively large limit when minimum steel governs.
 const AsT=Math.max(f.Ar,f.Amin||0),rho=AsT/(c.b*d),rho0=o.r0;
 if(!(rho>0&&rho0>0))return null;
 let basic;
 if(rho<=rho0){const q=rho0/rho;basic=K*(11+1.5*Math.sqrt(c.fck)*q+3.2*Math.sqrt(c.fck)*Math.pow(Math.max(0,q-1),1.5));}
 else {basic=K*(11+1.5*Math.sqrt(c.fck)*rho0/rho);} // conservative rho'=0
 // EC2 7.4.2(2), Expression (7.17): use As,prov / As,req for the steel-stress modification factor.
 // AsT=max(As,req, As,min) remains appropriate for rho in the basic L/d expression, but must not replace As,req in this factor.
 const f1=Math.min((f.Ap/f.Ar)*(500/c.fyk),1.5),f2=L>c.Lsp?c.Lsp/L:1;
 const modified=basic*f1*f2,actual=L/d;
 return {rho,rho0,K,AsT,basic,f1,f2,lim:basic,mod:modified,act:actual,chk:Number.isFinite(modified)&&modified>=actual?'OK':'NOT OK'};
}

function loads(c,h,addG,qov){const o=derive(c);const Gk=o.Gsup+h/1000*c.gconc+(addG||0);const Qk=(qov==null||qov==='')?c.Qk:qov;return{Gk,Qk,n:c.gG*Gk+c.gQ*Qk,q:Gk+c.psi2*Qk,Gsup:o.Gsup,sw:h/1000*c.gconc};}
// Stage 15: reject invalid common inputs before calculations can propagate NaN,
// negative geometry, or non-physical material/load values into a result screen.
function validateCommon(c,h,addG,qov,minimumDepthFactor=0.5){
 const positive=[['slab thickness h',h],['effective-width b',c.b],['concrete strength fck',c.fck],['steel strength fyk',c.fyk],['concrete factor γc',c.gc],['steel factor γs',c.gs],['αcc',c.acc],['main bar diameter Φ',c.phi],['distribution bar diameter ΦL',c.phiL],['concrete unit weight',c.gconc],['dead-load factor γG',c.gG],['live-load factor γQ',c.gQ]];
 for(const [name,value] of positive){if(!Number.isFinite(+value)||+value<=0)throw new RangeError(name+' must be a positive finite number.');}
 for(const [name,value] of [['cover',c.cover],['extra dead load',addG||0],['live load Qk',qov==null||qov===''?c.Qk:qov]]){
  if(!Number.isFinite(+value)||+value<0)throw new RangeError(name+' must be a non-negative finite number.');
 }
 if(!Number.isFinite(+c.Qk)||+c.Qk<0)throw new RangeError('Default live load Qk must be non-negative and finite.');
 if(!Number.isFinite(+c.psi2)||+c.psi2<0)throw new RangeError('ψ2 must be non-negative and finite.');
 if(!Number.isFinite(+c.gmin)||+c.gmin<0)throw new RangeError('Minimum permanent-load factor must be non-negative and finite.');
 if(!(h>c.cover+minimumDepthFactor*c.phi))throw new RangeError('Slab thickness must exceed cover plus the required bar-depth allowance.');
 if(c.Amax<=0||!Number.isFinite(+c.Amax))throw new RangeError('As,max ratio must be positive and finite.');
 return true;
}
function flex(c,o,M,d,h,ld){
 // Refuse invalid section/material inputs instead of allowing NaN or negative geometry into design.
 if(!(M>0&&c.b>0&&d>0&&h>0&&c.fck>0&&c.fyk>0&&c.gs>0&&c.gc>0&&c.acc>0&&c.phi>0&&c.fctm>=0&&o.fyd>0&&o.fcd>0))return null;
 const r={M,d};
 r.K=M*1e6/(c.b*d*d*c.fck);
 const Kuse=Math.min(r.K,c.Kl),rad=Math.max(0,0.25-Kuse/o.k2);
 r.z=Math.min(0.95*d,d*(0.5+Math.sqrt(rad)));
 r.Ar=Kuse*c.fck*c.b*d*d/(o.fyd*r.z);
 r.Amin=Math.max(0.26*(c.fctm/c.fyk)*c.b*d,0.0013*c.b*d);r.Au=Math.max(r.Ar,r.Amin);
 r.sreq=o.Ab*c.b/r.Au;
 // Start from strength and general slab-spacing limits, then iterate crack-control spacing
 // because the EC2 service steel stress depends on the provided reinforcement area.
 r.sp=Math.max(Math.min(f25(r.sreq),Math.min(3*h,400)),25);
 for(let i=0;i<12;i++){
  r.Ap=o.Ab*c.b/r.sp;
  r.sg=o.fyd*(r.Ar/r.Ap)*(ld.q/ld.n);
  r.scr=smax(r.sg,c.wk);
  if(h<=200||r.scr==null||r.sp<=r.scr)break;
  const next=Math.max(25,Math.min(r.sp,f25(r.scr)));
  if(next>=r.sp)break;
  r.sp=next;
 }
 r.Ap=o.Ab*c.b/r.sp;r.sg=o.fyd*(r.Ar/r.Ap)*(ld.q/ld.n);r.scr=smax(r.sg,c.wk);
 r.txt='H'+c.phi+' @'+r.sp+'mm C/C';
 // Independent resistance/ductility cross-check using provided steel and the EC2 rectangular stress block.
 r.x=r.Ap*o.fyd/(0.8*o.fcd*c.b);r.xd=r.x/d;
 r.zprov=d-0.4*r.x;
 // Do not clamp a non-physical/negative lever arm to zero: retain the raw value
 // so the resistance audit exposes an invalid neutral-axis depth explicitly.
 r.Mrd=r.Ap*o.fyd*r.zprov/1e6;
 const zlim=Math.min(0.95,0.5+Math.sqrt(Math.max(0,0.25-c.Kl/o.k2)));
 r.xlim=2.5*(1-zlim);
 r.capacityChk=(r.x>0&&r.x<d&&r.zprov>0&&r.Mrd+1e-6>=M)?'OK':'NOT OK (provided reinforcement resistance / neutral-axis geometry is invalid or < MEd)';
 r.ductilityChk=r.xd<=r.xlim+1e-9?'OK':'NOT OK (neutral-axis depth exceeds configured K′ ductility limit)';
 r.chk=r.K>c.Kl?"NOT OK (K>K′: singly reinforced section limit exceeded)":
  (r.Ap+1e-9<r.Au?'NOT OK (provided As < required As)':
  (r.Ap>c.Amax*c.b*h?'NOT OK (As>As,max)':
  (r.ductilityChk!=='OK'?r.ductilityChk:(r.capacityChk!=='OK'?r.capacityChk:'OK'))));
 return r;
}
// Stage 47: EN 1992-1-1 8.4 anchorage, 8.7 lap and 9.3.1.2 / 9.2.1.4 support anchorage (full implementation).
// Bond conditions (Fig. 8.2): η1 = 1.0 for good bond (slab h ≤ 250 mm, or bottom bars); η1 = 0.7 for poor bond
// (top bars in a slab thicker than 250 mm). η2 = 1.0 for Φ ≤ 32 mm.
// α1 = 1.0 (straight bars) · α2 = 1 − 0.15(cd − Φ)/Φ ∈ [0.7, 1.0] with cd = min(a/2, c1, c) ·
// α3 = 1.0 (no confining transverse reinforcement, K = 0) · α4 = 1.0 (no welded bars) · α5 = 1.0 (no transverse pressure assumed).
// Product α2·α3·α5 ≥ 0.7 (8.4.4(1)). Lap: α6 from the configured lapped-bar percentage (default 1.5 for > 50 %).
function anchorage(f,c,o,opt){
 if(!f||!(f.Ap>0)||!(f.Au>0))return null;
 opt=opt||{};const pos=opt.pos||'bottom',h=+opt.h||c.h;const phi=c.phi;
 const poor=pos==='top'&&h>250;
 const eta1=poor?0.7:1.0,eta2=o.eta2,fbd=2.25*eta1*eta2*o.fctd,lb=(phi/4)*(o.fyd/fbd);
 const ratio=Math.max(0,Math.min(1,f.Au/f.Ap)),lbrqd=lb*ratio;
 const a=Math.max(0,(f.sp||0)-phi),cd=Math.min(a/2,c.cover),alpha1=1,alpha3=1,alpha4=1,alpha5=1;
 const alpha2=Math.min(1,Math.max(0.7,1-0.15*(cd-phi)/phi));
 const prod=Math.max(0.7,alpha2*alpha3*alpha5),alphaProd=alpha1*alpha4*prod;
 const lbmin=Math.max(0.3*lbrqd,10*phi,100);
 const lbd=Math.max(alphaProd*lbrqd,lbmin);
 const lapMin=Math.max(0.3*c.a6*lbrqd,15*phi,200),lap=Math.max(c.a6*lbd,lapMin);
 return {pos,poor,eta1,eta2,fbd,lb,ratio,lbrqd,a,cd,alpha1,alpha2,alpha3,alpha4,alpha5,prod,alphaProd,lbmin,lbd,lapMin,lap};
}
// Anchorage of the bars that reach the support (EC2 9.3.1.2(1) and 9.2.1.4(2)): at least `frac` of the span bars
// continue to the support and must resist FE = VEd·al/z (al = d, z ≈ 0.9d). The straight length available is the
// support width minus the cover. `full` = true anchors the whole tensile force (cantilever top bars).
function supportAnchor(f,c,o,p){
 if(!f||!(f.Ap>0))return null;
 const base=anchorage(f,c,o,{pos:p.pos,h:p.h});if(!base)return null;
 const Fe=p.full?f.Au*o.fyd/1000:(p.V*p.d/(0.9*p.d)),As=p.full?f.Ap:Math.max(1e-9,(c.frac>0?c.frac:0.5)*f.Ap);
 const ratio=Math.min(1,Fe*1000/(As*o.fyd));
 const lbrqd=base.lb*ratio,lbmin=Math.max(0.3*lbrqd,10*c.phi,100),lbd=Math.max(base.alphaProd*lbrqd,lbmin);
 const lav=p.bw!=null?p.bw-c.cover:null;
 return {base,Fe,As,ratio,lbrqd,lbmin,lbd,lav,ok:lav!=null?lbd<=lav+1e-9:null,full:!!p.full,label:p.label};
}
// Aggregate every support-anchorage item into one fail-closed status.
function anchorageStatus(items,hasBeam){
 if(!items.length)return 'NOT OK (no reinforcement available for the anchorage check)';
 if(!hasBeam)return 'NOT OK (support beam width not entered: the anchorage length available at the support cannot be checked)';
 const bad=items.filter(x=>!x.ok);
 if(bad.length)return 'NOT OK (required anchorage '+bad.map(x=>x.label+' lbd = '+Math.ceil(x.lbd)+' mm > available '+Math.floor(x.lav)+' mm').join('; ')+': increase the support width, use a smaller bar diameter or provide bends/hooks)';
 return 'OK (EC2 8.4.4 / 9.3.1.2: required anchorage length ≤ length available at the support; lap length from α6)';
}

// Stage 46: shear at distance d from the face of the supporting beam (EN 1992-1-1 6.2.1(8)).
// Span lengths are taken centre-to-centre of the supporting beams, so the critical section lies x = bw/2 + d
// from the support centre-line. V is the shear at the support centre-line in kN/m (per 1 m strip).
function beamInput(inp,h){
  const has=v=>!(v===undefined||v===null||v==='');
  if(!has(inp.bw))return null;
  const bw=+inp.bw;
  if(!Number.isFinite(bw)||bw<=0)throw new RangeError('Support beam width bw must be a positive finite number.');
  let hb=null;
  if(has(inp.hb)){hb=+inp.hb;if(!Number.isFinite(hb)||hb<=0)throw new RangeError('Support beam depth hb must be a positive finite number.');if(hb<h)throw new RangeError('Support beam depth hb must not be less than the slab thickness.');}
  return {bw,hb};
}
function shearAtD(p){
  const b=p.beam;
  if(!b)return {state:'missing',dir:p.dir||null,V:p.V};
  const x=b.bw/2+p.d;
  if(!(x<p.reach))throw new RangeError('Support beam width plus effective depth is too large for this span (the critical section would lie beyond mid-span).');
  const Vface=Math.max(0,p.V-p.n*(b.bw/2)/1000),Vd=Math.max(0,p.V-p.n*x/1000);
  const passC=Vd<=p.vc+1e-9,passM=Vface<=p.vmax+1e-9;
  return {state:passC&&passM?'ok':'fail',dir:p.dir||null,bw:b.bw,hb:b.hb,d:p.d,x,V:p.V,n:p.n,Vface,Vd,vc:p.vc,vmax:p.vmax,passC,passM,util:p.vc>0?Vd/p.vc:Infinity};
}
// Governing result of several directions (two-way slabs): every direction must pass.
function shearGoverning(list){
  if(list.some(r=>r.state==='missing'))return list[0];
  const gov=list.reduce((a,b)=>b.util>a.util?b:a);
  return Object.assign({},gov,{state:list.every(r=>r.state==='ok')?'ok':'fail',passC:list.every(r=>r.passC),passM:list.every(r=>r.passM)});
}
function shearStatus(r){
  if(r.state==='missing')return 'NOT OK (support beam width not entered: shear cannot be checked at d from the support face)';
  if(r.state==='ok')return 'OK (VEd at d from the support face ≤ VRd,c: no shear reinforcement required)';
  if(!r.passC)return 'NOT OK (VEd at d from the support face > VRd,c: increase the slab thickness or provide shear reinforcement)';
  return 'NOT OK (VEd at the support face > VRd,max: the slab section is too small for shear)';
}

function design(inp,cin){const c=Object.assign({},DEF,cin||{});const h=inp.hov||c.h;const msOn=inp.meth==='Continuous strip'&&Array.isArray(inp.sp)&&inp.sp.length>0;const msK=msOn?Math.min(inp.sp.length-1,Math.max(0,Math.floor(+inp.ds||0))):0;let L=msOn?+inp.sp[msK].L:+inp.L;if(!Number.isFinite(L)||L<=0)throw new RangeError('One-way span L must be a positive finite number.');validateCommon(c,h,inp.addG,inp.qov,0.5);const o=derive(c);const beam=beamInput(inp,h);
 const ld=loads(c,h,+inp.addG||0,inp.qov);const d=h-c.cover-c.phi/2;const Lm=L/1000;
 const meth=inp.meth==='Continuous strip',Ll=msOn?(msK>0?+inp.sp[msK-1].L:0):(+inp.Ll||0),Lr=msOn?(msK<inp.sp.length-1?+inp.sp[msK+1].L:0):(+inp.Lr||0),lc=Ll>0||inp.el==='Fixed',rc=Lr>0||inp.er==='Fixed';
 const cu=meth?(lc&&rc?'Interior span':(lc||rc?'End span':'Simply supported')):inp.cs;const cf=CASES[cu];
 let msRes=null;
 if(msOn){const w0=ld.n,sp=inp.sp.map((x,i)=>({L:+x.L,w:(x.w===''||x.w==null||!Number.isFinite(+x.w))?w0:+x.w}));msRes=multiSpan(sp.map(x=>({L:x.L/1000,w:x.w})),inp.el||'Pinned',inp.er||'Pinned');const wk=sp[msK].w;ld.q=ld.q*(wk/w0);ld.n=wk;}
 const R={inp,c,o,h,d,L,ld,cf,cu,meth};
 if(msOn){R.ms=msRes;R.msK=msK;const S0=msRes.spans[msK];R.Ms=S0.Ms;R.Mh=Math.max(msRes.Mhog[msK],msRes.Mhog[msK+1]);R.V=Math.max(Math.abs(S0.VA),Math.abs(S0.VB));}
 else if(meth){R.cn=cont(Ll/1000,Lm,Lr/1000,inp.el||'Pinned',inp.er||'Pinned',ld.n,c.gmin*ld.Gk);R.Ms=R.cn.Ms;R.Mh=R.cn.Mh;R.V=R.cn.V;}
 else{R.Ms=cf[0]*ld.n*Lm*Lm;R.Mh=cf[1]*ld.n*Lm*Lm;R.V=cf[2]*ld.n*Lm;
  if(cu!=='Simply supported'&&cu!=='Cantilever'){
   const dd=x=>x>0&&Math.abs(x-L)/Math.max(x,L)>c.spanDiff;
   const checks=[];
   const count=Number(inp.spanCount),bay=Number(inp.bayArea);
   if(!(Number.isInteger(count)&&count>=3))checks.push('enter total span count ≥ 3');
   if(!(Number.isFinite(bay)&&bay>30))checks.push('bay area must be > 30 m²');
   if(!(Ll>0||Lr>0))checks.push('enter at least one adjacent span to verify approximate equality');
   if(cu==='Interior span'&&!(Ll>0&&Lr>0))checks.push('interior span requires both adjacent span lengths');
   if(dd(Ll)||dd(Lr))checks.push('adjacent spans differ by more than 15%');
   if(ld.Qk>c.qgRatio*ld.Gk)checks.push('Qk/Gk exceeds 1.25');
   if(ld.Qk>c.qMax)checks.push('Qk exceeds 5 kN/m²');
   R.cv=checks.length?'NOT OK (BS 8110 Table 3.12: '+checks.join('; ')+')':'NOT OK (REVIEW REQUIRED: entered local checks pass, but all span lengths and support/load conditions have not been independently verified)';
  }}
 R.fs=flex(c,o,R.Ms,d,h,ld);R.fh=flex(c,o,R.Mh,d,h,ld);
 const Am=R.fs?R.fs.Ap:(R.fh?R.fh.Ap:0);const sec={};sec.Ar=Math.max(0.2*Am,0.0013*c.b*d);sec.sreq=o.Ab*c.b/sec.Ar;
 sec.sp=Math.max(Math.min(f25(sec.sreq),Math.min(3.5*h,450)),25);sec.txt='H'+c.phi+' @'+sec.sp+'mm C/C';R.sec=sec;
 if((cu==='Simply supported'||cu==='End span')&&R.fs){const Ae=0.25*R.fs.Ap;const se=Math.max(Math.min(f25(o.Ab*c.b/Ae),Math.min(3*h,400)),25);R.end={Ae,sp:se,txt:'H'+c.phi+' @'+se+'mm C/C'};}
 // shear
 const s={};s.As1=Math.max(c.frac*(R.fs?R.fs.Ap:0),R.fh?R.fh.Ap:0);s.rho=Math.min(0.02,s.As1/(c.b*d));s.k=Math.min(1+Math.sqrt(200/d),2);s.vmin=0.035*Math.pow(s.k,1.5)*Math.sqrt(c.fck);
 s.vc=Math.max((0.18/c.gc)*s.k*Math.pow(100*s.rho*c.fck,1/3),s.vmin)*c.b*d/1000;s.vmax=0.6*(1-c.fck/250)*0.9*d*c.b*o.fcd/(c.cot+1/c.cot)/1000;
 s.at=shearAtD({V:R.V,n:ld.n,d,beam,vc:s.vc,vmax:s.vmax,reach:cu==='Cantilever'?L:L/2});s.gov=s.at;s.need=s.at.state==='missing'?R.V>s.vc:!s.at.passC;
 const Vdes=s.at.state==='missing'?R.V:s.at.Vd;s.aws=Vdes*1000/(0.9*d*o.fyd*c.cot);s.legs=Math.max(2,Math.ceil(s.aws*0.75*d/o.Al));s.linkSpacing=0.75*d;s.screen=s.at.state==='missing'?(R.V<=s.vc?'PRELIMINARY SCREEN (no beam data): VEd ≤ VRd,c':'PRELIMINARY SCREEN (no beam data): VEd > VRd,c'):(s.need?'VEd,d > VRd,c':'VEd,d ≤ VRd,c');s.chk=shearStatus(s.at);R.sh=s;
 // Deflection: use positive (sagging) mid-span reinforcement where available.
 const Ar=R.fs?R.fs:R.fh;R.df=Ar?deflectionCheck(Ar,c,o,L,d,cf[3]):null;
 // crack
 const ck=(f)=>{if(!f)return null;const sg=o.fyd*(f.Ar/f.Ap)*(ld.q/ld.n);const sm=smax(sg,c.wk);let chk;if(h<=200)chk='NOT OK (review required: EC2 7.3.3(1) exemption depends on no significant axial tension and verified 9.3 detailing)';else if(sm==null)chk='NOT OK (Table 7.3N not applicable: direct crack-width verification required)';else chk=f.sp<=sm?'OK (simplified Table 7.3N check)':'NOT OK (bar spacing exceeds Table 7.3N limit)';return{sg,sm,chk};};R.cs=ck(R.fs);R.ch=ck(R.fh);
 // anchorage (Stage 47: EC2 8.4 bond/α-factors + support anchorage check)
 R.anch={sag:anchorage(R.fs,c,o,{pos:'bottom',h}),hog:anchorage(R.fh,c,o,{pos:'top',h})};R.lbs=R.anch.sag?R.anch.sag.lbd:null;R.lbh=R.anch.hog?R.anch.hog.lbd:null;R.l0=Math.max(R.anch.sag?R.anch.sag.lap:0,R.anch.hog?R.anch.hog.lap:0);
 {const items=[];const bw=beam?beam.bw:null;const Vsup=R.V;
  if(cu==='Cantilever'){const x=supportAnchor(R.fh,c,o,{pos:'top',h,d,V:Vsup,bw,full:true,label:'top bars into the support'});if(x)items.push(x);}
  else{const x=supportAnchor(R.fs,c,o,{pos:'bottom',h,d,V:Vsup,bw,label:'bottom bars at the support'});if(x)items.push(x);}
  R.supA=items;R.anchorStatus=anchorageStatus(items,!!beam);}
 // Stage 11: fail-closed status aggregation. Missing checks and any status not explicitly beginning with OK are unresolved.
 const pass=x=>typeof x==='string'&&/^OK(?:$|\s|\()/i.test(x);
 const sp=[R.fs&&R.fs.sp,R.fh&&R.fh.sp,sec.sp].filter(x=>x!=null);
 const flexComplete=!!(R.fs||R.fh) && (!R.Ms||!!R.fs) && (!R.Mh||!!R.fh);
 const crackComplete=!!(R.cs||R.ch) && (!R.fs||pass(R.cs&&R.cs.chk)) && (!R.fh||pass(R.ch&&R.ch.chk));
 R.st={flex:flexComplete&&(!R.fs||pass(R.fs.chk))&&(!R.fh||pass(R.fh.chk))?'OK':'NOT OK (flexural check failed or unavailable)',spacing:sp.length>=2&&sp.every(x=>Number.isFinite(x)&&x>=75)?'OK':'NOT OK (spacing check failed or incomplete)',shear:s.chk,defl:R.df?R.df.chk:'NOT OK (no design moment / deflection result)',crack:crackComplete?'OK':'NOT OK (crack-control check failed or incomplete)'};
 R.st.cv=R.cv||'-';R.st.anchorage=R.anchorStatus;
 const required=['flex','spacing','shear','defl','crack','anchorage'];
 R.st.overall=required.every(k=>pass(R.st[k])) && (R.st.cv==='-'||pass(R.st.cv))?'OK':'NOT OK';return R;}
const g=(x,n)=>{const s=(+x).toFixed(n);return s.indexOf('.')>=0?s.replace(/0+$/,'').replace(/\.$/,''):s;};
function anchorageRows(an,tag){
 if(!an)return [];const G=g;
 return [[tag+' · bond','η1 = 1.0 good / 0.7 poor ; η2 = 1.0 (Φ ≤ 32) ; fbd = 2.25·η1·η2·fctd',`${an.poor?'poor':'good'} bond · η1 = ${G(an.eta1,2)} · η2 = ${G(an.eta2,3)} · fbd = ${G(an.fbd,3)} MPa`],
  [tag+' · basic length','lb = (Φ/4)·(fyd/fbd) ; lb,rqd = lb·As,req/As,prov',`lb = ${G(an.lb,0)} mm · As,req/As,prov = ${G(an.ratio,3)} → lb,rqd = ${G(an.lbrqd,0)} mm`],
  [tag+' · α factors','α1 = 1 (straight) ; α2 = 1 − 0.15(cd − Φ)/Φ ≥ 0.7 ; α3 = α4 = α5 = 1',`cd = ${G(an.cd,1)} mm → α2 = ${G(an.alpha2,3)} · α2α3α5 = ${G(an.prod,3)} (≥ 0.7)`],
  [tag+' · design length','lbd = α1α2α3α4α5·lb,rqd ≥ lb,min = max(0.3lb,rqd, 10Φ, 100)',`= ${G(an.alphaProd,3)}·${G(an.lbrqd,0)} → lbd = ${G(an.lbd,0)} mm (lb,min = ${G(an.lbmin,0)} mm)`,1],
  [tag+' · lap l0','l0 = α6·lbd ≥ l0,min = max(0.3·α6·lb,rqd, 15Φ, 200)',`= ${G(R_a6,2)}·${G(an.lbd,0)} → l0 = ${G(an.lap,0)} mm (l0,min = ${G(an.lapMin,0)} mm)`]];
}
function supportRows(x){
 if(!x)return [];const G=g;
 const lead=x.full?['Force to anchor','FE = As,req·fyd (whole tension force)',`= ${G(x.Fe,1)} kN/m`]:['Force to anchor','FE = VEd·al/z , al = d , z = 0.9d (EC2 9.2.1.4(2))',`= ${G(x.Fe,1)} kN/m  carried by ${G(x.As,0)} mm²/m`];
 return [lead,
  [x.label+' · required','lbd = α·lb·FE/(As·fyd) ≥ lb,min',`lbd = ${G(x.lbd,0)} mm (lb,min = ${G(x.lbmin,0)} mm)`],
  [x.label+' · available','lav = bw − cover (straight bar to the support)',x.lav==null?'support beam width not entered':`= ${G(x.lav+0,0)} mm → ${x.ok?'OK':'NOT OK'} (${G(x.lbd,0)} ${x.ok?'≤':'>'} ${G(x.lav,0)} mm)`,1]];
}
let R_a6=1.5;
function anchorageSteps(R){
 R_a6=R.c.a6;const rows=[];
 if(R.anch.sag)rows.push(...anchorageRows(R.anch.sag,'Bottom'));
 if(R.anch.hog)rows.push(...anchorageRows(R.anch.hog,'Top'));
 (R.supA||[]).forEach(x=>rows.push(...supportRows(x)));
 rows.push(['Top-bar curtailment','Top bars extend ≥ lbd + d beyond the section where they are no longer required (shift rule, al = d)',R.anch.hog?`lbd + d = ${g(R.anch.hog.lbd+R.d,0)} mm`:'no top bars']);
 rows.push(['Anchorage status','EC2 8.4.4 · 8.7.3 · 9.3.1.2',R.anchorStatus,1]);
 return {t:'Anchorage & lap (EC2 8.4 · 8.7 · 9.3.1.2)',r:rows};
}
function steps(R){const c=R.c,o=R.o,f=R.fs||R.fh,M=R.fs?R.Ms:R.Mh,t=R.fs?'sagging':'hogging',cap=R.fs?'':' (hogging)';const L=[];
 L.push({t:'Design load',r:[['Gk','Gk = Σ dead + h·γ',`= ${g(R.ld.Gsup,3)} + ${g(R.ld.sw,3)} = ${g(R.ld.Gk,3)} kN/m²`],['n','n = γG·Gk + γQ·Qk',`= ${c.gG}·${g(R.ld.Gk,3)} + ${c.gQ}·${g(R.ld.Qk,2)} = ${g(R.ld.n,3)} kN/m²`,1]]});
 if(R.ms){const q=R.ms,k=R.msK,S0=q.spans[k];L.push({t:'Continuous strip analysis',r:[['Model',`${q.n} span(s) · ends ${R.inp.el||'Pinned'} / ${R.inp.er||'Pinned'}`,`span lengths ${q.spans.map(x=>g(x.L,2)).join(' · ')} m`],['Design loads','w per span (kN/m), as entered',q.spans.map(x=>g(x.w,2)).join(' · ')],['Method','slope-deflection, EI constant, loads as entered (no pattern loading)',`support moments ${q.sup.map(v=>g(v,2)).join(' · ')} kNm/m`],['Design span',`span ${k+1} of ${q.n}`,`M sag max = ${g(S0.Ms,3)} kNm/m at x = ${g(S0.xm,2)} m`],['Hogging','larger support moment of the design span',`= ${g(R.Mh,3)} kNm/m`],['V support','larger end shear of the design span (centre-line)',`= ${g(R.V,3)} kN/m`,1]]});}else if(R.meth){const q=R.cn;L.push({t:'Continuous strip analysis',r:[['Loads','w max = n ; w min = γG,min·Gk',`= ${g(q.wmx,3)} ; ${g(q.wmn,3)} kN/m`],['Model',`span b = ${g(R.L/1000,3)} m · a = ${g((+R.inp.Ll||0)/1000,3)} m · c = ${g((+R.inp.Lr||0)/1000,3)} m`,`ends: ${R.inp.el||'Pinned'} / ${R.inp.er||'Pinned'} → ${R.cu}`],['Patterns','P1 b · P2 a+b · P3 b+c · P4 all',`M sag max = ${g(q.Ms,3)} kNm/m`],['Hogging','max of supports',`left ${g(q.Mh1,3)} · right ${g(q.Mh2,3)} → ${g(q.Mh,3)} kNm/m`],['V support','envelope (support centre-line)',`= ${g(q.V,3)} kN/m`,1]]});}else L.push({t:'Analysis (per 1 m)',r:[['Coefficients',R.inp.cs,`αs = ${R.cf[0]} · αh = ${R.cf[1]} · βv = ${R.cf[2]}`],['M sagging','M = αs·n·L²',`= ${R.cf[0]}·${g(R.ld.n,3)}·${g(R.L/1000,3)}² = ${g(R.Ms,3)} kNm/m`],['M hogging','M = αh·n·L²',`= ${g(R.Mh,3)} kNm/m`],['V support','V = βv·n·L (support centre-line)',`= ${g(R.V,3)} kN/m`,1]].concat(R.cv?[['Coefficient validity','Table 3.12: ≥3 spans · bay >30 m² · approximately equal spans · Qk/Gk ≤1.25 · Qk ≤5',R.cv,/^OK/.test(R.cv)?0:1]]:[])});
 if(f)L.push({t:'Flexure · '+t,r:[['Effective depth','d = h − c − Φ/2',`= ${g(R.h,0)} − ${c.cover} − ${c.phi}/2 = ${g(R.d,0)} mm`],['Moment factor','K = M·10⁶ / (b·d²·fck)',`= ${g(M,3)}·10⁶ / (${c.b}·${g(R.d,0)}²·${c.fck}) = ${g(f.K,4)}`],['Lever arm','z = min(0.95d , d[0.5+√(0.25−K/(2αcc/γc))])',`= ${g(f.z,1)} mm`],['Steel area','As = K·fck·b·d² / (fyd·z)',`= ${g(f.Ar,0)} mm²/m`],['Provided-steel resistance','x = As,prov·fyd/(0.8fcd·b) ; zprov = d − 0.4x ; Mrd = As,prov·fyd·zprov',`x/d = ${g(f.xd,4)} ; zprov = ${g(f.zprov,1)} mm ; Mrd = ${g(f.Mrd,3)} kNm/m vs MEd = ${g(f.M,3)} kNm/m → ${f.capacityChk}`,1],['Ductility limit','x/d ≤ xlim derived from K′',`xlim = ${g(f.xlim,4)} ; ${f.ductilityChk}`,1],['Minimum steel','As,min = max(0.26·fctm/fyk·b·d , 0.0013·b·d)',`= ${g(f.Amin,0)} mm²/m`+(f.Amin>f.Ar?'   ← governs':''),f.Amin>f.Ar?1:0]]});
 if(f)L.push({t:'Bars & spacing',r:[['Stress (SLS)','σs = fyd·(As,ULS req/As,prov)·(q/n)',`= ${g(f.sg,0)} N/mm² · As,ULS req = ${g(f.Ar,0)} · As,prov = ${g(f.Ap,0)} mm²/m`],['Crack limit','s max (EC2 Table 7.3N)',f.scr==null?'Not applicable / direct check required':`= ${g(f.scr,0)} mm`],['Spacing','Iterative: strength spacing + crack-control spacing',`= ${f.sp} mm after recalculating σs from As,prov`],['Provided','Ab·b/s',`${f.txt}  (${g(f.Ap,0)} mm²/m)`,1]]});
 const s=R.sh,a=s.at;const shR=[['k, ρ1','k = min(1+√(200/d),2)',`k = ${g(s.k,3)} · ρ1 = ${g(s.rho,5)}`],['VRd,c','max(0.18/γc·k·(100ρ1·fck)^⅓ , vmin)·b·d',`= ${g(s.vc,1)} kN/m`]];
 if(a.state==='missing')shR.push(['Support beam','Enter the beam width bw in Slab data',`Not entered — support shear ${g(R.V,2)} kN/m is not checked at d from the face`,1]);
 else shR.push(['Support beam','bw × hb · span L is centre-to-centre of the beams',`= ${g(a.bw,0)}${a.hb?' × '+g(a.hb,0):''} mm`],['Critical section','x = bw/2 + d (from the beam centre-line)',`= ${g(a.bw,0)}/2 + ${g(a.d,0)} = ${g(a.x,0)} mm`],['Shear at d from face','VEd,d = V − n·x',`= ${g(R.V,2)} − ${g(R.ld.n,2)}·${g(a.x/1000,3)} = ${g(a.Vd,2)} kN/m`,1],['Check 1 · concrete','VEd,d ≤ VRd,c',`${g(a.Vd,2)} ${a.passC?'≤':'>'} ${g(s.vc,1)} kN/m → ${a.passC?'OK':'NOT OK'}`,1],['Check 2 · crushing','VEd,face = V − n·bw/2 ≤ VRd,max',`${g(a.Vface,2)} ${a.passM?'≤':'>'} ${g(s.vmax,1)} kN/m → ${a.passM?'OK':'NOT OK'}`,1]);
 shR.push(['Design status','EC2 6.2.1(8) · 6.2.2 · 6.2.3 — UDL on the top face, direct support, tension bars anchored beyond lbd + d, recommended CRd,c',s.chk,1]);
 L.push({t:'Shear',r:shR});
 if(R.df)L.push({t:'Deflection (EC2 7.4.2)',r:[['Tension steel ratio','ρ = max(As,req, As,min)/(b·d)',`= ${g(R.df.rho,6)} ; ρ0 = ${g(R.df.rho0,6)}`],['Basic limit','EC2 span/depth expression',`= ${g(R.df.lim,2)}`],['Correction factors','f1 = steel factor ; f2 = span factor',`= ${g(R.df.f1,3)} · ${g(R.df.f2,3)}`],['Modified limit','(L/d)lim = basic·f1·f2',`= ${g(R.df.mod,2)}`],['Actual ratio','L/d',`= ${g(R.df.act,2)}`],['Check','modified limit ≥ actual ratio',R.df.chk,1]]});
 L.push({t:'Crack control',r:[['Sagging',R.cs?`σs ${g(R.cs.sg,0)} → s max ${R.cs.sm==null?'direct check required':g(R.cs.sm,0)+' mm'}`:'-',R.cs?R.cs.chk:'-',1],['Hogging',R.ch?`σs ${g(R.ch.sg,0)} → s max ${R.ch.sm==null?'direct check required':g(R.ch.sm,0)+' mm'}`:'-',R.ch?R.ch.chk:'-']]});
 L.push(anchorageSteps(R));
 return L;}
const API={DEF,CASES,design,cont,multiSpan,flex,smax,f25,steps,derive,loads,deflectionCheck,anchorage,supportAnchor,anchorageStatus,anchorageRows,supportRows,validateCommon,beamInput,shearAtD,shearGoverning,shearStatus,g};
if(typeof module!=='undefined')module.exports=API;else root.SL=API;})(this);
