# Phase 2F · F4: Verification and the iPhone benchmark

**Date:** 2026-10-27  
**Status:** **accepted 2026-10-27. Phase 2F is closed.** You accepted F4 on your observation that the museum runs fine on your iPhone. The measured iPhone benchmark was not recorded, so mobile frame rates and stalls remain unmeasured (§7).  
**Nothing is committed or deployed.**

## 1. Rail rerouted (your instruction)

The overhead bronze rail now leaves the phone wall at y 36.0, just north of the screen frame, instead of at the screen's centre. At "Play the customer" it no longer crosses the chat. Change in `blender/scripts/rooms/flowdesk.py`; museum.blend rebuilt from the scripts; FlowDesk rebaked and re-encoded (413 KB, within budget). The owner board stays a still image, as you decided.

Backups of the approved F3 state: `blender/src/museum_f3.blend`, `blender/out/{raw,bake}/f3/`, `blender/out/served-f3-flowdesk.glb`.

## 2. Found and fixed during F4

| Problem | How it showed | Fix |
|---|---|---|
| **Freeze while the museum starts.** The real-time bronze shader and FlowDesk's pre-warm both compiled synchronously | On this laptop's real GPU, a cold `/museum` load blocked the main thread for **2.5 s, then 1.9 s, then 0.5 s**. These matched the stalls in the first benchmark run | Shaders now compile with `compileAsync`, which doesn't block where the browser supports parallel compiling. Each room stays hidden behind the loader until it's ready (`useCompiledScene` in `MuseumCanvas.tsx`). Long tasks after the fix: **94 + 252 ms** cold, **167 + 74 ms** on reload |
| "Court ready" fired every second | The benchmark timeline listed it 70 times | The ready signal now fires once per loaded scene |
| The benchmark reported the wrong render size | It said 1.38× while the adaptive quality had raised it to 2.0× | Every pixel-ratio change is now on the timeline, and the report says the figure is "on load" |

The startup freeze matters most for the iPhone. The Phase 2 freeze happened as FlowDesk first came into view, and a synchronous compile on first sight is exactly that kind of event. It's now removed on browsers that support parallel compiling. Whether iPhone Safari is one of them, the benchmark in §7 will show.

## 3. Automated tests

- **74 tests in 11 files, all passing.**
- **Coverage:** 94.4% of statements, 88.0% of branches, 93.0% of functions, 96.5% of lines. The rule is 80%.
- **Typecheck, lint and the production build:** clean. The only lint warning left is in the generated `coverage/` folder.

## 4. Accessibility

| Page | Lighthouse accessibility | Best practices |
|---|---|---|
| `/` desktop and mobile | 100 · 100 | 100 · 100 |
| `/quick` desktop and mobile | 100 · 100 | 100 · 100 |
| `/museum` desktop and mobile | 100 · 100 | 100 · 100 |
| `/museum?stop=conversation` mobile (sheet open, demo panel) | 100 | — |
| `/work/flowdesk` desktop and mobile | 100 · 100 | 100 · 100 |

The component tests cover:
- keyboard tour controls (arrow keys, modifier keys ignored, Escape closes the stop list);
- `aria-expanded` and `aria-pressed` states;
- the phone sheet and the "Leave 3D" exit.

Reduced motion snaps the camera and the monument casts instead of easing them. Every 3D moment has its words in the DOM.

**Not done:** a screen-reader walkthrough with VoiceOver or NVDA. Automated audits catch markup problems, not whether the tour makes sense when heard. I'd recommend five minutes with VoiceOver on your iPhone before launch.

## 5. Desktop benchmark (this laptop, Intel HD 520, visible browser)

Each figure is the average fps standing still at that stop. "Lowest" is the worst single second.

| Run | Viewport | Court | Monument | Threshold | Hall | Conversation | Order | Beneath | Stalls during run |
|---|---|---|---|---|---|---|---|---|---|
| 1, before fixes | 1280×640 | 48 | 59 | 60 | 59 | 59 | 60 | 59 | 1,075 ms at Court; 463 ms at Monument |
| 2 | 1280×640 | 60 | 60 | 59 | 60 | 52 | 60 | 59 | 1,120 ms at Conversation, standing still; not repeated |
| 3 | 1280×640 | 59 | 60 | 59 | 59 | 59 | 60 | 60 | **none** |
| 4, async compile | 1920×1080 | 53 | 51 | 53 | 54 | 57 | 50 | 46 | 365 ms at Hall |
| 5, async compile | 1920×1080 | **40** | 44 | 42 | 53 | 56 | 48 | 47 | **none · target met** |

**Against Phase 2** (same laptop, 1920×1080, built-in benchmark):

