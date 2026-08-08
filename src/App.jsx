import { useLayoutEffect, useRef } from "react";

/*
 * Native App.jsx conversion of taiwan.html for Vite/React + GitHub Pages.
 *
 * Conversion policy:
 * - Every body HTML/SVG element is represented as JSX.
 * - Only JSX/React-required attribute syntax is changed.
 * - The stylesheet is preserved verbatim and mounted into document.head by the component.
 * - The original JavaScript algorithm/data is preserved verbatim inside the React
 *   layout-effect lifecycle so it initializes only after the JSX DOM exists.
 * - No iframe and no whole-page raw HTML injection are used.
 */

const TAIWAN_ATLAS_CSS = `
/* ===========================================================================
   Taiwan Reference Atlas

   Palette from the brand guidelines. Parchment #FCFAF2 is the ground.
   Slate teal carries text and figures, deep plum carries headings, sumire
   violet is the interactive accent. Map layers borrow from the extended
   Nippon palette: 縹 for water, 鳶色 for relief, 常盤 for protected land.

   Two things govern the layout. First, nothing is fixed in pixels: type and
   spacing are fluid across 360px to 2560px. Second, map lettering is sized in
   screen pixels rather than map units, so it stays legible at every zoom.

   Tokens, grounds, controls and map ink follow the United States sheet
   exactly; only what the island itself requires is added at the end.
   =========================================================================== */
:root{
  --parchment:#FCFAF2; --slate:#2E5C6E; --plum:#622954; --red:#C00000;
  --ruri:#005CAF; --sumire:#66327C; --charcoal:#2D3748;
  --rikyu:#707C74; --ama:#C4A882; --tobi:#724938; --hanada:#2B618F;
  --seiji:#6A8F8D; --tokiwa:#007B43; --haizakura:#E8D3C7; --budou:#522F60;

  --serif:"Source Serif 4","Noto Serif TC","Noto Serif JP",Georgia,"Times New Roman",serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;

  --fs:clamp(13px,0.20vw + 12.3px,15px);
  --sp:clamp(0.75rem,1.1vw,1.5rem);
  --r:10px; --r-sm:7px; --r-pill:999px;
  --shadow:0 1px 2px rgba(46,92,110,.05),0 8px 24px -12px rgba(46,92,110,.16);
  --shadow-lg:0 2px 6px rgba(46,92,110,.07),0 22px 48px -20px rgba(46,92,110,.28);
}
:root[data-ground="paper"]{
  --bg:#FCFAF2; --surf:#FFFDF7; --surf2:#F4F0E5; --surf3:#EAE4D6;
  --ink:#2E5C6E; --ink2:#5F7379; --ink3:#8D9894; --head:#622954;
  --line:rgba(112,124,116,.20); --line2:rgba(112,124,116,.38); --accent:#66327C;
  --bd:#5E8593; --coast:#2E5C6E;
  --sea:#C7DBE0; --sea2:#A9C6CE; --land:#FDFCF5; --selfill:#EEDCE8;
}
:root[data-ground="dusk"]{
  --bg:#EFEADC; --surf:#F7F2E5; --surf2:#E6E0D0; --surf3:#DAD3C1;
  --ink:#28505E; --ink2:#586B71; --ink3:#7C867F; --head:#5A2549;
  --line:rgba(88,99,92,.24); --line2:rgba(88,99,92,.44); --accent:#5A2549;
  --bd:#587F8C; --coast:#28525F;
  --sea:#BCCFD2; --sea2:#9FB8BD; --land:#F9F5EA; --selfill:#E4D0DE;
}
:root[data-ground="night"]{
  --bg:#1D242E; --surf:#252E3A; --surf2:#2E3844; --surf3:#3A4552;
  --ink:#DBE5E7; --ink2:#9FB0B5; --ink3:#7A868B; --head:#CE9CC0;
  --line:rgba(219,229,231,.14); --line2:rgba(219,229,231,.26); --accent:#CE9CC0;
  --bd:#84999F; --coast:#B6CBD3;
  --sea:#101720; --sea2:#1F3140; --land:#404C5A; --selfill:#553055;
  --shadow:0 1px 2px rgba(0,0,0,.3),0 8px 24px -12px rgba(0,0,0,.5);
  --shadow-lg:0 2px 6px rgba(0,0,0,.35),0 22px 48px -20px rgba(0,0,0,.6);
}
:root[data-density="tight"]{--fs:clamp(12.2px,0.16vw + 11.7px,14px);--sp:clamp(.6rem,.8vw,1.05rem)}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--serif);
  font-size:var(--fs);line-height:1.55;font-weight:400;
  -webkit-font-smoothing:antialiased;
  transition:background-color .25s ease,color .25s ease;
  padding:clamp(.7rem,1.6vw,1.9rem) clamp(.7rem,2.2vw,2.4rem) clamp(2rem,4vw,4rem)}
.app{max-width:1720px;margin:0 auto}
h1,h2,h3{margin:0;font-weight:500;line-height:1.2;color:var(--head);letter-spacing:-.008em}
p{margin:0}
button,input,select{font:inherit;color:inherit;font-family:var(--serif)}
button{background:none;border:0;cursor:pointer;padding:0}
:focus-visible{outline:2px solid var(--sumire);outline-offset:2px;border-radius:4px}
.mono{font-family:var(--mono);font-variant-numeric:tabular-nums;font-weight:400;letter-spacing:-.02em}
.tag{font-size:.66em;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3);
  font-weight:500;font-family:var(--serif)}
html[lang^="zh"] .tag,html[lang^="ja"] .tag{letter-spacing:.05em;text-transform:none;font-size:.72em}

/* ---------------- line breaking in Chinese and Japanese ----------------
   Neither language uses spaces, so a browser is free to break a line between
   any two characters. That splits proper nouns down the middle: 西班牙 comes
   out as 西班 / 牙, 中華民國 as 中華 / 民國. keep-all suppresses the implicit
   break between ideographs, leaving punctuation as the break opportunity,
   which is where a reader expects a line to end. overflow-wrap is the safety
   valve for any run genuinely too long for its line, and line-break:strict
   applies the kinsoku rules that keep closing punctuation off a line's head.

   The measure is set separately for these languages. A ch is the width of the
   digit zero, about half a Chinese character, so a measure written in ch comes
   out half as long as intended and the text stops well short of the column.
   One em is one character, so the measures below are stated in em. */
html[lang^="zh"],html[lang^="ja"]{
  word-break:keep-all;overflow-wrap:break-word;line-break:strict}
html[lang^="zh"] .nathist .prose,html[lang^="ja"] .nathist .prose{max-width:42em}
html[lang^="zh"] .natcol .prose,html[lang^="ja"] .natcol .prose{max-width:30em}
html[lang^="zh"] .eranote,html[lang^="ja"] .eranote{max-width:42em}
html[lang^="zh"] .eracaveat,html[lang^="ja"] .eracaveat{max-width:42em}
html[lang^="zh"] details.notes p,html[lang^="ja"] details.notes p{max-width:42em}
html[lang^="zh"] .hint p,html[lang^="ja"] .hint p{max-width:38em}
/* Two containers are narrower than their longest unbreakable run once breaks
   between ideographs are suppressed. Widening them for these languages keeps
   the safety valve from having to fire, which is what would reintroduce an
   arbitrary break mid-phrase. */
html[lang^="zh"] .rd-b,html[lang^="ja"] .rd-b{columns:clamp(21rem,23vw,23rem)}
html[lang^="zh"] .succ,html[lang^="ja"] .succ{
  grid-template-columns:repeat(auto-fill,minmax(min(24rem,100%),1fr))}
html[lang^="zh"] section>header p,html[lang^="ja"] section>header p{max-width:42em}
/* Balance the last line where the browser supports it, so a paragraph does not
   end on a single stranded character. */
.prose,.eranote,.eracaveat,.hint p,details.notes p{text-wrap:pretty}
::selection{background:color-mix(in srgb,var(--sumire) 26%,transparent);color:inherit}
::-moz-selection{background:color-mix(in srgb,var(--sumire) 26%,transparent);color:inherit}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* ---------------- header ---------------- */
.hd{display:flex;align-items:center;gap:clamp(.5rem,1.4vw,1.2rem);
  padding-bottom:clamp(.5rem,.9vw,.85rem);flex-wrap:nowrap}
.hd h1{font-size:clamp(1.02rem,1.5vw + .48rem,1.85rem);font-weight:600;
  min-width:0;overflow-wrap:anywhere;text-wrap:balance}
@media(max-width:560px){
  .pill > span:not(.dot){display:none}
  .pill{padding:.42rem}
  .hd{align-items:center}
}
.hd-r{margin-left:auto;display:flex;align-items:center;gap:.45rem;flex:0 0 auto}
.pill{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .7rem;
  border:1px solid var(--line2);border-radius:var(--r-pill);background:var(--surf);
  font-size:.78em;color:var(--ink2);white-space:nowrap;box-shadow:var(--shadow)}
.pill.act{border-color:var(--tokiwa);color:var(--tokiwa)}
.pill.warn{border-color:var(--red);color:var(--red)}
.dot{width:.42rem;height:.42rem;border-radius:50%;background:currentColor;flex:0 0 auto}
.iconbtn{width:2.15rem;height:2.15rem;border:1px solid var(--line2);border-radius:var(--r-pill);
  background:var(--surf);display:grid;place-items:center;color:var(--ink2);
  box-shadow:var(--shadow);transition:color .15s,border-color .15s}
.iconbtn:hover{color:var(--head);border-color:var(--line2)}
.iconbtn svg{width:1.05rem;height:1.05rem;fill:none;stroke:currentColor;stroke-width:1.5;
  stroke-linecap:round;stroke-linejoin:round}

/* settings popover */
.pop{position:absolute;top:calc(100% + .5rem);right:0;z-index:60;width:min(20rem,calc(100vw - 2rem));
  background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.9rem;display:none}
.pop.open{display:block}
.pop .grp{padding:.5rem 0}
.pop .grp + .grp{border-top:1px solid var(--line)}
.pop .tag{display:block;margin-bottom:.45rem}
.seg{display:flex;gap:.25rem;background:var(--surf2);padding:.22rem;border-radius:var(--r-pill)}
.seg button{flex:1;padding:.34rem .3rem;border-radius:var(--r-pill);font-size:.84em;
  color:var(--ink2);white-space:nowrap;transition:background .15s,color .15s}
.seg button[aria-pressed="true"]{background:var(--surf);color:var(--head);font-weight:500;
  box-shadow:0 1px 3px rgba(46,92,110,.14)}
.groundwhy{margin:.45rem 0 0;font-size:.74em;line-height:1.5;color:var(--ink3)}
.groundwhy b{color:var(--ink2);font-weight:500}
.rowsw{display:flex;align-items:center;justify-content:space-between;gap:.6rem;padding:.32rem 0;
  font-size:.9em;color:var(--ink2);width:100%;text-align:left}
.knob{width:2.1rem;height:1.15rem;border-radius:var(--r-pill);background:var(--surf3);
  position:relative;flex:0 0 auto;transition:background .18s}
.knob::after{content:"";position:absolute;inset:.16rem auto .16rem .17rem;width:.83rem;
  border-radius:50%;background:var(--surf);transition:transform .18s;
  box-shadow:0 1px 2px rgba(0,0,0,.2)}
[aria-pressed="true"] > .knob{background:var(--sumire)}
[aria-pressed="true"] > .knob::after{transform:translateX(.95rem)}

/* ---------------- metadata strip ---------------- */
.strip{display:flex;gap:clamp(.9rem,2.4vw,2.6rem);align-items:baseline;
  border-top:1px solid var(--line);border-bottom:1px solid var(--line);
  padding:.5rem 0;margin-bottom:var(--sp);overflow-x:auto;scrollbar-width:none}
.strip::-webkit-scrollbar{display:none}
@media(max-width:760px){
  .strip{mask-image:linear-gradient(90deg,#000 88%,transparent);
    -webkit-mask-image:linear-gradient(90deg,#000 88%,transparent)}
  .rh .c{display:none}
}
.strip > div{flex:0 0 auto;min-width:0}
.strip .tag{display:block;margin-bottom:.05rem}
.strip .v{font-family:var(--mono);font-size:.82em;white-space:nowrap;color:var(--ink)}
.strip .v b{color:var(--ruri);font-weight:500}

/* ---------------- main grid ---------------- */
.main{display:block}

/* ---------------- map stage ---------------- */
.stage{position:relative;background:var(--sea);border:1px solid var(--line);
  border-radius:var(--r);overflow:hidden;box-shadow:var(--shadow);
  aspect-ratio:820/980;max-width:min(100%,calc(86vh * 0.8367));margin-inline:auto}
@media(max-width:1179px){.stage{aspect-ratio:820/980}}
@media(max-width:700px){.stage{aspect-ratio:1/1.16;max-width:100%}}
#map{position:absolute;inset:0;width:100%;height:100%;display:block;
  touch-action:none;cursor:grab;-webkit-tap-highlight-color:transparent}
#map.dragging{cursor:grabbing}
/* An outline on an SVG element is drawn around its bounding box, so a focus
   ring on a division becomes a large rectangle in the system accent colour
   sitting over the map. Outlines are therefore suppressed throughout the sheet
   and focus is shown with a stroke, which follows the actual shape. Selection
   is suppressed as well: dragging across the map otherwise sweeps a selection
   through the labels and paints a filled block across each one. */
#map,#map *{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;
  user-select:none;-webkit-tap-highlight-color:transparent;
  -webkit-touch-callout:none}
#map:focus,#map *:focus{outline:none}
#map:focus-visible{outline:2px solid var(--sumire);outline-offset:-3px}
/* map overlay chrome, restored verbatim from the reference sheet */
.ov{position:absolute;z-index:5;display:flex;gap:.4rem}
.ov-tl{top:.6rem;left:.6rem;right:.6rem;flex-wrap:wrap}
.ov-tr{top:.6rem;right:.6rem;flex-direction:column}
.ov-bl{bottom:.6rem;left:.6rem;align-items:flex-end;flex-wrap:wrap;max-width:calc(100% - 1.2rem)}
.glass{background:color-mix(in srgb,var(--surf) 93%,transparent);
  border:1px solid var(--line2);border-radius:var(--r-pill);box-shadow:var(--shadow);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.search{display:flex;align-items:center;gap:.4rem;padding:.05rem .3rem .05rem .7rem;
  max-width:min(17rem,60vw)}
.search input{border:0;background:none;padding:.42rem 0;width:100%;min-width:0;font-size:.88em}
.search input:focus{outline:none}
.search svg{width:.92rem;height:.92rem;fill:none;stroke:var(--ink3);stroke-width:1.6;flex:0 0 auto}
.search button{width:1.5rem;height:1.5rem;border-radius:50%;color:var(--ink3);flex:0 0 auto;
  display:grid;place-items:center;font-size:1rem;line-height:1}
.res{position:absolute;top:calc(100% + .35rem);left:0;width:min(20rem,80vw);max-height:15rem;
  overflow:auto;background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.3rem;display:none;z-index:20}
.res.open{display:block}
.res button{display:block;width:100%;text-align:left;padding:.34rem .5rem;border-radius:var(--r-sm);
  font-size:.86em;line-height:1.3}
.res button:hover,.res button.on{background:var(--surf2)}
.res .k{display:block;font-family:var(--mono);font-size:.62rem;color:var(--ink3);
  letter-spacing:.04em}
.zoomstack{flex-direction:column;overflow:hidden;border-radius:var(--r);padding:0}
.zoomstack button{width:2rem;height:2rem;display:grid;place-items:center;color:var(--ink2)}
.zoomstack button + button{border-top:1px solid var(--line)}
.zoomstack button:hover{background:var(--surf2);color:var(--head)}
.zoomstack svg{width:.9rem;height:.9rem;fill:none;stroke:currentColor;stroke-width:1.7;
  stroke-linecap:round}
.zlevel{font-family:var(--mono);font-size:.58rem;color:var(--ink3);text-align:center;
  padding:.2rem 0;border-top:1px solid var(--line)}
.chipbtn{padding:.36rem .8rem;font-size:.8em;color:var(--ink2);display:inline-flex;
  align-items:center;gap:.35rem}
.chipbtn:hover{color:var(--head)}
.chipbtn svg{width:.85rem;height:.85rem;fill:none;stroke:currentColor;stroke-width:1.6}
.scalebox{padding:.3rem .6rem .25rem;display:flex;align-items:center;gap:.5rem}
.scalebox svg{display:block}

/* layer panel */
.lpanel{position:absolute;bottom:3rem;left:.6rem;z-index:25;width:min(16rem,calc(100% - 1.2rem));
  background:var(--surf);border:1px solid var(--line2);border-radius:var(--r);
  box-shadow:var(--shadow-lg);padding:.8rem;display:none;max-height:calc(100% - 4rem);
  overflow:auto}
.lpanel.open{display:block}
.lpanel .tag{display:block;margin:.1rem 0 .4rem}
.lpanel .grp + .grp{margin-top:.7rem;padding-top:.7rem;border-top:1px solid var(--line)}
.lsw{display:flex;align-items:center;gap:.5rem;width:100%;text-align:left;padding:.24rem 0;
  font-size:.86em;color:var(--ink3)}
.lsw::before{content:"";width:.95rem;height:.95rem;flex:0 0 auto;border-radius:4px;
  border:1.5px solid var(--line2);transition:background .15s,border-color .15s}
.lsw[aria-pressed="true"]{color:var(--ink)}
.lsw[aria-pressed="true"]::before{background:var(--sumire);border-color:var(--sumire);
  box-shadow:inset 0 0 0 2.5px var(--surf)}
.lsw i{margin-left:auto;width:1rem;height:0;border-top:2px solid currentColor;
  border-radius:2px;flex:0 0 auto}
select.sel{width:100%;padding:.4rem .55rem;border:1px solid var(--line2);border-radius:var(--r-sm);
  background:var(--surf2);font-size:.86em;appearance:none;
  background-image:linear-gradient(45deg,transparent 50%,var(--ink3) 50%),
                   linear-gradient(135deg,var(--ink3) 50%,transparent 50%);
  background-position:calc(100% - 15px) center,calc(100% - 10px) center;
  background-size:5px 5px,5px 5px;background-repeat:no-repeat}
.keybar{display:flex;height:.42rem;border-radius:3px;overflow:hidden;margin-top:.45rem}
.keycap{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-top:.25rem;gap:.4rem}

/* tooltip */
.tip{position:absolute;z-index:40;pointer-events:none;background:var(--charcoal);
  color:#F2EFE6;padding:.28rem .55rem;border-radius:var(--r-sm);font-size:.78em;
  white-space:nowrap;opacity:0;transition:opacity .12s;
  transform:translate(-50%,calc(-100% - .55rem));box-shadow:var(--shadow-lg)}
.tip b{font-weight:500;color:#EFD9E8}
.tip span{display:block;font-family:var(--mono);font-size:.62rem;color:#A6BCB6;margin-top:.05rem}

/* ---------------- map ink ---------------- */

.coast{fill:none;stroke:var(--coast);stroke-width:calc(var(--u)*1.5px);
  stroke-linejoin:round;stroke-linecap:round;pointer-events:none}
.st{fill:var(--land);stroke:var(--bd);stroke-width:calc(var(--u)*0.85px);
  stroke-linejoin:round;cursor:pointer;transition:fill .12s}
.st:hover{fill:var(--haizakura)}
.st.sel{fill:var(--selfill);stroke:var(--sumire);stroke-width:calc(var(--u)*1.9px)}
.st:focus-visible{stroke:var(--sumire);stroke-width:calc(var(--u)*2.6px);
  stroke-dasharray:calc(var(--u)*5px) calc(var(--u)*3px)}
.cnty{fill:none;stroke:var(--bd);stroke-width:calc(var(--u)*.6px);opacity:.6;pointer-events:none}
.lake{fill:var(--sea2);stroke:var(--hanada);stroke-width:calc(var(--u)*.7px);opacity:1}
.riv{fill:none;stroke:var(--hanada);stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.rng{fill:none;stroke:var(--tobi);stroke-width:calc(var(--u)*2.6px);stroke-linecap:round;opacity:.30}
.grat{fill:none;stroke:var(--rikyu);stroke-width:calc(var(--u)*.4px);opacity:.28}
.ibox{fill:none;stroke:var(--rikyu);stroke-width:calc(var(--u)*.7px);opacity:.4;
  stroke-dasharray:calc(var(--u)*4px) calc(var(--u)*3px)}
text{pointer-events:none;paint-order:stroke}
/* Markers are counter-scaled so a dot stays a dot at every zoom level. */
.mk{transform:scale(var(--u));transform-origin:0 0;transform-box:view-box}
/* Inside .mk the group already carries the counter-scale, so type is plain px. */
.mk text{stroke-width:2.3px}
.mk .ctl{font-size:9.8px}
.mk .pkl{font-size:9.4px}
.tl{font-family:var(--serif);font-weight:600;font-size:calc(var(--u)*11.5px);fill:var(--ink);
  text-anchor:middle;stroke:var(--land);stroke-width:calc(var(--u)*2.6px);stroke-linejoin:round}
.tw{font-family:var(--serif);font-style:italic;font-size:calc(var(--u)*9.4px);fill:var(--hanada);
  stroke:var(--sea);stroke-width:calc(var(--u)*2.2px)}
.twl{stroke:var(--land)}
.tg{font-family:var(--serif);font-size:calc(var(--u)*8.4px);font-weight:500;fill:var(--tobi);
  letter-spacing:calc(var(--u)*1.5px);stroke:var(--land);stroke-width:calc(var(--u)*2.2px);
  opacity:.85}
.tp{font-family:var(--serif);font-size:calc(var(--u)*9px);fill:var(--tobi);opacity:.5;
  letter-spacing:calc(var(--u)*2.2px);text-anchor:middle;stroke:var(--land);
  stroke-width:calc(var(--u)*2.4px)}
.pk{fill:var(--tokiwa);stroke:var(--land);stroke-width:calc(var(--u)*.7px)}
.pkl{font-family:var(--serif);font-size:calc(var(--u)*9px);fill:var(--tokiwa);
  stroke:var(--land);stroke-width:calc(var(--u)*2.2px)}
.ct{fill:var(--ink)}
.ctc{fill:var(--land);stroke:var(--ink);stroke-width:calc(var(--u)*1.1px)}
.mk .ctc{stroke-width:1.1px}
.ctl{font-family:var(--serif);font-size:calc(var(--u)*9.4px);fill:var(--ink);
  stroke:var(--land);stroke-width:calc(var(--u)*2.2px)}
.ctl.cap{font-weight:600}
.il{font-family:var(--serif);font-size:calc(var(--u)*9.6px);font-weight:500;fill:var(--ink3);
  letter-spacing:calc(var(--u)*1.6px);text-anchor:middle}
[data-off="1"]{display:none}
text[data-hid="1"]{visibility:hidden}

/* ---------------- record ---------------- */
.rec{background:var(--surf);border:1px solid var(--line);border-radius:var(--r);
  box-shadow:var(--shadow);overflow:hidden;margin-top:var(--sp);scroll-margin-top:.6rem}
.rd-h{padding:.85rem 1.1rem .7rem;border-bottom:1px solid var(--line);display:flex;
  gap:.7rem;align-items:flex-start}
.rd-h h2{font-size:clamp(1.25rem,1.3vw + .85rem,1.85rem);font-weight:600}
.rd-h .nick{font-style:italic;color:var(--ink2);font-size:.88em;margin-top:.1rem}
.rd-x{width:1.8rem;height:1.8rem;border-radius:50%;border:1px solid var(--line2);
  display:grid;place-items:center;color:var(--ink3);flex:0 0 auto;font-size:1.05rem;
  line-height:1;margin-left:auto}
.rd-x:hover{color:var(--head);border-color:var(--head)}
.rd-b{padding:.2rem 1.1rem 1.1rem;columns:clamp(17rem,21vw,21rem);column-gap:clamp(1.4rem,3vw,3rem)}
.blk{padding:.7rem 0;border-bottom:1px solid var(--line);break-inside:avoid-column}
.blk:last-child{border-bottom:0}
.blk > .tag{display:block;margin-bottom:.4rem}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(6.1rem,1fr));gap:.6rem .8rem}
.figs .v{font-family:var(--mono);font-size:1em;letter-spacing:-.035em;line-height:1.2;
  white-space:nowrap}
.figs .r{font-family:var(--mono);font-size:.62rem;color:var(--accent)}
.kv{display:grid;grid-template-columns:minmax(4.6rem,auto) 1fr;gap:.28rem .7rem;margin:0;font-size:.88em}
.kv dt{color:var(--ink3);font-size:.72em;letter-spacing:.09em;text-transform:uppercase;padding-top:.25em}
html[lang^="zh"] .kv dt,html[lang^="ja"] .kv dt{text-transform:none;letter-spacing:.03em;font-size:.8em}
.kv dd{margin:0;overflow-wrap:anywhere}
.prose{font-size:.9em;line-height:1.62;color:var(--ink)}
.chips{display:flex;flex-wrap:wrap;gap:.28rem}
.chip{font-size:.78em;border:1px solid var(--line2);padding:.1rem .48rem;border-radius:var(--r-pill);
  background:var(--bg);color:var(--ink2);overflow-wrap:anywhere}
.chip.w{font-style:italic;color:var(--hanada);border-color:color-mix(in srgb,var(--hanada) 30%,transparent)}
.chip.r{color:var(--tobi);border-color:color-mix(in srgb,var(--tobi) 30%,transparent)}
.chip.p{color:var(--tokiwa);border-color:color-mix(in srgb,var(--tokiwa) 30%,transparent)}
.relief{display:grid;grid-template-columns:1fr 1fr;gap:.5rem .8rem;font-size:.88em}
.relief > div:last-child{text-align:right}
.relief .tag{display:block}
.track{height:.34rem;background:var(--surf3);border-radius:3px;position:relative;margin-top:.5rem;
  overflow:hidden}
.track > span{position:absolute;inset:0 auto 0 0;background:var(--tobi);opacity:.75;border-radius:3px}
.mini{display:flex;justify-content:space-between;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-top:.25rem;gap:.4rem}
.hint{padding:1rem 1.1rem 1.2rem}
.hint p{font-size:.88em;color:var(--ink2);line-height:1.6;margin-top:.4rem;max-width:70ch}
.natg{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:.8rem 1rem;margin-top:.9rem}
.natg .v{font-family:var(--mono);font-size:1.02em;letter-spacing:-.03em}

.natsec .refbody{padding:0}
.natfacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(9.5rem,100%),1fr));
  gap:.7rem clamp(1rem,2.4vw,2.4rem);margin:0;padding:.9rem 1.1rem;
  border-bottom:1px solid var(--line)}
.natfacts > div{min-width:0;display:flex;flex-direction:column;gap:.12rem}
.natfacts dt{margin:0}
.natfacts dd{margin:0;font-family:var(--mono);font-size:.84em;overflow-wrap:anywhere;
  margin-top:auto}
.natgrid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(22rem,100%),1fr));
  gap:0;border-bottom:1px solid var(--line)}
.natcol{padding:.9rem 1.1rem 1.1rem;border-right:1px solid var(--line);min-width:0}
.natcol:last-child{border-right:0}
@media(max-width:1000px){.natcol{border-right:0;border-bottom:1px solid var(--line)}
  .natcol:last-child{border-bottom:0}}
.natcol > .tag{display:block;margin-bottom:.6rem}
.natcol .prose{max-width:52ch}
.natcol .kv{max-width:23rem}
.nathist{padding:.9rem 1.1rem 1.1rem}
.nathist > .tag{display:block;margin-bottom:.5rem}
.nathist .prose{max-width:78ch;margin-bottom:.7rem}
.flagbox{border:1px solid var(--line2);border-radius:var(--r-sm);overflow:hidden;
  line-height:0;background:var(--bg);max-width:23rem}
#flag{display:block;width:100%;height:auto}
.anthemT{font-size:1.05em;font-weight:600;color:var(--head)}
.anthemSub{font-size:.78em;color:var(--ink3);font-family:var(--mono);margin:.15rem 0 .6rem}
.verse{font-size:.86em;line-height:1.72;font-style:italic;color:var(--ink);
  padding-left:.75rem;border-left:2px solid var(--line2);margin:0 0 .6rem}

.natfoot{padding:.7rem 1.1rem .9rem;border-top:1px solid var(--line);
  display:flex;gap:.6rem 1.4rem;align-items:baseline;flex-wrap:wrap}
.links{list-style:none;display:flex;gap:.4rem 1.4rem;margin:0;padding:0;flex-wrap:wrap;
  font-size:.84em}
.links a{font-family:var(--mono);color:var(--ruri);text-decoration:none}
.links a:hover{text-decoration:underline}
.links span{color:var(--ink3);margin-left:.35rem}

/* ---------------- reference ---------------- */
details.ref{margin-top:var(--sp);border:1px solid var(--line);border-radius:var(--r);
  background:var(--surf);overflow:hidden;box-shadow:var(--shadow)}
details.ref > summary{list-style:none;cursor:pointer;padding:.7rem 1.1rem;display:flex;
  align-items:baseline;gap:.5rem .9rem;flex-wrap:wrap;transition:background .15s}
details.ref > summary::-webkit-details-marker{display:none}
details.ref > summary:hover{background:var(--surf2)}
details.ref > summary:focus-visible{outline:2px solid var(--sumire);outline-offset:-2px}
details.ref > summary h2{font-size:clamp(1rem,.7vw + .8rem,1.28rem);font-weight:600}
details.ref > summary .c{font-family:var(--mono);font-size:.7rem;color:var(--ink3)}
details.ref > summary::after{content:"";margin-left:auto;width:.46rem;height:.46rem;
  border-right:1.6px solid var(--ink3);border-bottom:1.6px solid var(--ink3);
  transform:rotate(45deg) translate(-.12rem,-.12rem);transition:transform .2s;
  flex:0 0 auto;align-self:center}
details.ref[open] > summary::after{transform:rotate(-135deg)}
details.ref[open] > summary{border-bottom:1px solid var(--line)}
.refbody{padding:.9rem 1.1rem 1.1rem}
.refbody > .tw-wrap{border-radius:var(--r-sm)}
.notes .refbody{padding-top:.2rem}
.tw-wrap{overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);background:var(--surf)}
table{width:100%;border-collapse:collapse;font-size:.82em}
th{font-size:.7em;letter-spacing:.08em;text-transform:uppercase;color:var(--head);text-align:left;
  padding:.5rem .6rem;background:var(--surf2);border-bottom:1px solid var(--line2);
  white-space:nowrap;cursor:pointer;position:sticky;top:0;z-index:1;font-weight:500}
html[lang^="zh"] th,html[lang^="ja"] th{text-transform:none;letter-spacing:.02em;font-size:.78em}
th:hover{color:var(--accent)}
th.n,td.n{text-align:right}
th[aria-sort]::after{content:"";display:inline-block;margin-left:.3em;
  border:.26em solid transparent}
th[aria-sort="ascending"]::after{border-bottom-color:var(--accent);margin-bottom:.24em}
th[aria-sort="descending"]::after{border-top-color:var(--accent);margin-top:.24em}
td{padding:.38rem .6rem;border-bottom:1px solid var(--line);white-space:nowrap}
td.wrap{white-space:normal;min-width:14rem}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surf2)}
td.nm button{color:var(--ruri);font-weight:500;text-align:left}
td.nm button:hover{text-decoration:underline}
@media(max-width:960px){[data-opt="1"]{display:none}}
@media(max-width:620px){[data-opt="2"]{display:none}}
.facts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(15rem,100%),1fr));
  gap:0 clamp(1rem,2.4vw,2.4rem)}
.fact{padding:.42rem 0;border-bottom:1px solid var(--line)}
.fact .l{font-size:.7em;letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}
html[lang^="zh"] .fact .l,html[lang^="ja"] .fact .l{text-transform:none;letter-spacing:.02em;font-size:.78em}
.fact .v{font-size:.9em;overflow-wrap:anywhere}
.fact .v b{font-weight:600;color:var(--ruri)}
.fact .v .mono{font-size:.86em;color:var(--ink2)}

details.notes h3{font-size:.72em;letter-spacing:.11em;text-transform:uppercase;color:var(--head);
  margin:1rem 0 .3rem;font-weight:500}
html[lang^="zh"] footer h3,html[lang^="ja"] details.notes h3{text-transform:none;letter-spacing:.03em;font-size:.82em}
details.notes p{font-size:.86em;line-height:1.65;color:var(--ink2);max-width:80ch}
details.notes .warn{border-left:2px solid var(--red);padding-left:.85rem}
details.notes .src{font-family:var(--mono);font-size:.72rem;line-height:1.9;color:var(--ink3);
  overflow-wrap:anywhere}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* ---------------- additions for this sheet ---------------- */
/* Township boundaries are the equivalent of the county tier on the United
   States sheet; the island has no separate survey source for them, so the
   layer draws the interior division borders at a lighter weight instead. */
.twp{fill:none;stroke:var(--bd);stroke-width:calc(var(--u)*.55px);opacity:.5;
  pointer-events:none}

.histsplit{margin-top:1.1rem;padding-top:.9rem;border-top:1px solid var(--line)}
.histsplit > .tag{display:block;margin-bottom:.5rem}
.hintline{font-size:.74em;color:var(--ink3);margin:.42rem 0 0;line-height:1.45}

/* succession of authority: flag chips beside each regime */
.succ{list-style:none;margin:.6rem 0 0;padding:0;display:grid;
  grid-template-columns:repeat(auto-fill,minmax(min(17rem,100%),1fr));
  gap:.1rem clamp(1rem,2.4vw,2.4rem)}
.succ li{display:grid;grid-template-columns:2.5rem 1fr;gap:.6rem;
  padding:.42rem 0;border-bottom:1px solid var(--line);align-items:start}
.succ .fl{width:2.5rem;height:1.67rem;border:1px solid var(--line2);
  border-radius:2px;overflow:hidden;background:var(--bg)}
.succ .fl svg{display:block;width:100%;height:100%}
.succ .fl.none{border-style:dashed;opacity:.55}
.succ .y{font-family:var(--mono);font-size:.72em;color:var(--accent);
  display:block}
.succ .n{font-size:.9em;font-weight:500;display:block;overflow-wrap:anywhere}
.succ .d{font-size:.8em;color:var(--ink3);line-height:1.5;display:block;
  margin-top:.1rem}

/* Historical eras.

   Names are never set inside the bands. A linear time axis puts the Qin at
   0.37% of its width, so any lettering placed there is bound to clip, overlap
   its neighbour or be covered; the Japan sheet solves this by leaving the bands
   as colour alone, and this follows it. Every name is then given in full in a
   legend that wraps, so nothing is ever truncated at any viewport width. */
.eras{margin-top:.7rem}
.erapre{display:flex;align-items:center;gap:.5rem;font-family:var(--mono);
  font-size:.6rem;color:var(--ink3);margin-bottom:.2rem}
.erapre i{flex:1 1 auto;height:.3rem;border-radius:2px;
  background:repeating-linear-gradient(90deg,var(--ama) 0 6px,transparent 6px 11px)}
.eraband{display:flex;width:100%;height:1.55rem;border:1px solid var(--line2);
  border-radius:var(--r-sm);overflow:hidden;margin:.15rem 0 .2rem}
.eraband button{flex:0 0 auto;min-width:3px;border-right:1px solid var(--surf);
  transition:filter .15s;position:relative;padding:0}
.eraband button:last-child{border-right:0}
.eraband button:hover{filter:brightness(1.15)}
.eraband button[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--red)}
.erascale{position:relative;height:1rem;font-family:var(--mono);font-size:.6rem;
  color:var(--ink3);margin-bottom:.6rem}
.erascale span{position:absolute;top:.22rem;white-space:nowrap}
.erascale span::before{content:"";position:absolute;left:0;top:-.24rem;width:1px;
  height:.2rem;background:var(--line2)}
.erascale span.last::before{left:auto;right:0}
.erachips{display:flex;flex-wrap:wrap;gap:.3rem}
.erachips button{display:inline-flex;align-items:center;gap:.35rem;
  padding:.16rem .5rem .16rem .34rem;border:1px solid var(--line2);
  border-radius:var(--r-pill);background:var(--bg);font-size:.76em;
  color:var(--ink2);line-height:1.35;transition:border-color .15s,color .15s}
.erachips button:hover{color:var(--head);border-color:var(--ink3)}
.erachips button[aria-pressed="true"]{border-color:var(--sumire);
  color:var(--head);font-weight:500}
.erachips i{width:.62rem;height:.62rem;border-radius:2px;flex:0 0 auto}
.erachips .y{font-family:var(--mono);font-size:.86em;color:var(--ink3)}
/* Milestones, to the revised United States specification: a column-flowing list
   with the year in its own track, so a long run of dates reads down the page
   rather than stretching one entry per line across the full width. */
.tline{list-style:none;margin:.5rem 0 0;padding:0;font-size:.84em;
  columns:clamp(16rem,23vw,23rem);column-gap:clamp(1.2rem,2.6vw,2.6rem)}
.tline li{display:grid;grid-template-columns:3.1rem 1fr;gap:.55rem;
  padding:.3rem 0;border-top:1px solid var(--line);break-inside:avoid-column}
.tline li:first-child{border-top:0}
.tline .y{font-family:var(--mono);color:var(--accent);font-size:.92em;
  padding-top:.1em}
.tline .w{overflow-wrap:anywhere}
.tline .a{display:block;font-family:var(--mono);font-size:.78em;color:var(--ink3)}
.tline li.mapchg .y{color:var(--tokiwa)}
.tline li.sel{background:var(--surf2)}
.tline li.sel .y{color:var(--sumire)}
.eracaveat{margin-top:.7rem;font-size:.78em;line-height:1.6;color:var(--ink3);
  max-width:80ch}
/* The note reads as a heading line and then a sentence, exactly as on the
   United States sheet: name, span, length, a hard break, then the account.
   The class names here and in the script must agree; when they did not, none
   of this spacing applied and the note ran together as a single string. */
.eranote{margin-top:.6rem;font-size:.87em;line-height:1.62;color:var(--ink2);
  min-height:4.2em;max-width:80ch}
.eranote b{color:var(--head);font-weight:600}
.eranote .yr{font-family:var(--mono);color:var(--ink3);font-size:.86em;
  margin-left:.5rem}
.eranote .st{display:block;margin-top:.3rem;font-family:var(--mono);
  font-size:.82em;color:var(--tokiwa)}

/* historical seats of power, after the Japan sheet's capitals layer */
.cp{fill:none;stroke:var(--red);stroke-width:calc(var(--u)*1.1px)}
.cpi{fill:var(--red)}
.cpl{font-family:var(--serif);font-size:calc(var(--u)*9px);font-weight:600;
  fill:var(--red);stroke:var(--land);stroke-width:calc(var(--u)*2.4px)}
}
`;

