import { useParams, Link } from 'react-router-dom';

export default function SessionComplete() {
  const { sessionId } = useParams();

  return (
    <div className="min-h-screen px-6 py-8 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-white mb-2">Session Complete</h1>
          <p className="text-white/70 mb-6">Thanks for learning with Clario!</p>
          <Link
            to={`/session/rate/${sessionId}`}
            className="block w-full py-3 rounded-xl bg-teal text-navy font-semibold hover:bg-teal/90 transition-colors mb-3"
          >
            Rate this session
          </Link>
          <Link
            to="/"
            className="block w-full py-3 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
