import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import { BirdStage } from './components/BirdStage';
import { DebugPanel } from './components/DebugPanel';
import { MemoryBook } from './components/MemoryBook';
import { CATS, findItem, itemsOf, type CatId } from './pet/catalog';
import { birdCss, type Pose } from './pet/bird';
import {
  FIRST_LINE,
  NAME_QUESTION,
  dawnLine,
  idleLine,
  isDawn,
  namedLine,
  reactionLine,
  recallLine,
} from './pet/dialogue';
import {
  HOUR,
  MAX_LEVEL,
  UNLOCK_LEVEL,
  activeBird,
  addXp,
  adoptBird,
  advanceFlock,
  bondTitle,
  clearPet,
  createPet,
  errandText,
  interact,
  isUnlocked,
  loadFlock,
  needsOf,
  nudgeOthers,
  poseOf,
  replaceBird,
  saveFlock,
  statusWord,
  switchBird,
  xpForLevel,
  type Action,
  type Flock,
  type PetState,
  type UnlockKey,
} from './pet/model';
import { ADOPT_LEVEL, MAX_BIRDS, SPECIES_LIST, speciesOf, type SpeciesId } from './pet/species';
import { motionCss, motionOfItem, type MotionId } from './pet/motion';
import { skillOf } from './pet/skills';
import { NOTE_LABELS, callForEffect, isMuted, noteLabel, play, playNote, playSequence, setMuted } from './pet/sound';

interface Speech {
  id: number;
  text: string;
}

const DEFAULT_NAME = '糖糖';
const NOTE_PAD = [0, 1, 2, 3, 4];

function useTypewriter(text: string, version: number, speed = 24): string {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    if (!text) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, version, speed]);

  return shown;
}

function SpeechBubble({ speech }: { speech: Speech | null }) {
  const text = speech?.text ?? '';
  const shown = useTypewriter(text, speech?.id ?? 0);
  if (!text) return <div className="bubble bubble-empty" aria-hidden />;
  return (
    <div className="bubble">
      <p>
        {shown}
        {shown.length < text.length ? <span className="caret" /> : null}
      </p>
    </div>
  );
}

