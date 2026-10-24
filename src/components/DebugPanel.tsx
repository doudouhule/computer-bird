interface Props {
  onFastForward: (hours: number) => void;
  onReset: () => void;
  onGainXp: (amount: number) => void;
}

export function DebugPanel({ onFastForward, onReset, onGainXp }: Props) {
  return (
    <div className="debug">
      <span className="debug-label">时间机器</span>
      {[
        { label: '+1 小时', hours: 1 },
        { label: '+8 小时', hours: 8 },
        { label: '+1 天', hours: 24 },
        { label: '+3 天', hours: 72 },
      ].map((b) => (
        <button key={b.label} type="button" onClick={() => onFastForward(b.hours)}>
          {b.label}
        </button>
      ))}
      <button type="button" onClick={() => onGainXp(50)}>
        +50 经验
      </button>
      <button type="button" className="danger" onClick={onReset}>
        重新开始
      </button>
    </div>
  );
}
