import { Check, Map as MapIcon, Star } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { BadgeCard } from '../components/BadgeCard';
import { Mascot } from '../components/Mascot';
import { StatCard } from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { ALL_EMOTIONS, BADGES, EMOTIONS } from '../data/mockData';
import { ISLANDS } from '../data/levels';

/** Pantalla 8 · Mis logros (/logros). Sin rankings ni comparaciones. */
export default function Achievements() {
  const { progress } = useApp();
  const { stars, unlockedBadges, knownEmotions } = progress.progress;

  return (
    <PageShell>
      <header className="page-head">
        <Mascot pose="celebrando" size={92} ring={4} edgeColor="#d8b878" />
        <div>
          <h1 className="page-title">Mis logros</h1>
          <p className="page-subtitle">
            Tus logros son solo tuyos: sin rankings, sin puntos que se pierden y sin comparaciones.
          </p>
        </div>
      </header>

      <ul className="stat-grid">
        <StatCard
          icon={<Star size={24} fill="#fff" color="#fff" />}
          value={stars}
          label="estrellas ganadas"
          color="#f6b829"
          edge="#c98b10"
        />
        <StatCard
          icon={<Check size={26} strokeWidth={3.2} />}
          value={unlockedBadges.length}
          label={unlockedBadges.length === 1 ? 'insignia descubierta' : 'insignias descubiertas'}
          color="#3aa872"
          edge="#23774f"
        />
        <StatCard
          icon={<MapIcon size={24} fill="#fff" color="#fff" />}
          value={`${progress.islandsExplored} de ${ISLANDS.length}`}
          label="islas exploradas"
          color="#4a5fd6"
          edge="#2f3aa0"
        />
      </ul>

      <h2 className="section-title">Insignias</h2>
      <ul className="badge-grid">
        {BADGES.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} unlocked={unlockedBadges.includes(badge.id)} />
        ))}
      </ul>

      <h2 className="section-title">Caritas que ya conoces</h2>
      <ul className="known-emotions">
        {ALL_EMOTIONS.map((id) => {
          const emotion = EMOTIONS[id];
          const known = knownEmotions.includes(id) && Boolean(emotion.image);
          return (
            <li key={id} className={`known-emotion ${known ? '' : 'known-emotion--soon'}`}>
              <span className="known-emotion__face" aria-hidden="true">
                {known && emotion.image ? <img src={emotion.image} alt="" /> : '?'}
              </span>
              <span>
                <strong>{emotion.name}</strong>
                <span className="known-emotion__state">{known ? 'Descubierta' : 'Próximamente'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
