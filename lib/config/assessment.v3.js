// Detalytics assessment language revision — August 2026.
//
// These questions are evidence-informed check-in prompts. They are not the
// original validated instruments and must not be scored or described as a
// clinical assessment. Realm targets are product-routing metadata only.

const option = (text, target, extra = {}) => ({ text, target, ...extra });
const question = (prompt, options, extra = {}) => ({ prompt, options, ...extra });

export const ASSESSMENT_ROUTE_LABELS = {
  assess: 'Take Stock',
  manage: 'Strengthening the Foundation',
  optimize: 'Build What’s Next',
};

export const ASSESSMENT_PROFILES = [
  {
    id: 'school-student',
    title: 'School student',
    detail: 'Age 15–17',
    ageBand: '15-17',
    context: 'student',
  },
  {
    id: 'university-student',
    title: 'University student',
    detail: 'Age 18+',
    ageBand: '18+',
    context: 'student',
  },
  {
    id: 'working-adult',
    title: 'Working adult',
    detail: 'Age 18+',
    ageBand: '18+',
    context: 'worker',
  },
];

export const ASSESSMENT_V3 = {
  body: {
    assess: [
      question('When you think about your body, what feels most off right now?', [
        option('My sleep feels broken or too short', 'm_sleep'),
        option('I get enough sleep but still feel tired', 'm_energy'),
        option('My weight or body shape is bothering me', 'm_weight'),
        option('I feel okay — but I want to take better care of myself long-term', 'o_long'),
      ]),
      question('What is your main goal for your body over the next three months?', [
        option('Recover from something that has been building up — for example, poor sleep for months, always feeling unwell, or constant low energy', 'm_energy'),
        option('Lose weight or manage my weight', 'm_weight'),
        option('Get stronger and recover better from exercise', 'o_perf'),
        option('Finally improve my sleep so I wake up feeling rested', 'o_sleep'),
      ]),
      question('Imagine a morning when you feel your best. You wake up feeling —', [
        option('Finally rested — like sleep actually worked', 'm_sleep'),
        option('Energised and ready to move', 'o_perf'),
        option('Clear-headed and light in your body', 'o_long'),
        option('Naturally awake — alert and ready to eat', 'o_sleep'),
      ]),
      question('If a friend asked what you are working on with your body, you would say —', [
        option('Sleep — I am trying to actually recover', 'm_sleep'),
        option('Energy — I need to get back to a normal baseline', 'm_energy'),
        option('Weight — losing some or building more', 'm_weight'),
        option('Long-term health — I want to stay well as I get older', 'o_long'),
      ]),
      question('The most honest thing about your body right now is —', [
        option('Something specific needs attention — for example, I often feel unwell, I have pain that will not go away, or my energy has been low for months', 'm_energy'),
        option('Things are okay, but I know I can do more', 'o_long'),
        option('I am pushing hard and I want to perform at my best', 'o_perf'),
        option('Sleep is the one thing I have never properly improved', 'o_sleep'),
      ]),
    ],
    manage: [
      question('Most mornings when you wake up, how do you feel?', [
        option('Worn out — I did not get enough sleep', 'm_sleep'),
        option('Heavy and unrefreshed, even after enough hours', 'm_sleep'),
        option('Unsteady — my sleep times keep shifting', 'm_sleep'),
        option('Generally low — sleep does not feel good overall', 'm_sleep'),
        option('My mornings are okay — the difficulty comes later in the day', 'm_energy'),
      ]),
      question('Your evenings usually look like —', [
        option('Staying up late — my phone, study, or work keeps me going', 'm_sleep'),
        option('Wired but tired — I cannot calm down enough to sleep', 'm_sleep'),
        option('Running out of energy by evening — nothing is left', 'm_energy'),
        option('My evenings are generally okay — the issue is something else', null, { noSignal: true }),
      ]),
      question('Right now, your body is asking for —', [
        option('More sleep — real, consistent rest', 'm_sleep'),
        option('Better eating — proper meals and less junk food', 'm_weight'),
        option('More movement — getting my body active', 'm_weight'),
        option('Less caffeine and less screen time', 'm_energy'),
        option('None of these quite fit — something else is the issue', null, { noSignal: true }),
      ]),
      question('Three months from now, you would feel relieved if —', [
        option('I was consistently getting enough sleep for my age', 'm_sleep'),
        option('My energy stopped dropping throughout the day', 'm_energy'),
        option('I had reached a weight I felt good at', 'm_weight'),
        option('I felt calmer and less dependent on caffeine to get through the day', 'm_energy'),
      ]),
      question('If you are being honest, the real difficulty is —', [
        option('I am simply not sleeping enough', 'm_sleep'),
        option('I am running on stress and pressure instead of taking care of the basics', 'm_energy'),
        option('I am carrying weight that is affecting how I feel and function', 'm_weight'),
        option('I am exhausted and relying on caffeine or energy drinks to get through the day', 'm_energy'),
      ]),
    ],
    optimize: [
      question('You are already doing reasonably well. What would the next level of improvement look like for you?', [
        option('Living longer and staying sharp and active as I get older', 'o_long'),
        option('Training harder and performing better in sport or exercise', 'o_perf'),
        option('Making sleep work as real recovery, not just rest', 'o_sleep'),
        option('Understanding my health numbers — such as blood tests, glucose, or hormones', 'o_long'),
      ]),
      question('A typical week of movement and exercise for you looks like —', [
        option('Three to five planned sessions, structured and intentional', 'o_perf'),
        option('A mix of cardio and strength work, but not fully organised', 'o_perf'),
        option('Daily movement — walking, stairs, and general activity — but no formal training', 'o_long'),
        option('My recovery is the limiting factor — the training itself is fine', 'o_sleep'),
      ]),
      question('When it comes to your sleep right now, you —', [
        option('Sleep enough hours but do not feel deeply rested', 'o_sleep'),
        option('Sleep well, but want to improve the quality of deep and REM sleep', 'o_sleep'),
        option('Track your sleep with a device and want better scores', 'o_sleep'),
        option('Sleep fine, but feel like you could recover faster', 'o_perf'),
      ]),
      question('If you could ask a health expert one question, it would be —', [
        option('How do I add five to ten healthy years to my life?', 'o_long'),
        option('How do I reach a personal best in lifting, running, or my sport?', 'o_perf'),
        option('How do I use sleep to perform better?', 'o_sleep'),
        option('What is the next health number I should work on?', 'o_long'),
      ]),
      question('Honestly, you are working toward —', [
        option('Decades of health, not just months', 'o_long'),
        option('Output right now — strength, speed, and energy', 'o_perf'),
        option('Sleep quality first — everything else improves when this is right', 'o_sleep'),
        option('Resilience — handling stress and pressure better physically', 'o_perf'),
      ]),
    ],
  },

  brain: {
    assess: [
      question('When you think about your mental state, what is the main issue that comes up?', [
        option('Worry and anxiety — I feel tense a lot of the time', 'm_anx'),
        option('Low mood — things feel flat and colourless', 'm_low'),
        option('Overthinking — my thoughts will not slow down', 'm_loop'),
        option('I feel okay — but I want a sharper, clearer mind', 'o_foc'),
      ]),
      question('If you had one sincere goal this quarter for your mind, it would be —', [
        option('Feel less anxious and more settled', 'm_anx'),
        option('Lift my mood and feel like myself again', 'm_low'),
        option('Stop going in circles with the same thoughts', 'm_loop'),
        option('Be able to focus harder and for longer', 'o_foc'),
      ]),
      question('At the end of a day when things have gone well, you feel —', [
        option('Lighter than when you started', 'm_anx'),
        option('A little hopeful, maybe even slightly excited about something', 'm_low'),
        option('Quiet in your head for once', 'm_loop'),
        option('Pleasantly tired from doing something you enjoyed', 'o_foc'),
      ]),
      question('If a friend asked what you were working on inside your head, you would say —', [
        option('Anxiety — trying to feel calmer and less on edge', 'm_anx'),
        option('Mood — trying to feel like myself again', 'm_low'),
        option('Overthinking — trying to stop going in circles', 'm_loop'),
        option('Focus — trying to do deeper, better work', 'o_foc'),
      ]),
      question('The most honest statement about your mind right now is —', [
        option('Something specific needs support — for example, anxiety that will not go away, low mood most days, or thoughts that will not stop', 'm_anx', { supportSignal: true }),
        option('Things are okay — I just want to be sharper', 'o_foc'),
        option('My memory feels weaker than it used to', 'o_mem'),
        option('I fall apart under pressure when I should not', 'o_res'),
      ]),
    ],
    manage: [
      question('At night or in the early hours of the morning, what is your mind usually doing?', [
        option('Going over the same worry again and again — I cannot put it down', 'm_loop', { supportSignal: true }),
        option('Feeling empty or down', 'm_low', { supportSignal: true }),
        option('Replaying something I said or did', 'm_loop', { supportSignal: true }),
        option('Jumping straight to worst-case scenarios', 'm_anx', { supportSignal: true }),
        option('My mind is fairly quiet at night — the difficulty is at a different time of day', null, { noSignal: true }),
      ]),
      question('When something good happens to you, your reaction is usually —', [
        option('Waiting for something to go wrong', 'm_anx', { supportSignal: true }),
        option('Telling yourself it probably does not really count', 'm_low', { supportSignal: true }),
        option('Replaying it over and over — almost too much', 'm_loop', { supportSignal: true }),
        option('Feeling okay for a little while, then returning to how you usually feel', 'm_low', { supportSignal: true }),
        option('Taking it in and feeling genuinely good about it, at least for a while', null, { noSignal: true }),
      ]),
      question('When you are under pressure or stressed, your body usually —', [
        option('Gets tight — chest, jaw, or stomach', 'm_anx', { supportSignal: true }),
        option('Feels heavy', 'm_low', { supportSignal: true }),
        option('Holds tension while your thoughts race at the same time', 'm_loop', { supportSignal: true }),
        option('Gets a sudden rush of adrenaline that you cannot shake', 'm_anx', { supportSignal: true }),
        option('Stays relatively steady — I manage pressure well enough', null, { noSignal: true }),
      ]),
      question('When you have nothing specific to do, how do you usually feel?', [
        option('Restless — I start looking for something to do', 'm_anx', { supportSignal: true }),
        option('A wave of sadness or heaviness comes over me', 'm_low', { supportSignal: true }),
        option('Overwhelmed with thoughts I cannot sort through', 'm_loop', { supportSignal: true }),
        option('I used to enjoy this more, but now it feels heavy', 'm_low', { supportSignal: true }),
        option('I generally enjoy it — I can switch off without too much trouble', null, { noSignal: true }),
      ]),
      question('The hardest part of your day is usually —', [
        option('Getting started in the morning', 'm_low', { supportSignal: true }),
        option('The afternoon — when energy drops and thoughts start going in circles', 'm_loop', { supportSignal: true }),
        option('Whenever I am alone with my own thoughts', 'm_loop', { supportSignal: true }),
        option('There is no single worst part — my days are generally manageable', null, { noSignal: true }),
      ]),
    ],
    optimize: [
      question('When you sit down to study or do focused work —', [
        option('I can focus well for long stretches — I want to push it further', 'o_foc'),
        option('I can sustain focus, but I start to lose detail over time', 'o_mem'),
        option('I fall apart when the pressure or stakes are high', 'o_res'),
        option('I am mostly reactive — I want to build a proper deep-work habit', 'o_foc'),
      ]),
      question('The thing you most wish you could do better is —', [
        option('Remember more of what I read and study', 'o_mem'),
        option('Stay focused even when there are distractions around me', 'o_foc'),
        option('Think clearly when I am stressed or under pressure', 'o_res'),
        option('Keep information readily available so I can use it in class, meetings, or conversations', 'o_mem'),
      ]),
      question('What usually gets in the way of your best performance?', [
        option('Notifications — phone, messages, and apps', 'o_foc'),
        option('Too much information at once — I cannot hold it all', 'o_mem'),
        option('Pressure — I freeze or stumble when it really counts', 'o_res'),
        option('Switching between too many things at once', 'o_foc'),
        option('Not much right now — I am looking to add capacity, not fix a problem', null, { noSignal: true }),
      ]),
      question('If you could strengthen one thing about how your mind works —', [
        option('How long and how deeply I can focus on one thing', 'o_foc'),
        option('My memory — how well I take in and recall information', 'o_mem'),
        option('Staying calm and clear when things get difficult', 'o_res'),
        option('Pushing through when the work gets hard or boring', 'o_foc'),
        option('I am not sure yet — I want to explore what my next edge is', null, { noSignal: true }),
      ]),
      question('The edge you are working toward right now is —', [
        option('Learning faster — taking in more and understanding it better', 'o_mem'),
        option('Output — doing more and getting more done', 'o_foc'),
        option('Composure — handling more pressure without cracking', 'o_res'),
        option('Depth — thinking at a higher level for longer', 'o_foc'),
      ]),
    ],
  },

  relationships: {
    assess: [
      question('When you think about the relationships in your life, what comes to mind first?', [
        option('Someone important to me — we have drifted apart', 'm_part'),
        option('Family — the same tension keeps coming back', 'm_fam'),
        option('My social life — I feel more alone than I should', 'm_iso'),
        option('Things are okay — but I want deeper, more meaningful connections', 'o_circ'),
      ]),
      question('One sincere goal for your relationships this quarter —', [
        option('Repair or rebuild something that has drifted', 'm_part'),
        option('Change how I react in a family pattern that keeps repeating', 'm_fam'),
        option('Build or rebuild a real circle of people I can trust', 'o_circ'),
        option('Show up better for the people who depend on me', 'o_lead'),
      ]),
      question('A perfect evening with someone who matters to you would end with you feeling —', [
        option('Sincerely engaged with each other — no phones and real attention', 'o_int'),
        option('Quiet and comfortable together — nothing to fix, just present', 'o_int'),
        option('Reconnected — it had been too long', 'm_iso'),
        option('Relieved that you both actually showed up for each other', 'm_part'),
      ]),
      question('When a friend shares something really hard they are going through —', [
        option('You freeze — you are not sure what to say or how to help', 'm_iso'),
        option('You jump straight in with solutions and plans', 'm_part'),
        option('You show up, but feel unsure about how best to help', 'o_int'),
        option('You are fully present — they leave feeling supported', 'o_lead'),
      ]),
      question('The most honest statement about your relationships right now is —', [
        option('Something specific is hurting in an important relationship', 'm_part'),
        option('A family pattern is draining me', 'm_fam'),
        option('I feel like no one really knows me', 'm_iso'),
        option('My relationships are okay — I just want them to be richer', 'o_int'),
      ]),
    ],
    manage: [
      question('The relationship that seems most in need of attention is —', [
        option('Someone close to me — the distance has been growing', 'm_part'),
        option('Family — a pattern that keeps repeating', 'm_fam'),
        option('Friends — I feel like I do not really have friends', 'm_iso'),
        option('Someone specific I have lost touch with and miss', 'm_iso'),
        option('It is hard to say — I feel most of my relationships need work', null, { noSignal: true }),
      ]),
      question('At the end of a hard week, the person you wish you could really talk to is —', [
        option('Someone close to me — but the conversations remain superficial', 'm_part'),
        option('A close friend — but I would need to rebuild that first', 'm_iso'),
        option('Someone in my family — but it usually turns into an argument', 'm_fam'),
        option('No one specific comes to mind — and that is what bothers me', 'm_iso'),
        option('Someone comes to mind — but I have not actually reached out or do not know how', 'm_iso'),
      ]),
      question('The pattern you keep walking into is —', [
        option('Being around people but not really connecting', 'm_part'),
        option('The same argument with the same person', 'm_fam'),
        option('Performing in social situations but going home feeling empty', 'm_iso'),
        option('Pulling away just when things start to get closer', 'm_part'),
        option('I am not sure I have one clear pattern — it shifts', null, { noSignal: true }),
      ]),
      question('The conversation you have been avoiding most is with —', [
        option('Someone close — naming that the distance between you has grown', 'm_part'),
        option('A parent or sibling — naming the dynamic between you', 'm_fam'),
        option('A friend — admitting that you miss them', 'm_iso'),
        option('Someone important — admitting what you are actually feeling underneath', 'm_part'),
        option('I am not avoiding a specific conversation right now — the issue is something else', null, { noSignal: true }),
      ]),
      question('Three months from now, you would feel relieved if —', [
        option('An important relationship felt close again', 'm_part'),
        option('You had stopped playing your old role in a family pattern', 'm_fam'),
        option('You had two people you could call without overthinking it', 'm_iso'),
        option('You had finally said the thing you have been holding back', 'm_part'),
      ]),
    ],
    optimize: [
      question('In your most important close relationship, the next level looks like —', [
        option('Deeper, more meaningful conversations, more often', 'o_int'),
        option('Really seeing each other again — not just coexisting', 'o_int'),
        option('Better emotional and physical closeness', 'o_int', { minorText: 'Feeling emotionally closer and more understood' }),
        option('Working toward real shared goals, not just getting through the week', 'o_int'),
      ]),
      question('Your circle of close friends right now is —', [
        option('Strong but small — I want it to grow', 'o_circ'),
        option('Strong — and I want to keep it that way', 'o_circ'),
        option('Okay on the surface — but not very deep or meaningful', 'o_circ'),
        option('Always changing — I want something more stable', 'o_circ'),
      ]),
      question('When it comes to leading or being there for the people around you —', [
        option('I am functioning, but I want to inspire them and not just show up', 'o_lead'),
        option('I want them to feel guided, not just managed', 'o_lead'),
        option('I want to be more present and less distracted', 'o_lead'),
        option('I want to leave people better than I found them', 'o_lead'),
      ]),
      question('The relationship goal that matters most to you right now is —', [
        option('Closeness with someone important to me', 'o_int'),
        option('Real friendships in life', 'o_circ'),
        option('Being a better support for the people who depend on me', 'o_lead'),
        option('All three — but I would start with closeness', 'o_int'),
      ]),
      question('Three months from now, you would love —', [
        option('Real time set aside to connect with someone — no distractions', 'o_int'),
        option('Two close friendships that feel maintained and real', 'o_circ'),
        option('The people around me trusting me more', 'o_lead'),
        option('To be more present with the people I care about', 'o_int'),
      ]),
    ],
  },

  skills: {
    assess: [
      question('When you think about your studies or work right now, what comes to mind first?', [
        option('I am running low', 'm_burn'),
        option('The weight of responsibility — it is spilling into the rest of my life', 'm_load'),
        option('Something does not feel right — the fit is off', 'm_fit'),
        option('Things are okay — I want to get to the next level', 'o_grow'),
      ]),
      question('One honest goal for your studies or work this quarter —', [
        option('Get back to a manageable pace — stop feeling like I am drowning', 'm_burn'),
        option('Carry less — delegate or drop something that is weighing me down', 'm_load'),
        option('Find a direction that actually fits who I am', 'm_fit'),
        option('Produce something meaningful — focused, deep work', 'o_out'),
      ]),
      question('A good week of studying or working ends with you feeling —', [
        option('Tired but proud', 'm_burn'),
        option('Happy to have helped someone around you do better', 'o_lead'),
        option('Like you made a real step forward', 'o_grow'),
        option('Like you actually produced something of value', 'o_out'),
      ]),
      question('If someone asked how your studies or work were going, you would honestly say —', [
        option('I am running on empty', 'm_burn'),
        option('The weight of it feels more than I can manage', 'm_load'),
        option('I am in the wrong place — I am thinking about changing', 'm_fit'),
        option('Things are good — I am building toward the next level', 'o_grow'),
      ]),
      question('The most honest statement about your situation right now is —', [
        option('Something specific is not working — for example, I failed something important, cannot keep up with the workload, or feel completely stuck', 'm_burn'),
        option('Things are okay — I just want to grow', 'o_grow'),
        option('I want to work smarter and lead better — not just do more', 'o_lead'),
        option('I want to focus better and produce deeper work', 'o_out'),
      ]),
    ],
    manage: [
      question('The evening before a big study or work day, your body usually —', [
        option('Tightens — the day ahead is already weighing on you', 'm_burn'),
        option('Goes flat — nothing pulls you forward', 'm_fit'),
        option('Buzzes — there is too much on your mind to switch off', 'm_load'),
        option('Plans — you are already running through what needs to happen', 'm_load'),
        option('You are generally okay going in — the strain hits when you have to sustain effort', 'm_burn'),
      ]),
      question('The most exhausting part of studying or working is —', [
        option('The sheer volume — too many things and too few resources', 'm_burn'),
        option('Managing group dynamics or other people — the emotional weight', 'm_load'),
        option('Pretending to care about something you have stopped believing in', 'm_fit'),
        option('Always being the person everyone comes to for answers', 'm_load'),
        option('I cannot pinpoint one thing — it is the overall accumulation', 'm_burn'),
      ]),
      question('If you could stop tomorrow and walk away —', [
        option('You would finally rest', 'm_burn'),
        option('You would feel free from what you are carrying for others', 'm_load'),
        option('You would feel excited — you want something different', 'm_fit'),
        option('You would feel anxious — you care about this, but you are exhausted', 'm_burn'),
        option('You would not want to — you are in the right place and just need proper rest', 'm_burn'),
      ]),
      question('The real reason you are tired right now is —', [
        option('I have been spending energy for too long without refilling — I feel empty', 'm_burn'),
        option('I am carrying problems and decisions that should not be mine alone', 'm_load'),
        option('I am in the wrong subject, environment, or direction', 'm_fit', { workerText: 'I am in the wrong role, environment, or direction' }),
        option('I never actually switch off — study or work is always on my mind', 'm_burn'),
        option('I cannot distinguish one specific thing — several things are adding up', 'm_burn'),
      ]),
      question('Three months from now, you would feel relieved if —', [
        option('You had a rhythm that felt manageable', 'm_burn'),
        option('You had properly handed off or dropped things that were not yours to carry alone', 'm_load'),
        option('You were working on something that genuinely fits you', 'm_fit', { studentText: 'You were studying or working on something that genuinely fits you' }),
        option('You could stop at the end of the day and be present for the rest of your life', 'm_burn'),
      ]),
    ],
    optimize: [
      question('Which area would you most like to see change and progress?', [
        option('I can see the next level and I want to earn it', 'o_grow'),
        option('I am leading or supporting others and I want to do it better', 'o_lead'),
        option('I am producing work but I want to go deeper', 'o_out'),
        option('Things are fine — I am looking for what pulls me next', 'o_grow'),
      ]),
      question('The next move that excites you is —', [
        option('More responsibility — bigger impact and wider reach', 'o_grow'),
        option('Building people around me who grow and do not need me for everything', 'o_lead'),
        option('A piece of deep, focused work that only you can do', 'o_out'),
        option('A role, path, or project with more freedom and ownership', 'o_grow'),
        option('I am not sure yet — I am still figuring out what I want to do next', 'o_grow'),
      ]),
      question('When things get difficult for your group, team, or people around you —', [
        option('You jump in fast — sometimes before you have fully understood the situation', 'o_lead'),
        option('You calm the situation down and feel good about that', 'o_lead'),
        option('You protect the atmosphere so you can keep working together', 'o_lead'),
        option('You are not sure you would handle it well', 'o_lead'),
      ]),
      question('What holds your performance back most?', [
        option('Not having enough uninterrupted time to focus — I am always reacting', 'o_out'),
        option('Too many people depending directly on you', 'o_lead'),
        option('Being unclear about where you are actually heading', 'o_grow'),
        option('Feeling stuck — no new challenge or edge to grow toward', 'o_grow'),
      ]),
      question('Three months from now, you would love —', [
        option('A clear next step or goal to work toward', 'o_grow'),
        option('A team or group that runs well without you managing everything', 'o_lead'),
        option('Deep, focused weeks doing meaningful work that has an impact', 'o_out'),
        option('All three — and more growth on top of that', 'o_grow'),
      ]),
    ],
  },
};

export function applyAssessmentV3(domains) {
  for (const [domainId, intents] of Object.entries(ASSESSMENT_V3)) {
    for (const [intentId, questions] of Object.entries(intents)) {
      if (domains[domainId]?.intents[intentId]) {
        domains[domainId].intents[intentId].questions = questions;
      }
    }
  }
  return domains;
}

function variantText(item, profile) {
  if (profile?.ageBand === '15-17' && item.minorText) return item.minorText;
  if (profile?.context === 'student' && item.studentText) return item.studentText;
  if (profile?.context === 'worker' && item.workerText) return item.workerText;
  return item.text;
}

export function resolveAssessmentQuestions(questions, profile) {
  return questions.map((item) => ({
    ...item,
    prompt: variantText({ ...item, text: item.prompt }, profile),
    options: item.options.map((answer) => ({
      ...answer,
      text: variantText(answer, profile),
    })),
  }));
}

export function getAssessmentProfile(profileId) {
  return ASSESSMENT_PROFILES.find((profile) => profile.id === profileId) ?? null;
}
