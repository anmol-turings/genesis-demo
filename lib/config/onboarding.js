// lib/config/onboarding.v2.js
//
// INTENT-FIRST onboarding architecture.
//
// FLOW
//   domain pick (4 cards)
//     → intent pick (3 cards per domain: assess / manage / optimize)
//       → 5 scenario questions for the chosen intent
//         → diagnose into one destination
//           → destination reveal screen, then dashboard
//
// Within Manage and Optimize, each intent has 3 destinations. The 5
// scenario questions diagnose into one of those 3.
//
// Assess has no destinations of its own; its 5 questions point at
// destinations across both Manage and Optimize for the same domain.


export const DOMAINS = {
  body: {
    id: 'body',
    name: 'Body',
    blurb: 'Sleep, energy, the body you have been ignoring.',
    enabled: true,
    intents: {
      assess: {
        id: 'assess',
        name: 'Find your starting line',
        desc: 'Get a real read of your body before changing anything — sleep, energy, health markers (like blood test results).',
        questions: [
          {
            prompt: 'When you think about your body, what is loudest right now?',
            options: [
              { text: 'Sleep is broken or too short', target: 'm_sleep' },
              { text: 'I am tired even after sleep', target: 'm_energy' },
              { text: 'Body composition is off — weight matters', target: 'm_weight' },
              { text: 'I am fine — but I want to play the long game better', target: 'o_long' },
            ],
          },
          {
            prompt: 'One real intention for your body in the next quarter —',
            options: [
              { text: 'Recover from a specific deficit', target: 'm_energy' },
              { text: 'Drop or hold weight intentionally', target: 'm_weight' },
              { text: 'Train harder and recover better', target: 'o_perf' },
              { text: 'Get my sleep to a place I actually feel', target: 'o_sleep' },
            ],
          },
          {
            prompt: 'A weekend morning at your best. You wake up —',
            options: [
              { text: 'Finally rested', target: 'm_sleep' },
              { text: 'Energised and ready to move', target: 'o_perf' },
              { text: 'Sharp — clean mind, lighter body', target: 'o_long' },
              { text: 'Hungry — but in a healthy way', target: 'm_weight' },
            ],
          },
          {
            prompt: 'A friend asks "what is the body project right now?" You would say —',
            options: [
              { text: 'Sleep — chasing real recovery', target: 'm_sleep' },
              { text: 'Energy — getting baseline back', target: 'm_energy' },
              { text: 'Composition — leaning out or building', target: 'm_weight' },
              { text: 'Longevity — health markers, aging well', target: 'o_long' },
            ],
          },
          {
            prompt: 'The most truthful statement about your body right now is —',
            options: [
              { text: 'Something specific is breaking — I need to deal with it', target: 'm_energy' },
              { text: 'Baseline is OK but I want better', target: 'o_long' },
              { text: 'I am pushing for peak — output is the goal', target: 'o_perf' },
              { text: 'Sleep is the lever I have not pulled', target: 'o_sleep' },
            ],
          },
        ],
      },
      manage: {
        id: 'manage',
        name: 'Fix what\'s hurting',
        desc: 'Address a specific issue — sleep, weight, energy, a chronic condition.',
        destinations: [
        {
          id: 'm_sleep',
          name: 'The unpaid ledger',
          desc: 'Chronic sleep deprivation degrading mood, cognition, immunity.',
          heroScene: 'rest-multiplier',
          journey: {
            title: 'From an unpaid ledger to a body that trusts the night',
            opening: 'Sleep has become foreign. Your body has forgotten how to enter it on purpose. We re-teach the practice — gently, with a fixed wake time and a real wind-down.',
          },
          quoteTags: ['sleep', 'rhythm', 'rest', 'recovery'],
          firstMessage: {
            stoic: 'Sleep is not optional. Everything else lives downstream of it. We start there, tonight.',
            alchemist: 'The unpaid ledger compounds in silence. We pay the principal, not chase symptoms.',
            explorer: 'Every long journey begins with the night before. We learn to make camp.',
            healer: 'Your body has been begging for sleep. We honour the request, gently, with consistency.',
            monk: 'Rest is a practice, not an absence. We learn to enter it on purpose.',
            craftsman: 'A sharp blade needs the whetstone nightly. Sleep is the stone. Tonight we use it.',
          },
          activities: [
            { id: 'fixed-wakeup', name: 'Fixed wake time', cadence: 'daily', description: 'Wake at the same time every day, including weekends, for two weeks.' },
            { id: 'wind-down', name: 'Wind-down hour', cadence: 'daily', description: 'One hour before bed: lights low, no screens, no work talk.' },
            { id: 'caffeine-cut', name: 'Caffeine cutoff', cadence: 'daily', description: 'No caffeine after 1pm. The half-life is longer than you think.' },
          ],
        },
        {
          id: 'm_energy',
          name: 'Running on empty',
          desc: 'Low baseline energy; running on stress hormones and willpower.',
          heroScene: 'rest-multiplier',
          journey: {
            title: 'From running on stress to running on rhythm',
            opening: 'Your body has been quietly carrying you. It still works — that\'s something. The ride is about giving it back what it\'s been spending: sleep, food, light, slowness.',
          },
          quoteTags: ['energy', 'body', 'fuel', 'recovery'],
          firstMessage: {
            stoic: 'The body has been telling you for months. We start listening today. First, food at sunrise.',
            alchemist: 'The empty tank is a message. Beneath the fatigue is a question about what you have been spending yourself on.',
            explorer: 'Every climber knows: you cannot summit on yesterday\'s calories. We refuel before we plan.',
            healer: 'Your body is wise and tired. We do not push — we replenish. Slowly, and on time.',
            monk: 'The breath comes first. Then food. Then movement. We take them in that order.',
            craftsman: 'A working body is a sharp tool. We sharpen with sleep, food, light.',
          },
          activities: [
            { id: 'protein-anchor', name: 'Protein anchor', cadence: 'daily', description: 'A real, protein-led breakfast within 60 minutes of waking. Two weeks, no exceptions.' },
            { id: 'walk-twenty', name: 'Twenty minutes outside', cadence: 'daily', description: 'A walk outdoors before noon. Sunlight, slow pace, no headphones for the first five minutes.' },
            { id: 'screen-curfew', name: 'Screen curfew', cadence: 'daily', description: 'Phone leaves the bedroom at 9:30pm.' },
          ],
        },
        {
          id: 'm_weight',
          name: 'The weight you carry',
          desc: 'Body composition outside healthy range — weight gain or unintended loss.',
          heroScene: 'rest-multiplier',
          journey: {
            title: 'From the weight you carry to a body that fits your life',
            opening: 'There\'s a body you remember and a body you\'re in. The ride closes the gap — gently, repeatedly, over enough weeks that it sticks.',
          },
          quoteTags: ['rhythm', 'enough', 'capacity'],
          firstMessage: {
            stoic: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
            alchemist: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
            explorer: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
            healer: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
            monk: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
            craftsman: 'Composition shifts with rhythm, not with force. We build the rhythm — protein, movement, and the discipline to keep showing up.',
          },
          activities: [
            { id: 'protein-each-meal', name: 'Protein anchor at every meal', cadence: 'daily', description: 'A real protein source at every meal — 30g minimum. Eat it first.' },
            { id: 'move-most-days', name: 'Movement most days', cadence: 'daily', description: 'Thirty minutes of movement, six days a week. Walks count.' },
            { id: 'sugar-one-cut', name: 'One sugar source removed', cadence: 'weekly', description: 'One sugar source removed each week. Notice what replaces it.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'When you wake up most mornings, what is happening?',
            options: [
              { text: 'Heavy and unrested — body would not restore', target: 'm_sleep' },
              { text: 'Drained — even after a full night', target: 'm_energy' },
              { text: 'Sluggish — body feels weighed down', target: 'm_weight' },
              { text: 'Sleep is short — late night, early up', target: 'm_sleep' },
            ],
          },
          {
            prompt: 'Your evenings look like —',
            options: [
              { text: 'Late to bed — phone or work eats the runway', target: 'm_sleep' },
              { text: 'Wired but tired — cannot wind down', target: 'm_sleep' },
              { text: 'Crashed early — no energy left for anything', target: 'm_energy' },
              { text: 'Eating late — snacking, takeout, drinks', target: 'm_weight' },
            ],
          },
          {
            prompt: 'The body is asking for —',
            options: [
              { text: 'Sleep. Real sleep.', target: 'm_sleep' },
              { text: 'Fuel. Real meals on time.', target: 'm_energy' },
              { text: 'Movement and protein.', target: 'm_weight' },
              { text: 'A break from caffeine and screens.', target: 'm_energy' },
            ],
          },
          {
            prompt: 'Three months from now you would be relieved if —',
            options: [
              { text: 'I was sleeping 7+ hours nightly, every night', target: 'm_sleep' },
              { text: 'My energy stopped crashing at 3pm', target: 'm_energy' },
              { text: 'I had dropped (or gained) the weight that matters', target: 'm_weight' },
              { text: 'I felt less wired and more steady', target: 'm_energy' },
            ],
          },
          {
            prompt: 'Looking honestly, the friction is —',
            options: [
              { text: 'I am not sleeping enough — full stop', target: 'm_sleep' },
              { text: 'I am running my body on stress, not fuel', target: 'm_energy' },
              { text: 'I am carrying weight that is costing me', target: 'm_weight' },
              { text: 'I am exhausted and over-caffeinating to compensate', target: 'm_energy' },
            ],
          },
        ],
      },
      optimize: {
        id: 'optimize',
        name: 'Go from good to better',
        desc: 'You\'re functional — get sharper, stronger, longer-lived through your body.',
        destinations: [
        {
          id: 'o_long',
          name: 'Living longer, living well',
          desc: 'Healthspan, health markers, aging well — playing the long game with your body.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From good to a body that holds you for decades',
            opening: 'You\'re playing the long game. The ride is health markers, training, sleep — calibrated for healthspan, not just lifespan.',
          },
          quoteTags: ['rhythm', 'enough', 'long-game'],
          firstMessage: {
            stoic: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
            alchemist: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
            explorer: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
            healer: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
            monk: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
            craftsman: 'Longevity is built by the unsexy basics, done long enough. We name them, we measure them, we keep them.',
          },
          activities: [
            { id: 'bloods-quarterly', name: 'Quarterly blood panel', cadence: 'monthly', description: 'Quarterly fasted bloods. Track ApoB, HbA1c, hsCRP, and the trend over time.' },
            { id: 'zone-two', name: 'Three Zone 2 sessions a week', cadence: 'weekly', description: 'Three 45-min Zone 2 sessions a week. Conversational pace.' },
            { id: 'protein-1g', name: '1g protein per lb of body weight', cadence: 'daily', description: '1g protein per pound of body weight. Spread across three meals.' },
          ],
        },
        {
          id: 'o_perf',
          name: 'Peak output',
          desc: 'Strength, speed, recovery — train your body to perform at its edge.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From functional to peak output',
            opening: 'Your body works. Now it\'s about the edges — strength, speed, recovery. The ride trains you to peak without breaking.',
          },
          quoteTags: ['effort', 'discipline', 'rhythm'],
          firstMessage: {
            stoic: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
            alchemist: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
            explorer: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
            healer: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
            monk: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
            craftsman: 'Peak is engineered — load, recovery, fuel. We design it with you, then we hold it.',
          },
          activities: [
            { id: 'structured-training', name: 'Structured training plan', cadence: 'daily', description: 'Four sessions a week. Each one has a purpose written before it starts.' },
            { id: 'recovery-rituals', name: 'Daily recovery ritual', cadence: 'daily', description: 'Mobility, sleep, fuel. Recovery is the training session you do not skip.' },
            { id: 'prepost-fuel', name: 'Pre/post-training fuel', cadence: 'daily', description: 'Calibrated fuel before and after every session. No more guessing.' },
          ],
        },
        {
          id: 'o_sleep',
          name: 'Sleep that builds you',
          desc: 'Move sleep from restful to restorative — better recovery, sharper days.',
          heroScene: 'rest-multiplier',
          journey: {
            title: 'From sleeping enough to sleep that rebuilds you',
            opening: 'You sleep — but it isn\'t restoring you. The ride moves you from average sleep to sleep as your edge.',
          },
          quoteTags: ['sleep', 'rhythm', 'recovery'],
          firstMessage: {
            stoic: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
            alchemist: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
            explorer: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
            healer: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
            monk: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
            craftsman: 'Sleep is the lever. We learn to pull it cleanly — and the rest of your day reorganises itself around the win.',
          },
          activities: [
            { id: 'sleep-tracking', name: 'Track sleep weekly', cadence: 'daily', description: 'Track sleep with a ring or watch. Review the week each Sunday.' },
            { id: 'cool-room', name: 'Cool, dark, quiet bedroom', cadence: 'daily', description: 'Bedroom at 18°C, blackout, quiet. Treat it like the lab it is.' },
            { id: 'taper-screens', name: 'Screens off 90 min before bed', cadence: 'daily', description: 'Screens off ninety minutes before bed. Read instead.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'You are already doing well. The next gear is —',
            options: [
              { text: 'Live longer, well', target: 'o_long' },
              { text: 'Train harder, perform better', target: 'o_perf' },
              { text: 'Sleep as restoration — fully', target: 'o_sleep' },
              { text: 'Markers — bloods, glucose, hormones', target: 'o_long' },
            ],
          },
          {
            prompt: 'A typical training week is —',
            options: [
              { text: '3-5 sessions, structured, with intent', target: 'o_perf' },
              { text: 'Mix of cardio and lifting, not optimised', target: 'o_perf' },
              { text: 'Daily movement, not training specifically', target: 'o_long' },
              { text: 'Recovery is the limiter, not the training', target: 'o_sleep' },
            ],
          },
          {
            prompt: 'When you sleep, you currently —',
            options: [
              { text: 'Sleep enough but not deeply', target: 'o_sleep' },
              { text: 'Sleep well — but want to optimise REM/deep', target: 'o_sleep' },
              { text: 'Wear a ring or watch and want better numbers', target: 'o_sleep' },
              { text: 'Sleep fine — but feel I could recover faster', target: 'o_perf' },
            ],
          },
          {
            prompt: 'The question you would ask a coach is —',
            options: [
              { text: 'How do I add 5 years to my healthspan?', target: 'o_long' },
              { text: 'How do I PR my lift or run?', target: 'o_perf' },
              { text: 'How do I make sleep a competitive edge?', target: 'o_sleep' },
              { text: 'What is the next health marker I should improve?', target: 'o_long' },
            ],
          },
          {
            prompt: 'Honestly, you are optimising for —',
            options: [
              { text: 'Decades, not months', target: 'o_long' },
              { text: 'Output now — strength, speed, energy', target: 'o_perf' },
              { text: 'Sleep quality first — everything cascades', target: 'o_sleep' },
              { text: 'Resilience — handling stress better', target: 'o_long' },
            ],
          },
        ],
      },
    },
  },
  brain: {
    id: 'brain',
    name: 'Brain & Mind',
    blurb: 'Anxiety, the mood that won\'t lift, the loop you cannot stop.',
    enabled: true,
    intents: {
      assess: {
        id: 'assess',
        name: 'Find your true state',
        desc: 'Read what\'s actually happening in your mind — emotionally, cognitively.',
        questions: [
          {
            prompt: 'When you think about your mental state, what is loudest?',
            options: [
              { text: 'Anxiety — body always tight', target: 'm_anx' },
              { text: 'Low mood — colour gone out of things', target: 'm_low' },
              { text: 'Looping — cannot put thoughts down', target: 'm_loop' },
              { text: 'I am fine — but I want sharper focus', target: 'o_foc' },
            ],
          },
          {
            prompt: 'One real intention for your mind this quarter —',
            options: [
              { text: 'Calm the alarm system', target: 'm_anx' },
              { text: 'Get unstuck from the grey', target: 'm_low' },
              { text: 'Stop the rumination loops', target: 'm_loop' },
              { text: 'Focus harder for longer', target: 'o_foc' },
            ],
          },
          {
            prompt: 'A perfect Sunday afternoon ends with you feeling —',
            options: [
              { text: 'Lighter than I started', target: 'm_anx' },
              { text: 'Hopeful and slightly excited', target: 'm_low' },
              { text: 'Quiet in my head', target: 'm_loop' },
              { text: 'Pleasantly tired from real engagement', target: 'o_foc' },
            ],
          },
          {
            prompt: 'A friend asks "what are you working on with your head?" —',
            options: [
              { text: 'Anxiety, mostly. Trying to settle.', target: 'm_anx' },
              { text: 'Mood. Trying to come back.', target: 'm_low' },
              { text: 'Stopping the loops. Or trying to.', target: 'm_loop' },
              { text: 'Focus. Want deeper work.', target: 'o_foc' },
            ],
          },
          {
            prompt: 'The most truthful statement is —',
            options: [
              { text: 'Something specific needs help — anxiety, low mood, loops', target: 'm_anx' },
              { text: 'Baseline is OK — I want sharper', target: 'o_foc' },
              { text: 'Memory feels weaker than it should be', target: 'o_mem' },
              { text: 'Pressure breaks me when it should not', target: 'o_res' },
            ],
          },
        ],
      },
      manage: {
        id: 'manage',
        name: 'Quiet what\'s been turned up',
        desc: 'Address a specific symptom — anxiety, low mood, rumination.',
        destinations: [
        {
          id: 'm_anx',
          name: 'Always on high alert',
          desc: 'Chronic nervous-system activation — stuck in fight-or-flight, unable to switch off.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From always on high alert to a system that trusts the moment',
            opening: 'Your nervous system has been protecting you for a long time. It works hard. The ride is about teaching it that it can rest now.',
          },
          quoteTags: ['nervous-system', 'breath', 'safety', 'present'],
          firstMessage: {
            stoic: 'The body is reading danger. We do not argue with it. We show it, with breath, that it is safe now.',
            alchemist: 'Anxiety is alchemical material. Beneath the static is signal. We learn to read it.',
            explorer: 'You are scanning a horizon for storms that have already passed. We bring the eyes back to the path.',
            healer: 'Your nervous system has been protecting you. We thank it. Then we teach it to rest.',
            monk: 'The breath is the bridge between body and being. We cross it together.',
            craftsman: 'A vibrating tool cannot do precise work. We steady it. Then we use it.',
          },
          activities: [
            { id: 'physiological-sigh', name: 'The physiological sigh', cadence: 'every-90m', description: 'Two short inhales through the nose, one long exhale. Three times. Resets the nervous system.' },
            { id: 'name-three', name: 'Name three things', cadence: 'on-trigger', description: 'Name three things you can see, two you can hear, one you can feel.' },
            { id: 'cold-water', name: 'Cold water on the face', cadence: 'on-trigger', description: 'Splash cold water on your face when anxiety rises. Triggers the dive reflex.' },
          ],
        },
        {
          id: 'm_low',
          name: 'The grey hour',
          desc: 'Persistent low mood; loss of pleasure, motivation, colour.',
          heroScene: 'felt-named-free',
          journey: {
            title: 'From the grey hour to colour returning',
            opening: 'There\'s a heaviness in you that\'s real. Not all of it is yours, and none of it is forever. The ride is gentle.',
          },
          quoteTags: ['grief', 'slowness', 'compassion', 'small'],
          firstMessage: {
            stoic: 'The grey is real. We do not push through it; we work with it. Today: one small thing, fully done.',
            alchemist: 'Low mood is the soul fallow. Nothing grows until you stop pulling at it. We rest the field.',
            explorer: 'You have been carrying weather. We do not change weather; we change shelter. Light, food, one human.',
            healer: 'The body is asking for slowness. We honour it. Compassion before action.',
            monk: 'There is nothing to fix today. Only to be with what is. We sit beside it.',
            craftsman: 'A foggy workshop sets the work aside. We do not abandon it. We pause it kindly.',
          },
          activities: [
            { id: 'one-person', name: 'One person a day', cadence: 'daily', description: 'One human contact a day, however small. Voice if possible.' },
            { id: 'morning-light', name: 'Morning light', cadence: 'daily', description: 'Ten minutes of outdoor light within an hour of waking.' },
            { id: 'one-small-thing', name: 'One small completed thing', cadence: 'daily', description: 'One small completed thing a day. Make the bed. Send the email.' },
          ],
        },
        {
          id: 'm_loop',
          name: 'The mind that won\'t stop',
          desc: 'Stuck in cognitive loops — rumination, decision paralysis.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From the mind running you to you running the mind',
            opening: 'You\'ve been thinking instead of acting. The mind has become the bottleneck. The ride is about reclaiming the doing — small, decisive, often.',
          },
          quoteTags: ['action', 'simplicity', 'enough', 'making'],
          firstMessage: {
            stoic: 'The mind has been ruling. We give it boundaries. Action is the cure for analysis.',
            alchemist: 'Loops are gold compressed too tightly. We loosen them with one decisive move, today.',
            explorer: 'You have been mapping the trail without walking it. We walk. The map updates as you move.',
            healer: 'The mind has been protecting you with thought. We thank it. Then we ask the body what it knows.',
            monk: 'Stillness is not thinking. Stillness is what thinking interrupts. We practise the silence.',
            craftsman: 'A craftsman who plans forever ships nothing. We make. We refine after.',
          },
          activities: [
            { id: 'two-minute', name: 'The two-minute rule', cadence: 'daily', description: 'If a decision takes less than two minutes, decide and act. The thinking adds nothing.' },
            { id: 'write-decide', name: 'Write to decide', cadence: 'on-trigger', description: 'When stuck, write the decision down for ten minutes. The pen finds what the head loops past.' },
            { id: 'good-enough', name: 'Good enough is good', cadence: 'daily', description: 'Once a day, ship something at 80%.' },
          ],
        },
        ],
        questions: [
          {
            prompt: '3am — what is the mind doing?',
            options: [
              { text: 'Looping a worry — cannot put it down', target: 'm_anx' },
              { text: 'Heavy, blank, cannot get up', target: 'm_low' },
              { text: 'Replaying something I said today', target: 'm_loop' },
              { text: 'Catastrophising — what could go wrong', target: 'm_anx' },
            ],
          },
          {
            prompt: 'When something good happens, you —',
            options: [
              { text: 'Wait for the other shoe to drop', target: 'm_anx' },
              { text: 'Discount it — they do not mean it', target: 'm_low' },
              { text: 'Replay it on loop for days', target: 'm_loop' },
              { text: 'Feel briefly OK, then return to baseline', target: 'm_low' },
            ],
          },
          {
            prompt: 'Your body when stressed —',
            options: [
              { text: 'Tightens — chest, jaw, gut', target: 'm_anx' },
              { text: 'Goes heavy and flat', target: 'm_low' },
              { text: 'Holds tension while the head spins', target: 'm_loop' },
              { text: 'Spikes adrenaline I cannot shake', target: 'm_anx' },
            ],
          },
          {
            prompt: 'A quiet moment with no agenda —',
            options: [
              { text: 'Makes me restless — must do something', target: 'm_anx' },
              { text: 'Brings a wave of sadness', target: 'm_low' },
              { text: 'Triggers a thousand thoughts I cannot sort', target: 'm_loop' },
              { text: 'Used to be nice — feels heavy now', target: 'm_low' },
            ],
          },
          {
            prompt: 'The hardest part of your day is —',
            options: [
              { text: 'The first hour — getting started', target: 'm_low' },
              { text: 'The 3pm crash and the looping', target: 'm_loop' },
              { text: 'Anytime a difficult thought lands', target: 'm_anx' },
              { text: 'Any moment where I am alone with my mind', target: 'm_low' },
            ],
          },
        ],
      },
      optimize: {
        id: 'optimize',
        name: 'Sharper thinking, calmer state',
        desc: 'Your mind works — train it for higher gear and steadier endurance.',
        destinations: [
        {
          id: 'o_foc',
          name: 'Deeper focus',
          desc: 'Sustained attention; fewer distractions; cleaner thinking under load.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From scattered to deep focus on demand',
            opening: 'Your attention is your edge. The ride builds the muscle of staying with one thing — long enough to do real work.',
          },
          quoteTags: ['attention', 'discipline', 'effort'],
          firstMessage: {
            stoic: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
            alchemist: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
            explorer: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
            healer: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
            monk: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
            craftsman: 'Focus is a trained capacity. We build the block, we protect it, and we make the work bigger inside it.',
          },
          activities: [
            { id: 'block-mornings', name: 'Deep work morning block', cadence: 'daily', description: 'Two-hour deep work block, mornings, no phone in the room.' },
            { id: 'notification-cull', name: 'Cull notifications', cadence: 'weekly', description: 'Turn off notifications for the top three apps that pull you out.' },
            { id: 'focus-fuel', name: 'Cognitive fuel', cadence: 'daily', description: 'Caffeine plus protein anchor for sessions. Hydration before noon.' },
          ],
        },
        {
          id: 'o_mem',
          name: 'Memory you trust',
          desc: 'Strengthen working memory, retention, recall.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From forgetting to retention you can rely on',
            opening: 'Memory is built. The ride teaches you to encode, consolidate, and recall — like the trained mind it can become.',
          },
          quoteTags: ['learning', 'discipline', 'attention'],
          firstMessage: {
            stoic: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
            alchemist: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
            explorer: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
            healer: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
            monk: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
            craftsman: 'Memory is the receipt of attention. We sharpen the attention, then we hold the receipt.',
          },
          activities: [
            { id: 'active-recall', name: 'Active recall after learning', cadence: 'daily', description: 'Ten minutes of active recall after each learning session.' },
            { id: 'sleep-consolidation', name: 'Sleep for consolidation', cadence: 'daily', description: '7+ hours sleep — memory consolidates on the third REM cycle.' },
            { id: 'spaced-review', name: 'Spaced repetition review', cadence: 'weekly', description: 'Weekly spaced-repetition review of what matters.' },
          ],
        },
        {
          id: 'o_res',
          name: 'Calm under pressure',
          desc: 'Function clearly when load is high — stress resilience.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From breaking under load to function under fire',
            opening: 'Pressure used to break you. The ride trains your system to stay clear when load is high — and recover faster.',
          },
          quoteTags: ['nervous-system', 'breath', 'discipline'],
          firstMessage: {
            stoic: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
            alchemist: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
            explorer: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
            healer: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
            monk: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
            craftsman: 'Resilience is trained, not born. We expose the system to load, then we let it adapt.',
          },
          activities: [
            { id: 'sigh-trigger', name: 'Physiological sigh on stress', cadence: 'on-trigger', description: 'Physiological sigh the moment you notice activation.' },
            { id: 'cold-exposure', name: 'Cold exposure', cadence: 'weekly', description: 'Three cold-exposure sessions a week. Two to three minutes.' },
            { id: 'breath-trained', name: 'Daily breathwork', cadence: 'daily', description: 'Ten minutes of breathwork each morning. Box breathing or cyclic.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'Your typical deep-work block —',
            options: [
              { text: 'Breaks at the 20-minute mark', target: 'o_foc' },
              { text: 'Goes 45 min but I lose details', target: 'o_mem' },
              { text: 'Falls apart when stakes are high', target: 'o_res' },
              { text: 'Does not exist — I am reactive all day', target: 'o_foc' },
            ],
          },
          {
            prompt: 'You wish you could —',
            options: [
              { text: 'Remember more of what you read', target: 'o_mem' },
              { text: 'Hold focus through interruptions', target: 'o_foc' },
              { text: 'Think clearly when stressed', target: 'o_res' },
              { text: 'Have a sharper working memory in meetings', target: 'o_mem' },
            ],
          },
          {
            prompt: 'The thing that breaks your performance is —',
            options: [
              { text: 'Email, Slack, notifications', target: 'o_foc' },
              { text: 'Information overload — cannot retain', target: 'o_mem' },
              { text: 'Pressure — I freeze or stumble', target: 'o_res' },
              { text: 'Multitasking — I am always context-switching', target: 'o_foc' },
            ],
          },
          {
            prompt: 'If you could improve one thing about your thinking —',
            options: [
              { text: 'Depth and duration of focus', target: 'o_foc' },
              { text: 'Memory and recall', target: 'o_mem' },
              { text: 'Calm in the heat of the moment', target: 'o_res' },
              { text: 'Endurance — pushing through the wall', target: 'o_res' },
            ],
          },
          {
            prompt: 'Your edge right now is —',
            options: [
              { text: 'Curiosity — I want to learn faster', target: 'o_mem' },
              { text: 'Output — I want to ship more', target: 'o_foc' },
              { text: 'Composure — I want to handle more stress', target: 'o_res' },
              { text: 'Mastery — I want to think deeper', target: 'o_foc' },
            ],
          },
        ],
      },
    },
  },
  relationships: {
    id: 'relationships',
    name: 'Relationships',
    blurb: 'Partners, family, friends — the distance that has crept in.',
    enabled: true,
    intents: {
      assess: {
        id: 'assess',
        name: 'Map your relational landscape',
        desc: 'Honest look at who\'s in your life, who\'s slipping, where you\'re witnessed.',
        questions: [
          {
            prompt: 'When you think about your relationships, what is loudest?',
            options: [
              { text: 'My partner — we have gone quiet', target: 'm_part' },
              { text: 'My family — same old fight', target: 'm_fam' },
              { text: 'My circle — I am too alone', target: 'm_iso' },
              { text: 'I am OK — but I want closer with my partner', target: 'o_int' },
            ],
          },
          {
            prompt: 'One real intention for your relationships this quarter —',
            options: [
              { text: 'Repair what has drifted with someone close', target: 'm_part' },
              { text: 'Stop performing the family script', target: 'm_fam' },
              { text: 'Build or rebuild a real circle', target: 'o_circ' },
              { text: 'Show up better for my team', target: 'o_lead' },
            ],
          },
          {
            prompt: 'A perfect evening with someone close —',
            options: [
              { text: 'Long talk, no phones, real questions', target: 'o_int' },
              { text: 'Quiet companionship, nothing to fix', target: 'o_int' },
              { text: 'Reconnect — last time was too long ago', target: 'm_iso' },
              { text: 'I would feel relieved we had actually shown up', target: 'm_part' },
            ],
          },
          {
            prompt: 'When a friend in real pain reaches out —',
            options: [
              { text: 'I freeze — I do not know what to say', target: 'm_iso' },
              { text: 'I rush to fix — solutions, plans', target: 'm_part' },
              { text: 'I show up — but feel rusty', target: 'o_int' },
              { text: 'I am fully present — they leave lighter', target: 'o_lead' },
            ],
          },
          {
            prompt: 'The most truthful statement is —',
            options: [
              { text: 'Something specific is hurting in a key relationship', target: 'm_part' },
              { text: 'My family pattern is exhausting', target: 'm_fam' },
              { text: 'I am not witnessed by anyone', target: 'm_iso' },
              { text: 'My relationships are fine — I want them rich', target: 'o_int' },
            ],
          },
        ],
      },
      manage: {
        id: 'manage',
        name: 'Repair what\'s gone quiet',
        desc: 'Address a specific relationship in drift or rupture.',
        destinations: [
        {
          id: 'm_part',
          name: 'The slow drift',
          desc: 'Long-term partner distance — coexisting rather than connecting.',
          heroScene: 'felt-named-free',
          journey: {
            title: 'From quiet drift to closer than you\'ve been in years',
            opening: 'You have a deep love in you. What has gone quiet is the muscle of reaching. We rebuild it — one real question, one phones-down meal at a time.',
          },
          quoteTags: ['intimacy', 'attention', 'reaching', 'presence'],
          firstMessage: {
            stoic: 'Distance is built one unspoken thing at a time. We close it the same way.',
            alchemist: 'The drift is the relationship asking to be paid attention to. We listen, then we speak.',
            explorer: 'You have been on parallel paths. We bring them within sight of each other again.',
            healer: 'Love does not die from drama. It dies from neglect. We tend to it, gently, this week.',
            monk: 'Presence is the practice. We sit beside the person, not just live near them.',
            craftsman: 'A relationship is a thing you make. We pick up the tools again.',
          },
          activities: [
            { id: 'one-question', name: 'One real question', cadence: 'daily', description: 'One question a day to your partner that is not logistical.' },
            { id: 'phones-down', name: 'Phones down dinner', cadence: 'weekly', description: 'One meal a week with no phones in the room.' },
            { id: 'name-shift', name: 'Name what shifted', cadence: 'weekly', description: 'Once this week, name out loud the thing you have noticed but not said.' },
          ],
        },
        {
          id: 'm_fam',
          name: 'The same fight, again',
          desc: 'Recurring family conflict pattern with an old role.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From the same fight to a softer truth',
            opening: 'There\'s an old pattern with this person. You\'ve changed; the script hasn\'t. The ride teaches you to step out of it.',
          },
          quoteTags: ['family', 'patterns', 'inner-child', 'response'],
          firstMessage: {
            stoic: 'The fight is not new. We choose, today, to not be the version of you who plays that part.',
            alchemist: 'Old patterns are old gold. Beneath them is something unmet. We mine it carefully.',
            explorer: 'You have walked this trail many times. We mark a different turn.',
            healer: 'The wound under the fight is older than the fight. We tend to it first.',
            monk: 'You have been reacting from a body that is no longer a child. We notice, and we breathe.',
            craftsman: 'A pattern is a tool that has worn the wrong groove. We break it by using a different stroke.',
          },
          activities: [
            { id: 'pause-five', name: 'The five-second pause', cadence: 'on-trigger', description: 'When the trigger lands, count five seconds before responding.' },
            { id: 'name-script', name: 'Name the script', cadence: 'weekly', description: 'Write down the recurring fight in three lines. What does it really want?' },
            { id: 'one-different', name: 'One different move', cadence: 'on-trigger', description: 'Once this month, do something different in the moment. Even small.' },
          ],
        },
        {
          id: 'm_iso',
          name: 'The quiet absence',
          desc: 'Surrounded but not witnessed — lacking deep connection.',
          heroScene: 'felt-named-free',
          journey: {
            title: 'From quiet absence to being known',
            opening: 'You\'re not alone in life. You\'re alone in the part of yourself that needs witnessing. The ride is about reaching toward one person, then another.',
          },
          quoteTags: ['connection', 'witness', 'reaching', 'belonging'],
          firstMessage: {
            stoic: 'Solitude is a discipline. Isolation is its absence dressed up as one. We reach out.',
            alchemist: 'You have been holding things alone that were never meant to be alone. We give one away today.',
            explorer: 'You are surrounded but uncrossed. We build a bridge to one person. Today.',
            healer: 'You need to be witnessed, not fixed. We find one person who will sit with you.',
            monk: 'Presence with one is enough. We need to be known by one.',
            craftsman: 'A craftsman has a workshop, and a circle. We rebuild your circle, one bench at a time.',
          },
          activities: [
            { id: 'reach-one', name: 'Reach one person', cadence: 'weekly', description: 'Once a week, message one person not in your daily life. "How are you really?"' },
            { id: 'voice-note', name: 'A voice, not a text', cadence: 'weekly', description: 'Send one voice note this week instead of a text.' },
            { id: 'one-true-thing', name: 'One true thing', cadence: 'weekly', description: 'Once this week, tell one person one true thing you usually keep to yourself.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'The relationship that needs the most right now —',
            options: [
              { text: 'My partner — distance has grown', target: 'm_part' },
              { text: 'My family — a pattern keeps repeating', target: 'm_fam' },
              { text: 'Friends — I do not really have them anymore', target: 'm_iso' },
              { text: 'A specific old friend I have lost touch with', target: 'm_iso' },
            ],
          },
          {
            prompt: 'At the end of a hard week, the person you wish you could talk to is —',
            options: [
              { text: 'My partner — but the talking has gone shallow', target: 'm_part' },
              { text: 'A close friend — but I would have to rebuild that first', target: 'm_iso' },
              { text: 'Someone in my family — but it would turn into the fight', target: 'm_fam' },
              { text: 'No one specific — and that is the problem', target: 'm_iso' },
            ],
          },
          {
            prompt: 'The pattern you keep walking into is —',
            options: [
              { text: 'Coexisting instead of connecting', target: 'm_part' },
              { text: 'The same blow-up with the same person', target: 'm_fam' },
              { text: 'Performing in social rooms but going home alone', target: 'm_iso' },
              { text: 'Pulling away when intimacy gets close', target: 'm_part' },
            ],
          },
          {
            prompt: 'The hardest conversation you have been avoiding is with —',
            options: [
              { text: 'My partner — naming the drift', target: 'm_part' },
              { text: 'A parent or sibling — naming the dynamic', target: 'm_fam' },
              { text: 'A friend — admitting I miss them', target: 'm_iso' },
              { text: 'My partner — admitting what is underneath', target: 'm_part' },
            ],
          },
          {
            prompt: 'Three months from now you would be relieved if —',
            options: [
              { text: 'My partner and I were close again', target: 'm_part' },
              { text: 'I had stopped playing my old part with family', target: 'm_fam' },
              { text: 'I had two people I could call without thinking', target: 'm_iso' },
              { text: 'I had named what I have been avoiding', target: 'm_part' },
            ],
          },
        ],
      },
      optimize: {
        id: 'optimize',
        name: 'Go deeper than functional',
        desc: 'Your relationships work — make them rich.',
        destinations: [
        {
          id: 'o_int',
          name: 'Closer with your partner',
          desc: 'Move from coexisting to truly intimate.',
          heroScene: 'felt-named-free',
          journey: {
            title: 'From coexisting to truly close',
            opening: 'Your love is real. The ride makes it loud — through real questions, real time, real reaching.',
          },
          quoteTags: ['intimacy', 'attention', 'presence'],
          firstMessage: {
            stoic: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
            alchemist: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
            explorer: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
            healer: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
            monk: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
            craftsman: 'Closeness is built one small reaching at a time. We make the reaching ordinary and the depth extraordinary.',
          },
          activities: [
            { id: 'weekly-real-date', name: 'Weekly real date', cadence: 'weekly', description: 'One real date a week — no logistics, no kids talk.' },
            { id: 'daily-question', name: 'One real question', cadence: 'daily', description: 'One real question to your partner each day.' },
            { id: 'micro-affection', name: 'One intentional touch', cadence: 'daily', description: 'One small intentional touch per day — without expectation.' },
          ],
        },
        {
          id: 'o_circ',
          name: 'A real circle',
          desc: 'Build the friendships adult life makes hard.',
          heroScene: 'felt-named-free',
          journey: {
            title: 'From scattered ties to a real circle',
            opening: 'Adult friendships need building. The ride rebuilds yours — one reach, one gathering, one voice note at a time.',
          },
          quoteTags: ['connection', 'reaching', 'belonging'],
          firstMessage: {
            stoic: 'A real circle is built — not found. We start one strand at a time, with intention.',
            alchemist: 'A real circle is built — not found. We start one strand at a time, with intention.',
            explorer: 'A real circle is built — not found. We start one strand at a time, with intention.',
            healer: 'A real circle is built — not found. We start one strand at a time, with intention.',
            monk: 'A real circle is built — not found. We start one strand at a time, with intention.',
            craftsman: 'A real circle is built — not found. We start one strand at a time, with intention.',
          },
          activities: [
            { id: 'reach-monthly', name: 'Reach one old friend', cadence: 'monthly', description: 'Reach out to one old friend each month.' },
            { id: 'host-quarterly', name: 'Host a small gathering', cadence: 'monthly', description: 'Host one small gathering each quarter.' },
            { id: 'voice-not-text', name: 'Voice notes this week', cadence: 'weekly', description: 'Send a voice note instead of a text this week.' },
          ],
        },
        {
          id: 'o_lead',
          name: 'A better leader of your people',
          desc: 'Show up with full presence — for team, family, community.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From carrying it all to leading sustainably',
            opening: 'You lead well — and it\'s costing you. The ride teaches you to carry less, model more, and build a team that doesn\'t need you everywhere.',
          },
          quoteTags: ['leadership', 'role', 'service'],
          firstMessage: {
            stoic: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            alchemist: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            explorer: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            healer: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            monk: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            craftsman: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
          },
          activities: [
            { id: 'one-delegate-week', name: 'One real delegation', cadence: 'weekly', description: 'One real delegation a week. Resist the urge to check.' },
            { id: 'team-walk-leader', name: 'Walk with one person', cadence: 'weekly', description: 'Twenty minutes with one team member. Listen more than you speak.' },
            { id: 'leader-modeled', name: 'Daily leader page', cadence: 'daily', description: 'Three lines at end of day on what you modeled.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'With your partner, the next level looks like —',
            options: [
              { text: 'Deeper conversations, more often', target: 'o_int' },
              { text: 'Truly seeing each other again', target: 'o_int' },
              { text: 'Better intimacy — emotional and physical', target: 'o_int' },
              { text: 'Shared projects, real partnership', target: 'o_int' },
            ],
          },
          {
            prompt: 'Your circle of close friends —',
            options: [
              { text: 'Strong but small — could grow', target: 'o_circ' },
              { text: 'Strong — and I want to maintain it', target: 'o_circ' },
              { text: 'Decent — but no real depth', target: 'o_circ' },
              { text: 'Always changing — I want stability', target: 'o_circ' },
            ],
          },
          {
            prompt: 'As a leader (at work or at home) —',
            options: [
              { text: 'I am functional, want to be inspiring', target: 'o_lead' },
              { text: 'I want my team or family to feel led, not managed', target: 'o_lead' },
              { text: 'I want presence — fewer distracted interactions', target: 'o_lead' },
              { text: 'I want to leave people more capable', target: 'o_lead' },
            ],
          },
          {
            prompt: 'The relational edge you want is —',
            options: [
              { text: 'Intimacy with my partner', target: 'o_int' },
              { text: 'Real friends in my actual life', target: 'o_circ' },
              { text: 'Better leadership of my people', target: 'o_lead' },
              { text: 'All three — but I would start with intimacy', target: 'o_int' },
            ],
          },
          {
            prompt: 'Three months from now you would love —',
            options: [
              { text: 'A weekly date that is not logistics', target: 'o_int' },
              { text: 'Two real friendships rebuilt', target: 'o_circ' },
              { text: 'A team that trusts me more', target: 'o_lead' },
              { text: 'More presence with people I love', target: 'o_int' },
            ],
          },
        ],
      },
    },
  },
  skills: {
    id: 'skills',
    name: 'Competency & Skills · Work',
    blurb: 'Burnout, stagnation, the weight of leading.',
    enabled: true,
    intents: {
      assess: {
        id: 'assess',
        name: 'Find where you really stand',
        desc: 'Get an honest read on whether you\'re recovering, plateaued, or growing.',
        questions: [
          {
            prompt: 'When you think about work right now, what is loudest?',
            options: [
              { text: 'Burning out — recovery is the priority', target: 'm_burn' },
              { text: 'The weight of leading — bleeding into life', target: 'm_load' },
              { text: 'Wrong role — I can feel the misfit', target: 'm_fit' },
              { text: 'I am OK — but I want the next ascent', target: 'o_grow' },
            ],
          },
          {
            prompt: 'One real intention for your work in the next quarter —',
            options: [
              { text: 'Get sustainable again — stop bleeding', target: 'm_burn' },
              { text: 'Lead lighter — delegate more', target: 'o_lead' },
              { text: 'Find the next role or scope', target: 'o_grow' },
              { text: 'Ship more — deep, focused output', target: 'o_out' },
            ],
          },
          {
            prompt: 'A perfect work week ends with you feeling —',
            options: [
              { text: 'Tired but proud — recovered on weekend', target: 'm_burn' },
              { text: 'Like I helped my team rise', target: 'o_lead' },
              { text: 'I made a meaningful move forward', target: 'o_grow' },
              { text: 'I produced something real', target: 'o_out' },
            ],
          },
          {
            prompt: 'A peer asks "how is work?" Honestly —',
            options: [
              { text: 'I am running on fumes', target: 'm_burn' },
              { text: 'Heavy — the role is bigger than me', target: 'm_load' },
              { text: 'Wrong fit — I am planning to move', target: 'm_fit' },
              { text: 'Good — I am building the next level', target: 'o_grow' },
            ],
          },
          {
            prompt: 'The most truthful statement is —',
            options: [
              { text: 'Something specific is breaking', target: 'm_burn' },
              { text: 'Baseline is OK — I want to grow', target: 'o_grow' },
              { text: 'I want to lead better — less hero, more system', target: 'o_lead' },
              { text: 'I want sharper output — deep work', target: 'o_out' },
            ],
          },
        ],
      },
      manage: {
        id: 'manage',
        name: 'Fix what\'s breaking',
        desc: 'Address a specific issue — burnout, role weight, role misfit.',
        destinations: [
        {
          id: 'm_burn',
          name: 'Running on fumes',
          desc: 'Chronic work exhaustion needing structured recovery.',
          heroScene: 'rest-multiplier',
          journey: {
            title: 'From running on fumes to a body that holds you',
            opening: 'There\'s a steady self in you that knows how to do hard things. It just hasn\'t been allowed to rest. The ride brings the rest back.',
          },
          quoteTags: ['rest', 'capacity', 'rhythm', 'enough'],
          firstMessage: {
            stoic: 'You have not been resting. You have been deferring it. The body keeps the ledger.',
            alchemist: 'Fatigue is information. It says the rhythm has broken.',
            explorer: 'You have been moving without resupplying. We are building base camps.',
            healer: 'Your body has been carrying what your mind would not. Thank it. Then we give it sleep.',
            monk: 'There is doing and there is being. You have lost the second. The work begins by sitting still.',
            craftsman: 'A tool used without sharpening dulls. We sharpen by stopping.',
          },
          activities: [
            { id: 'sunset-shutdown', name: 'Sunset shutdown', cadence: 'daily', description: 'A 5-minute end-of-workday ritual. Write tomorrow\'s three things, close the laptop.' },
            { id: 'ninety-pause', name: 'The 90-minute pause', cadence: 'every-90m', description: 'Two minutes of standing, water, and looking at something far away.' },
            { id: 'one-no', name: 'One real no', cadence: 'weekly', description: 'Once a week, decline something that you would normally absorb.' },
          ],
        },
        {
          id: 'm_load',
          name: 'The weight of leading',
          desc: 'Role weight bleeding into personal life — identity fusing with the role.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From carrying it all to leading lighter',
            opening: 'You lead well. That\'s not the issue. What you\'ve stopped doing is being a person inside the role. The ride teaches you to wear the role instead of becoming it.',
          },
          quoteTags: ['leadership', 'role', 'shadow', 'service'],
          firstMessage: {
            stoic: 'You have begun to confuse yourself with your role. We separate them.',
            alchemist: 'A leader who carries everything teaches their team to be small.',
            explorer: 'You are leading a long expedition. The crew watches you for weather. We give you somewhere to be human.',
            healer: 'You are absorbing what is not yours. The body shows the cost.',
            monk: 'The role is a robe. You wear it; you are not it. We practise taking it off.',
            craftsman: 'A craftsman teaches by working beside, not above. We return you to the bench.',
          },
          activities: [
            { id: 'one-delegate', name: 'One real delegation', cadence: 'weekly', description: 'Hand off one thing you would normally do yourself. Resist checking.' },
            { id: 'team-walk', name: 'Walk with one person', cadence: 'weekly', description: 'Twenty minutes with one team member. No agenda. Listen more than you speak.' },
            { id: 'leader-journal', name: 'The leader\'s page', cadence: 'daily', description: 'Three lines at end of day. What did I model? What did I avoid?' },
          ],
        },
        {
          id: 'm_fit',
          name: 'The role that doesn\'t fit',
          desc: 'Wrong work, wrong company, wrong moment — and you can feel it.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From wrong fit to a role that fits',
            opening: 'You can feel it — the role doesn\'t fit. The ride names it, then helps you move toward what does.',
          },
          quoteTags: ['meaning', 'truth', 'movement'],
          firstMessage: {
            stoic: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
            alchemist: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
            explorer: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
            healer: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
            monk: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
            craftsman: 'A role that does not fit is a long, quiet drain. We name it, then we name the next step.',
          },
          activities: [
            { id: 'misfit-journal', name: 'Daily misfit journal', cadence: 'daily', description: 'Five lines a day on what fits and what doesn\'t.' },
            { id: 'quiet-search', name: 'Quiet search', cadence: 'weekly', description: 'One hour a week on what the next role looks like.' },
            { id: 'trusted-conversation', name: 'One trusted talk', cadence: 'weekly', description: 'Talk to one trusted person about the misfit. Out loud.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'Sunday evening, the body —',
            options: [
              { text: 'Tightens — Monday is heavy already', target: 'm_burn' },
              { text: 'Goes flat — nothing pulls me', target: 'm_fit' },
              { text: 'Buzzes — too much to unwind', target: 'm_load' },
              { text: 'Plans — my team\'s problems are in my head', target: 'm_load' },
            ],
          },
          {
            prompt: 'The most exhausting part of work is —',
            options: [
              { text: 'Volume — too many things, no recovery', target: 'm_burn' },
              { text: 'People management — emotional weight', target: 'm_load' },
              { text: 'Pretending to care about work I do not', target: 'm_fit' },
              { text: 'Always being the answer', target: 'm_load' },
            ],
          },
          {
            prompt: 'When you imagine quitting tomorrow —',
            options: [
              { text: 'Relief — I would finally rest', target: 'm_burn' },
              { text: 'Relief — I would shed the leadership weight', target: 'm_load' },
              { text: 'Excitement — I want a different game', target: 'm_fit' },
              { text: 'Anxiety — I love this work, just exhausted', target: 'm_burn' },
            ],
          },
          {
            prompt: 'The truest reason you are tired —',
            options: [
              { text: 'I have been spending without replenishing for years', target: 'm_burn' },
              { text: 'I am carrying decisions that are not mine to carry alone', target: 'm_load' },
              { text: 'I am in the wrong place, role, or company', target: 'm_fit' },
              { text: 'I never close the laptop, even off-hours', target: 'm_load' },
            ],
          },
          {
            prompt: 'Three months from now you would be relieved if —',
            options: [
              { text: 'I had a sustainable rhythm again', target: 'm_burn' },
              { text: 'I had handed off three things I should have already', target: 'm_load' },
              { text: 'I was working on something that fits', target: 'm_fit' },
              { text: 'I felt boundaries with work, not constant blur', target: 'm_burn' },
            ],
          },
        ],
      },
      optimize: {
        id: 'optimize',
        name: 'Find the next ascent',
        desc: 'You\'re functional — push toward leadership, mastery, deep output.',
        destinations: [
        {
          id: 'o_grow',
          name: 'The next ascent',
          desc: 'Find the next pull — promotion, scope, new mastery.',
          heroScene: 'reach-stay',
          journey: {
            title: 'From the plateau to the next ascent',
            opening: 'You\'ve reached a vista that feels like a stop. It isn\'t. Something in you is already asking what comes next, and the question is the beginning of an answer.',
          },
          quoteTags: ['movement', 'meaning', 'next-thing', 'edge'],
          firstMessage: {
            stoic: 'A plateau is not a stop. It is the part of the climb that asks whether you really want the summit.',
            alchemist: 'Stagnation is gold disguised as rust. Beneath it is the question you have not asked yourself in years.',
            explorer: 'You have reached a vista. The next ascent has a different texture. We map it.',
            healer: 'When the system stops moving, it is not broken. It is asking to be heard.',
            monk: 'The plateau is the teacher. Everything before was preparation.',
            craftsman: 'A craftsman who is not progressing has stopped sharpening or stopped using. We find which.',
          },
          activities: [
            { id: 'one-edge', name: 'One edge a day', cadence: 'daily', description: 'Identify one thing slightly beyond your current skill — and do five minutes of it.' },
            { id: 'envy-list', name: 'The envy list', cadence: 'weekly', description: 'Write three people whose work you envy this week. The envy is data.' },
            { id: 'old-self', name: 'Talk to last year\'s self', cadence: 'weekly', description: 'Write a paragraph to who you were a year ago.' },
          ],
        },
        {
          id: 'o_lead',
          name: 'Lead lighter',
          desc: 'Move from carrying it all to leading sustainably.',
          heroScene: 'walks-lighter',
          journey: {
            title: 'From carrying it all to leading sustainably',
            opening: 'You lead well — and it\'s costing you. The ride teaches you to carry less, model more, and build a team that doesn\'t need you everywhere.',
          },
          quoteTags: ['leadership', 'role', 'service'],
          firstMessage: {
            stoic: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            alchemist: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            explorer: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            healer: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            monk: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
            craftsman: 'Leading lighter is a discipline. We hand off, we model, we make the team capable of running without us in the room.',
          },
          activities: [
            { id: 'one-delegate-week', name: 'One real delegation', cadence: 'weekly', description: 'One real delegation a week. Resist the urge to check.' },
            { id: 'team-walk-leader', name: 'Walk with one person', cadence: 'weekly', description: 'Twenty minutes with one team member. Listen more than you speak.' },
            { id: 'leader-modeled', name: 'Daily leader page', cadence: 'daily', description: 'Three lines at end of day on what you modeled.' },
          ],
        },
        {
          id: 'o_out',
          name: 'Sharper output',
          desc: 'Cognitive output, focused work, shipping.',
          heroScene: 'focus-burns',
          journey: {
            title: 'From productive to deep, shipped output',
            opening: 'You ship — but want it deeper. The ride teaches you the discipline of one real piece of work per week, well.',
          },
          quoteTags: ['discipline', 'attention', 'effort'],
          firstMessage: {
            stoic: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
            alchemist: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
            explorer: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
            healer: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
            monk: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
            craftsman: 'Output is a posture. We build it — block, focus, ship. Every week. Until it is who you are at work.',
          },
          activities: [
            { id: 'deep-block', name: 'Two-hour deep block', cadence: 'daily', description: 'Two-hour deep block every morning. No comms. Phone in another room.' },
            { id: 'one-thing', name: 'Tomorrow\'s one thing', cadence: 'daily', description: 'Write tomorrow\'s ONE most important thing each evening.' },
            { id: 'ship-friday', name: 'Ship by Friday', cadence: 'weekly', description: 'Ship one piece of real work each Friday.' },
          ],
        },
        ],
        questions: [
          {
            prompt: 'Your career growth right now is —',
            options: [
              { text: 'I see the next role and want to earn it', target: 'o_grow' },
              { text: 'I am leading a team and want to lead lighter', target: 'o_lead' },
              { text: 'I am shipping but want deeper work', target: 'o_out' },
              { text: 'I am functional but want the next pull', target: 'o_grow' },
            ],
          },
          {
            prompt: 'The next-level work move is —',
            options: [
              { text: 'Bigger scope — more impact, more reach', target: 'o_grow' },
              { text: 'Building a team that does not need me everywhere', target: 'o_lead' },
              { text: 'A piece of deep work no one else can do', target: 'o_out' },
              { text: 'A role with more autonomy', target: 'o_grow' },
            ],
          },
          {
            prompt: 'When your team has a crisis —',
            options: [
              { text: 'I jump in fast — sometimes too fast', target: 'o_lead' },
              { text: 'I steady the room — proud of that', target: 'o_lead' },
              { text: 'I shield them so I can keep building', target: 'o_out' },
              { text: 'I am not sure I would handle it well', target: 'o_lead' },
            ],
          },
          {
            prompt: 'The thing that holds your performance back is —',
            options: [
              { text: 'Lack of focus time — too reactive', target: 'o_out' },
              { text: 'Too many people depending on me directly', target: 'o_lead' },
              { text: 'Unclear next step in my career', target: 'o_grow' },
              { text: 'Plateau — no new edges', target: 'o_grow' },
            ],
          },
          {
            prompt: 'Three months from now you would love —',
            options: [
              { text: 'A clear next role to step into', target: 'o_grow' },
              { text: 'A team that runs without me everywhere', target: 'o_lead' },
              { text: 'Deep focused weeks shipping real work', target: 'o_out' },
              { text: 'All three — with growth on top', target: 'o_grow' },
            ],
          },
        ],
      },
    },
  },
};

// Every scenario question gets a universal opt-out. target:null means it
// contributes nothing to diagnosis (see diagnose()). Idempotent.
for (const d of Object.values(DOMAINS)) {
  for (const intentId of ['assess', 'manage', 'optimize']) {
    for (const q of d.intents[intentId]?.questions ?? []) {
      if (!q.options.some(o => o.optOut)) {
        q.options.push({ text: 'Prefer not to answer', target: null, optOut: true });
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// HELPER EXPORTS
// ─────────────────────────────────────────────────────────────────────────

export const ARCHETYPES = ['stoic', 'alchemist', 'explorer', 'healer', 'monk', 'craftsman'];
export const TONES      = ['gentle', 'direct', 'poetic', 'pragmatic'];

export function getDomain(domainId) {
  return DOMAINS[domainId];
}

export function getDomainList() {
  // Explicit order: Body → Brain & Mind → Skills · Work → Relationships.
  const order = ['body', 'brain', 'skills', 'relationships'];
  return order
    .map(id => DOMAINS[id])
    .filter(d => d && d.enabled !== false)
    .map(d => ({ id: d.id, name: d.name, blurb: d.blurb }));
}

export function getIntents(domainId) {
  const d = DOMAINS[domainId];
  if (!d) return [];
  return ['assess', 'manage', 'optimize'].map(tier => ({
    tier,
    id: d.intents[tier].id,
    name: d.intents[tier].name,
    desc: d.intents[tier].desc,
  }));
}

export function getIntent(domainId, intentId) {
  return DOMAINS[domainId]?.intents[intentId];
}

export function getQuestions(domainId, intentId) {
  return DOMAINS[domainId]?.intents[intentId]?.questions ?? [];
}

export function getDestinations(domainId, intentId) {
  return DOMAINS[domainId]?.intents[intentId]?.destinations ?? [];
}

// Search the whole domain for a destination id (regardless of intent).
export function findDestination(domainId, destinationId) {
  const d = DOMAINS[domainId];
  if (!d) return null;
  for (const intentId of ['manage', 'optimize']) {
    const dest = d.intents[intentId]?.destinations?.find(x => x.id === destinationId);
    if (dest) return { ...dest, intent: intentId };
  }
  return null;
}

// answers: [{ questionIndex, optionIndex }]
// Sums option.target weights and returns the top destination across the
// intent's reachable set (for assess: across both manage + optimize).
export function diagnose(domainId, intentId, answers) {
  const intent = DOMAINS[domainId]?.intents[intentId];
  if (!intent) return null;
  const tally = {};
  for (const a of answers) {
    const q = intent.questions[a.questionIndex];
    const opt = q?.options[a.optionIndex];
    if (!opt || !opt.target) continue;
    tally[opt.target] = (tally[opt.target] || 0) + 1;
  }
  const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return null;
  const topId = ranked[0][0];
  const dest  = findDestination(domainId, topId);
  return {
    destinationId: topId,
    intent: dest?.intent,
    score: ranked[0][1],
    runnerUpId: ranked[1]?.[0] ?? null,
    runnerUpScore: ranked[1]?.[1] ?? 0,
    tally,
  };
}

// ── Legacy shims so existing call sites keep working ────────────────────
// "problem" used to mean a leaf node in the old schema. Now that role is
// played by "destination". These shims let app/page.js, the dashboard,
// activities, and constellation code continue to look things up the old
// way during migration.

export function getProblem(domainId, problemId) {
  return findDestination(domainId, problemId);
}

export function getAllProblems(domainId) {
  const d = DOMAINS[domainId];
  if (!d) return [];
  const out = [];
  for (const intentId of ['manage', 'optimize']) {
    for (const dest of d.intents[intentId]?.destinations ?? []) {
      out.push({ ...dest, intent: intentId });
    }
  }
  return out;
}

export function getFirstMessage(domainId, destinationId, archetypeId) {
  const dest = findDestination(domainId, destinationId);
  if (!dest) return '';
  const fm = dest.firstMessage;
  if (typeof fm === 'string') return fm;
  return fm?.[archetypeId] ?? '';
}

export function getActivities(domainId, destinationId) {
  return findDestination(domainId, destinationId)?.activities ?? [];
}

export function getQuoteTags(domainId, destinationId) {
  return findDestination(domainId, destinationId)?.quoteTags ?? [];
}

export function getHeroScene(domainId, destinationId) {
  return findDestination(domainId, destinationId)?.heroScene ?? 'who-stays';
}

export function getJourney(domainId, destinationId) {
  return findDestination(domainId, destinationId)?.journey;
}

export function getLearning(domainId, destinationId) {
  return findDestination(domainId, destinationId)?.learning ?? null;
}
