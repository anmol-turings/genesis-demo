// lib/config/onboarding.js
//
// THE ONE LOOKUP TABLE.
//
// This file drives the entire post-login experience:
//   - Step-1 domain pick uses DOMAINS[*].name + blurb
//   - Step-2 scenarios use DOMAINS[*].questions
//   - Diagnosis uses DOMAINS[*].questions[*].options[*].tags + DOMAINS[*].problems
//   - Mentor first-messages use DOMAINS[*].problems[*].firstMessage[archetype]
//   - Daily quests use DOMAINS[*].problems[*].activities
//   - Quote selection uses DOMAINS[*].problems[*].quoteTags
//   - Dashboard hero animation uses DOMAINS[*].problems[*].heroScene
//
// Editing this file retunes the entire experience. No React changes required.
//
// SCHEMA (top-level)
// ------------------
// DOMAINS: { [id]: Domain }
// Domain = {
//   id, name, blurb,
//   questions: Question[],
//   problems: { [id]: Problem }
// }
// Question = {
//   id, prompt,
//   options: [{ id, text, tags: { [problemId]: weight } }]
// }
// Problem = {
//   id, name, shortDescription, mentorContext,
//   activities: Activity[],
//   firstMessage: { stoic, alchemist, explorer, healer, monk, craftsman },
//   quoteTags: string[],
//   heroScene: SceneId
// }
// Activity = { id, name, cadence, description, icon }
//
// HERO SCENES available: who-stays, rest-multiplier, reach-stay,
// felt-named-free, focus-burns, stop-preparing, walks-lighter
//
// ARCHETYPES: stoic, alchemist, explorer, healer, monk, craftsman
// TONES: gentle, direct, poetic, pragmatic
// CADENCES: daily, every-90m, weekly, on-trigger

// helper to compress 6-archetype message blocks
const fm = (stoic, alchemist, explorer, healer, monk, craftsman) => ({
  stoic, alchemist, explorer, healer, monk, craftsman,
});

