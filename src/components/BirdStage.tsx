import { useMemo } from 'react';
import { birdSvg, type Pose } from '../pet/bird';
import type { SpeciesId } from '../pet/species';

interface Props {
  pose: Pose;
  species?: SpeciesId;
  motion?: string;
  onTouch: () => void;
}

export function BirdStage({ pose, species, motion, onTouch }: Props) {
  const html = useMemo(() => birdSvg({ pose, species, motion, id: 'main' }), [pose, species, motion]);

  return (
    <div
      className={`bird-stage${pose === 'away' ? ' is-away' : ''}`}
      onPointerDown={() => {
        if (pose !== 'away') onTouch();
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
