// components/laptop/boot.ts
//
// The decision that has to happen before the first paint.
//
// The page is server-rendered as the text layout, because the server cannot know
// whether this visitor gets 3D. Previously the browser painted that text layout
// first, then — a second or two later, once React and the 3D chunk arrived — swapped
// it for a dark loading screen and then the laptop. Desktop visitors saw the wrong
// page flash up, then a jump, then the scene popping in half-drawn.
//
// This script runs inline in <head>, before <body> is parsed, so it is the only code
// that can act before anything is on screen. It makes the same decision React will
// make later (see compute() in lib/presentationStore.ts) and marks <html>:
//
//   data-laptop="boot"   → CSS hides the text layout and shows the boot screen from
//                          the very first frame. React upgrades this to "on" when
//                          the 3D gate mounts, and adds data-laptop-ready once the
//                          scene has actually drawn — only then does the boot
//                          screen fade.
//   (no attribute)       → the text layout paints immediately, exactly as before.
//                          Phones, reduced-motion and no-WebGL visitors never see
//                          the boot screen at all.
//
// It only acts on the home page — the layout is shared with the 404 page and the
// calibration tools, which have no 3D layer to hand over to.
//
// It must stay small, dependency-free and impossible to break the page:
//   · Every step is in try/catch. If anything throws, no attribute is set and the
//     visitor gets the text layout — the safe default.
//   · WebGL is only sniffed (`WebGLRenderingContext in window`), not probed. A real
//     probe costs a context creation on the critical path. In the rare case the sniff
//     says yes but a context cannot be created, React's own probe says no and removes
//     the attribute, and the text layout appears.
//   · A watchdog removes "boot" if React never takes over (main bundle failed to
//     load, a stale deploy, JS errors): the visitor is never stranded on a loader.
//
// `?view=text` / `?view=3d` in the URL set the preference before anything renders.
// The boot screen's "text version" link uses that, so the escape hatch works even if
// the JavaScript bundle never arrives.

import { PERF } from "./perf"

/** localStorage key for an explicit choice. Shared with lib/capability.ts. */
export const PRESENTATION_KEY = "portfolio:presentation"

/** How long React gets to take over before the boot screen gives up. */
const WATCHDOG_MS = 12000

export const bootScript = `(function(){try{
if(location.pathname!=="/")return;
var d=document.documentElement,K=${JSON.stringify(PRESENTATION_KEY)},s=null;
try{var q=new URLSearchParams(location.search).get("view");
if(q==="text"||q==="3d")localStorage.setItem(K,q);
s=localStorage.getItem(K)}catch(e){}
var want=s==="3d"||s==="text"?s:(
!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)&&
window.innerWidth>=${PERF.mobileBreakpoint}&&
"WebGLRenderingContext" in window?"3d":"text");
if(want!=="3d")return;
d.setAttribute("data-laptop","boot");
if("scrollRestoration" in history)history.scrollRestoration="manual";
var l=document.createElement("link");l.rel="preload";l.as="fetch";
l.href="/laptop.glb";l.crossOrigin="anonymous";document.head.appendChild(l);
setTimeout(function(){if(d.getAttribute("data-laptop")==="boot")d.removeAttribute("data-laptop")},${WATCHDOG_MS});
}catch(e){}})();`