| | Phase 2 | F4 (run 5) |
|---|---|---|
| Worst stop average | 40 fps | 40 fps |
| Lowest single second | 8 fps (texture upload) | 33 fps |
| Pixels rendered | ~3.9 M (1.38×, fixed) | rising to ~6.2 M (1.38 → 2.0×, adaptive) |
| Triangles, both rooms | 15,074 | 26,518 |
| Draw calls, worst stop | 25 | 15 |
| Model download | 471 KB | 1.4 MB |
| GPU texture memory | 26.6 MB | 13.4 MB |

The laptop holds the same worst-case frame rate while drawing about 60% more pixels, 75% more triangles and a real-time metal. The worst stutter improved from 8 fps to 33 fps.

**Treat the occasional 0.4–1.1 s stall while standing still with care.** It came in two of five runs, at a different stop each time, with nothing loading. Logging pixel-ratio changes ruled out canvas resizes as the cause. It may come from this laptop, which was also running the dev server, Blender and the Claude app, rather than from the museum. The iPhone run will separate the two.

## 6. Lighthouse performance

Lighthouse's headless Chrome draws WebGL in software, without a GPU. Its mobile profile adds a 4× CPU slowdown on top of this already slow laptop. For `/museum` it greatly overstates what a real GPU does (§2). For the other pages it's a fair comparison.

| Page | Phase 2 desktop · mobile | F4 desktop · mobile | F4 mobile LCP · TBT |
|---|---|---|---|
| `/` | 99 · 68 | 98 · 70 | 4.2 s · 630 ms |
| `/quick` | 98 · 73 | 99 · 76 | 4.0 s · 430 ms |
| `/work/flowdesk` | — | 98 · 73 | 4.1 s · 560 ms |
| `/museum` | 68 · 50 | 60 · 47 | 4.3 s · 9,140 ms |

On `/museum`, software-GL blocking time is worse than in Phase 2: desktop went from 0.7 s to 2.0 s, mobile from 5.1 s to 9.1 s. Before the §2 fix it was 10.7 s and 10.3 s. What remains is the reflection-map setup and the bronze shader, compiled synchronously in software. On a real GPU the same load now blocks for about 0.35 s. Mobile LCP of about 4 s and blocking time of 430–630 ms on the HTML pages are unchanged from Phase 2 and still miss the 2.5 s and 200 ms targets. That is still the open item from Checkpoint E.

## 7. Your iPhone benchmark: the step I need from you

The laptop is serving the production build at **http://172.20.10.2:3001**, on the "darkRose" hotspot, as in Phase 2. Please:

1. Keep the laptop awake, with this session open so the server keeps running.
2. On the iPhone, open **Safari → http://172.20.10.2:3001/museum?perf=1**. Use the same phone and network as last time if you can.
3. When the Court appears, tap **Run benchmark**. Then **don't touch the screen for about 50 seconds**, and keep the screen on.
4. Tap **Copy results** and paste them here.
5. If you can, run it a second time with **Run benchmark** again, and paste that too. The first run includes the cold load; the second shows the steady state.

Loading stalls are logged even before you tap Run, marked "(before the run)". So the first report will show whether the old 5–8 second freeze at the Threshold is gone, and when anything is still slow.

**Result so far (2026-10-27):** you ran it on your iPhone and report that it "works just fine". That is a positive observation. But no benchmark report was pasted, so the measured pass criteria below (frame rates, stalls, whether the Threshold freeze is gone) are **unconfirmed**. **You accepted F4 on that observation.** A measured run can still be added later with the same link.

**What I'll compare against** (Phase 2, your iPhone, 414×750 at 1.5×): Court 60/60, Stratum 59/58, **Threshold 0/0** (no frames for about 5 s), **Hall 42/6**, Conversation 59/58, Order 58/58, Beneath 59/58. To pass, every stop must average 30 fps or more with no stall over 250 ms during the run.

## 8. Known issues

1. **No iPhone evidence yet** (§7).
2. **Mobile load speed on the HTML pages:** LCP about 4 s and blocking time of 430–630 ms under Lighthouse's mobile profile. This is unchanged since Phase 2 and still your decision from Checkpoint E: fonts and JavaScript start-up.
3. **`/museum` under software WebGL** blocks for 2–9 s (§6). If the iPhone shows a startup pause, the next step is to build the reflection map lazily after the Court appears, or switch the bronze to a cheap baked-reflection "matcap" material. That second option is a visual change I'd show you first.
4. Occasional standing-still stalls on this laptop (§5), cause unproven.
5. **Not done:** a screen-reader walkthrough (§4).
6. **Carried over:** FlowDesk reads a little sparse; the 1024 lightmap is soft on the large walls; roof seam gaps visible only from the air; review markers on; founder answers D1, D2, D3, D5, D6, D8, P1-6, Q10, Q11 and demo prices still open.
