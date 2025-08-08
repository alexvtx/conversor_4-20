(function(){
  const $ = (id)=>document.getElementById(id);
  const num = (v)=>{
    const n = parseFloat(String(v));
    return Number.isFinite(n) ? n : NaN;
  };
  const clamp=(n,a,b)=>Math.min(Math.max(n,Math.min(a,b)),Math.max(a,b));

  // Elements
  const label=$('label'), euMin=$('euMin'), euMax=$('euMax'), mALo=$('mALo'), mAHi=$('mAHi');
  const btnEU=$('btnEU'), btnMA=$('btnMA'), btnCopy=$('btnCopy'), copyStatus=$('copyStatus');
  const modeEU=$('modeEU'), modeMA=$('modeMA'), lblUnit=$('lblUnit');

  const engVal=$('engVal'), warnEU=$('warnEU'), pctEU=$('pctEU'), mAfromEU=$('mAfromEU'), mAfromEUclamp=$('mAfromEUclamp');
  const mAVal=$('mAVal'), warnMA=$('warnMA'), pctMA=$('pctMA'), EUfromMA=$('EUfromMA'), EUfromMAclamp=$('EUfromMAclamp');

  function updateUnit(){
    lblUnit.textContent = label.value || '%';
  }

  function calcEUtoMA(){
    const euMinN=num(euMin.value), euMaxN=num(euMax.value), mALoN=num(mALo.value), mAHiN=num(mAHi.value), eng=num(engVal.value);
    if([euMinN,euMaxN,mALoN,mAHiN,eng].some(v=>!Number.isFinite(v))){ return; }
    const euSpan=euMaxN-euMinN, mASpan=mAHiN-mALoN;
    const pct = euSpan===0 ? NaN : (eng-euMinN)/euSpan*100;
    const mA = euSpan===0 ? NaN : mALoN + ((eng-euMinN)/euSpan)*mASpan;

    pctEU.textContent = Number.isFinite(pct)? pct.toFixed(2)+'%':'—';
    mAfromEU.textContent = Number.isFinite(mA)? mA.toFixed(3)+' mA':'—';
    mAfromEUclamp.textContent = Number.isFinite(mA)? ('Limitado: '+clamp(mA,mALoN,mAHiN).toFixed(3)+' mA'):'—';

    const out = (eng<euMinN || eng>euMaxN);
    warnEU.style.display = out ? 'block':'none';
    warnEU.textContent = out ? `Fora do range configurado (${euMinN}–${euMaxN} ${label.value||'UE'}).` : '';
  }

  function calcMAtoEU(){
    const euMinN=num(euMin.value), euMaxN=num(euMax.value), mALoN=num(mALo.value), mAHiN=num(mAHi.value), mA=num(mAVal.value);
    if([euMinN,euMaxN,mALoN,mAHiN,mA].some(v=>!Number.isFinite(v))){ return; }
    const euSpan=euMaxN-euMinN, mASpan=mAHiN-mALoN;
    const pct = mASpan===0 ? NaN : (mA-mALoN)/mASpan*100;
    const eu = mASpan===0 ? NaN : euMinN + ((mA-mALoN)/mASpan)*euSpan;

    pctMA.textContent = Number.isFinite(pct)? pct.toFixed(2)+'%':'—';
    EUfromMA.textContent = Number.isFinite(eu)? eu.toFixed(3)+' '+(label.value||'UE'):'—';
    EUfromMAclamp.textContent = Number.isFinite(eu)? ('Limitado: '+clamp(eu,euMinN,euMaxN).toFixed(3)+' '+(label.value||'UE')):'—';

    const out = (mA<mALoN || mA>mAHiN);
    warnMA.style.display = out ? 'block':'none';
    warnMA.textContent = out ? `Fora do range configurado (${mALoN}–${mAHiN} mA).` : '';
  }

  function recalc(){
    updateUnit();
    calcEUtoMA();
    calcMAtoEU();
  }

  // Mode switch
  btnEU.addEventListener('click',()=>{
    btnEU.classList.add('active'); btnMA.classList.remove('active');
    modeEU.style.display='block'; modeMA.style.display='none';
  });
  btnMA.addEventListener('click',()=>{
    btnMA.classList.add('active'); btnEU.classList.remove('active');
    modeMA.style.display='block'; modeEU.style.display='none';
  });

  // Copy
  btnCopy.addEventListener('click', async () => {
    const text = (modeEU.style.display!=='none')
      ? `EU=${engVal.value} ${label.value||'UE'} → ${mAfromEU.textContent}`
      : `mA=${mAVal.value} mA → ${EUfromMA.textContent}`;
    try{
      await navigator.clipboard.writeText(text);
      copyStatus.textContent='Copiado!';
      setTimeout(()=>copyStatus.textContent='',1500);
    }catch(e){
      copyStatus.textContent='Não foi possível copiar';
      setTimeout(()=>copyStatus.textContent='',2000);
    }
  });

  // Inputs
  [label,euMin,euMax,mALo,mAHi,engVal,mAVal].forEach(el=>el.addEventListener('input',recalc));

  recalc();
})();