import {
  Building2,
  Terminal,
  Zap,
  Cog,
  FlaskConical,
  Briefcase,
  BookOpen,
  Microscope,

  Scale,
  Users,
  Monitor,
  Sigma,
} from 'lucide-react';

const schools = [
  { name: 'School of Civil Engineering', Icon: Building2 },
  { name: 'School of Computing', Icon: Terminal },
  { name: 'School of Electrical & Electronics Engineering', Icon: Zap },
  { name: 'School of Mechanical Engineering', Icon: Cog },
  { name: 'School of Chemical & Biotechnology', Icon: FlaskConical },
  { name: 'School of Management', Icon: Briefcase },
  { name: 'School of Arts, Science and Humanities', Icon: BookOpen },
  { name: 'CeNTAB', Icon: Microscope },

  { name: 'School of Law', Icon: Scale },
  { name: 'Corporate Relations / Training & Placement', Icon: Users },
  { name: 'Distance Education', Icon: Monitor },
  { name: 'Srinivasa Ramanujan Centre', Icon: Sigma },
];

const SchoolsGrid = ({ onSelectSchool }) => {
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--color-bg-page)',
      padding: '0px 20px 30px 20px',
    }}>
      <div style={{
        marginBottom: '36px',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '20px',
      }}>
        <h2 style={{
          color: 'var(--color-text-primary)',
          fontWeight: '800',
          fontSize: '1.75rem',
          letterSpacing: '-0.03em',
        }}>
          Staff Directory
        </h2>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: '0.82rem',
          marginTop: '6px',
          fontWeight: '400',
          letterSpacing: '0.01em',
        }}>
          Select a school to browse faculty profiles.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '24px',
      }}>
        {schools.map(({ name, Icon }) => (
          <button
            key={name}
            className="school-card"
            onClick={() => onSelectSchool(name)}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span className="school-card-label">{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SchoolsGrid;
