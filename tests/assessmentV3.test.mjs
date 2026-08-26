import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  ASSESSMENT_PROFILES,
  ASSESSMENT_ROUTE_LABELS,
  diagnose,
  findDestination,
  getAssessmentProfile,
  getDomainList,
  getIntents,
  getQuestions,
} from '../lib/config/onboarding.js';

const domains = ['body', 'brain', 'relationships', 'skills'];
const intents = ['assess', 'manage', 'optimize'];

test('revised assessment keeps four domains, three routes, and five questions per route', () => {
  assert.deepEqual(ASSESSMENT_ROUTE_LABELS, {
    assess: 'Take Stock',
    manage: 'Strengthening the Foundation',
    optimize: 'Build What’s Next',
  });
  assert.equal(ASSESSMENT_PROFILES.length, 3);

  for (const domainId of domains) {
    for (const intentId of intents) {
      assert.equal(getQuestions(domainId, intentId).length, 5, `${domainId}/${intentId}`);
    }
  }
});

test('every question has one final opt-out and every routed answer resolves to a realm', () => {
  for (const domainId of domains) {
    for (const intentId of intents) {
      for (const question of getQuestions(domainId, intentId)) {
        assert.ok(question.options.length === 5 || question.options.length === 6);
        const optOuts = question.options.filter((answer) => answer.optOut);
        assert.equal(optOuts.length, 1);
        assert.equal(question.options.at(-1).optOut, true);
        assert.equal(question.options.at(-1).target, null);

        for (const answer of question.options) {
          if (answer.target) {
            assert.ok(findDestination(domainId, answer.target), `${domainId}: ${answer.target}`);
          }
        }
      }
    }
  }
});

test('school-student profile applies student domain and minor-safe relationship wording', () => {
  const profile = getAssessmentProfile('school-student');
  assert.equal(profile.ageBand, '15-17');
  assert.equal(profile.context, 'student');

  const skills = getDomainList(profile).find((domain) => domain.id === 'skills');
  assert.equal(skills.name, 'Competency, Skills & Study');

  const relationshipText = getQuestions('relationships', 'optimize', profile)
    .flatMap((question) => [question.prompt, ...question.options.map((answer) => answer.text)])
    .join(' ');
  assert.doesNotMatch(relationshipText, /physical closeness|partner|intimacy|date\b/i);
  assert.match(relationshipText, /emotionally closer and more understood/i);
});

test('brain foundation check-in suggests support after three flagged answers', () => {
  const profile = getAssessmentProfile('university-student');
  const threeSignals = [
    { questionIndex: 0, optionIndex: 0 },
    { questionIndex: 1, optionIndex: 0 },
    { questionIndex: 2, optionIndex: 0 },
    { questionIndex: 3, optionIndex: 4 },
    { questionIndex: 4, optionIndex: 3 },
  ];
  const result = diagnose('brain', 'manage', threeSignals, profile);
  assert.equal(result.supportSignalCount, 3);
  assert.equal(result.supportSuggested, true);

  const twoSignals = threeSignals.map((answer, index) =>
    index === 2 ? { questionIndex: 2, optionIndex: 4 } : answer
  );
  const lowerResult = diagnose('brain', 'manage', twoSignals, profile);
  assert.equal(lowerResult.supportSignalCount, 2);
  assert.equal(lowerResult.supportSuggested, false);
});

test('neutral and tied answers request a participant choice instead of a silent fallback', () => {
  const neutral = diagnose('brain', 'optimize', [
    { questionIndex: 2, optionIndex: 4 },
    { questionIndex: 3, optionIndex: 4 },
    { questionIndex: 0, optionIndex: 4 },
    { questionIndex: 1, optionIndex: 4 },
    { questionIndex: 4, optionIndex: 4 },
  ]);
  assert.equal(neutral.destinationId, null);
  assert.equal(neutral.needsChoice, true);

  const tie = diagnose('body', 'optimize', [
    { questionIndex: 0, optionIndex: 0 },
    { questionIndex: 0, optionIndex: 1 },
    { questionIndex: 0, optionIndex: 4 },
    { questionIndex: 1, optionIndex: 4 },
    { questionIndex: 2, optionIndex: 4 },
  ]);
  assert.equal(tie.score, 1);
  assert.equal(tie.runnerUpScore, 1);
  assert.equal(tie.needsChoice, true);
});

test('participant-facing assessment copy remains non-clinical', () => {
  const questionText = domains.flatMap((domainId) =>
    intents.flatMap((intentId) =>
      getQuestions(domainId, intentId).flatMap((question) => [
        question.prompt,
        ...question.options.map((answer) => answer.text),
      ])
    )
  ).join(' ');
  const routeText = domains.flatMap((domainId) =>
    getIntents(domainId).flatMap((intent) => [intent.name, intent.desc])
  ).join(' ');
  const text = `${routeText} ${questionText}`;

  assert.doesNotMatch(text, /diagnos|patient|disorder|treatment|risk score|validated instrument|GAD-7|PHQ|PSQI|MBI/i);
  assert.doesNotMatch(routeText, /anxiety|low mood|rumination/i);
  assert.doesNotMatch(text, /nicotine|alcohol|substance/i);
});

test('app contains context selection and no first-manage-realm fallback', () => {
  const page = fs.readFileSync(new URL('../app/page.js', import.meta.url), 'utf8');
  assert.match(page, /participant-context/);
  assert.match(page, /starting-point-pick/);
  assert.match(page, /SupportSignpost/);
  assert.doesNotMatch(page, /getDestinations\(selectedDomain, ['"]manage['"]\)\[0\]/);
  assert.doesNotMatch(page, /In Singapore: SOS/);
});
