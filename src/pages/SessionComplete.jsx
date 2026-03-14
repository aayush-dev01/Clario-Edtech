import { Link, useParams } from 'react-router-dom';
import { GlassPanel, PageHero, PageShell, StatusBadge } from '../components/AppShell';

export default function SessionComplete() {
  const { sessionId } = useParams();

  return (
    <PageShell className="flex items-center">
      <div className="mx-auto w-full max-w-2xl">
        <PageHero
          eyebrow="Session complete"
          title="The session has ended"
          description="Close the loop with feedback or head back to your dashboard to keep momentum going."
          aside={<StatusBadge tone="teal">complete</StatusBadge>}
        />

        <GlassPanel className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-teal/20 bg-teal/12 text-4xl text-teal">
            ✓
          </div>
          <p className="mt-6 text-lg text-white/70">Thanks for learning with Clario.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/session/rate/${sessionId}`}
              className="flex-1 rounded-[1.1rem] bg-teal px-5 py-3 font-semibold text-navy transition hover:bg-teal/90"
            >
              Rate this session
            </Link>
            <Link
              to="/"
              className="flex-1 rounded-[1.1rem] border border-white/14 bg-white/6 px-5 py-3 font-medium text-white/86 transition hover:bg-white/10"
            >
              Back to dashboard
            </Link>
          </div>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
