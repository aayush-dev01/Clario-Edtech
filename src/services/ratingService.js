import { getRatings, setRatings, generateId } from './localStore';

export async function addRating(sessionId, raterId, tutorId, rating, review = '') {
  const ratings = getRatings();
  const id = generateId();
  ratings[id] = {
    sessionId,
    raterId,
    tutorId,
    rating,
    review,
    createdAt: new Date().toISOString(),
  };
  setRatings(ratings);
}

export async function getRatingsForTutor(tutorId) {
  const ratings = getRatings();
  const list = Object.values(ratings).filter((r) => r.tutorId === tutorId);
  if (list.length === 0) return { average: 0, count: 0, ratings: [] };
  const sum = list.reduce((a, r) => a + r.rating, 0);
  return {
    average: Math.round((sum / list.length) * 10) / 10,
    count: list.length,
    ratings: list,
  };
}
