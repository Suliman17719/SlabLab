/*
 * SlabLab — ACI 318-25 development module (Stage 39)
 * Scope: preliminary singly-reinforced rectangular slab-strip flexural section analysis.
 * Units: MPa, mm, kN·m per strip.
 * NOT a complete ACI 318-25 slab design. Minimum reinforcement, spacing, shear,
 * serviceability, development, detailing, load combinations, and edition-specific
 * provisions still require authoritative verification and independent validation.
 */
(function(root){
'use strict';
const VERSION='ACI 318-25 · Stage 41 deflection and punching-demand utilities';
const finitePositive=(v)=>Number.isFinite(v)&&v>0;
function parseNumber(value,name){
  if(value===null||value===undefined||typeof value==='boolean'||(typeof value==='string'&&value.trim()===''))
    throw new RangeError(name+' is required and must be numeric.');
  const n=Number(value);
  if(!Number.isFinite(n)) throw new RangeError(name+' must be finite.');
  return n;
}
function beta1(fc){
  if(!finitePositive(Number(fc))) throw new RangeError("ACI f'c must be a positive finite value in MPa.");
  return Math.max(0.65,0.85-0.05*Math.max(0,(Number(fc)-28)/7));
}
function section(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Section input object is required.');
  const b=parseNumber(input.b,'b'),h=parseNumber(input.h,'h'),d=parseNumber(input.d,'d'),fc=parseNumber(input.fc,"f'c"),fy=parseNumber(input.fy,'fy'),Es=input.Es===undefined?200000:parseNumber(input.Es,'Es'),Mu=parseNumber(input.Mu,'Mu'),As=input.As===undefined?0:parseNumber(input.As,'As');
  for(const [name,value] of [['b',b],['h',h],['d',d],["f'c",fc],['fy',fy],['Es',Es]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(!(d<h)) throw new RangeError('Effective depth d must be less than overall thickness h.');
  if(Mu<0) throw new RangeError('Mu must be non-negative.');
  if(As<0) throw new RangeError('Provided As must be non-negative.');
  const b1=beta1(fc),epsTy=fy/Es,epsTensionLimit=epsTy+0.003;
  function evaluate(area){
    if(area===0) return {As:0,a:0,c:0,epsT:null,phi:null,Mn:0,phiMn:0,validRectangularBlock:true};
    const a=area*fy/(0.85*fc*b),c=a/b1;
    const epsT=c<d?0.003*(d-c)/c:0;
    let phi;
    if(epsT<=epsTy) phi=0.65;
    else if(epsT>=epsTensionLimit) phi=0.90;
    else phi=0.65+0.25*(epsT-epsTy)/0.003;
    const Mn=area*fy*(d-a/2)/1e6;
    const validRectangularBlock=a<d && Mn>=0;
    return {As:area,a,c,epsT,phi,Mn,phiMn:validRectangularBlock?Math.max(0,phi*Mn):0,validRectangularBlock};
  }
  // Restrict the required-steel search to the tension-controlled limit. This avoids
  // returning a numerically sufficient but non-ductile required area for slab design.
  const cAtTensionLimit=0.003*d/(epsTensionLimit+0.003);
  const aAtTensionLimit=b1*cAtTensionLimit;
  const AsTensionLimit=0.85*fc*b*aAtTensionLimit/fy;
  const maxTensionControlled=evaluate(AsTensionLimit);
  let required=null,requiredStatus='NOT REQUIRED (Mu = 0)';
  if(Mu>0){
    if(Mu>maxTensionControlled.phiMn+1e-9){
      requiredStatus='NO TENSION-CONTROLLED SOLUTION — revise section/design assumptions';
    } else {
      let lo=0,hi=AsTensionLimit;
      for(let i=0;i<120;i++){
        const mid=(lo+hi)/2;
        if(evaluate(mid).phiMn>=Mu) hi=mid; else lo=mid;
      }
      required=evaluate(hi);
      requiredStatus='TENSION-CONTROLLED SOLUTION FOUND';
    }
  }
  const provided=evaluate(As);
  const providedDomain=As===0?'NOT APPLICABLE':(provided.epsT>=epsTensionLimit?'TENSION-CONTROLLED':provided.epsT<=epsTy?'COMPRESSION-CONTROLLED':'TRANSITION');
  const providedStrengthOK=As>0&&provided.validRectangularBlock&&provided.phiMn+1e-7>=Mu;
  const providedDuctilityOK=As>0&&provided.validRectangularBlock&&providedDomain==='TENSION-CONTROLLED';
  const requiredDomain=required?'TENSION-CONTROLLED':null;
  return {
    version:VERSION,scopeStatus:'PRELIMINARY ONLY — NOT A COMPLETE ACI 318-25 SLAB DESIGN',
    units:'MPa, mm, kN·m per strip',b,h,d,fc,fy,Es,beta1:b1,epsTy,epsTensionLimit,
    required:required?Object.assign({},required,{strainDomain:requiredDomain,strengthCheck:required.phiMn+1e-7>=Mu?'OK':'NOT OK',ductilityCheck:'OK'}):null,
    requiredStatus,
    tensionControlledLimit:{As:AsTensionLimit,phiMn:maxTensionControlled.phiMn,strain:epsTensionLimit},
    provided:Object.assign({},provided,{validGeometry:provided.validRectangularBlock,strengthCheck:providedStrengthOK?'OK':'NOT OK',ductilityCheck:providedDuctilityOK?'OK':'NOT OK',strainDomain:providedDomain}),
    Mu,checks:{flexuralStrength:Mu===0?'NOT CHECKED (Mu = 0)':(providedStrengthOK?'OK':'NOT OK'),
      slabStrainLimit:As===0?'NOT CHECKED (As = 0)':(providedDuctilityOK?'OK':'NOT OK'),
      requiredTensionControlledCapacity:Mu===0?'NOT CHECKED':(required?'OK':'NOT OK'),
      minimumReinforcement:'NOT IMPLEMENTED',spacing:'NOT IMPLEMENTED',shear:'NOT IMPLEMENTED',deflection:'NOT IMPLEMENTED',development:'NOT IMPLEMENTED',detailing:'NOT IMPLEMENTED'}
  };
}


function oneWaySlabMinimumThickness(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('One-way slab thickness input object is required.');
  const span=parseNumber(input.span,'span'),h=parseNumber(input.h,'h'),fy=parseNumber(input.fy,'fy');
  const support=input.support;
  for(const [name,value] of [['span',span],['h',h],['fy',fy]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  const ratios={'simply-supported':20,'one-end-continuous':24,'both-ends-continuous':28,'cantilever':10};
  if(!Object.prototype.hasOwnProperty.call(ratios,support)) throw new RangeError("support must be simply-supported, one-end-continuous, both-ends-continuous, or cantilever.");
  // ACI 318-25 Table 7.3.1.1, normalweight concrete; 7.3.1.1.1 adjusts
  // the tabulated value for fy other than 420 MPa. Lightweight-concrete
  // modifications and all exceptions are intentionally outside this helper.
  const fyFactor=0.4+fy/700;
  const baseMinimum=span/ratios[support];
  const minimumThickness=baseMinimum*fyFactor;
  return {
    version:VERSION, code:'ACI 318-25', scopeStatus:'PRELIMINARY MINIMUM-THICKNESS SCREEN — NOT A DEFLECTION CALCULATION',
    units:'span and thickness in mm; fy in MPa',span,h,fy,support,tableRatio:ratios[support],fyFactor,baseMinimum,minimumThickness,
    providedThicknessCheck:h+1e-9>=minimumThickness?'OK':'NOT OK',
    references:{table:'ACI 318-25 Table 7.3.1.1',fyAdjustment:'ACI 318-25 §7.3.1.1.1'},
    limitations:['Assumes a nonprestressed solid one-way slab with normalweight concrete.', 'Does not calculate immediate or long-term deflection.', 'Check all table applicability conditions, lightweight-concrete adjustments, exceptions, and actual Code Requirements before design use.']
  };
}


function oneWayShearDemandUniformLoad(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Uniform-load shear-demand input object is required.');
  const span=parseNumber(input.span,'span'),d=parseNumber(input.d,'d'),wu=parseNumber(input.wu,'wu');
  for(const [name,value] of [['span',span],['d',d]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(wu<0) throw new RangeError('Factored uniform load wu must be non-negative.');
  if(input.support!=='simply-supported') throw new RangeError('Automatic shear demand is implemented only for a simply supported strip; enter externally analysed Vu for other support conditions.');
  if(span<=2*d) throw new RangeError('Clear span must exceed 2d for this critical-section shear calculation.');
  // Clear span is measured face-to-face. For a symmetric simply supported strip
  // with full-span uniform factored load and no point loads, V at a section d
  // from either support face = wu*(Lclear/2 - d). wu is kN/m; lengths are mm.
  const leverLength=span/2-d;
  const Vu=wu*leverLength/1000;
  return {code:'ACI 318-25',scopeStatus:'LOAD-CASE-SPECIFIC SHEAR DEMAND ONLY',units:'span,d in mm; wu in kN/m; Vu in kN',span,d,wu,support:input.support,criticalSectionDistanceFromSupportFace:d,leverLength,Vu,assumptions:['Simply supported strip.','Clear span measured face-to-face.','Factored uniform load acts over the full clear span.','No point loads, partial-span loads, or other actions.','This helper does not determine whether this is the governing critical section for every real slab configuration.']};
}


function oneWaySlabStripDesign(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('One-way slab strip input object is required.');
  const b=input.b===undefined?1000:parseNumber(input.b,'b');
  const span=parseNumber(input.span,'span'),h=parseNumber(input.h,'h'),d=parseNumber(input.d,'d');
  const fc=parseNumber(input.fc,"f'c"),fy=parseNumber(input.fy,'fy'),Mu=parseNumber(input.Mu,'Mu');
  const barDiameter=parseNumber(input.barDiameter,'barDiameter'),barSpacing=parseNumber(input.barSpacing,'barSpacing');
  const support=input.support;
  for(const [name,value] of [['b',b],['span',span],['h',h],['d',d],["f'c",fc],['fy',fy],['barDiameter',barDiameter],['barSpacing',barSpacing]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(!(d<h)) throw new RangeError('Effective depth d must be less than overall thickness h.');
  if(Mu<0) throw new RangeError('Mu must be non-negative.');
  const AsProvided=(Math.PI*barDiameter*barDiameter/4)*(b/barSpacing);
  const grossArea=b*h;
  const AsMin=0.0018*grossArea; // ACI 318-25 §7.6.1.1; confirm applicability and exceptions in licensed Code Requirements
  const flexure=section({b,h,d,fc,fy,Mu,As:AsProvided,Es:input.Es});
  const thickness=oneWaySlabMinimumThickness({span,h,fy,support});
  flexure.checks.minimumReinforcement=AsProvided+1e-9>=AsMin?'OK':'NOT OK';
  let shearDemand=null;
  let VuForCheck=null;
  if(input.Vu!==undefined&&input.Vu!==null&&String(input.Vu).trim()!=='') VuForCheck=parseNumber(input.Vu,'Vu');
  else if(input.wu!==undefined&&input.wu!==null&&String(input.wu).trim()!=='') {
    shearDemand=oneWayShearDemandUniformLoad({span,d,wu:parseNumber(input.wu,'wu'),support});
    VuForCheck=shearDemand.Vu;
  }
  const shear=VuForCheck===null?null:oneWaySlabShear({b,d,fc,AsLongitudinal:AsProvided,Vu:VuForCheck});
  const checks={
    minimumFlexuralReinforcement:AsProvided+1e-9>=AsMin?'OK':'NOT OK',
    flexuralStrength:flexure.checks.flexuralStrength,
    tensionControlledStrain:flexure.checks.slabStrainLimit,
    minimumThickness:thickness.providedThicknessCheck,
    oneWayShear:shear?shear.shearStrengthCheck:'NOT CHECKED — ENTER Vu'
  };
  const passed=!!shear&&Object.values(checks).every(v=>v==='OK'||v==='NOT CHECKED (Mu = 0)');
  return {
    code:'ACI 318-25',version:VERSION,
    scopeStatus:'INTEGRATED PRELIMINARY CHECKS ONLY — NOT A COMPLETE ACI SLAB DESIGN',
    units:'MPa, mm, kN·m per strip',input:{b,span,h,d,fc,fy,Mu,barDiameter,barSpacing,support},
    grossArea,AsMin,AsProvided,flexure,thickness,shear,shearDemand,checks,
    status:passed?'LIMITED_CHECKS_PASSED_NOT_FULL_DESIGN':'REVIEW_REQUIRED',
    notImplemented:[...(shear?[]:['one-way shear']), 'punching shear','immediate and long-term deflection','development and lap splices','all bar-spacing/detailing requirements','load combinations','support moment analysis','openings and concentrated loads','lightweight concrete and special material cases'],
    references:{minimumFlexuralReinforcement:'ACI 318-25 §7.6.1.1',minimumThickness:'ACI 318-25 Table 7.3.1.1 and §7.3.1.1.1'},
    limitations:['Uses the entered factored strip moment Mu; does not derive design moments from loads or analyze continuity.','Minimum-thickness screen applies only when all table applicability conditions are satisfied.','A passing result means only that the listed checks passed; it is not approval for construction or a complete code-compliance statement.']
  };
}


function oneWaySlabShear(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('One-way slab shear input object is required.');
  const b=parseNumber(input.b,'b'),d=parseNumber(input.d,'d'),fc=parseNumber(input.fc,"f'c"),As=parseNumber(input.AsLongitudinal,'AsLongitudinal'),Vu=parseNumber(input.Vu,'Vu');
  const lambda=input.lambda===undefined?1:parseNumber(input.lambda,'lambda');
  const phi=input.phi===undefined?0.75:parseNumber(input.phi,'phi');
  for(const [name,value] of [['b',b],['d',d],["f'c",fc],['AsLongitudinal',As],['lambda',lambda],['phi',phi]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(Vu<0) throw new RangeError('Vu must be non-negative.');
  if(phi>1) throw new RangeError('phi must not exceed 1.0.');
  if(As<=0) throw new RangeError('Positive longitudinal tension reinforcement is required for the rho_w calculation.');
  // ACI 318-25 §22.5.5.1, Table 22.5.5.1(c), §22.5.5.1.1 and §22.5.5.1.3.
  // SI coefficients; nonprestressed member without minimum shear reinforcement,
  // no axial force, and no special high-strength/lightweight-material provisions.
  const rhoRaw=As/(b*d),rho=Math.min(rhoRaw,0.02);
  const lambdaS=Math.min(1,Math.sqrt(2/(1+0.004*d)));
  const rootFc=Math.sqrt(fc);
  const vcStressFromTable=0.66*lambdaS*lambda*Math.cbrt(rho)*rootFc;
  const vcStressLowerBound=0.083*lambda*rootFc;
  const vcStressUpperBound=0.42*lambda*rootFc;
  const vcStress=Math.min(vcStressUpperBound,Math.max(vcStressFromTable,vcStressLowerBound));
  const Vc=vcStress*b*d/1000; // MPa × mm² = N; report kN
  const phiVc=phi*Vc;
  return {
    code:'ACI 318-25',version:VERSION,
    scopeStatus:'LIMITED ONE-WAY SHEAR CHECK — NOT A COMPLETE ACI SLAB DESIGN',
    units:'fc in MPa; b,d in mm; As in mm²; Vu and capacities in kN',
    b,d,fc,AsLongitudinal:As,Vu,lambda,phi,rhoRaw,rho,lambdaS,
    vcStressFromTable,vcStressLowerBound,vcStressUpperBound,vcStress,Vc,phiVc,
    shearStrengthCheck:phiVc+1e-9>=Vu?'OK':'NOT OK',
    references:{concreteShear:'ACI 318-25 Table 22.5.5.1(c)',lowerAndUpperBounds:'ACI 318-25 §22.5.5.1.1',sizeEffect:'ACI 318-25 §22.5.5.1.3',slabApplication:'ACI 318-25 §7.5.3.1'},
    limitations:[
      'Vu may be entered externally, or estimated only for the explicitly supported simply-supported/full-span uniform-load case; other load patterns and support conditions require external analysis.',
      'Assumes a nonprestressed solid slab without minimum shear reinforcement, no axial force, and longitudinal tension reinforcement developed at the critical section.',
      'Assumes the applicable SI provisions and normalweight concrete by default (lambda = 1.0); verify all applicability conditions and coefficients against the licensed ACI 318-25 Code Requirements.',
      'Does not check punching shear, openings, concentrated loads, shear reinforcement, or full slab design.'
    ]
  };
}

function twoWaySlabReinforcement(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Two-way slab reinforcement input object is required.');
  const h=parseNumber(input.h,'h'), b=input.b===undefined?1000:parseNumber(input.b,'b');
  const barDiameter=parseNumber(input.barDiameter,'barDiameter');
  const barSpacing=parseNumber(input.barSpacing,'barSpacing');
  const requiredAs=input.requiredAs===undefined?0:parseNumber(input.requiredAs,'requiredAs');
  const location=input.location===undefined?'other':input.location;
  for(const [name,value] of [['h',h],['b',b],['barDiameter',barDiameter],['barSpacing',barSpacing]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(requiredAs<0) throw new RangeError('requiredAs must be non-negative.');
  if(!['critical','other'].includes(location)) throw new RangeError("location must be 'critical' or 'other'.");
  const grossArea=b*h;
  const AsMin=0.0018*grossArea;
  const AsProvided=(Math.PI*barDiameter*barDiameter/4)*(b/barSpacing);
  const maxSpacing=Math.min(location==='critical'?2*h:3*h,450);
  const requiredTotal=Math.max(requiredAs,AsMin);
  return {
    version:VERSION, code:'ACI 318-25', scopeStatus:'LIMITED CHECK ONLY — NONPRESTRESSED SOLID TWO-WAY SLAB STRIP; NOT A COMPLETE SLAB DESIGN',
    units:'mm, mm² over the entered strip width b', b,h,location,grossArea,AsMin,requiredAs,requiredTotal,
    barDiameter,barSpacing,AsProvided,maxSpacing,
    checks:{minimumFlexuralReinforcement:AsProvided+1e-9>=AsMin?'OK':'NOT OK',
      requiredFlexuralArea:AsProvided+1e-9>=requiredAs?'OK':'NOT OK',
      maximumSpacing:barSpacing<=maxSpacing+1e-9?'OK':'NOT OK',
      shear:'NOT IMPLEMENTED',deflection:'NOT IMPLEMENTED',development:'NOT IMPLEMENTED',detailing:'NOT IMPLEMENTED'},
    references:{minimumFlexuralReinforcement:'ACI 318-25 §8.6.1.1 (confirm applicability and exceptions in licensed Code Requirements)',
      maximumSpacing:'ACI 318-25 §8.7.2.2 (solid nonprestressed two-way slabs; critical/other sections)'}
  };
}


function twoWaySlabStripDesign(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Two-way slab strip input object is required.');
  const b=input.b===undefined?1000:parseNumber(input.b,'b');
  const h=parseNumber(input.h,'h'),dx=parseNumber(input.dx,'dx'),dy=parseNumber(input.dy,'dy');
  const fc=parseNumber(input.fc,"f'c"),fy=parseNumber(input.fy,'fy');
  const MuX=parseNumber(input.MuX,'MuX'),MuY=parseNumber(input.MuY,'MuY');
  const barDiameterX=parseNumber(input.barDiameterX,'barDiameterX'),barSpacingX=parseNumber(input.barSpacingX,'barSpacingX');
  const barDiameterY=parseNumber(input.barDiameterY,'barDiameterY'),barSpacingY=parseNumber(input.barSpacingY,'barSpacingY');
  const location=input.location===undefined?'other':input.location;
  for(const [name,value] of [['b',b],['h',h],['dx',dx],['dy',dy],["f'c",fc],['fy',fy],['barDiameterX',barDiameterX],['barSpacingX',barSpacingX],['barDiameterY',barDiameterY],['barSpacingY',barSpacingY]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(!(dx<h&&dy<h)) throw new RangeError('Both effective depths must be less than overall thickness h.');
  if(MuX<0||MuY<0) throw new RangeError('MuX and MuY must be non-negative.');
  if(!['critical','other'].includes(location)) throw new RangeError("location must be 'critical' or 'other'.");
  const grossArea=b*h;
  // ACI 318-25 minimum flexural reinforcement; confirm clause applicability/exceptions in licensed Code Requirements.
  const AsMin=0.0018*grossArea;
  const makeDirection=(axis,d,Mu,diameter,spacing)=>{
    const AsProvided=(Math.PI*diameter*diameter/4)*(b/spacing);
    const flexure=section({b,h,d,fc,fy,Mu,As:AsProvided,Es:input.Es});
    const maxSpacing=Math.min(location==='critical'?2*h:3*h,450);
    const checks={
      minimumFlexuralReinforcement:AsProvided+1e-9>=AsMin?'OK':'NOT OK',
      flexuralStrength:Mu===0?'NOT CHECKED (Mu = 0)':flexure.checks.flexuralStrength,
      tensionControlledStrain:AsProvided===0?'NOT CHECKED':flexure.checks.slabStrainLimit,
      maximumSpacing:spacing<=maxSpacing+1e-9?'OK':'NOT OK'
    };
    return {axis,d,Mu,barDiameter:diameter,barSpacing:spacing,AsProvided,AsMin,maxSpacing,flexure,checks};
  };
  const x=makeDirection('X',dx,MuX,barDiameterX,barSpacingX);
  const y=makeDirection('Y',dy,MuY,barDiameterY,barSpacingY);
  const checks={directionX:x.checks,directionY:y.checks};
  const requiredChecks=[...Object.values(x.checks),...Object.values(y.checks)];
  const status=requiredChecks.every(v=>v==='OK')?'LIMITED_CHECKS_PASSED_NOT_FULL_DESIGN':'REVIEW_REQUIRED';
  return {
    code:'ACI 318-25',version:VERSION,
    scopeStatus:'TWO-WAY STRIP FLEXURE SCREEN ONLY — NOT A COMPLETE TWO-WAY SLAB DESIGN',
    units:'MPa, mm, kN·m per entered strip',input:{b,h,dx,dy,fc,fy,MuX,MuY,barDiameterX,barSpacingX,barDiameterY,barSpacingY,location},
    grossArea,AsMin,directions:{x,y},checks,status,
    notImplemented:['two-way moment distribution and coefficient selection','punching shear','one-way shear integration for both directions','immediate and long-term deflection','load combinations','support/column-strip design','torsion and corner restraint','openings and concentrated loads','development, laps, and full detailing','lightweight concrete and special material cases'],
    references:{minimumFlexuralReinforcement:'ACI 318-25 §8.6.1.1 (verify all exceptions/applicability in licensed Code Requirements)',maximumSpacing:'ACI 318-25 §8.7.2.2',flexuralStrength:'ACI 318-25 Chapter 22'},
    limitations:['MuX and MuY must be obtained from a separate verified slab analysis; this function does not calculate panel moments.','Each direction is checked as an independent singly reinforced rectangular strip; torsion, biaxial interaction, and complete two-way slab behavior are not represented.','A limited pass is not a complete code-compliance statement or approval for construction.']
  };
}


function twoWayMomentFromCoefficients(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Two-way moment coefficient input object is required.');
  const wu=parseNumber(input.wu,'wu'),lx=parseNumber(input.lx,'lx'),ly=parseNumber(input.ly,'ly'),alphaX=parseNumber(input.alphaX,'alphaX'),alphaY=parseNumber(input.alphaY,'alphaY');
  for(const [name,value] of [['wu',wu],['lx',lx],['ly',ly]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(wu<0) throw new RangeError('Factored area load wu must be non-negative.');
  if(alphaX<0||alphaY<0) throw new RangeError('Moment coefficients must be non-negative.');
  if(ly<lx) throw new RangeError('Enter lx as the shorter span and ly as the longer span.');
  const aspectRatio=ly/lx;
  if(aspectRatio>2+1e-9) throw new RangeError('This coefficient workflow is limited to panels with ly/lx ≤ 2.0.');
  // Generic coefficient relation only: M = alpha * wu * lx^2. The user must
  // obtain each alpha from a verified method/table for the actual support case,
  // panel location, load pattern, and design-code edition. No coefficients are guessed.
  const Mx=alphaX*wu*lx*lx;
  const My=alphaY*wu*lx*lx;
  return {code:'ACI 318-25 development utility',scopeStatus:'COEFFICIENT-DRIVEN MOMENT ESTIMATE — NOT CODE TABLE LOOKUP OR PANEL ANALYSIS',units:'wu in kN/m²; spans in m; moments in kN·m/m',wu,lx,ly,aspectRatio,alphaX,alphaY,Mx,My,formula:'M = α·wu·lx²',limitations:['The user must supply coefficients from a verified source applicable to the actual support conditions and panel classification.','This function does not select coefficients, identify positive/negative regions, analyze continuity, torsion, corners, openings, or concentrated loads.','Do not use coefficients from a different code edition or support case.','Not a complete ACI 318-25 design or approval for construction.']};
}


function immediateDeflectionGrossSection(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Deflection input object is required.');
  const b=input.b===undefined?1000:parseNumber(input.b,'b');
  const h=parseNumber(input.h,'h'),span=parseNumber(input.span,'span'),wu=parseNumber(input.wu,'wu'),fc=parseNumber(input.fc,"f'c");
  for(const [name,value] of [['b',b],['h',h],['span',span],["f'c",fc]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(wu<0) throw new RangeError('Service uniform load wu must be non-negative.');
  if(input.support!=='simply-supported') throw new RangeError('Gross-section immediate deflection utility currently supports only a simply supported strip under full-span uniform service load.');
  // ACI-style normalweight-concrete elastic modulus estimate; gross uncracked inertia.
  // kN/m is numerically equal to N/mm. This is a preliminary elastic estimate, not code deflection design.
  const Ec=4700*Math.sqrt(fc); // MPa = N/mm²
  const Ig=b*Math.pow(h,3)/12;
  const delta=5*wu*Math.pow(span,4)/(384*Ec*Ig);
  const ratio=span/delta;
  return {code:'ACI 318-25 development utility',scopeStatus:'PRELIMINARY GROSS-SECTION ELASTIC DEFLECTION — NOT A CODE SERVICEABILITY CHECK',units:'b,h,span in mm; wu in kN/m; Ec in MPa; deflection in mm',b,h,span,wu,fc,Ec,Ig,deltaImmediateGross:delta,spanToDeflectionRatio:ratio,support:input.support,assumptions:['Simply supported strip with full-span uniform service load.','Normalweight concrete elastic modulus estimate Ec = 4700√f′c in MPa.','Gross uncracked section inertia Ig is used.','No cracking, reinforcement stiffness, creep, shrinkage, load-duration, finishes/partition limits, or load combinations are included.','Result must not be treated as the ACI immediate or long-term deflection compliance check.']};
}

function punchingShearDemandGeometry(input){
  if(!input||typeof input!=='object'||Array.isArray(input)) throw new TypeError('Punching shear demand input object is required.');
  const lx=parseNumber(input.lx,'lx'),ly=parseNumber(input.ly,'ly'),c1=parseNumber(input.c1,'c1'),c2=parseNumber(input.c2,'c2'),d=parseNumber(input.d,'d'),wu=parseNumber(input.wu,'wu');
  for(const [name,value] of [['lx',lx],['ly',ly],['c1',c1],['c2',c2],['d',d]]) if(!finitePositive(value)) throw new RangeError(name+' must be positive and finite.');
  if(wu<0) throw new RangeError('Factored area load wu must be non-negative.');
  if(input.columnPosition!=='interior') throw new RangeError('This preliminary geometry helper supports interior rectangular columns only; edge/corner columns require a different critical perimeter.');
  const panelArea=lx*ly; // m²
  const criticalArea=(c1+d)*(c2+d)/1e6; // m²; perimeter at d/2 from rectangular column faces
  if(criticalArea>=panelArea) throw new RangeError('Critical perimeter footprint must be smaller than the panel tributary area.');
  const b0=2*(c1+c2+2*d); // mm
  const Vu=wu*(panelArea-criticalArea);
  return {code:'ACI 318-25 development utility',scopeStatus:'PUNCHING-SHEAR DEMAND AND GEOMETRY ONLY — NO CAPACITY CHECK',units:'lx,ly in m; c1,c2,d,b0 in mm; wu in kN/m²; Vu in kN',lx,ly,c1,c2,d,wu,panelArea,criticalArea,b0,Vu,columnPosition:'interior',criticalPerimeterOffset:'d/2 from column faces',assumptions:['Rectangular interior column centered in the entered rectangular tributary panel.','Uniform factored area load over the panel.','Load inside the critical perimeter footprint is subtracted from the panel load.','No openings, unbalanced moment transfer, eccentricity, drop panels, column capitals, edge/corner conditions, or nonuniform loads.','No concrete punching capacity is calculated; this is not a punching-shear pass/fail check.']};
}

const API={VERSION,beta1,section,oneWaySlabMinimumThickness,oneWaySlabShear,oneWayShearDemandUniformLoad,oneWaySlabStripDesign,twoWaySlabReinforcement,twoWaySlabStripDesign,twoWayMomentFromCoefficients,immediateDeflectionGrossSection,punchingShearDemandGeometry};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.ACI31825=API;
})(typeof globalThis!=='undefined'?globalThis:this);