export default function App() {
  const [flock, setFlock] = useState<Flock | null>(() => loadFlock());
  const [phase, setPhase] = useState<'naming' | 'live'>(() => (loadFlock() ? 'live' : 'naming'));
  const [speech, setSpeech] = useState<Speech | null>(() =>
    loadFlock() ? null : { id: 1, text: FIRST_LINE },
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState(DEFAULT_NAME);
  const [clock, setClock] = useState(() => Date.now());
  const [muted, setMutedState] = useState(() => isMuted());
  const [flash, setFlash] = useState<Pose | null>(null);
  const [motion, setMotion] = useState<MotionId | null>(null);
  const [tab, setTab] = useState<CatId>('food');
  const [showWhistle, setShowWhistle] = useState(false);
  const [notes, setNotes] = useState<number[]>([]);
  const [adoptOpen, setAdoptOpen] = useState(false);
  const [adoptTarget, setAdoptTarget] = useState<SpeciesId | null>(null);
  const [adoptName, setAdoptName] = useState('');
  const [debug] = useState(() => new URLSearchParams(window.location.search).has('debug'));

  const pet = flock ? activeBird(flock) : null;
  const petRef = useRef<PetState | null>(null);
  petRef.current = pet;
  const flockRef = useRef<Flock | null>(null);
  flockRef.current = flock;
  const lastLineRef = useRef('');
  const bootedRef = useRef(false);
  const flashTimer = useRef<number | null>(null);
  const extraTimer = useRef<number | null>(null);
  const motionTimer = useRef<number | null>(null);

  const speak = useCallback((text: string) => {
    lastLineRef.current = text;
    setSpeech((prev) => ({ id: (prev?.id ?? 0) + 1, text }));
  }, []);

  const setPet = useCallback((next: PetState) => {
    setFlock((prev) => (prev ? replaceBird(prev, next) : prev));
  }, []);

  const flashPose = useCallback((pose: Pose, ms = 3500) => {
    setFlash(pose);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), ms);
  }, []);

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    if (extraTimer.current) window.clearTimeout(extraTimer.current);
    if (motionTimer.current) window.clearTimeout(motionTimer.current);
  }, []);

  /** 让它真的做出这个动作（约 1.4 秒后回到待机） */
  const playMotion = useCallback((next: MotionId, ms = 1400) => {
    setMotion(null);
    // 先清空再设置，保证连续点同一个动作也会重播
    window.requestAnimationFrame(() => setMotion(next));
    if (motionTimer.current) window.clearTimeout(motionTimer.current);
    motionTimer.current = window.setTimeout(() => setMotion(null), ms);
  }, []);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const loaded = flockRef.current;
    if (!loaded) {
      speak(FIRST_LINE);
      return;
    }

    const { flock: advanced, notices } = advanceFlock(loaded, Date.now());
    const active = activeBird(advanced);
    const returning: PetState = { ...active, visits: active.visits + 1 };
    const nextFlock = replaceBird(advanced, returning);
    setFlock(nextFlock);
    saveFlock(nextFlock);
    setClock(Date.now());
    if (notices.length > 0) setNotice(notices.join(' '));

    if (returning.away) {
      speak('（笼子空着。门开了一条缝。栖木上还有一只温热的印子。）');
    } else if (returning.sick) {
      speak('（它缩在角落，羽毛松着。它不舒服。）');
    } else if (returning.grudge >= 60) {
      speak('（它看见你，把羽毛一根根竖了起来。）');
    } else if (returning.satiety <= 10 || returning.thirst <= 10) {
      speak('（它扑到食盆边上，发现是空的，回头冲你叫了一声。）');
    } else {
      speak('叽。（它从栖木上跳下来，又跳回去，装作没在等你。）');
    }
  }, [speak]);

  useEffect(() => {
    if (flock) saveFlock(flock);
  }, [flock]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(Date.now());
      setFlock((prev) => (prev ? advanceFlock(prev, Date.now()).flock : prev));
    }, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = window.setInterval(() => {
      const current = petRef.current;
      if (!current) return;
      if (current.asleep) return;
      const now = Date.now();
      if (Math.random() > 0.5) return;

      if (isDawn(now) && Math.random() < 0.45) {
        speak(dawnLine());
        play('beg');
        return;
      }
      speak(idleLine(current, lastLineRef.current));
      if (Math.random() < 0.45) play(Math.random() < 0.5 ? 'chirp' : 'grind');
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [phase, speak]);

  const perform = useCallback(
    (action: Action) => {
      const current = petRef.current;
      if (!current) return;
      const outcome = interact(current, action, Date.now());
      setPet(outcome.state);
      setClock(Date.now());
      speak(reactionLine(outcome.effect, outcome.state, lastLineRef.current, outcome.detail));

      // 摸一只，其他鸟会吃醋
      const crew = flockRef.current;
      if (crew && crew.birds.length > 1 && action.type === 'do' && action.id.startsWith('touch-')) {
        setFlock((prev) => (prev ? nudgeOthers(prev, current.id, { grudge: 2 }) : prev));
      }

      const call = callForEffect(outcome.effect);
      if (call) play(call);

      // 动作层：点什么都得有对应的动作，别只有那几张脸
      if (action.type === 'do') {
        const item = findItem(action.id);
        if (item) playMotion(motionOfItem(item), 1500);
      } else {
        const byAction: Partial<Record<Action['type'], MotionId>> = {
          feed: 'peck',
          drink: 'drink',
          bath: 'shake',
          cleanCage: 'peck',
          toy: 'hop',
          pet: 'headbob',
          play: 'flap',
          scold: 'shiver',
          sorry: 'headbob',
          train: 'headbob',
          perform: 'sing',
          whistle: 'sing',
          sleep: 'preen',
          free: 'flap',
        };
        const m = byAction[action.type];
        if (m) playMotion(m, 1500);
      }

      if (outcome.extraLine) {
        const line = outcome.extraLine;
        if (extraTimer.current) window.clearTimeout(extraTimer.current);
        extraTimer.current = window.setTimeout(() => speak(line), 2400);
      }

      if (
        outcome.effect === 'scold' ||
        outcome.effect === 'touch_refused' ||
        outcome.effect === 'feed_refused' ||
        outcome.effect === 'free_off' ||
        outcome.effect === 'sorry_refused'
      ) {
        flashPose('angry', 4000);
      } else if (outcome.effect === 'bath_ok') {
        flashPose('wet', 4000);
      } else if (
        outcome.effect === 'play_ok' ||
        outcome.effect === 'toy_ok' ||
        outcome.effect === 'free_on' ||
        outcome.effect === 'train_ok' ||
        outcome.effect === 'perform_ok'
      ) {
        flashPose('happy', 3000);
      } else if (outcome.effect === 'do_ok') {
        flashPose((outcome.state.mood ?? 0) >= (current.mood ?? 0) ? 'happy' : 'angry', 2600);
      }
    },
    [flashPose, playMotion, setPet, speak],
  );

  const startNew = (event: FormEvent) => {
    event.preventDefault();
    const first = createPet(nameDraft.trim() || DEFAULT_NAME, Date.now());
    const fresh: Flock = { version: 4, activeId: first.id, birds: [first] };
    setFlock(fresh);
    saveFlock(fresh);
    setPhase('live');
    setNotice(null);
    speak(namedLine(first.name));
    play('chirp');
  };

  const recall = () => {
    const current = petRef.current;
    if (!current) return;
    speak(recallLine(current, Date.now()));
    play('soft');
  };

  const switchTo = (id: string) => {
    setFlock((prev) => {
      if (!prev) return prev;
      const next = switchBird(prev, id);
      const b = activeBird(next);
      speak(`（${b.name} 抬头看你。${speciesOf(b.species).traits.note}。）`);
      return next;
    });
    setFlash(null);
  };

  const confirmAdopt = () => {
    if (!adoptTarget || !flock) return;
    const name = adoptName.trim() || speciesOf(adoptTarget).short;
    const next = adoptBird(flock, adoptTarget, name, Date.now());
    setFlock(next);
    saveFlock(next);
    setAdoptOpen(false);
    setAdoptTarget(null);
    setAdoptName('');
    speak(`（${speciesOf(adoptTarget).short}进笼了。它有点怕，先别伸手。）`);
    play('chirp');
  };

  const gainXpBy = (amount: number) => {
    const current = petRef.current;
    if (!current) return;
    const result = addXp(current, amount);
    setPet(result.state);
    speak(result.leveled ? `（升级了。现在是 Lv.${result.state.level}。）` : '（经验涨了一点。）');
  };

  const fastForward = (hours: number) => {
    const crew = flockRef.current;
    if (!crew) return;
    const moved: Flock = {
      ...crew,
      birds: crew.birds.map((b) => ({ ...b, lastTick: b.lastTick - hours * HOUR })),
    };
    const { flock: next, notices } = advanceFlock(moved, Date.now());
    setFlock(next);
    setClock(Date.now());
    if (notices.length > 0) setNotice(notices.join(' '));
    speak(idleLine(activeBird(next), lastLineRef.current));
  };

  const reset = () => {
    clearPet();
    setFlock(null);
    setNotice(null);
    setNameDraft(DEFAULT_NAME);
    setPhase('naming');
    setSpeech({ id: 1, text: FIRST_LINE });
    setShowWhistle(false);
    setNotes([]);
    setAdoptOpen(false);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) play('chirp');
  };

  if (phase === 'naming') {
    return (
      <div className="app app-onboard">
        <style dangerouslySetInnerHTML={{ __html: birdCss() + motionCss() }} />
        <div className="onboard-card">
          <div className="onboard-bird">
            <BirdStage pose="normal" species="lovebird-lutino" onTouch={() => play('chirp')} />
          </div>
          <SpeechBubble speech={speech} />
          <p className="onboard-question">{NAME_QUESTION}</p>
          <form onSubmit={startNew} className="onboard-form">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="它叫什么？"
              maxLength={12}
              autoFocus
            />
            <button type="submit">就叫这个</button>
          </form>
          <p className="onboard-foot">第一只是黄桃牡丹鹦鹉（公）。以后可以领养更多。</p>
        </div>
      </div>
    );
  }

  if (!flock || !pet) return <div className="app app-boot" />;

  const sp = speciesOf(pet.species);
  const pose = flash ?? poseOf(pet, clock);
  const needs = needsOf(pet).filter((n) => !(n === '无聊' && flock.birds.length > 1));
  const xpNeed = xpForLevel(pet.level);
  const xpPct = pet.level >= MAX_LEVEL ? 100 : Math.min(100, Math.round((pet.xp / xpNeed) * 100));
  const tabItems = itemsOf(tab);
  const full = flock.birds.length >= MAX_BIRDS;

  const Gate = ({ k, label, onClick }: { k: UnlockKey; label: string; onClick: () => void }) => {
    const lv = UNLOCK_LEVEL[k];
    const open = isUnlocked(pet, k);
    return (
      <button type="button" disabled={!open} onClick={onClick} title={open ? '' : `Lv.${lv} 解锁`}>
        {open ? label : `${label} · Lv.${lv}`}
      </button>
    );
  };

  return (
    <div className="app">
      <style dangerouslySetInnerHTML={{ __html: birdCss() + motionCss() }} />
      <header className="topbar">
        <div>
          <h1 className="pet-name">
            {pet.name}
            <span className="level-badge">Lv.{pet.level}</span>
          </h1>
          <p className="pet-status">
            <span className="species">{sp.name}</span>
            <span className="dot">·</span>
            {statusWord(pet)}
            <span className="dot">·</span>
            <span className="bond">{bondTitle(pet.bond)}</span>
          </p>
        </div>
        <div className="topbar-right">
          <div className="xp" title={`${pet.xp} / ${xpNeed} 经验`}>
            <span className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
          {needs.length > 0 ? (
            <div className="needs">
              {needs.map((n) => (
                <span key={n} className="need">
                  {n}
                </span>
              ))}
            </div>
          ) : null}
          <button type="button" className="mute" onClick={toggleMute}>
            {muted ? '声音：关' : '声音：开'}
          </button>
        </div>
      </header>

      <div className="flock">
        {flock.birds.map((b) => (
          <button
            key={b.id}
            type="button"
            className={b.id === flock.activeId ? 'bird-chip on' : 'bird-chip'}
            onClick={() => switchTo(b.id)}
            title={speciesOf(b.species).traits.note}
          >
            <i className="chip-dot" style={{ background: speciesOf(b.species).look.body }} />
            {b.name}
            <span className="chip-lv">Lv.{b.level}</span>
          </button>
        ))}
        {!full ? (
          <button type="button" className="bird-chip add" onClick={() => setAdoptOpen((v) => !v)}>
            ＋ 领养
          </button>
        ) : null}
      </div>

      {adoptOpen ? (
        <div className="adopt">
          <div className="adopt-head">
            <span>领养一只新鸟（笼子里最多 {MAX_BIRDS} 只）</span>
            <button type="button" className="ghost" onClick={() => setAdoptOpen(false)}>
              关
            </button>
          </div>
          <div className="adopt-list">
            {SPECIES_LIST.filter((cand) => !flock.birds.some((b) => b.species === cand.id)).map((cand) => {
              const need = ADOPT_LEVEL[cand.id];
              const open = pet.level >= need;
              return (
                <button
                  key={cand.id}
                  type="button"
                  disabled={!open}
                  className={adoptTarget === cand.id ? 'adopt-item on' : 'adopt-item'}
                  onClick={() => {
                    setAdoptTarget(cand.id);
                    setAdoptName(cand.short);
                  }}
                >
                  <i className="chip-dot" style={{ background: cand.look.body }} />
                  {cand.name}
                  {open ? '' : ` · Lv.${need}`}
                </button>
              );
            })}
          </div>
          {adoptTarget ? (
            <div className="adopt-form">
              <input
                value={adoptName}
                onChange={(e) => setAdoptName(e.target.value)}
                maxLength={10}
                placeholder="给它起个名字"
              />
              <button type="button" onClick={confirmAdopt}>
                带它回家
              </button>
            </div>
          ) : (
            <p className="muted">先选一只，再给它起名字。</p>
          )}
        </div>
      ) : null}

      <main className="layout">
        <section className={`stage${pose === 'wet' ? ' is-wet' : ''}`}>
          <SpeechBubble speech={speech} />
          <div className="bird-wrap">
            <BirdStage
              pose={pose}
              species={pet.species}
              motion={motion ?? undefined}
              onTouch={() => perform({ type: 'do', id: 'touch-neck' })}
            />
            {pose === 'wet' ? (
              <div className="drops" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </div>
            ) : null}
          </div>
          {notice ? (
            <div className="note">
              <p>{notice}</p>
              <button type="button" onClick={() => setNotice(null)}>
                把纸条收起来
              </button>
            </div>
          ) : null}
        </section>

        <aside className="side">
          <div className={`errand${pet.errand && pet.errand.got >= pet.errand.need ? ' is-done' : ''}`}>
            <span className="side-label">今天的心愿</span>
            {pet.errand ? (
              <>
                <p className="errand-text">{errandText(pet.errand)}</p>
                <div className="errand-dots">
                  {Array.from({ length: pet.errand.need }).map((_, i) => (
                    <i key={i} className={i < pet.errand!.got ? 'on' : ''} />
                  ))}
                </div>
              </>
            ) : (
              <p className="errand-text muted">
                {pet.level >= UNLOCK_LEVEL.errand ? '今天没有心愿' : `Lv.${UNLOCK_LEVEL.errand} 解锁每日心愿`}
              </p>
            )}
          </div>

          <div className="skills">
            <span className="side-label">会做的事</span>
            <div className="skill-chips">
              {pet.skills.length === 0 ? (
                <span className="muted">
                  {pet.level >= UNLOCK_LEVEL.train ? '还什么都不会' : `Lv.${UNLOCK_LEVEL.train} 可以训练它`}
                </span>
              ) : (
                pet.skills.map((id) => (
                  <span key={id} className="skill">
                    {skillOf(id).label}
                  </span>
                ))
              )}
              {pet.whistle.length > 0 ? (
                <span className="skill whistle-chip">口哨 {pet.whistle.map(noteLabel).join('')}</span>
              ) : null}
            </div>
          </div>

          <MemoryBook pet={pet} />
        </aside>
      </main>

      <footer className="actions">
        <div className="action-group">
          <span className="group-label">常用</span>
          <div className="action-row">
            <Gate k="bath" label="洗澡" onClick={() => perform({ type: 'bath' })} />
            <Gate k="cleanCage" label="打扫" onClick={() => perform({ type: 'cleanCage' })} />
            <button type="button" onClick={() => perform({ type: 'sleep', on: !pet.asleep })}>
              {pet.asleep ? '掀开布' : '盖布睡觉'}
            </button>
            <Gate
              k="free"
              label={pet.free ? '让它回笼' : '放它出来'}
              onClick={() => perform({ type: 'free', on: !pet.free })}
            />
            <Gate k="perform" label="看它表演" onClick={() => perform({ type: 'perform' })} />
            <button type="button" className="warn" onClick={() => perform({ type: 'scold' })}>
              凶它
            </button>
            <button type="button" onClick={() => perform({ type: 'sorry' })}>
              道歉
            </button>
            <button type="button" className="ghost" onClick={recall}>
              问它记不记得
            </button>
          </div>
        </div>

        <div className="action-group">
          <span className="group-label">互动</span>
          <div className="tabs">
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={tab === c.id ? 'tab on' : 'tab'}
                onClick={() => setTab(c.id)}
              >
                {c.label}
              </button>
            ))}
            <Gate k="whistle" label="教口哨" onClick={() => setShowWhistle((v) => !v)} />
          </div>
        </div>

        <div className="picker">
          {tabItems.map((item) => {
            const lv = item.lv ?? 1;
            const open = pet.level >= lv;
            return (
              <button
                key={item.id}
                type="button"
                disabled={!open}
                title={open ? '' : `Lv.${lv} 解锁`}
                onClick={() => perform({ type: 'do', id: item.id })}
              >
                {open ? item.label : `${item.label} · Lv.${lv}`}
              </button>
            );
          })}
        </div>

        {showWhistle ? (
          <div className="whistle">
            <div className="whistle-pad">
              {NOTE_PAD.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    playNote(i);
                    setNotes((prev) => (prev.length < 8 ? [...prev, i] : prev));
                  }}
                >
                  {NOTE_LABELS[i]}
                </button>
              ))}
            </div>
            <div className="whistle-actions">
              <span className="whistle-seq">
                {notes.length > 0 ? notes.map(noteLabel).join(' · ') : '吹一段给它听'}
              </span>
              <button type="button" onClick={() => setNotes([])}>
                重来
              </button>
              <button
                type="button"
                disabled={notes.length === 0}
                onClick={() => {
                  playSequence(notes);
                  perform({ type: 'whistle', notes });
                  setShowWhistle(false);
                  setNotes([]);
                }}
              >
                教它这段
              </button>
            </div>
          </div>
        ) : null}
      </footer>

      {debug ? <DebugPanel onFastForward={fastForward} onReset={reset} onGainXp={gainXpBy} /> : null}
    </div>
  );
}
