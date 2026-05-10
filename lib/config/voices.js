// lib/config/voices.js
//
// Six voice options, archetype-independent. Decoupling voice from mentor
// gives the user three picks (mentor → voice → tone) instead of two,
// and lets them mix-and-match (e.g. The Stoic in a warmer voice).
//
// The voiceId values reuse the four ElevenLabs voices already paid for via
// lib/constants.js ARCHETYPES. Two pairs share an underlying voiceId for v1.
// New ElevenLabs voices can be swapped in here without touching React code.

export const VOICES = [
  {
    id: 'steady-bass',
    name: 'Steady Bass',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // stoic / craftsman
    description: 'Low. Slow. A teacher who has been at this for years.',
    gender: 'male',
    pace: 'slow',
  },
  {
    id: 'warm-father',
    name: 'Warm Father',
    voiceId: 'TxGEqnHWrfWFTfGW9XjX', // explorer
    description: 'Middle-pitched, warm. An older brother who shows up.',
    gender: 'male',
    pace: 'medium',
  },
  {
    id: 'sharp-direct',
    name: 'Sharp Direct',
    voiceId: 'pNInz6obpgDQGcFmaJgB', // craftsman (shares with stoic for v1)
    description: 'Clear, articulate. A coach who stops the fluff.',
    gender: 'male',
    pace: 'medium',
  },
  {
    id: 'calm-mentor',
    name: 'Calm Mentor',
    voiceId: '21m00Tcm4TlvDq8ikWAM', // alchemist
    description: 'Measured. Spacious. A therapist who waits with you.',
    gender: 'female',
    pace: 'slow',
  },
  {
    id: 'bright-companion',
    name: 'Bright Companion',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // healer
    description: 'Warmer. Lighter. A friend who actually listens.',
    gender: 'female',
    pace: 'medium',
  },
  {
    id: 'sage',
    name: 'Sage',
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // monk (shares with healer for v1)
    description: 'Older. Slower. The grandmother who sees through you kindly.',
    gender: 'female',
    pace: 'slow',
  },
];

// Suggested voice per archetype — used to pre-select a recommendation.
// User can override.
export const ARCHETYPE_VOICE_SUGGESTION = {
  stoic:     'steady-bass',
  alchemist: 'calm-mentor',
  explorer:  'warm-father',
  healer:    'bright-companion',
  monk:      'sage',
  craftsman: 'sharp-direct',
};

export function getVoice(id) {
  return VOICES.find(v => v.id === id);
}

export function getRecommendedVoice(archetypeId) {
  return getVoice(ARCHETYPE_VOICE_SUGGESTION[archetypeId] || 'steady-bass');
}