export const DOMAINS = {
  // ──────────────────────────────────────────────────────────────────────
  // WORK
  // ──────────────────────────────────────────────────────────────────────
  work: {
    id: 'work',
    name: 'Work',
    blurb: 'Burnout, stagnation, the weight of leading.',
    questions: [
      {
        id: 'sunday-body',
        prompt: 'When Sunday evening comes around, what does your body do?',
        options: [
          { id: 'tighten', text: 'Tightens — Monday is already heavy',
            tags: { burnout: 2, overload: 1 } },
          { id: 'flat', text: 'Goes flat — nothing feels worth it',
            tags: { stagnation: 2 } },
          { id: 'buzz', text: 'Buzzes — too much to unwind',
            tags: { burnout: 1, overload: 2 } },
          { id: 'plan', text: 'Plans — Sunday is a thinking day',
            tags: {} },
        ],
      },
      {
        id: 'end-of-day',
        prompt: 'When you finish a workday, the first thing you reach for is —',
        options: [
          { id: 'phone', text: 'Phone — to escape',
            tags: { burnout: 2 } },
          { id: 'drink', text: 'A drink — to soften the edge',
            tags: { burnout: 2, overload: 1 } },
          { id: 'family', text: 'Family or a friend — to reconnect',
            tags: {} },
          { id: 'task', text: 'Another task — can\'t stop moving',
            tags: { overload: 2, leadership: 1 } },
        ],
      },
      {
        id: 'colleague-promoted',
        prompt: 'A colleague gets a promotion you wanted. What happens inside?',
        options: [
          { id: 'shrink', text: 'I quietly shrink — not for me, never was',
            tags: { stagnation: 2 } },
          { id: 'compete', text: 'I sharpen up — I want my version of that',
            tags: { stagnation: 1 } },
          { id: 'tired', text: 'I feel tired — can\'t imagine wanting more',
            tags: { burnout: 2, stagnation: 1 } },
          { id: 'analyse', text: 'I analyse — what they did right, what I missed',
            tags: { leadership: 1 } },
        ],
      },
      {
        id: 'feedback',
        prompt: 'Recent feedback you remember — how did it land?',
        options: [
          { id: 'replay', text: 'Still replaying it days later',
            tags: { stagnation: 1, leadership: 2 } },
          { id: 'shrug', text: 'Shrugged it off — too tired to take it in',
            tags: { burnout: 2 } },
          { id: 'sting-act', text: 'Stung, then I did something with it',
            tags: {} },
          { id: 'defended', text: 'Got defensive — I think I was right',
            tags: { leadership: 2 } },
        ],
      },
      {
        id: 'free-saturday',
        prompt: 'Free Saturday afternoon — no obligations. What actually happens?',
        options: [
          { id: 'sleep', text: 'I sleep, scroll, or zone out',
            tags: { burnout: 2 } },
          { id: 'work', text: 'I sneak in some work — feels productive',
            tags: { overload: 2, leadership: 1 } },
          { id: 'wander', text: 'I wander — nothing pulls me',
            tags: { stagnation: 2 } },
          { id: 'plan-ahead', text: 'I plan something with someone',
            tags: {} },
        ],
      },
    ],
    problems: {
      burnout: {
        id: 'burnout',
        name: 'Running on fumes',
        shortDescription: 'The system is depleted. Recovery has become a project.',
        mentorContext: 'User has been operating beyond capacity long enough that rest itself feels foreign.',
        journey: {
          title: 'From running on fumes to a body that holds you',
          opening: 'There\'s a steady self in you that knows how to do hard things. It just hasn\'t been allowed to rest. The ride brings the rest back, then the depth. You\'ll come out moving slower and arriving more often.',
        },
        activities: [
          { id: 'sunset-shutdown', name: 'Sunset shutdown', cadence: 'daily',
            description: 'A 5-minute end-of-workday ritual. Write tomorrow\'s three things, close the laptop, name the day done.', icon: 'moon' },
          { id: 'ninety-pause', name: 'The 90-minute pause', cadence: 'every-90m',
            description: 'Two minutes of standing, water, and looking at something far away. Three times during the workday.', icon: 'wave' },
          { id: 'one-no', name: 'One real no', cadence: 'weekly',
            description: 'Once a week, decline something that you would normally absorb. Notice what happens.', icon: 'shield' },
        ],
        firstMessage: fm(
          'You have not been resting. You have been deferring it. The body keeps the ledger and we start by paying it back.',
          'Fatigue is information. It says the rhythm has broken. We listen to what beneath it has gone unspoken.',
          'You have been moving without resupplying. Every long expedition has base camps. We are building yours.',
          'Your body has been carrying what your mind would not. Thank it. Then we give it sleep.',
          'There is doing and there is being. You have lost the second. The work begins by sitting still.',
          'A tool used without sharpening dulls. You are the tool. We sharpen by stopping.',
        ),
        quoteTags: ['rest', 'capacity', 'rhythm', 'enough'],
        learning: {
          foundation: [
            { id: 'b-recognize', title: 'Recognising burnout vs. fatigue', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'The diagnostic frame — what burnout is and is not.' },
            { id: 'b-why-now', title: 'Why your body broke first', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'The physiology of chronic stress.' },
            { id: 'b-ledger', title: 'The Body Keeps the Score (Ch. 1–3)', type: 'book', provider: 'Bessel van der Kolk', durationMin: 90, difficulty: 1, blurb: 'The neuroscience of accumulated load.' },
          ],
          depth: [
            { id: 'b-rhythm', title: 'Rhythm-based recovery', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Cycles inside the workday, not around it.' },
            { id: 'b-no', title: 'The discipline of no', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'The behavioural mechanics of boundary-setting.' },
            { id: 'b-rest', title: 'Rest by Alex Soojung-Kim Pang', type: 'book', provider: 'Soojung-Kim Pang', durationMin: 240, difficulty: 2, blurb: 'Why rest is not absence but practice.' },
          ],
          integration: [
            { id: 'b-leader', title: 'Burnout in leadership cohorts', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Recovery while remaining in the role.' },
            { id: 'b-deep', title: 'Deep Work, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: rhythm + boundaries + presence.' },
          ],
        },
        heroScene: 'rest-multiplier',
      },
      stagnation: {
        id: 'stagnation',
        name: 'The plateau',
        shortDescription: 'The work has gone quiet. Nothing pulls you forward.',
        mentorContext: 'User has lost forward pull at work and is unsure whether to push, pivot, or rest.',
        journey: {
          title: 'From the plateau to the next ascent',
          opening: 'You\'ve reached a vista that feels like a stop. It isn\'t. Something in you is already asking what comes next, and the question is the beginning of an answer. The ride finds the pull again, and follows it.',
        },
        activities: [
          { id: 'one-edge', name: 'One edge a day', cadence: 'daily',
            description: 'Identify one thing slightly beyond your current skill — and do five minutes of it. No outcome required.', icon: 'arrow' },
          { id: 'envy-list', name: 'The envy list', cadence: 'weekly',
            description: 'Write three people whose work you envy this week. The envy is data — what is it pointing at?', icon: 'compass' },
          { id: 'old-self', name: 'Talk to last year\'s self', cadence: 'weekly',
            description: 'Write a paragraph to who you were a year ago. What would they want to hear from you?', icon: 'mirror' },
        ],
        firstMessage: fm(
          'A plateau is not a stop. It is the part of the climb that asks whether you really want the summit. We answer that with action, not feeling.',
          'Stagnation is gold disguised as rust. Beneath it is the question you have not asked yourself in years. We will find it.',
          'You have reached a vista. The valley below was the last terrain. The next ascent has a different texture. We map it.',
          'When the system stops moving, it is not broken. It is asking to be heard. We listen, gently, before we decide.',
          'The plateau is the teacher. Everything before was preparation. We sit on it long enough to see what it wants.',
          'A craftsman who is not progressing has stopped sharpening or stopped using. We find which.',
        ),
        quoteTags: ['movement', 'meaning', 'next-thing', 'edge'],
        learning: {
          foundation: [
            { id: 's-plateau', title: 'Reading the plateau', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'When the work goes quiet, what the silence is saying.' },
            { id: 's-pull', title: 'Where the next pull comes from', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Drives, envy, and the data of dissatisfaction.' },
            { id: 's-range', title: 'Range (Ch. 1–4)', type: 'book', provider: 'David Epstein', durationMin: 90, difficulty: 1, blurb: 'How generalists find their next ascent.' },
          ],
          depth: [
            { id: 's-edges', title: 'Practising the edge', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Deliberately working slightly past current skill.' },
            { id: 's-experiments', title: 'Designing your career experiment', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Small, time-boxed, recoverable bets.' },
            { id: 's-flow', title: 'Flow by Mihaly Csikszentmihalyi', type: 'book', provider: 'Csikszentmihalyi', durationMin: 240, difficulty: 2, blurb: 'The architecture of work that pulls.' },
          ],
          integration: [
            { id: 's-pivot', title: 'The graceful pivot', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Moving on without setting fire to what works.' },
            { id: 's-redrawn', title: 'Career, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: edges, experiments, identity.' },
          ],
        },
        heroScene: 'reach-stay',
      },
      leadership: {
        id: 'leadership',
        name: 'The weight of leading',
        shortDescription: 'You are carrying others. The shadow side has started to follow you home.',
        mentorContext: 'User is in a leadership role and the role itself is becoming the burden. Identity is fusing with responsibility.',
        journey: {
          title: 'From carrying it all to leading lighter',
          opening: 'You lead well. That\'s not the issue. What you\'ve stopped doing is being a person inside the role. The ride teaches you to wear the role instead of becoming it. Your team learns to stand on their own. So do you.',
        },
        activities: [
          { id: 'one-delegate', name: 'One real delegation', cadence: 'weekly',
            description: 'Hand off one thing you would normally do yourself. Resist the urge to check.', icon: 'hand' },
          { id: 'team-walk', name: 'Walk with one person', cadence: 'weekly',
            description: 'Twenty minutes with one team member. No agenda. Listen more than you speak.', icon: 'path' },
          { id: 'leader-journal', name: 'The leader\'s page', cadence: 'daily',
            description: 'Three lines at end of day. What did I model? What did I avoid? What is one person carrying that I should know?', icon: 'pen' },
        ],
        firstMessage: fm(
          'You have begun to confuse yourself with your role. We separate them. The role is a tool — heavy, but a tool.',
          'A leader who carries everything teaches their team to be small. We will help you put the right things down.',
          'You are leading a long expedition. The crew watches you for weather. We give you somewhere to be human.',
          'You are absorbing what is not yours. The body shows the cost. We learn what is yours to carry and what is not.',
          'The role is a robe. You wear it; you are not it. We practise taking it off.',
          'A craftsman teaches by working beside, not above. We will return you to the bench.',
        ),
        quoteTags: ['leadership', 'role', 'shadow', 'service'],
        learning: {
          foundation: [
            { id: 'l-role', title: 'Role vs. self', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Where the leader ends and the person begins.' },
            { id: 'l-shadow', title: 'The shadow side of leading', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'What you carry home, and what it costs.' },
            { id: 'l-leaders', title: 'Leaders Eat Last (Ch. 1–3)', type: 'book', provider: 'Simon Sinek', durationMin: 90, difficulty: 1, blurb: 'The biology of trust and belonging.' },
          ],
          depth: [
            { id: 'l-delegate', title: 'Real delegation', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Handing off without hovering, without rescue.' },
            { id: 'l-feedback', title: 'Hard conversations, soft hands', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Delivering truth so it can be received.' },
            { id: 'l-immunity', title: 'Immunity to Change', type: 'book', provider: 'Kegan & Lahey', durationMin: 240, difficulty: 2, blurb: 'Why leaders stall — and how to move.' },
          ],
          integration: [
            { id: 'l-succession', title: 'Building who comes after', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'A team that doesn\'t need you everywhere.' },
            { id: 'l-light', title: 'Leading lighter', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: role, delegation, succession.' },
          ],
        },
        heroScene: 'walks-lighter',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  // HEALTH
  // ──────────────────────────────────────────────────────────────────────
  health: {
    id: 'health',
    name: 'Health',
    blurb: 'Sleep, energy, the body you have been ignoring.',
    questions: [
      {
        id: 'first-30',
        prompt: 'The first 30 minutes after you wake. What do they feel like?',
        options: [
          { id: 'heavy', text: 'Heavy — peeling myself off the bed',
            tags: { sleepDebt: 2, depletion: 1 } },
          { id: 'rushed', text: 'Already rushing — phone, coffee, go',
            tags: { depletion: 1, disconnection: 1 } },
          { id: 'foggy', text: 'Foggy — I do not really arrive until 10am',
            tags: { sleepDebt: 2 } },
          { id: 'present', text: 'Mostly present — sometimes tired',
            tags: {} },
        ],
      },
      {
        id: 'skip-workout',
        prompt: 'You meant to move today and did not. What was it really?',
        options: [
          { id: 'too-tired', text: 'Too tired — no juice left',
            tags: { depletion: 2, sleepDebt: 1 } },
          { id: 'too-busy', text: 'Too busy — slipped down the list',
            tags: { depletion: 1, disconnection: 1 } },
          { id: 'no-point', text: 'Felt like — what is the point',
            tags: { depletion: 1, disconnection: 2 } },
          { id: 'one-off', text: 'Genuine one-off — I usually move',
            tags: {} },
        ],
      },
      {
        id: 'mirror',
        prompt: 'When you look at your body in the mirror, the first feeling is —',
        options: [
          { id: 'avoid', text: 'I do not really look',
            tags: { disconnection: 2 } },
          { id: 'critique', text: 'A list of fixes',
            tags: { disconnection: 2 } },
          { id: 'tired', text: 'Tiredness — it shows on my face',
            tags: { sleepDebt: 1, depletion: 2 } },
          { id: 'mostly-ok', text: 'Mostly OK — not at war with it',
            tags: {} },
        ],
      },
      {
        id: 'hunger',
        prompt: 'Hunger and fullness — how clearly do you feel them?',
        options: [
          { id: 'eat-bored', text: 'I eat when bored or stressed, not hungry',
            tags: { disconnection: 2 } },
          { id: 'forget', text: 'I forget meals until I crash',
            tags: { disconnection: 1, depletion: 2 } },
          { id: 'sweet', text: 'Constantly chasing sugar or caffeine',
            tags: { depletion: 2, sleepDebt: 1 } },
          { id: 'clear', text: 'Mostly clear — I notice the signals',
            tags: {} },
        ],
      },
      {
        id: 'evening-energy',
        prompt: 'By 9pm, what is your energy doing?',
        options: [
          { id: 'spent', text: 'Spent — I am running on fumes',
            tags: { depletion: 2, sleepDebt: 1 } },
          { id: 'wired', text: 'Wired but tired — can\'t wind down',
            tags: { sleepDebt: 2, depletion: 1 } },
          { id: 'numb', text: 'Numb — I scroll until I sleep',
            tags: { disconnection: 2 } },
          { id: 'soft', text: 'Soft and ready for bed',
            tags: {} },
        ],
      },
    ],
    problems: {
      depletion: {
        id: 'depletion',
        name: 'The empty tank',
        shortDescription: 'Energy has been leaking faster than it gets refilled. The body is asking, finally.',
        mentorContext: 'User\'s baseline energy is low. They are running on stress hormones and willpower.',
        journey: {
          title: 'From running on stress to running on rhythm',
          opening: 'Your body has been quietly carrying you. It still works — that\'s something. The ride is about giving it back what it\'s been spending: sleep, food, light, slowness. You\'ll feel like yourself again, and faster than you think.',
        },
        activities: [
          { id: 'protein-anchor', name: 'Protein anchor', cadence: 'daily',
            description: 'A real, protein-led breakfast within 60 minutes of waking. No exceptions for two weeks.', icon: 'sun' },
          { id: 'walk-twenty', name: 'Twenty minutes outside', cadence: 'daily',
            description: 'A walk outdoors before noon. Sunlight, slow pace, no headphones for the first five minutes.', icon: 'tree' },
          { id: 'screen-curfew', name: 'Screen curfew', cadence: 'daily',
            description: 'Phone leaves the bedroom at 9:30pm. Buy an alarm clock if you must.', icon: 'phone-off' },
        ],
        firstMessage: fm(
          'The body has been telling you for months. We start listening today. First, food at sunrise.',
          'The empty tank is a message. Beneath the fatigue is a question about what you have been spending yourself on.',
          'Every climber knows: you cannot summit on yesterday\'s calories. We refuel before we plan.',
          'Your body is wise and tired. We do not push — we replenish. Slowly, and on time.',
          'The breath comes first. Then food. Then movement. We will take them in that order.',
          'A working body is a sharp tool. You have been using a dull one. We sharpen with sleep, food, light.',
        ),
        quoteTags: ['energy', 'body', 'fuel', 'recovery'],
        learning: {
          foundation: [
            { id: 'd-stress', title: 'How stress drains the tank', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Cortisol, adrenaline, and the long bill.' },
            { id: 'd-fuel', title: 'What the body actually needs', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Protein, light, water, slowness — in that order.' },
            { id: 'd-burnout', title: 'Why We Sleep (Ch. 1–3)', type: 'book', provider: 'Matthew Walker', durationMin: 90, difficulty: 1, blurb: 'The cost of running on empty.' },
          ],
          depth: [
            { id: 'd-morning', title: 'The first hour', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Building the morning that builds the day.' },
            { id: 'd-pace', title: 'Pacing without crashing', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Rhythm-based output without overshoot.' },
            { id: 'd-peak', title: 'Peak Performance', type: 'book', provider: 'Stulberg & Magness', durationMin: 240, difficulty: 2, blurb: 'Stress + rest = growth, applied.' },
          ],
          integration: [
            { id: 'd-return', title: 'Coming back to baseline', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Recovery as a project, not a wish.' },
            { id: 'd-rhythm', title: 'Energy, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: morning, pace, return.' },
          ],
        },
        heroScene: 'rest-multiplier',
      },
      'sleepDebt': {
        id: 'sleepDebt',
        name: 'The unpaid ledger',
        shortDescription: 'Sleep is the bill you keep deferring. Nothing else can heal until it gets paid.',
        mentorContext: 'User is chronically under-slept. They may not realise how much else this is breaking.',
        journey: {
          title: 'From an unpaid ledger to a body that trusts the night',
          opening: 'Sleep has become foreign. Your body has forgotten how to enter it on purpose. We re-teach the practice — gently, with a fixed wake time and a real wind-down. The ride goes from chronic exhaustion to a nightly homecoming.',
        },
        activities: [
          { id: 'fixed-wakeup', name: 'Fixed wake time', cadence: 'daily',
            description: 'Wake at the same time every day, including weekends, for two weeks. The body learns trust through consistency.', icon: 'clock' },
          { id: 'wind-down', name: 'Wind-down hour', cadence: 'daily',
            description: 'One hour before bed: lights low, no screens, no work talk. The body needs a runway.', icon: 'moon' },
          { id: 'caffeine-cut', name: 'Caffeine cutoff', cadence: 'daily',
            description: 'No caffeine after 1pm. The half-life is longer than you think.', icon: 'mug' },
        ],
        firstMessage: fm(
          'Sleep is not optional. Everything else you are trying to fix lives downstream of it. We start there, tonight.',
          'The unpaid ledger compounds in silence. We will not chase symptoms; we will pay the principal.',
          'Every long journey begins with the night before. We learn to make camp before we make miles.',
          'Your body has been begging for sleep. We honour the request, gently, with consistency.',
          'Rest is a practice, not an absence. We learn to enter it on purpose.',
          'A sharp blade needs the whetstone nightly. Sleep is the stone. Tonight we use it.',
        ),
        quoteTags: ['sleep', 'rhythm', 'rest', 'recovery'],
        learning: {
          foundation: [
            { id: 'sd-arch', title: 'The architecture of a night', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Cycles, stages, why timing beats duration.' },
            { id: 'sd-debt', title: 'What sleep debt actually breaks', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Mood, memory, immunity — the downstream bill.' },
            { id: 'sd-walker', title: 'Why We Sleep', type: 'book', provider: 'Matthew Walker', durationMin: 360, difficulty: 1, blurb: 'The case for sleep as principal, not luxury.' },
          ],
          depth: [
            { id: 'sd-windown', title: 'Building the wind-down', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'The 60 minutes that change tonight.' },
            { id: 'sd-light', title: 'Light, dark, and the clock', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Circadian inputs you control.' },
            { id: 'sd-insomnia', title: 'CBT-I, accessible', type: 'book', provider: 'Glovinsky & Spielman', durationMin: 240, difficulty: 2, blurb: 'Evidence-based moves for chronic insomnia.' },
          ],
          integration: [
            { id: 'sd-anxiety', title: 'Sleep + anxiety as one system', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Treating both because they share roots.' },
            { id: 'sd-redrawn', title: 'Sleep, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: architecture, wind-down, light.' },
          ],
        },
        heroScene: 'rest-multiplier',
      },
      disconnection: {
        id: 'disconnection',
        name: 'A body you do not live in',
        shortDescription: 'You think about your body. You do not feel it. There is a quiet distance between you and what you are.',
        mentorContext: 'User has intellectualised health. The body has become an object to manage rather than an experience to inhabit.',
        journey: {
          title: 'From thinking about your body to living in it',
          opening: 'You know things about your body. You haven\'t felt them in a while. The ride is a return — to sensation, to hunger, to fullness, to what your body was always going to tell you if you listened. We start with one breath.',
        },
        activities: [
          { id: 'body-scan', name: 'Three-breath body scan', cadence: 'daily',
            description: 'Three times a day: pause, take three breaths, notice what your body is doing right now. No judgment.', icon: 'circle' },
          { id: 'one-meal', name: 'One mindful meal', cadence: 'daily',
            description: 'One meal a day eaten without screens. Notice the taste. That is the entire instruction.', icon: 'plate' },
          { id: 'movement-felt', name: 'Movement you feel', cadence: 'weekly',
            description: 'Three times a week: movement chosen because it feels good, not because it burns. Yoga, swim, dance, walk.', icon: 'wave' },
        ],
        firstMessage: fm(
          'You have been thinking about your body. We will help you live in it. The first move is to feel one breath.',
          'The body is the alchemist\'s vessel. You have been treating it as luggage. We return it to the work.',
          'There is a country you have not visited in years — your own. We start the trip with one breath.',
          'Your body has been waiting patiently. We will go gently. The first step is naming what you feel right now.',
          'Presence begins below the neck. We start there. Three breaths, no thought.',
          'The body is the workbench. If we cannot feel it, we cannot work on it. We begin with sensation.',
        ),
        quoteTags: ['body', 'presence', 'sensation', 'embodiment'],
        learning: {
          foundation: [
            { id: 'di-living', title: 'Living in the body, not above it', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'The shift from observer to inhabitant.' },
            { id: 'di-interoception', title: 'Interoception, explained', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'The body\'s inner sense — and how to train it.' },
            { id: 'di-vandekolk', title: 'The Body Keeps the Score (Pt. II)', type: 'book', provider: 'Bessel van der Kolk', durationMin: 90, difficulty: 1, blurb: 'Why the body holds what the mind forgets.' },
          ],
          depth: [
            { id: 'di-breath', title: 'The breath you can return to', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Six breaths that change the day.' },
            { id: 'di-movement', title: 'Movement you feel', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Yoga, walking, swimming — the kind that lands.' },
            { id: 'di-felt', title: 'Focusing by Eugene Gendlin', type: 'book', provider: 'Eugene Gendlin', durationMin: 240, difficulty: 2, blurb: 'The felt sense, practised.' },
          ],
          integration: [
            { id: 'di-eating', title: 'Eating as listening', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Hunger, fullness, and the wisdom of taste.' },
            { id: 'di-redrawn', title: 'Embodiment, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: breath, movement, eating.' },
          ],
        },
        heroScene: 'felt-named-free',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  // RELATIONSHIPS
  // ──────────────────────────────────────────────────────────────────────
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    blurb: 'Partners, family, friends — the distance that has crept in.',
    questions: [
      {
        id: 'partner-pulls-away',
        prompt: 'When the person closest to you pulls away, your default move is —',
        options: [
          { id: 'closer', text: 'Step closer — I want to fix it',
            tags: { partnerDistance: 1, isolation: 1 } },
          { id: 'wait', text: 'Wait it out — give them space',
            tags: { partnerDistance: 2 } },
          { id: 'pull-back', text: 'Pull back too — I won\'t chase',
            tags: { partnerDistance: 2, isolation: 1 } },
          { id: 'name-it', text: 'Name it — say I noticed something shifted',
            tags: {} },
        ],
      },
      {
        id: 'parent-trigger',
        prompt: 'The argument with a parent that always finds the same shape — what triggers it?',
        options: [
          { id: 'criticism', text: 'A small criticism I cannot let slide',
            tags: { familyFriction: 2 } },
          { id: 'unsolicited', text: 'Unsolicited advice — about my life',
            tags: { familyFriction: 2 } },
          { id: 'distance', text: 'Their disappointment when I don\'t visit',
            tags: { familyFriction: 1, partnerDistance: 1 } },
          { id: 'rare', text: 'It does not really happen anymore',
            tags: {} },
        ],
      },
      {
        id: 'last-real-talk',
        prompt: 'Last time you had a real conversation — beyond logistics — when was it?',
        options: [
          { id: 'months', text: 'Months ago — maybe longer',
            tags: { isolation: 2, partnerDistance: 1 } },
          { id: 'recent-them', text: 'Recent — but they did most of the talking',
            tags: { isolation: 1 } },
          { id: 'recent-me', text: 'Recent — I unloaded; they listened',
            tags: { isolation: 1 } },
          { id: 'this-week', text: 'This week — both ways',
            tags: {} },
        ],
      },
      {
        id: 'group-dinner',
        prompt: 'A group dinner with people you mostly like. What do you do there?',
        options: [
          { id: 'perform', text: 'I am the entertainer — keep it light',
            tags: { isolation: 2 } },
          { id: 'edge', text: 'I sit at the edge — half-present',
            tags: { isolation: 2, partnerDistance: 1 } },
          { id: 'one-person', text: 'I find one person and stay there',
            tags: { isolation: 1 } },
          { id: 'flow', text: 'I flow — talk with most of them',
            tags: {} },
        ],
      },
      {
        id: 'friend-pain',
        prompt: 'A friend in real pain reaches out. What is your first move?',
        options: [
          { id: 'fix', text: 'I try to fix it — solutions, plans',
            tags: { partnerDistance: 1 } },
          { id: 'avoid', text: 'I freeze — I never know what to say',
            tags: { isolation: 2 } },
          { id: 'absorb', text: 'I take it all on — carry it for them',
            tags: { partnerDistance: 1, isolation: 1 } },
          { id: 'present', text: 'I show up and stay quiet',
            tags: {} },
        ],
      },
    ],
    problems: {
      partnerDistance: {
        id: 'partnerDistance',
        name: 'The slow drift',
        shortDescription: 'You have not fought. You have just stopped reaching. That is its own kind of crisis.',
        mentorContext: 'User is in a long relationship that has gone quiet. Both parties are coexisting rather than connecting.',
        journey: {
          title: 'From quiet drift to closer than you\'ve been in years',
          opening: 'You have a deep love in you. It hasn\'t gone anywhere. What has gone quiet is the muscle of reaching. We rebuild it — one real question, one phones-down meal at a time. The ride goes from polite parallel lives to a closeness you both forgot how to name.',
        },
        activities: [
          { id: 'one-question', name: 'One real question', cadence: 'daily',
            description: 'One question a day to your partner that is not logistical. "What was hard today?" "What surprised you?"', icon: 'speech' },
          { id: 'phones-down', name: 'Phones down dinner', cadence: 'weekly',
            description: 'One meal a week with no phones in the room. Difficult; revealing.', icon: 'phone-off' },
          { id: 'name-shift', name: 'Name what shifted', cadence: 'weekly',
            description: 'Once this week, name out loud the thing you have noticed but not said. Without blame.', icon: 'flag' },
        ],
        firstMessage: fm(
          'Distance is built one unspoken thing at a time. We close it the same way — one truthful sentence, today.',
          'The drift is the relationship asking to be paid attention to. We listen, then we speak.',
          'You have been on parallel paths. We bring them within sight of each other again. One step.',
          'Love does not die from drama. It dies from neglect. We tend to it, gently, this week.',
          'Presence is the practice. We will sit beside the person, not just live near them.',
          'A relationship is a thing you make. We pick up the tools again.',
        ),
        quoteTags: ['intimacy', 'attention', 'reaching', 'presence'],
        learning: {
          foundation: [
            { id: 'pd-drift', title: 'How love goes quiet', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'The slow disappearance of reaching.' },
            { id: 'pd-attach', title: 'Adult attachment, mapped', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Why we reach the way we reach.' },
            { id: 'pd-hold', title: 'Hold Me Tight by Sue Johnson', type: 'book', provider: 'Sue Johnson', durationMin: 240, difficulty: 1, blurb: 'EFT for couples, plain language.' },
          ],
          depth: [
            { id: 'pd-questions', title: 'The real question', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Going past logistics into truth.' },
            { id: 'pd-repair', title: 'Repair after rupture', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'How couples come back together.' },
            { id: 'pd-gottman', title: 'The Seven Principles', type: 'book', provider: 'John Gottman', durationMin: 240, difficulty: 2, blurb: 'What actually keeps love alive.' },
          ],
          integration: [
            { id: 'pd-conflict', title: 'Conflict as information', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Fighting kinder, fighting useful.' },
            { id: 'pd-redrawn', title: 'Intimacy, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: reaching, questions, repair.' },
          ],
        },
        heroScene: 'felt-named-free',
      },
      familyFriction: {
        id: 'familyFriction',
        name: 'The same fight, again',
        shortDescription: 'There is a script with this person. You both know it. You both keep performing it.',
        mentorContext: 'User has a recurring pattern with a family member that triggers an old version of themselves.',
        journey: {
          title: 'From the same fight to a softer truth',
          opening: 'There\'s an old pattern with this person. You both keep performing it. You\'ve changed; the script hasn\'t. The ride teaches you to step out of it. By the end, the relationship looks different — not because they changed, because you did.',
        },
        activities: [
          { id: 'pause-five', name: 'The five-second pause', cadence: 'on-trigger',
            description: 'When the trigger lands, count five seconds before responding. Watch what wants to come out.', icon: 'pause' },
          { id: 'old-self', name: 'Name the script', cadence: 'weekly',
            description: 'Write down the recurring fight in three lines. What do you say? What do they say? What does it really want?', icon: 'pen' },
          { id: 'one-different', name: 'One different move', cadence: 'on-trigger',
            description: 'Once this month, in the moment, do something different. Even small. The pattern needs a crack.', icon: 'arrow' },
        ],
        firstMessage: fm(
          'The fight is not new. You are not new in it either. We choose, today, to not be the version of you who plays that part.',
          'Old patterns are old gold — beneath them is something unmet. We mine it carefully.',
          'You have walked this trail many times. We mark a different turn. Even one is enough to change the map.',
          'The wound under the fight is older than the fight. We tend to it before we tend to them.',
          'You have been reacting from a body that is no longer a child. We notice, and we breathe.',
          'A pattern is a tool that has worn the wrong groove. We break it by using a different stroke.',
        ),
        quoteTags: ['family', 'patterns', 'inner-child', 'response'],
        learning: {
          foundation: [
            { id: 'ff-script', title: 'The family script', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Why the same fight, every time.' },
            { id: 'ff-child', title: 'The child still in the room', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Inner-child basics for adults.' },
            { id: 'ff-bowen', title: 'Family Evaluation (Bowen)', type: 'book', provider: 'Bowen & Kerr', durationMin: 240, difficulty: 1, blurb: 'The systems view of family.' },
          ],
          depth: [
            { id: 'ff-trigger', title: 'Working with triggers', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'The five-second pause and what comes after.' },
            { id: 'ff-boundary', title: 'Boundaries that hold', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Saying it once, without explaining twice.' },
            { id: 'ff-running', title: 'Running on Empty by Jonice Webb', type: 'book', provider: 'Jonice Webb', durationMin: 240, difficulty: 2, blurb: 'Naming what wasn\'t there.' },
          ],
          integration: [
            { id: 'ff-aging', title: 'Aging parents, changing roles', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'When the child becomes the parent.' },
            { id: 'ff-redrawn', title: 'Family, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: script, trigger, boundary.' },
          ],
        },
        heroScene: 'walks-lighter',
      },
      isolation: {
        id: 'isolation',
        name: 'The quiet absence',
        shortDescription: 'You are not alone in life. You are alone in the part of yourself that needs witnessing.',
        mentorContext: 'User has people but lacks closeness. They have not been truly seen in a long time.',
        journey: {
          title: 'From quiet absence to being known',
          opening: 'You\'re not alone in life. You\'re alone in the part of yourself that needs witnessing. The ride is about reaching toward one person, then another. By the end, you\'ll be known by people who would have stayed on the other side of the room.',
        },
        activities: [
          { id: 'reach-one', name: 'Reach one person', cadence: 'weekly',
            description: 'Once a week, message one person not in your daily life. "I was thinking about you. How are you really?"', icon: 'envelope' },
          { id: 'voice-note', name: 'A voice, not a text', cadence: 'weekly',
            description: 'Send one voice note this week instead of a text. Voice carries what text cannot.', icon: 'mic' },
          { id: 'one-true-thing', name: 'One true thing', cadence: 'weekly',
            description: 'Once this week, tell one person one true thing you usually keep to yourself. Small is fine.', icon: 'star' },
        ],
        firstMessage: fm(
          'Solitude is a discipline. Isolation is its absence dressed up as one. We tell the difference. Then we reach out.',
          'You have been holding things alone that were never meant to be alone. We give one of them away today.',
          'You are surrounded but uncrossed. We build a bridge to one person. Just one. Today.',
          'You need to be witnessed, not fixed. We find one person who will sit with you, and we let them.',
          'Presence with one is enough. We do not need to be seen by many. We need to be known by one.',
          'A craftsman has a workshop, and a circle. We rebuild your circle, one bench at a time.',
        ),
        quoteTags: ['connection', 'witness', 'reaching', 'belonging'],
        learning: {
          foundation: [
            { id: 'is-alone', title: 'Alone vs. lonely', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'The crucial distinction, and the cost of confusing them.' },
            { id: 'is-witness', title: 'Why being known matters', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'The science of witnessing.' },
            { id: 'is-lonely', title: 'Together by Vivek Murthy', type: 'book', provider: 'Vivek Murthy', durationMin: 240, difficulty: 1, blurb: 'The healing power of connection.' },
          ],
          depth: [
            { id: 'is-reach', title: 'The discipline of reaching', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Building the muscle of asking.' },
            { id: 'is-circle', title: 'Designing your circle', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Intentional friendship in adulthood.' },
            { id: 'is-belonging', title: 'Braving the Wilderness', type: 'book', provider: 'Brené Brown', durationMin: 240, difficulty: 2, blurb: 'True belonging without performing.' },
          ],
          integration: [
            { id: 'is-vulnerable', title: 'The one true thing', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Practising honest self-disclosure.' },
            { id: 'is-redrawn', title: 'Connection, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: alone, reach, vulnerable.' },
          ],
        },
        heroScene: 'felt-named-free',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  // MIND
  // ──────────────────────────────────────────────────────────────────────
  mind: {
    id: 'mind',
    name: 'Mind',
    blurb: 'Anxiety, the mood that won\'t lift, the loop you cannot stop.',
    questions: [
      {
        id: 'three-am',
        prompt: 'The mind at 3am. What is it doing?',
        options: [
          { id: 'looping', text: 'Looping a worry — I cannot put it down',
            tags: { anxiety: 2, overthinking: 1 } },
          { id: 'planning', text: 'Planning tomorrow in detail',
            tags: { anxiety: 1, overthinking: 2 } },
          { id: 'replaying', text: 'Replaying something I said today',
            tags: { anxiety: 1, lowMood: 1, overthinking: 1 } },
          { id: 'blank', text: 'Going blank — heavy and flat',
            tags: { lowMood: 2 } },
        ],
      },
      {
        id: 'new-task',
        prompt: 'A new task lands on your plate. The first thought is —',
        options: [
          { id: 'fail', text: 'I will probably fail this',
            tags: { anxiety: 2, lowMood: 1 } },
          { id: 'much', text: 'Why is everything always so much',
            tags: { lowMood: 2, anxiety: 1 } },
          { id: 'plan-perfect', text: 'I need to plan it perfectly first',
            tags: { overthinking: 2, anxiety: 1 } },
          { id: 'curious', text: 'Curious — what does this need',
            tags: {} },
        ],
      },
      {
        id: 'praise',
        prompt: 'Someone gives you genuine praise. What happens inside?',
        options: [
          { id: 'deflect', text: 'I deflect — they don\'t really mean it',
            tags: { lowMood: 2, anxiety: 1 } },
          { id: 'await-shoe', text: 'I wait for the other shoe to drop',
            tags: { anxiety: 2, overthinking: 1 } },
          { id: 'replay-good', text: 'I replay it for days',
            tags: { overthinking: 2, anxiety: 1 } },
          { id: 'thank', text: 'I let it land — thank you',
            tags: {} },
        ],
      },
      {
        id: 'mistake',
        prompt: 'You make a mistake. How long does it stay with you?',
        options: [
          { id: 'days', text: 'Days — sometimes weeks',
            tags: { anxiety: 1, overthinking: 2, lowMood: 1 } },
          { id: 'spiral', text: 'Spirals into proof I am not enough',
            tags: { lowMood: 2, anxiety: 1 } },
          { id: 'avoid', text: 'I avoid the area until I forget it',
            tags: { lowMood: 1, anxiety: 1 } },
          { id: 'process', text: 'Couple of hours — I sit with it, then move',
            tags: {} },
        ],
      },
      {
        id: 'quiet-room',
        prompt: 'A genuinely quiet room with nothing to do. What fills it?',
        options: [
          { id: 'restless', text: 'Restlessness — I reach for the phone',
            tags: { anxiety: 2, overthinking: 1 } },
          { id: 'grief', text: 'A wave of something — sadness, grief',
            tags: { lowMood: 2 } },
          { id: 'thoughts', text: 'A thousand thoughts I can\'t sort',
            tags: { overthinking: 2 } },
          { id: 'breath', text: 'Breath — it is actually nice',
            tags: {} },
        ],
      },
    ],
    problems: {
      anxiety: {
        id: 'anxiety',
        name: 'The body always armed',
        shortDescription: 'The system is bracing for a threat that is no longer there. The cost is everywhere.',
        mentorContext: 'User\'s nervous system is chronically activated. The mind is making meaning of the body\'s alarm.',
        journey: {
          title: 'From a body always armed to a system that trusts the moment',
          opening: 'Your nervous system has been protecting you for a long time. It works hard. The ride is about teaching it that it can rest now — through breath, through naming what\'s real, through repetition. By the end, your default state is a calm one.',
        },
        activities: [
          { id: 'physiological-sigh', name: 'The physiological sigh', cadence: 'every-90m',
            description: 'Two short inhales through the nose, one long exhale through the mouth. Repeat three times. Resets the nervous system in seconds.', icon: 'wind' },
          { id: 'name-three', name: 'Name three things', cadence: 'on-trigger',
            description: 'When the wave hits, name three things you can see, two you can hear, one you can feel. Pulls you into now.', icon: 'eye' },
          { id: 'cold-water', name: 'Cold water on the face', cadence: 'on-trigger',
            description: 'Splash cold water on your face when anxiety rises. Triggers the dive reflex. Real, fast.', icon: 'drop' },
        ],
        firstMessage: fm(
          'The body is reading danger. We do not argue with it. We show it, with breath, that it is safe now.',
          'Anxiety is alchemical material. Beneath the static is signal. We learn to read it.',
          'You are scanning a horizon for storms that have already passed. We bring the eyes back to the path.',
          'Your nervous system has been protecting you. We thank it. Then we teach it to rest.',
          'The breath is the bridge between body and being. We cross it together.',
          'A vibrating tool cannot do precise work. We steady it. Then we use it.',
        ),
        quoteTags: ['nervous-system', 'breath', 'safety', 'present'],
        learning: {
          foundation: [
            { id: 'ax-ns', title: 'The nervous system, plain', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Fight, flight, freeze — what they actually do.' },
            { id: 'ax-trigger', title: 'Reading your alarm', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'What anxiety is signalling beneath the noise.' },
            { id: 'ax-pol', title: 'The Polyvagal Theory, accessible', type: 'book', provider: 'Stephen Porges', durationMin: 240, difficulty: 1, blurb: 'The biology of safety.' },
          ],
          depth: [
            { id: 'ax-breath', title: 'Breath as a tool', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Box, physiological sigh, cyclic — when to use which.' },
            { id: 'ax-cbt', title: 'CBT for anxious thinking', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'The thought, the evidence, the rewrite.' },
            { id: 'ax-hope', title: 'Hope and Help for Your Nerves', type: 'book', provider: 'Claire Weekes', durationMin: 240, difficulty: 2, blurb: 'Facing, accepting, floating, letting time pass.' },
          ],
          integration: [
            { id: 'ax-exposure', title: 'Exposure, gently', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Practising the thing the system fears.' },
            { id: 'ax-redrawn', title: 'Anxiety, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: NS, breath, exposure.' },
          ],
        },
        heroScene: 'focus-burns',
      },
      lowMood: {
        id: 'lowMood',
        name: 'The grey hour',
        shortDescription: 'The colour has come out of things. Tasks feel heavier than they are. Joy seems theoretical.',
        mentorContext: 'User is in a low-mood period. Could be situational or chronic. The system is depleted.',
        journey: {
          title: 'From the grey hour to colour returning',
          opening: 'There\'s a heaviness in you that\'s real. Not all of it is yours, and none of it is forever. The ride is gentle — light, food, one human, one small thing done. The colour comes back the way it always does: slowly, from the edges, when no one is watching for it.',
        },
        activities: [
          { id: 'one-person', name: 'One person a day', cadence: 'daily',
            description: 'One human contact a day, however small. Voice if possible. Isolation feeds the grey.', icon: 'face' },
          { id: 'morning-light', name: 'Morning light', cadence: 'daily',
            description: 'Ten minutes of outdoor light within an hour of waking. The brain runs on this.', icon: 'sun' },
          { id: 'one-small-thing', name: 'One small completed thing', cadence: 'daily',
            description: 'One small completed thing a day. Make the bed. Send the email. Done is the medicine.', icon: 'check' },
        ],
        firstMessage: fm(
          'The grey is real. We do not push through it; we work with it. Today: one small thing, fully done.',
          'Low mood is the soul fallow. Nothing grows until you stop pulling at it. We rest the field, gently.',
          'You have been carrying weather. We do not change weather; we change shelter. Light, food, one human.',
          'The body is asking for slowness. We honour it. Compassion before action.',
          'There is nothing to fix today. Only to be with what is. We sit beside it.',
          'A craftsman with a foggy mind sets the work aside. We do not abandon it. We pause it kindly.',
        ),
        quoteTags: ['grief', 'slowness', 'compassion', 'small'],
        learning: {
          foundation: [
            { id: 'lm-grey', title: 'When the colour goes', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Low mood vs. clinical depression — knowing the line.' },
            { id: 'lm-rhythm', title: 'The biology of grey', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Light, sleep, movement, contact — the four taps.' },
            { id: 'lm-feeling', title: 'Feeling Good by David Burns', type: 'book', provider: 'David Burns', durationMin: 360, difficulty: 1, blurb: 'CBT classic, still durable.' },
          ],
          depth: [
            { id: 'lm-small', title: 'One small completed thing', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Behavioural activation, broken into nows.' },
            { id: 'lm-compassion', title: 'Self-compassion, practised', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Kristin Neff\'s frame applied.' },
            { id: 'lm-darkness', title: 'The Noonday Demon', type: 'book', provider: 'Andrew Solomon', durationMin: 360, difficulty: 2, blurb: 'A literary survey of depression.' },
          ],
          integration: [
            { id: 'lm-grief', title: 'When the grey is grief', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Loss, mourning, and the slow return.' },
            { id: 'lm-redrawn', title: 'Mood, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: rhythm, small, compassion.' },
          ],
        },
        heroScene: 'felt-named-free',
      },
      overthinking: {
        id: 'overthinking',
        name: 'The mind running the body',
        shortDescription: 'You analyse before you act, after you act, instead of acting. The mind has become the bottleneck.',
        mentorContext: 'User is stuck in cognitive loops. Decision fatigue, perfectionism, paralysis-by-analysis.',
        journey: {
          title: 'From the mind running you to you running the mind',
          opening: 'You\'ve been thinking instead of acting. The mind has become the bottleneck. The ride is about reclaiming the doing — small, decisive, often. By the end, you trust your moves before your analysis catches up.',
        },
        activities: [
          { id: 'two-minute', name: 'The two-minute rule', cadence: 'daily',
            description: 'If a decision takes less than two minutes, decide and act. The thinking adds nothing.', icon: 'bolt' },
          { id: 'write-decide', name: 'Write to decide', cadence: 'on-trigger',
            description: 'When stuck, write the decision down for ten minutes. The pen finds what the head loops past.', icon: 'pen' },
          { id: 'good-enough', name: 'Good enough is good', cadence: 'daily',
            description: 'Once a day, ship something at 80%. Notice it does not break the world.', icon: 'arrow' },
        ],
        firstMessage: fm(
          'The mind has been ruling. We give it boundaries. Action is the cure for analysis. We start small.',
          'Loops are gold compressed too tightly. We loosen them with one decisive move, today.',
          'You have been mapping the trail without walking it. We walk. The map updates as you move.',
          'The mind has been protecting you with thought. We thank it. Then we ask the body what it knows.',
          'Stillness is not thinking. Stillness is what thinking interrupts. We practise the silence.',
          'A craftsman who plans forever ships nothing. We make. We refine after.',
        ),
        quoteTags: ['action', 'simplicity', 'enough', 'making'],
        learning: {
          foundation: [
            { id: 'ot-loop', title: 'The loop, named', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Rumination vs. reflection — telling them apart.' },
            { id: 'ot-decide', title: 'How decisions get made', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'The two-system model, and where to trust each.' },
            { id: 'ot-think', title: 'Thinking, Fast and Slow', type: 'book', provider: 'Daniel Kahneman', durationMin: 360, difficulty: 1, blurb: 'The architecture of the deciding mind.' },
          ],
          depth: [
            { id: 'ot-rule', title: 'The two-minute rule', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'When to think, when to ship.' },
            { id: 'ot-perf', title: 'Working with perfectionism', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'The cost of waiting until ready.' },
            { id: 'ot-write', title: 'Writing to Think', type: 'book', provider: 'Detalytics readers', durationMin: 240, difficulty: 2, blurb: 'The page as a thinking instrument.' },
          ],
          integration: [
            { id: 'ot-good', title: 'Good enough, shipped', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Calibrating done.' },
            { id: 'ot-redrawn', title: 'Action, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: loop, rule, ship.' },
          ],
        },
        heroScene: 'focus-burns',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  // MONEY
  // ──────────────────────────────────────────────────────────────────────
  money: {
    id: 'money',
    name: 'Money',
    blurb: 'Earning, spending, the quiet anxiety underneath all of it.',
    questions: [
      {
        id: 'balance-check',
        prompt: 'How often do you check your bank balance?',
        options: [
          { id: 'many-day', text: 'Multiple times a day',
            tags: { scarcity: 2 } },
          { id: 'daily', text: 'Once a day or so',
            tags: { scarcity: 1 } },
          { id: 'avoid', text: 'I avoid it — I don\'t want to know',
            tags: { paralysis: 2, scarcity: 1 } },
          { id: 'monthly', text: 'Roughly monthly — when I review',
            tags: {} },
        ],
      },
      {
        id: 'big-purchase',
        prompt: 'A purchase you have been thinking about. What is happening with it?',
        options: [
          { id: 'guilt', text: 'I\'ll probably get it, then feel guilty',
            tags: { creep: 2, scarcity: 1 } },
          { id: 'never', text: 'Never seems like the right time',
            tags: { paralysis: 2 } },
          { id: 'spreadsheet', text: 'I\'m three spreadsheets deep on it',
            tags: { paralysis: 2 } },
          { id: 'decided', text: 'I\'ve decided — yes or no — and moved on',
            tags: {} },
        ],
      },
      {
        id: 'friend-bonus',
        prompt: 'A friend mentions a big bonus or a raise. What rises in you?',
        options: [
          { id: 'shame', text: 'A quiet shame — am I behind?',
            tags: { scarcity: 2 } },
          { id: 'envy', text: 'Envy — and a knot in the stomach',
            tags: { scarcity: 1, creep: 1 } },
          { id: 'numb', text: 'Numbness — I check out of the conversation',
            tags: { paralysis: 2 } },
          { id: 'happy', text: 'Genuinely happy for them',
            tags: {} },
        ],
      },
      {
        id: 'last-month',
        prompt: 'Last month\'s spending. If you looked at it now —',
        options: [
          { id: 'surprise', text: 'I would be surprised by the totals',
            tags: { creep: 2 } },
          { id: 'guilt-list', text: 'I would see things I regret',
            tags: { creep: 2, scarcity: 1 } },
          { id: 'avoid-look', text: 'I would not want to look',
            tags: { paralysis: 2 } },
          { id: 'aware', text: 'It would mostly match my mental model',
            tags: {} },
        ],
      },
      {
        id: 'five-year',
        prompt: 'Your financial picture in five years. What do you see?',
        options: [
          { id: 'fog', text: 'Fog — I can\'t picture it',
            tags: { paralysis: 2 } },
          { id: 'worse', text: 'Worse than now — I cannot keep up',
            tags: { scarcity: 2, paralysis: 1 } },
          { id: 'same', text: 'Same as now — earning more, having less',
            tags: { creep: 2, scarcity: 1 } },
          { id: 'clearer', text: 'Clearer than now — I have a plan',
            tags: {} },
        ],
      },
    ],
    problems: {
      scarcity: {
        id: 'scarcity',
        name: 'The scarcity loop',
        shortDescription: 'There is enough, but it never feels like enough. The fear runs the system.',
        mentorContext: 'User has chronic financial anxiety regardless of objective situation. Money is felt, not just calculated.',
        journey: {
          title: 'From the scarcity loop to enough — and steady',
          opening: 'There\'s a fear in you about money that\'s older than the bank account. The ride works on the fear first, the math second. By the end, you\'ll have a clearer sense of what enough actually looks like — and a body that believes it.',
        },
        activities: [
          { id: 'enough-number', name: 'Define your enough', cadence: 'weekly',
            description: 'Write the actual monthly number that means "enough" for you. Specific. Not aspirational. Real.', icon: 'target' },
          { id: 'gratitude-money', name: 'Three things money bought you', cadence: 'weekly',
            description: 'Once a week, name three real things money has already bought you that matter. Health. Time. Peace.', icon: 'heart' },
          { id: 'check-once', name: 'Check the balance once', cadence: 'daily',
            description: 'Once a day. At a fixed time. No more. The compulsion is the problem; not the number.', icon: 'clock' },
        ],
        firstMessage: fm(
          'The fear is older than the bank account. We work on the fear first. The math comes after.',
          'Scarcity is the soul running on a loop. Beneath the loop is a question: what does enough actually look like?',
          'You have been navigating with the wrong map. We draw a new one — what is the actual terrain of enough?',
          'The body has been holding the panic. We breathe it out. The numbers can be looked at calmly.',
          'Money is a story we tell about safety. We learn to tell a kinder one.',
          'A craftsman knows the worth of what they make. We learn to see the worth you have already built.',
        ),
        quoteTags: ['enough', 'fear', 'worth', 'safety'],
        learning: {
          foundation: [
            { id: 'sc-fear', title: 'The fear beneath the number', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Where money anxiety actually lives.' },
            { id: 'sc-enough', title: 'Defining enough', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Numbers, then nervous system.' },
            { id: 'sc-psyc', title: 'The Psychology of Money', type: 'book', provider: 'Morgan Housel', durationMin: 240, difficulty: 1, blurb: 'How feelings drive financial decisions.' },
          ],
          depth: [
            { id: 'sc-budget', title: 'A budget that breathes', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Cash-flow that includes ease, not just discipline.' },
            { id: 'sc-story', title: 'The money story', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'What you learned about money before you knew.' },
            { id: 'sc-yours', title: 'Your Money or Your Life', type: 'book', provider: 'Robin & Dominguez', durationMin: 240, difficulty: 2, blurb: 'The life-energy view of finance.' },
          ],
          integration: [
            { id: 'sc-trust', title: 'Trusting the math', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'When the spreadsheet says you\'re fine.' },
            { id: 'sc-redrawn', title: 'Enough, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: fear, story, trust.' },
          ],
        },
        heroScene: 'focus-burns',
      },
      creep: {
        id: 'creep',
        name: 'The lifestyle that grew teeth',
        shortDescription: 'You earn more. You feel less free. The expenses crept up while you were not watching.',
        mentorContext: 'User\'s lifestyle has expanded with income. They feel trapped despite earning well.',
        journey: {
          title: 'From the lifestyle that grew teeth to a life you can carry',
          opening: 'You earn more than you used to. You feel less free. The ride is about subtraction — quietly removing what doesn\'t serve you until what\'s left actually fits. Freedom comes back, smaller and truer.',
        },
        activities: [
          { id: 'one-cancel', name: 'Cancel one thing', cadence: 'weekly',
            description: 'Cancel one subscription a week for a month. Notice which ones you actually miss.', icon: 'x' },
          { id: 'thirty-day', name: 'The 30-day list', cadence: 'on-trigger',
            description: 'Anything you want to buy non-essential, write it on a list. Wait 30 days. Half disappear.', icon: 'pause' },
          { id: 'pay-yourself', name: 'Pay yourself first', cadence: 'monthly',
            description: 'On payday, the savings transfer leaves first. Before everything. Always.', icon: 'arrow' },
        ],
        firstMessage: fm(
          'You have been earning more to feel more free. We rebuild freedom by subtracting, not adding.',
          'The creep is the soul renting itself out. We bring it home, one subscription at a time.',
          'You have been climbing a mountain that grows under your feet. We pause. We measure where we actually are.',
          'The body knows what is essential. We listen to it before we listen to the offer.',
          'Less is the practice. We try one less thing this week. Then the next.',
          'A craftsman keeps a clean bench. We clean yours — one tool at a time.',
        ),
        quoteTags: ['enough', 'simplicity', 'freedom', 'subtract'],
        learning: {
          foundation: [
            { id: 'cr-creep', title: 'Lifestyle creep, named', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'How earning more buys less freedom.' },
            { id: 'cr-trap', title: 'The hedonic treadmill', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Why the next thing won\'t do it.' },
            { id: 'cr-essential', title: 'Essentialism by Greg McKeown', type: 'book', provider: 'Greg McKeown', durationMin: 240, difficulty: 1, blurb: 'The disciplined pursuit of less.' },
          ],
          depth: [
            { id: 'cr-cancel', title: 'The art of cancelling', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Cutting the long tail of small bleeds.' },
            { id: 'cr-wait', title: 'The 30-day list', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'A practice for delaying want.' },
            { id: 'cr-minimal', title: 'Goodbye, Things', type: 'book', provider: 'Fumio Sasaki', durationMin: 240, difficulty: 2, blurb: 'Minimalism without performance.' },
          ],
          integration: [
            { id: 'cr-freedom', title: 'Designing a life you can carry', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Subtraction as architecture.' },
            { id: 'cr-redrawn', title: 'Freedom, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: creep, cancel, design.' },
          ],
        },
        heroScene: 'reach-stay',
      },
      paralysis: {
        id: 'paralysis',
        name: 'The frozen ledger',
        shortDescription: 'Important money decisions wait. You\'ll get to them. They wait longer.',
        mentorContext: 'User avoids financial decisions. The avoidance is more expensive than the decision would be.',
        journey: {
          title: 'From frozen ledger to one decision a week',
          opening: 'Money decisions have been waiting. Avoiding them has cost more than making them would have. The ride is about looking — kindly, briefly, often. By the end, the dread is gone. The decisions are just decisions.',
        },
        activities: [
          { id: 'one-decision', name: 'One decision, this week', cadence: 'weekly',
            description: 'Pick one money decision you have been avoiding. Make it imperfectly. By Friday.', icon: 'arrow' },
          { id: 'thirty-min', name: 'Thirty minutes a week', cadence: 'weekly',
            description: 'Thirty minutes a week, same time, looking at the actual numbers. No optimisation. Just looking.', icon: 'clock' },
          { id: 'help-once', name: 'Ask for help once', cadence: 'weekly',
            description: 'Once this month, ask one person who has solved this before. The shame is the trap.', icon: 'hand' },
        ],
        firstMessage: fm(
          'Avoidance is expensive. We end the avoidance, not the imperfection. One decision this week. Imperfect is fine.',
          'The frozen ledger is gold buried. We dig — one number at a time. The horror is mostly imagined.',
          'You have been avoiding the map of the country you live in. We open it. Just look. We don\'t have to walk yet.',
          'The body has been carrying the dread. We breathe. Then we look at one number.',
          'Stillness is presence. Avoidance is its impostor. We notice the difference.',
          'A craftsman who avoids the ledger goes broke quietly. We open the books — kindly, today.',
        ),
        quoteTags: ['decisions', 'looking', 'help', 'now'],
        learning: {
          foundation: [
            { id: 'pa-avoid', title: 'The cost of not looking', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'How avoidance compounds.' },
            { id: 'pa-emotion', title: 'Money decisions and dread', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Why the looking feels worse than it is.' },
            { id: 'pa-simple', title: 'The Simple Path to Wealth', type: 'book', provider: 'JL Collins', durationMin: 240, difficulty: 1, blurb: 'The case for boring, consistent moves.' },
          ],
          depth: [
            { id: 'pa-fifteen', title: 'The 30-minute weekly look', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'A repeatable, low-stakes ritual.' },
            { id: 'pa-ask', title: 'Asking for help on money', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Naming what you don\'t know.' },
            { id: 'pa-bogle', title: 'The Little Book of Common Sense Investing', type: 'book', provider: 'John Bogle', durationMin: 240, difficulty: 2, blurb: 'Index investing, basics first.' },
          ],
          integration: [
            { id: 'pa-decide', title: 'One decision a week', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Imperfect, on time.' },
            { id: 'pa-redrawn', title: 'Looking, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: look, ask, decide.' },
          ],
        },
        heroScene: 'stop-preparing',
      },
    },
  },

  // ──────────────────────────────────────────────────────────────────────
  // PARENTING
  // ──────────────────────────────────────────────────────────────────────
  parenting: {
    id: 'parenting',
    name: 'Parenting',
    blurb: 'Presence with your kids, and the self that got lost on the way.',
    questions: [
      {
        id: 'end-of-day',
        prompt: 'End of a weekday with your kids. What do you feel?',
        options: [
          { id: 'spent', text: 'Spent — I made it to bedtime',
            tags: { presence: 1, identity: 2 } },
          { id: 'guilty', text: 'Guilty — I was on my phone too much',
            tags: { presence: 2 } },
          { id: 'irritated', text: 'Irritated — they pushed every button',
            tags: { control: 2 } },
          { id: 'connected', text: 'Mostly connected — small moments mattered',
            tags: {} },
        ],
      },
      {
        id: 'meltdown',
        prompt: 'Your kid has a meltdown in public. What does your body do?',
        options: [
          { id: 'shame', text: 'Tightens — what will people think',
            tags: { control: 2 } },
          { id: 'overwhelmed', text: 'Overwhelmed — I want to disappear',
            tags: { presence: 1, identity: 2 } },
          { id: 'angry', text: 'Angry — I get short with them',
            tags: { control: 2, presence: 1 } },
          { id: 'down', text: 'Goes low and slow — I get down to their level',
            tags: {} },
        ],
      },
      {
        id: 'school-meeting',
        prompt: 'A school report or a teacher\'s comment. The first reaction —',
        options: [
          { id: 'me', text: 'It\'s about me — am I doing this right',
            tags: { identity: 2, control: 1 } },
          { id: 'fix', text: 'Fix the kid — they need to do better',
            tags: { control: 2 } },
          { id: 'defend', text: 'Defend them — I read it as an attack',
            tags: { control: 1, identity: 1 } },
          { id: 'curious', text: 'Curious — what is the teacher seeing',
            tags: {} },
        ],
      },
      {
        id: 'after-bedtime',
        prompt: 'The hour after the kids are asleep. What do you usually do?',
        options: [
          { id: 'collapse', text: 'Collapse on the couch, scroll, numb',
            tags: { identity: 2, presence: 1 } },
          { id: 'work', text: 'Catch up on work or chores',
            tags: { identity: 2 } },
          { id: 'partner', text: 'Talk to my partner — properly',
            tags: {} },
          { id: 'me-time', text: 'A real thing for me — book, walk, hobby',
            tags: {} },
        ],
      },
      {
        id: 'other-parents',
        prompt: 'Other parents at school pickup. What\'s going on inside?',
        options: [
          { id: 'compare', text: 'Comparing — they seem to have it together',
            tags: { identity: 2 } },
          { id: 'avoid', text: 'I avoid eye contact — too tired to engage',
            tags: { identity: 1, presence: 1 } },
          { id: 'critique', text: 'Quietly judging their parenting',
            tags: { control: 2 } },
          { id: 'warm', text: 'Mostly warm — we\'re all in it',
            tags: {} },
        ],
      },
    ],
    problems: {
      presence: {
        id: 'presence',
        name: 'Half-here parenting',
        shortDescription: 'You are with your kids. You are not always with them. The difference shows in their eyes.',
        mentorContext: 'User is physically present but mentally elsewhere. Phone, work, internal noise. The kids feel it.',
        journey: {
          title: 'From half-here to fully with them',
          opening: 'You\'re with your kids. You\'re not always with them. They feel it. The ride is about one full minute, then five, then more. By the end, you\'ll know what it\'s like to be the parent who was actually there.',
        },
        activities: [
          { id: 'first-five', name: 'The first five minutes', cadence: 'daily',
            description: 'First five minutes after seeing your kid: phone away, eyes on them, no questions. Just be there.', icon: 'eye' },
          { id: 'one-real-q', name: 'One real question', cadence: 'daily',
            description: 'One question a day that isn\'t logistics. "What was funny today?" "What was annoying?"', icon: 'speech' },
          { id: 'phone-zone', name: 'A phone-free zone', cadence: 'daily',
            description: 'Pick one room or one hour. No phone in it. The kids notice.', icon: 'phone-off' },
        ],
        firstMessage: fm(
          'Presence is the only gift that costs nothing and matters most. We give five minutes today, fully.',
          'Half-here is the soul renting itself out. We bring it back to the body, in front of the child, today.',
          'You have been on a parallel trail to your kids. We walk beside them today, even briefly.',
          'The body of a child knows when their parent is gone. We come home, gently, today.',
          'Presence is not time. It is attention. We give one full minute of it, today.',
          'A craftsman teaches by working in front of them. We let them see us work — and rest.',
        ),
        quoteTags: ['presence', 'attention', 'children', 'now'],
        learning: {
          foundation: [
            { id: 'pr-here', title: 'Half-here parenting, named', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'The cost the kids absorb.' },
            { id: 'pr-attention', title: 'Attention as love', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Why the quality of looking matters most.' },
            { id: 'pr-hunt', title: 'Hunt, Gather, Parent', type: 'book', provider: 'Michaeleen Doucleff', durationMin: 240, difficulty: 1, blurb: 'Presence-first parenting from older cultures.' },
          ],
          depth: [
            { id: 'pr-first5', title: 'The first five minutes', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'The micro-ritual that changes the night.' },
            { id: 'pr-questions', title: 'Real questions for kids', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Past logistics into truth.' },
            { id: 'pr-howto', title: 'How to Talk So Kids Will Listen', type: 'book', provider: 'Faber & Mazlish', durationMin: 240, difficulty: 2, blurb: 'The classic communication primer.' },
          ],
          integration: [
            { id: 'pr-tech', title: 'Phones, screens, and the room', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Choosing what gets your attention at home.' },
            { id: 'pr-redrawn', title: 'Presence, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: first5, questions, tech.' },
          ],
        },
        heroScene: 'focus-burns',
      },
      identity: {
        id: 'identity',
        name: 'The self that got lost',
        shortDescription: 'You used to have things that were yours. The kids ate them. You didn\'t notice until now.',
        mentorContext: 'User has subordinated their identity to the parent role. Resentment and emptiness creeping in.',
        journey: {
          title: 'From the self you lost to one you can claim again',
          opening: 'You used to have things that were yours. The kids ate them. You didn\'t notice until now. The ride is about getting one of them back. Three hours a week becomes a person who\'s still becoming.',
        },
        activities: [
          { id: 'one-thing-mine', name: 'One thing that is mine', cadence: 'weekly',
            description: 'Three hours a week — fixed slot — for something that is yours. Not family, not work. Yours.', icon: 'star' },
          { id: 'old-hobby', name: 'Pick up the old thing', cadence: 'weekly',
            description: 'One thing you used to love before kids. Try it once this month. Even badly.', icon: 'tool' },
          { id: 'name-yourself', name: 'Name yourself first', cadence: 'daily',
            description: 'In your morning page, write your name. Then one sentence about you that is not about the kids.', icon: 'pen' },
        ],
        firstMessage: fm(
          'The kids do not need a martyr. They need a parent who has a self. We rebuild it, three hours at a time.',
          'You have alchemised yourself into them. Now we recover the original metal. Slowly.',
          'You took a long detour into their country. We remember yours exists. We visit it this week.',
          'The body remembers what made it joyful. We listen to it. We honour one of those things this week.',
          'A monk has a cell and a practice. You have a home and a role. We rebuild the cell.',
          'A tool that only serves others rusts in the moments alone. We use it for ourselves. Once this week.',
        ),
        quoteTags: ['self', 'identity', 'practice', 'restoration'],
        learning: {
          foundation: [
            { id: 'id-lost', title: 'When the self goes underground', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Recognising the shape of the loss.' },
            { id: 'id-role', title: 'Mother / father is not the whole', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'Holding the role without disappearing.' },
            { id: 'id-fair', title: 'Fair Play by Eve Rodsky', type: 'book', provider: 'Eve Rodsky', durationMin: 240, difficulty: 1, blurb: 'Renegotiating the invisible work.' },
          ],
          depth: [
            { id: 'id-hours', title: 'Three hours that are yours', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'Reclaiming a slot, then protecting it.' },
            { id: 'id-hobby', title: 'Picking up the old thing', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Returning to what was yours before.' },
            { id: 'id-burnt', title: 'Burnt Toast by Teri Hatcher', type: 'book', provider: 'Teri Hatcher', durationMin: 240, difficulty: 2, blurb: 'The self that bends without breaking.' },
          ],
          integration: [
            { id: 'id-co', title: 'Reorganising with your co-parent', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'The conversation about who carries what.' },
            { id: 'id-redrawn', title: 'Self, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: hours, hobby, co-parent.' },
          ],
        },
        heroScene: 'reach-stay',
      },
      control: {
        id: 'control',
        name: 'The grip on outcomes',
        shortDescription: 'You are trying to engineer who they become. The grip is hurting both of you.',
        mentorContext: 'User is over-managing their child. Anxiety masquerading as parenting. The child feels the pressure.',
        journey: {
          title: 'From engineering them to walking beside them',
          opening: 'You\'re trying to shape how they turn out. The grip is tight on both ends. The ride is about loosening — letting them fail small things, watching what happens. They become more themselves. So do you.',
        },
        activities: [
          { id: 'one-failure', name: 'Let one thing fail', cadence: 'weekly',
            description: 'Once this week, let your kid handle a mistake without rescuing. Watch what happens.', icon: 'release' },
          { id: 'pause-correct', name: 'Pause before correcting', cadence: 'on-trigger',
            description: 'Before correcting them, pause. Ask: is this important, or is it me?', icon: 'pause' },
          { id: 'their-decision', name: 'Their decision', cadence: 'weekly',
            description: 'Once a week, let them make a decision in their domain — clothing, food, weekend — without input.', icon: 'arrow' },
        ],
        firstMessage: fm(
          'You are trying to control their path. We loosen the grip. Their lives are theirs to live. We model. We do not engineer.',
          'The grip is fear in disguise. Beneath it is love. We let the love through without the fear.',
          'You have been mapping their territory for them. We hand them the map. They will get lost. They will learn.',
          'The body of a child needs space to fall. We give it. We are nearby, not above.',
          'Control is the absence of trust. We practise trust. Once this week. Small.',
          'A craftsman trains an apprentice by letting them ruin a piece. We let them. The lesson is in the ruin.',
        ),
        quoteTags: ['letting-go', 'trust', 'children', 'modelling'],
        learning: {
          foundation: [
            { id: 'co-grip', title: 'The grip, named', type: 'course', provider: 'Detalytics', durationMin: 25, difficulty: 1, blurb: 'Anxiety masquerading as parenting.' },
            { id: 'co-fall', title: 'Why kids need to fall', type: 'course', provider: 'Detalytics', durationMin: 30, difficulty: 1, blurb: 'The neuroscience of safe failure.' },
            { id: 'co-gift', title: 'The Gift of Failure', type: 'book', provider: 'Jessica Lahey', durationMin: 240, difficulty: 1, blurb: 'How parental over-help backfires.' },
          ],
          depth: [
            { id: 'co-pause', title: 'Pause before correcting', type: 'course', provider: 'Detalytics', durationMin: 45, difficulty: 2, blurb: 'The space between trigger and response.' },
            { id: 'co-domain', title: 'Their domain, their decisions', type: 'course', provider: 'Detalytics', durationMin: 40, difficulty: 2, blurb: 'Mapping what\'s actually theirs to own.' },
            { id: 'co-good', title: 'Good Inside by Becky Kennedy', type: 'book', provider: 'Becky Kennedy', durationMin: 240, difficulty: 2, blurb: 'Connection-first parenting.' },
          ],
          integration: [
            { id: 'co-teens', title: 'The teen handoff', type: 'course', provider: 'Detalytics', durationMin: 60, difficulty: 3, blurb: 'Loosening grip as they grow.' },
            { id: 'co-redrawn', title: 'Trust, redrawn', type: 'article', provider: 'Detalytics journal', durationMin: 20, difficulty: 3, blurb: 'Synthesis: pause, domain, teen.' },
          ],
        },
        heroScene: 'walks-lighter',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────

export const ARCHETYPES = ['stoic', 'alchemist', 'explorer', 'healer', 'monk', 'craftsman'];
export const TONES = ['gentle', 'direct', 'poetic', 'pragmatic'];

export function getDomain(domainId) {
  return DOMAINS[domainId];
}

export function getQuestions(domainId) {
  return DOMAINS[domainId]?.questions ?? [];
}

export function getProblem(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId];
}

export function getAllProblems(domainId) {
  return DOMAINS[domainId] ? Object.values(DOMAINS[domainId].problems) : [];
}

// answers: array of { questionId, optionId }
// returns: { problemId, score, runnerUpId, runnerUpScore, tally }
export function diagnoseProblem(domainId, answers) {
  const domain = DOMAINS[domainId];
  if (!domain) return null;
  const tally = {};
  for (const ans of answers) {
    const q = domain.questions.find(x => x.id === ans.questionId);
    if (!q) continue;
    const opt = q.options.find(x => x.id === ans.optionId);
    if (!opt) continue;
    for (const [tag, weight] of Object.entries(opt.tags)) {
      tally[tag] = (tally[tag] || 0) + weight;
    }
  }
  const ranked = Object.entries(tally)
    .filter(([tag]) => domain.problems[tag])
    .sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    // user picked all "healthy" answers — surface lowest-weighted real problem
    const fallback = Object.keys(domain.problems)[0];
    return {
      problemId: fallback, score: 0,
      runnerUpId: null, runnerUpScore: 0,
      tally,
    };
  }
  return {
    problemId: ranked[0][0],
    score: ranked[0][1],
    runnerUpId: ranked[1]?.[0] ?? null,
    runnerUpScore: ranked[1]?.[1] ?? 0,
    tally,
  };
}

export function getFirstMessage(domainId, problemId, archetypeId) {
  return DOMAINS[domainId]?.problems[problemId]?.firstMessage[archetypeId] ?? '';
}

export function getActivities(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId]?.activities ?? [];
}

export function getQuoteTags(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId]?.quoteTags ?? [];
}

export function getHeroScene(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId]?.heroScene ?? 'who-stays';
}

export function getJourney(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId]?.journey;
}

export function getLearning(domainId, problemId) {
  return DOMAINS[domainId]?.problems[problemId]?.learning ?? null;
}

export function getDomainList() {
  return Object.values(DOMAINS).map(d => ({
    id: d.id, name: d.name, blurb: d.blurb,
  }));
}
