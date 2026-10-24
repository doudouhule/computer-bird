import type { PetState } from '../pet/model';

const LABEL: Record<string, string> = {
  birth: '见面',
  feed: '吃饭',
  drink: '喝水',
  bath: '洗澡',
  cleanCage: '打扫',
  pet: '摸头',
  play: '玩',
  toy: '玩具',
  scold: '刺痛',
  sorry: '道歉',
  neglect: '缺席',
  leave: '出走',
  back: '回来',
  sick: '生病',
  event: '那天',
};

function fmt(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MemoryBook({ pet }: { pet: PetState }) {
  const items = [...pet.memories].sort((a, b) => b.at - a.at);

  return (
    <section className="notebook">
      <header className="notebook-head">
        <h2>它写的东西</h2>
        <span className="notebook-count">{items.length} 条</span>
      </header>
      <p className="notebook-hint">你不在的时候，它也在写。</p>
      <ol className="memory-list">
        {items.map((m) => (
          <li key={m.id} className={`memory memory-${m.kind}${m.weight >= 3 ? ' is-deep' : ''}`}>
            <div className="memory-meta">
              <span className="memory-tag">{LABEL[m.kind] ?? m.kind}</span>
              <time>{fmt(m.at)}</time>
            </div>
            <p className="memory-text">{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