export default function TaiwanReferenceAtlas() {
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    // React development StrictMode can invoke effects twice. The original atlas
    // is an imperative single-instance application, so initialize it once.
    if (initializedRef.current) return;
    initializedRef.current = true;

    document.documentElement.setAttribute("lang", "en");
    document.documentElement.setAttribute("data-ground", "paper");
    document.documentElement.setAttribute("data-density", "normal");

    // Recreate the original <head> payload from taiwan.html without requiring
    // any edit to Vite/GitHub Pages index.html. Existing matching metadata is
    // reused; missing nodes are created with the original attributes/content.
    function ensureMeta(selector, attrs) {
      let node = document.head.querySelector(selector);
      if (!node) { node = document.createElement("meta"); document.head.appendChild(node); }
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      return node;
    }
    function ensureLink(selector, attrs) {
      let node = document.head.querySelector(selector);
      if (!node) { node = document.createElement("link"); document.head.appendChild(node); }
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      return node;
    }

    let charsetMeta = document.head.querySelector("meta[charset]");
    if (!charsetMeta) { charsetMeta = document.createElement("meta"); document.head.prepend(charsetMeta); }
    charsetMeta.setAttribute("charset", "utf-8");
    ensureMeta('meta[name="viewport"]', { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" });
    ensureMeta('meta[name="theme-color"]', { name: "theme-color", content: "#FCFAF2" });
    ensureMeta('meta[name="description"]', { name: "description", content: "Reference atlas of the Taiwan Area: divisions, relief, hydrography, conservation and state symbols." });
    document.title = "Taiwan Reference Atlas";
    ensureLink('link[rel="preconnect"][href="https://fonts.googleapis.com"]', { rel: "preconnect", href: "https://fonts.googleapis.com" });
    ensureLink('link[rel="preconnect"][href="https://fonts.gstatic.com"]', { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" });
    ensureLink('link[rel="stylesheet"][href^="https://fonts.googleapis.com/css2?family=Source+Serif+4"]', {
      href: "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Noto+Serif+TC:wght@300;400;500;600&family=Noto+Serif+JP:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap",
      rel: "stylesheet"
    });
    if (![...document.head.querySelectorAll("style")].some((node) => node.textContent === TAIWAN_ATLAS_CSS)) {
      const styleNode = document.createElement("style");
      styleNode.textContent = TAIWAN_ATLAS_CSS;
      document.head.appendChild(styleNode);
    }

    /* ===== BEGIN ORIGINAL taiwan.html JAVASCRIPT — algorithm/data unchanged ===== */
    const CO=[
    /* 新北 西北岸 八里–淡水–三芝–石門 */
    121.2850,25.1335,121.2940,25.1345,121.3030,25.1360,121.3120,25.1380,
    121.3210,25.1405,121.3300,25.1435,121.3390,25.1470,121.3480,25.1510,
    121.3570,25.1560,121.3660,25.1615,121.3745,25.1675,121.3825,25.1740,
    121.3900,25.1800,121.3975,25.1840,121.4045,25.1858,121.4085,25.1855,
    121.4130,25.1830,121.4180,25.1815,121.4230,25.1832,121.4262,25.1880,
    121.4262,25.1935,121.4300,25.2000,121.4340,25.2065,121.4390,25.2130,
    121.4440,25.2190,121.4500,25.2250,121.4560,25.2310,121.4620,25.2365,
    121.4685,25.2415,121.4750,25.2465,121.4820,25.2510,121.4890,25.2545,
    121.4960,25.2600,121.5020,25.2660,121.5080,25.2720,121.5140,25.2780,
    121.5200,25.2835,121.5260,25.2890,121.5320,25.2942,121.5375,25.2980,
    /* 北岸 石門–金山–萬里 */
    121.5445,25.2955,121.5520,25.2925,121.5605,25.2900,121.5680,25.2905,
    121.5745,25.2885,121.5820,25.2830,121.5895,25.2760,121.5960,25.2690,
    121.6035,25.2630,121.6110,25.2570,121.6185,25.2510,121.6265,25.2455,
    121.6345,25.2360,121.6380,25.2280,121.6425,25.2245,121.6510,25.2215,
    121.6595,25.2185,121.6680,25.2135,121.6760,25.2095,121.6845,25.2065,
    121.6905,25.2065,121.6935,25.2020,121.6890,25.1980,121.6830,25.1950,
    121.6905,25.1900,121.6990,25.1855,121.7075,25.1800,121.7160,25.1735,
    121.7240,25.1680,121.7310,25.1620,121.7355,25.1595,
    /* 基隆市 */
    121.7400,25.1570,121.7440,25.1585,121.7455,25.1620,121.7440,25.1655,
    121.7480,25.1670,121.7530,25.1650,121.7560,25.1600,121.7530,25.1560,
    121.7495,25.1490,121.7520,25.1425,121.7580,25.1400,121.7622,25.1440,
    121.7615,25.1520,121.7650,25.1580,121.7690,25.1615,121.7660,25.1650,
    121.7700,25.1682,121.7760,25.1660,121.7775,25.1610,121.7740,25.1570,
    121.7790,25.1530,121.7860,25.1500,121.7930,25.1465,121.8000,25.1440,
    121.8060,25.1420,
    /* 新北 東北角 瑞芳–貢寮 */
    121.8140,25.1400,121.8225,25.1385,121.8310,25.1380,121.8390,25.1345,
    121.8470,25.1300,121.8550,25.1275,121.8635,25.1265,121.8720,25.1270,
    121.8805,25.1290,121.8890,25.1300,121.8975,25.1290,121.9060,25.1290,
    121.9145,25.1285,121.9225,25.1275,121.9265,25.1230,121.9250,25.1180,
    121.9225,25.1130,121.9225,25.1085,121.9195,25.1040,121.9150,25.0995,
    121.9180,25.0940,121.9230,25.0880,121.9280,25.0810,121.9310,25.0730,
    121.9330,25.0650,121.9345,25.0560,121.9350,25.0470,121.9345,25.0390,
    121.9370,25.0310,121.9410,25.0245,121.9440,25.0195,121.9510,25.0155,
    121.9590,25.0125,121.9675,25.0100,121.9760,25.0085,121.9845,25.0080,
    121.9930,25.0075,122.0025,25.0075,122.0000,25.0010,121.9945,24.9945,
    121.9880,24.9885,121.9805,24.9830,121.9720,24.9790,121.9635,24.9755,
    121.9550,24.9720,121.9465,24.9680,121.9380,24.9640,121.9310,24.9600,
    121.9245,24.9585,
    /* 宜蘭 頭城–蘇澳–南澳 */
    121.9180,24.9540,121.9110,24.9500,121.9040,24.9455,121.8975,24.9420,
    121.8905,24.9385,121.8830,24.9330,121.8760,24.9260,121.8690,24.9180,
    121.8630,24.9095,121.8575,24.9005,121.8525,24.8915,121.8470,24.8825,
    121.8420,24.8770,121.8375,24.8715,121.8340,24.8630,121.8320,24.8540,
    121.8305,24.8440,121.8300,24.8340,121.8300,24.8240,121.8305,24.8140,
    121.8310,24.8040,121.8315,24.7940,121.8320,24.7840,121.8325,24.7740,
    121.8330,24.7640,121.8330,24.7540,121.8330,24.7440,121.8325,24.7340,
    121.8320,24.7240,121.8320,24.7180,121.8330,24.7080,121.8345,24.6980,
    121.8360,24.6880,121.8380,24.6780,121.8400,24.6680,121.8425,24.6580,
    121.8450,24.6480,121.8480,24.6380,121.8510,24.6280,121.8545,24.6180,
    121.8580,24.6085,121.8615,24.5995,121.8635,24.5915,121.8680,24.5875,
    121.8702,24.5840,121.8665,24.5805,121.8625,24.5780,121.8600,24.5720,
    121.8590,24.5640,121.8580,24.5550,121.8570,24.5460,121.8550,24.5370,
    121.8525,24.5280,121.8495,24.5190,121.8465,24.5100,121.8440,24.5010,
    121.8425,24.4920,121.8425,24.4830,121.8425,24.4790,121.8395,24.4730,
    121.8385,24.4680,121.8350,24.4600,121.8310,24.4520,121.8265,24.4440,
    121.8215,24.4360,121.8165,24.4280,121.8125,24.4200,121.8095,24.4110,
    121.8095,24.4020,121.8060,24.3940,121.8020,24.3860,121.7975,24.3780,
    121.7930,24.3700,121.7885,24.3620,121.7840,24.3540,121.7795,24.3460,
    121.7750,24.3380,121.7705,24.3300,121.7660,24.3220,121.7615,24.3140,
    121.7565,24.3050,
    /* 花蓮 清水斷崖–花蓮港–秀姑巒溪口 */
    121.7520,24.2970,121.7475,24.2890,121.7430,24.2810,121.7385,24.2730,
    121.7340,24.2650,121.7295,24.2570,121.7250,24.2490,121.7205,24.2410,
    121.7160,24.2330,121.7115,24.2250,121.7070,24.2170,121.7025,24.2090,
    121.6980,24.2010,121.6940,24.1920,121.6905,24.1820,121.6905,24.1720,
    121.6905,24.1580,121.6880,24.1480,121.6850,24.1380,121.6820,24.1280,
    121.6790,24.1180,121.6755,24.1080,121.6720,24.0980,121.6685,24.0880,
    121.6650,24.0780,121.6615,24.0680,121.6580,24.0580,121.6545,24.0480,
    121.6510,24.0380,121.6470,24.0280,121.6430,24.0180,121.6390,24.0090,
    121.6350,24.0040,121.6255,23.9985,121.6210,23.9900,121.6175,23.9800,
    121.6150,23.9700,121.6130,23.9600,121.6120,23.9450,121.6100,23.9350,
    121.6070,23.9250,121.6035,23.9150,121.5995,23.9050,121.5955,23.8950,
    121.5915,23.8850,121.5875,23.8750,121.5835,23.8650,121.5795,23.8550,
    121.5755,23.8450,121.5715,23.8350,121.5670,23.8250,121.5625,23.8150,
    121.5580,23.8050,121.5535,23.7950,121.5490,23.7850,121.5445,23.7750,
    121.5400,23.7650,121.5355,23.7550,121.5310,23.7450,121.5265,23.7350,
    121.5220,23.7250,121.5175,23.7085,121.5165,23.6900,121.5155,23.6700,
    121.5145,23.6500,121.5135,23.6300,121.5125,23.6100,121.5115,23.5900,
    121.5105,23.5700,121.5095,23.5500,121.5085,23.5300,121.5078,23.5100,
    121.5075,23.4915,121.5040,23.4850,121.4990,23.4790,121.4930,23.4740,
    121.4870,23.4700,121.4840,23.4620,121.4820,23.4520,121.4800,23.4380,
    /* 臺東 長濱–成功–卑南–大武 */
    121.4785,23.4280,121.4770,23.4180,121.4755,23.4080,121.4745,23.3980,
    121.4735,23.3880,121.4730,23.3780,121.4725,23.3680,121.4722,23.3580,
    121.4720,23.3480,121.4720,23.3380,121.4720,23.3195,121.4700,23.3100,
    121.4670,23.3000,121.4640,23.2900,121.4605,23.2800,121.4570,23.2700,
    121.4535,23.2600,121.4495,23.2500,121.4455,23.2400,121.4415,23.2300,
    121.4375,23.2200,121.4330,23.2100,121.4285,23.2000,121.4240,23.1900,
    121.4195,23.1800,121.4150,23.1700,121.4100,23.1600,121.4050,23.1500,
    121.4000,23.1400,121.3950,23.1300,121.3900,23.1200,121.3855,23.1100,
    121.3805,23.1010,121.3760,23.0920,121.3710,23.0830,121.3660,23.0740,
    121.3610,23.0650,121.3560,23.0560,121.3510,23.0470,121.3460,23.0380,
    121.3410,23.0290,121.3360,23.0200,121.3310,23.0110,121.3260,23.0020,
    121.3205,22.9930,121.3150,22.9840,121.3095,22.9750,121.3040,22.9660,
    121.2985,22.9570,121.2925,22.9480,121.2865,22.9390,121.2805,22.9300,
    121.2745,22.9230,121.2685,22.9200,121.2620,22.9175,121.2555,22.9162,
    121.2490,22.9157,121.2450,22.9155,121.2390,22.9100,121.2340,22.9020,
    121.2295,22.8930,121.2255,22.8840,121.2220,22.8750,121.2185,22.8660,
    121.2150,22.8570,121.2115,22.8480,121.2080,22.8390,121.2045,22.8300,
    121.2010,22.8210,121.1975,22.8120,121.1935,22.8010,121.1880,22.7930,
    121.1820,22.7860,121.1755,22.7800,121.1690,22.7745,121.1620,22.7690,
    121.1550,22.7630,121.1480,22.7570,121.1410,22.7505,121.1340,22.7440,
    121.1270,22.7370,121.1200,22.7300,121.1130,22.7225,121.1060,22.7150,
    121.0990,22.7075,121.0920,22.7000,121.0850,22.6920,121.0780,22.6840,
    121.0710,22.6760,121.0640,22.6680,121.0570,22.6600,121.0500,22.6520,
    121.0430,22.6440,121.0360,22.6360,121.0290,22.6280,121.0220,22.6210,
    121.0150,22.6170,121.0080,22.6135,121.0010,22.6060,120.9950,22.5980,
    120.9895,22.5890,120.9845,22.5800,120.9800,22.5710,120.9760,22.5620,
    120.9720,22.5530,120.9685,22.5440,120.9670,22.5375,120.9640,22.5290,
    120.9610,22.5200,120.9580,22.5110,120.9550,22.5020,120.9520,22.4930,
    120.9490,22.4840,120.9460,22.4750,120.9430,22.4660,120.9395,22.4570,
    120.9360,22.4480,120.9325,22.4390,120.9285,22.4300,120.9245,22.4210,
    120.9200,22.4120,120.9155,22.4030,120.9110,22.3940,120.9060,22.3850,
    120.9010,22.3720,120.8965,22.3550,120.8940,22.3450,120.8920,22.3350,
    120.8905,22.3250,120.8895,22.3150,120.8885,22.3050,120.8880,22.2950,
    120.8875,22.2850,120.8870,22.2750,120.8865,22.2650,120.8860,22.2550,
    120.8850,22.2450,120.8835,22.2350,120.8800,22.2200,
    /* 屏東 旭海–鵝鑾鼻–貓鼻頭–枋寮–東港 */
    120.8760,22.2100,120.8700,22.2000,120.8640,22.1950,120.8600,22.1900,
    120.8580,22.1800,120.8570,22.1700,120.8565,22.1600,120.8570,22.1500,
    120.8580,22.1400,120.8600,22.1300,120.8625,22.1200,120.8650,22.1100,
    120.8670,22.1000,120.8690,22.0900,120.8700,22.0800,120.8700,22.0700,
    120.8690,22.0600,120.8670,22.0520,120.8650,22.0435,120.8635,22.0350,
    120.8615,22.0250,120.8600,22.0150,120.8590,22.0050,120.8585,21.9950,
    120.8585,21.9850,120.8590,21.9750,120.8600,21.9650,120.8610,21.9550,
    120.8620,21.9450,120.8630,21.9350,120.8635,21.9250,120.8630,21.9150,
    120.8615,21.9060,120.8570,21.9010,120.8500,21.8992,120.8430,21.9002,
    120.8370,21.9040,120.8320,21.9095,120.8270,21.9150,120.8210,21.9195,
    120.8140,21.9225,120.8060,21.9240,120.7980,21.9242,120.7900,21.9235,
    120.7830,21.9250,120.7770,21.9280,120.7720,21.9320,120.7670,21.9350,
    120.7610,21.9352,120.7550,21.9330,120.7490,21.9300,120.7440,21.9280,
    120.7395,21.9260,120.7370,21.9330,120.7370,21.9420,120.7385,21.9510,
    120.7405,21.9600,120.7425,21.9690,120.7440,21.9780,120.7450,21.9870,
    120.7455,21.9960,120.7455,22.0050,120.7450,22.0140,120.7440,22.0230,
    120.7425,22.0320,120.7405,22.0410,120.7385,22.0500,120.7360,22.0590,
    120.7330,22.0670,120.7290,22.0730,120.7240,22.0770,120.7180,22.0790,
    120.7120,22.0792,120.7075,22.0790,120.7050,22.0880,120.7030,22.0970,
    120.7015,22.1060,120.7005,22.1150,120.6995,22.1240,120.6985,22.1330,
    120.6975,22.1420,120.6965,22.1510,120.6960,22.1600,120.6955,22.1700,
    120.6950,22.1800,120.6950,22.1900,120.6960,22.2000,120.6975,22.2100,
    120.6995,22.2200,120.7020,22.2300,120.6980,22.2400,120.6930,22.2500,
    120.6875,22.2600,120.6815,22.2700,120.6750,22.2800,120.6680,22.2900,
    120.6605,22.3000,120.6525,22.3100,120.6440,22.3200,120.6350,22.3300,
    120.6255,22.3400,120.6160,22.3500,120.6060,22.3590,120.5945,22.3670,
    120.5850,22.3730,120.5760,22.3790,120.5670,22.3860,120.5585,22.3930,
    120.5505,22.4000,120.5430,22.4080,120.5360,22.4160,120.5290,22.4240,
    120.5220,22.4310,120.5155,22.4330,120.5080,22.4380,120.5000,22.4430,
    120.4920,22.4480,120.4840,22.4530,120.4760,22.4570,120.4680,22.4600,
    120.4600,22.4630,120.4525,22.4670,120.4470,22.4730,120.4420,22.4790,
    120.4370,22.4802,120.4320,22.4805,120.4285,22.4805,
    /* 高雄 旗津–柴山–茄萣 */
    120.4230,22.4840,120.4170,22.4880,120.4110,22.4930,120.4050,22.4980,
    120.3990,22.5030,120.3930,22.5080,120.3870,22.5130,120.3810,22.5180,
    120.3750,22.5230,120.3690,22.5280,120.3630,22.5330,120.3570,22.5385,
    120.3510,22.5440,120.3450,22.5495,120.3390,22.5550,120.3330,22.5600,
    120.3270,22.5650,120.3210,22.5700,120.3150,22.5750,120.3090,22.5800,
    120.3030,22.5850,120.2970,22.5895,120.2905,22.5935,120.2840,22.5960,
    120.2780,22.5970,120.2725,22.5975,120.2690,22.6030,120.2665,22.6100,
    120.2650,22.6180,120.2645,22.6260,120.2645,22.6340,120.2650,22.6420,
    120.2660,22.6500,120.2670,22.6580,120.2680,22.6660,120.2690,22.6740,
    120.2700,22.6820,120.2705,22.6900,120.2700,22.6960,120.2690,22.7040,
    120.2670,22.7120,120.2645,22.7200,120.2615,22.7280,120.2585,22.7360,
    120.2555,22.7440,120.2525,22.7520,120.2495,22.7600,120.2465,22.7680,
    120.2435,22.7760,120.2400,22.7840,120.2365,22.7920,120.2330,22.8000,
    120.2295,22.8080,120.2260,22.8160,120.2225,22.8240,120.2190,22.8320,
    120.2155,22.8400,120.2115,22.8480,120.2075,22.8560,120.2035,22.8640,
    120.1995,22.8720,120.1955,22.8800,120.1915,22.8880,120.1875,22.8930,
    120.1810,22.8975,120.1780,22.9050,120.1755,22.9130,120.1735,22.9210,
    120.1725,22.9290,120.1720,22.9375,
    /* 臺南 安平–曾文溪口–七股–北門 */
    120.1705,22.9450,120.1685,22.9530,120.1660,22.9610,120.1630,22.9690,
    120.1595,22.9770,120.1555,22.9850,120.1520,22.9930,120.1495,23.0025,
    120.1470,23.0110,120.1440,23.0190,120.1405,23.0270,120.1365,23.0350,
    120.1320,23.0430,120.1270,23.0500,120.1215,23.0560,120.1155,23.0610,
    120.1090,23.0645,120.1025,23.0665,120.0955,23.0672,120.0890,23.0670,
    120.0820,23.0668,120.0755,23.0665,120.0720,23.0740,120.0690,23.0820,
    120.0670,23.0900,120.0655,23.0980,120.0645,23.1060,120.0645,23.1140,
    120.0650,23.1220,120.0655,23.1300,120.0655,23.1355,120.0680,23.1440,
    120.0710,23.1520,120.0745,23.1600,120.0780,23.1680,120.0815,23.1760,
    120.0850,23.1840,120.0885,23.1920,120.0915,23.2000,120.0945,23.2080,
    120.0975,23.2160,120.1000,23.2240,120.1020,23.2320,120.1040,23.2400,
    120.1055,23.2480,120.1055,23.2560,120.1055,23.2670,120.1075,23.2750,
    120.1100,23.2830,120.1130,23.2910,120.1160,23.2990,120.1185,23.3070,
    120.1200,23.3130,
    /* 嘉義縣 布袋–東石 */
    120.1230,23.3210,120.1265,23.3290,120.1300,23.3370,120.1340,23.3450,
    120.1370,23.3530,120.1385,23.3610,120.1385,23.3690,120.1385,23.3805,
    120.1400,23.3890,120.1410,23.3970,120.1415,23.4050,120.1420,23.4130,
    120.1420,23.4210,120.1420,23.4290,120.1420,23.4370,120.1420,23.4450,
    120.1420,23.4530,120.1420,23.4590,120.1425,23.4670,120.1435,23.4750,
    120.1450,23.4830,120.1465,23.4910,120.1480,23.4990,120.1490,23.5070,
    120.1490,23.5150,120.1490,23.5210,
    /* 雲林 臺西–麥寮 */
    120.1510,23.5290,120.1535,23.5370,120.1560,23.5450,120.1585,23.5530,
    120.1610,23.5610,120.1635,23.5690,120.1660,23.5770,120.1680,23.5850,
    120.1700,23.5930,120.1715,23.6010,120.1730,23.6090,120.1745,23.6170,
    120.1755,23.6250,120.1765,23.6330,120.1770,23.6410,120.1775,23.6490,
    120.1780,23.6570,120.1785,23.6650,120.1785,23.6730,120.1785,23.6810,
    120.1785,23.6890,120.1785,23.6970,120.1785,23.7060,120.1800,23.7140,
    120.1820,23.7220,120.1845,23.7300,120.1870,23.7380,120.1895,23.7460,
    120.1920,23.7540,120.1940,23.7620,120.1955,23.7700,120.1965,23.7780,
    120.1965,23.7860,120.1965,23.7975,120.2020,23.8050,120.2090,23.8110,
    120.2170,23.8170,120.2250,23.8230,120.2320,23.8300,120.2350,23.8425,
    /* 彰化 大城–鹿港–伸港 */
    120.2400,23.8500,120.2450,23.8580,120.2500,23.8660,120.2555,23.8740,
    120.2610,23.8820,120.2665,23.8900,120.2720,23.8980,120.2775,23.9060,
    120.2870,23.9130,120.2930,23.9200,120.2990,23.9270,120.3050,23.9340,
    120.3110,23.9410,120.3170,23.9480,120.3230,23.9550,120.3290,23.9620,
    120.3350,23.9690,120.3410,23.9760,120.3470,23.9830,120.3530,23.9900,
    120.3590,23.9970,120.3650,24.0040,120.3710,24.0110,120.3770,24.0180,
    120.3830,24.0250,120.3880,24.0330,120.3900,24.0400,120.3925,24.0480,
    120.3930,24.0555,120.3970,24.0640,120.4020,24.0720,120.4075,24.0800,
    120.4130,24.0880,120.4190,24.0960,120.4250,24.1040,120.4315,24.1120,
    120.4380,24.1200,120.4450,24.1280,120.4520,24.1360,120.4590,24.1430,
    120.4655,24.1490,120.4720,24.1550,120.4790,24.1600,120.4850,24.1640,
    120.4900,24.1665,
    /* 臺中 梧棲–大甲 */
    120.4940,24.1740,120.4975,24.1820,120.5005,24.1900,120.5035,24.1980,
    120.5060,24.2060,120.5085,24.2140,120.5105,24.2220,120.5125,24.2300,
    120.5140,24.2380,120.5150,24.2460,120.5150,24.2540,120.5145,24.2665,
    120.5180,24.2740,120.5220,24.2810,120.5265,24.2880,120.5310,24.2950,
    120.5350,24.3020,120.5380,24.3100,120.5390,24.3175,120.5420,24.3250,
    120.5455,24.3330,120.5490,24.3410,120.5530,24.3490,120.5570,24.3570,
    120.5615,24.3650,120.5660,24.3730,120.5695,24.3855,
    /* 苗栗 苑裡–通霄–後龍–竹南 */
    120.5750,24.3930,120.5810,24.4000,120.5875,24.4070,120.5940,24.4140,
    120.6010,24.4210,120.6080,24.4280,120.6150,24.4350,120.6240,24.4390,
    120.6335,24.4425,120.6400,24.4490,120.6465,24.4560,120.6530,24.4630,
    120.6595,24.4700,120.6660,24.4770,120.6710,24.4845,120.6755,24.4915,
    120.6800,24.4990,120.6845,24.5070,120.6890,24.5150,120.6935,24.5230,
    120.6980,24.5310,120.7025,24.5390,120.7075,24.5470,120.7125,24.5550,
    120.7175,24.5630,120.7230,24.5710,120.7285,24.5790,120.7340,24.5860,
    120.7400,24.5930,120.7440,24.6000,120.7460,24.6080,120.7480,24.6210,
    120.7550,24.6280,120.7620,24.6350,120.7690,24.6420,120.7760,24.6490,
    120.7815,24.6560,120.7880,24.6620,120.7950,24.6680,120.8020,24.6740,
    120.8090,24.6800,120.8160,24.6860,120.8230,24.6910,120.8300,24.6950,
    120.8365,24.6985,120.8425,24.7020,120.8490,24.7080,120.8555,24.7140,
    120.8620,24.7200,120.8680,24.7270,120.8730,24.7350,120.8770,24.7440,
    120.8780,24.7550,
    /* 新竹市 香山–南寮 */
    120.8830,24.7630,120.8880,24.7700,120.8940,24.7770,120.9000,24.7840,
    120.9060,24.7910,120.9105,24.7990,120.9145,24.8070,120.9180,24.8150,
    120.9215,24.8230,120.9250,24.8310,120.9275,24.8390,120.9285,24.8480,
    120.9250,24.8500,120.9210,24.8510,120.9180,24.8512,
    /* 新竹縣 竹北–新豐 */
    120.9240,24.8570,120.9300,24.8630,120.9360,24.8690,120.9420,24.8750,
    120.9480,24.8810,120.9540,24.8870,120.9600,24.8930,120.9660,24.8990,
    120.9720,24.9050,120.9780,24.9110,120.9835,24.9175,120.9880,24.9250,
    120.9920,24.9330,120.9955,24.9410,120.9985,24.9490,121.0000,24.9570,
    /* 桃園 新屋–觀音–大園 */
    121.0020,24.9650,121.0045,24.9730,121.0070,24.9810,121.0080,24.9870,
    121.0130,24.9930,121.0190,24.9990,121.0250,25.0050,121.0310,25.0110,
    121.0370,25.0170,121.0430,25.0230,121.0490,25.0280,121.0555,25.0320,
    121.0620,25.0345,121.0700,25.0355,121.0780,25.0350,121.0870,25.0370,
    121.0960,25.0400,121.1050,25.0435,121.1140,25.0470,121.1230,25.0510,
    121.1320,25.0555,121.1410,25.0600,121.1500,25.0650,121.1590,25.0700,
    121.1680,25.0755,121.1770,25.0810,121.1860,25.0865,121.1950,25.0920,
    121.2040,25.0975,121.2130,25.1030,121.2220,25.1085,121.2310,25.1140,
    121.2405,25.1235,121.2490,25.1265,121.2580,25.1290,121.2670,25.1310,
    121.2760,25.1325];
    const CUTS=[
     ['NTP',121.9245,24.9585],['ILA',121.7565,24.3050],['HUA',121.4800,23.4380],
     ['TTT',120.8800,22.2200],['PIF',120.4285,22.4805],['KHH',120.1720,22.9375],
     ['TNN',120.1200,23.3130],['CYQ',120.1490,23.5210],['YUN',120.2350,23.8425],
     ['CHA',120.4900,24.1665],['TXG',120.5695,24.3855],['MIA',120.8780,24.7550],
     ['HSQ',121.0000,24.9570],['TYC',121.2850,25.1335]];
    const SUBCUT={KEL:[121.7355,25.1595,121.8060,25.1420],
                  HSC:[120.8780,24.7550,120.9180,24.8512]};
    const ED={
    NTP_ILA:[121.9245,24.9585,121.9000,24.9420,121.8720,24.9250,121.8430,24.9100,
     121.8150,24.8950,121.7880,24.8790,121.7620,24.8620,121.7380,24.8440,
     121.7150,24.8250,121.6930,24.8050,121.6720,24.7850,121.6520,24.7660,
     121.6320,24.7500,121.6110,24.7380,121.5890,24.7290,121.5660,24.7230,
     121.5420,24.7180,121.5180,24.7130,121.4950,24.7060,121.4700,24.7000],
    NTP_TYC:[121.4700,24.7000,121.4530,24.7180,121.4380,24.7380,121.4250,24.7600,
     121.4130,24.7830,121.4010,24.8060,121.3880,24.8280,121.3730,24.8480,
     121.3570,24.8660,121.3400,24.8820,121.3230,24.8970,121.3080,24.9130,
     121.2950,24.9300,121.2840,24.9480,121.2760,24.9670,121.2700,24.9860,
     121.2660,25.0050,121.2650,25.0240,121.2670,25.0430,121.2710,25.0620,
     121.2760,25.0810,121.2810,25.1000,121.2840,25.1180,121.2850,25.1335],
    TYC_ILA:[121.4700,24.7000,121.4620,24.6830,121.4540,24.6650,121.4460,24.6470,
     121.4380,24.6290,121.4290,24.6120,121.4180,24.5980,121.4060,24.5900,
     121.3950,24.5850],
    HSQ_TYC:[121.0000,24.9570,121.0180,24.9450,121.0370,24.9330,121.0560,24.9220,
     121.0750,24.9110,121.0940,24.8990,121.1130,24.8860,121.1310,24.8720,
     121.1490,24.8570,121.1660,24.8410,121.1830,24.8240,121.2000,24.8060,
     121.2160,24.7870,121.2320,24.7670,121.2470,24.7460,121.2620,24.7250,
     121.2770,24.7040,121.2920,24.6830,121.3070,24.6620,121.3230,24.6420,
     121.3400,24.6240,121.3580,24.6080,121.3760,24.5950,121.3950,24.5850],
    ILA_HSQ:[121.3950,24.5850,121.3830,24.5720,121.3700,24.5590,121.3560,24.5460,
     121.3420,24.5330,121.3280,24.5190,121.3150,24.5050,121.3020,24.4900,
     121.2900,24.4790,121.2800,24.4700],
    HSQ_TXG:[121.2800,24.4700,121.2620,24.4670,121.2440,24.4640,121.2260,24.4620,
     121.2080,24.4610,121.1900,24.4600,121.1720,24.4590,121.1540,24.4580,
     121.1360,24.4570,121.1180,24.4560,121.1000,24.4550,121.0820,24.4540,
     121.0640,24.4530,121.0460,24.4520,121.0280,24.4510,121.0050,24.4500],
    MIA_HSQ:[120.8780,24.7550,120.8890,24.7480,120.9000,24.7420,120.9120,24.7370,
     120.9240,24.7330,120.9360,24.7300,120.9480,24.7290,120.9600,24.7300,
     120.9700,24.7340,120.9770,24.7280,120.9820,24.7180,120.9860,24.7060,
     120.9900,24.6930,120.9950,24.6790,121.0010,24.6640,121.0070,24.6480,
     121.0130,24.6320,121.0180,24.6150,121.0220,24.5980,121.0250,24.5800,
     121.0260,24.5620,121.0250,24.5440,121.0220,24.5260,121.0180,24.5080,
     121.0130,24.4900,121.0090,24.4700,121.0050,24.4500],
    TXG_MIA:[120.5695,24.3855,120.5900,24.3830,120.6100,24.3810,120.6300,24.3800,
     120.6500,24.3800,120.6700,24.3810,120.6900,24.3830,120.7100,24.3860,
     120.7300,24.3900,120.7500,24.3950,120.7700,24.4010,120.7900,24.4070,
     120.8100,24.4130,120.8300,24.4190,120.8500,24.4250,120.8700,24.4300,
     120.8900,24.4350,120.9100,24.4390,120.9300,24.4420,120.9500,24.4450,
     120.9700,24.4470,120.9880,24.4490,121.0050,24.4500],
    ILA_TXG:[121.2800,24.4700,121.2960,24.4620,121.3120,24.4530,121.3280,24.4430,
     121.3440,24.4320,121.3600,24.4200,121.3760,24.4070,121.3920,24.3940,
     121.4080,24.3820,121.4240,24.3700,121.4400,24.3600],
    ILA_HUA:[121.7565,24.3050,121.7380,24.3080,121.7190,24.3110,121.7000,24.3150,
     121.6810,24.3190,121.6620,24.3230,121.6440,24.3280,121.6260,24.3330,
     121.6080,24.3380,121.5900,24.3420,121.5720,24.3460,121.5540,24.3500,
     121.5360,24.3530,121.5180,24.3550,121.5000,24.3570,121.4820,24.3580,
     121.4640,24.3590,121.4400,24.3600],
    HUA_TXG:[121.4400,24.3600,121.4300,24.3450,121.4190,24.3300,121.4070,24.3150,
     121.3950,24.3000,121.3830,24.2850,121.3710,24.2700,121.3600,24.2540,
     121.3490,24.2380,121.3380,24.2220,121.3270,24.2060,121.3160,24.1900,
     121.3060,24.1740,121.2980,24.1570,121.2900,24.1400],
    TXG_NAN:[121.2900,24.1400,121.2700,24.1450,121.2500,24.1520,121.2300,24.1590,
     121.2100,24.1660,121.1900,24.1730,121.1700,24.1800,121.1500,24.1860,
     121.1300,24.1920,121.1100,24.1970,121.0900,24.2010,121.0700,24.2050,
     121.0500,24.2080,121.0300,24.2100,121.0100,24.2110,120.9900,24.2110,
     120.9700,24.2100,120.9500,24.2080,120.9300,24.2050,120.9100,24.2010,
     120.8900,24.1960,120.8700,24.1900,120.8500,24.1840,120.8300,24.1770,
     120.8100,24.1700,120.7900,24.1630,120.7700,24.1550,120.7500,24.1460,
     120.7300,24.1350,120.7150,24.1200,120.7030,24.1030,120.6940,24.0850,
     120.6880,24.0700,120.6850,24.0550],
    CHA_TXG:[120.4900,24.1665,120.5050,24.1620,120.5200,24.1570,120.5350,24.1510,
     120.5500,24.1440,120.5650,24.1360,120.5790,24.1270,120.5920,24.1170,
     120.6040,24.1060,120.6160,24.0950,120.6280,24.0850,120.6420,24.0760,
     120.6560,24.0680,120.6700,24.0610,120.6850,24.0550],
    CHA_NAN:[120.6850,24.0550,120.6820,24.0380,120.6790,24.0210,120.6750,24.0040,
     120.6700,23.9870,120.6640,23.9700,120.6570,23.9540,120.6490,23.9380,
     120.6410,23.9220,120.6330,23.9060,120.6250,23.8900,120.6160,23.8760,
     120.6080,23.8670,120.6000,23.8600],
    YUN_CHA:[120.2350,23.8425,120.2600,23.8440,120.2850,23.8455,120.3100,23.8470,
     120.3350,23.8485,120.3600,23.8500,120.3850,23.8515,120.4100,23.8530,
     120.4350,23.8545,120.4600,23.8555,120.4850,23.8565,120.5100,23.8575,
     120.5350,23.8580,120.5600,23.8585,120.5800,23.8592,120.6000,23.8600],
    YUN_NAN:[120.6000,23.8600,120.6100,23.8460,120.6200,23.8320,120.6300,23.8170,
     120.6400,23.8020,120.6490,23.7870,120.6570,23.7710,120.6640,23.7550,
     120.6700,23.7390,120.6740,23.7220,120.6770,23.7050,120.6790,23.6880,
     120.6800,23.6700,120.6800,23.6520,120.6800,23.6360,120.6800,23.6200],
    CYQ_YUN:[120.1490,23.5210,120.1750,23.5250,120.2010,23.5290,120.2270,23.5330,
     120.2530,23.5370,120.2790,23.5420,120.3050,23.5470,120.3310,23.5520,
     120.3570,23.5570,120.3830,23.5620,120.4090,23.5670,120.4350,23.5720,
     120.4610,23.5780,120.4870,23.5840,120.5130,23.5900,120.5390,23.5960,
     120.5650,23.6020,120.5910,23.6080,120.6170,23.6120,120.6430,23.6160,
     120.6800,23.6200],
    CYQ_NAN:[120.6800,23.6200,120.7000,23.6150,120.7200,23.6090,120.7400,23.6020,
     120.7600,23.5940,120.7800,23.5850,120.7990,23.5750,120.8170,23.5640,
     120.8340,23.5520,120.8500,23.5390,120.8660,23.5250,120.8820,23.5110,
     120.8980,23.4970,120.9150,23.4850,120.9350,23.4760,120.9570,23.4700],
    KHH_NAN:[120.9570,23.4700,120.9680,23.4640,120.9790,23.4570,120.9900,23.4490,
     121.0100,23.4400],
    HUA_NAN:[121.0100,23.4400,121.0180,23.4600,121.0250,23.4820,121.0310,23.5050,
     121.0360,23.5290,121.0400,23.5540,121.0430,23.5790,121.0460,23.6040,
     121.0490,23.6290,121.0520,23.6540,121.0560,23.6790,121.0600,23.7040,
     121.0650,23.7290,121.0710,23.7530,121.0780,23.7770,121.0860,23.8000,
     121.0950,23.8230,121.1050,23.8450,121.1160,23.8660,121.1280,23.8870,
     121.1410,23.9070,121.1540,23.9270,121.1680,23.9460,121.1820,23.9650,
     121.1960,23.9840,121.2100,24.0030,121.2240,24.0220,121.2380,24.0410,
     121.2510,24.0610,121.2630,24.0810,121.2730,24.1010,121.2820,24.1200,
     121.2900,24.1400],
    HUA_KHH:[121.0300,23.2900,121.0300,23.3100,121.0290,23.3300,121.0270,23.3520,
     121.0240,23.3740,121.0200,23.3960,121.0150,23.4180,121.0100,23.4400],
    HUA_TTT:[121.4800,23.4380,121.4600,23.4300,121.4400,23.4230,121.4200,23.4160,
     121.4000,23.4090,121.3800,23.4010,121.3600,23.3930,121.3400,23.3850,
     121.3200,23.3770,121.3000,23.3690,121.2800,23.3620,121.2600,23.3550,
     121.2400,23.3480,121.2200,23.3420,121.2000,23.3360,121.1800,23.3300,
     121.1600,23.3230,121.1400,23.3160,121.1200,23.3080,121.1000,23.3010,
     121.0800,23.2960,121.0600,23.2920,121.0300,23.2900],
    TTT_KHH:[120.7800,22.7800,120.7900,22.8050,120.8010,22.8300,120.8120,22.8550,
     120.8240,22.8800,120.8360,22.9050,120.8480,22.9290,120.8600,22.9530,
     120.8720,22.9770,120.8840,23.0010,120.8950,23.0250,120.9060,23.0490,
     120.9170,23.0730,120.9280,23.0970,120.9390,23.1210,120.9500,23.1450,
     120.9620,23.1690,120.9740,23.1930,120.9860,23.2170,120.9980,23.2410,
     121.0100,23.2620,121.0200,23.2760,121.0300,23.2900],
    TTT_PIF:[120.8800,22.2200,120.8760,22.2400,120.8720,22.2600,120.8680,22.2800,
     120.8640,22.3000,120.8600,22.3200,120.8560,22.3400,120.8520,22.3600,
     120.8480,22.3800,120.8440,22.4000,120.8400,22.4200,120.8360,22.4400,
     120.8320,22.4600,120.8280,22.4800,120.8240,22.5000,120.8200,22.5200,
     120.8160,22.5400,120.8120,22.5600,120.8080,22.5800,120.8040,22.6000,
     120.8000,22.6200,120.7960,22.6400,120.7930,22.6600,120.7900,22.6800,
     120.7870,22.7000,120.7850,22.7200,120.7830,22.7400,120.7810,22.7600,
     120.7800,22.7800],
    PIF_KHH:[120.4285,22.4805,120.4380,22.4950,120.4470,22.5100,120.4550,22.5260,
     120.4620,22.5420,120.4690,22.5590,120.4760,22.5760,120.4830,22.5930,
     120.4900,22.6100,120.4980,22.6270,120.5060,22.6430,120.5150,22.6580,
     120.5250,22.6720,120.5360,22.6850,120.5480,22.6960,120.5610,22.7060,
     120.5750,22.7150,120.5900,22.7230,120.6060,22.7300,120.6220,22.7370,
     120.6390,22.7430,120.6560,22.7490,120.6730,22.7550,120.6900,22.7610,
     120.7070,22.7660,120.7250,22.7700,120.7430,22.7740,120.7610,22.7770,
     120.7800,22.7800],
    KHH_TNN:[120.1720,22.9375,120.1900,22.9480,120.2080,22.9580,120.2260,22.9680,
     120.2440,22.9790,120.2620,22.9900,120.2790,23.0020,120.2960,23.0150,
     120.3120,23.0290,120.3280,23.0430,120.3430,23.0580,120.3580,23.0730,
     120.3730,23.0880,120.3880,23.1030,120.4030,23.1180,120.4180,23.1330,
     120.4340,23.1470,120.4500,23.1600,120.4670,23.1730,120.4840,23.1850,
     120.5020,23.1960,120.5200,23.2070,120.5380,23.2180,120.5560,23.2290,
     120.5740,23.2400,120.5900,23.2520,120.6030,23.2650,120.6150,23.2800],
    TNN_CYQ:[120.1200,23.3130,120.1450,23.3130,120.1700,23.3130,120.1950,23.3125,
     120.2200,23.3120,120.2450,23.3110,120.2700,23.3100,120.2950,23.3090,
     120.3200,23.3080,120.3450,23.3060,120.3700,23.3040,120.3950,23.3010,
     120.4200,23.2980,120.4450,23.2950,120.4700,23.2920,120.4950,23.2890,
     120.5200,23.2870,120.5450,23.2850,120.5700,23.2830,120.5950,23.2810,
     120.6150,23.2800],
    KHH_CYQ:[120.6150,23.2800,120.6350,23.2900,120.6550,23.3010,120.6750,23.3120,
     120.6950,23.3240,120.7150,23.3360,120.7350,23.3480,120.7550,23.3600,
     120.7750,23.3720,120.7950,23.3840,120.8150,23.3960,120.8350,23.4080,
     120.8550,23.4200,120.8750,23.4320,120.8950,23.4430,120.9150,23.4530,
     120.9350,23.4620,120.9570,23.4700]};
    const RING={
     NTP:['c','NTP_ILA','NTP_TYC'],
     ILA:['c','ILA_HUA','~ILA_TXG','~ILA_HSQ','~TYC_ILA','~NTP_ILA'],
     HUA:['c','HUA_TTT','HUA_KHH','HUA_NAN','~HUA_TXG','~ILA_HUA'],
     TTT:['c','TTT_PIF','TTT_KHH','~HUA_TTT'],
     PIF:['c','PIF_KHH','~TTT_PIF'],
     KHH:['c','KHH_TNN','KHH_CYQ','KHH_NAN','~HUA_KHH','~TTT_KHH','~PIF_KHH'],
     TNN:['c','TNN_CYQ','~KHH_TNN'],
     CYQ:['c','CYQ_YUN','CYQ_NAN','~KHH_CYQ','~TNN_CYQ'],
     YUN:['c','YUN_CHA','YUN_NAN','~CYQ_YUN'],
     CHA:['c','CHA_TXG','CHA_NAN','~YUN_CHA'],
     TXG:['c','TXG_MIA','~HSQ_TXG','ILA_TXG','HUA_TXG','TXG_NAN','~CHA_TXG'],
     MIA:['c','MIA_HSQ','~TXG_MIA'],
     HSQ:['c','HSQ_TYC','ILA_HSQ','HSQ_TXG','~MIA_HSQ'],
     TYC:['c','~NTP_TYC','TYC_ILA','~HSQ_TYC'],
     NAN:['~TXG_NAN','~HUA_NAN','~KHH_NAN','~CYQ_NAN','~YUN_NAN','~CHA_NAN']};
    const ENC={
    TPE:[121.4570,25.1330,121.4640,25.1500,121.4750,25.1670,121.4890,25.1810,
     121.5050,25.1930,121.5230,25.2020,121.5420,25.2070,121.5610,25.2060,
     121.5780,25.1990,121.5920,25.1870,121.6030,25.1720,121.6120,25.1550,
     121.6200,25.1370,121.6280,25.1190,121.6380,25.1040,121.6500,25.0930,
     121.6620,25.0830,121.6660,25.0690,121.6620,25.0540,121.6520,25.0410,
     121.6390,25.0300,121.6240,25.0200,121.6090,25.0090,121.5960,24.9960,
     121.5850,24.9820,121.5720,24.9700,121.5560,24.9620,121.5390,24.9600,
     121.5230,24.9650,121.5100,24.9750,121.5010,24.9890,121.4950,25.0050,
     121.4920,25.0230,121.4900,25.0420,121.4870,25.0610,121.4820,25.0800,
     121.4750,25.0970,121.4660,25.1120,121.4600,25.1230],
    CYI:[120.4200,23.5100,120.4320,23.5170,120.4450,23.5200,120.4580,23.5190,
     120.4700,23.5150,120.4800,23.5070,120.4870,23.4970,120.4900,23.4850,
     120.4880,23.4730,120.4820,23.4620,120.4720,23.4540,120.4600,23.4490,
     120.4470,23.4470,120.4340,23.4490,120.4230,23.4550,120.4160,23.4650,
     120.4130,23.4770,120.4140,23.4900,120.4170,23.5010]};
    const CITYIN={
    KEL:[121.8060,25.1420,121.8010,25.1330,121.7960,25.1240,121.7900,25.1160,
     121.7830,25.1100,121.7750,25.1070,121.7670,25.1070,121.7590,25.1100,
     121.7520,25.1160,121.7460,25.1240,121.7410,25.1330,121.7370,25.1440],
    HSC:[120.9180,24.8512,120.9250,24.8430,120.9330,24.8340,120.9410,24.8240,
     120.9480,24.8130,120.9530,24.8010,120.9550,24.7880,120.9540,24.7760,
     120.9500,24.7650,120.9430,24.7560,120.9340,24.7500,120.9230,24.7470,
     120.9110,24.7470,120.9000,24.7490,120.8900,24.7520]};
    /* ══════════════════════════════════════════════════════════════════════
       OUTLYING ISLANDS

       Every group is drawn as a real outline at its true position. There are no
       insets and nothing is displaced, so no "not to true position" caveat is
       needed any more; Kinmen and Matsu are reached by zooming, not by a box in
       the corner. Outlines are still generalized by hand.

       [id, zh, en, ja, owner, [lon,lat,…]]
       ══════════════════════════════════════════════════════════════════════ */
    const ISL=[
    /* ── 澎湖群島. The three largest enclose the inner sea, which is the
          defining feature of the group and was lost in the old blobs. ── */
    ['PEN01','澎湖本島','Penghu Main I.','澎湖本島','PEN',[
     119.5560,23.5710,119.5640,23.5680,119.5700,23.5640,119.5730,23.5590,
     119.5700,23.5540,119.5650,23.5510,119.5620,23.5460,119.5650,23.5420,
     119.5720,23.5400,119.5790,23.5390,119.5860,23.5400,119.5920,23.5430,
     119.5980,23.5450,119.6050,23.5460,119.6120,23.5470,119.6190,23.5490,
     119.6260,23.5520,119.6330,23.5550,119.6400,23.5580,119.6470,23.5610,
     119.6540,23.5640,119.6610,23.5670,119.6670,23.5710,119.6710,23.5760,
     119.6720,23.5820,119.6680,23.5870,119.6610,23.5890,119.6540,23.5880,
     119.6470,23.5860,119.6400,23.5850,119.6330,23.5860,119.6260,23.5880,
     119.6190,23.5900,119.6120,23.5920,119.6050,23.5930,119.5980,23.5930,
     119.5910,23.5910,119.5850,23.5880,119.5790,23.5840,119.5740,23.5800,
     119.5690,23.5770,119.5620,23.5750]],
    ['PEN02','白沙島','Baisha I.','白沙島','PEN',[
     119.5900,23.6330, 119.5964,23.6306, 119.6032,23.6300, 119.6096,23.6318,
     119.6148,23.6354, 119.6186,23.6404, 119.6202,23.6462, 119.6196,23.6522,
     119.6166,23.6574, 119.6116,23.6612, 119.6052,23.6632, 119.5986,23.6630,
     119.5926,23.6606, 119.5878,23.6562, 119.5850,23.6504, 119.5846,23.6442,
     119.5864,23.6382]],
    ['PEN03','西嶼（漁翁島）','Xiyu I.','西嶼','PEN',[
     119.5060,23.6266, 119.5116,23.6244, 119.5152,23.6196, 119.5168,23.6136,
     119.5164,23.6072, 119.5156,23.6002, 119.5150,23.5932, 119.5144,23.5862,
     119.5136,23.5794, 119.5122,23.5730, 119.5096,23.5668, 119.5052,23.5616,
     119.4998,23.5586, 119.4946,23.5606, 119.4916,23.5658, 119.4906,23.5726,
     119.4912,23.5798, 119.4922,23.5872, 119.4932,23.5946, 119.4944,23.6020,
     119.4960,23.6094, 119.4986,23.6162, 119.5020,23.6224]],
    ['PEN04','中屯嶼','Zhongtun I.','中屯嶼','PEN',[
     119.5900,23.6060,119.5960,23.6050,119.6000,23.6090,119.5980,23.6150,
     119.5920,23.6170,119.5870,23.6140,119.5860,23.6090]],
    ['PEN05','吉貝嶼','Jibei I.','吉貝嶼','PEN',[
     119.5990,23.7360, 119.6042,23.7342, 119.6096,23.7346, 119.6140,23.7372,
     119.6164,23.7414, 119.6162,23.7462, 119.6132,23.7494, 119.6082,23.7508,
     119.6028,23.7500, 119.5984,23.7472, 119.5962,23.7430, 119.5966,23.7390]],
    ['PEN06','望安島','Wang’an I.','望安島','PEN',[
     119.4820,23.3560, 119.4862,23.3524, 119.4918,23.3506, 119.4976,23.3510,
     119.5024,23.3536, 119.5056,23.3580, 119.5064,23.3632, 119.5048,23.3684,
     119.5010,23.3724, 119.4956,23.3748, 119.4896,23.3750, 119.4842,23.3730,
     119.4802,23.3692, 119.4784,23.3640, 119.4790,23.3592]],
    ['PEN07','七美嶼','Cimei I.','七美嶼','PEN',[
     119.4200,23.1960, 119.4248,23.1936, 119.4304,23.1930, 119.4356,23.1948,
     119.4392,23.1986, 119.4406,23.2038, 119.4396,23.2092, 119.4364,23.2136,
     119.4314,23.2160, 119.4258,23.2160, 119.4208,23.2136, 119.4174,23.2094,
     119.4162,23.2040, 119.4174,23.1990]],
    ['PEN08','虎井嶼','Hujing I.','虎井嶼','PEN',[
     119.5080,23.5000,119.5140,23.4990,119.5190,23.5010,119.5200,23.5050,
     119.5160,23.5080,119.5100,23.5080,119.5060,23.5050]],
    ['PEN09','桶盤嶼','Tongpan I.','桶盤嶼','PEN',[
     119.5040,23.4830,119.5090,23.4820,119.5120,23.4850,119.5100,23.4890,
     119.5050,23.4890,119.5020,23.4860]],
    /* ── 宜蘭、臺東、屏東、基隆 屬島 ── */
    /* 龜山島: the turtle profile, head west and tail east, is its whole
       character; a rounded blob loses it. */
    ['ILA01','龜山島','Guishan I.','亀山島','ILA',[
     121.9280,24.8480,121.9350,24.8500,121.9420,24.8490,121.9470,24.8460,
     121.9500,24.8420,121.9560,24.8410,121.9620,24.8420,121.9660,24.8400,
     121.9630,24.8368,121.9560,24.8358,121.9500,24.8368,121.9450,24.8348,
     121.9390,24.8338,121.9320,24.8358,121.9280,24.8398,121.9262,24.8440]],
    ['TTT01','綠島','Lyudao','緑島','TTT',[
     121.4670,22.6520, 121.4720,22.6492, 121.4780,22.6478, 121.4844,22.6480,
     121.4902,22.6500, 121.4950,22.6536, 121.4984,22.6586, 121.5000,22.6644,
     121.4994,22.6702, 121.4966,22.6748, 121.4920,22.6780, 121.4862,22.6796,
     121.4800,22.6796, 121.4742,22.6778, 121.4696,22.6744, 121.4666,22.6696,
     121.4652,22.6640, 121.4656,22.6580]],
    ['TTT02','蘭嶼','Lanyu','蘭嶼','TTT',[
     121.5240,22.0140, 121.5320,22.0110, 121.5410,22.0110, 121.5492,22.0140,
     121.5560,22.0190, 121.5612,22.0260, 121.5640,22.0340, 121.5632,22.0420,
     121.5590,22.0490, 121.5530,22.0552, 121.5450,22.0590, 121.5360,22.0600,
     121.5282,22.0580, 121.5210,22.0532, 121.5152,22.0462, 121.5122,22.0380,
     121.5132,22.0290, 121.5172,22.0210]],
    ['TTT03','小蘭嶼','Little Lanyu','小蘭嶼','TTT',[
     121.5750,21.9550,121.5800,21.9540,121.5830,21.9570,121.5810,21.9610,
     121.5760,21.9610,121.5730,21.9580]],
    ['PIF01','小琉球（琉球嶼）','Liuqiu I.','小琉球','PIF',[
     120.3660,22.3268, 120.3722,22.3258, 120.3784,22.3266, 120.3838,22.3292,
     120.3878,22.3334, 120.3898,22.3388, 120.3896,22.3444, 120.3872,22.3494,
     120.3826,22.3532, 120.3766,22.3554, 120.3702,22.3556, 120.3644,22.3538,
     120.3598,22.3502, 120.3570,22.3452, 120.3562,22.3396, 120.3578,22.3340,
     120.3612,22.3296]],
    ['KEL01','基隆嶼','Keelung I.','基隆嶼','KEL',[
     121.7900,25.1900,121.7960,25.1910,121.7990,25.1940,121.7970,25.1980,
     121.7910,25.1990,121.7870,25.1960,121.7870,25.1920]],
    ['KEL02','彭佳嶼','Pengjia I.','彭佳嶼','KEL',[
     122.0740,25.6250,122.0810,25.6240,122.0860,25.6270,122.0870,25.6320,
     122.0830,25.6360,122.0770,25.6360,122.0730,25.6320,122.0720,25.6280]],
    ['KEL03','棉花嶼','Mianhua I.','綿花嶼','KEL',[
     122.0960,25.4800,122.1010,25.4790,122.1040,25.4820,122.1020,25.4860,
     122.0970,25.4860,122.0940,25.4830]],
    ['KEL04','花瓶嶼','Huaping I.','花瓶嶼','KEL',[
     122.0760,25.4290,122.0800,25.4280,122.0830,25.4310,122.0810,25.4340,
     122.0770,25.4340,122.0750,25.4310]],
    /* ── 金門縣 ── */
    /* Kinmen is a dog-bone: a broad north-east lobe (Jinsha and Jinhu) reaching
       toward the mainland at Mashan, a narrow waist at Anqi, a western lobe, the
       Guningtou peninsula pointing north-west, and Liaoluo Bay cut deep into the
       south coast. The earlier rounded outline lost all of that. */
    /* Kinmen, rebuilt around the features that give it its outline: the Guningtou
       peninsula at the north-west, the Mashan point at the north-east, Liaoluo Bay
       biting deep north into the south-east coast with the Liaoluo horn hanging
       south of it, and the Jincheng and Shuitou shore at the south-west. The
       narrowing behind the bay head is what makes the island read as a dog-bone
       rather than a lens. Hand-drawn without survey data; see the limitations note. */
    ['KIN01','金門本島','Kinmen I.','金門本島','KIN',[
     118.3095,24.4930, 118.3120,24.4985, 118.3190,24.5010, 118.3260,24.5005,
     118.3310,24.4965, 118.3340,24.4910, 118.3390,24.4880, 118.3460,24.4870,
     118.3530,24.4885, 118.3600,24.4905, 118.3670,24.4930, 118.3740,24.4955,
     118.3820,24.4975, 118.3900,24.4995, 118.3980,24.5015, 118.4060,24.5035,
     118.4140,24.5055, 118.4220,24.5070, 118.4300,24.5075, 118.4370,24.5060,
     118.4425,24.5020, 118.4462,24.4960, 118.4478,24.4890, 118.4472,24.4820,
     118.4445,24.4755, 118.4400,24.4700, 118.4345,24.4660, 118.4285,24.4635,
     118.4225,24.4625, 118.4275,24.4575, 118.4310,24.4515, 118.4320,24.4450,
     118.4280,24.4400, 118.4215,24.4375, 118.4150,24.4420, 118.4085,24.4470,
     118.4020,24.4505, 118.3955,24.4485, 118.3905,24.4435, 118.3870,24.4375,
     118.3840,24.4310, 118.3795,24.4255, 118.3735,24.4215, 118.3670,24.4190,
     118.3600,24.4180, 118.3530,24.4185, 118.3465,24.4205, 118.3410,24.4240,
     118.3370,24.4285, 118.3330,24.4250, 118.3280,24.4205, 118.3225,24.4170,
     118.3170,24.4145, 118.3115,24.4135, 118.3080,24.4175, 118.3070,24.4230,
     118.3085,24.4290, 118.3110,24.4350, 118.3125,24.4410, 118.3120,24.4470,
     118.3105,24.4530, 118.3090,24.4590, 118.3080,24.4650, 118.3075,24.4710,
     118.3078,24.4770, 118.3085,24.4830, 118.3090,24.4880]],
    ['KIN02','烈嶼（小金門）','Lieyu I.','烈嶼','KIN',[
     118.2280,24.4480, 118.2348,24.4502, 118.2420,24.4494, 118.2488,24.4462,
     118.2548,24.4420, 118.2596,24.4370, 118.2620,24.4310, 118.2604,24.4250,
     118.2554,24.4202, 118.2484,24.4172, 118.2412,24.4162, 118.2340,24.4180,
     118.2282,24.4220, 118.2242,24.4280, 118.2224,24.4350, 118.2242,24.4420]],
    ['KIN03','大膽島','Dadan I.','大胆島','KIN',[
     118.2020,24.4020,118.2060,24.4010,118.2090,24.4040,118.2070,24.4080,
     118.2030,24.4080,118.2000,24.4050]],
    ['KIN04','二膽島','Erdan I.','二胆島','KIN',[
     118.2100,24.3900,118.2140,24.3890,118.2160,24.3920,118.2140,24.3950,
     118.2100,24.3950,118.2080,24.3920]],
    ['KIN05','烏坵嶼','Wuqiu I.','烏坵嶼','KIN',[
     119.4480,24.9880,119.4530,24.9870,119.4570,24.9900,119.4550,24.9950,
     119.4490,24.9950,119.4450,24.9910]],
    /* ── 連江縣（馬祖列島） ── */
    /* Nangan runs east–west with Fu'ao inlet biting into the north-east shore and
       Magang at the western end; Beigan carries the Tanghou sand spit out to Houwo. */
    ['LIE01','南竿島','Nangan I.','南竿島','LIE',[
     119.9175,26.1520, 119.9210,26.1560, 119.9262,26.1582, 119.9322,26.1592,
     119.9380,26.1580, 119.9432,26.1602, 119.9482,26.1640, 119.9532,26.1672,
     119.9582,26.1690, 119.9640,26.1690, 119.9692,26.1660, 119.9720,26.1610,
     119.9710,26.1558, 119.9668,26.1520, 119.9610,26.1490, 119.9550,26.1470,
     119.9490,26.1452, 119.9430,26.1432, 119.9370,26.1422, 119.9310,26.1424,
     119.9250,26.1442, 119.9200,26.1472]],
    ['LIE02','北竿島','Beigan I.','北竿島','LIE',[
     119.9760,26.2200, 119.9820,26.2232, 119.9882,26.2252, 119.9942,26.2272,
     120.0002,26.2292, 120.0052,26.2320, 120.0072,26.2282, 120.0050,26.2240,
     120.0000,26.2210, 119.9950,26.2180, 119.9900,26.2150, 119.9850,26.2112,
     119.9800,26.2082, 119.9752,26.2072, 119.9720,26.2112, 119.9722,26.2162]],
    ['LIE03','高登島','Gaodeng I.','高登島','LIE',[
     119.9980,26.2440,120.0030,26.2430,120.0070,26.2460,120.0050,26.2510,
     120.0000,26.2520,119.9960,26.2480]],
    ['LIE04','亮島','Liangdao','亮島','LIE',[
     120.1440,26.1740,120.1480,26.1730,120.1520,26.1760,120.1500,26.1810,
     120.1450,26.1810,120.1410,26.1770]],
    ['LIE05','東引島','Dongyin I.','東引島','LIE',[
     120.4858,26.3624, 120.4906,26.3608, 120.4956,26.3616, 120.4996,26.3644,
     120.5020,26.3684, 120.5022,26.3730, 120.4998,26.3766, 120.4952,26.3784,
     120.4900,26.3782, 120.4858,26.3758, 120.4834,26.3718, 120.4834,26.3668]],
    ['LIE06','西引島','Xiyin I.','西引島','LIE',[
     120.4650,26.3690,120.4710,26.3680,120.4760,26.3710,120.4770,26.3760,
     120.4730,26.3800,120.4670,26.3800,120.4630,26.3760,120.4620,26.3720]],
    ['LIE07','東莒島','Dongju I.','東莒島','LIE',[
     119.9758,25.9584, 119.9804,25.9564, 119.9854,25.9570, 119.9892,25.9598,
     119.9912,25.9640, 119.9910,25.9686, 119.9884,25.9722, 119.9840,25.9740,
     119.9792,25.9736, 119.9752,25.9710, 119.9732,25.9668, 119.9736,25.9622]],
    ['LIE08','西莒島','Xiju I.','西莒島','LIE',[
     119.9376,25.9674, 119.9422,25.9654, 119.9472,25.9660, 119.9510,25.9688,
     119.9530,25.9730, 119.9528,25.9776, 119.9502,25.9812, 119.9458,25.9830,
     119.9410,25.9826, 119.9370,25.9800, 119.9350,25.9758, 119.9354,25.9712]]];

    /* ══════════════════════════════════════════════════════════════════════
       GAZETTEER OF PLACES

       Tier 1 shows at every scale; tiers 2 to 4 appear as the sheet is
       enlarged, so the map carries more names the closer it is read. Japanese
       readings use the Japanese orthography of the same characters.
       [zh, en, ja, lon, lat, tier]
       ══════════════════════════════════════════════════════════════════════ */
    const PLACE=[
    ['臺北','Taipei','台北',121.5637,25.0375,1],
    ['板橋','Banqiao','板橋',121.4628,25.0128,1],
    ['桃園','Taoyuan','桃園',121.3010,24.9930,1],
    ['臺中','Taichung','台中',120.6478,24.1401,1],
    ['臺南','Tainan','台南',120.2270,22.9910,1],
    ['高雄','Kaohsiung','高雄',120.3120,22.6270,1],
    ['基隆','Keelung','基隆',121.7420,25.1310,2],
    ['新竹','Hsinchu','新竹',120.9686,24.8020,2],
    ['竹北','Zhubei','竹北',121.0130,24.8270,2],
    ['苗栗','Miaoli','苗栗',120.8180,24.5600,2],
    ['彰化','Changhua','彰化',120.5410,24.0760,2],
    ['南投','Nantou','南投',120.6850,23.9130,2],
    ['斗六','Douliu','斗六',120.5310,23.7080,2],
    ['嘉義','Chiayi','嘉義',120.4520,23.4790,2],
    ['太保','Taibao','太保',120.3330,23.4590,2],
    ['屏東','Pingtung','屏東',120.4880,22.6690,2],
    ['宜蘭','Yilan','宜蘭',121.7530,24.7350,2],
    ['花蓮','Hualien','花蓮',121.6010,23.9910,2],
    ['臺東','Taitung','台東',121.1440,22.7550,2],
    ['馬公','Magong','馬公',119.5660,23.5710,2],
    ['金城','Jincheng','金城',118.3170,24.4330,2],
    ['南竿','Nangan','南竿',119.9500,26.1600,2],
    ['淡水','Tamsui','淡水',121.4400,25.1700,3],
    ['新莊','Xinzhuang','新荘',121.4500,25.0360,3],
    ['三重','Sanchong','三重',121.4900,25.0620,3],
    ['中和','Zhonghe','中和',121.4980,25.0000,3],
    ['新店','Xindian','新店',121.5410,24.9670,3],
    ['汐止','Xizhi','汐止',121.6420,25.0650,3],
    ['瑞芳','Ruifang','瑞芳',121.8100,25.1080,3],
    ['中壢','Zhongli','中壢',121.2250,24.9530,3],
    ['大溪','Daxi','大渓',121.2870,24.8800,3],
    ['楊梅','Yangmei','楊梅',121.1460,24.9080,3],
    ['頭份','Toufen','頭份',120.9060,24.6860,3],
    ['豐原','Fengyuan','豊原',120.7180,24.2540,3],
    ['大甲','Dajia','大甲',120.6250,24.3480,3],
    ['沙鹿','Shalu','沙鹿',120.5650,24.2340,3],
    ['員林','Yuanlin','員林',120.5750,23.9590,3],
    ['鹿港','Lugang','鹿港',120.4340,24.0570,3],
    ['草屯','Caotun','草屯',120.6800,23.9740,3],
    ['埔里','Puli','埔里',120.9640,23.9650,3],
    ['虎尾','Huwei','虎尾',120.4340,23.7080,3],
    ['北港','Beigang','北港',120.3020,23.5750,3],
    ['朴子','Puzi','朴子',120.2470,23.4650,3],
    ['新營','Xinying','新営',120.3160,23.3060,3],
    ['岡山','Gangshan','岡山',120.2960,22.7960,3],
    ['鳳山','Fengshan','鳳山',120.3560,22.6270,3],
    ['旗山','Qishan','旗山',120.4840,22.8880,3],
    ['潮州','Chaozhou','潮州',120.5430,22.5490,3],
    ['東港','Donggang','東港',120.4520,22.4670,3],
    ['恆春','Hengchun','恒春',120.7460,21.9950,3],
    ['羅東','Luodong','羅東',121.7660,24.6770,3],
    ['蘇澳','Su’ao','蘇澳',121.8420,24.5960,3],
    ['玉里','Yuli','玉里',121.3140,23.3350,3],
    ['關山','Guanshan','関山',121.1620,23.0470,3],
    ['成功','Chenggong','成功',121.3830,23.0980,3],
    ['金山','Jinshan','金山',121.6380,25.2230,4],
    ['萬里','Wanli','万里',121.6890,25.1780,4],
    ['貢寮','Gongliao','貢寮',121.9080,25.0230,4],
    ['坪林','Pinglin','坪林',121.7110,24.9370,4],
    ['烏來','Wulai','烏来',121.5500,24.8650,4],
    ['三峽','Sanxia','三峡',121.3690,24.9340,4],
    ['關西','Guanxi','関西',121.1770,24.7900,4],
    ['內灣','Neiwan','内湾',121.1830,24.7040,4],
    ['北埔','Beipu','北埔',121.0620,24.6970,4],
    ['南庄','Nanzhuang','南庄',120.9990,24.5980,4],
    ['大湖','Dahu','大湖',120.8630,24.4230,4],
    ['通霄','Tongxiao','通霄',120.6790,24.4900,4],
    ['苑裡','Yuanli','苑裡',120.6510,24.4370,4],
    ['東勢','Dongshi','東勢',120.8280,24.2580,4],
    ['谷關','Guguan','谷関',120.9920,24.1830,4],
    ['梨山','Lishan','梨山',121.2620,24.2540,4],
    ['二林','Erlin','二林',120.3740,23.8990,4],
    ['西螺','Xiluo','西螺',120.4650,23.7980,4],
    ['斗南','Dounan','斗南',120.4780,23.6790,4],
    ['竹山','Zhushan','竹山',120.6780,23.7560,4],
    ['集集','Jiji','集集',120.7830,23.8280,4],
    ['水里','Shuili','水里',120.8560,23.8130,4],
    ['阿里山','Alishan','阿里山',120.8030,23.5100,4],
    ['布袋','Budai','布袋',120.1670,23.3790,4],
    ['白河','Baihe','白河',120.4150,23.3510,4],
    ['玉井','Yujing','玉井',120.4620,23.1240,4],
    ['美濃','Meinong','美濃',120.5410,22.8890,4],
    ['甲仙','Jiaxian','甲仙',120.5910,23.0850,4],
    ['茂林','Maolin','茂林',120.6580,22.8880,4],
    ['林邊','Linbian','林辺',120.5150,22.4340,4],
    ['枋寮','Fangliao','枋寮',120.5940,22.3660,4],
    ['車城','Checheng','車城',120.7080,22.0730,4],
    ['滿州','Manzhou','満州',120.8380,22.0230,4],
    ['頭城','Toucheng','頭城',121.8230,24.8580,4],
    ['礁溪','Jiaoxi','礁渓',121.7760,24.8280,4],
    ['南澳','Nan’ao','南澳',121.7990,24.4650,4],
    ['新城','Xincheng','新城',121.6410,24.1290,4],
    ['光復','Guangfu','光復',121.4230,23.6690,4],
    ['瑞穗','Ruisui','瑞穂',121.3760,23.4960,4],
    ['池上','Chishang','池上',121.2160,23.1230,4],
    ['鹿野','Luye','鹿野',121.1330,22.9130,4],
    ['知本','Zhiben','知本',121.0630,22.6890,4],
    ['太麻里','Taimali','太麻里',121.0080,22.6100,4],
    ['綠島','Lyudao','緑島',121.4930,22.6650,4],
    ['蘭嶼','Lanyu','蘭嶼',121.5340,22.0410,4],
    ['小琉球','Liuqiu','小琉球',120.3690,22.3390,4],
    ['七美','Cimei','七美',119.4270,23.2060,4],
    ['望安','Wang’an','望安',119.5010,23.3570,4],
    ['白沙','Baisha','白沙',119.6010,23.6600,4],
    ['西嶼','Xiyu','西嶼',119.5060,23.5960,4],
    ['烈嶼','Lieyu','烈嶼',118.2410,24.4340,4],
    ['金湖','Jinhu','金湖',118.4180,24.4400,4],
    ['金沙','Jinsha','金沙',118.4290,24.4870,4],
    ['北竿','Beigan','北竿',119.9930,26.2210,4],
    ['東引','Dongyin','東引',120.4930,26.3690,4],
    ['東莒','Dongju','東莒',119.9820,25.9650,4],
    ['西莒','Xiju','西莒',119.9440,25.9740,4]];

    const SPINE=[
    ['中央山脈','Central Range',0.30,[
     121.440,24.360,3742, 121.380,24.280,3600, 121.320,24.200,3450,
     121.280,24.140,3417, 121.260,24.060,3300, 121.250,23.980,3262,
     121.200,23.880,3300, 121.150,23.780,3400, 121.100,23.660,3500,
     121.060,23.550,3700, 121.040,23.490,3805, 121.000,23.400,3600,
     120.960,23.320,3500, 120.940,23.240,3668, 120.900,23.120,3400,
     120.860,23.000,3200, 120.820,22.880,3000, 120.780,22.760,2900,
     120.760,22.640,3092, 120.780,22.520,2400, 120.800,22.400,1800,
     120.820,22.300,1150, 120.840,22.200,760, 120.820,22.100,470,
     120.790,22.000,280]],
    ['雪山山脈','Xueshan Range',0.22,[
     121.620,24.560,1200, 121.540,24.520,1900, 121.440,24.470,2500,
     121.330,24.420,3050, 121.230,24.385,3886, 121.130,24.330,3300,
     121.030,24.270,2700, 120.940,24.220,2100, 120.870,24.180,1500,
     120.800,24.130,950]],
    ['玉山山脈','Yushan Range',0.13,[
     120.957,23.470,3952, 120.940,23.400,3600, 120.920,23.320,3180,
     120.900,23.240,2780, 120.880,23.160,2380, 120.860,23.080,1950]],
    ['阿里山山脈','Alishan Range',0.15,[
     120.880,23.660,1750, 120.840,23.580,2280, 120.800,23.500,2620,
     120.760,23.420,2480, 120.720,23.340,2050, 120.680,23.260,1600,
     120.640,23.180,1150, 120.610,23.100,780]],
    ['加里山山脈','Jiali Range',0.115,[
     121.180,24.780,1050, 121.100,24.700,1380, 121.020,24.620,1650,
     120.960,24.540,1880, 120.900,24.460,2050, 120.860,24.380,1560]],
    ['海岸山脈','Coastal Range',0.075,[
     121.600,23.900,620, 121.560,23.800,880, 121.520,23.680,1180,
     121.480,23.560,1460, 121.440,23.440,1682, 121.380,23.300,1480,
     121.320,23.160,1280, 121.260,23.020,1060, 121.200,22.900,860,
     121.160,22.820,560]],
    ['大屯火山群','Datun Volcano Group',0.055,[
     121.520,25.180,900, 121.560,25.160,1120, 121.600,25.140,850]],
    ['西部丘陵','Western Hills',0.085,[
     121.150,24.900,210, 121.050,24.780,280, 120.960,24.660,350,
     120.900,24.520,380, 120.840,24.320,290, 120.720,24.080,240,
     120.640,23.900,210, 120.560,23.700,190, 120.480,23.480,170,
     120.420,23.260,145, 120.400,23.060,130]],
    ['恆春丘陵','Hengchun Hills',0.055,[
     120.800,22.060,320, 120.810,21.970,240, 120.790,21.930,150]]];
    const COURSE=[
    ['濁水溪','Zhuoshui',[121.250,24.140,121.140,24.050,121.020,23.980,
     120.900,23.930,120.780,23.900,120.660,23.878,120.540,23.862,
     120.420,23.850,120.320,23.844,120.235,23.8425]],
    ['高屏溪','Gaoping',[120.900,23.180,120.830,23.060,120.760,22.940,
     120.680,22.830,120.600,22.740,120.540,22.660,120.500,22.580,
     120.462,22.510,120.4285,22.4805]],
    ['淡水河','Tamsui',[121.560,24.900,121.520,24.960,121.480,25.020,
     121.450,25.080,121.430,25.130,121.420,25.165,121.4085,25.1855]],
    ['大甲溪','Dajia',[121.280,24.220,121.180,24.230,121.060,24.230,
     120.940,24.240,120.820,24.250,120.700,24.270,120.610,24.290,
     120.539,24.3175]],
    ['曾文溪','Zengwen',[120.680,23.290,120.580,23.250,120.470,23.200,
     120.360,23.150,120.260,23.110,120.170,23.085,120.0755,23.0665]],
    ['大肚溪','Dadu',[120.980,24.040,120.880,24.060,120.780,24.080,
     120.680,24.110,120.590,24.140,120.530,24.158,120.490,24.1665]],
    ['秀姑巒溪','Xiuguluan',[121.180,23.560,121.250,23.520,121.320,23.500,
     121.390,23.480,121.450,23.474,121.487,23.4700]],
    ['卑南溪','Beinan',[121.020,23.100,121.060,23.020,121.100,22.950,
     121.140,22.880,121.170,22.840,121.1935,22.8010]],
    ['蘭陽溪','Lanyang',[121.480,24.560,121.560,24.600,121.640,24.640,
     121.720,24.670,121.790,24.700,121.832,24.7180]],
    ['花蓮溪','Hualien',[121.320,23.660,121.400,23.720,121.480,23.790,
     121.540,23.860,121.580,23.910,121.612,23.9450]],
    ['北港溪','Beigang',[120.560,23.640,120.470,23.600,120.380,23.570,
     120.290,23.545,120.210,23.530,120.149,23.5210]],
    ['八掌溪','Bazhang',[120.620,23.400,120.520,23.370,120.420,23.345,
     120.320,23.330,120.220,23.320,120.120,23.3130]],
    ['頭前溪','Touqian',[121.220,24.720,121.140,24.760,121.060,24.800,
     120.990,24.830,120.950,24.845,120.918,24.8512]],
    ['後龍溪','Houlong',[120.980,24.500,120.900,24.540,120.830,24.570,
     120.790,24.600,120.748,24.6210]],
    ['和平溪','Heping',[121.480,24.352,121.560,24.348,121.640,24.326,
     121.700,24.316,121.7565,24.3050]]];
    const PEAKPT=[
     ['玉山','Yushan',120.957,23.470,3952],
     ['雪山','Xueshan',121.230,24.385,3886],
     ['秀姑巒山','Xiuguluan',121.045,23.487,3805],
     ['南湖大山','Nanhu',121.438,24.362,3742],
     ['關山','Guanshan',120.918,23.213,3668],
     ['合歡山','Hehuan',121.281,24.142,3417],
     ['北大武山','Beidawu',120.760,22.620,3092],
     ['新港山','Xingang',121.436,23.443,1682],
     ['七星山','Qixing',121.561,25.176,1120]];
    const WATERB=[
     ['日月潭','Sun Moon Lake',120.915,23.858,0.034],
     ['曾文水庫','Zengwen Res.',120.560,23.290,0.030],
     ['翡翠水庫','Feitsui Res.',121.585,24.905,0.022],
     ['石門水庫','Shimen Res.',121.245,24.808,0.021],
     ['德基水庫','Deji Res.',121.170,24.256,0.017],
     ['烏山頭水庫','Wushantou',120.412,23.198,0.021],
     ['鯉魚潭','Liyu Pond',121.510,23.930,0.012],
     ['蘭潭','Lantan',120.492,23.470,0.010]];
    const PARKP=[
    ['墾丁','Kenting',[120.740,22.070,120.800,22.080,120.860,22.060,120.880,22.000,
     120.870,21.930,120.840,21.900,120.790,21.905,120.750,21.930,120.735,21.990]],
    ['玉山','Yushan',[120.820,23.600,120.940,23.620,121.060,23.580,121.120,23.480,
     121.100,23.360,121.020,23.280,120.900,23.270,120.800,23.330,120.760,23.440,
     120.780,23.540]],
    ['陽明山','Yangmingshan',[121.500,25.220,121.560,25.230,121.610,25.210,
     121.620,25.160,121.590,25.130,121.530,25.130,121.495,25.170]],
    ['太魯閣','Taroko',[121.240,24.300,121.360,24.320,121.470,24.280,121.560,24.220,
     121.600,24.140,121.560,24.060,121.460,24.020,121.340,24.060,121.250,24.140,
     121.215,24.220]],
    ['雪霸','Shei-Pa',[121.060,24.480,121.180,24.500,121.290,24.470,121.330,24.390,
     121.290,24.300,121.180,24.270,121.080,24.300,121.030,24.390]],
    ['金門','Kinmen',[]],
    ['東沙環礁','Dongsha Atoll',[]],
    ['台江','Taijiang',[120.040,23.180,120.110,23.190,120.150,23.140,120.150,23.060,
     120.110,23.010,120.060,23.030,120.035,23.100]],
    ['澎湖南方四島','South Penghu',[]],
    ['壽山','Shoushan',[120.255,22.660,120.285,22.665,120.300,22.640,120.295,22.605,
     120.270,22.590,120.250,22.610]]];
    /* SEAT removed: every seat is already carried in the PLACE gazetteer. */
    const FAULT=[
    ['車籠埔斷層','Chelungpu',[120.700,24.180,120.690,24.060,120.680,23.940,
     120.660,23.820,120.640,23.700]],
    ['梅山斷層','Meishan',[120.480,23.560,120.560,23.565,120.640,23.570]],
    ['新化斷層','Xinhua',[120.290,23.030,120.360,23.035,120.430,23.040]],
    ['米崙斷層','Milun',[121.610,24.020,121.615,23.960,121.618,23.900]],
    ['縱谷斷層','Longitudinal Valley',[121.440,23.420,121.380,23.280,121.320,23.140,
     121.260,23.000,121.200,22.880,121.170,22.800]],
    ['大屯山彙','Datun',[121.500,25.200,121.560,25.185,121.610,25.170]]];
    const ANCH={
     TPE:[121.560,25.075,30,-14],NTP:[121.700,24.900,34,4],
     KEL:[121.750,25.125,44,-24],TYC:[121.230,24.960,-46,6],
     HSQ:[121.130,24.720,-44,2],HSC:[120.930,24.800,-48,12],
     MIA:[120.850,24.560,-46,4],TXG:[120.880,24.260,-48,0],
     CHA:[120.480,23.960,-46,8],NAN:[120.950,23.870,12,-16],
     YUN:[120.350,23.700,-46,4],CYQ:[120.330,23.420,-46,2],
     CYI:[120.452,23.483,28,-18],TNN:[120.320,23.150,-46,4],
     KHH:[120.560,22.900,-16,22],PIF:[120.640,22.600,26,12],
     ILA:[121.680,24.720,40,0],HUA:[121.380,23.780,40,0],
     TTT:[121.050,22.850,40,0],PEN:[119.590,23.570,-40,10]};
    const DIV=[
    {id:'TPE',zh:'臺北市',en:'Taipei City',rom:'Taipei',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'信義區',seatEn:'Xinyi Dist.',pop:2430886,hh:1082334,area:271.80,sub:'12區',subEn:'12 districts',subN:12,
     nZh:'中華民國首都。民國56年7月1日升格為直轄市，為首個院轄市。人口密度居一級行政區之首，為政治、金融與傳播中樞。',
     nEn:'Capital of the Republic of China. Raised to special municipality on 1 July 1967, the first to be so designated. The densest first-level division and the seat of national government.',
     hZh:['總統府、行政院、立法院所在','故宮博物院、中正紀念堂','陽明山國家公園一部（大屯火山群）'],
     hEn:['Presidential Office, Executive Yuan, Legislative Yuan','National Palace Museum','Part of Yangmingshan National Park (Datun volcano group)']},
    {id:'NTP',zh:'新北市',en:'New Taipei City',rom:'Xinbei',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'板橋區',seatEn:'Banqiao Dist.',pop:4042413,hh:1795059,area:2052.57,sub:'29區',subEn:'29 districts',subN:29,
     nZh:'民國99年12月25日由臺北縣改制。人口全國第一，環抱臺北市與基隆市，地形自北海岸延伸至雪山山脈北段。',
     nEn:'Reorganised from Taipei County on 25 December 2010. The most populous division; it encircles both Taipei City and Keelung City and reaches from the north coast into the Xueshan Range.',
     hZh:['富貴角為本島極北點','三貂角為本島極東點','烏來、平溪、九份等山區聚落'],
     hEn:['Cape Fugui, northernmost point of the main island','Cape Sandiao, easternmost point of the main island','Mountain settlements at Wulai, Pingxi and Jiufen']},
    {id:'TYC',zh:'桃園市',en:'Taoyuan City',rom:'Taoyuan',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'桃園區',seatEn:'Taoyuan Dist.',pop:2356734,hh:999041,area:1220.95,sub:'13區',subEn:'13 districts',subN:13,
     nZh:'民國103年12月25日由桃園縣改制，為最晚成立之直轄市。臺地上埤塘密布，為清代以來灌溉遺制。近年為六都中人口增幅最顯著者。',
     nEn:'Reorganised from Taoyuan County on 25 December 2014, the most recent municipality. Its terraces are studded with irrigation ponds inherited from the Qing period. In recent years the fastest-growing of the six municipalities.',
     hZh:['臺灣桃園國際機場','石門水庫（民國53年完工）','復興區為泰雅族傳統領域'],
     hEn:['Taiwan Taoyuan International Airport','Shihmen Reservoir, completed 1964','Fuxing District, Atayal traditional territory']},
    {id:'TXG',zh:'臺中市',en:'Taichung City',rom:'Taizhong',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'西屯區',seatEn:'Xitun Dist.',pop:2869089,hh:1176023,area:2214.90,sub:'29區',subEn:'29 districts',subN:29,
     nZh:'民國99年12月25日臺中縣市合併改制。轄域自臺中盆地跨至中央山脈主脊，和平區面積達1,038平方公里，為全國最大之市轄區。',
     nEn:'Formed by the merger of Taichung County and City on 25 December 2010. It runs from the Taichung Basin to the crest of the Central Range; Heping District alone covers 1,038 km², the largest district in the country.',
     hZh:['雪山（3,886公尺）為第二高峰','大甲溪梯級水力開發','雪霸國家公園一部'],
     hEn:['Xueshan, 3,886 m, the second-highest summit','The cascade hydro scheme on the Dajia River','Part of Shei-Pa National Park']},
    {id:'TNN',zh:'臺南市',en:'Tainan City',rom:'Tainan',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'安平區',seatEn:'Anping Dist.',pop:1850624,hh:780357,area:2191.65,sub:'37區',subEn:'37 districts',subN:37,
     nZh:'民國99年12月25日臺南縣市合併改制。清康熙23年（1684）設臺灣府於此，為全臺最早之行政中心，府城舊制猶存於街廓。',
     nEn:'Formed by the merger of Tainan County and City on 25 December 2010. Taiwan Prefecture was established here in 1684, making it the island’s earliest administrative centre; the old walled-city plan survives in the street pattern.',
     hZh:['赤崁樓、億載金城、孔廟','國聖港燈塔為本島極西點','台江國家公園、七股潟湖'],
     hEn:['Chihkan Tower, Eternal Golden Castle, Confucius Temple','Guosheng Lighthouse, westernmost point of the main island','Taijiang National Park and the Qigu lagoon']},
    {id:'KHH',zh:'高雄市',en:'Kaohsiung City',rom:'Gaoxiong',type:'muni',prov:'直轄',provEn:'Municipality',
     seat:'苓雅區',seatEn:'Lingya Dist.',pop:2714509,hh:1214090,area:2951.85,sub:'38區',subEn:'38 districts',subN:38,
     nZh:'民國68年7月1日升格直轄市，99年12月25日與高雄縣合併。面積為六都之首。南海東沙群島與南沙群島由旗津區代管。',
     nEn:'Raised to special municipality on 1 July 1979 and merged with Kaohsiung County on 25 December 2010. The largest of the six by area. The Dongsha and Nansha groups in the South China Sea are administered through Qijin District.',
     hZh:['高雄港為全國第一大港','壽山國家自然公園（唯一一座）','太平島為實際管轄之極南點'],
     hEn:['Kaohsiung Harbour, the principal port','Shoushan National Nature Park, the only one of its kind','Taiping Island, southernmost point under effective control']},
    {id:'ILA',zh:'宜蘭縣',en:'Yilan County',rom:'Yilan',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'宜蘭市',seatEn:'Yilan City',pop:448809,hh:194505,area:2143.63,sub:'1市3鎮8鄉',subEn:'1 city, 3 towns, 8 townships',subN:12,
     nZh:'蘭陽平原為蘭陽溪沖積扇。清嘉慶元年（1796）吳沙率眾入墾頭圍，為漢人開蘭之始。東北季風盛行，冬雨綿長。',
     nEn:'The Lanyang Plain is the alluvial fan of the Lanyang River. Wu Sha led the first Han settlement at Touwei in 1796. The northeast monsoon brings a long, wet winter.',
     hZh:['龜山島（頭城鎮）為安山岩活火山島','太平山、翠峰湖','礁溪為平地碳酸氫鈉泉'],
     hEn:['Gueishan Island, an andesitic active volcano','Taipingshan and Cueifong Lake','Jiaoxi, a lowland sodium bicarbonate spring']},
    {id:'HSQ',zh:'新竹縣',en:'Hsinchu County',rom:'Xinzhu',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'竹北市',seatEn:'Zhubei City',pop:597316,hh:242947,area:1427.54,sub:'1市3鎮9鄉',subEn:'1 city, 3 towns, 9 townships',subN:13,
     nZh:'縣治竹北市。轄尖石、五峰二山地鄉，境內大霸尖山為淡水河與大安溪分水嶺。為六都以外人口成長最快之縣。',
     nEn:'Seat at Zhubei. Includes the mountain townships of Jianshi and Wufeng; Dabajianshan within its bounds divides the Tamsui and Da’an basins. The fastest-growing county outside the six municipalities.',
     hZh:['大霸尖山（3,492公尺）為三尖之一','內灣、北埔客家聚落','雪霸國家公園一部'],
     hEn:['Dabajianshan, 3,492 m, one of the Three Spires','Hakka settlements at Neiwan and Beipu','Part of Shei-Pa National Park']},
    {id:'MIA',zh:'苗栗縣',en:'Miaoli County',rom:'Miaoli',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'苗栗市',seatEn:'Miaoli City',pop:530337,hh:213353,area:1820.31,sub:'2市5鎮11鄉',subEn:'2 cities, 5 towns, 11 townships',subN:18,
     nZh:'客家人口比例全國最高，通行四縣腔。地形以丘陵臺地為主，出磺坑為亞洲最早開採之油田之一（清同治年間）。',
     nEn:'The highest proportion of Hakka population of any division, with the Sixian dialect prevailing. Chiefly hills and terraces; the Chuhuangkeng field was among the earliest oil workings in Asia, dating from the 1860s.',
     hZh:['雪霸國家公園一部（雪山西稜）','後龍、通霄沿海風力機群','南庄、大湖山區'],
     hEn:['Part of Shei-Pa National Park along the west ridge of Xueshan','Coastal wind turbines at Houlong and Tongxiao','The uplands of Nanzhuang and Dahu']},
    {id:'CHA',zh:'彰化縣',en:'Changhua County',rom:'Zhanghua',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'彰化市',seatEn:'Changhua City',pop:1206458,hh:445680,area:1074.40,sub:'2市6鎮18鄉',subEn:'2 cities, 6 towns, 18 townships',subN:26,
     nZh:'人口為全國各縣之首。全境為彰化平原與八卦臺地。鹿港為清代「一府二鹿三艋舺」之二鹿，港埠淤廢後市街格局得以保存。',
     nEn:'The most populous county. Wholly composed of the Changhua Plain and the Bagua Terrace. Lugang was the second of the three great Qing ports; the silting of its harbour preserved the old street plan.',
     hZh:['鹿港龍山寺、天后宮','八卦山大佛與臺地','溪湖、二林為蔗糖舊業區'],
     hEn:['Longshan and Tianhou temples at Lugang','The Great Buddha and terrace at Bagua Hill','Xihu and Erlin, former sugar districts']},
    {id:'NAN',zh:'南投縣',en:'Nantou County',rom:'Nantou',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'南投市',seatEn:'Nantou City',pop:467402,hh:190152,area:4106.44,sub:'1市4鎮8鄉',subEn:'1 city, 4 towns, 8 townships',subN:13,
     nZh:'唯一不臨海之縣，面積居第二。境內含中央山脈主脊、玉山主峰之一部與日月潭。民國88年九二一大地震震央在集集鎮。',
     nEn:'The only landlocked county and the second largest by area. It contains the crest of the Central Range, part of the summit of Yushan, and Sun Moon Lake. The epicentre of the 1999 Jiji earthquake lay within it.',
     hZh:['日月潭為最大天然湖泊','合歡山、埔里盆地','邵族（民國90年認定）傳統領域'],
     hEn:['Sun Moon Lake, the largest natural lake','Hehuanshan and the Puli Basin','Traditional territory of the Thao, recognised 2001']},
    {id:'YUN',zh:'雲林縣',en:'Yunlin County',rom:'Yunlin',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'斗六市',seatEn:'Douliu City',pop:648895,hh:262888,area:1290.83,sub:'1市5鎮14鄉',subEn:'1 city, 5 towns, 14 townships',subN:20,
     nZh:'濁水溪沖積平原，農業產值長期居全國前列。北港朝天宮為媽祖信仰重鎮，香期遶境為臺灣規模最大之民俗活動之一。',
     nEn:'The alluvial plain of the Zhuoshui River; long among the leading counties by agricultural output. Chaotian Temple at Beigang is a principal centre of Mazu worship, and its processions among the largest folk observances on the island.',
     hZh:['濁水溪為全臺最長河川（186.6公里）','西螺大橋、虎尾糖廠','口湖、四湖沿海養殖'],
     hEn:['The Zhuoshui, longest river at 186.6 km','Xiluo Bridge and the Huwei sugar refinery','Coastal aquaculture at Kouhu and Sihu']},
    {id:'CYQ',zh:'嘉義縣',en:'Chiayi County',rom:'Jiayi',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'太保市',seatEn:'Taibao City',pop:471726,hh:195575,area:1903.64,sub:'2市2鎮14鄉',subEn:'2 cities, 2 towns, 14 townships',subN:18,
     nZh:'環繞嘉義市。轄阿里山鄉，玉山主峰之一部屬本縣。北回歸線經水上鄉，光緒34年（1908）於此立標，現為第六代。',
     nEn:'Encircles Chiayi City. Includes Alishan Township, and part of the summit of Yushan. The Tropic of Cancer crosses Shuishang, where a marker was first raised in 1908; the present monument is the sixth.',
     hZh:['阿里山森林鐵路（1912年通車）','東石、布袋為西南沿海要港','玉山國家公園一部'],
     hEn:['The Alishan Forest Railway, opened 1912','Dongshi and Budai, principal southwestern ports','Part of Yushan National Park']},
    {id:'PIF',zh:'屏東縣',en:'Pingtung County',rom:'Pingdong',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'屏東市',seatEn:'Pingtung City',pop:780365,hh:314168,area:2775.60,sub:'1市3鎮29鄉',subEn:'1 city, 3 towns, 29 townships',subN:33,
     nZh:'最南之縣，轄鄉數為全國最多。恆春半島與墾丁國家公園在境內，鵝鑾鼻為本島極南點。排灣族、魯凱族傳統領域。',
     nEn:'The southernmost county, with more townships than any other. It contains the Hengchun Peninsula and Kenting National Park; Cape Eluanbi is the southernmost point of the main island. Traditional territory of the Paiwan and Rukai.',
     hZh:['墾丁國家公園（民國73年，首座）','鵝鑾鼻燈塔、恆春古城','小琉球（琉球嶼）為珊瑚礁島'],
     hEn:['Kenting National Park, 1984, the first designated','Eluanbi Lighthouse and the Hengchun walled town','Lyuqiu Island, a raised coral platform']},
    {id:'TTT',zh:'臺東縣',en:'Taitung County',rom:'Taidong',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'臺東市',seatEn:'Taitung City',pop:208003,hh:87983,area:3515.25,sub:'1市2鎮13鄉',subEn:'1 city, 2 towns, 13 townships',subN:16,
     nZh:'花東縱谷南段與海岸山脈南段。原住民人口比例全國最高。綠島、蘭嶼屬本縣，蘭嶼為達悟族（雅美族）世居之地。',
     nEn:'The southern reach of the Huadong Valley and the Coastal Range. The highest proportion of indigenous population of any division. Lyudao and Lanyu belong to the county, the latter the ancestral home of the Tao.',
     hZh:['嘉明湖（海拔3,310公尺）','綠島朝日溫泉為海底溫泉','卑南遺址為新石器時代大型聚落'],
     hEn:['Jiaming Lake at 3,310 m','Zhaori hot spring on Lyudao, a saltwater seabed spring','The Beinan site, a major Neolithic settlement']},
    {id:'HUA',zh:'花蓮縣',en:'Hualien County',rom:'Hualian',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'花蓮市',seatEn:'Hualien City',pop:311842,hh:134048,area:4628.57,sub:'1市2鎮10鄉',subEn:'1 city, 2 towns, 10 townships',subN:13,
     nZh:'面積為全國縣市之首。中央山脈東翼陡降入海，形成清水斷崖。太魯閣峽谷為立霧溪下切大理岩所成。民國113年4月3日地震重創山區道路。',
     nEn:'The largest division by area. The eastern flank of the Central Range plunges to the sea at the Qingshui Cliffs. The Taroko Gorge was cut by the Liwu River through marble. The earthquake of 3 April 2024 severely damaged mountain roads.',
     hZh:['秀姑巒山（3,825公尺）為第三高峰','秀姑巒溪為唯一橫切海岸山脈之河','太魯閣國家公園'],
     hEn:['Siouguluanshan, 3,825 m, the third-highest summit','The Siouguluan, the only river to cut through the Coastal Range','Taroko National Park']},
    {id:'PEN',zh:'澎湖縣',en:'Penghu County',rom:'Penghu',type:'county',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'馬公市',seatEn:'Magong City',pop:106567,hh:45093,area:126.86,sub:'1市5鄉',subEn:'1 city, 5 townships',subN:6,
     nZh:'由九十座島嶼組成，玄武岩柱狀節理為代表地景。天啟二年（1622）荷蘭人曾據，康熙22年（1683）施琅由此進兵臺灣。',
     nEn:'Ninety islands, characterised by columnar basalt. The Dutch occupied the group in 1622, and in 1683 Shi Lang launched his campaign against Taiwan from here.',
     hZh:['澎湖天后宮為全臺最早媽祖廟','澎湖南方四島國家公園','跨海大橋連通白沙與西嶼'],
     hEn:['Tianhou Temple, the oldest Mazu temple in Taiwan','South Penghu Marine National Park','The Trans-Ocean Bridge linking Baisha and Xiyu']},
    {id:'KEL',zh:'基隆市',en:'Keelung City',rom:'Jilong',type:'city',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'中正區',seatEn:'Zhongzheng Dist.',pop:359132,hh:168741,area:132.76,sub:'7區',subEn:'7 districts',subN:7,
     nZh:'臺灣省轄市。天然深水港，為北部門戶。北方三島（彭佳嶼、棉花嶼、花瓶嶼）屬中正區，棉花嶼為實際管轄之極東點。',
     nEn:'A provincial city of Taiwan Province. Its natural deep-water harbour is the northern gateway. The three northern islets, Pengjia, Mianhua and Huaping, belong to Zhongzheng District; Mianhua is the easternmost point under effective control.',
     hZh:['基隆港、和平島','年降水日數為全國最多','二沙灣砲臺（海門天險）'],
     hEn:['Keelung Harbour and Heping Island','More rainy days per year than any other division','The Ershawan Battery, "Haimen Tianxian"']},
    {id:'HSC',zh:'新竹市',en:'Hsinchu City',rom:'Xinzhu',type:'city',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'北區',seatEn:'North Dist.',pop:455843,hh:189836,area:104.15,sub:'3區',subEn:'3 districts',subN:3,
     nZh:'臺灣省轄市。清代淡水廳治，道光年間築石城，東門迎曦門猶存。民國69年設立新竹科學園區，為半導體產業核心。',
     nEn:'A provincial city. Seat of Tamsui Subprefecture under the Qing; the stone wall raised in the Daoguang era survives at the East Gate, Yingxi. The Hsinchu Science Park, established 1980, is the core of the semiconductor industry.',
     hZh:['東門迎曦門（道光9年，1829）','新竹科學園區','風城之名源於秋冬強勁季風'],
     hEn:['Yingxi East Gate, 1829','Hsinchu Science Park','Known as the "windy city" for its strong monsoon']},
    {id:'CYI',zh:'嘉義市',en:'Chiayi City',rom:'Jiayi',type:'city',prov:'臺灣省',provEn:'Taiwan Prov.',
     seat:'東區',seatEn:'East Dist.',pop:261551,hh:109200,area:60.03,sub:'2區',subEn:'2 districts',subN:2,
     nZh:'臺灣省轄市，面積最小之一級行政區。清代諸羅縣治，康熙43年（1704）築木柵城，為全臺首見。乾隆52年因軍民守城有功，敕改「嘉義」。',
     nEn:'A provincial city and the smallest first-level division. Seat of Zhuluo County under the Qing; a palisade was raised in 1704, the earliest on the island. In 1787 the Qianlong Emperor renamed it Chiayi, "commending the righteous", for its defence during a rebellion.',
     hZh:['市徽取城形，紀念諸羅古城','阿里山森林鐵路起點','檜意森活村為日治林業官舍群'],
     hEn:['The city emblem takes the form of the old wall','Terminus of the Alishan Forest Railway','Hinoki Village, Japanese-period forestry quarters']},
    {id:'KIN',zh:'金門縣',en:'Kinmen County',rom:'Jinmen',type:'fukien',prov:'福建省',provEn:'Fuchien Prov.',
     seat:'金城鎮',seatEn:'Jincheng Town',pop:138438,hh:46926,area:151.66,sub:'3鎮3鄉',subEn:'3 towns, 3 townships',subN:6,
     nZh:'福建省轄縣。明洪武20年（1387）築城，取「固若金湯，雄鎮海門」之義。民國38年古寧頭戰役、47年八二三砲戰主戰場。烏坵鄉由本縣代管。',
     nEn:'A county of Fuchien Province. Fortified in 1387; its name means "as solid as metal and boiling moat, guarding the sea gate". Principal battleground of Guningtou in 1949 and of the artillery bombardment of 1958. Wuqiu Township is administered from here.',
     hZh:['金門國家公園為首座戰地史蹟主題者','閩南傳統聚落與洋樓','大膽島一帶為實際管轄之極西點'],
     hEn:['Kinmen National Park, the first devoted to battlefield heritage','Southern Min villages and overseas-Chinese mansions','Dadan, westernmost point under effective control']},
    {id:'LIE',zh:'連江縣',en:'Lienchiang County',rom:'Lianjiang',type:'fukien',prov:'福建省',provEn:'Fuchien Prov.',
     seat:'南竿鄉',seatEn:'Nangan Township',pop:13629,hh:4099,area:28.80,sub:'4鄉',subEn:'4 townships',subN:4,
     nZh:'福建省轄縣，即馬祖列島。人口與面積均為全國最少。縣治南竿鄉。東引鄉為實際管轄之極北點。通行閩東語（福州話）馬祖方言。',
     nEn:'A county of Fuchien Province, comprising the Matsu Islands. The smallest division by both population and area. Seat at Nangan. Dongyin Township is the northernmost point under effective control. Eastern Min, the Matsu dialect, prevails.',
     hZh:['北竿芹壁為閩東石屋聚落','東引燈塔（清光緒30年，1904）','藍眼淚為夜光藻季節性現象'],
     hEn:['Qinbi on Beigan, a village of Eastern Min stone houses','Dongyin Lighthouse, 1904','The "blue tears", a seasonal dinoflagellate bloom']}
    ];
    const NJA={
    TPE:'中華民国の首府。民国56年（1967年）7月1日に直轄市へ昇格し、院轄市の第一号となった。人口密度は第一級行政区で最も高く、政治・金融・放送の中枢である。',
    NTP:'民国99年（2010年）12月25日に台北県から改編。人口は全国第一位で、台北市と基隆市を取り囲み、北海岸から雪山山脈北部まで広がる。',
    TYC:'民国103年（2014年）12月25日に桃園県から改編、最も新しい直轄市。台地には清代以来の灌漑用の池が数多く残る。近年は六都のうち最も人口増加が著しい。',
    TXG:'民国99年（2010年）12月25日に台中県市が合併して成立。台中盆地から中央山脈の主稜まで及び、和平区だけで1,038平方キロ、全国最大の市轄区である。',
    TNN:'民国99年（2010年）12月25日に台南県市が合併。康熙23年（1684年）に台湾府が置かれた全島最古の行政中心で、府城の旧市街割りが街路に残る。',
    KHH:'民国68年（1979年）7月1日に直轄市へ昇格し、99年（2010年）12月25日に高雄県と合併。六都で面積が最大。南海の東沙群島と南沙群島は旗津区が代管する。',
    ILA:'蘭陽平野は蘭陽渓の沖積扇状地。清の嘉慶元年（1796年）に呉沙が礁頭囲へ入り、漢人開拓の始まりとなった。北東季節風が卓越し、冬の雨が長い。',
    HSQ:'県庁は竹北市。尖石・五峰の二つの山地郷を含み、大霸尖山が淡水河と大安渓の分水嶺をなす。六都以外では人口増加が最も速い県。',
    MIA:'客家人口の比率が全国で最も高く、四県腔が通じる。地形は丘陵と台地が主。出磺坑は清の同治年間に開かれ、アジアで最も早い油田の一つ。',
    CHA:'人口は全国の県で第一位。全域が彰化平野と八卦台地。鹿港は清代の「一府二鹿三艋舺」の二鹿で、港の埋没後に街割りが保存された。',
    NAN:'唯一海に面しない県で、面積は第二位。中央山脈の主稜、玉山主峰の一部、日月潭を含む。民国88年（1999年）の集集大地震の震央が県内にあった。',
    YUN:'濁水渓の沖積平野で、農業産出額は長く全国上位。北港朝天宮は媽祖信仰の中心で、その巡行は台湾最大級の民俗行事のひとつ。',
    CYQ:'嘉義市を取り囲む。阿里山郷を含み、玉山主峰の一部が県域にある。北回帰線が水上郷を通り、光緒34年（1908年）に標識が立てられた。現在の碑は六代目。',
    PIF:'最南の県で、郷の数は全国最多。恒春半島と墾丁国立公園を含み、鵝鑾鼻が本島の最南端。パイワン族とルカイ族の伝統領域である。',
    TTT:'花東縦谷南部と海岸山脈南部。原住民人口の比率は全国で最も高い。緑島と蘭嶼は本県に属し、蘭嶼はタオ族（ヤミ族）の島である。',
    HUA:'面積は全国の県市で第一位。中央山脈の東斜面が海へ急落し、清水断崖をなす。太魯閣峡谷は立霧渓が大理石を下刻して形成した。民国113年（2024年）4月3日の地震で山間道路が大きく損壊した。',
    PEN:'九十の島から成り、玄武岩の柱状節理が代表的な景観。天啓2年（1622年）にオランダ人が拠り、康熙22年（1683年）に施琅がここから台湾へ進攻した。',
    KEL:'台湾省の省轄市。天然の深水港で北部の門戸。北方三島（彭佳嶼・綿花嶼・花瓶嶼）は中正区に属し、綿花嶼が実効支配領域の最東端。',
    HSC:'台湾省の省轄市。清代は淡水庁の庁所在地で、道光年間に築かれた石城の東門・迎曦門が残る。民国69年（1980年）設置の新竹科学園区は半導体産業の中核。',
    CYI:'台湾省の省轄市で、面積は第一級行政区で最小。清代は諸羅県の県城で、康熙43年（1704年）に木柵の城が築かれ全島初の例となった。乾隆52年に軍民の守城の功により「嘉義」と改称。',
    KIN:'福建省の県。明の洪武20年（1387年）に築城され、「固くして金湯の如く、雄として海門を鎮む」の意を名に取る。民国38年の古寧頭戦役、47年の八二三砲戦の主戦場。烏坵郷を代管する。',
    LIE:'福建省の県、すなわち馬祖列島。人口・面積ともに全国最小。県庁は南竿郷。東引郷が実効支配領域の最北端。閩東語（福州語）の馬祖方言が通じる。'};
    const HJA={
    TPE:['総統府・行政院・立法院の所在','故宮博物院、中正紀念堂','陽明山国立公園の一部（大屯火山群）'],
    NTP:['富貴角は本島の最北端','三貂角は本島の最東端','烏来・平渓・九份などの山間集落'],
    TYC:['台湾桃園国際空港','石門ダム（民国53年竣工）','復興区はタイヤル族の伝統領域'],
    TXG:['雪山（3,886m）は第二の高峰','大甲渓の梯級水力開発','雪霸国立公園の一部'],
    TNN:['赤崁楼、億載金城、孔子廟','国聖港灯台は本島の最西端','台江国立公園と七股潟湖'],
    KHH:['高雄港は全国最大の港','寿山国家自然公園（唯一の国家自然公園）','太平島は実効支配領域の最南端'],
    ILA:['亀山島は安山岩の活火山島','太平山と翠峰湖','礁渓は平地の炭酸水素ナトリウム泉'],
    HSQ:['大霸尖山（3,492m）は三尖の一','内湾・北埔の客家集落','雪霸国立公園の一部'],
    MIA:['雪霸国立公園の一部（雪山西稜）','後龍・通霄の海岸風力発電群','南庄・大湖の山地'],
    CHA:['鹿港龍山寺、天后宮','八卦山大仏と台地','渓湖・二林は製糖の旧産地'],
    NAN:['日月潭は最大の天然湖','合歓山と埔里盆地','サオ族（民国90年認定）の伝統領域'],
    YUN:['濁水渓は全島最長の河川（186.6km）','西螺大橋と虎尾製糖工場','口湖・四湖の沿海養殖'],
    CYQ:['阿里山森林鉄道（1912年開通）','東石・布袋は南西沿海の要港','玉山国立公園の一部'],
    PIF:['墾丁国立公園（民国73年、最初の指定）','鵝鑾鼻灯台と恒春古城','小琉球（琉球嶼）は隆起サンゴ礁の島'],
    TTT:['嘉明湖（標高3,310m）','緑島の朝日温泉は海底温泉','卑南遺跡は新石器時代の大集落'],
    HUA:['秀姑巒山（3,825m）は第三の高峰','秀姑巒渓は海岸山脈を横断する唯一の川','太魯閣国立公園'],
    PEN:['澎湖天后宮は台湾最古の媽祖廟','澎湖南方四島国立公園','跨海大橋が白沙と西嶼を結ぶ'],
    KEL:['基隆港と和平島','年間降水日数は全国最多','二沙湾砲台（海門天険）'],
    HSC:['東門迎曦門（道光9年、1829年）','新竹科学園区','秋冬の強い季節風から「風城」と呼ばれる'],
    CYI:['市章は城の形を取り、諸羅古城を記念する','阿里山森林鉄道の起点','檜意森活村は日本統治期の林業官舎群'],
    KIN:['金門国立公園は初の戦地史跡を主題とする国立公園','閩南の伝統集落と洋楼','大胆島一帯は実効支配領域の最西端'],
    LIE:['北竿の芹壁は閩東式の石造集落','東引灯台（清光緒30年、1904年）','藍眼涙は夜光藻による季節現象']};
    const REGIME=[
    [1624,1662,'荷蘭東印度公司','Dutch East India Company','オランダ東インド会社','nl',
     '以大員（今臺南安平）為據點，設熱蘭遮城。旗為荷蘭三色旗，中央加 VOC 字徽，字徽此處未繪。',
     'Based at Tayouan, now Anping in Tainan, from Fort Zeelandia. The ensign carried the VOC monogram at its centre, which is not drawn here.',
     '大員（現在の台南・安平）を拠点とし、ゼーランディア城を築いた。旗はオランダ三色旗の中央にVOCの組合せ文字を置くが、ここでは描いていない。'],
    [1626,1642,'西班牙（北臺灣）','Spanish Formosa','スペイン領台湾','es',
     '據雞籠（基隆）與滬尾（淡水），民國前二七〇年為荷蘭所逐。勃艮第十字旗此處以直線簡化，原旗為節杖狀。',
     'Held Keelung and Tamsui in the north until expelled by the Dutch in 1642. The Cross of Burgundy is simplified to plain bars here; the original is a raguly saltire.',
     '北部の鶏籠（基隆）と滬尾（淡水）を占拠し、1642年にオランダに追われた。ブルゴーニュ十字はここでは直線に簡略化している。'],
    [1662,1683,'東寧王國（明鄭）','Kingdom of Tungning','東寧王国（鄭氏政権）','none',
     '鄭成功逐荷後所建，奉明正朔。當時並無近代意義之國旗，故此處從缺，不以後世追繪之圖樣充數。',
     'Founded after Koxinga expelled the Dutch, holding to the Ming calendar. No national flag existed in the modern sense, so none is shown rather than a later retrospective invention.',
     '鄭成功がオランダを駆逐して建てた政権で、明の正朔を奉じた。近代的な意味での国旗は存在しないため、後世の推定図は用いず空欄とする。'],
    [1683,1895,'大清','Qing Empire','清朝','qing',
     '康熙二二年入清版圖，先隸福建省，光緒一一年建為臺灣省。黃龍旗遲至同治元年方有（三角），光緒一五年改長方，故此旗僅適用於本期末段；龍紋未繪。',
     'Annexed in 1683, first under Fukien Province and made a province in its own right in 1885. The Yellow Dragon flag dates only from 1862, and became rectangular in 1889, so it covers only the end of this period. The dragon is not drawn.',
     '1683年に清の版図に入り、当初は福建省に属し、1885年に台湾省となった。黄龍旗は1862年（三角形）以降、1889年に長方形となったもので、この期間の末期にしか当たらない。龍は描いていない。'],
    [1895,1895,'臺灣民主國','Republic of Formosa','台湾民主国','formosa',
     '馬關條約割臺後所建，五月立、十月亡，前後約五個月。旗為藍地黃虎，虎紋未繪。',
     'Proclaimed after the Treaty of Shimonoseki ceded the island, and lasted roughly five months from May to October 1895. Its flag bore a yellow tiger on blue; the tiger is not drawn.',
     '下関条約による割譲後に樹立され、5月から10月までおよそ五か月で滅んだ。旗は藍地に黄虎で、虎は描いていない。'],
    [1895,1945,'日本','Empire of Japan','日本','jp',
     '設臺灣總督府，凡五十年。總督府另有其徽，與國旗有別。日章旗依現行《國旗及國歌法》繪製，日徑為縱寬五分之三，居中。',
     'Administered for fifty years through the Office of the Governor-General, which had its own emblem distinct from the national flag. The Hinomaru is drawn to the current Act on National Flag and Anthem: disc diameter three fifths of the height, centred.',
     '台湾総督府を置き五十年に及んだ。総督府には国旗とは別の徽章があった。日章旗は現行の国旗及び国歌に関する法律に従い、日章の直径を縦の五分の三として中央に置いた。'],
    [1945,0,'中華民國','Republic of China','中華民国','roc',
     '民國三四年十月二五日接收，三八年中央政府遷臺。國旗依《中華民國國徽國旗法》繪製，比例悉依法定。',
     'Took over administration on 25 October 1945; the central government relocated to Taiwan in 1949. The flag here is constructed to the National Emblem and National Flag Act, every proportion as the statute states.',
     '1945年10月25日に接収し、1949年に中央政府が台湾へ移った。国旗は中華民国国徽国旗法に基づき、比率はすべて法定のとおりに作図している。']];
    const RANGES=[
     {zh:'中央山脈',en:'Central Range',kZh:'分水嶺',kEn:'The watershed',len:'約340公里 / c. 340 km',
      hi:'秀姑巒山 3,825 m',
      pZh:'自宜蘭蘇澳延伸至屏東鵝鑾鼻，縱貫本島南北，為東西水系分界，故稱「臺灣屋脊」。三千公尺以上山峰逾百座。',
      pEn:'Runs from Su’ao in Yilan to Cape Eluanbi in Pingtung, dividing the eastern from the western drainage. More than a hundred of its summits exceed 3,000 m.'},
     {zh:'雪山山脈',en:'Xueshan Range',kZh:'北段主脈',kEn:'Northern massif',len:'約180公里 / c. 180 km',
      hi:'雪山 3,886 m',
      pZh:'自新北三貂角向西南延伸至南投濁水溪北岸。雪山圈谷為臺灣冰河遺跡最明確之證據，並為櫻花鉤吻鮭棲地上源。',
      pEn:'Extends southwest from Cape Sandiao to the north bank of the Zhuoshui. The cirques of Xueshan are the clearest evidence of glaciation in Taiwan, and its headwaters shelter the Formosan landlocked salmon.'},
     {zh:'玉山山脈',en:'Yushan Range',kZh:'最高峰所在',kEn:'The highest ground',len:'約180公里 / c. 180 km',
      hi:'玉山 3,952 m',
      pZh:'北起南投濁水溪南岸，南抵高雄旗山。玉山主峰海拔3,952公尺，為東北亞第一高峰。日治時期稱新高山。',
      pEn:'From the south bank of the Zhuoshui to Qishan in Kaohsiung. Yushan, at 3,952 m, is the highest peak in Northeast Asia; under Japanese rule it was called Niitakayama.'},
     {zh:'阿里山山脈',en:'Alishan Range',kZh:'西側前山',kEn:'Western foothills',len:'約250公里 / c. 250 km',
      hi:'大塔山 2,663 m',
      pZh:'與玉山山脈平行，隔楠梓仙溪相望。日治大正元年（1912）森林鐵路通車，為檜木林運輸而建，今為登山與觀光路線。',
      pEn:'Parallel to the Yushan Range across the Nanzixian valley. The forest railway opened in 1912 to carry cypress timber, and now serves walkers and visitors.'},
     {zh:'海岸山脈',en:'Coastal Range',kZh:'板塊前緣',kEn:'The plate margin',len:'約150公里 / c. 150 km',
      hi:'新港山 1,682 m',
      pZh:'自花蓮溪口至卑南溪口，為菲律賓海板塊隨島弧碰撞增生之部分，與中央山脈間夾花東縱谷（縱谷斷層帶）。',
      pEn:'From the mouth of the Hualien River to that of the Beinan, an accreted fragment of the Philippine Sea Plate. Between it and the Central Range lies the Huadong Valley along an active fault zone.'}
    ];
    const PEAKLIST=[
     ['玉山（主峰）','Yushan',3952,'南投·嘉義·高雄','五嶽之首、東北亞最高峰'],
     ['雪山（主峰）','Xueshan',3886,'臺中·苗栗','五嶽、圈谷冰河遺跡'],
     ['秀姑巒山','Siouguluanshan',3825,'花蓮·南投','五嶽、中央山脈最高峰'],
     ['馬博拉斯山','Mabolasishan',3785,'花蓮·南投','馬博橫斷主峰'],
     ['南湖大山','Nanhudashan',3742,'宜蘭·臺中','五嶽、帝王之山'],
     ['中央尖山','Zhongyangjianshan',3705,'宜蘭·花蓮','三尖之首'],
     ['關山','Guanshan',3668,'高雄·臺東','南臺灣第二高峰'],
     ['大水窟山','Dashueikushan',3642,'花蓮·南投·高雄','三縣市交界'],
     ['奇萊主山','Qilai Main Peak',3560,'花蓮·南投','奇萊連峰'],
     ['品田山','Pintianshan',3524,'新竹·臺中','十峻、聖稜線起點'],
     ['大霸尖山','Dabajianshan',3492,'新竹·苗栗','三尖、泰雅族聖山'],
     ['合歡山（主峰）','Hehuanshan',3417,'南投·花蓮','公路可抵之高山'],
     ['達芬尖山','Dafenjianshan',3208,'花蓮·高雄','三尖之末'],
     ['北大武山','Beidawushan',3092,'屏東·臺東','五嶽、南臺灣屏障'],
     ['新港山','Singangshan',1682,'臺東','海岸山脈最高峰']
    ];
    const RIVERS=[
     ['濁水溪','Zhuoshui',186.6,3156.9,'南投·彰化·雲林','全臺最長；名自泥沙含量'],
     ['高屏溪','Gaoping',171.0,3256.9,'高雄·屏東·南投·嘉義','流域面積最廣'],
     ['淡水河','Tamsui',158.7,2726.0,'臺北·新北·桃園·新竹','唯一曾具航運之河'],
     ['曾文溪','Zengwen',138.5,1176.6,'臺南·嘉義·高雄','曾文水庫上源'],
     ['大甲溪','Dajia',124.2,1235.7,'臺中·南投·宜蘭','梯級水力開發'],
     ['烏溪（大肚溪）','Wu / Dadu',119.1,2025.6,'臺中·彰化·南投','臺中彰化分界'],
     ['秀姑巒溪','Siouguluan',104.0,1790.5,'花蓮','唯一橫切海岸山脈'],
     ['卑南溪','Beinan',84.4,1603.2,'臺東','花東縱谷南段主流'],
     ['蘭陽溪','Lanyang',73.1,978.6,'宜蘭','蘭陽平原沖積扇成因'],
     ['大漢溪','Dahan',135.0,1163.0,'桃園·新北·新竹','淡水河最長支流'],
     ['基隆河','Keelung',86.4,490.8,'基隆·臺北·新北','壺穴地形發達'],
     ['花蓮溪','Hualien',57.3,1507.1,'花蓮','縱谷北段主流']
    ];
    const LAKES=[
     ['日月潭','Sun Moon Lake','南投縣魚池鄉','面積7.93 km²；水位海拔748 m',
      '全臺最大天然湖泊。民國23年武界壩與日月潭電廠完工後水位抬升，面積擴增，原湖中珠仔嶼成拉魯島。'],
     ['嘉明湖','Jiaming Lake','臺東縣海端鄉','海拔3,310 m；面積約1.9公頃',
      '無明顯出入水口之高山湖泊，成因或為隕石撞擊或冰斗，學界未定論。俗稱「天使的眼淚」。'],
     ['翠峰湖','Cueifong Lake','宜蘭縣大同鄉','海拔1,840 m；面積約25公頃',
      '面積最大之高山湖泊，位太平山區。雨季與旱季水域伸縮顯著，故稱「薄霧中的少女」。'],
     ['鯉魚潭','Liyu Lake','花蓮縣壽豐鄉','面積約104公頃','花東地區最大內陸湖泊，屬地層下陷積水而成。'],
     ['曾文水庫','Zengwen Reservoir','臺南市楠西區·嘉義縣大埔鄉','總容量約7.08億 m³（設計值）',
      '全國容量最大之水庫，民國62年完工。有效容量因淤積逐年遞減，為南部區域主要水源。'],
     ['石門水庫','Shihmen Reservoir','桃園市大溪區','總容量約3.09億 m³（設計值）',
      '民國53年6月完工，臺灣首座多目標水庫，兼具灌溉、給水、發電、防洪與觀光。'],
     ['翡翠水庫','Feitsui Reservoir','新北市石碇區','總容量約4.06億 m³',
      '民國76年6月完工，專供大臺北自來水，集水區長期實施嚴格管制，水質為全國之冠。'],
     ['德基水庫','Deji Reservoir','臺中市和平區','壩高180 m；總容量約2.32億 m³',
      '雙曲線薄拱壩，壩高為全國之最，民國63年完工，為大甲溪梯級發電之首站。']
    ];
    const PARKS=[
     ['墾丁國家公園','Kenting','民國73年1月1日','1 Jan 1984','屏東縣','約33,289公頃（陸域18,084／海域15,206）',
      '首座國家公園。熱帶季風林、隆起珊瑚礁與潟湖並存，冬季落山風強勁，為赤腹鷹、灰面鷲過境要地。'],
     ['玉山國家公園','Yushan','民國74年4月6日','6 Apr 1985','南投·嘉義·高雄·花蓮','約103,121公頃',
      '面積最大之陸域國家公園，含玉山主峰及三千公尺以上高峰三十餘座，涵蓋亞熱帶至寒帶完整植群垂直分布。'],
     ['陽明山國家公園','Yangmingshan','民國74年9月16日','16 Sep 1985','臺北市·新北市','約11,338公頃',
      '大屯火山群之後火山活動區，小油坑、大油坑噴氣孔與硫氣孔活躍，為距首都最近之國家公園。'],
     ['太魯閣國家公園','Taroko','民國75年11月28日','28 Nov 1986','花蓮·南投·臺中','約92,000公頃',
      '立霧溪下切大理岩形成峽谷，落差達三千公尺。民國113年4月3日地震後山區道路與步道多處中斷，開放狀況請依主管機關公告。'],
     ['雪霸國家公園','Shei-Pa','民國81年7月1日','1 Jul 1992','苗栗·臺中·新竹','約76,850公頃',
      '以雪山與大霸尖山為主體。七家灣溪為臺灣櫻花鉤吻鮭唯一自然棲地，屬冰河期孑遺物種。'],
     ['金門國家公園','Kinmen','民國84年10月18日','18 Oct 1995','金門縣','約3,780公頃',
      '首座以戰役史蹟及閩南傳統聚落為主題者，涵蓋古寧頭、太武山、翟山坑道與瓊林、水頭等聚落。'],
     ['東沙環礁國家公園','Dongsha Atoll','民國96年1月17日','17 Jan 2007','高雄市旗津區','約353,668公頃',
      '首座海洋國家公園，面積為各國家公園之最。環礁直徑約25公里，為南海重要造礁珊瑚生態系。非開放遊憩區域。'],
     ['台江國家公園','Taijiang','民國98年12月28日','28 Dec 2009','臺南市','約39,310公頃',
      '含七股潟湖、鹽田與紅樹林濕地，為黑面琵鷺主要度冬地。並涵蓋鹽業與臺江內海變遷之人文史蹟。'],
     ['澎湖南方四島國家公園','South Penghu','民國103年6月8日','8 Jun 2014','澎湖縣','約35,843公頃',
      '東吉、西吉、東嶼坪、西嶼坪四島及周邊海域。玄武岩地景與菜宅（石砌擋風牆）並存。'],
     ['壽山國家自然公園','Shoushan (Nature Park)','民國100年12月6日','6 Dec 2011','高雄市','約1,123公頃',
      '唯一之國家自然公園，依民國100年《國家公園法》修正增設之類別。隆起珊瑚礁石灰岩地形，臺灣獼猴族群密集。']
    ];
    const ISLANDS=[
     ['臺灣本島','Taiwan (main island)','35,808.00','世界第38大島；南北約394公里，東西最寬約144公里'],
     ['蘭嶼','Lanyu','45.74','臺東縣蘭嶼鄉；達悟族世居，火山島'],
     ['金門本島','Kinmen','134.25','金門縣；含大金門，另有烈嶼（小金門）等'],
     ['綠島','Lyudao','15.09','臺東縣綠島鄉；火山島，朝日海底溫泉'],
     ['小琉球（琉球嶼）','Lyuqiu','6.80','屏東縣琉球鄉；唯一珊瑚礁隆起島'],
     ['澎湖本島','Penghu','64.24','澎湖縣馬公市、湖西鄉；群島共九十島'],
     ['南竿島','Nangan','10.64','連江縣南竿鄉；縣治所在'],
     ['龜山島','Gueishan','2.85','宜蘭縣頭城鎮；安山岩活火山島'],
     ['東沙島','Dongsha','1.74','高雄市旗津區代管；東沙環礁國家公園'],
     ['彭佳嶼','Pengjia','1.14','基隆市中正區；北方三島之一'],
     ['太平島','Taiping','0.51','高雄市旗津區代管；南沙群島最大自然島'],
     ['基隆嶼','Keelung Islet','0.24','基隆市中正區；火山島'],
     ['釣魚臺列嶼','Diaoyutai','6.34','法制上編屬宜蘭縣頭城鎮，未實際管轄；日本以沖繩縣石垣市管理，中國大陸亦主張']
    ];
    const EXTREMES=[
     {kZh:'本島極北',kEn:'Main island, north',nZh:'富貴角',nEn:'Cape Fugui',
      loc:'新北市石門區',co:'北緯 25°17′58″'},
     {kZh:'本島極南',kEn:'Main island, south',nZh:'鵝鑾鼻',nEn:'Cape Eluanbi',
      loc:'屏東縣恆春鎮',co:'北緯 21°53′48″'},
     {kZh:'本島極東',kEn:'Main island, east',nZh:'三貂角',nEn:'Cape Sandiao',
      loc:'新北市貢寮區',co:'東經 121°59′15″'},
     {kZh:'本島極西',kEn:'Main island, west',nZh:'國聖港燈塔',nEn:'Guosheng Lighthouse',
      loc:'臺南市安南區（曾文溪口）',co:'東經 120°02′45″'},
     {kZh:'管轄極北',kEn:'Territory, north',nZh:'東引鄉一帶',nEn:'Dongyin, Lienchiang',
      loc:'連江縣東引鄉',co:'約北緯 26°23′'},
     {kZh:'管轄極南',kEn:'Territory, south',nZh:'太平島',nEn:'Taiping Island',
      loc:'高雄市旗津區代管（南沙群島）',co:'約北緯 10°23′'},
     {kZh:'管轄極東',kEn:'Territory, east',nZh:'棉花嶼',nEn:'Mianhua Islet',
      loc:'基隆市中正區',co:'約東經 122°06′'},
     {kZh:'管轄極西',kEn:'Territory, west',nZh:'大膽島一帶',nEn:'Dadan, Kinmen',
      loc:'金門縣烈嶼鄉',co:'約東經 118°13′'}
    ];
    const CLIMATE=[
     ['氣候分區','Climatic division','北回歸線（23°26′N）以北為副熱帶季風氣候，以南為熱帶季風氣候；高山區依海拔遞變至寒帶。'],
     ['年均溫','Mean annual temperature','平地約22至24°C。海拔每上升100公尺約降0.6°C，玉山北峰觀測站年均溫約3.8°C。'],
     ['年降水量','Mean annual precipitation','全區平均約2,500公釐，約為世界陸地平均之2.6倍，然季節與空間分布極不均。'],
     ['最多雨處','Wettest station','火燒寮（新北市平溪區）曾為東亞年雨量最高紀錄地，年均逾6,000公釐。'],
     ['東北季風','Northeast monsoon','十月至翌年三月。迎風之基隆、宜蘭冬雨綿長；中南部則為旱季。'],
     ['梅雨','Plum rains','五月至六月，滯留鋒南北徘徊，為中南部第一波主要水源。'],
     ['西南氣流','Southwest flow','六月至八月，常伴隨強對流，為中南部主要降水來源。'],
     ['颱風','Typhoons','主要於七月至九月，年均約三至四個侵臺，為單日極端降雨主因。'],
     ['北回歸線標','Tropic markers','嘉義縣水上鄉（光緒34年首立，現為第六代）、花蓮縣瑞穗鄉舞鶴、豐濱鄉靜浦。']
    ];
    const SPRINGS=[
     ['北投溫泉','Beitou','臺北市北投區','白磺、青磺、鐵磺；青磺含北投石（世界僅二處）'],
     ['烏來溫泉','Wulai','新北市烏來區','弱鹼性碳酸氫鈉泉，泰雅族舊稱「kilux」意為熱'],
     ['礁溪溫泉','Jiaoxi','宜蘭縣礁溪鄉','平地碳酸氫鈉泉，無硫味，屬稀有之平原湧泉'],
     ['蘇澳冷泉','Su’ao','宜蘭縣蘇澳鎮','水溫約22°C之碳酸冷泉，世界少見'],
     ['谷關溫泉','Guguan','臺中市和平區','弱鹼性碳酸泉，大甲溪谷；日治稱明治溫泉'],
     ['廬山溫泉','Lushan','南投縣仁愛鄉','高溫碳酸氫鈉泉；因土石流風險已規劃遷移'],
     ['關子嶺溫泉','Guanziling','臺南市白河區','泥漿溫泉，世界僅三處（另為義大利、日本）'],
     ['四重溪溫泉','Sichongxi','屏東縣車城鄉','日治四大名湯之一，弱鹼性碳酸氫鈉泉'],
     ['知本溫泉','Zhiben','臺東縣卑南鄉','碳酸氫鈉泉，卑南族舊獵場'],
     ['瑞穗溫泉','Ruisui','花蓮縣萬榮鄉','碳酸鹽泉含鐵，氧化呈黃濁，俗稱「黃金泉」'],
     ['朝日溫泉','Zhaori','臺東縣綠島鄉','海底溫泉，世界僅三處（另為日本、義大利）']
    ];
    const PEOPLES=[
     ['阿美族','Amis','花蓮·臺東','日治分類沿用','人口最多；母系社會，年齡階級組織嚴密'],
     ['泰雅族','Atayal','新北·桃園·新竹·苗栗·臺中·南投·宜蘭','日治分類沿用','分布最廣；紋面與Gaga規範'],
     ['排灣族','Paiwan','屏東·臺東','日治分類沿用','貴族階級制度，五年祭（Maljeveq）'],
     ['布農族','Bunun','南投·花蓮·高雄·臺東','日治分類沿用','八部合音（Pasibutbut）；居住海拔最高'],
     ['卑南族','Puyuma','臺東','日治分類沿用','少年會所（Takuban）制度'],
     ['魯凱族','Rukai','屏東·高雄·臺東','日治分類沿用','石板屋建築，百合花為榮譽象徵'],
     ['鄒族','Tsou','嘉義·南投·高雄','日治分類沿用','庫巴（Kuba）男子會所，戰祭Mayasvi'],
     ['賽夏族','Saisiyat','苗栗·新竹','日治分類沿用','矮靈祭（Pas-taai）二年一小祭、十年一大祭'],
     ['雅美族（達悟族）','Tao / Yami','臺東蘭嶼','日治分類沿用','拼板舟與飛魚祭；唯一海洋民族'],
     ['邵族','Thao','南投日月潭','民國90年認定','人口最少之族群之一；杵音與祖靈籃'],
     ['噶瑪蘭族','Kavalan','宜蘭·花蓮·臺東','民國91年認定','原居蘭陽平原，十九世紀南遷'],
     ['太魯閣族','Truku','花蓮·南投','民國93年認定','原歸類泰雅族，2004年獨立認定'],
     ['撒奇萊雅族','Sakizaya','花蓮','民國96年認定','1878年加禮宛事件後隱身阿美族百餘年'],
     ['賽德克族','Seediq','南投·花蓮','民國97年認定','霧社事件（民國19年）主體族群'],
     ['拉阿魯哇族','Hla’alua','高雄桃源·那瑪夏','民國103年認定','聖貝祭（Miatungusu）'],
     ['卡那卡那富族','Kanakanavu','高雄那瑪夏','民國103年認定','米貢祭；原歸類鄒族']
    ];
    const TIMELINE=[
     ['1684','康熙23年','清廷設<b>臺灣府</b>，隸福建省，下轄臺灣、鳳山、諸羅三縣，即「一府三縣」。府治在今臺南。'],
     ['1875','光緒元年','增設<b>臺北府</b>，全臺為二府八縣四廳。此為北臺灣行政地位提升之始。'],
     ['1885','光緒11年','<b>臺灣建省</b>（正名福建臺灣省），劉銘傳為首任巡撫；光緒13年正式與福建分治，設三府一直隸州十一縣三廳。'],
     ['1895','光緒21年','馬關條約割讓，日本設<b>臺灣總督府</b>，行政區屢有更迭。'],
     ['1920','大正9年','確立<b>五州二廳</b>：臺北、新竹、臺中、臺南、高雄五州，臺東、花蓮港二廳。大正15年增澎湖廳，成五州三廳，此制沿用至終戰。'],
     ['1945','民國34年','臺灣光復，設<b>臺灣省行政長官公署</b>，改五州三廳為八縣，另設九省轄市。'],
     ['1950','民國39年','行政區大幅重劃為<b>五市十六縣</b>。此格局延續近六十年，為今日縣市界之基礎。'],
     ['1967','民國56年','<b>臺北市升格直轄市</b>，為首個院轄市。'],
     ['1979','民國68年','<b>高雄市升格直轄市</b>，成二直轄市格局。'],
     ['1998','民國87年','<b>臺灣省政府功能業務與組織調整</b>（精省）。省不再為地方自治團體，省長、省議員選舉停辦，省府改為行政院派出機關。'],
     ['2010','民國99年','<b>五都改制</b>：臺北縣改制新北市；臺中、臺南縣市合併改制；高雄市縣合併。'],
     ['2014','民國103年','<b>桃園縣改制桃園市</b>，六都成形，即今日格局。'],
     ['2018','民國107年','7月1日<b>臺灣省政府、福建省政府預算歸零</b>，業務全數移交中央機關。省級行政至此完全虛級化，然省之建置於憲法增修條文中仍存。']
    ];
    const SOURCES=[
     {zh:'人口、戶數、鄉鎮市區村里數：內政部戶政司《人口統計季刊》民國115年春季（統計至115年3月底）。全區總人口23,270,568人，總戶數9,892,098戶。',
      en:'Population, households and counts of townships, districts and villages: Ministry of the Interior, Department of Household Registration, Demography Quarterly, Spring 2026 (to 31 March 2026). Total population 23,270,568 in 9,892,098 households.'},
     {zh:'土地面積：內政部公布之各縣市面積統計，合計約36,194平方公里。',
      en:'Land areas: Ministry of the Interior published figures by division, totalling approximately 36,194 km².'},
     {zh:'國家公園：內政部國家公園署；累計面積750,475.43公頃（九座國家公園、一座國家自然公園）。國家公園署於民國112年9月20日揭牌成立。',
      en:'National parks: National Park Service, Ministry of the Interior; 750,475.43 hectares in total across nine national parks and one national nature park. The Service was established on 20 September 2023.'},
     {zh:'河川長度與流域面積：經濟部水利署中央管河川資料。',
      en:'River lengths and basin areas: Water Resources Agency, Ministry of Economic Affairs, for centrally administered rivers.'},
     {zh:'山峰海拔：內政部國土測繪中心測量成果。玉山主峰3,952公尺係民國104年重新測算之數值。',
      en:'Summit elevations: National Land Surveying and Mapping Center. The figure of 3,952 m for Yushan derives from the 2015 resurvey.'},
     {zh:'原住民族認定：原住民族委員會歷次認定公告。現認定十六族。',
      en:'Recognition of indigenous peoples: successive determinations of the Council of Indigenous Peoples; sixteen peoples at present.'},
     {zh:'行政沿革：《清史稿》地理志、臺灣總督府府報、以及內政部歷次行政區劃調整公告。',
      en:'Administrative lineage: the geographical treatise of the Draft History of Qing, the Government-General of Taiwan gazette, and successive Ministry of the Interior notices.'}
    ];
    /* ==========================================================================
       HISTORICAL ERAS

       Two axes, each answering its own question and neither borrowing the other's
       frame. This one is the Chinese dynastic sequence, described plainly on its own
       terms. The island's own succession has its own axis in the succession section,
       which is where the island's history belongs.

       [start, end, zh, en, ja, colour, noteZh, noteEn, noteJa]
       Negative years are BCE. Dates for the earliest dynasties are conventional and
       are given as traditionally reckoned. Ranges are made contiguous at the
       conventional unification years so the axis lays out as one unbroken strip;
       the real transitions overlapped by a few years in several cases.
       ========================================================================== */
    const ERA=[
    [-2070,-1600,'夏','Xia','夏','#8C6B4F',
     '傳世文獻所記最早之王朝，都於陽城一帶。二里頭遺址或與之相當，惟尚無當時文字可證。',
     'The earliest dynasty in the transmitted record, seated near Yangcheng. The Erlitou site may correspond to it, though no contemporary writing survives to confirm the identification.',
     '伝世文献に記される最初の王朝で、陽城のあたりに都した。二里頭遺跡がこれに当たる可能性があるが、同時代の文字資料はない。'],
    [-1600,-1046,'商','Shang','商','#7E6248',
     '以殷為都，甲骨文與青銅禮器為其標誌，是中國有當時文字可稽之始。',
     'Seated at Yin. Its oracle-bone inscriptions and ritual bronzes make it the first Chinese dynasty attested by writing of its own time.',
     '殷に都し、甲骨文と青銅礼器で知られる。同時代の文字によって確認できる最初の王朝である。'],
    [-1046,-221,'周','Zhou','周','#916F4E',
     '分西周、東周；東周又分春秋、戰國。封建制行而後壞，諸子百家於此時並起。',
     'Divided into Western and Eastern Zhou, the latter into the Spring and Autumn and Warring States periods. Its feudal order rose and then broke apart, and the hundred schools of philosophy date from these centuries.',
     '西周と東周に分かれ、東周はさらに春秋・戦国に分かれる。封建の秩序が成立し崩れ、諸子百家が興った。'],
    [-221,-206,'秦','Qin','秦','#A8763F',
     '始皇帝滅六國而一天下，書同文、車同軌，行郡縣。歷十五年而亡，然其制為後世所承。',
     'The First Emperor unified the warring states, standardised the script and the axle gauge, and replaced the fiefs with commanderies. It fell after fifteen years, but its administrative design outlasted it.',
     '始皇帝が六国を滅ぼして天下を統一し、文字と車軌を統一して郡県制を敷いた。十五年で滅んだが、その制度は後世に受け継がれた。'],
    [-206,220,'漢','Han','漢','#B07E3C',
     '分西漢、東漢，中隔新莽。定儒術，通西域，開絲路。漢之名遂為族名。',
     'Divided into Western and Eastern Han by Wang Mang\u2019s interregnum. It made the Confucian canon official, reached into Central Asia and opened the Silk Road. The dynasty\u2019s name became the name of the people.',
     '西漢と東漢に分かれ、間に新が挟まる。儒学を官学とし、西域に通じて絹の道を開いた。漢の名はそのまま民族の名となった。'],
    [220,280,'三國','Three Kingdoms','三国','#6A8F8D',
     '魏、蜀、吳鼎立。戶口大減，然人物與文章為後世所稱。',
     'Wei, Shu and Wu stood against one another. The registered population fell steeply, yet the period\u2019s figures and its writing were long celebrated afterwards.',
     '魏・蜀・呉が鼎立した。戸口は大きく減じたが、その人物と文章は後世に長く語られた。'],
    [280,420,'晉','Jin','晋','#5F8385',
     '西晉短暫一統，繼以永嘉之亂，衣冠南渡，是為東晉。',
     'The Western Jin briefly reunified the empire; after the Yongjia disorders the court and the great families moved south, and the Eastern Jin followed.',
     '西晋が短く天下を統一したが、永嘉の乱の後に朝廷と士族が南へ移り、東晋となった。'],
    [420,581,'南北朝','Northern and Southern','南北朝','#6A8F8D',
     '南北分治百六十年。佛教大行，石窟造像與譯經為此期所盛。',
     'North and south were separately ruled for a hundred and sixty years. Buddhism spread widely, and the great cave temples and the translation of the sutras belong to this period.',
     '南北が百六十年にわたり分かれて統治された。仏教が広まり、石窟の造像と訳経が盛んになった。'],
    [581,618,'隋','Sui','隋','#4C6CB3',
     '再統南北，開大運河，創科舉。工役繁重，二世而亡。',
     'Reunified north and south, cut the Grand Canal and instituted the examinations. The burden of its works was heavy and it lasted only two reigns.',
     '南北を再統一し、大運河を開き、科挙を創始した。工役が重く、二代で滅んだ。'],
    [618,907,'唐','Tang','唐','#2B618F',
     '疆域廣遠，長安為當時世界大都。詩至此極盛，制度亦為東亞諸國所取法。',
     'Its reach was wide and Chang\u2019an was among the great cities of the world. Poetry reached its height, and its institutions were taken as a model across East Asia.',
     '版図は広く、長安は当時の世界有数の都であった。詩は最盛期を迎え、制度は東アジア各国の手本となった。'],
    [907,960,'五代十國','Five Dynasties','五代十国','#4C6CB3',
     '中原五代相替，四方十國並立，凡五十三年。',
     'Five dynasties followed one another in the central plain while ten states stood in the regions, over fifty-three years.',
     '中原で五つの王朝が交替し、周辺に十国が並び立った。五十三年に及ぶ。'],
    [960,1279,'宋','Song','宋','#2B618F',
     '分北宋、南宋。工商與城市大盛，印刷、火藥、羅盤皆於此時廣用，理學亦興。',
     'Divided into Northern and Southern Song. Commerce and cities flourished; printing, gunpowder and the compass came into wide use, and Neo-Confucian philosophy took shape.',
     '北宋と南宋に分かれる。商工業と都市が栄え、印刷・火薬・羅針盤が広く用いられ、理学が興った。'],
    [1279,1368,'元','Yuan','元','#66327C',
     '蒙古所建，疆域跨歐亞，驛路通達，海運與海外貿易大興。',
     'Founded by the Mongols, with a reach across Eurasia. Its post roads ran far, and sea transport and overseas trade grew accordingly.',
     'モンゴルが建て、版図はユーラシアに跨がった。駅路が通じ、海運と海外貿易が大いに栄えた。'],
    [1368,1644,'明','Ming','明','#622954',
     '復漢家衣冠，遷都北京，修長城。鄭和七下西洋，其後海禁漸嚴。',
     'Restored native dress and rite, moved the capital to Peking and rebuilt the Great Wall. Zheng He made seven voyages west, after which the sea bans tightened.',
     '漢の衣冠を復し、北京に遷都して長城を修めた。鄭和が七度西洋に下り、その後は海禁が厳しくなった。'],
    [1644,1912,'清','Qing','清','#8F77B5',
     '滿洲所建，疆域最廣。康雍乾百餘年稱盛，其後外患內亂交迫，終以辛亥革命而終。',
     'Founded by the Manchus and the largest in extent. The reigns of Kangxi, Yongzheng and Qianlong were counted its height; foreign pressure and internal revolt followed, and the Xinhai revolution ended it.',
     '満洲が建て、版図は最大となった。康熙・雍正・乾隆の百余年を盛期とし、その後は外圧と内乱が相次ぎ、辛亥革命により終わった。'],
    [1912,2026,'中華民國','Republic of China','中華民国','#C00000',
     '辛亥革命後建立，為亞洲第一個共和國。行憲政，設五院。民國三十八年中央政府遷設臺北。',
     'Established after the Xinhai revolution as the first republic in Asia. It governs under a constitution through five branches; the central government moved to Taipei in 1949.',
     '辛亥革命の後に成立した、アジア最初の共和国。憲政を行い五院を置く。1949年に中央政府が台北へ移った。']];

    /* Milestones for the list beneath the axis. [year, changedTheMap, text, place] */
    const HIST=[
     [230,0,['A Wu expedition reaches Yizhou; the Seaboard Geography of Linhai records it',
       '吳遣衛溫、諸葛直至夷洲，《臨海水土志》記其風土',
       '呉が夷洲に遠征し、『臨海水土志』が記録する'],'夷洲'],
     [610,0,['The Sui send troops to Liuqiu','隋煬帝遣陳稜率兵至流求',
       '隋が流求へ出兵する'],'流求'],
     [1281,1,['A patrol inspectorate is set up in Penghu under Tong\u2019an county',
       '元設澎湖巡檢司，隸同安縣','元が澎湖巡検司を置く'],'澎湖'],
     [1624,1,['The Dutch East India Company builds Fort Zeelandia at Tayouan',
       '荷蘭東印度公司於大員築熱蘭遮城','オランダ東インド会社が大員にゼーランディア城を築く'],'大員'],
     [1626,1,['Spain occupies Keelung, and Tamsui two years later',
       '西班牙據雞籠，二年後再據滬尾','スペインが鶏籠を、二年後に滬尾を占拠'],'雞籠'],
     [1642,1,['The Dutch drive the Spanish out of the north',
       '荷蘭逐西班牙出北臺灣','オランダがスペインを北部から駆逐'],'雞籠'],
     [1662,1,['Koxinga expels the Dutch and establishes the Tungning administration',
       '鄭成功逐荷蘭，設東都，後稱東寧','鄭成功がオランダを駆逐し東寧を置く'],'安平'],
     [1683,1,['Qing annexation; Taiwan Prefecture is placed under Fukien',
       '清領臺灣，設臺灣府隸福建省','清が領有し、台湾府を福建省に属させる'],'臺灣府'],
     [1721,0,['The Zhu Yigui rising takes the prefectural city within a week',
       '朱一貴事件，七日下府城','朱一貴の乱、七日で府城が陥落'],'府城'],
     [1858,0,['The treaties of Tianjin open Tamsui, Keelung, Anping and Takao',
       '天津條約開淡水、雞籠、安平、打狗四口','天津条約により淡水・鶏籠・安平・打狗が開港'],'四口'],
     [1885,1,['Taiwan is separated from Fukien and made a province; Liu Mingchuan governor',
       '臺灣建省，劉銘傳為首任巡撫','台湾省が置かれ、劉銘伝が初代巡撫となる'],'臺灣省'],
     [1895,1,['The Treaty of Shimonoseki cedes Taiwan and Penghu to Japan; the Republic of Formosa lasts five months',
       '馬關條約割臺灣、澎湖予日本；臺灣民主國五月而亡',
       '下関条約で台湾・澎湖を日本に割譲。台湾民主国は五か月で滅ぶ'],'馬關'],
     [1908,0,['The trunk line opens from Keelung to Takao',
       '縱貫鐵路全線通車，基隆至打狗','縦貫鉄道が基隆から打狗まで全通'],'縱貫線'],
     [1912,1,['The Republic of China is founded at Nanking',
       '中華民國於南京建國','中華民国が南京で建国される'],'南京'],
     [1930,0,['The Chianan Canal opens, irrigating 150,000 hectares of the western plain',
       '嘉南大圳竣工，灌溉西部平原十五萬公頃','嘉南大圳が完成し、西部平野15万ヘクタールを灌漑'],'嘉南'],
     [1945,1,['Japanese administration ends on 25 October; the Republic takes over',
       '十月二十五日日本統治結束，中華民國接收','10月25日、日本統治が終わり中華民国が接収'],'臺北'],
     [1949,1,['The central government moves to Taipei',
       '中央政府遷設臺北','中央政府が台北へ移る'],'臺北'],
     [1950,1,['The present county and city framework is laid down: five cities and sixteen counties',
       '調整為五市十六縣，奠定今日政區架構','五市十六県に再編され、現在の行政区の骨格が定まる'],'全島'],
     [1971,0,['The Republic leaves the United Nations',
       '中華民國退出聯合國','中華民国が国際連合を脱退'],'紐約'],
     [1987,1,['Martial law is lifted after thirty-eight years',
       '解除戒嚴，歷時三十八年','38年に及んだ戒厳令が解除される'],'全島'],
     [1996,1,['The first direct presidential election',
       '首次總統直接民選','初の総統直接選挙'],'全島'],
     [1998,1,['The provincial government is stripped of function',
       '精省，省府業務移轉','省政府の業務が移管される（精省）'],'臺灣省'],
     [2010,1,['Five special municipalities take effect on 25 December',
       '十二月二十五日五都改制','12月25日、五直轄市が発足'],'五都'],
     [2014,1,['Taoyuan becomes the sixth special municipality',
       '桃園升格，六都成形','桃園が昇格し六都となる'],'桃園'],
     [2018,1,['Provincial budgets are zeroed on 1 July',
       '七月一日省級機關預算歸零','7月1日、省の予算がゼロとなる'],'臺灣省']];

    /* Seats of power on the island, for the layer the era axis switches on.
       [zh, en, ja, lon, lat] */
    const CAPITALS=[
    ['安平（熱蘭遮城）','Anping, Fort Zeelandia','安平（ゼーランディア城）',120.160,23.001],
    ['臺灣府城','Taiwan Prefectural City','台湾府城',120.204,22.992],
    ['臺北','Taipei','台北',121.516,25.043]];

    /* ==========================================================================
       THE ISLAND'S OWN AXIS

       The succession section had a list; this gives it the same horizontal reading
       the dynastic axis has, on its own terms and its own span. Contiguous bands
       only: the Spanish holding in the north (1626-1642) overlapped the Dutch, and
       the Republic of Formosa lasted five months in 1895, so both are left to the
       list below rather than forced onto a strip that cannot show overlap.
       [start, end, zh, en, ja, colour, noteZh, noteEn, noteJa, structure]
       The last field is the administrative structure standing at the close of the
       era, the counterpart of the United States sheet's states-at-the-close figure.
       ========================================================================== */
    const ISLERA=[
    [1624,1662,'荷蘭','Dutch','オランダ','#AE1C28',
     '荷蘭東印度公司據大員，築熱蘭遮城，經營轉口貿易與鹿皮、蔗糖之輸出。',
     'The Dutch East India Company held Tayouan from Fort Zeelandia, running an entrepôt trade and exporting deerskin and sugar.',
     'オランダ東インド会社が大員を拠点とし、ゼーランディア城から中継貿易と鹿皮・砂糖の輸出を営んだ。',
     '熱蘭遮城・普羅民遮城'],
    [1662,1683,'東寧','Tungning','東寧','#622954',
     '鄭成功逐荷後所建，奉明正朔，屯田養兵，設一府二縣。',
     'Founded after Koxinga expelled the Dutch. It held to the Ming calendar, settled troops on the land and set up one prefecture and two counties.',
     '鄭成功がオランダを駆逐して建てた。明の正朔を奉じ、屯田によって兵を養い、一府二県を置いた。',
     '一府二縣'],
    [1683,1895,'大清','Qing','清','#8F77B5',
     '設臺灣府隸福建，開港通商，光緒十一年建為行省，劉銘傳興鐵路、電報。',
     'Taiwan Prefecture was placed under Fukien and the ports were opened to trade. It became a province in its own right in 1885, when Liu Mingchuan began the railway and the telegraph.',
     '台湾府を福建に属させ、開港して通商した。1885年に省となり、劉銘伝が鉄道と電信を興した。',
     '三府一直隸州十一縣四廳'],
    [1895,1945,'日本','Japan','日本','#707C74',
     '設臺灣總督府。築縱貫鐵路、嘉南大圳，行專賣與戶口調查，凡五十年。',
     'Administered through the Office of the Governor-General for fifty years, which built the trunk railway and the Chianan Canal and ran the monopolies and the household census.',
     '台湾総督府を置いた五十年。縦貫鉄道と嘉南大圳を築き、専売と戸口調査を行った。',
     '五州三廳'],
    [1945,2026,'中華民國','Republic of China','中華民国','#C00000',
     '民國三十四年十月二十五日接收，三十八年中央政府遷臺。七十六年解嚴，八十五年首次總統直選。',
     'Took over on 25 October 1945; the central government moved to Taipei in 1949. Martial law was lifted in 1987 and the first direct presidential election held in 1996.',
     '1945年10月25日に接収し、1949年に中央政府が台北へ移った。1987年に戒厳令が解除され、1996年に初の総統直接選挙が行われた。',
     '六直轄市十三縣三市']];

    /* Both anthem texts are official state texts in the public domain. The words of
       the national anthem are Sun Yat-sen's address of 16 June 1924; he died in
       1925. The flag anthem's words are attributed to Tai Chuan-hsien, who died in
       1949. Reproduced here as the United States sheet reproduces its own. */
    var ANTHEM_V=['三民主義　吾黨所宗','以建民國　以進大同','咨爾多士　為民前鋒',
      '夙夜匪懈　主義是從','矢勤矢勇　必信必忠','一心一德　貫徹始終'];
    var FANTHEM_V=['山川壯麗　物產豐隆','炎黃世冑　東亞稱雄','毋自暴自棄　毋故步自封',
      '光我民族　促進大同','創業維艱　緬懷諸先烈','守成不易　莫徒務近功',
      '同心同德　貫徹始終','青天白日滿地紅'];

    var STR={
    en:{htmlLang:'en',
    fCurrency:'Currency',
    fCodes:'Codes',
    eraYears:'years',
    eraStruct:'Administration at the close',
    islStruct:'Administration at the close',
    eraCaveat:'Boundaries at the transitions are conventional. Several dynasties overlapped by a few years, and the dates of the earliest are traditional reckonings rather than settled fact.',
    islCaveat:'Two holdings cannot sit on a strip that has no room for overlap: Spain held only the north, from 1626 to 1642, and the Republic of Formosa lasted five months in 1895. Both are in the list below.',
    nfSuccList:'Regimes in detail',
    gAuto:"Auto",
    g_paper:"Paper",
    g_dusk:"Dusk",
    g_night:"Night",
    gWhyLight:"Light system,",
    gWhyDark:"Dark system,",
    gWhyDay:"daytime",
    gWhyNight:"after dark",
    gWhyPinned:"Held at",
    lyCaps:"Historical seats",
    eraPre:"Linear in years",
    fidNow:"Boundaries currently in use:",
    eraPrompt:"Select a dynasty on the axis or in the list below.",
    title:'Taiwan Reference Atlas', settings:'Settings',
    sLang:'Language', sGround:'Ground', gPaper:'Paper', gDusk:'Dusk', gNight:'Night',
    sDense:'Tighter type', sSurvey:'Surveyed boundaries', sTown:'Township lines',
    fidLocal:'Built-in outline', fidLoading:'Fetching surveyed data',
    fidSurvey:'Surveyed 1:10 k', fidTown:'Surveyed, with townships',
    fidFail:'Offline: built-in outline',
    layers:'Layers', theme:'Thematic tint', qph:'Search divisions, places, summits',
    mapHint:'Drag to pan, scroll or pinch to zoom, tap a division for its record. Names appear as the sheet is enlarged and any that would overprint a more important one is withheld.',
    lyDiv:'Division outlines', lyTowns:'Townships', lyWater:'Lakes and reservoirs',
    lyRivers:'Rivers', lyRanges:'Mountain ranges', lyParks:'National parks',
    lyCities:'Places', lyNames:'Names', lyGrat:'Graticule',
    thNone:'None', thPop:'Population', thDen:'Persons per km²', thArea:'Area',
    thHh:'Households', thTown:'Townships', thPph:'Persons per household',
    thSextile:'sextiles',
    mEdition:'Edition', mProjection:'Projection', mPopulation:'Population',
    mArea:'Area', mOnSheet:'Divisions · islands · places',
    promptH:'Select a division', promptP:'Tap any division on the sheet, or any row in the register below, to open its record. The search box takes division names, places and summits in all three languages.',
    nPop:'Population', nArea:'Area km²', nDiv:'Divisions', nTown:'Townships',
    nHi:'Highest m', nParks:'Parks', nIsl:'Island outlines', nPeoples:'Peoples',
    tMuni:'Special municipality', tCounty:'County', tCity:'Provincial city',
    tFukien:'County', pvMuni:'Directly under the Executive Yuan',
    pvTw:'Taiwan Province', pvFk:'Fuchien Province',
    fPop:'Population', fArea:'Area km²', fDen:'Per km²', fHh:'Households',
    fTown:'Townships', fPph:'Per household', rank:'rank',
    kSeat:'Seat', kSub:'Subdivisions', kProv:'Tier', kShare:'Share of total',
    bIsl:'Islands', bAbout:'Account', bNote:'Of note', none:'none',
    t0:'Overview', t1:'Register', t1h:'The twenty-two divisions', sortHint:'any column sorts',
    t2:'Relief', t2h:'Principal summits', t3:'Superlatives', t3h:'Extremities and climate',
    t4:'Notes', t4h:'Method and sources', t5:'Islands', t5h:'Islands of the Taiwan Area',
    t6:'Water', t6h:'Principal rivers', t7:'Conservation', t7h:'National parks',
    t8:'Gazetteer', t8h:'Places on the sheet', t9:'Peoples', t9h:'Indigenous peoples',
    nfFlag:'National flag', nfEmblem:'National emblem', nfAnthem:'National anthem',
    nfFlagAnthem:'National flag anthem', nfEras:'Historical eras',
    nfSucc:'Succession of authority', nfHistory:'Milestones', nfOfficial:'Official sources',
    nfFlagP:'Blue sky, white sun, wholly red earth. Lu Hao-tung designed the blue and white device; Sun Yat-sen added the red field. The twelve rays are read as the twelve months of the year and the twelve hours of the traditional day.',
    nfEmblemP:'The same device on a blue disc three times the radius of the sun, so the twelve rays stand clear of the rim. It appears on the presidential standard, on official seals and on the naval ensign.',
    nfErasP:'The Chinese dynastic sequence, on one axis linear in years. Band widths are true to duration, so recent centuries occupy little of it. Nothing is lettered inside a band; every name is given in full below. Select one for a short account of it.',
    nfSuccP:'Who has held the ground this sheet draws, on its own axis and its own span. Overlapping and short-lived holdings are left to the list below: the Spanish held only the north, and the Republic of Formosa lasted five months. Devices that cannot be drawn faithfully are not invented.',
    nfHistoryP:'Dates that changed the map are marked. The administrative lineage of the provincial tier is set out in the register section.',
    lkGov:'government portal', lkMoi:'Ministry of the Interior', lkPres:'Office of the President',
    fCapital:'Capital', fLargest:'Most populous division', fFounded:'Founded',
    fNatDay:'National Day', fDivs:'Municipalities + Taiwan + Fuchien', fTook:'Took over Taiwan',
    flLaw:'In law', flLawV:'Constitution art. 6; National Emblem and National Flag Act art. 4',
    flRatio:'Field', flCanton:'Canton of field', flSun:'Sun and rays',
    flColours:'Colours (recommended)',
    emLawV:'National Emblem and National Flag Act art. 3', emDisc:'Sun to disc',
    emRays:'Rays clear of rim',
    anthemSub:'Words: Sun Yat-sen, 16 June 1924. Music: Cheng Mao-yun, chosen from 139 entries in 1928. Adopted as the national anthem in 1937 and formally established in 1943.',
    anthemNote:'The words are Sun Yat-sen\u2019s address at the opening of the Whampoa Military Academy. The text is in the public domain.',
    fanthemSub:'Words attributed to Tai Chuan-hsien. Music: Huang Tzu, 1933. Played at the raising and lowering of the flag.',
    fanthemNote:'Since the 1984 Winter Olympics the melody has served as the anthem of the Chinese Taipei Olympic team. The text is in the public domain.',
    present:'present',
    cDiv:'Division', cClass:'Class', cSeat:'Seat', cPop:'Population', cHh:'Households',
    cArea:'Area km²', cDen:'Per km²', cTown:'Townships', cSummit:'Summit',
    cHeight:'Height m', cWhere:'Where', cNote:'Note', cRiver:'River', cLen:'Length km',
    cBasin:'Basin km²', cPark:'Park', cDesig:'Designated', cArea2:'Area',
    cIsland:'Island', cPlace:'Place', cLon:'Longitude', cLat:'Latitude', cTier:'Shown from',
    cPeople:'People', cRecog:'Recognised',
    xMostPop:'Most populous', xLeastPop:'Least populous', xLargest:'Largest by area',
    xSmallest:'Smallest by area', xDensest:'Densest', xSparsest:'Least dense',
    n1h:'Boundaries', n1:'Boundaries come in two tiers and the badge beside the title says which is live. The surveyed tier is the Ministry of the Interior\u2019s 直轄市、縣市界線 and 鄉鎮市區界線 in TWD97 longitude and latitude, redistributed as TopoJSON by taiwan-atlas at a scale of 1:10,000, fetched from a public mirror when the page opens. The built-in tier is a generalised outline built by hand: one shared coastline of 954 vertices at roughly one kilometre spacing, cut into arcs, with each interior boundary written once and quoted by both neighbours. It reads correctly at sheet scale but it is not survey data and nothing on it should be measured. Where the network is unavailable the built-in tier is used and the badge says so.',
    n2h:'Population', n2:'Population, households and township counts are the Ministry of the Interior\u2019s Demography Quarterly for Spring 2026, current to 31 March 2026. The totals reconcile exactly with the published figures: 23,270,568 persons, 9,892,098 households, 368 townships and districts.',
    n3h:'The provincial tier', n3:'Taiwan Province and Fuchien Province remain in the additional articles of the Constitution, but their budgets were zeroed and their functions transferred on 1 July 2018. No provincial organ now operates. The register lists divisions under the tier they belong to in law.',
    n4h:'The flag and the emblem', n4:'Both are constructed from the National Emblem and National Flag Act rather than traced from an image, so every proportion on the page is the one the statute states. The Act fixes no colour values; the red and blue used here follow the Ministry of the Interior\u2019s recommendation.',
    n5h:'What is not drawn', n5:'Only the larger islands of the Penghu group are drawn, not all ninety. The Diaoyutai Islands are assigned in law to Toucheng in Yilan but are not under effective control and are not drawn. Dongsha and Taiping Island lie far outside the frame and appear in the island table only. Relief is shown as ranges and summits, not as a computed surface.',
    srcH:'Sources'},

    zh:{htmlLang:'zh-Hant-TW',
    fCurrency:'貨幣',
    fCodes:'代碼',
    eraYears:'年',
    eraStruct:'期末建置',
    islStruct:'期末建置',
    eraCaveat:'各朝交替之年係依通說取整。數朝之際實有數年並存，最古者之年代亦為傳統推算，非定論。',
    islCaveat:'並存者無法置於同一橫軸：西班牙僅據北臺灣，起一六二六年迄一六四二年；臺灣民主國於一八九五年立，五月而亡。二者均見於下方詳目。',
    nfSuccList:'各政權詳目',
    gAuto:"自動",
    g_paper:"紙",
    g_dusk:"暮",
    g_night:"夜",
    gWhyLight:"系統為亮色，",
    gWhyDark:"系統為暗色，",
    gWhyDay:"白天",
    gWhyNight:"入夜",
    gWhyPinned:"已固定為",
    lyCaps:"歷代治所",
    eraPre:"橫軸依年數等比",
    fidNow:"目前使用之界線：",
    eraPrompt:"請於橫軸或下方列表選擇一朝。",
    title:'臺灣輿圖', settings:'設定',
    sLang:'語言', sGround:'底色', gPaper:'紙', gDusk:'暮', gNight:'夜',
    sDense:'緊排', sSurvey:'測繪界線', sTown:'鄉鎮市區界',
    fidLocal:'內建輪廓', fidLoading:'讀取測繪圖資',
    fidSurvey:'測繪 1:1 萬', fidTown:'測繪，含鄉鎮市區',
    fidFail:'離線：使用內建輪廓',
    layers:'圖層', theme:'分級設色', qph:'搜尋政區、地名、山峰',
    mapHint:'拖曳平移，滾動或雙指縮放，點選政區可展開該區紀錄。地名隨放大逐級出現，若與較重要者相疊則自動隱去。',
    lyDiv:'政區界線', lyTowns:'鄉鎮市區', lyWater:'湖泊水庫',
    lyRivers:'河川', lyRanges:'山脈', lyParks:'國家公園',
    lyCities:'聚落', lyNames:'地名', lyGrat:'經緯網',
    thNone:'無', thPop:'人口', thDen:'每平方公里人口', thArea:'面積',
    thHh:'戶數', thTown:'鄉鎮市區數', thPph:'平均戶量', thSextile:'六分位',
    mEdition:'版次', mProjection:'投影', mPopulation:'總人口',
    mArea:'面積', mOnSheet:'政區 · 島嶼 · 地名',
    promptH:'請選擇政區', promptP:'點選圖上任一政區，或下方總表任一列，即可展開該區紀錄。搜尋框可輸入三種語言的政區、地名與山峰。',
    nPop:'總人口', nArea:'面積 km²', nDiv:'一級政區', nTown:'鄉鎮市區',
    nHi:'最高點 m', nParks:'國家公園', nIsl:'島嶼輪廓', nPeoples:'原住民族',
    tMuni:'直轄市', tCounty:'縣', tCity:'省轄市', tFukien:'縣',
    pvMuni:'直隸行政院', pvTw:'臺灣省', pvFk:'福建省',
    fPop:'人口', fArea:'面積 km²', fDen:'每 km²', fHh:'戶數',
    fTown:'鄉鎮市區', fPph:'平均戶量', rank:'排名',
    kSeat:'治所', kSub:'轄下', kProv:'層級', kShare:'占總人口',
    bIsl:'所屬島嶼', bAbout:'概述', bNote:'要目', none:'無',
    t0:'國家概覽', t1:'總表', t1h:'二十二個一級政區', sortHint:'點欄位標題可排序',
    t2:'地形', t2h:'主要山峰', t3:'極值', t3h:'四極與氣候',
    t4:'說明', t4h:'方法與來源', t5:'島嶼', t5h:'臺灣地區島嶼',
    t6:'水系', t6h:'主要河川', t7:'保育', t7h:'國家公園',
    t8:'地名', t8h:'圖上地名', t9:'族群', t9h:'原住民族',
    nfFlag:'國旗', nfEmblem:'國徽', nfAnthem:'國歌',
    nfFlagAnthem:'國旗歌', nfEras:'歷史分期',
    nfSucc:'政權遞嬗', nfHistory:'大事', nfOfficial:'官方資訊',
    nfFlagP:'青天、白日、滿地紅。陸皓東設計青天白日，孫中山增紅地為滿地紅。白日十二道光芒，釋為一年十二月、一日十二時辰。',
    nfEmblemP:'同一圖徽置於青地圓形，圓半徑為白日半徑之三倍，故十二道光芒不觸外緣。國徽用於總統旗、官署印信及海軍艦艏旗。',
    nfErasP:'中國歷代王朝，置於一條依年數等比之橫軸。各段寬度悉依年數，故近世所占甚小。段內不著文字，各朝名稱全列於下。點選任一段可閱其小傳。',
    nfSuccP:'本圖所繪之土地，歷來由誰掌管，另置一軸，自有其起訖。並存或短暫者列於下方詳目：西班牙僅據北臺灣，臺灣民主國五月而亡。無法忠實繪出之圖徽不以臆造充數。',
    nfHistoryP:'凡改變輿圖者另作標記。省級行政層級之沿革見「說明」一節。',
    lkGov:'政府入口網', lkMoi:'內政部', lkPres:'總統府',
    fCapital:'首都', fLargest:'人口最多之政區', fFounded:'建國',
    fNatDay:'國慶日', fDivs:'直轄市 + 臺灣省 + 福建省', fTook:'接收臺灣',
    flLaw:'法源', flLawV:'憲法第六條；國徽國旗法第四條',
    flRatio:'旗面', flCanton:'青天占全旗', flSun:'白日與光芒',
    flColours:'色值（建議）',
    emLawV:'國徽國旗法第三條', emDisc:'白日與青地',
    emRays:'光芒不觸外環',
    anthemSub:'詞：孫中山，民國十三年六月十六日。曲：程懋筠，民國十七年自一三九件應徵作品中獲選。民國二十六年定為國歌，三十二年正式確立。',
    anthemNote:'歌詞為孫中山於黃埔軍校開學典禮之訓詞。此文本屬公有領域。',
    fanthemSub:'詞：通常署戴傳賢。曲：黃自，民國二十二年。升降國旗時奏此曲。',
    fanthemNote:'自民國七十三年冬季奧運起，此曲旋律作為中華臺北代表隊之會歌。此文本屬公有領域。',
    present:'迄今',
    cDiv:'政區', cClass:'類別', cSeat:'治所', cPop:'人口', cHh:'戶數',
    cArea:'面積 km²', cDen:'每 km²', cTown:'鄉鎮市區', cSummit:'山峰',
    cHeight:'高度 m', cWhere:'所在', cNote:'說明', cRiver:'河川', cLen:'長度 km',
    cBasin:'流域 km²', cPark:'國家公園', cDesig:'公告', cArea2:'面積',
    cIsland:'島嶼', cPlace:'地名', cLon:'經度', cLat:'緯度', cTier:'顯示層級',
    cPeople:'族名', cRecog:'認定',
    xMostPop:'人口最多', xLeastPop:'人口最少', xLargest:'面積最大',
    xSmallest:'面積最小', xDensest:'人口最稠', xSparsest:'人口最疏',
    n1h:'界線', n1:'界線分兩級，標題旁的徽記顯示目前使用哪一級。測繪級為內政部《直轄市、縣市界線》與《鄉鎮市區界線》（TWD97 經緯度），由 taiwan-atlas 轉為 TopoJSON，比例尺一比一萬，於開啟頁面時自公開鏡像取得。內建級為手工概化之輪廓：單一共用海岸線九五四點，平均間距約一公里，切為弧段，各內陸界線只寫一次而由兩側共同引用。此級於圖幅比例下判讀無誤，但非測繪成果，不得據以量測。網路無法取得時即改用內建級，徽記會如實顯示。',
    n2h:'人口', n2:'人口、戶數與鄉鎮市區數為內政部戶政司《人口統計季刊》民國一一五年春季，統計至一一五年三月三十一日。合計數與公布數完全相符：二三、二七〇、五六八人，九、八九二、〇九八戶，三六八個鄉鎮市區。',
    n3h:'省級層級', n3:'臺灣省與福建省仍見於憲法增修條文，惟自民國一〇七年七月一日起預算歸零、業務移轉，省級機關已無運作。總表仍依法定層級列示各政區歸屬。',
    n4h:'國旗與國徽', n4:'二者均依《中華民國國徽國旗法》作圖，非取自圖檔，故各項比例悉為法定之數。該法未規定色值，此處紅、青二色採內政部建議值。',
    n5h:'未繪出者', n5:'澎湖群島僅繪較大島嶼，未繪全部九十座。釣魚臺列嶼依法劃歸宜蘭縣頭城鎮，惟不在實際控制之下，未予繪出。東沙島與太平島遠在圖幅之外，僅列於島嶼表。地形以山脈與山峰表示，未作連續地形面。',
    srcH:'資料來源'},

    ja:{htmlLang:'ja',
    fCurrency:'通貨',
    fCodes:'コード',
    eraYears:'年間',
    eraStruct:'期末の行政区分',
    islStruct:'期末の行政区分',
    eraCaveat:'王朝の境の年は通説により丸めている。いくつかの王朝は数年重なっており、最古の年代は伝統的な推算であって定説ではない。',
    islCaveat:'重なる統治は一本の帯には収まらない。スペインは1626年から1642年まで北部のみを領し、台湾民主国は1895年に五か月で滅んだ。いずれも下の一覧に記す。',
    nfSuccList:'各政権の詳細',
    gAuto:"自動",
    g_paper:"紙",
    g_dusk:"黄昏",
    g_night:"夜",
    gWhyLight:"システムは明色、",
    gWhyDark:"システムは暗色、",
    gWhyDay:"日中",
    gWhyNight:"夜間",
    gWhyPinned:"固定：",
    lyCaps:"歴代の政庁",
    eraPre:"年数に比例する軸",
    fidNow:"現在使用中の境界：",
    eraPrompt:"横軸または下の一覧から王朝を選んでください。",
    title:'台湾地図帳', settings:'設定',
    sLang:'言語', sGround:'地色', gPaper:'紙', gDusk:'黄昏', gNight:'夜',
    sDense:'字を詰める', sSurvey:'測量境界', sTown:'郷鎮市区界',
    fidLocal:'内蔵輪郭', fidLoading:'測量データ取得中',
    fidSurvey:'測量 1:1万', fidTown:'測量・郷鎮市区つき',
    fidFail:'オフライン：内蔵輪郭',
    layers:'レイヤー', theme:'階級区分', qph:'行政区・地名・山を検索',
    mapHint:'ドラッグで移動、スクロールまたはピンチで拡大、行政区をタップすると記録が開きます。地名は拡大に応じて現れ、重要な名称と重なるものは表示を控えます。',
    lyDiv:'行政区界', lyTowns:'郷鎮市区', lyWater:'湖沼・ダム',
    lyRivers:'河川', lyRanges:'山脈', lyParks:'国立公園',
    lyCities:'集落', lyNames:'地名', lyGrat:'経緯線',
    thNone:'なし', thPop:'人口', thDen:'人口密度', thArea:'面積',
    thHh:'世帯数', thTown:'郷鎮市区数', thPph:'一世帯当たり人員', thSextile:'六分位',
    mEdition:'版', mProjection:'投影法', mPopulation:'総人口',
    mArea:'面積', mOnSheet:'行政区 · 島嶼 · 地名',
    promptH:'行政区を選択', promptP:'図上の行政区、または下の一覧の行をタップすると記録が開きます。検索欄は三言語の行政区名・地名・山名に対応します。',
    nPop:'総人口', nArea:'面積 km²', nDiv:'第一級行政区', nTown:'郷鎮市区',
    nHi:'最高地点 m', nParks:'国立公園', nIsl:'島嶼輪郭', nPeoples:'原住民族',
    tMuni:'直轄市', tCounty:'県', tCity:'省轄市', tFukien:'県',
    pvMuni:'行政院直轄', pvTw:'台湾省', pvFk:'福建省',
    fPop:'人口', fArea:'面積 km²', fDen:'／km²', fHh:'世帯数',
    fTown:'郷鎮市区', fPph:'一世帯当たり', rank:'順位',
    kSeat:'庁所在地', kSub:'下位区分', kProv:'階層', kShare:'総人口比',
    bIsl:'所属島嶼', bAbout:'概要', bNote:'要目', none:'なし',
    t0:'国の概要', t1:'一覧', t1h:'二十二の第一級行政区', sortHint:'列見出しで並べ替え',
    t2:'地形', t2h:'主要な山', t3:'極値', t3h:'四極と気候',
    t4:'注記', t4h:'方法と出典', t5:'島嶼', t5h:'台湾地区の島嶼',
    t6:'水系', t6h:'主要河川', t7:'保護地域', t7h:'国立公園',
    t8:'地名', t8h:'図上の地名', t9:'民族', t9h:'原住民族',
    nfFlag:'国旗', nfEmblem:'国徽', nfAnthem:'国歌',
    nfFlagAnthem:'国旗歌', nfEras:'歴史区分',
    nfSucc:'政権の変遷', nfHistory:'主な出来事', nfOfficial:'公式情報',
    nfFlagP:'青天白日満地紅。陸皓東が青天白日の意匠を設計し、孫文が赤地を加えた。白日の十二の光芒は一年十二か月、一日十二辰を表すと説明される。',
    nfEmblemP:'同じ図像を青地の円に置き、円の半径は白日の半径の三倍であるため、十二の光芒は外縁に達しない。総統旗・官印・海軍艦首旗に用いられる。',
    nfErasP:'中国の歴代王朝を、年数に比例する一本の横軸に置いた。幅は年数どおりで、近世の占める割合は小さい。帯の中に文字は置かず、名称はすべて下に列記する。帯を選ぶと簡単な説明が出る。',
    nfSuccP:'この図が描く土地を誰が統治してきたかを、独自の軸と期間で示す。重複するものや短命なものは下の詳細に譲る。スペインは北部のみ、台湾民主国は五か月であった。忠実に描けない図像は捏造しない。',
    nfHistoryP:'地図を変えた年は印を付けている。省の行政階層の沿革は「注記」の節に記す。',
    lkGov:'政府ポータル', lkMoi:'内政部', lkPres:'総統府',
    fCapital:'首都', fLargest:'人口最多の行政区', fFounded:'建国',
    fNatDay:'建国記念日', fDivs:'直轄市＋台湾省＋福建省', fTook:'台湾接収',
    flLaw:'法源', flLawV:'憲法第六条、国徽国旗法第四条',
    flRatio:'旗面', flCanton:'青天の占める割合', flSun:'白日と光芒',
    flColours:'色（推奨値）',
    emLawV:'国徽国旗法第三条', emDisc:'白日と青地',
    emRays:'光芒は外環に触れない',
    anthemSub:'詞：孫文、1924年6月16日。曲：程懋筠、1928年の公募で139点から選出。1937年に国歌とされ、1943年に正式に確立した。',
    anthemNote:'詞は孫文が黄埔軍官学校の開校式で述べた訓辞である。本文は公有領域にある。',
    fanthemSub:'詞：通常は戴伝賢とされる。曲：黄自、1933年。国旗の掲揚・降納の際に演奏される。',
    fanthemNote:'1984年冬季五輪以降、この旋律がチャイニーズタイペイ代表の会歌として用いられている。本文は公有領域にある。',
    present:'現在',
    cDiv:'行政区', cClass:'区分', cSeat:'庁所在地', cPop:'人口', cHh:'世帯数',
    cArea:'面積 km²', cDen:'／km²', cTown:'郷鎮市区', cSummit:'山',
    cHeight:'標高 m', cWhere:'所在', cNote:'説明', cRiver:'河川', cLen:'長さ km',
    cBasin:'流域 km²', cPark:'国立公園', cDesig:'指定', cArea2:'面積',
    cIsland:'島嶼', cPlace:'地名', cLon:'経度', cLat:'緯度', cTier:'表示階層',
    cPeople:'民族', cRecog:'認定',
    xMostPop:'人口最多', xLeastPop:'人口最少', xLargest:'面積最大',
    xSmallest:'面積最小', xDensest:'人口密度最大', xSparsest:'人口密度最小',
    n1h:'境界', n1:'境界は二階層あり、表題横のバッジがどちらを使用中かを示す。測量階層は内政部の「直轄市、縣市界線」および「鄉鎮市區界線」（TWD97経緯度）を taiwan-atlas が TopoJSON として再配布したもので、縮尺1万分の1、ページを開いた際に公開ミラーから取得する。内蔵階層は手作業で概略化した輪郭で、共有海岸線954点（平均間隔約1キロ）を弧に切り分け、内陸の境界は一度だけ記して両側が参照する。図幅の縮尺では正しく読めるが測量成果ではなく、計測に用いてはならない。ネットワークが利用できない場合は内蔵階層を用い、バッジがその旨を示す。',
    n2h:'人口', n2:'人口・世帯数・郷鎮市区数は内政部戸政司『人口統計季刊』民国115年春季（115年3月31日現在）による。合計は公表値と完全に一致する。23,270,568人、9,892,098世帯、368の郷鎮市区。',
    n3h:'省の階層', n3:'台湾省と福建省は憲法増修条文に残るが、民国107年7月1日に予算がゼロとなり業務が移管され、省の機関は稼働していない。一覧は法定の階層に従って各行政区を示している。',
    n4h:'国旗と国徽', n4:'いずれも画像の複製ではなく中華民国国徽国旗法に基づいて作図しており、比率はすべて法定の値である。同法は色値を定めておらず、ここでの赤と青は内政部の推奨値による。',
    n5h:'描いていないもの', n5:'澎湖群島は主要な島のみを描き、九十島すべてではない。釣魚台列島は法制上は宜蘭県頭城鎮に属するが実効支配下になく、描いていない。東沙島と太平島は図の範囲外にあり島嶼表にのみ記載する。地形は山脈と山で示し、連続した地形面としては描いていない。',
    srcH:'出典'}
    };

    /* ==========================================================================
       Taiwan Reference Atlas — application

       Same machinery as the United States sheet. The map is one SVG; zoom rewrites
       the viewBox and publishes 1/scale as --u, so every stroke and every letter is
       specified in screen pixels and stays the same size at any magnification.
       Markers sit in a counter-scaled group so a dot stays a dot. Labels are tiered
       by zoom and then decluttered in screen space.

       Geometry comes in two tiers, exactly as on the United States sheet. The
       surveyed tier is the Ministry of the Interior's 直轄市、縣市界線 and
       鄉鎮市區界線 (TWD97 lon/lat), redistributed as TopoJSON by taiwan-atlas at
       1:10,000, fetched when the page opens. The built-in tier is the hand-built
       outline used when the network is unavailable. The badge beside the title
       says which is live.
       ========================================================================== */
    var $=function(s,r){return (r||document).querySelector(s);};
    var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));};
    var NS='http://www.w3.org/2000/svg';
    function el(t,a){var n=document.createElementNS(NS,t);if(a)for(var k in a)n.setAttribute(k,a[k]);return n;}
    function fmt(n){return Number(n).toLocaleString('en-US');}
    function esc(s){return String(s).replace(/[&<>"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
    var cur='en';
    function T(k){var d=STR[cur];return (d&&d[k]!==undefined)?d[k]:STR.en[k];}
    var LI=function(){return cur==='zh'?1:cur==='ja'?2:0;};

    /* ---------------------------------------------------------------- data --- */
    var CODES=DIV.map(function(d){return d.id;});
    var BY={}; DIV.forEach(function(d){BY[d.id]=d;});
    var TOTP=0,TOTH=0,TOTA=0,TOTS=0;
    DIV.forEach(function(d){TOTP+=d.pop;TOTH+=d.hh;TOTA+=d.area;TOTS+=d.subN;});
    DIV.forEach(function(d){d.den=d.pop/d.area; d.pph=d.pop/d.hh;});
    (function(){
      var byP=DIV.slice().sort(function(a,b){return b.pop-a.pop;});
      var byA=DIV.slice().sort(function(a,b){return b.area-a.area;});
      var byD=DIV.slice().sort(function(a,b){return b.den-a.den;});
      byP.forEach(function(d,i){d.pr=i+1;});
      byA.forEach(function(d,i){d.ar=i+1;});
      byD.forEach(function(d,i){d.dr=i+1;});
    })();
    var TYPEK={muni:'tMuni',county:'tCounty',city:'tCity',fukien:'tFukien'};
    var PROVK={muni:'pvMuni',county:'pvTw',city:'pvTw',fukien:'pvFk'};
    var JAMAP={'臺':'台','縣':'県','區':'区','鄉':'郷','灣':'湾'};
    function toJa(s){return String(s).replace(/[臺縣區鄉灣]/g,function(c){return JAMAP[c]||c;});}
    function dN(d){return cur==='zh'?d.zh:cur==='ja'?toJa(d.zh):d.en;}
    function dAlt(d){return cur==='en'?d.zh:d.en;}
    function dSeat(d){return cur==='zh'?d.seat:cur==='ja'?toJa(d.seat):d.seatEn;}
    function dSub(d){return cur==='zh'?d.sub:cur==='ja'?toJa(d.sub):d.subEn;}
    function dNote(d){return cur==='zh'?d.nZh:cur==='ja'?(NJA[d.id]||d.nEn):d.nEn;}
    function dHigh(d){return cur==='zh'?d.hZh:cur==='ja'?(HJA[d.id]||d.hEn):d.hEn;}

    /* ---------------------------------------------------------- projection --- */
    /* Albers equal area conic, standard parallels 22.5N and 25.0N, origin 120.9E.
       The same family as the United States sheet; at this span the island is
       within a fraction of a percent of true area everywhere. */
    var RAD=Math.PI/180;
    var ALB=(function(){
      var p0=22.5*RAD,p1=25.0*RAD,lat0=23.6*RAD,lon0=120.9*RAD;
      var n=(Math.sin(p0)+Math.sin(p1))/2;
      var C=Math.cos(p0)*Math.cos(p0)+2*n*Math.sin(p0);
      var r0=Math.sqrt(C-2*n*Math.sin(lat0))/n;
      return function(lon,lat){
        var t=n*(lon*RAD-lon0), r=Math.sqrt(C-2*n*Math.sin(lat*RAD))/n;
        /* y is negated on the way out: the conic formula increases northward,
           the SVG coordinate system increases downward. */
        return [r*Math.sin(t), -(r0-r*Math.cos(t))];
      };
    })();
    var SHEET=[0,0,820,980], PJ=null, HOMEV=null;
    function fitProjection(){
      var pts=[];
      function add(lo,la){pts.push(ALB(lo,la));}
      for(var i=0;i<CO.length;i+=2) add(CO[i],CO[i+1]);
      ISL.forEach(function(r){for(var i=0;i<r[5].length;i+=2) add(r[5][i],r[5][i+1]);});
      var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      pts.forEach(function(p){
        if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
        if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1];});
      var pad=26, W=SHEET[2]-pad*2, H=SHEET[3]-pad*2;
      var k=Math.min(W/(x1-x0), H/(y1-y0));
      var ox=pad+(W-(x1-x0)*k)/2 - x0*k, oy=pad+(H-(y1-y0)*k)/2 - y0*k;
      PJ=function(lon,lat){var p=ALB(lon,lat);return [p[0]*k+ox, p[1]*k+oy];};
      PJ.k=k;
      /* Everything sits at its true position in the sheet's coordinate space, but
         the view opens on the main island and Penghu. Fitting the opening view to
         the whole territory would push the island against the right-hand edge,
         because Kinmen lies four degrees to the west. Kinmen and Matsu are reached
         by zooming out or panning, and the reset button returns here. */
      var ix0=1e9,iy0=1e9,ix1=-1e9,iy1=-1e9;
      function grow(lo,la){var q=PJ(lo,la);
        if(q[0]<ix0)ix0=q[0]; if(q[0]>ix1)ix1=q[0];
        if(q[1]<iy0)iy0=q[1]; if(q[1]>iy1)iy1=q[1];}
      for(var j=0;j<CO.length;j+=2) grow(CO[j],CO[j+1]);
      ISL.forEach(function(r){
        if(r[4]!=='PEN'&&r[4]!=='KEL'&&r[4]!=='ILA'&&r[4]!=='TTT'&&r[4]!=='PIF') return;
        for(var j2=0;j2<r[5].length;j2+=2) grow(r[5][j2],r[5][j2+1]);});
      var m=18, aw=SHEET[2]/SHEET[3];
      var w=(ix1-ix0)+m*2, h=(iy1-iy0)+m*2;
      if(w/h<aw) w=h*aw; else h=w/aw;
      HOMEV=[(ix0+ix1)/2-w/2,(iy0+iy1)/2-h/2,w,h];
    }
    fitProjection();
    function projRing(r){return r.map(function(p){return PJ(p[0],p[1]);});}
    function dOf(pts,close){
      if(!pts.length) return '';
      var d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
      for(var i=1;i<pts.length;i++) d+='L'+pts[i][0].toFixed(1)+' '+pts[i][1].toFixed(1);
      return d+(close?'Z':'');
    }
    function ringsToPath(rs,lonlat){
      var d='';
      for(var i=0;i<rs.length;i++){
        var r=rs[i]; if(r.length<3) continue;
        if(lonlat) r=projRing(r);
        d+=dOf(r,true);
      }
      return d;
    }

    /* -------------------------------------------------- built-in geometry ---- */
    var N=CO.length/2;
    function cpt(i){return [CO[2*i],CO[2*i+1]];}
    function findCoast(lon,lat){
      for(var i=0;i<N;i++) if(CO[2*i]===lon&&CO[2*i+1]===lat) return i;
      throw new Error('coast vertex '+lon+','+lat);
    }
    var CUTI={};
    (function(){var prev=0;
      CUTS.forEach(function(c,k){
        var i=findCoast(c[1],c[2]);
        if(i===0&&k===CUTS.length-1) i=N;
        CUTI[c[0]]=[prev,i]; prev=i;});})();
    function f2p(a){var o=[];for(var i=0;i<a.length;i+=2)o.push([a[i],a[i+1]]);return o;}
    function edge(name){
      var rev=name.charAt(0)==='~', k=rev?name.slice(1):name;
      var p=f2p(ED[k]); return rev?p.slice().reverse():p;
    }
    function assemble(id){
      var out=[];
      RING[id].forEach(function(p){
        var seg;
        if(p==='c'){var a=CUTI[id][0],b=CUTI[id][1];seg=[];
          for(var i=a;i<=b;i++) seg.push(cpt(i%N));}
        else seg=edge(p);
        if(out.length){var l=out[out.length-1];
          if(Math.abs(l[0]-seg[0][0])<1e-9&&Math.abs(l[1]-seg[0][1])<1e-9) seg=seg.slice(1);}
        out.push.apply(out,seg);
      });
      return out;
    }
    var LOCAL={};
    Object.keys(RING).forEach(function(id){LOCAL[id]=[assemble(id)];});
    LOCAL.TPE=[f2p(ENC.TPE)]; LOCAL.CYI=[f2p(ENC.CYI)];
    ['KEL','HSC'].forEach(function(id){
      var s=SUBCUT[id], a=findCoast(s[0],s[1]), b=findCoast(s[2],s[3]), r=[];
      for(var i=a;i<=b;i++) r.push(cpt(i));
      r.push.apply(r,f2p(CITYIN[id]).slice(1));
      LOCAL[id]=[r];
    });
    var ISLBY={};
    ISL.forEach(function(r){
      (ISLBY[r[4]]=ISLBY[r[4]]||[]).push({id:r[0],zh:r[1],en:r[2],ja:r[3],pts:f2p(r[5])});
    });
    Object.keys(ISLBY).forEach(function(k){
      if(!LOCAL[k]) LOCAL[k]=[];
      ISLBY[k].forEach(function(o){LOCAL[k].push(o.pts);});
    });
    var COASTRING=(function(){var r=[];for(var i=0;i<N;i++)r.push(cpt(i));return r;})();
    var GEOM=LOCAL, FID='local';

    /* ------------------------------------------------------------- svg tree -- */
    var svg=$('#map'), stage=$('#stage'), tip=$('#tip'), reader=$('#reader');
    var L={}, paths={};
    function layer(k){var g=el('g',{'data-layer':k});L[k]=g;svg.appendChild(g);return g;}
    ['grat','divisions','towns','coast','water','rivers','ranges','parks',
     'hit','capitals','names','cities'].forEach(layer);
    /* One counter-scaled group per marker, nested inside its translate. Putting a
       single .mk around everything scaled the translates too, so every marker's
       position was multiplied by 1/zoom: markers slid against the map and collapsed
       toward the origin as it was enlarged. The translate must stay in map units
       and the scale must reach only the marker's own geometry. */
    function marker(x,y){
      var g=el('g',{'transform':'translate('+x.toFixed(1)+' '+y.toFixed(1)+')'});
      var inner=el('g',{'class':'mk'});
      g.appendChild(inner);
      return {g:g,mk:inner};
    }

    var lblDiv=[], lblCity=[], lblPeak=[], lblWater=[], lblRange=[], lblIsl=[],
        lblCap=[];

    function drawGeometry(){
      L.divisions.textContent=''; L.hit.textContent=''; L.coast.textContent='';
      L.towns.textContent='';
      paths={};
      var order=CODES.slice().sort(function(a,b){
        var rank={TPE:3,KEL:3,HSC:3,CYI:3};
        return (rank[a]||0)-(rank[b]||0);});
      order.forEach(function(c){
        var rs=GEOM[c]; if(!rs||!rs.length) return;
        var p=el('path',{'class':'st','d':ringsToPath(rs,true),'data-c':c});
        L.divisions.appendChild(p); paths[c]=p;
      });
      if(FID==='local'){
        L.coast.appendChild(el('path',{'class':'coast','d':dOf(projRing(COASTRING),true)}));
        ISL.forEach(function(r){
          L.coast.appendChild(el('path',{'class':'coast','d':dOf(projRing(f2p(r[5])),true)}));});
      }
    }
    function drawTowns(rings){
      L.towns.textContent='';
      if(!rings||!rings.length) return;
      L.towns.appendChild(el('path',{'class':'twp','d':rings}));
    }

    function drawStatic(){
      /* graticule at half a degree */
      var g='';
      for(var lo=118;lo<=122.5;lo+=0.5){
        var a=PJ(lo,21.5), b=PJ(lo,26.7); g+='M'+a[0].toFixed(1)+' '+a[1].toFixed(1)
          +'L'+b[0].toFixed(1)+' '+b[1].toFixed(1);}
      for(var la=21.5;la<=26.7;la+=0.5){
        var c=PJ(117.9,la), d2=PJ(122.6,la); g+='M'+c[0].toFixed(1)+' '+c[1].toFixed(1)
          +'L'+d2[0].toFixed(1)+' '+d2[1].toFixed(1);}
      L.grat.appendChild(el('path',{'class':'grat','d':g,'data-lbl':'g1'}));
      var t=PJ(117.9,23.4372), t2=PJ(122.6,23.4372);
      L.grat.appendChild(el('path',{'class':'ibox','d':'M'+t[0].toFixed(1)+' '+t[1].toFixed(1)
        +'L'+t2[0].toFixed(1)+' '+t2[1].toFixed(1),'stroke':'var(--red)','opacity':'.45'}));

      /* Lakes. The radius is given in degrees, so it is converted by projecting an
         offset point rather than by multiplying the fit scale: PJ.k scales
         projection units, not degrees, and using it here drew every lake tens of
         thousands of pixels wide. */
      WATERB.forEach(function(w){
        var p=PJ(w[2],w[3]);
        var rx=Math.abs(PJ(w[2]+w[4],w[3])[0]-p[0]);
        var ry=Math.abs(PJ(w[2],w[3]+w[4])[1]-p[1]);
        rx=Math.max(1.6,rx); ry=Math.max(1.2,ry);
        L.water.appendChild(el('ellipse',{'class':'lake','cx':p[0].toFixed(1),
          'cy':p[1].toFixed(1),'rx':rx.toFixed(1),'ry':ry.toFixed(1)}));
        var tx=el('text',{'class':'tw twl','x':(p[0]+rx+3).toFixed(1),
          'y':(p[1]+3).toFixed(1),'data-lbl':'w2'});
        tx.dataset.zh=w[0]; tx.dataset.en=w[1];
        L.names.appendChild(tx); lblWater.push(tx);
      });
      /* rivers, tapered from source to mouth */
      COURSE.forEach(function(c){
        var pts=f2p(c[2]);
        var last=pts[pts.length-1], bi=0, bd=1e9;
        for(var i=0;i<N;i++){var q=cpt(i);
          var dd=Math.hypot((q[0]-last[0])*0.916,q[1]-last[1]);
          if(dd<bd){bd=dd;bi=i;}}
        pts[pts.length-1]=cpt(bi).slice();
        var pr=projRing(pts);
        var id='rv'+lblRange.length+'_'+Math.random().toString(36).slice(2,7);
        var pa=el('path',{'class':'riv','d':dOf(pr,false),'id':id,
          'stroke-width':'calc(var(--u)*1.5px)'});
        L.rivers.appendChild(pa);
        var tp=el('textPath',{'href':'#'+id,'startOffset':'46%'});
        var tx=el('text',{'class':'tw','data-lbl':'w1'});
        tx.dataset.zh=c[0]; tx.dataset.en=c[1];
        tx.setAttribute('text-anchor','middle');
        tx.appendChild(tp); L.names.appendChild(tx);
        lblRange.push({t:tx,tp:tp,id:id,kind:'r'});
      });
      /* ranges */
      SPINE.forEach(function(s){
        var pts=[]; for(var i=0;i<s[3].length;i+=3) pts.push([s[3][i],s[3][i+1]]);
        if(pts.length<2) return;
        var pr=projRing(pts);
        var id='rg'+lblRange.length;
        L.ranges.appendChild(el('path',{'class':'rng','d':dOf(pr,false),'id':id}));
        var tp=el('textPath',{'href':'#'+id,'startOffset':'50%'});
        var tx=el('text',{'class':'tg','data-lbl':'w1'});
        tx.dataset.zh=s[0]; tx.dataset.en=s[1];
        tx.setAttribute('text-anchor','middle');
        tx.appendChild(tp); L.names.appendChild(tx);
        lblRange.push({t:tx,tp:tp,id:id,kind:'g'});
      });
      /* parks */
      PARKP.forEach(function(p){
        if(!p[2]||p[2].length<8) return;
        L.parks.appendChild(el('path',{'class':'prk','d':ringsToPath([f2p(p[2])],true),
          'fill':'color-mix(in srgb,var(--tokiwa) 14%,transparent)',
          'stroke':'var(--tokiwa)','stroke-width':'calc(var(--u)*.9px)',
          'stroke-dasharray':'calc(var(--u)*3.5px) calc(var(--u)*2.5px)'}));
      });
      /* summits */
      PEAKPT.forEach(function(k){
        var p=PJ(k[2],k[3]), m=marker(p[0],p[1]);
        m.mk.appendChild(el('path',{'class':'pk','data-pk':k[0],
          'd':'M0 -4l3.6 6.2h-7.2Z'}));
        var tx=el('text',{'class':'pkl','x':5,'y':3.4,'data-lbl':'p1'});
        tx.dataset.zh=k[0]; tx.dataset.en=k[1]; tx.dataset.h=k[4];
        m.mk.appendChild(tx); L.cities.appendChild(m.g); lblPeak.push(tx);
      });
      /* island names */
      ISL.forEach(function(r){
        var pts=f2p(r[5]), cx=0, cy=0;
        pts.forEach(function(q){cx+=q[0];cy+=q[1];});
        var p=PJ(cx/pts.length,cy/pts.length);
        var tx=el('text',{'class':'il','x':p[0].toFixed(1),'y':(p[1]-5).toFixed(1),
          'data-lbl':'c2'});
        tx.dataset.zh=r[1]; tx.dataset.en=r[2]; tx.dataset.ja=r[3];
        L.names.appendChild(tx); lblIsl.push(tx);
      });
      /* places */
      PLACE.forEach(function(pl){
        var p=PJ(pl[3],pl[4]), tier=pl[5]-1;
        var cap=pl[0]==='臺北';
        var m=marker(p[0],p[1]);
        m.g.setAttribute('data-tier',tier);
        m.mk.appendChild(el('circle',{'class':cap?'ctc':'ct',
          'cx':0,'cy':0,'r':cap?3.4:tier===1?2.3:1.9,'data-cty':pl[0]}));
        var tx=el('text',{'class':'ctl'+(cap?' cap':''),'x':cap?6:4.6,'y':3.2,
          'data-lbl':'c'+tier});
        tx.dataset.zh=pl[0]; tx.dataset.en=pl[1]; tx.dataset.ja=pl[2];
        m.mk.appendChild(tx); L.cities.appendChild(m.g); lblCity.push(tx);
      });
      /* Historical seats of power, after the Japan sheet's capitals layer. Off by
         default; selecting an era on the axis turns it on and moves the map here. */
      CAPITALS.forEach(function(k){
        var p=PJ(k[3],k[4]), m=marker(p[0],p[1]);
        m.mk.appendChild(el('circle',{'class':'cp','cx':0,'cy':0,'r':6.4}));
        m.mk.appendChild(el('circle',{'class':'cpi','cx':0,'cy':0,'r':2.4}));
        var tx=el('text',{'class':'cpl','x':9,'y':3.4});
        tx.dataset.zh=k[0]; tx.dataset.en=k[1]; tx.dataset.ja=k[2];
        m.mk.appendChild(tx); L.capitals.appendChild(m.g); lblCap.push(tx);
      });
      L.capitals.setAttribute('data-off','1');

      /* division names */
      DIV.forEach(function(d){
        var a=ANCH[d.id], p;
        if(a) p=PJ(a[0],a[1]);
        else{
          var g2=ISLBY[d.id]; if(!g2||!g2.length) return;
          var cx=0,cy=0,n=0;
          g2.forEach(function(o){o.pts.forEach(function(q){cx+=q[0];cy+=q[1];n++;});});
          p=PJ(cx/n,cy/n);
        }
        var tx=el('text',{'class':'tl','x':p[0].toFixed(1),'y':p[1].toFixed(1),
          'data-lbl':'s1','data-c':d.id});
        tx.textContent=dN(d);
        L.names.appendChild(tx); lblDiv.push(tx);
      });
    }

    /* ------------------------------------------------------------- tooltip --- */
    function showTip(html,cx,cy){
      tip.innerHTML=html;
      var r=stage.getBoundingClientRect();
      tip.style.left=(cx-r.left)+'px'; tip.style.top=(cy-r.top)+'px';
      tip.style.opacity='1';
    }
    function hideTip(){tip.style.opacity='0';}

    /* ---------------------------------------------------------- zoom / pan --- */
    /* V0 is the opening frame; FULL is the whole coordinate space, which is how
       far out the view may be zoomed and how far it may be panned. */
    var FULL=SHEET.slice();
    var V0=HOMEV.slice(), V=V0.slice(), MINW=V0[2]/30, anim=null, lastKey='';
    function syncU(){
      var r=svg.getBoundingClientRect();
      if(r.width<=0||r.height<=0) return;
      var sc=Math.min(r.width/V[2],r.height/V[3]);
      if(sc>0) svg.style.setProperty('--u',(1/sc).toFixed(5));
    }
    function applyVB(){
      svg.setAttribute('viewBox',V[0].toFixed(2)+' '+V[1].toFixed(2)+' '
        +V[2].toFixed(2)+' '+V[3].toFixed(2));
      syncU(); detail();
    }
    function clampV(){
      V[2]=Math.max(MINW,Math.min(FULL[2],V[2])); V[3]=V[2]*(V0[3]/V0[2]);
      var mx=V[2]*0.30, my=V[3]*0.30;
      V[0]=Math.max(FULL[0]-mx,Math.min(V[0],FULL[0]+FULL[2]-V[2]+mx));
      V[1]=Math.max(FULL[1]-my,Math.min(V[1],FULL[1]+FULL[3]-V[3]+my));
    }
    function setView(x,y,w,instant){
      var tw=Math.max(MINW,Math.min(FULL[2],w));
      var target=[x,y,tw,tw*(V0[3]/V0[2])];
      if(anim){cancelAnimationFrame(anim);anim=null;}
      if(instant||window.matchMedia('(prefers-reduced-motion:reduce)').matches){
        V=target; clampV(); applyVB(); return;
      }
      var from=V.slice(), t0=performance.now(), dur=340;
      (function step(now){
        var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3);
        V=[from[0]+(target[0]-from[0])*e, from[1]+(target[1]-from[1])*e,
           from[2]+(target[2]-from[2])*e, from[3]+(target[3]-from[3])*e];
        clampV(); applyVB();
        if(k<1) anim=requestAnimationFrame(step); else anim=null;
      })(t0);
    }
    function zoomAbout(f,cx,cy,instant){
      var nw=Math.max(MINW,Math.min(FULL[2],V[2]*f)), nh=nw*(V0[3]/V0[2]);
      setView(cx-(cx-V[0])*(nw/V[2]), cy-(cy-V[1])*(nh/V[3]), nw, instant);
    }
    function toMap(clientX,clientY){
      var r=svg.getBoundingClientRect();
      var sc=Math.min(r.width/V[2],r.height/V[3]);
      var ox=(r.width-V[2]*sc)/2, oy=(r.height-V[3]*sc)/2;
      return [V[0]+(clientX-r.left-ox)/sc, V[1]+(clientY-r.top-oy)/sc];
    }
    function boundsOf(c){
      var rs=GEOM[c]; if(!rs||!rs.length) return null;
      var x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
      rs.forEach(function(r){r.forEach(function(q){
        var p=PJ(q[0],q[1]);
        if(p[0]<x0)x0=p[0]; if(p[0]>x1)x1=p[0];
        if(p[1]<y0)y0=p[1]; if(p[1]>y1)y1=p[1];});});
      return [x0,y0,x1,y1];
    }
    function flyTo(c){
      var b=boundsOf(c); if(!b) return;
      var w=Math.max((b[2]-b[0])*1.9,(b[3]-b[1])*1.9*(V0[2]/V0[3]),V0[2]/24);
      setView((b[0]+b[2])/2-w/2,(b[1]+b[3])/2-w*(V0[3]/V0[2])/2,w);
    }

    /* ------------------------------------------------------- level of detail -- */
    function detail(){
      var z=V0[2]/V[2];
      $('#zlevel').textContent=(z<10?z.toFixed(1):Math.round(z))+'\u00D7';
      var maxTier = z>=5.5?3 : z>=3.2?2 : z>=1.7?1 : 0;
      var key=[maxTier, z>=1.3, z>=1.9, z>=2.6].join('|');
      if(key===lastKey) return;
      lastKey=key;
      for(var t=0;t<=3;t++){
        var on=t<=maxTier;
        $$('[data-lbl="c'+t+'"]',svg).forEach(function(n){n.style.display=on?'':'none';});
        $$('[data-tier="'+t+'"]',svg).forEach(function(n){
          n.style.display=(t<=maxTier+1)?'':'none';});
      }
      $$('[data-lbl="w2"]',svg).forEach(function(n){n.style.display=z>=1.9?'':'none';});
      $$('[data-lbl="p1"]',svg).forEach(function(n){n.style.display=z>=1.3?'':'none';});
      $$('[data-lbl="g1"]',svg).forEach(function(n){n.style.display=z<5?'':'none';});
      L.ranges.style.opacity=z<3?'1':z<5?'0.45':'0';
      L.grat.style.opacity=z<4?'1':'0.35';
      L.towns.style.opacity=z>=2?'1':'0.4';
      requestAnimationFrame(function(){fitPathLabels();declutter();});
    }
    function fitPathLabels(){
      lblRange.forEach(function(o){
        var pe=document.getElementById(o.id); if(!pe) return;
        var pl=0,tw=0;
        try{pl=pe.getTotalLength();tw=o.t.getComputedTextLength();}catch(e){return;}
        o.t.style.display=(tw>0&&tw<pl*0.92)?'':'none';
      });
    }
    function declutter(){
      var placed=[], vis=svg.getBoundingClientRect();
      $$('text[data-lbl]',svg).forEach(function(t){t.removeAttribute('data-hid');});
      ['s1','c0','w1','c1','p1','c2','w2','c3'].forEach(function(g){
        $$('text[data-lbl="'+g+'"]',svg).forEach(function(t){
          if(t.style.display==='none'||!t.textContent) return;
          var b=t.getBoundingClientRect();
          if(!b.width||!b.height) return;
          if(b.right<vis.left-40||b.left>vis.right+40||
             b.bottom<vis.top-40||b.top>vis.bottom+40) return;
          var pad=1.5, r=[b.left-pad,b.top-pad,b.right+pad,b.bottom+pad];
          for(var i=0;i<placed.length;i++){
            var q=placed[i];
            if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1]){t.setAttribute('data-hid','1');return;}
          }
          placed.push(r);
        });
      });
    }
    function drawScale(){
      var s=$('#sbar'); if(!s) return;
      var r=svg.getBoundingClientRect(); if(!r.width) return;
      var a=PJ(120.5,23.6), b=PJ(121.5,23.6);
      var unitsPerKm=Math.hypot(a[0]-b[0],a[1]-b[1])/(111.32*Math.cos(23.6*RAD));
      var sc=Math.min(r.width/V[2],r.height/V[3]);
      var pxPerKm=unitsPerKm*sc, best=10, len=0;
      [1,2,5,10,20,25,50,100,200,400].forEach(function(t){
        var L2=t*pxPerKm; if(L2<=96){best=t;len=L2;}});
      if(!len){best=1;len=pxPerKm;}
      s.textContent='';
      var g=el('g'), seg=4, sw=len/seg;
      for(var i=0;i<seg;i++) g.appendChild(el('rect',{x:(i*sw).toFixed(1),y:3,
        width:sw.toFixed(1),height:4,fill:i%2?'var(--surf)':'var(--ink)',
        stroke:'var(--ink)','stroke-width':'.5'}));
      var t1=el('text',{x:0,y:15,'font-family':'var(--mono)','font-size':'8',fill:'var(--ink2)'});
      t1.textContent='0';
      var t2=el('text',{x:len.toFixed(1),y:15,'font-family':'var(--mono)','font-size':'8',
        fill:'var(--ink2)','text-anchor':'end'});
      t2.textContent=fmt(best)+' km';
      g.appendChild(t1); g.appendChild(t2); s.appendChild(g);
      s.setAttribute('width',Math.max(70,len+6));
    }

    /* ------------------------------------------------------------ pointers --- */
    svg.addEventListener('wheel',function(e){
      e.preventDefault();
      var m=toMap(e.clientX,e.clientY);
      var d=e.deltaMode===1?e.deltaY*16:e.deltaY;
      zoomAbout(Math.exp(Math.max(-0.6,Math.min(0.6,d*0.0016))),m[0],m[1],true);
    },{passive:false});
    var ptrs={}, pinch=null, down=null, moved=0;
    /* Pointer capture routes later events to the svg, so a click never reaches the
       division path. Taps are detected here instead: press and release within a few
       pixels selects whatever lies underneath. */
    function hitAt(cx,cy){
      function pick(x,y){
        var e=document.elementFromPoint(x,y);
        if(!e||!e.closest||!svg.contains(e)) return null;
        return {st:e.closest('[data-c]'), mk:e.closest('[data-pk],[data-cty]')};
      }
      var at=pick(cx,cy);
      if(at){ if(at.st) return at.st; if(at.mk) return at.mk; }
      var ring=[[0,-6],[6,0],[0,6],[-6,0],[4,-4],[-4,4],[4,4],[-4,-4],
                [0,-12],[12,0],[0,12],[-12,0]];
      for(var i=0;i<ring.length;i++){
        var q=pick(cx+ring[i][0],cy+ring[i][1]);
        if(!q) continue;
        if(q.st) return q.st;
        if(q.mk) return q.mk;
      }
      return null;
    }
    function handleTap(cx,cy){
      var n=hitAt(cx,cy);
      if(!n){ closeReader(); return; }
      if(n.hasAttribute('data-c')) openDiv(n.getAttribute('data-c'));
      else if(n.hasAttribute('data-pk')) flashPeak(n.getAttribute('data-pk'));
      else if(n.hasAttribute('data-cty')) flashCity(n.getAttribute('data-cty'));
    }
    svg.addEventListener('pointerdown',function(e){
      svg.setPointerCapture(e.pointerId);
      ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
      var n=Object.keys(ptrs).length;
      if(n===1){down={x:e.clientX,y:e.clientY,V:V.slice()};moved=0;svg.classList.add('dragging');}
      else if(n===2){
        var k=Object.keys(ptrs), a=ptrs[k[0]], b=ptrs[k[1]];
        pinch={d:Math.hypot(a.x-b.x,a.y-b.y),V:V.slice(),
          m:toMap((a.x+b.x)/2,(a.y+b.y)/2)};
        down=null;
      }
    });
    svg.addEventListener('pointermove',function(e){
      if(!ptrs[e.pointerId]) {
        var n2=hitAt(e.clientX,e.clientY);
        if(n2&&n2.hasAttribute('data-c')){
          var d=BY[n2.getAttribute('data-c')];
          if(d) showTip('<b>'+esc(dN(d))+'</b><span>'+fmt(d.pop)+' \u00B7 '+
            fmt(Math.round(d.area))+' km\u00B2</span>',e.clientX,e.clientY);
        } else hideTip();
        return;
      }
      ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
      var keys=Object.keys(ptrs);
      if(keys.length>=2&&pinch){
        var a=ptrs[keys[0]], b=ptrs[keys[1]];
        var nd=Math.hypot(a.x-b.x,a.y-b.y);
        if(nd>8&&pinch.d>8){
          var f=pinch.d/nd;
          var nw=Math.max(MINW,Math.min(FULL[2],pinch.V[2]*f));
          var nh=nw*(V0[3]/V0[2]);
          V=[pinch.m[0]-(pinch.m[0]-pinch.V[0])*(nw/pinch.V[2]),
             pinch.m[1]-(pinch.m[1]-pinch.V[1])*(nh/pinch.V[3]),nw,nh];
          clampV(); applyVB();
        }
        return;
      }
      if(!down) return;
      var r=svg.getBoundingClientRect();
      var sc=Math.min(r.width/down.V[2],r.height/down.V[3]);
      var dx=(e.clientX-down.x)/sc, dy=(e.clientY-down.y)/sc;
      moved=Math.max(moved,Math.abs(e.clientX-down.x)+Math.abs(e.clientY-down.y));
      V[0]=down.V[0]-dx; V[1]=down.V[1]-dy; clampV(); applyVB();
    });
    function endPointer(e){
      var had=!!ptrs[e.pointerId];
      delete ptrs[e.pointerId];
      if(Object.keys(ptrs).length<2) pinch=null;
      if(Object.keys(ptrs).length===0){
        svg.classList.remove('dragging');
        if(had&&down&&moved<6) handleTap(e.clientX,e.clientY);
        down=null;
      }
    }
    svg.addEventListener('pointerup',endPointer);
    svg.addEventListener('pointercancel',endPointer);
    svg.addEventListener('pointerleave',function(){hideTip();});
    svg.addEventListener('keydown',function(e){
      var st=V[2]*0.16;
      if(e.key==='ArrowLeft'){V[0]-=st;clampV();applyVB();}
      else if(e.key==='ArrowRight'){V[0]+=st;clampV();applyVB();}
      else if(e.key==='ArrowUp'){V[1]-=st;clampV();applyVB();}
      else if(e.key==='ArrowDown'){V[1]+=st;clampV();applyVB();}
      else if(e.key==='+'||e.key==='='){zoomAbout(1/1.6,V[0]+V[2]/2,V[1]+V[3]/2);}
      else if(e.key==='-'||e.key==='_'){zoomAbout(1.6,V[0]+V[2]/2,V[1]+V[3]/2);}
      else if(e.key==='0'){setView(V0[0],V0[1],V0[2]);}
      else return;
      e.preventDefault();
    });
    $('#zin').addEventListener('click',function(){zoomAbout(1/1.6,V[0]+V[2]/2,V[1]+V[3]/2);});
    $('#zout').addEventListener('click',function(){zoomAbout(1.6,V[0]+V[2]/2,V[1]+V[3]/2);});
    $('#zfit').addEventListener('click',function(){closeReader();setView(V0[0],V0[1],V0[2]);});

    function flashPeak(zh){
      var k=null; PEAKPT.forEach(function(p){if(p[0]===zh)k=p;});
      if(!k) return;
      var p=PJ(k[2],k[3]);
      showTipAt(p,'<b>'+esc(cur==='en'?k[1]:k[0])+'</b><span>'+fmt(k[4])+' m</span>');
    }
    function flashCity(zh){
      var k=null; PLACE.forEach(function(p){if(p[0]===zh)k=p;});
      if(!k) return;
      var p=PJ(k[3],k[4]);
      showTipAt(p,'<b>'+esc(cur==='zh'?k[0]:cur==='ja'?k[2]:k[1])+'</b>');
    }
    function showTipAt(p,html){
      var r=svg.getBoundingClientRect(), sr=stage.getBoundingClientRect();
      var sc=Math.min(r.width/V[2],r.height/V[3]);
      var ox=(r.width-V[2]*sc)/2, oy=(r.height-V[3]*sc)/2;
      showTip(html, r.left+ox+(p[0]-V[0])*sc, r.top+oy+(p[1]-V[1])*sc);
      setTimeout(hideTip,2200);
    }

    /* -------------------------------------------------------------- layers --- */
    var LAYERS=[['divisions','lyDiv',1,''],['towns','lyTowns',0,''],
     ['water','lyWater',1,'var(--hanada)'],['rivers','lyRivers',1,'var(--hanada)'],
     ['ranges','lyRanges',1,'var(--tobi)'],['parks','lyParks',1,'var(--tokiwa)'],
     ['cities','lyCities',1,'var(--ink)'],['names','lyNames',1,''],
     ['grat','lyGrat',1,'var(--rikyu)'],['capitals','lyCaps',0,'var(--red)']];
    LAYERS.forEach(function(a){
      var b=document.createElement('button');
      b.className='lsw'; b.setAttribute('aria-pressed',a[2]?'true':'false'); b.dataset.layer=a[0];
      b.innerHTML='<span data-t="'+a[1]+'"></span>'+(a[3]?'<i style="color:'+a[3]+'"></i>':'');
      b.addEventListener('click',function(){
        var on=b.getAttribute('aria-pressed')!=='true';
        b.setAttribute('aria-pressed',String(on));
        L[a[0]].setAttribute('data-off',on?'0':'1');
        if(a[0]==='divisions'){L.coast.setAttribute('data-off',on?'0':'1');}
      });
      $('#layers').appendChild(b);
      if(!a[2]) L[a[0]].setAttribute('data-off','1');
    });
    $('#lbtn').addEventListener('click',function(){
      var p=$('#lpanel'), on=!p.classList.contains('open');
      p.classList.toggle('open',on); $('#lbtn').setAttribute('aria-expanded',String(on));
    });

    var RAMPS={
      paper:['#F4EDE4','#E7D8D8','#D3B8C6','#B694AE','#94658F','#622954'],
      dusk :['#EFE6DA','#E0CFCF','#CBAFBE','#AE8CA6','#8C5D87','#5A2549'],
      night:['#2A333F','#36304A','#443456','#553963','#6B4172','#874E85']
    };
    function RAMP(){var g=document.documentElement.getAttribute('data-ground');
      return RAMPS[g]||RAMPS.paper;}
    var THEMES=[['','thNone'],['pop','thPop'],['den','thDen'],['area','thArea'],
     ['hh','thHh'],['subN','thTown'],['pph','thPph']];
    function buildThemes(){
      var s=$('#theme'), keep=s.value; s.textContent='';
      THEMES.forEach(function(t){
        var o=document.createElement('option'); o.value=t[0]; o.textContent=T(t[1]); s.appendChild(o);});
      s.value=keep||'';
    }
    var curTheme='';
    function applyTheme(k){
      curTheme=k;
      var key=$('#key');
      if(!k){CODES.forEach(function(c){if(paths[c])paths[c].style.removeProperty('fill');});
        key.textContent=''; return;}
      var vals=[];
      CODES.forEach(function(c){var v=BY[c][k]; if(isFinite(v)&&v>0) vals.push(v);});
      vals.sort(function(a,b){return a-b;});
      var R=RAMP(), n=R.length, brk=[];
      for(var i=1;i<n;i++) brk.push(vals[Math.floor(i*vals.length/n)]);
      CODES.forEach(function(c){
        var v=BY[c][k], p=paths[c]; if(!p) return;
        if(!isFinite(v)||v<=0){p.style.fill='var(--surf3)';return;}
        var i2=0; while(i2<brk.length&&v>=brk[i2]) i2++;
        p.style.fill=R[i2];
      });
      key.innerHTML='<div class="keybar">'+R.map(function(c){
          return '<span style="flex:1;background:'+c+'"></span>';}).join('')+'</div>'
        +'<div class="keycap"><span>'+fmt(Math.round(vals[0]))+'</span><span>'+T('thSextile')
        +'</span><span>'+fmt(Math.round(vals[vals.length-1]))+'</span></div>';
    }
    $('#theme').addEventListener('change',function(e){applyTheme(e.target.value);});

    /* -------------------------------------------------------------- search --- */
    var IDX=[];
    function buildIndex(){
      var out=[],seen={};
      function add(t,sub,c,kind,lo,la){
        if(!t) return; var key=t+'|'+c+'|'+kind; if(seen[key])return; seen[key]=1;
        out.push({t:t,sub:sub,c:c,kind:kind,lo:lo,la:la});
      }
      DIV.forEach(function(d){
        add(d.en,d.zh,d.id,'div'); add(d.zh,d.en,d.id,'div');
        add(toJa(d.zh),d.en,d.id,'div'); add(d.rom,d.en,d.id,'div');
        add(d.seatEn,dN(d),d.id,'seat'); add(d.seat,dN(d),d.id,'seat');
      });
      PLACE.forEach(function(p){
        add(p[1],p[0],null,'place',p[3],p[4]); add(p[0],p[1],null,'place',p[3],p[4]);
        add(p[2],p[1],null,'place',p[3],p[4]);
      });
      PEAKPT.forEach(function(p){
        add(p[1],p[0]+' \u00B7 '+fmt(p[4])+' m',null,'peak',p[2],p[3]);
        add(p[0],p[1]+' \u00B7 '+fmt(p[4])+' m',null,'peak',p[2],p[3]);
      });
      ISL.forEach(function(r){
        add(r[2],r[1],r[4],'isl'); add(r[1],r[2],r[4],'isl'); add(r[3],r[2],r[4],'isl');
      });
      IDX=out;
    }
    var qEl=$('#q'), resEl=$('#res');
    function runSearch(){
      var v=(qEl.value||'').trim().toLowerCase();
      $('#qx').hidden=!v;
      if(!v){resEl.classList.remove('open');resEl.textContent='';return;}
      var hits=IDX.filter(function(o){return o.t.toLowerCase().indexOf(v)===0;})
        .concat(IDX.filter(function(o){return o.t.toLowerCase().indexOf(v)>0;}))
        .slice(0,12);
      if(!hits.length){resEl.classList.remove('open');return;}
      resEl.innerHTML=hits.map(function(o,i){
        return '<button data-i="'+i+'">'+esc(o.t)+'<span class="k">'+esc(o.sub||'')+'</span></button>';
      }).join('');
      resEl.classList.add('open');
      $$('button',resEl).forEach(function(b,i){
        b.addEventListener('click',function(){pickHit(hits[i]);});
      });
    }
    function pickHit(o){
      resEl.classList.remove('open'); qEl.value='';  $('#qx').hidden=true;
      if(o.c){ openDiv(o.c); flyTo(o.c); }
      if(o.lo!=null){
        var p=PJ(o.lo,o.la), w=V0[2]/9;
        setView(p[0]-w/2,p[1]-w*(V0[3]/V0[2])/2,w);
      }
    }
    qEl.addEventListener('input',runSearch);
    $('#qx').addEventListener('click',function(){qEl.value='';runSearch();qEl.focus();});
    document.addEventListener('click',function(e){
      if(!resEl.contains(e.target)&&e.target!==qEl) resEl.classList.remove('open');
    });

    /* -------------------------------------------------------------- reader --- */
    var sel=null;
    function clearSel(){Object.keys(paths).forEach(function(k){paths[k].classList.remove('sel');});}
    function revealRecord(){
      var r=reader.getBoundingClientRect(), want=window.innerHeight-150;
      if(r.top>want+8){
        var dy=r.top-want;
        if(window.scrollBy) window.scrollBy({top:dy,left:0,behavior:'smooth'});
        else window.scrollTo(0,window.pageYOffset+dy);
      } else if(r.bottom<80) reader.scrollIntoView({behavior:'smooth',block:'center'});
    }
    function chips(a,cls){
      if(!a||!a.length) return '<span style="color:var(--ink3);font-style:italic">'+T('none')+'</span>';
      return '<div class="chips">'+a.map(function(x){
        return '<span class="chip '+cls+'">'+esc(x)+'</span>';}).join('')+'</div>';
    }
    function cell(v,l){return '<div><div class="v">'+v+'</div><div class="tag">'+l+'</div></div>';}
    function showHint(){
      sel=null; clearSel();
      reader.innerHTML='<div class="hint"><span class="tag">'+T('promptH')+'</span>'
       +'<p>'+T('promptP')+'</p><div class="natg">'
       +cell(fmt(TOTP),T('nPop'))+cell(fmt(Math.round(TOTA)),T('nArea'))
       +cell('22',T('nDiv'))+cell(fmt(TOTS),T('nTown'))
       +cell('3,952',T('nHi'))+cell('10',T('nParks'))
       +cell(String(ISL.length),T('nIsl'))+cell('16',T('nPeoples'))+'</div></div>';
    }
    function openDiv(c){
      var d=BY[c]; if(!d) return;
      clearSel(); if(paths[c]) paths[c].classList.add('sel');
      sel=c; hideTip();
      var isl=(ISLBY[c]||[]).map(function(o){
        return cur==='zh'?o.zh:cur==='ja'?o.ja:o.en;});
      reader.innerHTML=
       '<div class="rd-h"><div style="min-width:0"><span class="tag">'
       +esc(T(PROVK[d.type]))+' \u00B7 '+esc(T(TYPEK[d.type]))+'</span>'
       +'<h2>'+esc(dN(d))+'</h2><div class="nick">'+esc(dAlt(d))+' \u00B7 '+esc(d.rom)+'</div></div>'
       +'<button class="rd-x" id="rdX" aria-label="Close">&times;</button></div>'
       +'<div class="rd-b">'
       +'<div class="blk"><div class="figs">'
       +'<div><div class="v">'+fmt(d.pop)+'</div><div class="tag">'+T('fPop')+'</div>'
         +'<div class="r">'+T('rank')+' '+d.pr+'</div></div>'
       +'<div><div class="v">'+fmt(Math.round(d.area))+'</div><div class="tag">'+T('fArea')+'</div>'
         +'<div class="r">'+T('rank')+' '+d.ar+'</div></div>'
       +'<div><div class="v">'+fmt(Math.round(d.den))+'</div><div class="tag">'+T('fDen')+'</div>'
         +'<div class="r">'+T('rank')+' '+d.dr+'</div></div>'
       +'<div><div class="v">'+fmt(d.hh)+'</div><div class="tag">'+T('fHh')+'</div></div>'
       +'<div><div class="v">'+d.subN+'</div><div class="tag">'+T('fTown')+'</div></div>'
       +'<div><div class="v">'+d.pph.toFixed(2)+'</div><div class="tag">'+T('fPph')+'</div></div>'
       +'</div></div>'
       +'<div class="blk"><dl class="kv">'
       +'<dt>'+T('kSeat')+'</dt><dd>'+esc(dSeat(d))+'</dd>'
       +'<dt>'+T('kSub')+'</dt><dd>'+esc(dSub(d))+'</dd>'
       +'<dt>'+T('kProv')+'</dt><dd>'+esc(T(PROVK[d.type]))+'</dd>'
       +'<dt>'+T('kShare')+'</dt><dd>'+(d.pop/TOTP*100).toFixed(2)+'%</dd>'
       +'</dl></div>'
       +(isl.length?'<div class="blk"><span class="tag">'+T('bIsl')+'</span>'
          +chips(isl,'')+'</div>':'')
       +'<div class="blk"><span class="tag">'+T('bAbout')+'</span>'
         +'<p class="prose">'+esc(dNote(d))+'</p></div>'
       +'<div class="blk"><span class="tag">'+T('bNote')+'</span>'
         +chips(dHigh(d),'')+'</div>'
       +'</div>';
      $('#rdX').addEventListener('click',closeReader);
      revealRecord();
    }
    function closeReader(){clearSel();showHint();}

    /* --------------------------------------------------- national section ---- */
    function sunPath(cx,cy,r){
      var tip=2*r, val=r*17/15, p=[];
      for(var k=0;k<12;k++){
        var a=(k*30-90)*RAD, b=(k*30-90+15)*RAD;
        p.push((cx+tip*Math.cos(a)).toFixed(3)+' '+(cy+tip*Math.sin(a)).toFixed(3));
        p.push((cx+val*Math.cos(b)).toFixed(3)+' '+(cy+val*Math.sin(b)).toFixed(3));
      }
      return 'M'+p.join('L')+'Z';
    }
    /* Constructed to 中華民國國徽國旗法 article 4: field 3:2, canton one quarter of
       the field, sun radius one eighth of the canton width, ray tips at twice that
       radius, blue ring one fifteenth of the sun diameter, twelve rays of 30 degrees
       with one due north. */
    function drawFlag(){
      var f=$('#flag'); if(!f) return; f.textContent='';
      var W=1200,H=800,Cw=W/2,Ch=H/2,cx=Cw/2,cy=Ch/2,r=Cw/8;
      f.appendChild(el('rect',{x:0,y:0,width:W,height:H,fill:'#FE0000'}));
      f.appendChild(el('rect',{x:0,y:0,width:Cw,height:Ch,fill:'#000095'}));
      f.appendChild(el('path',{d:sunPath(cx,cy,r),fill:'#FFFFFF'}));
      f.appendChild(el('circle',{cx:cx,cy:cy,r:(r*17/15).toFixed(3),fill:'#000095'}));
      f.appendChild(el('circle',{cx:cx,cy:cy,r:r,fill:'#FFFFFF'}));
      f.appendChild(el('rect',{x:0,y:0,width:W,height:H,fill:'none',
        stroke:'var(--line2)','stroke-width':3}));
    }
    function drawEmblem(){
      var f=$('#emblem'); if(!f) return; f.textContent='';
      var S=400,c=S/2,r=S/2/3;
      f.appendChild(el('circle',{cx:c,cy:c,r:S/2-2,fill:'#000095'}));
      f.appendChild(el('path',{d:sunPath(c,c,r),fill:'#FFFFFF'}));
      f.appendChild(el('circle',{cx:c,cy:c,r:(r*17/15).toFixed(3),fill:'#000095'}));
      f.appendChild(el('circle',{cx:c,cy:c,r:r,fill:'#FFFFFF'}));
    }
    function chipSvg(kind){
      var o='<svg viewBox="0 0 60 40" aria-hidden="true">';
      if(kind==='nl') return o+'<rect width="60" height="13.33" fill="#AE1C28"/>'
        +'<rect y="13.33" width="60" height="13.34" fill="#fff"/>'
        +'<rect y="26.67" width="60" height="13.33" fill="#21468B"/></svg>';
      if(kind==='es') return o+'<rect width="60" height="40" fill="#fff"/>'
        +'<path d="M8 5L52 35M52 5L8 35" stroke="#AA151B" stroke-width="6"/></svg>';
      if(kind==='qing') return o+'<rect width="60" height="40" fill="#FFDE00"/></svg>';
      if(kind==='formosa') return o+'<rect width="60" height="40" fill="#1F4E9C"/></svg>';
      if(kind==='jp') return o+'<rect width="60" height="40" fill="#fff"/>'
        +'<circle cx="30" cy="20" r="12" fill="#BC002D"/></svg>';
      if(kind==='roc'){
        var r=30/8;
        return o+'<rect width="60" height="40" fill="#FE0000"/>'
          +'<rect width="30" height="20" fill="#000095"/>'
          +'<path d="'+sunPath(15,10,r)+'" fill="#fff"/>'
          +'<circle cx="15" cy="10" r="'+(r*17/15).toFixed(3)+'" fill="#000095"/>'
          +'<circle cx="15" cy="10" r="'+r.toFixed(3)+'" fill="#fff"/></svg>';
      }
      return '';
    }
    function paintSuccession(){
      var li=LI();
      $('#succ').innerHTML=REGIME.map(function(r){
        var yr=r[0]+(r[1]===0?'\u2013'+T('present'):r[1]===r[0]?'':'\u2013'+r[1]);
        var fl=chipSvg(r[5]);
        return '<li><span class="fl'+(fl?'':' none')+'">'+fl+'</span>'
          +'<span><span class="y">'+yr+'</span>'
          +'<span class="n">'+esc(li===0?r[3]:li===1?r[2]:r[4])+'</span>'
          +'<span class="d">'+esc(li===0?r[7]:li===1?r[6]:r[8])+'</span></span></li>';
      }).join('');
    }
    var eraSel=-1, islSel=-1;
    /* Both axes are drawn by the same routine. Nothing is lettered inside a band:
       a linear axis puts the Qin at 0.37% of its width, so any lettering there is
       bound to clip or overlap. Every name is given in full in a legend that wraps,
       so nothing is truncated at any window width.

       Selecting a band changes the note and nothing else. It does not move the map:
       the axis is a reading device, and having it seize the view was intrusive. */
    function yrLab(v){
      if(v<0) return (-v)+' '+(cur==='en'?'BC':'前');
      return String(v);
    }
    function eraSpanOf(e,last){
      return yrLab(e[0])+(cur==='en'?' to ':'–')
        +(e[1]>=last?T('present'):yrLab(e[1]));
    }
    function nameOf(e){var li=LI();return li===0?e[3]:li===1?e[2]:e[4];}
    function noteOf(e){var li=LI();return li===0?e[7]:li===1?e[6]:e[8];}
    function drawAxis(data,ids,sel,pick){
      var T0=data[0][0], T1=data[data.length-1][1], SPAN=T1-T0;
      /* Widths are strictly proportional. Because the names live in the legend
         below, a fifteen year dynasty can be three pixels wide without becoming
         unreadable, so the axis stays a true linear scale. */
      $('#'+ids.band).innerHTML=data.map(function(e,i){
        var lab=nameOf(e)+' '+eraSpanOf(e,T1);
        return '<button type="button" data-i="'+i+'" aria-pressed="'+(sel===i)+'"'
          +' style="width:'+((e[1]-e[0])/SPAN*100).toFixed(3)+'%;background:'+e[5]+'"'
          +' aria-label="'+esc(lab)+'" title="'+esc(lab)+'"></button>';
      }).join('');
      /* Thin the scale as the band narrows, so the figures never collide. */
      var bw=0;
      try{ bw=$('#'+ids.band).getBoundingClientRect().width||0; }catch(err){}
      if(!bw) bw=600;
      var all=ids.ticks||[T0,T0+Math.round(SPAN*0.25),T0+Math.round(SPAN*0.5),
                          T0+Math.round(SPAN*0.75),T1];
      var ticks = bw>=620 ? all
                : bw>=380 ? [all[0],all[Math.floor(all.length/2)],all[all.length-1]]
                :           [all[0],all[all.length-1]];
      $('#'+ids.scale).innerHTML=ticks.map(function(y,i){
        if(i===0) return '<span style="left:0">'+yrLab(y)+'</span>';
        if(i===ticks.length-1)
          return '<span class="last" style="right:0">'+yrLab(y)+'</span>';
        var pos=(y-T0)/SPAN*100;
        return '<span style="left:'+pos.toFixed(2)+'%;transform:translateX(-50%)">'
          +yrLab(y)+'</span>';
      }).join('');
      $('#'+ids.chips).innerHTML=data.map(function(e,i){
        return '<button type="button" data-i="'+i+'" aria-pressed="'+(sel===i)+'">'
          +'<i style="background:'+e[5]+'"></i>'+esc(nameOf(e))
          +'<span class="y">'+esc(eraSpanOf(e,T1))+'</span></button>';
      }).join('');
      $$('#'+ids.band+' button').concat($$('#'+ids.chips+' button'))
        .forEach(function(b){b.addEventListener('click',function(){pick(+b.dataset.i);});});
    }
    function axisNote(data,ids,sel){
      var n=$('#'+ids.note);
      if(sel<0){ n.innerHTML='<span style="color:var(--ink3)">'+esc(T('eraPrompt'))
        +'</span>'; markTimeline(); return; }
      var e=data[sel], T1=data[data.length-1][1];
      n.innerHTML='<b>'+esc(nameOf(e))+'</b>'
        +'<span class="yr">'+esc(eraSpanOf(e,T1))+' \u00B7 '+(e[1]-e[0])+' '
        +esc(T('eraYears'))+'</span><br>'
        +esc(noteOf(e))
        +(e[9]?'<span class="st">'+esc(T(ids.stKey))+' \u00B7 '+esc(e[9])+'</span>':'');
      markTimeline();
    }
    /* Selecting on either axis marks the years that fall inside it, so the axis and
       the list read as one thing rather than two versions of the same material.
       Only one axis holds a selection at a time. */
    function markTimeline(){
      var r=null;
      if(eraSel>=0) r=[ERA[eraSel][0],ERA[eraSel][1]];
      else if(islSel>=0) r=[ISLERA[islSel][0],ISLERA[islSel][1]];
      $$('#tline li').forEach(function(li){
        var y=+li.dataset.y;
        li.classList.toggle('sel', !!r && y>=r[0] && y<=r[1]);
      });
    }
    function markAxis(ids,sel){
      $$('#'+ids.band+' button').concat($$('#'+ids.chips+' button')).forEach(function(n){
        n.setAttribute('aria-pressed',String(+n.dataset.i===sel));});
    }
    var ERAIDS={band:'eraband',scale:'erascale',chips:'erachips',note:'eranote',
                ticks:[-2070,-1000,0,1000,2026],stKey:'eraStruct'};
    var ISLIDS={band:'islband',scale:'islscale',chips:'islchips',note:'islnote',
                stKey:'islStruct'};
    function paintEras(){
      drawAxis(ERA,ERAIDS,eraSel,pickEra);
      drawAxis(ISLERA,ISLIDS,islSel,pickIsl);
      $('#eraPreLbl').textContent=T('eraPre');
      $('#eracaveat').textContent=T('eraCaveat');
      $('#islcaveat').textContent=T('islCaveat');
      showEra(); showIsl();
    }
    function pickEra(i){
      eraSel=(eraSel===i)?-1:i;
      if(eraSel>=0) islSel=-1;
      markAxis(ERAIDS,eraSel); markAxis(ISLIDS,islSel); showEra(); showIsl();
    }
    function pickIsl(i){
      islSel=(islSel===i)?-1:i;
      if(islSel>=0) eraSel=-1;
      markAxis(ERAIDS,eraSel); markAxis(ISLIDS,islSel); showEra(); showIsl();
    }
    function showEra(){ axisNote(ERA,ERAIDS,eraSel); }
    function showIsl(){ axisNote(ISLERA,ISLIDS,islSel); }
    function markEra(){ markAxis(ERAIDS,eraSel); markTimeline(); }
    function paintNational(){
      var li=LI();
      $('#natName').textContent=['Republic of China','中華民國','中華民国'][li];
      drawFlag(); drawEmblem(); paintSuccession(); paintEras();
      $('#anthemT').textContent=['National Anthem of the Republic of China',
        '中華民國國歌','中華民国国歌'][li];
      $('#anthemSub').textContent=T('anthemSub');
      $('#anthemV').innerHTML=ANTHEM_V.join('<br>');
      $('#anthemNote').textContent=T('anthemNote');
      $('#fanthemT').textContent=['National Flag Anthem','中華民國國旗歌','中華民国国旗歌'][li];
      $('#fanthemSub').textContent=T('fanthemSub');
      $('#fanthemV').innerHTML=FANTHEM_V.join('<br>');
      $('#fanthemNote').textContent=T('fanthemNote');
      $('#natfacts').innerHTML=
        '<div><dt class="tag">'+T('fCapital')+'</dt><dd>'+esc(['Taipei','臺北市','台北市'][li])+'</dd></div>'
       +'<div><dt class="tag">'+T('fLargest')+'</dt><dd>'+esc(['New Taipei','新北市','新北市'][li])+'</dd></div>'
       +'<div><dt class="tag">'+T('fFounded')+'</dt><dd>1912-01-01</dd></div>'
       +'<div><dt class="tag">'+T('fNatDay')+'</dt><dd>10-10</dd></div>'
       +'<div><dt class="tag">'+T('fDivs')+'</dt><dd>6 + 14 + 2</dd></div>'
       +'<div><dt class="tag">'+T('fTook')+'</dt><dd>1945-10-25</dd></div>'
       +'<div><dt class="tag">'+T('fCurrency')+'</dt><dd>TWD NT$</dd></div>'
       +'<div><dt class="tag">'+T('fCodes')+'</dt><dd class="mono">'
         +'TW \u00B7 TWN \u00B7 158</dd></div>';
      $('#flagspec').innerHTML=
        '<dt>'+T('flLaw')+'</dt><dd>'+esc(T('flLawV'))+'</dd>'
       +'<dt>'+T('flRatio')+'</dt><dd class="mono">3 : 2</dd>'
       +'<dt>'+T('flCanton')+'</dt><dd class="mono">1/4</dd>'
       +'<dt>'+T('flSun')+'</dt><dd class="mono">r = 1/8 \u00B7 12 \u00D7 30\u00B0</dd>'
       +'<dt>'+T('flColours')+'</dt><dd class="mono">#FE0000 \u00B7 #000095 \u00B7 #FFFFFF</dd>';
      $('#emblemspec').innerHTML=
        '<dt>'+T('flLaw')+'</dt><dd>'+esc(T('emLawV'))+'</dd>'
       +'<dt>'+T('emDisc')+'</dt><dd class="mono">1 : 3</dd>'
       +'<dt>'+T('emRays')+'</dt><dd class="mono">2r \u003C 3r</dd>';
      $('#tline').innerHTML=HIST.map(function(a){
        return '<li data-y="'+a[0]+'"'+(a[1]?' class="mapchg"':'')
          +'><span class="y">'+a[0]+'</span>'
          +'<span class="w">'+esc(a[2][li])+'<span class="a">'+esc(a[3])+'</span></span></li>';
      }).join('');
      markTimeline();
    }

    /* -------------------------------------------------------------- tables --- */
    function sortable(tblId,cols,rows,render){
      var t=$('#'+tblId), head=$('thead tr',t), body=$('tbody',t);
      var sk=null, sd=1;
      function paint(){
        head.innerHTML=cols.map(function(c,i){
          var a=(sk===i)?(sd>0?'ascending':'descending'):null;
          return '<th'+(c.n?' class="n"':'')+(c.opt?' data-opt="'+c.opt+'"':'')
            +(a?' aria-sort="'+a+'"':'')+' data-i="'+i+'">'+esc(T(c.t))+'</th>';
        }).join('');
        var rs=rows.slice();
        if(sk!==null) rs.sort(function(a,b){
          var x=cols[sk].v(a), y=cols[sk].v(b);
          if(typeof x==='number'&&typeof y==='number') return (x-y)*sd;
          return String(x).localeCompare(String(y))*sd;});
        body.innerHTML=rs.map(render).join('');
        $$('th',head).forEach(function(th){
          th.addEventListener('click',function(){
            var i=+th.dataset.i;
            if(sk===i) sd=-sd; else {sk=i;sd=cols[i].n?-1:1;}
            paint();});
        });
        $$('td.nm button',body).forEach(function(b){
          b.addEventListener('click',function(){openDiv(b.dataset.c);flyTo(b.dataset.c);});
        });
      }
      paint();
      return paint;
    }
    var repaintTables=[];
    function buildTables(){
      repaintTables=[];
      repaintTables.push(sortable('tDv',[
        {t:'cDiv',v:function(d){return dN(d);}},
        {t:'cClass',v:function(d){return T(TYPEK[d.type]);},opt:2},
        {t:'cSeat',v:function(d){return dSeat(d);},opt:1},
        {t:'cPop',v:function(d){return d.pop;},n:1},
        {t:'cHh',v:function(d){return d.hh;},n:1,opt:1},
        {t:'cArea',v:function(d){return d.area;},n:1},
        {t:'cDen',v:function(d){return d.den;},n:1},
        {t:'cTown',v:function(d){return d.subN;},n:1,opt:2}
      ],DIV,function(d){
        return '<tr><td class="nm"><button data-c="'+d.id+'">'+esc(dN(d))+'</button></td>'
          +'<td data-opt="2">'+esc(T(TYPEK[d.type]))+'</td>'
          +'<td data-opt="1">'+esc(dSeat(d))+'</td>'
          +'<td class="n">'+fmt(d.pop)+'</td>'
          +'<td class="n" data-opt="1">'+fmt(d.hh)+'</td>'
          +'<td class="n">'+fmt(Math.round(d.area))+'</td>'
          +'<td class="n">'+fmt(Math.round(d.den))+'</td>'
          +'<td class="n" data-opt="2">'+d.subN+'</td></tr>';
      }));
      repaintTables.push(sortable('tPk',[
        {t:'cSummit',v:function(r){return cur==='en'?r[1]:r[0];}},
        {t:'cHeight',v:function(r){return r[2];},n:1},
        {t:'cWhere',v:function(r){return r[3];},opt:1},
        {t:'cNote',v:function(r){return r[4];},opt:2}
      ],PEAKLIST,function(r){
        return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
          +esc(r[1])+'</span></td><td class="n">'+fmt(r[2])+'</td>'
          +'<td data-opt="1">'+esc(r[3])+'</td>'
          +'<td class="wrap" data-opt="2">'+esc(r[4])+'</td></tr>';
      }));
      repaintTables.push(sortable('tRv',[
        {t:'cRiver',v:function(r){return cur==='en'?r[1]:r[0];}},
        {t:'cLen',v:function(r){return r[2];},n:1},
        {t:'cBasin',v:function(r){return r[3];},n:1},
        {t:'cWhere',v:function(r){return r[4];},opt:1},
        {t:'cNote',v:function(r){return r[5];},opt:2}
      ],RIVERS,function(r){
        return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
          +esc(r[1])+'</span></td><td class="n">'+r[2].toFixed(1)+'</td>'
          +'<td class="n">'+fmt(r[3])+'</td><td data-opt="1">'+esc(r[4])+'</td>'
          +'<td class="wrap" data-opt="2">'+esc(r[5])+'</td></tr>';
      }));
      repaintTables.push(sortable('tPr',[
        {t:'cPark',v:function(r){return cur==='en'?r[1]:r[0];}},
        {t:'cDesig',v:function(r){return r[2];}},
        {t:'cWhere',v:function(r){return r[4];},opt:1},
        {t:'cArea2',v:function(r){return r[5];},opt:1},
        {t:'cNote',v:function(r){return r[6];},opt:2}
      ],PARKS,function(r){
        return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
          +esc(r[1])+'</span></td><td>'+esc(cur==='en'?r[3]:r[2])+'</td>'
          +'<td data-opt="1">'+esc(r[4])+'</td><td data-opt="1">'+esc(r[5])+'</td>'
          +'<td class="wrap" data-opt="2">'+esc(r[6])+'</td></tr>';
      }));
      repaintTables.push(sortable('tIs',[
        {t:'cIsland',v:function(r){return cur==='en'?r[1]:r[0];}},
        {t:'cArea2',v:function(r){return r[2];}},
        {t:'cNote',v:function(r){return r[3];},opt:1}
      ],ISLANDS,function(r){
        return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
          +esc(r[1])+'</span></td><td>'+esc(r[2])+'</td>'
          +'<td class="wrap" data-opt="1">'+esc(r[3])+'</td></tr>';
      }));
      repaintTables.push(sortable('tPl',[
        {t:'cPlace',v:function(p){return cur==='zh'?p[0]:cur==='ja'?p[2]:p[1];}},
        {t:'cLon',v:function(p){return p[3];},n:1,opt:1},
        {t:'cLat',v:function(p){return p[4];},n:1,opt:1},
        {t:'cTier',v:function(p){return p[5];},n:1}
      ],PLACE,function(p){
        return '<tr><td>'+esc(cur==='zh'?p[0]:cur==='ja'?p[2]:p[1])
          +' <span class="mono" style="color:var(--ink3)">'+esc(cur==='en'?p[0]:p[1])+'</span></td>'
          +'<td class="n" data-opt="1">'+p[3].toFixed(3)+'</td>'
          +'<td class="n" data-opt="1">'+p[4].toFixed(3)+'</td>'
          +'<td class="n">'+p[5]+'</td></tr>';
      }));
      repaintTables.push(sortable('tPp',[
        {t:'cPeople',v:function(r){return cur==='en'?r[1]:r[0];}},
        {t:'cWhere',v:function(r){return r[2];},opt:1},
        {t:'cRecog',v:function(r){return r[3];}},
        {t:'cNote',v:function(r){return r[4];},opt:2}
      ],PEOPLES,function(r){
        return '<tr><td>'+esc(r[0])+' <span class="mono" style="color:var(--ink3)">'
          +esc(r[1])+'</span></td><td data-opt="1">'+esc(r[2])+'</td>'
          +'<td>'+esc(r[3])+'</td><td class="wrap" data-opt="2">'+esc(r[4])+'</td></tr>';
      }));
      $('#pkc').textContent=PEAKLIST.length+' \u00B7 3,952 m';
      $('#rvc').textContent=RIVERS.length;
      $('#prc').textContent=PARKS.length;
      $('#isc').textContent=ISLANDS.length;
      $('#plc').textContent=PLACE.length;
      $('#ppc').textContent=PEOPLES.length;
    }
    function buildFacts(){
      var li=LI();
      var top=DIV.slice().sort(function(a,b){return b.pop-a.pop;});
      var big=DIV.slice().sort(function(a,b){return b.area-a.area;});
      var den=DIV.slice().sort(function(a,b){return b.den-a.den;});
      var rows=[
       [T('xMostPop'),dN(top[0])+' <span class="mono">'+fmt(top[0].pop)+'</span>'],
       [T('xLeastPop'),dN(top[top.length-1])+' <span class="mono">'+fmt(top[top.length-1].pop)+'</span>'],
       [T('xLargest'),dN(big[0])+' <span class="mono">'+fmt(Math.round(big[0].area))+' km²</span>'],
       [T('xSmallest'),dN(big[big.length-1])+' <span class="mono">'+fmt(Math.round(big[big.length-1].area))+' km²</span>'],
       [T('xDensest'),dN(den[0])+' <span class="mono">'+fmt(Math.round(den[0].den))+' /km²</span>'],
       [T('xSparsest'),dN(den[den.length-1])+' <span class="mono">'+fmt(Math.round(den[den.length-1].den))+' /km²</span>']
      ];
      EXTREMES.forEach(function(e){
        rows.push([li===0?e.kEn:e.kZh,(li===0?e.nEn:e.nZh)+' <span class="mono">'+esc(e.co)+'</span>']);
      });
      CLIMATE.forEach(function(c){rows.push([li===0?c[1]:c[0],c[2]]);});
      $('#facts').innerHTML=rows.map(function(r){
        return '<div class="fact"><div class="l">'+esc(r[0])+'</div><div class="v">'+r[1]+'</div></div>';
      }).join('');
    }

    /* ----------------------------------------------------- surveyed loader --- */
    /* The boundary tier is no longer announced in the title bar: which of two
       geometry sources is live is not something a reader needs at a glance. It is
       still reported, in the method note, for anyone who goes looking. */
    function setFid(state){
      FID=state;
      var n=$('#fidNote');
      if(n) n.textContent=T(state==='local'?'fidLocal':state==='loading'?'fidLoading'
        :state==='survey'?'fidSurvey':state==='town'?'fidTown':'fidFail');
      paintStrip();
    }
    function decodeTopo(topo,name){
      var tr=topo.transform, q=!!tr, sx=1,sy=1,tx=0,ty=0;
      if(q){sx=tr.scale[0];sy=tr.scale[1];tx=tr.translate[0];ty=tr.translate[1];}
      var arcs=topo.arcs.map(function(src){
        var x=0,y=0,out=[];
        for(var i=0;i<src.length;i++){
          if(q){x+=src[i][0];y+=src[i][1];out.push([x*sx+tx,y*sy+ty]);}
          else out.push([src[i][0],src[i][1]]);
        }
        return out;});
      function ring(idx){
        var out=[];
        for(var i=0;i<idx.length;i++){
          var k=idx[i],rev=k<0,a=arcs[rev?~k:k];
          if(!a)continue;
          if(rev){for(var j=a.length-1;j>=0;j--)out.push(a[j]);}
          else{for(var m=0;m<a.length;m++)out.push(a[m]);}
        }
        return out;}
      function ringsOf(g){
        var rs=[];
        if(g.type==='Polygon')(g.arcs||[]).forEach(function(r){rs.push(ring(r));});
        else if(g.type==='MultiPolygon')(g.arcs||[]).forEach(function(pl){
          pl.forEach(function(r){rs.push(ring(r));});});
        return rs;}
      var o=topo.objects&&topo.objects[name];
      if(!o) return null;
      return (o.geometries||[o]).map(function(g){
        return {p:g.properties||{},rings:ringsOf(g)};});
    }
    function getJSON(url,ms){
      return new Promise(function(res,rej){
        var done=false, timer=setTimeout(function(){
          if(!done){done=true;rej(new Error('timeout'));}},ms||18000);
        function ok(j){if(!done){done=true;clearTimeout(timer);res(j);}}
        function bad(e){if(!done){done=true;clearTimeout(timer);rej(e);}}
        if(typeof fetch==='function'){
          fetch(url).then(function(r){
            if(!r.ok) throw new Error('http '+r.status); return r.json();
          }).then(ok,function(){xhr();});
        } else xhr();
        function xhr(){
          try{
            var x=new XMLHttpRequest(); x.open('GET',url,true);
            x.onload=function(){try{ok(JSON.parse(x.responseText));}catch(e){bad(e);}};
            x.onerror=function(){bad(new Error('xhr'));};
            x.send();
          }catch(e){bad(e);}
        }
      });
    }
    /* taiwan-atlas redistributes the Ministry of the Interior's boundary files as
       TopoJSON at 1:10,000. Only the unprojected files are usable here; the
       -mercator- variants are pre-projected to a composite layout that would put
       Penghu, Kinmen and Matsu in the wrong place on this sheet. */
    var MIRRORS={
      counties:['https://cdn.jsdelivr.net/npm/taiwan-atlas/counties-10t.json',
                'https://fastly.jsdelivr.net/npm/taiwan-atlas/counties-10t.json',
                'https://gcore.jsdelivr.net/npm/taiwan-atlas/counties-10t.json',
                'https://unpkg.com/taiwan-atlas/counties-10t.json'],
      towns:['https://cdn.jsdelivr.net/npm/taiwan-atlas/towns-10t.json',
             'https://fastly.jsdelivr.net/npm/taiwan-atlas/towns-10t.json',
             'https://unpkg.com/taiwan-atlas/towns-10t.json']
    };
    var NAME2ID={};
    DIV.forEach(function(d){
      NAME2ID[d.zh]=d.id;
      NAME2ID[d.zh.replace('臺','台')]=d.id;
    });
    function looksLonLat(geoms){
      var n=0, ok=0;
      for(var i=0;i<geoms.length&&n<400;i++){
        var rs=geoms[i].rings;
        for(var j=0;j<rs.length&&n<400;j++){
          var r=rs[j], step=Math.max(1,Math.floor(r.length/6));
          for(var k=0;k<r.length&&n<400;k+=step){
            n++;
            if(r[k][0]>=117&&r[k][0]<=123&&r[k][1]>=21&&r[k][1]<=27) ok++;
          }
        }
      }
      return n>0&&ok/n>0.9;
    }
    function tryMirrors(list,name){
      var i=0;
      function next(){
        if(i>=list.length) return Promise.reject(new Error('all mirrors failed'));
        return getJSON(list[i++],14000).then(function(j){
          var g=decodeTopo(j,name);
          if(!g||!g.length) throw new Error('no object '+name);
          if(!looksLonLat(g)) throw new Error('not lon/lat');
          return g;
        },next);
      }
      return next();
    }
    function loadSurveyed(withTowns){
      setFid('loading');
      return tryMirrors(MIRRORS.counties,'counties').then(function(g){
        var found={};
        g.forEach(function(o){
          var nm=o.p.COUNTYNAME||o.p.COUNTYENG||'';
          var id=NAME2ID[nm];
          if(!id) return;
          (found[id]=found[id]||[]).push.apply(found[id],o.rings);
        });
        var hit=Object.keys(found).length;
        if(hit<18) throw new Error('only '+hit+' divisions matched');
        GEOM=found; setFid('survey'); drawGeometry(); applyTheme(curTheme);
        if(sel&&paths[sel]) paths[sel].classList.add('sel');
        if(!withTowns) return;
        return tryMirrors(MIRRORS.towns,'towns').then(function(tg){
          var d='';
          tg.forEach(function(o){ d+=ringsToPath(o.rings,true); });
          drawTowns(d); setFid('town');
        },function(){});
      }).catch(function(){
        GEOM=LOCAL; setFid('fail'); drawGeometry(); applyTheme(curTheme);
      });
    }
    function revertLocal(){
      GEOM=LOCAL; drawTowns(''); setFid('local');
      drawGeometry(); applyTheme(curTheme);
      if(sel&&paths[sel]) paths[sel].classList.add('sel');
    }

    /* -------------------------------------------------------------- chrome --- */
    function paintStrip(){
      var ed=cur==='en'?'August 2026':'2026年8月';
      $('#strip').innerHTML=
       '<div><span class="tag">'+T('mEdition')+'</span><span class="v">'+ed+'</span></div>'
      +'<div><span class="tag">'+T('mProjection')+'</span><span class="v">Albers Equal Area Conic</span></div>'
      +'<div><span class="tag">'+T('mPopulation')+'</span><span class="v"><b>'+fmt(TOTP)+'</b></span></div>'
      +'<div><span class="tag">'+T('mArea')+'</span><span class="v">'+fmt(Math.round(TOTA))+' km\u00B2</span></div>'
      +'<div><span class="tag">'+T('mOnSheet')+'</span><span class="v">22 \u00B7 '
        +ISL.length+' \u00B7 '+PLACE.length+'</span></div>';
    }
    function paint(){
      document.documentElement.setAttribute('lang',T('htmlLang'));
      $$('[data-t]').forEach(function(n){n.textContent=T(n.getAttribute('data-t'));});
      qEl.setAttribute('placeholder',T('qph'));
      qEl.setAttribute('aria-label',T('qph'));
      lblDiv.forEach(function(t){t.textContent=dN(BY[t.dataset.c]);});
      lblCity.forEach(function(t){
        t.textContent=cur==='zh'?t.dataset.zh:cur==='ja'?t.dataset.ja:t.dataset.en;});
      lblPeak.forEach(function(t){
        t.textContent=(cur==='en'?t.dataset.en:t.dataset.zh)+' '+fmt(t.dataset.h);});
      lblWater.forEach(function(t){t.textContent=cur==='en'?t.dataset.en:t.dataset.zh;});
      lblIsl.forEach(function(t){
        t.textContent=cur==='zh'?t.dataset.zh:cur==='ja'?t.dataset.ja:t.dataset.en;});
      lblCap.forEach(function(t){
        t.textContent=cur==='zh'?t.dataset.zh:cur==='ja'?t.dataset.ja:t.dataset.en;});
      lblRange.forEach(function(o){
        o.tp.textContent=cur==='en'?o.t.dataset.en:o.t.dataset.zh;});
      paintStrip(); buildThemes(); applyTheme(curTheme); buildIndex();
      buildTables(); buildFacts(); paintNational();
      if(sel) openDiv(sel); else showHint();
      drawScale(); lastKey=''; detail();
    }
    $('#setBtn').addEventListener('click',function(e){
      e.stopPropagation();
      var p=$('#setPop'), on=!p.classList.contains('open');
      p.classList.toggle('open',on); $('#setBtn').setAttribute('aria-expanded',String(on));
    });
    document.addEventListener('click',function(e){
      var p=$('#setPop');
      if(p.classList.contains('open')&&!p.contains(e.target)&&e.target!==$('#setBtn')){
        p.classList.remove('open'); $('#setBtn').setAttribute('aria-expanded','false');}
    });
    $$('#segLang button').forEach(function(b){
      b.addEventListener('click',function(){
        cur=b.dataset.lang;
        $$('#segLang button').forEach(function(x){
          x.setAttribute('aria-pressed',String(x===b));});
        paint();
      });
    });
    /* Ground.

       Dusk is the crossover: warm enough to read like paper, dim enough not to
       glare. That gives it a definite place in the automatic rule, which reads both
       the system's colour scheme and the hour:

           light system, daytime  -> paper
           light system, night    -> dusk
           dark  system, daytime  -> dusk
           dark  system, night    -> night

       So a reader who keeps a light system still gets a softened sheet after dark,
       and a reader who keeps a dark system never gets the bright one. Choosing a
       ground by hand pins it and stops the automatic rule. */
    var groundMode='auto';
    function prefersDark(){
      try{ return window.matchMedia('(prefers-color-scheme: dark)').matches; }
      catch(e){ return false; }
    }
    function isNightHour(){ var h=new Date().getHours(); return h<6||h>=19; }
    /* Two inputs, each worth one step down the scale, capped at the bottom. The
       revised United States sheet states the same rule this way and it is clearer
       than four branches: dark system and darkness each move the ground one step,
       and dusk is the middle both arrive at. */
    var GROUNDS=['paper','dusk','night'];
    function resolveGround(){
      if(groundMode!=='auto') return groundMode;
      return GROUNDS[Math.min(2,(prefersDark()?1:0)+(isNightHour()?1:0))];
    }
    function applyGround(){
      var g=resolveGround();
      if(document.documentElement.getAttribute('data-ground')!==g){
        document.documentElement.setAttribute('data-ground',g);
        applyTheme(curTheme);
      }
      var why;
      if(groundMode==='auto'){
        why=T(prefersDark()?'gWhyDark':'gWhyLight')+' '
          +T(isNightHour()?'gWhyNight':'gWhyDay')+' \u2192 '+T('g_'+g);
      } else why=T('gWhyPinned')+' '+T('g_'+g);
      var w=$('#groundWhy'); if(w) w.innerHTML=why;
      $$('#segGround button').forEach(function(x){
        x.setAttribute('aria-pressed',String(x.dataset.ground===groundMode));});
    }
    $$('#segGround button').forEach(function(b){
      b.addEventListener('click',function(){
        groundMode=b.dataset.ground;
        applyGround();
      });
    });
    (function watchGround(){
      try{
        var mq=window.matchMedia('(prefers-color-scheme: dark)');
        if(mq.addEventListener) mq.addEventListener('change',applyGround);
        else if(mq.addListener) mq.addListener(applyGround);
      }catch(e){}
      /* the hour moves on its own, so re-resolve periodically and on return */
      setInterval(function(){ if(groundMode==='auto') applyGround(); },5*60*1000);
      document.addEventListener('visibilitychange',function(){
        if(groundMode==='auto') applyGround();});
    })();
    $('#swDense').addEventListener('click',function(){
      var on=this.getAttribute('aria-pressed')!=='true';
      this.setAttribute('aria-pressed',String(on));
      document.documentElement.setAttribute('data-density',on?'tight':'normal');
      setTimeout(function(){syncU();drawScale();detail();},60);
    });
    $('#swSurvey').addEventListener('click',function(){
      var on=this.getAttribute('aria-pressed')!=='true';
      this.setAttribute('aria-pressed',String(on));
      if(on) loadSurveyed($('#swTown').getAttribute('aria-pressed')==='true');
      else revertLocal();
    });
    $('#swTown').addEventListener('click',function(){
      var on=this.getAttribute('aria-pressed')!=='true';
      this.setAttribute('aria-pressed',String(on));
      var b=$('#layers button[data-layer="towns"]');
      if(b){b.setAttribute('aria-pressed',String(on));
        L.towns.setAttribute('data-off',on?'0':'1');}
      if(on&&$('#swSurvey').getAttribute('aria-pressed')==='true') loadSurveyed(true);
      else if(!on) drawTowns('');
    });
    window.addEventListener('resize',function(){syncU();drawScale();
      requestAnimationFrame(function(){declutter();});});

    /* ---------------------------------------------------------------- boot --- */
    drawGeometry(); drawStatic();
    paint(); applyGround(); applyVB(); drawScale();
    setTimeout(function(){loadSurveyed(false);},80);

    /* ===== END ORIGINAL taiwan.html JAVASCRIPT ===== */
  }, []);

  return (
    <>
      <div className="app">

      <header className="hd">
        <h1 data-t="title"></h1>
        <div className="hd-r" style={{ position: "relative" }}>
          <button className="iconbtn" id="setBtn" aria-haspopup="true" aria-expanded="false">
            <span className="sr" data-t="settings"></span>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.11A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.11A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1A1.7 1.7 0 0 0 10.13 3V3a2 2 0 1 1 4 0v.11a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.08a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.11a1.7 1.7 0 0 0-1.49 1.03z"/></svg>
          </button>
          <div className="pop" id="setPop" role="dialog">
            <div className="grp"><span className="tag" data-t="sLang"></span>
              <div className="seg" id="segLang">
                <button data-lang="en" aria-pressed="true">English</button>
                <button data-lang="zh" aria-pressed="false">中文</button>
                <button data-lang="ja" aria-pressed="false">日本語</button>
              </div>
            </div>
            <div className="grp"><span className="tag" data-t="sGround"></span>
              <div className="seg" id="segGround">
                <button data-ground="auto" aria-pressed="true" data-t="gAuto"></button>
                <button data-ground="paper" aria-pressed="false" data-t="gPaper"></button>
                <button data-ground="dusk" aria-pressed="false" data-t="gDusk"></button>
                <button data-ground="night" aria-pressed="false" data-t="gNight"></button>
              </div>
              <p className="groundwhy" id="groundWhy"></p>
            </div>
            <div className="grp">
              <button className="rowsw" id="swDense" aria-pressed="false">
                <span data-t="sDense"></span><span className="knob"></span></button>
              <button className="rowsw" id="swSurvey" aria-pressed="true">
                <span data-t="sSurvey"></span><span className="knob"></span></button>
              <button className="rowsw" id="swTown" aria-pressed="false">
                <span data-t="sTown"></span><span className="knob"></span></button>
            </div>
          </div>
        </div>
      </header>

      <div className="strip" id="strip"></div>

      <div className="main">
        <div>
          <div className="stage" id="stage">
            <svg id="map" viewBox="0 0 820 980" preserveAspectRatio="xMidYMid meet"
                 role="application" aria-label="Map of the Taiwan Area" tabIndex="0"></svg>

            <div className="ov ov-tl">
              <div style={{ position: "relative" }}>
                <div className="glass search">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>
                  <input id="q" type="search" autoComplete="off" spellCheck="false" />
                  <button id="qx" hidden aria-label="Clear">&times;</button>
                </div>
                <div className="res" id="res" role="listbox"></div>
              </div>
            </div>

            <div className="ov ov-tr">
              <div className="glass zoomstack">
                <button id="zin"><span className="sr">Zoom in</span>
                  <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>
                <button id="zout"><span className="sr">Zoom out</span>
                  <svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg></button>
                <button id="zfit"><span className="sr">Reset view</span>
                  <svg viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5"/></svg></button>
                <div className="zlevel" id="zlevel">1.0&times;</div>
              </div>
            </div>

            <div className="ov ov-bl">
              <button className="glass chipbtn" id="lbtn" aria-expanded="false">
                <svg viewBox="0 0 24 24"><path d="M12 3l9 5-9 5-9-5 9-5M3 13l9 5 9-5M3 17l9 5 9-5"/></svg>
                <span data-t="layers"></span></button>
              <div className="glass scalebox">
                <svg width="112" height="18" id="sbar"></svg>
                <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden="true" style={{ flex: "0 0 auto" }}>
                  <line x1="8" y1="19" x2="8" y2="5" stroke="currentColor" strokeWidth=".9"/>
                  <path d="M8 1.5 L10.4 7 L5.6 7 Z" fill="currentColor"/></svg>
              </div>
            </div>

            <div className="lpanel" id="lpanel">
              <div className="grp"><span className="tag" data-t="layers"></span><div id="layers"></div></div>
              <div className="grp"><span className="tag" data-t="theme"></span>
                <select className="sel" id="theme"></select>
                <div id="key"></div>
              </div>
            </div>

            <div className="tip" id="tip" aria-hidden="true"></div>
          </div>
          <p style={{ marginTop: ".5rem", color: "var(--ink3)", fontSize: ".8em", lineHeight: "1.5" }} data-t="mapHint"></p>
        </div>

      </div>

      <section className="rec" id="reader" aria-live="polite"></section>

      <details className="ref natsec" id="nat">
        <summary><span className="tag" data-t="t0"></span><h2 id="natName"></h2></summary>
        <div className="refbody">
          <dl className="natfacts" id="natfacts"></dl>
          <div className="natgrid2">
            <div className="natcol">
              <span className="tag" data-t="nfFlag"></span>
              <div className="flagbox"><svg id="flag" viewBox="0 0 1200 800" role="img"></svg></div>
              <p className="prose" data-t="nfFlagP"></p>
              <dl className="kv" id="flagspec"></dl>
            </div>
            <div className="natcol">
              <span className="tag" data-t="nfEmblem"></span>
              <div className="flagbox" style={{ maxWidth: "12rem" }}>
                <svg id="emblem" viewBox="0 0 400 400" role="img"></svg></div>
              <p className="prose" data-t="nfEmblemP"></p>
              <dl className="kv" id="emblemspec"></dl>
            </div>
          </div>
          <div className="natgrid2">
            <div className="natcol">
              <span className="tag" data-t="nfAnthem"></span>
              <h3 className="anthemT" id="anthemT"></h3>
              <p className="anthemSub" id="anthemSub"></p>
              <p className="verse" id="anthemV"></p>
              <p className="prose" id="anthemNote"></p>
            </div>
            <div className="natcol">
              <span className="tag" data-t="nfFlagAnthem"></span>
              <h3 className="anthemT" id="fanthemT"></h3>
              <p className="anthemSub" id="fanthemSub"></p>
              <p className="verse" id="fanthemV"></p>
              <p className="prose" id="fanthemNote"></p>
            </div>
          </div>
          {/* The dynastic axis, then the milestones directly beneath it, in the
               arrangement the revised United States sheet uses. */}
          <div className="nathist">
            <span className="tag" data-t="nfEras"></span>
            <p className="prose" data-t="nfErasP"></p>
            <div className="eras">
              <div className="erapre"><span id="eraPreLbl"></span><i></i></div>
              <div className="eraband" id="eraband" role="group"></div>
              <div className="erascale" id="erascale"></div>
              <div className="erachips" id="erachips" role="group"></div>
              <div className="eranote" id="eranote"></div>
              <p className="eracaveat" id="eracaveat"></p>
            </div>
            <div className="histsplit">
              <span className="tag" data-t="nfHistory"></span>
              <p className="prose" data-t="nfHistoryP"></p>
              <ol className="tline" id="tline"></ol>
            </div>
          </div>

          {/* The island's own axis, in the same arrangement, with the detailed
               regime list where the milestones sit above. */}
          <div className="nathist">
            <span className="tag" data-t="nfSucc"></span>
            <p className="prose" data-t="nfSuccP"></p>
            <div className="eras">
              <div className="eraband" id="islband" role="group"></div>
              <div className="erascale" id="islscale"></div>
              <div className="erachips" id="islchips" role="group"></div>
              <div className="eranote" id="islnote"></div>
              <p className="eracaveat" id="islcaveat"></p>
            </div>
            <div className="histsplit">
              <span className="tag" data-t="nfSuccList"></span>
              <ul className="succ" id="succ"></ul>
            </div>
          </div>
          <div className="natfoot">
            <span className="tag" data-t="nfOfficial"></span>
            <ul className="links">
              <li><a href="https://www.taiwan.gov.tw/" target="_blank" rel="noopener">taiwan.gov.tw</a>
                <span data-t="lkGov"></span></li>
              <li><a href="https://www.moi.gov.tw/" target="_blank" rel="noopener">moi.gov.tw</a>
                <span data-t="lkMoi"></span></li>
              <li><a href="https://www.president.gov.tw/" target="_blank" rel="noopener">president.gov.tw</a>
                <span data-t="lkPres"></span></li>
            </ul>
          </div>
        </div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t1"></span><h2 data-t="t1h"></h2>
          <span className="c" data-t="sortHint"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tDv"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t2"></span><h2 data-t="t2h"></h2>
          <span className="c" id="pkc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tPk"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t6"></span><h2 data-t="t6h"></h2>
          <span className="c" id="rvc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tRv"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t7"></span><h2 data-t="t7h"></h2>
          <span className="c" id="prc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tPr"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t5"></span><h2 data-t="t5h"></h2>
          <span className="c" id="isc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tIs"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t8"></span><h2 data-t="t8h"></h2>
          <span className="c" id="plc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tPl"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t9"></span><h2 data-t="t9h"></h2>
          <span className="c" id="ppc"></span></summary>
        <div className="refbody"><div className="tw-wrap"><table id="tPp"><thead><tr></tr></thead><tbody></tbody></table></div></div>
      </details>

      <details className="ref"><summary><span className="tag" data-t="t3"></span><h2 data-t="t3h"></h2></summary>
        <div className="refbody"><div className="facts" id="facts"></div></div>
      </details>

      <details className="ref notes"><summary><span className="tag" data-t="t4"></span><h2 data-t="t4h"></h2></summary>
        <div className="refbody">
        <h3 data-t="n1h"></h3><p className="warn" data-t="n1"></p>
        <p style={{ fontFamily: "var(--mono)", fontSize: ".74rem", color: "var(--ink3)", marginTop: ".4rem" }}>
          <span data-t="fidNow"></span> <span id="fidNote"></span></p>
        <h3 data-t="n2h"></h3><p data-t="n2"></p>
        <h3 data-t="n3h"></h3><p data-t="n3"></p>
        <h3 data-t="n4h"></h3><p data-t="n4"></p>
        <h3 data-t="n5h"></h3><p data-t="n5"></p>
        <h3 data-t="srcH"></h3>
        <div className="src">
          內政部戶政司《人口統計季刊》民國115年春季（統計至115年3月31日）<br />
          內政部《直轄市、縣市界線》與《鄉鎮市區界線》（TWD97 經緯度），經 taiwan-atlas 轉為 TopoJSON<br />
          內政部國家公園署，各國家公園公告日期與面積<br />
          經濟部水利署，中央管河川流路與流域面積<br />
          內政部國土測繪中心，臺灣本島四極點與各級控制點<br />
          原住民族委員會，族別認定公告<br />
          《中華民國憲法》第六條；《中華民國國徽國旗法》（民國17年12月17日公布）
        </div>
        </div>
      </details>
      </div>
    </>
  );
}
