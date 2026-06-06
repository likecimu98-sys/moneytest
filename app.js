// Compiled from inline JSX. Keep Babel out of the browser runtime.
const _Fragment = React.Fragment;
const _jsx = (type, props, key) => {
  const config = props == null ? {} : {...props};
  if (key !== undefined) config.key = key;
  return React.createElement(type, config);
};
const _jsxs = _jsx;
const {
  useState,
  useEffect,
  useMemo,
  useRef
} = React;

// ── UTILS ──────────────────────────────────────────────────────────────────────
const localDateString = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseLocalDate = value => {
  const [y, m, d] = String(value || getTodayDate()).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const localDayIndex = value => parseLocalDate(value).getDay();
const getTodayDate = () => localDateString();
const todayObj = new Date();
const currentDay = todayObj.getDay() || 7;
const getDayDate = target => {
  const d = new Date(todayObj);
  d.setDate(todayObj.getDate() - currentDay + target);
  return localDateString(d);
};
const fmtDate = str => {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};
const DAYS_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const DAY_INDEXES = [1, 2, 3, 4, 5, 6, 0];
const SUBJECTS = ['История', 'Общество', 'Русский', 'Математика', 'Английский', 'Другое'];
const inferSubject = (text = '') => {
  const t = text.toLowerCase();
  if (t.includes('обществ')) return 'Общество';
  if (t.includes('истор')) return 'История';
  if (t.includes('рус')) return 'Русский';
  if (t.includes('мат')) return 'Математика';
  if (t.includes('англ')) return 'Английский';
  return 'История';
};
const subjectColor = subject => ({
  'История': '#446fd4',
  'Общество': '#8f762f',
  'Русский': '#b95757',
  'Математика': '#3f7d5b',
  'Английский': '#6f5ca8',
  'Другое': '#6f7378'
})[subject] || '#777';
const subjectTagText = () => '#fff';
const DEFAULT_RATE = 1500;
const sameId = (a, b) => a != null && b != null && String(a) === String(b);
const normalizeMoneyInput = (value, fallback = DEFAULT_RATE) => {
  if (String(value ?? '').trim() === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const GROUP_EMOJIS = ['рџ“љ', '✏пёЏ', 'рџЋЇ', 'рџ§ ', '⚡', 'рџЏ›пёЏ', 'рџљЂ', '⭐', 'рџЊї', 'рџ”Ґ'];
const randomGroupEmoji = () => GROUP_EMOJIS[Math.floor(Math.random() * GROUP_EMOJIS.length)];
const firstNameLetter = name => String(name || '').trim().charAt(0).toUpperCase();
const buildGroupAutoName = (ids = [], students = [], subject = 'Группа') => {
  const initials = ids.map(id => students.find(s => sameId(s.id, id))).filter(Boolean).map(s => firstNameLetter(s.name)).filter(Boolean).join('');
  return initials || subject || 'Группа';
};
const getGroupDisplayName = (group, students = []) => {
  if (!group) return '?';
  const name = String(group.name || '').trim();
  return name || buildGroupAutoName(group.studentIds || [], students, group.subject);
};

// ── AUTO-COMPLETE ──────────────────────────────────────────────────────────────
const runAutoCompletion = (cls, cst, cg, ctx) => {
  let updated = false;
  const now = new Date();
  let newL = [...cls],
    newS = [...cst],
    newT = [...ctx];
  newL = newL.map(lesson => {
    const end = new Date(`${lesson.date}T${lesson.time}`);
    end.setHours(end.getHours() + 1);
    if (lesson.status === 'planned' && end <= now) {
      updated = true;
      const grp = lesson.type === 'group' ? cg.find(g => sameId(g.id, lesson.targetId)) : null;
      const lsStudents = lesson.type === 'individual' ? [newS.find(s => sameId(s.id, lesson.targetId))].filter(Boolean) : grp?.studentIds.map(id => newS.find(s => sameId(s.id, id))).filter(Boolean) || [];
      const billableStudents = lsStudents.filter(s => !s.archived);
      const att = {};
      const packageUse = {};
      billableStudents.forEach(s => {
        att[s.id] = true;
        const i = newS.findIndex(st => st.id === s.id);
        if (i === -1) return;
        if ((newS[i].packageLessons || 0) > 0) {
          packageUse[s.id] = true;
          newS[i] = {
            ...newS[i],
            packageLessons: newS[i].packageLessons - 1
          };
        }
        const rate = grp?.rateOverrides?.[s.id] ?? s.rate;
        newT.push({
          id: Date.now() + Math.random(),
          studentId: s.id,
          type: 'charge',
          amount: rate,
          date: getTodayDate(),
          comment: packageUse[s.id] ? `Авто по абонементу: ${fmtDate(lesson.date)}` : `Авто: ${fmtDate(lesson.date)}`,
          lessonId: lesson.id,
          kind: 'attendance'
        });
        newS[i] = {
          ...newS[i],
          balance: newS[i].balance - rate
        };
      });
      return {
        ...lesson,
        status: 'completed',
        attendance: att,
        packageUse
      };
    }
    return lesson;
  });
  return updated ? {
    newLessons: newL,
    newStudents: newS,
    newTransactions: newT
  } : null;
};

// ── MOCK DATA ──────────────────────────────────────────────────────────────────
const mockStudents = [{
  id: 1,
  name: 'Вика',
  rate: 1300,
  phone: '+7 900 001',
  balance: 0
}, {
  id: 2,
  name: 'Алиса',
  rate: 1300,
  phone: '+7 900 002',
  balance: 0
}, {
  id: 3,
  name: 'Султан',
  rate: 1500,
  phone: '+7 900 003',
  balance: 0
}, {
  id: 4,
  name: 'Али',
  rate: 1500,
  phone: '+7 900 004',
  balance: 0
}, {
  id: 5,
  name: 'Андрей',
  rate: 1100,
  phone: '+7 900 005',
  balance: 0
}, {
  id: 6,
  name: 'Илья',
  rate: 1100,
  phone: '+7 900 006',
  balance: 0
}, {
  id: 7,
  name: 'Кирилл',
  rate: 1500,
  phone: '+7 900 007',
  balance: 0
}, {
  id: 8,
  name: 'Ярослав',
  rate: 1500,
  phone: '+7 900 008',
  balance: 0
}, {
  id: 9,
  name: 'Миша',
  rate: 1500,
  phone: '+7 900 009',
  balance: 0
}, {
  id: 10,
  name: 'Полина',
  rate: 1300,
  phone: '+7 900 010',
  balance: 0
}, {
  id: 11,
  name: 'Яна',
  rate: 1300,
  phone: '+7 900 011',
  balance: 0
}, {
  id: 12,
  name: 'Ирина',
  rate: 1100,
  phone: '+7 900 012',
  balance: 0
}, {
  id: 13,
  name: 'София',
  rate: 1000,
  phone: '+7 900 013',
  balance: 0
}, {
  id: 14,
  name: 'Временной',
  rate: 1000,
  phone: '+7 900 014',
  balance: 0
}, {
  id: 15,
  name: 'Марк',
  rate: 1300,
  phone: '+7 900 015',
  balance: 0
}, {
  id: 16,
  name: 'Анатолий',
  rate: 1300,
  phone: '+7 900 016',
  balance: 0
}];
const mockGroups = [{
  id: 1,
  name: 'История 10 (Вика, Алиса)',
  subject: 'История',
  studentIds: [1, 2]
}, {
  id: 2,
  name: 'История 10 (Султан, Али)',
  subject: 'История',
  studentIds: [3, 4]
}, {
  id: 3,
  name: 'Общество 10 (Султан, Андрей, Илья)',
  subject: 'Общество',
  studentIds: [3, 5, 6],
  rateOverrides: {
    3: 1100
  }
}, {
  id: 4,
  name: 'Общество 11 (Кирилл, Ярослав, Миша)',
  subject: 'Общество',
  studentIds: [7, 8, 9]
}, {
  id: 5,
  name: 'Общество 11 (Полина, Яна)',
  subject: 'Общество',
  studentIds: [10, 11]
}, {
  id: 6,
  name: 'История 10 (Андрей, Ирина, Илья)',
  subject: 'История',
  studentIds: [5, 12, 6]
}, {
  id: 7,
  name: 'Общество 9 (София, Временной)',
  subject: 'Общество',
  studentIds: [13, 14]
}, {
  id: 8,
  name: 'Общество 10 (Марк, Анатолий, Ирина)',
  subject: 'Общество',
  studentIds: [15, 16, 12]
}, {
  id: 9,
  name: 'История (Полина, Ярослав, Кирилл)',
  subject: 'История',
  studentIds: [10, 8, 7],
  rateOverrides: {
    10: 600,
    8: 1300,
    7: 1300
  }
}];
const mockLessons = [];
let lId = 1;
for (let w = 0; w < 12; w++) {
  const off = w * 7;
  [[1 + off, 4 + off], [2 + off, 5 + off], [3 + off, 6 + off]].forEach(([a, b], i) => {
    const configs = [[1, '15:00'], [2, '18:00'], [3, '16:30'], [4, '18:00'], [5, '15:00'], [6, '16:30'], [7, '16:30'], [8, '15:00'], [9, '18:00']];
    [[a, b]].flat().forEach(day => {
      const date = getDayDate(day);
      const isPast = date < getTodayDate();
      configs.slice(i * 3, i * 3 + 3).forEach(([tid, time]) => {
        const group = mockGroups.find(g => g.id === tid);
        mockLessons.push({
          id: lId++,
          type: 'group',
          targetId: tid,
          subject: group?.subject || inferSubject(group?.name),
          date,
          time,
          status: isPast ? 'completed' : 'planned'
        });
      });
    });
  });
}
const IRINA_PARENT_DEMO_SEED = 'irina-parent-rich-v1';
const IRINA_PARENT_DEMO_TOKEN = 'p_mpy6nf9a_9wy0oxmp';
const demoDateFromToday = offset => {
  const d = new Date(`${getTodayDate()}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return localDateString(d);
};
const seededTxDelta = tx => tx?.type === 'payment' ? Number(tx.amount || 0) : -Number(tx?.amount || 0);
const withRichIrinaDemoState = state => {
  if (!state?.students?.length) return state;
  if (state.settings?.irinaParentDemoSeed === IRINA_PARENT_DEMO_SEED) return state;
  const irina = state.students.find(s => sameId(s.id, 12) || String(s.name || '').trim() === 'Ирина');
  if (!irina) return state;
  const irinaId = irina.id;
  const seedLessonBase = 900000;
  const seedTxBase = 910000;
  const history = [{
    offset: -42,
    groupId: 6,
    time: '16:30',
    status: 'completed',
    homeworkStatus: 'done',
    topicsDelta: 2,
    assimilation: 76,
    topic: 'Российская империя после реформ Александра II',
    homework: 'Параграф 12, таблица по реформам, 8 заданий формата ЕГЭ.',
    comment: 'Ирина уверенно объяснила причины реформ, но в датах пока нужна тренировка.'
  }, {
    offset: -35,
    groupId: 8,
    time: '15:00',
    status: 'completed',
    homeworkStatus: 'partial',
    topicsDelta: 1,
    assimilation: 70,
    topic: 'Политическая система РФ',
    homework: 'Конспект по ветвям власти и задания 13-16.',
    comment: 'Теорию понимает, часть домашней работы была сделана не полностью.'
  }, {
    offset: -28,
    groupId: 6,
    time: '16:30',
    status: 'completed',
    homeworkStatus: 'done',
    topicsDelta: 2,
    assimilation: 82,
    topic: 'Первая русская революция',
    homework: 'Хронология событий 1905-1907, тест на 20 вопросов.',
    comment: 'Хороший урок: Ирина сама выстроила причинно-следственную цепочку.'
  }, {
    offset: -21,
    groupId: 8,
    time: '15:00',
    status: 'no_show',
    homeworkStatus: 'missed',
    topicsDelta: 0,
    assimilation: null,
    topic: 'Социальная стратификация',
    homework: 'Повторить термины и подготовить примеры.',
    comment: 'Урок пропущен, тему нужно закрыть на следующей встрече.'
  }, {
    offset: -14,
    groupId: 6,
    time: '16:30',
    status: 'completed',
    homeworkStatus: 'done',
    topicsDelta: 2,
    assimilation: 86,
    topic: 'Россия в Первой мировой войне',
    homework: 'Карта событий, задания по источнику, повторить даты.',
    comment: 'Сильный прогресс: ответы стали точнее, меньше потери баллов на формулировках.'
  }, {
    offset: -10,
    groupId: 8,
    time: '15:00',
    status: 'completed',
    homeworkStatus: 'partial',
    topicsDelta: 1,
    assimilation: 78,
    topic: 'Экономика: рынок и конкуренция',
    homework: 'Задания 1-8, термины по рынку, два мини-эссе.',
    comment: 'Основу усвоила, но примеры в заданиях второй части пока слабые.'
  }, {
    offset: -6,
    groupId: 6,
    time: '16:30',
    status: 'completed',
    homeworkStatus: 'done',
    topicsDelta: 2,
    assimilation: 88,
    topic: 'Февральская и Октябрьская революции',
    homework: 'Сравнить позиции партий, прорешать задания 17-19.',
    comment: 'Очень хороший разбор: Ирина стала увереннее в сравнении событий.'
  }, {
    offset: -2,
    groupId: 8,
    time: '15:00',
    status: 'completed',
    homeworkStatus: 'done',
    topicsDelta: 1,
    assimilation: 84,
    topic: 'Право: основы конституционного строя',
    homework: 'Повторить статьи Конституции, задания 14-16.',
    comment: 'Домашняя работа сделана аккуратно, ошибки в основном в терминологии.'
  }];
  const upcoming = [{
    offset: 2,
    groupId: 6,
    time: '16:30',
    topic: 'Гражданская война',
    homework: 'Подготовить хронологию и повторить причины победы большевиков.'
  }, {
    offset: 5,
    groupId: 8,
    time: '15:00',
    topic: 'Гражданское право',
    homework: 'Задания по договорам и правоспособности.'
  }, {
    offset: 9,
    groupId: 6,
    time: '16:30',
    topic: 'СССР в 1920-1930-е годы',
    homework: 'Таблица НЭП/индустриализация/коллективизация.'
  }, {
    offset: 12,
    groupId: 8,
    time: '15:00',
    topic: 'Семейное право',
    homework: 'Повторить права и обязанности супругов/родителей.'
  }];
  const makeLesson = (item, index, future = false) => {
    const group = state.groups.find(g => sameId(g.id, item.groupId));
    const peerIds = group?.studentIds || [];
    const attendance = peerIds.reduce((acc, id) => {
      acc[id] = item.status !== 'no_show' || !sameId(id, irinaId);
      return acc;
    }, {});
    return {
      id: seedLessonBase + index,
      demoSeed: IRINA_PARENT_DEMO_SEED,
      type: 'group',
      targetId: item.groupId,
      subject: group?.subject || inferSubject(group?.name),
      date: demoDateFromToday(item.offset),
      time: item.time,
      duration: 60,
      status: future ? 'planned' : item.status,
      topic: item.topic,
      homework: item.homework,
      lessonNote: future ? '' : item.comment,
      attendance: future ? {} : attendance,
      packageUse: {},
      homeworkStatusByStudent: future ? {} : {
        [irinaId]: item.homeworkStatus
      },
      parentLessonCommentByStudent: future ? {} : {
        [irinaId]: item.comment
      },
      progressByStudent: future ? {} : {
        [irinaId]: {
          topicsDelta: item.topicsDelta,
          assimilationPercent: item.assimilation
        }
      }
    };
  };
  const seededLessons = [...history.map((item, i) => makeLesson(item, i)), ...upcoming.map((item, i) => makeLesson(item, history.length + i, true))];
  const charges = history.map((item, index) => ({
    id: seedTxBase + index,
    demoSeed: IRINA_PARENT_DEMO_SEED,
    studentId: irinaId,
    type: 'charge',
    amount: 1100,
    date: demoDateFromToday(item.offset),
    comment: `${item.status === 'no_show' ? 'Пропуск' : 'Урок'}: ${item.topic}`,
    lessonId: seedLessonBase + index,
    kind: item.status === 'no_show' ? 'no_show' : 'attendance'
  }));
  const payments = [{
    id: seedTxBase + 100,
    demoSeed: IRINA_PARENT_DEMO_SEED,
    studentId: irinaId,
    type: 'payment',
    amount: 4400,
    date: demoDateFromToday(-37),
    comment: 'Оплата за 4 занятия'
  }, {
    id: seedTxBase + 101,
    demoSeed: IRINA_PARENT_DEMO_SEED,
    studentId: irinaId,
    type: 'payment',
    amount: 3300,
    date: demoDateFromToday(-11),
    comment: 'Оплата за 3 занятия'
  }];
  const nextLessons = [...(state.lessons || []).filter(l => l.demoSeed !== IRINA_PARENT_DEMO_SEED), ...seededLessons];
  const nextTxs = [...(state.txs || []).filter(tx => tx.demoSeed !== IRINA_PARENT_DEMO_SEED), ...charges, ...payments];
  const irinaBalance = nextTxs.filter(tx => sameId(tx.studentId, irinaId)).reduce((sum, tx) => sum + seededTxDelta(tx), 0);
  return {
    ...state,
    students: state.students.map(student => sameId(student.id, irinaId) ? {
      ...student,
      balance: irinaBalance,
      packageLessons: 0,
      subjects: ['История', 'Обществознание'],
      goal: student.goal || 'ЕГЭ: уверенно закрыть вторую часть и выйти на 80+ баллов.',
      notes: student.notes || 'Демо-профиль для проверки родительского кабинета.',
      parentPortal: {
        ...DEFAULT_PARENT_PORTAL,
        ...(student.parentPortal || {}),
        enabled: true,
        token: student.parentPortal?.token || IRINA_PARENT_DEMO_TOKEN,
        teacherComment: student.parentPortal?.teacherComment || 'Ирина стабильно занимается, прогресс заметен. Главный фокус сейчас: аккуратность формулировок и регулярное выполнение ДЗ.'
      },
      studyProgress: {
        subject: 'История и обществознание',
        totalTopics: 82,
        completedTopics: 51,
        assimilationPercent: 84,
        focus: 'Закрепляем право и экономику, параллельно добираем сложные темы по истории XX века.',
        mockTests: [{
          id: 'irina-mock-1',
          date: demoDateFromToday(-32),
          title: 'Пробник по истории',
          score: 54,
          maxScore: 100,
          comment: 'Слабее всего вторая часть и даты.'
        }, {
          id: 'irina-mock-2',
          date: demoDateFromToday(-18),
          title: 'Пробник по обществознанию',
          score: 68,
          maxScore: 100,
          comment: 'Хороший рост по теории, ошибки в примерах.'
        }, {
          id: 'irina-mock-3',
          date: demoDateFromToday(-4),
          title: 'Мини-пробник по праву',
          score: 78,
          maxScore: 100,
          comment: 'Тема стала заметно увереннее.'
        }]
      }
    } : student),
    lessons: nextLessons,
    txs: nextTxs,
    settings: {
      ...(state.settings || {}),
      irinaParentDemoSeed: IRINA_PARENT_DEMO_SEED
    }
  };
};
const STORAGE_KEY = 'tutor-app-state-v2';
const STORAGE_VERSION = 4;
const LESSON_STATUS = {
  planned: {
    label: 'План',
    short: 'ПЛАН',
    color: 'var(--blue)'
  },
  completed: {
    label: 'Проведен',
    short: '✓',
    color: 'var(--green)'
  },
  cancelled_by_student: {
    label: 'Отменил ученик',
    short: 'УЧ',
    color: '#a46a2b'
  },
  cancelled_by_tutor: {
    label: 'Отменил репетитор',
    short: 'РЕП',
    color: 'var(--text-sec)'
  },
  rescheduled: {
    label: 'Перенесен',
    short: 'ПЕР',
    color: '#6f5ca8'
  },
  no_show: {
    label: 'Неявка',
    short: 'НЯ',
    color: 'var(--red)'
  }
};
const HOMEWORK_STATUS = {
  unset: {
    label: 'Не отмечено',
    short: '—',
    tone: 'muted'
  },
  done: {
    label: 'Сделано',
    short: 'сделано',
    tone: 'good'
  },
  partial: {
    label: 'Частично',
    short: 'частично',
    tone: 'warn'
  },
  missed: {
    label: 'Не сделано',
    short: 'не сделано',
    tone: 'bad'
  },
  none: {
    label: 'Не задавалось',
    short: 'не было',
    tone: 'muted'
  }
};
const FINAL_STATUSES = ['completed', 'cancelled_by_student', 'cancelled_by_tutor', 'rescheduled', 'no_show'];
const isFinalLesson = lesson => FINAL_STATUSES.includes(lesson?.status);
const money = n => `${Number(n || 0).toLocaleString('ru-RU')} ₽`;
const cloneDemoState = () => withRichIrinaDemoState({
  students: mockStudents.map(s => ({
    ...s,
    subjects: ['История', 'Общество'],
    archived: false,
    packageLessons: 0,
    goal: '',
    notes: '',
    availabilityNotes: '',
    lessonRates: {},
    tgId: ''
  })),
  groups: mockGroups.map(g => ({
    ...g,
    subject: g.subject || 'История',
    studentIds: [...g.studentIds],
    rateOverrides: {
      ...(g.rateOverrides || {})
    },
    archived: false
  })),
  lessons: mockLessons.map(l => ({
    ...l,
    subject: l.subject || 'История',
    topic: '',
    homework: '',
    lessonNote: '',
    duration: 60,
    packageUse: {}
  })),
  txs: [],
  settings: {
    theme: 'light'
  }
});
const cloneEmptyState = () => ({
  students: [],
  groups: [],
  lessons: [],
  txs: [],
  settings: {
    theme: 'light'
  }
});
const loadSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const data = parsed.data || {};
    const groups = (data.groups || []).map(g => {
      const inferred = inferSubject(g.name);
      const subject = inferred !== 'История' ? inferred : g.subject || inferred;
      return {
        archived: false,
        subject,
        rateOverrides: {},
        ...g,
        subject
      };
    });
    const lessons = (data.lessons || []).map(l => {
      const group = l.type === 'group' ? groups.find(g => sameId(g.id, l.targetId)) : null;
      const lessonSubject = group?.subject || l.subject || inferSubject(group?.name);
      return {
        subject: lessonSubject,
        topic: '',
        homework: '',
        lessonNote: '',
        packageUse: {},
        duration: 60,
        ...l,
        subject: lessonSubject
      };
    });
    let students = (data.students || []).map(s => {
      const groupSubjects = groups.filter(g => g.studentIds?.some(id => sameId(id, s.id))).map(g => g.subject);
      const storedSubjects = s.subjects || (s.subject ? [s.subject] : []);
      const subjects = [...new Set([...storedSubjects, ...groupSubjects])];
      return {
        archived: false,
        packageLessons: 0,
        goal: '',
        notes: '',
        availabilityNotes: '',
        lessonRates: {},
        tgId: '',
        ...s,
        rate: normalizeMoneyInput(s.rate, DEFAULT_RATE),
        subjects: subjects.length ? subjects : ['История']
      };
    });
    let txs = data.txs || [];
    if (Number(parsed.version || 0) < 4) {
      const balanceAdjust = {};
      txs.forEach(tx => {
        if (tx.kind === 'package' && tx.type === 'payment') {
          balanceAdjust[tx.studentId] = (balanceAdjust[tx.studentId] || 0) + Number(tx.amount || 0);
        }
      });
      const migratedCharges = [];
      lessons.forEach(lesson => {
        if (lesson.status !== 'completed') return;
        Object.entries(lesson.packageUse || {}).forEach(([sid, used]) => {
          if (!used) return;
          const studentId = Number(sid);
          const student = students.find(s => sameId(s.id, studentId));
          if (!student) return;
          const alreadyCharged = txs.some(tx => tx.lessonId === lesson.id && sameId(tx.studentId, studentId) && tx.kind === 'attendance' && tx.type === 'charge');
          if (alreadyCharged) return;
          const amount = getLessonRate(lesson, student, groups);
          migratedCharges.push({
            id: `pkg-migrate-${lesson.id}-${studentId}`,
            studentId,
            type: 'charge',
            amount,
            date: lesson.date,
            comment: `Урок по абонементу: ${fmtDate(lesson.date)}`,
            lessonId: lesson.id,
            kind: 'attendance'
          });
          balanceAdjust[studentId] = (balanceAdjust[studentId] || 0) - amount;
        });
      });
      if (migratedCharges.length) txs = [...migratedCharges, ...txs];
      if (Object.keys(balanceAdjust).length) {
        students = students.map(s => balanceAdjust[s.id] ? {
          ...s,
          balance: Number(s.balance || 0) + balanceAdjust[s.id]
        } : s);
      }
    }
    return withRichIrinaDemoState({
      students,
      groups,
      lessons,
      txs,
      customTemplates: data.customTemplates || [],
      settings: {
        theme: 'light',
        ...(data.settings || {})
      }
    });
  } catch (e) {
    console.warn('Не удалось загрузить сохранение', e);
    return null;
  }
};
const saveState = data => {
  const savedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: STORAGE_VERSION,
    savedAt,
    data
  }));
  return savedAt;
};
const financeCore = window.TutorFinanceLogic;
const txDelta = financeCore.txDelta;
const getLessonSubject = (lesson, groups) => {
  if (lesson.subject) return lesson.subject;
  if (lesson.type === 'group') return groups.find(g => sameId(g.id, lesson.targetId))?.subject || 'История';
  return 'История';
};
const getLessonStudents = (lesson, students, groups, opts = {}) => {
  const group = lesson.type === 'group' ? groups.find(g => sameId(g.id, lesson.targetId)) : null;
  const list = lesson.type === 'individual' ? [students.find(s => sameId(s.id, lesson.targetId))].filter(Boolean) : group?.studentIds.map(id => students.find(s => sameId(s.id, id))).filter(Boolean) || [];
  return opts.includeArchived ? list : list.filter(s => !s.archived);
};
const omitRecordKey = (record, key) => {
  if (!record || typeof record !== 'object' || !(key in record)) return record;
  const next = {
    ...record
  };
  delete next[key];
  return next;
};
const stripStudentFromLesson = (lesson, studentId) => {
  const key = String(studentId);
  const nextAttendance = omitRecordKey(lesson.attendance, key);
  const nextPackageUse = omitRecordKey(lesson.packageUse, key);
  if (nextAttendance === lesson.attendance && nextPackageUse === lesson.packageUse) return lesson;
  return {
    ...lesson,
    attendance: nextAttendance,
    packageUse: nextPackageUse
  };
};
const getLessonRate = (lesson, student, groups) => {
  const group = lesson.type === 'group' ? groups.find(g => sameId(g.id, lesson.targetId)) : null;
  const groupOverride = group?.rateOverrides?.[student.id];
  if (groupOverride !== undefined) return groupOverride;
  // Subject-specific rate on student
  const subjectRate = student.lessonRates?.[lesson.subject];
  if (subjectRate !== undefined) return subjectRate;
  return student.rate;
};
const getStudentLastHomework = (studentId, lessons, groups) => lessons.filter(l => l.homework && (l.type === 'individual' ? sameId(l.targetId, studentId) : groups.find(g => sameId(g.id, l.targetId))?.studentIds.some(id => sameId(id, studentId)))).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))[0]?.homework || '';
const getStudentLessons = (studentId, lessons, groups) => lessons.filter(l => l.type === 'individual' ? sameId(l.targetId, studentId) : groups.find(g => sameId(g.id, l.targetId))?.studentIds.some(id => sameId(id, studentId)));
const getTxMeta = tx => {
  if (tx.kind === 'package') return {
    title: 'Абонемент',
    source: tx.packageLessons ? `${tx.packageLessons} зан.` : 'покупка пакета'
  };
  if (tx.kind === 'attendance') return {
    title: tx.type === 'payment' ? 'Возврат за урок' : 'Урок списан',
    source: 'автоматически из урока'
  };
  if (tx.kind === 'no_show') return {
    title: 'Неявка',
    source: 'списание за пропуск'
  };
  if (tx.type === 'payment') return {
    title: 'Оплата',
    source: 'ручное поступление'
  };
  return {
    title: 'Списание',
    source: 'ручная операция'
  };
};
const txSortKey = tx => `${tx.date || '0000-00-00'}-${String(tx.id || 0).padStart(14, '0')}`;
const getStudentFinanceSummary = (student, txs, lessons, groups) => {
  const ownTxs = txs.filter(tx => sameId(tx.studentId, student.id)).sort((a, b) => txSortKey(a).localeCompare(txSortKey(b)));
  const txSum = ownTxs.reduce((s, tx) => s + txDelta(tx), 0);
  const opening = Number(student.balance || 0) - txSum;
  let running = opening;
  const events = ownTxs.map(tx => {
    const delta = txDelta(tx);
    const before = running;
    running += delta;
    const meta = getTxMeta(tx);
    return {
      tx,
      delta,
      before,
      after: running,
      title: meta.title,
      source: meta.source,
      comment: tx.comment || meta.title
    };
  });
  const studentLessons = getStudentLessons(student.id, lessons, groups);
  const nextLesson = studentLessons.filter(l => l.status === 'planned' && l.date >= getTodayDate()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const nextRate = nextLesson ? getLessonRate(nextLesson, student, groups) : 0;
  const lastPayment = [...ownTxs].reverse().find(tx => tx.type === 'payment' && tx.kind !== 'attendance');
  const lastCharge = [...ownTxs].reverse().find(tx => tx.type === 'charge');
  const mismatch = Math.round((running - Number(student.balance || 0)) * 100) / 100;
  return {
    balance: Number(student.balance || 0),
    opening,
    calculatedBalance: running,
    mismatch,
    events: events.slice().reverse(),
    lastPayment,
    lastCharge,
    nextLesson,
    nextRate,
    hasHistory: ownTxs.length > 0 || opening !== 0
  };
};
const buildDebtParentMessage = (student, txs, lessons, groups) => {
  const finance = getStudentFinanceSummary(student, txs, lessons, groups);
  const debt = Math.abs(Math.min(0, Number(finance.balance || 0)));
  if (!debt) {
    return `Здравствуйте! По занятиям (${student.name}) долг сейчас не отображается.`;
  }
  const unpaid = [];
  let credit = Math.max(0, finance.opening);
  if (finance.opening < 0) {
    unpaid.push({
      date: '',
      title: 'остаток долга на начало учета',
      amount: Math.abs(finance.opening),
      originalAmount: Math.abs(finance.opening)
    });
  }
  finance.events.slice().reverse().forEach(ev => {
    if (ev.delta > 0) {
      let payment = ev.delta;
      while (payment > 0.01 && unpaid.length) {
        const first = unpaid[0];
        const used = Math.min(first.amount, payment);
        first.amount -= used;
        payment -= used;
        if (first.amount <= 0.01) unpaid.shift();
      }
      credit += payment;
      return;
    }
    if (ev.delta >= 0) return;
    let amount = Math.abs(ev.delta);
    const coveredByCredit = Math.min(credit, amount);
    credit -= coveredByCredit;
    amount -= coveredByCredit;
    if (amount <= 0.01) return;
    const meta = getTxMeta(ev.tx);
    unpaid.push({
      date: ev.tx.date || '',
      title: ev.tx.comment || meta.title,
      amount,
      originalAmount: Math.abs(ev.delta)
    });
  });
  let rows = unpaid.filter(row => row.amount > 0.5);
  const rowsSum = rows.reduce((sum, row) => sum + row.amount, 0);
  const diff = Math.round((debt - rowsSum) * 100) / 100;
  if (diff > 1) {
    rows = [{
      date: '',
      title: 'корректировка баланса без операции в журнале',
      amount: diff,
      originalAmount: diff
    }, ...rows];
  }
  const olderRows = rows.length > 6 ? rows.slice(0, rows.length - 6) : [];
  const visibleRows = rows.length > 6 ? rows.slice(-6) : rows;
  const olderAmount = olderRows.reduce((sum, row) => sum + row.amount, 0);
  const lineFor = row => {
    const date = row.date ? `${fmtDate(row.date)}: ` : '';
    const partial = Math.abs(row.amount - row.originalAmount) > 1 ? ` осталось ${money(row.amount)} из ${money(row.originalAmount)}` : money(row.amount);
    return `- ${date}${row.title} - ${partial}`;
  };
  const debtLines = [olderAmount > 0 ? `- более ранние неоплаченные списания - ${money(olderAmount)}` : null, ...visibleRows.map(lineFor)].filter(Boolean);
  const lastPayment = finance.events.find(ev => ev.delta > 0 && ev.tx.type === 'payment' && ev.tx.kind !== 'attendance');
  const lastPaymentText = lastPayment ? `\n\nПоследняя учтенная оплата: ${fmtDate(lastPayment.tx.date)} на ${money(lastPayment.tx.amount)}.` : '';
  return `Здравствуйте! По занятиям (${student.name}) сейчас долг ${money(debt)}.\n\nКак он сложился:\n${debtLines.join('\n') || '- в журнале нет подробных операций, долг записан в балансе ученика'}${lastPaymentText}\n\nИтого к оплате: ${money(debt)}.\nЕсли где-то у меня не учтена оплата, напишите, пожалуйста, сверю журнал.`;
};
const DEFAULT_PARENT_PORTAL = {
  enabled: false,
  token: '',
  showFinance: true,
  showHomework: true,
  showProgress: true,
  showSchedule: true,
  showPayments: true,
  allowPaymentNotice: true,
  paymentNotices: [],
  teacherComment: ''
};
const getParentPortalSettings = student => ({
  ...DEFAULT_PARENT_PORTAL,
  ...(student?.parentPortal || {})
});
const createParentPortalToken = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
const parentPortalUrl = token => `${window.location.origin}${window.location.pathname}?parent=${encodeURIComponent(token)}`;
const copyTextSafe = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const a = document.createElement('textarea');
    a.value = text;
    document.body.appendChild(a);
    a.select();
    document.execCommand('copy');
    a.remove();
    return true;
  }
};
const getLessonStudentValue = (lesson, field, studentId, fallback = '') => {
  const map = lesson?.[field] || {};
  const direct = map?.[studentId] ?? map?.[String(studentId)];
  return direct ?? fallback;
};
const getLessonHomeworkStatusForStudent = (lesson, studentId) => getLessonStudentValue(lesson, 'homeworkStatusByStudent', studentId, lesson?.homeworkStatus || 'unset') || 'unset';
const getLessonParentCommentForStudent = (lesson, studentId) => getLessonStudentValue(lesson, 'parentLessonCommentByStudent', studentId, lesson?.parentLessonComment || '') || '';
const withStudentLessonMeta = (lesson, studentId) => ({
  ...lesson,
  homeworkStatus: getLessonHomeworkStatusForStudent(lesson, studentId),
  parentLessonComment: getLessonParentCommentForStudent(lesson, studentId)
});
const clampPercent = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
};
const clampCount = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n));
};
const getStudyProgress = student => {
  const raw = student?.studyProgress || {};
  const totalTopics = clampCount(raw.totalTopics);
  const completedTopics = Math.min(totalTopics || clampCount(raw.completedTopics), clampCount(raw.completedTopics));
  const mockTests = Array.isArray(raw.mockTests) ? raw.mockTests.map(test => ({
    id: test.id || Date.now() + Math.random(),
    date: test.date || getTodayDate(),
    title: test.title || 'Пробник',
    score: clampCount(test.score),
    maxScore: Math.max(1, clampCount(test.maxScore || 100)),
    comment: test.comment || ''
  })).slice(0, 24) : [];
  return {
    subject: raw.subject || student?.subjects?.[0] || 'Предмет',
    totalTopics,
    completedTopics,
    assimilationPercent: raw.assimilationPercent === '' || raw.assimilationPercent == null ? null : clampPercent(raw.assimilationPercent),
    focus: raw.focus || '',
    mockTests
  };
};
const studyTheoryPercent = progress => progress?.totalTopics ? clampPercent(progress.completedTopics / progress.totalTopics * 100) : null;
const mockTestPercent = test => test?.maxScore ? clampPercent(test.score / test.maxScore * 100) : null;
const latestMockTest = progress => (progress?.mockTests || []).slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0] || null;
const averageMockPercent = progress => {
  const rows = progress?.mockTests || [];
  if (!rows.length) return null;
  return clampPercent(rows.reduce((sum, test) => sum + mockTestPercent(test), 0) / rows.length);
};
const getLessonProgressEntry = (map, studentId) => map?.[studentId] ?? map?.[String(studentId)] ?? {};
const normalizeLessonProgressEntry = entry => {
  const rawAssimilation = entry?.assimilationPercent;
  return {
    topicsDelta: clampCount(entry?.topicsDelta),
    assimilationPercent: rawAssimilation === '' || rawAssimilation == null ? null : clampPercent(rawAssimilation)
  };
};
const applyLessonStudyProgressState = (students, oldProgressByStudent = {}, nextProgressByStudent = {}, attendance = {}) => students.map(student => {
  const current = getStudyProgress(student);
  const oldEntry = normalizeLessonProgressEntry(getLessonProgressEntry(oldProgressByStudent, student.id));
  const nextEntry = attendance?.[student.id] === false ? {
    topicsDelta: 0,
    assimilationPercent: null
  } : normalizeLessonProgressEntry(getLessonProgressEntry(nextProgressByStudent, student.id));
  const completedTopics = Math.max(0, current.completedTopics - oldEntry.topicsDelta + nextEntry.topicsDelta);
  const totalTopics = current.totalTopics;
  return {
    ...student,
    studyProgress: {
      ...current,
      completedTopics: totalTopics ? Math.min(totalTopics, completedTopics) : completedTopics,
      assimilationPercent: nextEntry.assimilationPercent == null ? current.assimilationPercent : nextEntry.assimilationPercent
    }
  };
});
const buildParentPortalPayload = (student, students, groups, lessons, txs) => {
  const portal = getParentPortalSettings(student);
  const studyProgress = getStudyProgress(student);
  const ownLessons = getStudentLessons(student.id, lessons, groups, {
    includeArchived: true
  }).map(l => withStudentLessonMeta(l, student.id)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const completed = ownLessons.filter(l => l.status === 'completed' || l.status === 'no_show');
  const planned = ownLessons.filter(l => l.status === 'planned' && l.date >= getTodayDate()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const homeworkLessons = ownLessons.filter(l => l.homework).slice(0, 8);
  const parentComments = completed.filter(l => l.parentLessonComment).slice(0, 5);
  const homeworkStatusLessons = completed.filter(l => l.homeworkStatus && l.homeworkStatus !== 'unset').slice(0, 8);
  const homeworkTotal = homeworkStatusLessons.filter(l => l.homeworkStatus !== 'none').length;
  const homeworkScore = homeworkStatusLessons.reduce((sum, l) => sum + (l.homeworkStatus === 'done' ? 1 : l.homeworkStatus === 'partial' ? .5 : 0), 0);
  const homeworkStats = homeworkStatusLessons.reduce((acc, l) => {
    const key = HOMEWORK_STATUS[l.homeworkStatus] ? l.homeworkStatus : 'unset';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {
    done: 0,
    partial: 0,
    missed: 0,
    none: 0,
    unset: 0
  });
  homeworkStats.total = homeworkTotal;
  homeworkStats.rate = homeworkTotal ? Math.round(homeworkScore / homeworkTotal * 100) : null;
  const attendanceNoShow = completed.filter(l => l.status === 'no_show' || l.attendance?.[student.id] === false).length;
  const attendanceDone = completed.length - attendanceNoShow;
  const attendanceStats = {
    total: completed.length,
    done: attendanceDone,
    noShow: attendanceNoShow,
    rate: completed.length ? Math.round(attendanceDone / completed.length * 100) : null
  };
  const subjectMap = {};
  completed.forEach(l => {
    const subject = getLessonSubject(l, groups);
    if (!subjectMap[subject]) subjectMap[subject] = {
      subject,
      lessons: 0,
      done: 0,
      avg: 0,
      ratings: []
    };
    subjectMap[subject].lessons += 1;
    if (l.rating) subjectMap[subject].ratings.push(l.rating);
    if (l.status === 'completed') subjectMap[subject].done += 1;
  });
  const progress = Object.values(subjectMap).map(row => ({
    ...row,
    avg: row.ratings.length ? row.ratings.reduce((s, v) => s + v, 0) / row.ratings.length : 0
  })).sort((a, b) => b.lessons - a.lessons);
  return {
    portal,
    finance: getStudentFinanceSummary(student, txs, lessons, groups),
    nextLessons: planned.slice(0, 5),
    recentLessons: completed.slice(0, 6),
    parentComments,
    homeworkLessons,
    homeworkStatusLessons,
    homeworkStats,
    homeworkDoneRate: homeworkTotal ? Math.round(homeworkScore / homeworkTotal * 100) : null,
    attendanceStats,
    studyProgress,
    theoryPercent: studyTheoryPercent(studyProgress),
    assimilationPercent: studyProgress.assimilationPercent,
    latestMock: latestMockTest(studyProgress),
    mockAveragePercent: averageMockPercent(studyProgress),
    progress
  };
};
const balanceLabel = balance => balance < 0 ? `долг ${money(Math.abs(balance))}` : balance > 0 ? `предоплата ${money(balance)}` : 'закрыто';
const balanceColor = balance => balance < 0 ? 'var(--red)' : balance > 0 ? 'var(--green)' : 'var(--black)';
const timeToMin = time => {
  const [h, m] = String(time || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const minToTime = min => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const dateMs = date => new Date(`${date}T00:00:00`).getTime();
const dateDiffDays = (from, to) => Math.round((dateMs(to) - dateMs(from)) / 86400000);
const shiftDate = (date, days) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateString(d);
};
const lessonDateTimeKey = lesson => `${lesson?.date || '0000-00-00'}T${lesson?.time || '00:00'}`;
const sameSeriesSlot = (lesson, source) => {
  if (!lesson?.seriesId || !source?.seriesId || lesson.seriesId !== source.seriesId) return false;
  const lessonDay = new Date(`${lesson.date}T00:00:00`).getDay();
  const sourceDay = new Date(`${source.date}T00:00:00`).getDay();
  return lesson.time === source.time && lessonDay === sourceDay;
};
const sameRecurringSlot = (lesson, source) => {
  if (!lesson || !source) return false;
  if (sameSeriesSlot(lesson, source)) return true;
  if (lesson.seriesId || source.seriesId) return false;
  const lessonDay = new Date(`${lesson.date}T00:00:00`).getDay();
  const sourceDay = new Date(`${source.date}T00:00:00`).getDay();
  return lesson.type === source.type && sameId(lesson.targetId, source.targetId) && lesson.time === source.time && lessonDay === sourceDay;
};
const lessonRange = lesson => {
  const start = timeToMin(lesson.time);
  return {
    start,
    end: start + Number(lesson.duration || 60)
  };
};
const rangesOverlap = (a, b) => a.start < b.end && b.start < a.end;
const lessonParticipantIds = (lesson, students, groups) => getLessonStudents(lesson, students, groups, {
  includeArchived: true
}).map(s => s.id);
const findLessonConflicts = (candidate, lessons, students, groups, ignoreId = null) => {
  const ids = lessonParticipantIds(candidate, students, groups);
  if (!ids.length || !candidate.date || !candidate.time) return [];
  const range = lessonRange(candidate);
  return lessons.filter(l => l.id !== ignoreId && l.status === 'planned' && l.date === candidate.date).filter(l => {
    if (!rangesOverlap(range, lessonRange(l))) return false;
    const otherIds = lessonParticipantIds(l, students, groups);
    return ids.some(id => otherIds.includes(id));
  });
};
const conflictText = (conflicts, groups, students) => conflicts.map(l => {
  const name = l.type === 'group' ? getGroupDisplayName(groups.find(g => sameId(g.id, l.targetId)), students) || 'Группа' : students.find(s => sameId(s.id, l.targetId))?.name || 'Ученик';
  return `${fmtDate(l.date)} ${l.time} · ${name}`;
}).join('\n');
const parseAvailability = text => {
  const days = {
    '\u043f\u043d': 1,
    '\u0432\u0442': 2,
    '\u0441\u0440': 3,
    '\u0447\u0442': 4,
    '\u043f\u0442': 5,
    '\u0441\u0431': 6,
    '\u0432\u0441': 0
  };
  const result = [];
  String(text || '').split(/\n+/).forEach(line => {
    const lower = line.trim().toLowerCase();
    const dayKey = Object.keys(days).find(d => lower.startsWith(d));
    if (!dayKey) return;
    const times = [...lower.matchAll(/(\d{1,2}):?(\d{2})?\s*[-–—]\s*(\d{1,2}):?(\d{2})?/g)];
    times.forEach(m => {
      const start = Number(m[1]) * 60 + Number(m[2] || 0);
      const end = Number(m[3]) * 60 + Number(m[4] || 0);
      if (end > start) result.push({
        day: days[dayKey],
        start,
        end
      });
    });
  });
  return result;
};
const commonAvailability = members => {
  const parsed = members.map(s => parseAvailability(s.availabilityNotes));
  if (!parsed.length || parsed.some(list => !list.length)) return [];
  let common = parsed[0];
  parsed.slice(1).forEach(list => {
    common = common.flatMap(a => list.filter(b => a.day === b.day).map(b => ({
      day: a.day,
      start: Math.max(a.start, b.start),
      end: Math.min(a.end, b.end)
    }))).filter(x => x.end - x.start >= 45);
  });
  return common.sort((a, b) => a.day - b.day || a.start - b.start).slice(0, 8);
};
const nextDateForDow = day => {
  const d = new Date();
  const current = d.getDay();
  d.setDate(d.getDate() + (day - current + 7) % 7);
  return localDateString(d);
};
const DAY_FULL = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  0: 'Вс'
};

// ── ICONS ──────────────────────────────────────────────────────────────────────
const Ico = ({
  p,
  children,
  size = 22,
  cls = '',
  sw = 2
}) => _jsx("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: sw,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: cls,
  children: p ? _jsx("path", {
    d: p
  }) : children
});
const IcoHome = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
  }), _jsx("polyline", {
    points: "9 22 9 12 15 12 15 22"
  })]
});
const IcoCal = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), _jsx("line", {
    x1: "16",
    y1: "2",
    x2: "16",
    y2: "6"
  }), _jsx("line", {
    x1: "8",
    y1: "2",
    x2: "8",
    y2: "6"
  }), _jsx("line", {
    x1: "3",
    y1: "10",
    x2: "21",
    y2: "10"
  })]
});
const IcoUsers = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
  }), _jsx("circle", {
    cx: "9",
    cy: "7",
    r: "4"
  }), _jsx("path", {
    d: "M23 21v-2a4 4 0 0 0-3-3.87"
  }), _jsx("path", {
    d: "M16 3.13a4 4 0 0 1 0 7.75"
  })]
});
const IcoWallet = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M21 12V7H5a2 2 0 0 1 0-4h14v4"
  }), _jsx("path", {
    d: "M3 5v14a2 2 0 0 0 2 2h16v-5"
  }), _jsx("path", {
    d: "M18 12a2 2 0 0 0 0 4h4v-4Z"
  })]
});
const IcoPlus = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("line", {
    x1: "12",
    y1: "5",
    x2: "12",
    y2: "19"
  }), _jsx("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  })]
});
const IcoX = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), _jsx("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  })]
});
const IcoEdit = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
  }), _jsx("path", {
    d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"
  })]
});
const IcoTrash = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("polyline", {
    points: "3 6 5 6 21 6"
  }), _jsx("path", {
    d: "M19 6l-1 14H6L5 6"
  }), _jsx("path", {
    d: "M10 11v6M14 11v6M9 6V4h6v2"
  })]
});
const IcoPhone = p => _jsx(Ico, {
  p: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.7 12.34 19.79 19.79 0 0 1 1.61 3.72 2 2 0 0 1 3.59 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.26a16 16 0 0 0 6.21 6.21l1.62-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  ...p
});
const IcoCheck = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M22 11.08V12a10 10 0 1 1-5.93-9.14"
  }), _jsx("polyline", {
    points: "22 4 12 14.01 9 11.01"
  })]
});
const IcoPlay = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), _jsx("polygon", {
    points: "10 8 16 12 10 16 10 8"
  })]
});
const IcoChevL = p => _jsx(Ico, {
  ...p,
  children: _jsx("polyline", {
    points: "15 18 9 12 15 6"
  })
});
const IcoChevR = p => _jsx(Ico, {
  ...p,
  children: _jsx("polyline", {
    points: "9 18 15 12 9 6"
  })
});
const IcoRepeat = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("polyline", {
    points: "17 1 21 5 17 9"
  }), _jsx("path", {
    d: "M3 11V9a4 4 0 0 1 4-4h14"
  }), _jsx("polyline", {
    points: "7 23 3 19 7 15"
  }), _jsx("path", {
    d: "M21 13v2a4 4 0 0 1-4 4H3"
  })]
});
const IcoSearch = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), _jsx("line", {
    x1: "21",
    y1: "21",
    x2: "16.65",
    y2: "16.65"
  })]
});
const IcoBook = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("path", {
    d: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
  }), _jsx("path", {
    d: "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
  })]
});
const IcoPrint = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("polyline", {
    points: "6 9 6 2 18 2 18 9"
  }), _jsx("path", {
    d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
  }), _jsx("rect", {
    x: "6",
    y: "14",
    width: "12",
    height: "8"
  })]
});
const IcoLightbulb = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("line", {
    x1: "9",
    y1: "18",
    x2: "15",
    y2: "18"
  }), _jsx("line", {
    x1: "10",
    y1: "22",
    x2: "14",
    y2: "22"
  }), _jsx("path", {
    d: "M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"
  })]
});

// ── DEFAULT MESSAGE TEMPLATES ───────────────────────────────────────────────────
const IcoMoon = p => _jsx(Ico, {
  p: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  ...p
});
const IcoSun = p => _jsxs(Ico, {
  ...p,
  children: [_jsx("circle", {
    cx: "12",
    cy: "12",
    r: "4"
  }), _jsx("line", {
    x1: "12",
    y1: "2",
    x2: "12",
    y2: "4"
  }), _jsx("line", {
    x1: "12",
    y1: "20",
    x2: "12",
    y2: "22"
  }), _jsx("line", {
    x1: "4.93",
    y1: "4.93",
    x2: "6.34",
    y2: "6.34"
  }), _jsx("line", {
    x1: "17.66",
    y1: "17.66",
    x2: "19.07",
    y2: "19.07"
  }), _jsx("line", {
    x1: "2",
    y1: "12",
    x2: "4",
    y2: "12"
  }), _jsx("line", {
    x1: "20",
    y1: "12",
    x2: "22",
    y2: "12"
  }), _jsx("line", {
    x1: "4.93",
    y1: "19.07",
    x2: "6.34",
    y2: "17.66"
  }), _jsx("line", {
    x1: "17.66",
    y1: "6.34",
    x2: "19.07",
    y2: "4.93"
  })]
});
const DEFAULT_TEMPLATES = [{
  id: 'reminder',
  name: 'Напоминание',
  body: 'Привет! Напоминаю: занятие {lessonDate}.'
}, {
  id: 'debt',
  name: 'Долг',
  body: 'Привет! По занятиям сейчас долг {balance}. Когда удобно будет оплатить?'
}, {
  id: 'homework',
  name: 'Домашка',
  body: 'Привет! Домашка к следующему занятию: {homework}.'
}, {
  id: 'reschedule',
  name: 'Перенос',
  body: 'Привет! Нужно перенести занятие {lessonDate}. Напиши, пожалуйста, когда удобно.'
}];
const renderTemplate = (body, student, targetLesson, lastHomework) => {
  const lessonText = targetLesson ? `${fmtDate(targetLesson.date)} в ${targetLesson.time}` : 'ближайшее занятие';
  return (body || '').replace(/\{name\}/g, student?.name || '').replace(/\{lessonDate\}/g, lessonText).replace(/\{balance\}/g, money(Math.abs(student?.balance || 0))).replace(/\{homework\}/g, lastHomework || 'пока не записана');
};
const IcoTg = ({
  size = 22
}) => _jsx("svg", {
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  children: _jsx("path", {
    d: "M21.8 2.4a1.5 1.5 0 0 0-1.7-.3L2.6 9.4a1.5 1.5 0 0 0 .1 2.8l4.2 1.3 1.6 5a1.5 1.5 0 0 0 2.4.6l2.3-2.1 4.3 3.2a1.5 1.5 0 0 0 2.3-1l2.5-15a1.5 1.5 0 0 0-.5-1.8z",
    fill: "currentColor"
  })
});

// ── UNDO TOAST ──────────────────────────────────────────────────────────────────
function UndoToast({
  pendingUndo,
  onUndo
}) {
  if (!pendingUndo) return null;
  return _jsxs("div", {
    style: {
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'var(--ink)',
      color: '#fffdf2',
      border: '2.5px solid var(--ink)',
      borderRadius: 4,
      boxShadow: '4px 4px 0 rgba(0,0,0,.4)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 14px',
      fontFamily: 'Martian Mono,monospace',
      fontSize: 12,
      maxWidth: 340,
      width: 'calc(100% - 32px)',
      animation: 'slideDown .2s ease'
    },
    children: [_jsx("span", {
      style: {
        flex: 1
      },
      children: pendingUndo.label
    }), _jsx("button", {
      onClick: onUndo,
      style: {
        background: 'var(--yellow)',
        color: 'var(--black)',
        border: 'none',
        borderRadius: 3,
        padding: '6px 12px',
        fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0
      },
      children: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"
    })]
  });
}
function EmptyState({
  title,
  text,
  action,
  onAction,
  secondary,
  onSecondary
}) {
  return _jsxs("div", {
    className: "empty-state",
    children: [_jsx("div", {
      className: "empty-state-title",
      children: title
    }), _jsx("div", {
      className: "empty-state-text",
      children: text
    }), _jsxs("div", {
      style: {
        display: 'flex',
        gap: 8,
        justifyContent: 'center',
        flexWrap: 'wrap'
      },
      children: [action && _jsx("button", {
        className: "btn btn-sm btn-black",
        onClick: onAction,
        children: action
      }), secondary && _jsx("button", {
        className: "btn btn-sm btn-white",
        onClick: onSecondary,
        children: secondary
      })]
    })]
  });
}

// ── SWIPE HOOK ─────────────────────────────────────────────────────────────────
const useSwipe = (onLeft, onRight, threshold = 60) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let sx = 0,
      sy = 0;
    const ts = e => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const te = e => {
      const dx = e.changedTouches[0].clientX - sx,
        dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > threshold && Math.abs(dy) < Math.abs(dx) * 0.6) {
        if (dx < 0 && onLeft) onLeft();
        if (dx > 0 && onRight) onRight();
      }
    };
    el.addEventListener('touchstart', ts, {
      passive: true
    });
    el.addEventListener('touchend', te, {
      passive: true
    });
    return () => {
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchend', te);
    };
  }, [onLeft, onRight]);
  return ref;
};

// ── SEARCH COMPONENT ───────────────────────────────────────────────────────────
function SearchModal({
  students,
  groups,
  lessons,
  onClose,
  onOpenStudent,
  onOpenGroup,
  onOpenLesson
}) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    const fn = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  const lq = q.toLowerCase().trim();
  const rStudents = lq ? students.filter(s => s.name.toLowerCase().includes(lq)).slice(0, 5) : [];
  const rGroups = lq ? groups.filter(g => getGroupDisplayName(g, students).toLowerCase().includes(lq)).slice(0, 4) : [];
  const rLessons = lq ? lessons.filter(l => (l.topic || '').toLowerCase().includes(lq) || (l.homework || '').toLowerCase().includes(lq)).slice(0, 4) : [];
  const hasResults = rStudents.length || rGroups.length || rLessons.length;
  return _jsxs(_Fragment, {
    children: [_jsx("div", {
      className: "search-overlay",
      onClick: onClose
    }), _jsxs("div", {
      className: "search-panel",
      children: [_jsxs("div", {
        style: {
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        },
        children: [_jsx(IcoSearch, {
          size: 18
        }), _jsx("input", {
          ref: inputRef,
          className: "input",
          value: q,
          onChange: e => setQ(e.target.value),
          placeholder: "\u041F\u043E\u0438\u0441\u043A \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432, \u0433\u0440\u0443\u043F\u043F, \u0442\u0435\u043C...",
          style: {
            boxShadow: 'none',
            border: 'none',
            flex: 1,
            padding: '8px 0'
          }
        }), _jsx("button", {
          onClick: onClose,
          style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          },
          children: _jsx(IcoX, {
            size: 18
          })
        })]
      }), lq && _jsxs("div", {
        style: {
          maxHeight: 360,
          overflowY: 'auto',
          marginTop: 8
        },
        children: [rStudents.length > 0 && _jsxs(_Fragment, {
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 9,
              fontWeight: 900,
              padding: '6px 0',
              color: 'var(--text-sec)',
              textTransform: 'uppercase'
            },
            children: "\u0423\u0447\u0435\u043D\u0438\u043A\u0438"
          }), rStudents.map(s => _jsxs("div", {
            className: "search-result",
            onClick: () => {
              onOpenStudent(s);
              onClose();
            },
            children: [_jsx(IcoUsers, {
              size: 15
            }), _jsxs("div", {
              children: [_jsx("div", {
                style: {
                  fontWeight: 700,
                  fontSize: 13
                },
                children: s.name
              }), _jsxs("div", {
                style: {
                  fontSize: 10,
                  color: 'var(--text-sec)'
                },
                children: [money(s.rate), "/\u0443\u0440\u043E\u043A"]
              })]
            })]
          }, s.id))]
        }), rGroups.length > 0 && _jsxs(_Fragment, {
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 9,
              fontWeight: 900,
              padding: '6px 0',
              color: 'var(--text-sec)',
              textTransform: 'uppercase'
            },
            children: "\u0413\u0440\u0443\u043F\u043F\u044B"
          }), rGroups.map(g => _jsxs("div", {
            className: "search-result",
            onClick: () => {
              onOpenGroup(g);
              onClose();
            },
            children: [_jsx(IcoBook, {
              size: 15
            }), _jsxs("div", {
              style: {
                fontWeight: 700,
                fontSize: 13
              },
              children: [g.emoji || '', " ", getGroupDisplayName(g, students)]
            })]
          }, g.id))]
        }), rLessons.length > 0 && _jsxs(_Fragment, {
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 9,
              fontWeight: 900,
              padding: '6px 0',
              color: 'var(--text-sec)',
              textTransform: 'uppercase'
            },
            children: "\u0423\u0440\u043E\u043A\u0438 (\u043F\u043E \u0442\u0435\u043C\u0435)"
          }), rLessons.map(l => _jsxs("div", {
            className: "search-result",
            onClick: () => {
              onOpenLesson(l);
              onClose();
            },
            children: [_jsx(IcoCal, {
              size: 15
            }), _jsxs("div", {
              children: [_jsx("div", {
                style: {
                  fontWeight: 700,
                  fontSize: 12
                },
                children: l.topic || l.homework
              }), _jsxs("div", {
                style: {
                  fontSize: 10,
                  color: 'var(--text-sec)'
                },
                children: [fmtDate(l.date), " \xB7 ", l.time]
              })]
            })]
          }, l.id))]
        }), !hasResults && _jsx("div", {
          style: {
            padding: 20,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 12
          },
          children: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E"
        })]
      })]
    })]
  });
}

// ── TIMER BANNER ───────────────────────────────────────────────────────────────
function TimerBanner({
  lesson,
  name,
  onAttend
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const start = new Date(`${lesson.date}T${lesson.time}`).getTime();
  const end = start + (lesson.duration || 60) * 60000;
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  const remaining = Math.max(0, Math.ceil((end - now) / 60000));
  return _jsxs("div", {
    className: "timer-banner timer-pulse",
    children: [_jsxs("div", {
      style: {
        flex: 1
      },
      children: [_jsxs("div", {
        style: {
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontSize: 11,
          fontWeight: 900
        },
        children: ["\u0418\u0434\u0451\u0442 \u0443\u0440\u043E\u043A: ", name]
      }), _jsxs("div", {
        style: {
          fontSize: 12,
          marginTop: 4
        },
        children: ["\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C ", remaining, " \u043C\u0438\u043D"]
      }), _jsx("div", {
        className: "timer-bar",
        style: {
          marginTop: 6
        },
        children: _jsx("div", {
          className: "timer-fill",
          style: {
            width: `${progress * 100}%`
          }
        })
      })]
    }), _jsx("button", {
      className: "btn btn-sm btn-black",
      onClick: onAttend,
      children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C"
    })]
  });
}

// ── NOTIFICATION GENERATOR ─────────────────────────────────────────────────────
const generateNotifications = (lessons, students, groups) => {
  const notifs = [];
  const now = new Date();
  const today = localDateString();
  // Upcoming lesson in 15 min
  lessons.filter(l => l.status === 'planned' && l.date === today).forEach(l => {
    const t = new Date(`${l.date}T${l.time}`);
    const diff = (t - now) / 60000;
    if (diff > 0 && diff <= 15) notifs.push({
      id: 'soon_' + l.id,
      icon: '⏰',
      text: `Урок через ${Math.ceil(diff)} мин`,
      sub: l.time
    });
  });
  // Debtors > 2 lessons worth
  students.filter(s => !s.archived && s.balance < -s.rate * 2).forEach(s => {
    notifs.push({
      id: 'debt_' + s.id,
      icon: 'рџ’ё',
      text: `${s.name}: долг ${money(Math.abs(s.balance))}`,
      sub: 'Большая задолженность'
    });
  });
  // Package ending
  students.filter(s => !s.archived && (s.packageLessons || 0) === 1).forEach(s => {
    notifs.push({
      id: 'pkg_' + s.id,
      icon: 'рџ“¦',
      text: `${s.name}: абонемент заканчивается`,
      sub: 'Остался 1 урок'
    });
  });
  // Tomorrow lessons count
  const tmrw = new Date(now);
  tmrw.setDate(tmrw.getDate() + 1);
  const tmrwStr = localDateString(tmrw);
  const tmrwCount = lessons.filter(l => l.date === tmrwStr && l.status === 'planned').length;
  if (tmrwCount > 0) notifs.push({
    id: 'tmrw',
    icon: 'рџ“…',
    text: `Завтра ${tmrwCount} урок(ов)`,
    sub: ''
  });
  return notifs;
};

// ── MODALS ─────────────────────────────────────────────────────────────────────
function Modal({
  title,
  onClose,
  children,
  className = ''
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = () => [...(modalRef.current?.querySelectorAll(focusableSelector) || [])].filter(el => !el.disabled && el.offsetParent !== null);
    const prevFocus = document.activeElement;
    setTimeout(() => focusables()[0]?.focus(), 0);
    const fn = e => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', fn);
      prevFocus?.focus?.();
    };
  }, []);
  return _jsx("div", {
    className: "modal-overlay",
    onClick: e => e.target === e.currentTarget && onClose(),
    children: _jsxs("div", {
      className: `modal ${className}`.trim(),
      ref: modalRef,
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
      children: [_jsxs("div", {
        className: "modal-head",
        children: [_jsx("div", {
          className: "modal-title",
          children: title
        }), _jsx("button", {
          className: "modal-close",
          onClick: onClose,
          children: _jsx(IcoX, {
            size: 20
          })
        })]
      }), children]
    })
  });
}
function FormField({
  label,
  children
}) {
  return _jsxs("div", {
    className: "form-field",
    children: [_jsx("label", {
      className: "label",
      children: label
    }), children]
  });
}
function StudentModal({
  student,
  onClose,
  onSave
}) {
  const [name, setName] = useState(student?.name || '');
  const [rate, setRate] = useState(student?.rate ?? DEFAULT_RATE);
  const [phone, setPhone] = useState(student?.phone || '');
  const [tgId, setTgId] = useState(student?.tgId || '');
  const [subjects, setSubjects] = useState(student?.subjects || ['История']);
  const [goal, setGoal] = useState(student?.goal || '');
  const [notes, setNotes] = useState(student?.notes || '');
  const [availabilityNotes, setAvailabilityNotes] = useState(student?.availabilityNotes || '');
  const [archived, setArchived] = useState(!!student?.archived);
  const [lessonRates, setLessonRates] = useState(student?.lessonRates || {});
  const toggleSubject = subject => setSubjects(p => p.includes(subject) ? p.filter(x => x !== subject) : [...p, subject]);
  const submit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    const lr = {};
    Object.entries(lessonRates).forEach(([k, v]) => {
      const n = Number(v);
      if (String(v).trim() !== '' && Number.isFinite(n) && n >= 0) lr[k] = n;
    });
    onSave({
      name: name.trim(),
      rate: normalizeMoneyInput(rate, student?.rate ?? DEFAULT_RATE),
      phone,
      tgId,
      subjects: subjects.length ? subjects : ['История'],
      goal,
      notes,
      availabilityNotes,
      archived,
      lessonRates: lr
    });
  };
  return _jsx(Modal, {
    title: student ? 'Редактировать' : 'Новый ученик',
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsx(FormField, {
        label: "\u0418\u043C\u044F",
        children: _jsx("input", {
          className: "input",
          required: true,
          value: name,
          onChange: e => setName(e.target.value),
          placeholder: "\u0424\u0418\u041E"
        })
      }), _jsx(FormField, {
        label: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442\u044B",
        children: _jsx("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          },
          children: SUBJECTS.map(subject => _jsx("button", {
            type: "button",
            className: `btn btn-sm btn-full ${subjects.includes(subject) ? 'btn-black' : 'btn-white'}`,
            onClick: () => toggleSubject(subject),
            children: subject
          }, subject))
        })
      }), _jsx(FormField, {
        label: "\u0411\u0430\u0437\u043E\u0432\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 \u20BD/\u0443\u0440\u043E\u043A",
        children: _jsx("input", {
          className: "input",
          type: "number",
          required: true,
          min: "0",
          value: rate,
          onChange: e => setRate(e.target.value)
        })
      }), subjects.length > 1 && _jsx(FormField, {
        label: "\u0421\u0442\u0430\u0432\u043A\u0438 \u043F\u043E \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u0430\u043C (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
        children: subjects.map(subject => _jsxs("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 6
          },
          children: [_jsx("span", {
            style: {
              fontSize: 11,
              minWidth: 88,
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontWeight: 700
            },
            children: subject
          }), _jsx("input", {
            className: "input",
            type: "number",
            min: "0",
            placeholder: `${rate} ₽`,
            value: lessonRates[subject] ?? '',
            onChange: e => setLessonRates(p => ({
              ...p,
              [subject]: e.target.value
            })),
            style: {
              padding: '6px 8px',
              fontSize: 12
            }
          })]
        }, subject))
      }), _jsx(FormField, {
        label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
        children: _jsx("input", {
          className: "input",
          value: phone,
          onChange: e => setPhone(e.target.value),
          placeholder: "+7 ..."
        })
      }), _jsx(FormField, {
        label: "Telegram (username \u0438\u043B\u0438 ID)",
        children: _jsx("input", {
          className: "input",
          value: tgId,
          onChange: e => setTgId(e.target.value),
          placeholder: "@username \u0438\u043B\u0438 123456789"
        })
      }), _jsx(FormField, {
        label: "\u0426\u0435\u043B\u044C",
        children: _jsx("input", {
          className: "input",
          value: goal,
          onChange: e => setGoal(e.target.value),
          placeholder: "\u0415\u0413\u042D \u0438\u0441\u0442\u043E\u0440\u0438\u044F, \u041E\u0413\u042D, \u0448\u043A\u043E\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u0430"
        })
      }), _jsx(FormField, {
        label: "\u0414\u043E\u043F. \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 / \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435 \u043E\u043A\u043D\u0430",
        children: _jsx("textarea", {
          className: "input",
          value: availabilityNotes,
          onChange: e => setAvailabilityNotes(e.target.value),
          placeholder: "\u041F\u043D 15:00-18:00\n\u0421\u0440 16:30-19:00\n\u0421\u0431 10:00-13:00",
          style: {
            minHeight: 86,
            resize: 'vertical'
          }
        })
      }), _jsx(FormField, {
        label: "\u0417\u0430\u043C\u0435\u0442\u043A\u0438",
        children: _jsx("textarea", {
          className: "input",
          value: notes,
          onChange: e => setNotes(e.target.value),
          placeholder: "\u0421\u043B\u0430\u0431\u044B\u0435 \u0442\u0435\u043C\u044B, \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044C, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438",
          style: {
            minHeight: 74,
            resize: 'vertical'
          }
        })
      }), student && _jsxs("div", {
        className: `check-row ${archived ? 'checked' : ''}`,
        onClick: () => setArchived(!archived),
        children: [_jsx("span", {
          style: {
            fontWeight: 700
          },
          children: "\u0410\u0440\u0445\u0438\u0432\u043D\u044B\u0439 \u0443\u0447\u0435\u043D\u0438\u043A"
        }), _jsx("div", {
          className: `check-box ${archived ? 'checked' : ''}`,
          children: archived && _jsx(IcoCheck, {
            size: 14
          })
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-black btn-full",
          children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"
        })]
      })]
    })
  });
}
function StudentProfileModal({
  student,
  students,
  groups,
  lessons,
  txs,
  onClose,
  onSave
}) {
  const portal = getParentPortalSettings(student);
  const [name, setName] = useState(student?.name || '');
  const [rate, setRate] = useState(student?.rate ?? DEFAULT_RATE);
  const [phone, setPhone] = useState(student?.phone || '');
  const [tgId, setTgId] = useState(student?.tgId || '');
  const [parentName, setParentName] = useState(student?.parentName || '');
  const [parentPhone, setParentPhone] = useState(student?.parentPhone || '');
  const [parentNotes, setParentNotes] = useState(student?.parentNotes || '');
  const [subjects, setSubjects] = useState(student?.subjects || ['История']);
  const [goal, setGoal] = useState(student?.goal || '');
  const [level, setLevel] = useState(student?.level || '');
  const [weakTopics, setWeakTopics] = useState(student?.weakTopics || '');
  const [notes, setNotes] = useState(student?.notes || '');
  const [availabilityNotes, setAvailabilityNotes] = useState(student?.availabilityNotes || '');
  const [packageLessons, setPackageLessons] = useState(student?.packageLessons || 0);
  const [lessonRates, setLessonRates] = useState(student?.lessonRates || {});
  const [archived, setArchived] = useState(!!student?.archived);
  const [portalSettings, setPortalSettings] = useState(portal);
  const [parentComment, setParentComment] = useState(portal.teacherComment || '');
  const ownLessons = getStudentLessons(student.id, lessons, groups).map(l => withStudentLessonMeta(l, student.id)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const finance = getStudentFinanceSummary(student, txs, lessons, groups);
  const nextLesson = ownLessons.filter(l => l.status === 'planned' && l.date >= getTodayDate()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const completed = ownLessons.filter(l => l.status === 'completed' || l.status === 'no_show');
  const toggleSubject = subject => setSubjects(p => p.includes(subject) ? p.filter(x => x !== subject) : [...p, subject]);
  const togglePortal = key => setPortalSettings(p => {
    if (key === 'enabled' && !p.enabled && !p.token) return {
      ...p,
      enabled: true,
      token: createParentPortalToken()
    };
    return {
      ...p,
      [key]: !p[key]
    };
  });
  const profileChecks = [{
    label: 'Контакты',
    ok: !!(phone.trim() || tgId.trim())
  }, {
    label: 'Родитель',
    ok: !!(parentName.trim() || parentPhone.trim())
  }, {
    label: 'Цель',
    ok: !!goal.trim()
  }, {
    label: 'Уровень',
    ok: !!(level.trim() || weakTopics.trim())
  }, {
    label: 'Окна',
    ok: !!availabilityNotes.trim()
  }, {
    label: 'Ссылка',
    ok: !!portalSettings.enabled
  }];
  const completion = Math.round(profileChecks.filter(x => x.ok).length / profileChecks.length * 100);
  const submit = e => {
    e.preventDefault();
    if (!name.trim()) return;
    const lr = {};
    Object.entries(lessonRates).forEach(([k, v]) => {
      const n = Number(v);
      if (String(v).trim() !== '' && Number.isFinite(n) && n >= 0) lr[k] = n;
    });
    const nextPortal = {
      ...portalSettings,
      teacherComment: parentComment.trim()
    };
    if (nextPortal.enabled && !nextPortal.token) nextPortal.token = createParentPortalToken();
    onSave({
      name: name.trim(),
      rate: normalizeMoneyInput(rate, student?.rate ?? DEFAULT_RATE),
      phone,
      tgId,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentNotes: parentNotes.trim(),
      subjects: subjects.length ? subjects : ['История'],
      goal,
      level,
      weakTopics,
      notes,
      availabilityNotes,
      packageLessons: Math.max(0, Number(packageLessons) || 0),
      archived,
      lessonRates: lr,
      parentPortal: nextPortal
    });
  };
  const portalLink = portalSettings.token ? parentPortalUrl(portalSettings.token) : '';
  return _jsx(Modal, {
    title: "Карта ученика",
    onClose: onClose,
    className: "student-profile-modal",
    children: _jsxs("form", {
      className: "student-profile-form",
      onSubmit: submit,
      children: [_jsxs("div", {
        className: "student-profile-hero",
        children: [_jsxs("div", {
          children: [_jsx("span", {
            children: "Профиль для работы и родительской ссылки"
          }), _jsx("h2", {
            children: name || student.name
          }), _jsxs("p", {
            children: ["Заполнено ", completion, "%. Чем полнее карта, тем полезнее родительский кабинет."]
          })]
        }), _jsxs("div", {
          className: "student-profile-progress",
          children: [_jsx("strong", {
            children: `${completion}%`
          }), _jsx("div", {
            children: _jsx("i", {
              style: {
                width: `${completion}%`
              }
            })
          })]
        })]
      }), _jsxs("div", {
        className: "student-profile-layout",
        children: [_jsxs("aside", {
          className: "student-profile-side",
          children: [_jsx("div", {
            className: "profile-side-title",
            children: "Что готово"
          }), profileChecks.map(item => _jsxs("div", {
            className: `profile-check ${item.ok ? 'done' : ''}`,
            children: [_jsx("span", {
              children: item.ok ? "✓" : "•"
            }), _jsx("b", {
              children: item.label
            })]
          }, item.label)), _jsxs("div", {
            className: "profile-mini-card",
            children: [_jsx("span", {
              children: "Баланс"
            }), _jsx("strong", {
              style: {
                color: balanceColor(finance.balance)
              },
              children: balanceLabel(finance.balance)
            })]
          }), _jsxs("div", {
            className: "profile-mini-card",
            children: [_jsx("span", {
              children: "Следующий урок"
            }), _jsx("strong", {
              children: nextLesson ? `${fmtDate(nextLesson.date)} ${nextLesson.time}` : "не запланирован"
            })]
          }), _jsxs("div", {
            className: "profile-mini-card",
            children: [_jsx("span", {
              children: "Проведено"
            }), _jsx("strong", {
              children: `${completed.length} уроков`
            })]
          })]
        }), _jsxs("div", {
          className: "student-profile-main",
          children: [_jsxs("section", {
            className: "profile-section",
            children: [_jsx("h3", {
              children: "Основное"
            }), _jsxs("div", {
              className: "profile-grid two",
              children: [_jsx(FormField, {
                label: "Имя ученика",
                children: _jsx("input", {
                  className: "input",
                  required: true,
                  value: name,
                  onChange: e => setName(e.target.value),
                  placeholder: "ФИО"
                })
              }), _jsx(FormField, {
                label: "Телефон ученика",
                children: _jsx("input", {
                  className: "input",
                  value: phone,
                  onChange: e => setPhone(e.target.value),
                  placeholder: "+7 ..."
                })
              }), _jsx(FormField, {
                label: "Telegram",
                children: _jsx("input", {
                  className: "input",
                  value: tgId,
                  onChange: e => setTgId(e.target.value),
                  placeholder: "@username"
                })
              }), _jsx(FormField, {
                label: "Уровень / класс",
                children: _jsx("input", {
                  className: "input",
                  value: level,
                  onChange: e => setLevel(e.target.value),
                  placeholder: "10 класс, база, олимпиадник"
                })
              })]
            })]
          }), _jsxs("section", {
            className: "profile-section",
            children: [_jsx("h3", {
              children: "Обучение"
            }), _jsx(FormField, {
              label: "Предметы",
              children: _jsx("div", {
                className: "profile-subject-grid",
                children: SUBJECTS.map(subject => _jsx("button", {
                  type: "button",
                  className: `btn btn-sm btn-full ${subjects.includes(subject) ? 'btn-black' : 'btn-white'}`,
                  onClick: () => toggleSubject(subject),
                  children: subject
                }, subject))
              })
            }), _jsx(FormField, {
              label: "Цель",
              children: _jsx("input", {
                className: "input",
                value: goal,
                onChange: e => setGoal(e.target.value),
                placeholder: "ЕГЭ 85+, ОГЭ, подтянуть школу"
              })
            }), _jsx(FormField, {
              label: "Слабые темы / фокус",
              children: _jsx("textarea", {
                className: "input",
                value: weakTopics,
                onChange: e => setWeakTopics(e.target.value),
                placeholder: "Например: источники, эссе, хронология, конспекты",
                style: {
                  minHeight: 74,
                  resize: 'vertical'
                }
              })
            })]
          }), _jsxs("section", {
            className: "profile-section",
            children: [_jsx("h3", {
              children: "Финансы"
            }), _jsxs("div", {
              className: "profile-grid two",
              children: [_jsx(FormField, {
                label: "Базовая ставка ₽/урок",
                children: _jsx("input", {
                  className: "input",
                  type: "number",
                  min: "0",
                  value: rate,
                  onChange: e => setRate(e.target.value)
                })
              }), _jsx(FormField, {
                label: "Остаток абонемента",
                children: _jsx("input", {
                  className: "input",
                  type: "number",
                  min: "0",
                  value: packageLessons,
                  onChange: e => setPackageLessons(e.target.value)
                })
              })]
            }), subjects.length > 1 && _jsx("div", {
              className: "profile-rate-list",
              children: subjects.map(subject => _jsxs("div", {
                children: [_jsx("span", {
                  children: subject
                }), _jsx("input", {
                  className: "input",
                  type: "number",
                  min: "0",
                  placeholder: `${rate} ₽`,
                  value: lessonRates[subject] ?? '',
                  onChange: e => setLessonRates(p => ({
                    ...p,
                    [subject]: e.target.value
                  }))
                })]
              }, subject))
            })]
          }), _jsxs("section", {
            className: "profile-section",
            children: [_jsx("h3", {
              children: "Родители и связь"
            }), _jsxs("div", {
              className: "profile-grid two",
              children: [_jsx(FormField, {
                label: "Имя родителя",
                children: _jsx("input", {
                  className: "input",
                  value: parentName,
                  onChange: e => setParentName(e.target.value),
                  placeholder: "Как обращаться"
                })
              }), _jsx(FormField, {
                label: "Телефон родителя",
                children: _jsx("input", {
                  className: "input",
                  value: parentPhone,
                  onChange: e => setParentPhone(e.target.value),
                  placeholder: "+7 ..."
                })
              })]
            }), _jsx(FormField, {
              label: "Комментарий родителю в кабинете",
              children: _jsx("textarea", {
                className: "input",
                value: parentComment,
                onChange: e => setParentComment(e.target.value),
                placeholder: "Короткое пояснение, которое родитель увидит сверху",
                style: {
                  minHeight: 76,
                  resize: 'vertical'
                }
              })
            }), _jsx(FormField, {
              label: "Внутренняя заметка по родителю",
              children: _jsx("textarea", {
                className: "input",
                value: parentNotes,
                onChange: e => setParentNotes(e.target.value),
                placeholder: "Что важно помнить: формат общения, договоренности, ожидания",
                style: {
                  minHeight: 68,
                  resize: 'vertical'
                }
              })
            }), _jsxs("div", {
              className: "profile-toggle-grid",
              children: [['enabled', 'Родительская ссылка'], ['showFinance', 'Финансы'], ['showHomework', 'ДЗ'], ['showProgress', 'Прогресс'], ['showSchedule', 'Расписание'], ['allowPaymentNotice', 'Заявка оплаты']].map(([key, label]) => _jsxs("button", {
                type: "button",
                className: `profile-toggle ${portalSettings[key] ? 'active' : ''}`,
                onClick: () => togglePortal(key),
                children: [_jsx("span", {
                  children: portalSettings[key] ? "✓" : "•"
                }), _jsx("b", {
                  children: label
                })]
              }, key))
            }), _jsx("div", {
              className: "profile-link-preview",
              children: portalSettings.enabled ? portalLink || "Ссылка появится после сохранения" : "Родительская ссылка выключена"
            })]
          }), _jsxs("section", {
            className: "profile-section",
            children: [_jsx("h3", {
              children: "Расписание и заметки"
            }), _jsx(FormField, {
              label: "Свободные окна",
              children: _jsx("textarea", {
                className: "input",
                value: availabilityNotes,
                onChange: e => setAvailabilityNotes(e.target.value),
                placeholder: "Пн 15:00-18:00\nСр 16:30-19:00",
                style: {
                  minHeight: 88,
                  resize: 'vertical'
                }
              })
            }), _jsx(FormField, {
              label: "Внутренние заметки",
              children: _jsx("textarea", {
                className: "input",
                value: notes,
                onChange: e => setNotes(e.target.value),
                placeholder: "Методика, особенности, важные договоренности",
                style: {
                  minHeight: 88,
                  resize: 'vertical'
                }
              })
            }), _jsxs("div", {
              className: `check-row ${archived ? 'checked' : ''}`,
              onClick: () => setArchived(!archived),
              children: [_jsx("span", {
                className: "check-label-strong",
                children: "Архивный ученик"
              }), _jsx("div", {
                className: `check-box ${archived ? 'checked' : ''}`,
                children: archived && _jsx(IcoCheck, {
                  size: 14
                })
              })]
            })]
          })]
        })]
      }), _jsxs("div", {
        className: "modal-actions profile-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "Отмена"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-black btn-full",
          children: "Сохранить карту"
        })]
      })]
    })
  });
}
function GroupModal({
  group,
  students,
  onClose,
  onSave
}) {
  const [name, setName] = useState(group?.name || '');
  const [emoji, setEmoji] = useState(group?.emoji || '');
  const [subject, setSubject] = useState(group?.subject || 'История');
  const [sel, setSel] = useState(group?.studentIds || []);
  const [archived, setArchived] = useState(!!group?.archived);
  const [rateOverrides, setRateOverrides] = useState(group?.rateOverrides || {});
  const isSelected = id => sel.some(x => sameId(x, id));
  const availableStudents = students.filter(s => !s.archived || isSelected(s.id)).sort((a, b) => Number(isSelected(b.id)) - Number(isSelected(a.id)) || a.name.localeCompare(b.name, 'ru'));
  const toggle = id => setSel(p => p.some(x => sameId(x, id)) ? p.filter(x => !sameId(x, id)) : [...p, id]);
  const submit = e => {
    e.preventDefault();
    const finalName = name.trim() || buildGroupAutoName(sel, students, subject);
    const finalEmoji = emoji.trim() || randomGroupEmoji();
    const cleanRates = {};
    Object.entries(rateOverrides).forEach(([id, val]) => {
      const n = Number(val);
      if (String(val).trim() !== '' && Number.isFinite(n) && n >= 0) cleanRates[id] = n;
    });
    onSave({
      name: finalName,
      emoji: finalEmoji,
      subject,
      studentIds: sel,
      rateOverrides: cleanRates,
      archived
    });
  };
  return _jsx(Modal, {
    title: group ? 'Редактировать группу' : 'Новая группа',
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsxs("div", {
        className: "group-form-grid",
        children: [_jsxs("div", {
          children: [_jsx("label", {
            className: "label",
            children: "\u0421\u043C\u0430\u0439\u043B"
          }), _jsx("input", {
            className: "input emoji-input",
            value: emoji,
            onChange: e => setEmoji(e.target.value),
            placeholder: "\uD83C\uDFDB\uFE0F"
          })]
        }), _jsx(FormField, {
          label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
          children: _jsx("input", {
            className: "input",
            value: name,
            onChange: e => setName(e.target.value),
            placeholder: "\u0410\u0432\u0442\u043E: \u0441\u043C\u0430\u0439\u043B + \u043F\u0435\u0440\u0432\u044B\u0435 \u0431\u0443\u043A\u0432\u044B \u0438\u043C\u0435\u043D"
          })
        })]
      }), _jsx(FormField, {
        label: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442",
        children: _jsx("select", {
          className: "input",
          value: subject,
          onChange: e => setSubject(e.target.value),
          children: SUBJECTS.map(s => _jsx("option", {
            value: s,
            children: s
          }, s))
        })
      }), _jsx("div", {
        className: "label modal-section-label",
        children: "\u0423\u0447\u0435\u043D\u0438\u043A\u0438"
      }), _jsx("div", {
        className: "modal-scroll-list",
        children: availableStudents.map(s => _jsxs("div", {
          className: `check-row student-check-row ${isSelected(s.id) ? 'checked' : ''}`,
          children: [_jsxs("div", {
            onClick: () => toggle(s.id),
            className: "student-check-main",
            children: [_jsx("div", {
              className: `check-box ${isSelected(s.id) ? 'checked' : ''}`,
              children: isSelected(s.id) && _jsx(IcoCheck, {
                size: 14
              })
            }), _jsxs("div", {
              children: [_jsx("div", {
                className: "student-check-name",
                children: s.name
              }), _jsxs("div", {
                className: "student-check-meta",
                children: ["\u043E\u0431\u044B\u0447\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430 ", money(s.rate)]
              })]
            })]
          }), isSelected(s.id) && _jsx("input", {
            className: "input rate-override-input",
            type: "number",
            min: "0",
            placeholder: s.rate,
            value: rateOverrides[s.id] ?? '',
            onChange: e => setRateOverrides(p => ({
              ...p,
              [s.id]: e.target.value
            }))
          })]
        }, s.id))
      }), _jsxs("div", {
        className: `check-row modal-archive-row ${archived ? 'checked' : ''}`,
        onClick: () => setArchived(!archived),
        children: [_jsx("span", {
          className: "check-label-strong",
          children: "\u0410\u0440\u0445\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443"
        }), _jsx("div", {
          className: `check-box ${archived ? 'checked' : ''}`,
          children: archived && _jsx(IcoCheck, {
            size: 14
          })
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-black btn-full",
          children: group ? 'Сохранить' : 'Создать'
        })]
      })]
    })
  });
}
function TransactionModal({
  tx,
  students,
  onClose,
  onSave
}) {
  const [sid, setSid] = useState(tx?.studentId || students[0]?.id || '');
  const [type, setType] = useState(tx?.type || 'payment');
  const [amt, setAmt] = useState(tx?.amount || '');
  const [date, setDate] = useState(tx?.date || getTodayDate());
  const [comment, setComment] = useState(tx?.comment || '');
  const selectedStudent = students.find(s => sameId(s.id, sid));
  const currentBalance = Number(selectedStudent?.balance || 0);
  const previewDelta = type === 'payment' ? Number(amt || 0) : -Number(amt || 0);
  const nextBalance = currentBalance + previewDelta;
  const submit = e => {
    e.preventDefault();
    if (!sid || Number(amt) <= 0) return;
    onSave({
      studentId: Number(sid),
      type,
      amount: Number(amt),
      date,
      comment
    });
  };
  if (!students.length) {
    return _jsx(Modal, {
      title: "\u041D\u043E\u0432\u0430\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F",
      onClose: onClose,
      children: _jsx(EmptyState, {
        title: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u0443\u0436\u0435\u043D \u0443\u0447\u0435\u043D\u0438\u043A",
        text: "\u041E\u043F\u043B\u0430\u0442\u0443 \u0438\u043B\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u043A \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u043C\u0443 \u0443\u0447\u0435\u043D\u0438\u043A\u0443."
      })
    });
  }
  return _jsx(Modal, {
    title: tx?.id ? 'Редактировать операцию' : 'Новая операция',
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsx(FormField, {
        label: "\u0423\u0447\u0435\u043D\u0438\u043A",
        children: _jsx("select", {
          className: "input",
          value: sid,
          onChange: e => setSid(e.target.value),
          children: students.map(s => _jsxs("option", {
            value: s.id,
            children: [s.name, " (", s.balance > 0 ? '+' : '', s.balance, " \u20BD)"]
          }, s.id))
        })
      }), _jsxs("div", {
        className: "toggle-row",
        children: [_jsx("button", {
          type: "button",
          className: `toggle-opt ${type === 'payment' ? 'active' : ''}`,
          onClick: () => setType('payment'),
          children: "+ \u041E\u043F\u043B\u0430\u0442\u0430"
        }), _jsx("button", {
          type: "button",
          className: `toggle-opt ${type === 'charge' ? 'active' : ''}`,
          onClick: () => setType('charge'),
          children: "\u2212 \u0421\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
        })]
      }), selectedStudent && _jsxs("div", {
        className: "payment-helper",
        children: [_jsxs("div", {
          children: [_jsx("span", {
            children: "\u0421\u0435\u0439\u0447\u0430\u0441"
          }), _jsx("strong", {
            style: {
              color: balanceColor(currentBalance)
            },
            children: balanceLabel(currentBalance)
          })]
        }), type === 'payment' && currentBalance < 0 && _jsx("button", {
          type: "button",
          className: "btn btn-sm btn-green",
          onClick: () => setAmt(String(Math.abs(currentBalance))),
          children: "\u0412\u043D\u0435\u0441\u0442\u0438 \u0432\u0435\u0441\u044C \u0434\u043E\u043B\u0433"
        })]
      }), _jsx(FormField, {
        label: "\u0421\u0443\u043C\u043C\u0430 \u20BD",
        children: _jsx("input", {
          className: "input",
          type: "number",
          required: true,
          min: "1",
          value: amt,
          onChange: e => setAmt(e.target.value),
          placeholder: "0"
        })
      }), _jsx(FormField, {
        label: "\u0414\u0430\u0442\u0430",
        children: _jsx("input", {
          className: "input",
          type: "date",
          required: true,
          value: date,
          onChange: e => setDate(e.target.value)
        })
      }), _jsx(FormField, {
        label: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439",
        children: _jsx("input", {
          className: "input",
          value: comment,
          onChange: e => setComment(e.target.value),
          placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043E\u043F\u043B\u0430\u0442\u0430 \u0437\u0430 \u043C\u0430\u0440\u0442"
        })
      }), selectedStudent && Number(amt || 0) > 0 && _jsxs("div", {
        className: "balance-preview",
        children: [_jsx("span", {
          children: "\u041F\u043E\u0441\u043B\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438"
        }), _jsx("strong", {
          style: {
            color: balanceColor(nextBalance)
          },
          children: `${money(currentBalance)} \u2192 ${money(nextBalance)}`
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: `btn btn-full ${type === 'payment' ? 'btn-green' : 'btn-red'}`,
          children: tx?.id ? 'Сохранить' : 'Провести'
        })]
      })]
    })
  });
}
function LessonModal({
  students,
  groups,
  lessons = [],
  initialDate,
  initialStudentId,
  initialType,
  initialTargetId,
  initialTime,
  lessonToEdit,
  onClose,
  onSave
}) {
  const [type, setType] = useState(lessonToEdit?.type || initialType || (initialStudentId ? 'individual' : 'group'));
  const [targetId, setTgt] = useState(lessonToEdit ? String(lessonToEdit.targetId) : initialTargetId ? String(initialTargetId) : initialStudentId ? String(initialStudentId) : '');
  const [subject, setSubject] = useState(lessonToEdit?.subject || 'История');
  const [date, setDate] = useState(lessonToEdit?.date || initialDate || getTodayDate());
  const [time, setTime] = useState(lessonToEdit?.time || initialTime || '15:00');
  const [days, setDays] = useState([]);
  const [recurring, setRec] = useState(false);
  const [weeks, setWeeks] = useState(4);
  const [repeatUntil, setRepeatUntil] = useState(() => {
    const d = new Date((lessonToEdit?.date || initialDate || getTodayDate()) + 'T00:00:00');
    d.setDate(d.getDate() + 28);
    return localDateString(d);
  });
  const [seriesScope, setSeriesScope] = useState('single');
  const [topic, setTopic] = useState(lessonToEdit?.topic || '');
  const [homework, setHomework] = useState(lessonToEdit?.homework || '');
  const [lessonNote, setLessonNote] = useState(lessonToEdit?.lessonNote || '');
  const [duration, setDuration] = useState(lessonToEdit?.duration || 60);
  const canApplyFuture = lessonToEdit?.status === 'planned' && lessons.filter(l => sameRecurringSlot(l, lessonToEdit) && l.status === 'planned' && lessonDateTimeKey(l) >= lessonDateTimeKey(lessonToEdit)).length > 1;
  const activeGroups = groups.filter(g => !g.archived || sameId(lessonToEdit?.targetId, g.id));
  const activeStudents = students.filter(s => !s.archived || sameId(lessonToEdit?.targetId, s.id) || sameId(initialStudentId, s.id));
  const dayFreeSlots = useMemo(() => {
    const ranges = lessons.filter(l => l.date === date && l.id !== lessonToEdit?.id && l.status !== 'cancelled').map(lessonRange).sort((a, b) => a.start - b.start);
    const slots = [];
    let cursor = 9 * 60;
    const dayEnd = 21 * 60;
    ranges.forEach(r => {
      if (r.start - cursor >= 60) slots.push({
        start: cursor,
        end: r.start
      });
      cursor = Math.max(cursor, r.end);
    });
    if (dayEnd - cursor >= 60) slots.push({
      start: cursor,
      end: dayEnd
    });
    return slots.slice(0, 6);
  }, [lessons, date, lessonToEdit?.id]);
  useEffect(() => {
    if (!lessonToEdit && days.length === 0 && date) setDays([localDayIndex(date)]);
  }, [date]);
  useEffect(() => {
    if (type === 'individual' && activeStudents.length && (!targetId || !activeStudents.find(s => sameId(s.id, targetId)))) setTgt(String(activeStudents[0].id));
    if (type === 'group' && activeGroups.length && (!targetId || !activeGroups.find(g => sameId(g.id, targetId)))) setTgt(String(activeGroups[0].id));
  }, [type, targetId, students, groups]);
  useEffect(() => {
    if (lessonToEdit) return;
    if (type === 'group') {
      const g = activeGroups.find(x => sameId(x.id, targetId));
      if (g?.subject) setSubject(g.subject);
    } else {
      const s = activeStudents.find(x => sameId(x.id, targetId));
      if (s?.subjects?.length) setSubject(s.subjects[0]);
    }
  }, [type, targetId]);
  if (!lessonToEdit && !activeGroups.length && !activeStudents.length) {
    return _jsx(Modal, {
      title: "\u041D\u043E\u0432\u043E\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435",
      onClose: onClose,
      children: _jsx(EmptyState, {
        title: "\u041D\u0435\u043A\u043E\u0433\u043E \u043F\u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u0432 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
        text: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u0438\u043B\u0438 \u0433\u0440\u0443\u043F\u043F\u0443, \u043F\u043E\u0442\u043E\u043C \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435."
      })
    });
  }
  const toggleDay = d => {
    if (days.includes(d)) {
      if (days.length > 1) setDays(days.filter(x => x !== d));
    } else setDays([...days, d].sort());
  };
  const submit = e => {
    e.preventDefault();
    if (!targetId) return;
    const selectedTarget = (type === 'individual' ? activeStudents : activeGroups).find(x => sameId(x.id, targetId));
    const base = {
      type,
      targetId: selectedTarget?.id ?? targetId,
      subject,
      time,
      duration: Number(duration),
      topic,
      homework,
      lessonNote
    };
    if (lessonToEdit) {
      onSave([{
        ...base,
        date
      }], {
        seriesScope
      });
      return;
    }
    const arr = [];
    const seriesId = recurring || days.length > 1 ? Date.now() : null;
    const [y, m, dd] = date.split('-').map(Number);
    const baseDate = new Date(y, m - 1, dd);
    days.forEach(di => {
      let iter = new Date(baseDate);
      const curr = iter.getDay();
      iter.setDate(iter.getDate() + (di - curr + 7) % 7);
      const until = new Date((repeatUntil || date) + 'T23:59:59');
      const wc = recurring ? 104 : 1;
      for (let i = 0; i < wc; i++) {
        const nd = new Date(iter);
        nd.setDate(iter.getDate() + i * 7);
        if (recurring && nd > until) break;
        arr.push({
          ...base,
          seriesId,
          date: `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, '0')}-${String(nd.getDate()).padStart(2, '0')}`
        });
      }
    });
    onSave(arr);
  };
  return _jsx(Modal, {
    title: lessonToEdit ? 'Изменить занятие' : 'Новое занятие',
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsxs("div", {
        className: "toggle-row",
        style: {
          marginBottom: 14
        },
        children: [_jsx("button", {
          type: "button",
          className: `toggle-opt ${type === 'group' ? 'active' : ''}`,
          onClick: () => setType('group'),
          children: "\u0413\u0440\u0443\u043F\u043F\u0430"
        }), _jsx("button", {
          type: "button",
          className: `toggle-opt ${type === 'individual' ? 'active' : ''}`,
          onClick: () => setType('individual'),
          children: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E"
        })]
      }), !lessonToEdit && dayFreeSlots.length > 0 && _jsxs("div", {
        className: "lesson-free-panel",
        children: [_jsx("div", {
          className: "lesson-free-title",
          children: "Свободные окна"
        }), _jsx("div", {
          className: "lesson-free-list",
          children: dayFreeSlots.map(slot => {
            const start = minToTime(slot.start);
            return _jsxs("button", {
              type: "button",
              className: `lesson-free-chip ${time === start ? 'active' : ''}`,
              onClick: () => setTime(start),
              children: [start, "–", minToTime(slot.end)]
            }, `${slot.start}-${slot.end}`);
          })
        })]
      }), _jsx(FormField, {
        label: type === 'group' ? 'Группа' : 'Ученик',
        children: _jsx("select", {
          className: "input",
          required: true,
          value: targetId,
          onChange: e => setTgt(e.target.value),
          children: type === 'individual' ? activeStudents.map(s => _jsxs("option", {
            value: s.id,
            children: [s.name, s.archived ? ' (архив)' : '']
          }, s.id)) : activeGroups.map(g => _jsxs("option", {
            value: g.id,
            children: [g.name, g.archived ? ' (архив)' : '']
          }, g.id))
        })
      }), _jsx(FormField, {
        label: "\u041F\u0440\u0435\u0434\u043C\u0435\u0442",
        children: _jsx("select", {
          className: "input",
          required: true,
          value: subject,
          onChange: e => setSubject(e.target.value),
          children: SUBJECTS.map(s => _jsx("option", {
            value: s,
            children: s
          }, s))
        })
      }), _jsxs("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 14
        },
        children: [_jsxs("div", {
          children: [_jsx("label", {
            className: "label",
            children: lessonToEdit ? 'Дата' : 'Дата начала'
          }), _jsx("input", {
            className: "input",
            type: "date",
            required: true,
            value: date,
            onChange: e => {
              const nextDate = e.target.value;
              setDate(nextDate);
              if (!recurring) setDays([localDayIndex(nextDate)]);
            }
          })]
        }), _jsxs("div", {
          children: [_jsx("label", {
            className: "label",
            children: "\u0412\u0440\u0435\u043C\u044F"
          }), _jsx("input", {
            className: "input",
            type: "time",
            required: true,
            value: time,
            onChange: e => setTime(e.target.value)
          })]
        })]
      }), _jsx(FormField, {
        label: "\u0414\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
        children: _jsx("div", {
          style: {
            display: 'flex',
            gap: 6
          },
          children: [30, 45, 60, 90, 120].map(d => _jsx("button", {
            type: "button",
            onClick: () => setDuration(d),
            className: `btn btn-sm ${duration === d ? 'btn-black' : 'btn-white'}`,
            style: {
              flex: 1,
              padding: '7px 2px',
              fontSize: 10,
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontWeight: 700
            },
            children: d < 60 ? `${d}м` : d === 60 ? '1ч' : d === 90 ? '1.5ч' : '2ч'
          }, d))
        })
      }), _jsx(FormField, {
        label: "\u0422\u0435\u043C\u0430 \u0443\u0440\u043E\u043A\u0430",
        children: _jsx("input", {
          className: "input",
          value: topic,
          onChange: e => setTopic(e.target.value),
          placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0440\u0435\u0444\u043E\u0440\u043C\u044B \u041F\u0435\u0442\u0440\u0430 I"
        })
      }), _jsx(FormField, {
        label: "\u0414\u043E\u043C\u0430\u0448\u043A\u0430",
        children: _jsx("textarea", {
          className: "input",
          value: homework,
          onChange: e => setHomework(e.target.value),
          placeholder: "\u0427\u0442\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C\u0443 \u0443\u0440\u043E\u043A\u0443",
          style: {
            minHeight: 70,
            resize: 'vertical'
          }
        })
      }), _jsx(FormField, {
        label: "\u0417\u0430\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u0443\u0440\u043E\u043A\u0430",
        children: _jsx("textarea", {
          className: "input",
          value: lessonNote,
          onChange: e => setLessonNote(e.target.value),
          placeholder: "\u0427\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C, \u0447\u0442\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C",
          style: {
            minHeight: 70,
            resize: 'vertical'
          }
        })
      }), !lessonToEdit && _jsxs("div", {
        style: {
          background: 'var(--bg-subtle)',
          border: 'var(--border)',
          borderRadius: 8,
          padding: 12,
          marginBottom: 14
        },
        children: [_jsx("div", {
          className: "label",
          style: {
            marginBottom: 8
          },
          children: "\u0414\u043D\u0438 \u043D\u0435\u0434\u0435\u043B\u0438"
        }), _jsx("div", {
          style: {
            display: 'flex',
            gap: 6,
            justifyContent: 'space-between'
          },
          children: DAY_INDEXES.map(i => _jsx("button", {
            type: "button",
            onClick: () => toggleDay(i),
            style: {
              width: 36,
              height: 36,
              border: 'var(--border)',
              borderRadius: 7,
              cursor: 'pointer',
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              background: days.includes(i) ? 'var(--ink)' : 'var(--surface)',
              color: days.includes(i) ? 'var(--yellow)' : 'var(--black)',
              boxShadow: days.includes(i) ? 'none' : 'var(--shadow)'
            },
            children: DAYS_SHORT[i]
          }, i))
        }), _jsxs("div", {
          style: {
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          },
          children: [_jsx("div", {
            className: `check-box ${recurring ? 'checked' : ''}`,
            onClick: () => setRec(!recurring),
            style: {
              cursor: 'pointer'
            },
            children: recurring && _jsx(IcoCheck, {
              size: 14
            })
          }), _jsx("span", {
            style: {
              fontSize: 11,
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontWeight: 700
            },
            children: "\u041F\u043E\u0432\u0442\u043E\u0440\u044F\u0442\u044C \u0435\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E"
          })]
        }), recurring && _jsxs("div", {
          style: {
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          },
          children: [_jsx("span", {
            style: {
              fontSize: 11
            },
            children: "\u0434\u043E"
          }), _jsx("input", {
            className: "input",
            type: "date",
            value: repeatUntil,
            min: date,
            onChange: e => setRepeatUntil(e.target.value),
            style: {
              flex: 1,
              padding: '6px 8px'
            }
          }), _jsx("span", {
            style: {
              fontSize: 11
            },
            children: "\u0432\u043A\u043B."
          })]
        })]
      }), canApplyFuture && _jsxs("div", {
        className: "series-scope-panel",
        children: [_jsx("div", {
          className: "label",
          children: "Применить изменения"
        }), _jsxs("div", {
          className: "toggle-row",
          children: [_jsx("button", {
            type: "button",
            className: `toggle-opt ${seriesScope === 'single' ? 'active' : ''}`,
            onClick: () => setSeriesScope('single'),
            children: "Только этот урок"
          }), _jsx("button", {
            type: "button",
            className: `toggle-opt ${seriesScope === 'future' ? 'active' : ''}`,
            onClick: () => setSeriesScope('future'),
            children: "Этот и следующие"
          })]
        }), _jsx("div", {
          className: "series-scope-hint",
          children: "Прошлые и проведённые занятия не изменятся."
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          disabled: !targetId,
          className: "btn btn-black btn-full",
          children: lessonToEdit ? 'Сохранить' : 'Создать'
        })]
      })]
    })
  });
}
function AttendanceModal({
  lesson,
  students,
  groups,
  onClose,
  onSave
}) {
  const group = lesson.type === 'group' ? groups.find(g => sameId(g.id, lesson.targetId)) : null;
  const ls = useMemo(() => lesson.type === 'individual' ? [students.find(s => sameId(s.id, lesson.targetId))].filter(Boolean) : group?.studentIds.map(id => students.find(s => sameId(s.id, id))).filter(Boolean) || [], [lesson, students, groups]);
  const [att, setAtt] = useState(() => {
    if (lesson.status === 'completed' && lesson.attendance) return lesson.attendance;
    const a = {};
    ls.forEach(s => a[s.id] = true);
    return a;
  });
  const [topic, setTopic] = useState(lesson.topic || '');
  const [homework, setHomework] = useState(lesson.homework || '');
  const [homeworkStatusByStudent, setHomeworkStatusByStudent] = useState(() => {
    const map = {};
    ls.forEach(s => map[s.id] = getLessonHomeworkStatusForStudent(lesson, s.id));
    return map;
  });
  const [parentLessonCommentByStudent, setParentLessonCommentByStudent] = useState(() => {
    const map = {};
    ls.forEach(s => map[s.id] = getLessonParentCommentForStudent(lesson, s.id));
    return map;
  });
  const [progressByStudent, setProgressByStudent] = useState(() => {
    const map = {};
    ls.forEach(s => {
      const saved = normalizeLessonProgressEntry(getLessonProgressEntry(lesson.progressByStudent, s.id));
      const current = getStudyProgress(s);
      map[s.id] = {
        topicsDelta: saved.topicsDelta || 0,
        assimilationPercent: saved.assimilationPercent ?? current.assimilationPercent ?? ''
      };
    });
    return map;
  });
  const [previewStudentId, setPreviewStudentId] = useState(() => ls[0]?.id || null);
  const [lessonNote, setLessonNote] = useState(lesson.lessonNote || '');
  const [rating, setRating] = useState(lesson.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const presentStudents = ls.filter(s => att[s.id]);
  const chargeTotal = presentStudents.reduce((sum, s) => sum + (group?.rateOverrides?.[s.id] ?? s.rate), 0);
  const lessonTitle = lesson.type === 'group' ? group?.name || getLessonSubject(lesson, groups) : ls[0]?.name || getLessonSubject(lesson, groups);
  const previewStudent = ls.find(s => sameId(s.id, previewStudentId)) || ls[0];
  const previewStudentKey = previewStudent?.id;
  const homeworkStatus = previewStudentKey ? homeworkStatusByStudent[previewStudentKey] || 'unset' : 'unset';
  const homeworkStatusInfo = HOMEWORK_STATUS[homeworkStatus] || HOMEWORK_STATUS.unset;
  const parentPreviewComment = previewStudentKey ? String(parentLessonCommentByStudent[previewStudentKey] || '').trim() : '';
  const parentPreviewTopic = topic.trim();
  const parentPreviewHomework = homework.trim();
  const previewStudyProgress = previewStudent ? getStudyProgress(previewStudent) : null;
  const previewProgressEntry = previewStudentKey ? progressByStudent[previewStudentKey] || {} : {};
  const previewTopicsDelta = clampCount(previewProgressEntry.topicsDelta);
  const previewCompletedAfter = previewStudyProgress ? Math.max(0, previewStudyProgress.completedTopics + (att[previewStudentKey] === false ? 0 : previewTopicsDelta)) : 0;
  const previewTheoryAfter = previewStudyProgress?.totalTopics ? clampPercent(Math.min(previewStudyProgress.totalTopics, previewCompletedAfter) / previewStudyProgress.totalTopics * 100) : null;
  const setStudentHomeworkStatus = (studentId, status) => {
    setPreviewStudentId(studentId);
    setHomeworkStatusByStudent(p => ({
      ...p,
      [studentId]: status
    }));
  };
  const setStudentParentComment = (studentId, value) => {
    setPreviewStudentId(studentId);
    setParentLessonCommentByStudent(p => ({
      ...p,
      [studentId]: value
    }));
  };
  const setStudentProgressField = (studentId, field, value) => {
    setPreviewStudentId(studentId);
    setProgressByStudent(p => ({
      ...p,
      [studentId]: {
        ...(p[studentId] || {}),
        [field]: value
      }
    }));
  };
  const setAllProgressField = (field, value) => {
    const next = {};
    ls.forEach(s => {
      if (!att[s.id]) return;
      next[s.id] = {
        ...(progressByStudent[s.id] || {}),
        [field]: value
      };
    });
    setProgressByStudent(p => ({
      ...p,
      ...next
    }));
  };
  const setAllAttendance = present => {
    const next = {};
    ls.forEach(s => next[s.id] = present);
    setAtt(next);
  };
  const setHomeworkForPresent = status => {
    const next = {};
    ls.forEach(s => {
      if (att[s.id]) next[s.id] = status;
    });
    setHomeworkStatusByStudent(p => ({
      ...p,
      ...next
    }));
  };
  const applyFastProgress = () => {
    const next = {};
    ls.forEach(s => {
      if (!att[s.id]) return;
      next[s.id] = {
        ...(progressByStudent[s.id] || {}),
        topicsDelta: 1,
        assimilationPercent: 85
      };
    });
    setProgressByStudent(p => ({
      ...p,
      ...next
    }));
  };
  const presentReadyCount = ls.filter(s => att[s.id]).length;
  const homeworkMarkedCount = ls.filter(s => att[s.id] && (homeworkStatusByStudent[s.id] || 'unset') !== 'unset').length;
  const progressMarkedCount = ls.filter(s => {
    if (!att[s.id]) return false;
    const entry = normalizeLessonProgressEntry(progressByStudent[s.id] || {});
    return entry.topicsDelta || entry.assimilationPercent != null;
  }).length;
  const submit = e => {
    e.preventDefault();
    const primaryStudentId = ls[0]?.id;
    const nextHomeworkStatusByStudent = {};
    const nextParentCommentByStudent = {};
    const nextProgressByStudent = {};
    ls.forEach(s => {
      nextHomeworkStatusByStudent[s.id] = homeworkStatusByStudent[s.id] || 'unset';
      nextParentCommentByStudent[s.id] = String(parentLessonCommentByStudent[s.id] || '').trim();
      const progressEntry = normalizeLessonProgressEntry(progressByStudent[s.id] || {});
      if (att[s.id] && (progressEntry.topicsDelta || progressEntry.assimilationPercent != null)) {
        nextProgressByStudent[s.id] = progressEntry;
      }
    });
    onSave(lesson.id, att, {
      topic,
      homework,
      homeworkStatus: lesson.type === 'group' ? 'unset' : nextHomeworkStatusByStudent[primaryStudentId] || 'unset',
      homeworkStatusByStudent: nextHomeworkStatusByStudent,
      parentLessonComment: lesson.type === 'group' ? '' : nextParentCommentByStudent[primaryStudentId] || '',
      parentLessonCommentByStudent: nextParentCommentByStudent,
      progressByStudent: nextProgressByStudent,
      lessonNote,
      rating
    });
  };
  return _jsxs(Modal, {
    title: lesson.status === 'completed' ? "Редактировать закрытие" : "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0443\u0440\u043E\u043A",
    onClose: onClose,
    className: "attendance-flow-modal",
    children: [_jsxs("div", {
      className: "attendance-flow-hero",
      children: [_jsxs("div", {
        children: [_jsx("span", {
          children: "\u041F\u043E\u0441\u043B\u0435\u0443\u0440\u043E\u0447\u043D\u043E\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435"
        }), _jsx("strong", {
          children: lessonTitle
        }), _jsxs("p", {
          children: [fmtDate(lesson.date), " \u00B7 ", lesson.time, " \u00B7 ", getLessonSubject(lesson, groups)]
        })]
      }), _jsxs("div", {
        className: "attendance-flow-kpis",
        children: [_jsxs("div", {
          children: [_jsx("span", {
            children: "\u041F\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044E\u0442"
          }), _jsxs("b", {
            children: [presentStudents.length, "/", ls.length]
          })]
        }), _jsxs("div", {
          children: [_jsx("span", {
            children: "\u0421\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
          }), _jsx("b", {
            children: money(chargeTotal)
          })]
        })]
      })]
    }), _jsxs("form", {
      onSubmit: submit,
      className: "attendance-flow-form",
      children: [_jsxs("section", {
        className: "attendance-quick-panel",
        children: [_jsxs("div", {
          className: "attendance-flow-section-head",
          children: [_jsxs("div", {
            children: [_jsx("span", {
              children: "1. Сначала закрываем факт урока"
            }), _jsx("strong", {
              children: "Кто был и что спишется"
            })]
          }), _jsxs("b", {
            children: [presentReadyCount, "/", ls.length, " присутствуют"]
          })]
        }), _jsxs("div", {
          className: "attendance-quick-actions",
          children: [_jsx("button", {
            type: "button",
            className: "btn btn-sm btn-black",
            onClick: () => setAllAttendance(true),
            children: "Все были"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => setAllAttendance(false),
            children: "Никого"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => setHomeworkForPresent('done'),
            children: "ДЗ сделано"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => setHomeworkForPresent('partial'),
            children: "ДЗ частично"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => setHomeworkForPresent('not_done'),
            children: "ДЗ не сделано"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: applyFastProgress,
            children: "+1 тема · 85%"
          })]
        }), _jsxs("div", {
          className: "attendance-close-meter",
          children: [_jsxs("span", {
            children: ["Прошлое ДЗ: ", homeworkMarkedCount, "/", presentReadyCount || 0]
          }), _jsxs("span", {
            children: ["Прогресс: ", progressMarkedCount, "/", presentReadyCount || 0]
          }), _jsxs("span", {
            children: ["Списание: ", money(chargeTotal)]
          })]
        }), _jsx("div", {
          className: "attendance-presence-list",
          children: ls.map(s => {
            const rate = group?.rateOverrides?.[s.id] ?? s.rate;
            const present = att[s.id] || false;
            return _jsxs("button", {
              type: "button",
              className: `attendance-presence-row ${present ? 'active' : ''}`,
              onClick: () => setAtt(p => ({
                ...p,
                [s.id]: !p[s.id]
              })),
              children: [_jsxs("span", {
                children: [_jsx("strong", {
                  children: s.name
                }), _jsx("small", {
                  children: present ? `${money(s.balance)} → ${money(s.balance - rate)}` : "деньги не спишутся"
                })]
              }), _jsx("i", {
                children: present ? "был" : "нет"
              })]
            }, s.id);
          })
        })]
      }), _jsx(FormField, {
        label: "\u0422\u0435\u043C\u0430 \u0443\u0440\u043E\u043A\u0430",
        children: _jsx("input", {
          className: "input",
          value: topic,
          onChange: e => setTopic(e.target.value),
          placeholder: "\u0427\u0442\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u043B\u0438"
        })
      }), _jsx(FormField, {
        label: "Новое ДЗ к следующему уроку",
        children: _jsxs(_Fragment, {
          children: [_jsx("textarea", {
            className: "input",
            value: homework,
            onChange: e => setHomework(e.target.value),
            placeholder: "Что задать к следующему уроку",
            style: {
              minHeight: 64,
              resize: 'vertical'
            }
          }), _jsx("small", {
            className: "field-help",
            children: "\u041F\u0440\u043E\u0448\u043B\u043E\u0435 \u0414\u0417 \u0431\u044B\u0441\u0442\u0440\u043E \u043E\u0442\u043C\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u043A\u043D\u043E\u043F\u043A\u0430\u043C\u0438 \u0432\u044B\u0448\u0435. \u041F\u043E \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C \u0438 \u043F\u0440\u043E\u0446\u0435\u043D\u0442\u0430\u043C - \u0432 \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u043C \u043E\u0442\u0447\u0451\u0442\u0435."
          })]
        })
      }), _jsxs("section", {
        className: `attendance-details-toggle-panel ${detailsOpen ? 'open' : ''}`,
        children: [_jsxs("button", {
          type: "button",
          className: "attendance-details-toggle",
          onClick: () => setDetailsOpen(v => !v),
          children: [_jsxs("span", {
            children: [_jsx("strong", {
              children: "\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u044B\u0439 \u043E\u0442\u0447\u0451\u0442"
            }), _jsx("small", {
              children: "\u0414\u0417 \u043F\u043E \u0443\u0447\u0435\u043D\u0438\u043A\u0430\u043C, \u0443\u0441\u0432\u043E\u0435\u043D\u0438\u0435, \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0438 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044E"
            })]
          }), _jsx("b", {
            children: detailsOpen ? "\u0421\u043A\u0440\u044B\u0442\u044C" : "\u041E\u0442\u043A\u0440\u044B\u0442\u044C"
          })]
        }), detailsOpen && _jsxs("div", {
          className: "attendance-details-body",
          children: [lesson.type === 'group' ? _jsx(FormField, {
        label: "Проверка прошлого ДЗ по ученикам",
        children: _jsx("div", {
          className: "attendance-student-parent-list",
          children: ls.map(s => {
            const studentStatus = homeworkStatusByStudent[s.id] || 'unset';
            const studentStatusInfo = HOMEWORK_STATUS[studentStatus] || HOMEWORK_STATUS.unset;
            const active = sameId(s.id, previewStudentKey);
            return _jsxs("div", {
              className: `attendance-student-parent-card ${active ? 'active' : ''}`,
              children: [_jsxs("div", {
                className: "attendance-student-parent-head",
                children: [_jsxs("button", {
                  type: "button",
                  onClick: () => setPreviewStudentId(s.id),
                  children: [_jsx("strong", {
                    children: s.name
                  }), _jsx("span", {
                    children: att[s.id] ? "был на уроке" : "не был на уроке"
                  })]
                }), _jsx("b", {
                  className: `homework-status-pill ${studentStatusInfo.tone}`,
                  children: studentStatusInfo.short
                })]
              }), _jsx("div", {
                className: "homework-status-grid compact",
                children: Object.entries(HOMEWORK_STATUS).map(([key, info]) => _jsx("button", {
                  type: "button",
                  className: `homework-status-btn ${studentStatus === key ? 'active' : ''} ${info.tone}`,
                  onClick: () => setStudentHomeworkStatus(s.id, key),
                  children: info.label
                }, key))
              }), _jsx("textarea", {
                className: "input",
                value: parentLessonCommentByStudent[s.id] || '',
                onFocus: () => setPreviewStudentId(s.id),
                onChange: e => setStudentParentComment(s.id, e.target.value),
                placeholder: "Комментарий именно для родителя этого ученика",
                style: {
                  minHeight: 54,
                  resize: 'vertical'
                }
              })]
            }, s.id);
          })
        })
      }) : _jsxs(_Fragment, {
        children: [_jsx(FormField, {
          label: "\u0414\u0417 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0443\u0440\u043E\u043A\u0430",
          children: _jsx("div", {
            className: "homework-status-grid",
            children: Object.entries(HOMEWORK_STATUS).map(([key, info]) => _jsx("button", {
              type: "button",
              className: `homework-status-btn ${homeworkStatus === key ? 'active' : ''} ${info.tone}`,
              onClick: () => setStudentHomeworkStatus(previewStudentKey, key),
              children: info.label
            }, key))
          })
        }), _jsx(FormField, {
          label: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044E",
          children: _jsx("textarea", {
            className: "input",
            value: previewStudentKey ? parentLessonCommentByStudent[previewStudentKey] || '' : '',
            onChange: e => setStudentParentComment(previewStudentKey, e.target.value),
            placeholder: "\u041A\u043E\u0440\u043E\u0442\u043A\u043E: \u0447\u0442\u043E \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u043E\u0441\u044C, \u0433\u0434\u0435 \u043D\u0443\u0436\u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C, \u043D\u0430 \u0447\u0442\u043E \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435",
            style: {
              minHeight: 68,
              resize: 'vertical'
            }
          })
        })]
      }), _jsx(FormField, {
        label: "Прогресс урока",
        children: _jsx("div", {
          className: "attendance-progress-list",
          children: [ls.length > 1 && _jsxs("div", {
            className: "attendance-progress-bulk",
            children: [_jsx("span", {
              children: "Быстро для всех присутствующих"
            }), _jsxs("div", {
              children: [[0, 1, 2].map(n => _jsx("button", {
                type: "button",
                className: "btn btn-sm btn-white",
                onClick: () => setAllProgressField('topicsDelta', n),
                children: n === 0 ? "без тем" : `+${n}`
              }, n)), [65, 75, 85, 95].map(value => _jsx("button", {
                type: "button",
                className: "btn btn-sm btn-white",
                onClick: () => setAllProgressField('assimilationPercent', value),
                children: `${value}%`
              }, value))]
            })]
          }), ...ls.map(s => {
            const current = getStudyProgress(s);
            const entry = progressByStudent[s.id] || {};
            const delta = clampCount(entry.topicsDelta);
            const present = !!att[s.id];
            const after = Math.max(0, current.completedTopics + (present ? delta : 0));
            const afterCapped = current.totalTopics ? Math.min(current.totalTopics, after) : after;
            const percent = current.totalTopics ? clampPercent(afterCapped / current.totalTopics * 100) : null;
            const active = sameId(s.id, previewStudentKey);
            return _jsxs("div", {
              className: `attendance-progress-card ${active ? 'active' : ''} ${present ? '' : 'muted'}`,
              children: [_jsxs("div", {
                className: "attendance-progress-head",
                children: [_jsxs("button", {
                  type: "button",
                  onClick: () => setPreviewStudentId(s.id),
                  children: [_jsx("strong", {
                    children: s.name
                  }), _jsx("span", {
                    children: current.totalTopics ? `${afterCapped}/${current.totalTopics} тем · ${percent}%` : `${afterCapped} тем · общий план не задан`
                  })]
                }), _jsx("b", {
                  children: present ? `+${delta}` : "нет"
                })]
              }), _jsxs("div", {
                className: "attendance-progress-controls",
                children: [[0, 1, 2].map(n => _jsx("button", {
                  type: "button",
                  disabled: !present,
                  className: `btn btn-sm ${delta === n ? 'btn-black' : 'btn-white'}`,
                  onClick: () => setStudentProgressField(s.id, 'topicsDelta', n),
                  children: n === 0 ? "без тем" : `+${n}`
                }, n)), _jsxs("label", {
                  className: "attendance-assimilation-row",
                  children: [_jsx("span", {
                    children: "усвоение"
                  }), _jsx("input", {
                    className: "input",
                    type: "number",
                    min: "0",
                    max: "100",
                    disabled: !present,
                    value: entry.assimilationPercent ?? '',
                    onFocus: () => setPreviewStudentId(s.id),
                    onChange: e => setStudentProgressField(s.id, 'assimilationPercent', e.target.value),
                    placeholder: "%"
                  })]
                }), _jsx("div", {
                  className: "attendance-assimilation-presets",
                  children: [65, 75, 85, 95].map(value => _jsx("button", {
                    type: "button",
                    disabled: !present,
                    className: `btn btn-sm ${clampCount(entry.assimilationPercent) === value ? 'btn-black' : 'btn-white'}`,
                    onClick: () => setStudentProgressField(s.id, 'assimilationPercent', value),
                    children: `${value}%`
                  }, value))
                })]
              })]
            }, s.id);
          })]
        })
      }), _jsxs("div", {
        className: "attendance-parent-preview",
        children: [_jsxs("div", {
          className: "attendance-parent-preview-head",
          children: [_jsx("span", {
            children: lesson.type === 'group' && previewStudent ? `Видно родителю: ${previewStudent.name}` : "Видно родителю"
          }), _jsx("b", {
            children: parentPreviewComment ? "готово" : "можно не заполнять"
          })]
        }), _jsxs("div", {
          className: "attendance-parent-preview-body",
          children: [_jsxs("div", {
            children: [_jsx("strong", {
              children: "Тема"
            }), _jsx("span", {
              children: parentPreviewTopic || "не указана"
            })]
          }), _jsxs("div", {
            children: [_jsx("strong", {
              children: "Новое ДЗ"
            }), _jsx("span", {
              children: parentPreviewHomework || "не задана"
            })]
          }), _jsxs("div", {
            children: [_jsx("strong", {
              children: "ДЗ прошлого урока"
            }), _jsx("span", {
              className: `homework-status-pill ${homeworkStatusInfo.tone}`,
              children: homeworkStatusInfo.short
            })]
          }), _jsxs("div", {
            children: [_jsx("strong", {
              children: "Прогресс"
            }), _jsx("span", {
              children: previewStudyProgress?.totalTopics ? `${Math.min(previewStudyProgress.totalTopics, previewCompletedAfter)}/${previewStudyProgress.totalTopics} тем · ${previewTheoryAfter}%` : previewTopicsDelta ? `+${previewTopicsDelta} тем` : "без изменений"
            })]
          }), _jsx("p", {
            children: parentPreviewComment || "Если добавить комментарий, родитель увидит его отдельным блоком после сохранения урока."
          })]
        })]
      }), _jsx(FormField, {
        label: "\u041B\u0438\u0447\u043D\u0430\u044F \u0437\u0430\u043C\u0435\u0442\u043A\u0430 \u0440\u0435\u043F\u0435\u0442\u0438\u0442\u043E\u0440\u0430",
        children: _jsx("textarea", {
          className: "input",
          value: lessonNote,
          onChange: e => setLessonNote(e.target.value),
          placeholder: "\u0427\u0442\u043E \u0432\u0430\u0436\u043D\u043E \u043F\u043E\u043C\u043D\u0438\u0442\u044C",
          style: {
            minHeight: 64,
            resize: 'vertical'
          }
        })
      }), _jsxs("div", {
        style: {
          marginBottom: 14
        },
        children: [_jsx("label", {
          className: "label",
          children: "\u041E\u0446\u0435\u043D\u043A\u0430 \u0443\u0440\u043E\u043A\u0430"
        }), _jsxs("div", {
          style: {
            display: 'flex',
            gap: 6,
            alignItems: 'center'
          },
          children: [[1, 2, 3, 4, 5].map(n => _jsx("button", {
            type: "button",
            onMouseEnter: () => setHoverRating(n),
            onMouseLeave: () => setHoverRating(0),
            onClick: () => setRating(rating === n ? 0 : n),
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 2px',
              fontSize: 26,
              lineHeight: 1,
              color: (hoverRating || rating) >= n ? 'var(--yellow)' : 'var(--border-dashed)',
              textShadow: 'none',
              transition: 'color .1s',
              filter: (hoverRating || rating) >= n ? 'drop-shadow(0 0 2px rgba(0,0,0,.3))' : 'none'
            },
            children: "\u2605"
          }, n)), rating > 0 && _jsx("span", {
            style: {
              fontSize: 11,
              color: 'var(--text-sec)',
              marginLeft: 4
            },
            children: ['', 'Слабо', 'Ниже среднего', 'Норм', 'Хорошо', 'Отлично'][rating]
          })]
        })]
      })]
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-green btn-full",
          children: lesson.status === 'completed' ? 'Сохранить' : 'Завершить урок'
        })]
      })]
    })]
  });
}
function LessonStatusModal({
  lesson,
  onClose,
  onStatus,
  onDelete,
  onReschedule
}) {
  const actions = [['planned', 'Вернуть в план', 'btn-blue'], ['cancelled_by_student', 'Отменил ученик', 'btn-white'], ['cancelled_by_tutor', 'Отменил репетитор', 'btn-white'], ['rescheduled', 'Перенесён', 'btn-white'], ['no_show', 'Неявка: списать оплату', 'btn-red']];
  return _jsxs(Modal, {
    title: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0443\u0440\u043E\u043A\u0430",
    onClose: onClose,
    children: [_jsxs("div", {
      style: {
        fontSize: 12,
        color: '#666',
        marginBottom: 12
      },
      children: [fmtDate(lesson.date), " \u0432 ", lesson.time]
    }), _jsxs("div", {
      style: {
        display: 'grid',
        gap: 8
      },
      children: [_jsx("button", {
        className: "btn btn-full btn-blue",
        onClick: () => onReschedule(lesson),
        children: "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0441 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0435\u043C \u043D\u043E\u0432\u043E\u0433\u043E"
      }), actions.map(([status, label, cls]) => _jsxs("button", {
        className: `btn btn-full ${cls}`,
        onClick: () => onStatus(lesson.id, status),
        children: [lesson.status === status ? '✓ ' : '', label]
      }, status)), _jsx("button", {
        className: "btn btn-full btn-black",
        onClick: e => onDelete(lesson.id, e),
        children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u0435"
      })]
    })]
  });
}
function LessonDeleteModal({
  lesson,
  onClose,
  onDeleteOne,
  onDeleteFuture
}) {
  return _jsxs(Modal, {
    title: "Удалить занятие",
    onClose: onClose,
    children: [_jsxs("div", {
      className: "series-delete-note",
      children: [_jsx("b", {
        children: "Это регулярное занятие."
      }), _jsx("span", {
        children: "Прошлые и проведённые уроки не изменятся."
      })]
    }), _jsxs("div", {
      className: "modal-actions vertical",
      children: [_jsx("button", {
        type: "button",
        className: "btn btn-white btn-full",
        onClick: e => onDeleteOne(lesson.id, e),
        children: `Только ${fmtDate(lesson.date)}`
      }), _jsx("button", {
        type: "button",
        className: "btn btn-red btn-full",
        onClick: e => onDeleteFuture(lesson.id, e),
        children: `${fmtDate(lesson.date)} и следующие`
      }), _jsx("button", {
        type: "button",
        className: "btn btn-black btn-full",
        onClick: onClose,
        children: "Не удалять"
      })]
    })]
  });
}
function ParentPortalPanel({
  student,
  students,
  groups,
  lessons,
  txs,
  onSave,
  onAcceptPaymentNotice,
  onDismissPaymentNotice
}) {
  const [copied, setCopied] = useState(false);
  const payload = buildParentPortalPayload(student, students, groups, lessons, txs);
  const portal = payload.portal;
  const link = portal.token ? parentPortalUrl(portal.token) : '';
  const notices = (portal.paymentNotices || []).filter(n => n.status !== 'hidden').sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  const savePatch = patch => onSave(student.id, {
    ...portal,
    ...patch
  });
  const ensureEnabled = () => savePatch({
    enabled: true,
    token: portal.token || createParentPortalToken()
  });
  const copyLink = async () => {
    const token = portal.token || createParentPortalToken();
    if (!portal.token || !portal.enabled) savePatch({
      enabled: true,
      token
    });
    await copyTextSafe(parentPortalUrl(token));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const option = (key, label, text) => _jsxs("button", {
    type: "button",
    className: `parent-option ${portal[key] ? 'active' : ''}`,
    onClick: () => savePatch({
      enabled: true,
      token: portal.token || createParentPortalToken(),
      [key]: !portal[key]
    }),
    children: [_jsx("strong", {
      children: label
    }), _jsx("span", {
      children: text
    })]
  }, key);
  return _jsxs("div", {
    className: "parent-portal-panel",
    children: [_jsxs("div", {
      className: `parent-portal-hero ${portal.enabled ? 'enabled' : ''}`,
      children: [_jsxs("div", {
        children: [_jsx("div", {
          className: "metric-label",
          children: "Родительская ссылка"
        }), _jsx("div", {
          className: "parent-portal-title",
          children: portal.enabled ? "Доступ включен" : "Доступ выключен"
        }), _jsx("div", {
          className: "parent-portal-text",
          children: "Родитель видит только безопасную выжимку: баланс, оплаты, ДЗ, прогресс и ближайшие уроки."
        })]
      }), _jsx("button", {
        className: `btn btn-sm ${portal.enabled ? 'btn-white' : 'btn-yellow'}`,
        onClick: portal.enabled ? () => savePatch({
          enabled: false
        }) : ensureEnabled,
        children: portal.enabled ? "Выключить" : "Включить"
      })]
    }), portal.enabled && _jsxs(_Fragment, {
      children: [_jsxs("div", {
        className: "parent-link-box",
        children: [_jsx("input", {
          className: "input",
          readOnly: true,
          value: link
        }), _jsx("button", {
          className: "btn btn-black",
          onClick: copyLink,
          children: copied ? "Скопировано" : "Копировать"
        }), _jsx("button", {
          className: "btn btn-white",
          onClick: () => window.open(link, '_blank'),
          children: "Открыть"
        })]
      }), _jsxs("div", {
        className: "parent-options-grid",
        children: [option('showFinance', 'Финансы', 'долг, аванс, объяснение баланса'), option('showPayments', 'Оплаты', 'последние платежи и списания'), option('showHomework', 'Домашки', 'выданные задания и выполнение'), option('showProgress', 'Прогресс', 'темы, рейтинг, динамика'), option('showSchedule', 'Расписание', 'ближайшие занятия'), option('allowPaymentNotice', 'Заявка оплаты', 'родитель сможет сообщить об оплате')]
      }), _jsx(FormField, {
        label: "Комментарий родителю",
        children: _jsx("textarea", {
          className: "input",
          value: portal.teacherComment || '',
          onChange: e => savePatch({
            teacherComment: e.target.value
          }),
          placeholder: "Например: на этой неделе хорошо пошла тема, нужно закрепить ДЗ.",
          style: {
            minHeight: 78,
            resize: 'vertical'
          }
        })
      }), notices.length > 0 && _jsxs("div", {
        className: "parent-notice-list",
        children: [_jsxs("div", {
          className: "parent-preview-head",
          children: [_jsx("span", {
            children: "Заявки от родителя"
          }), _jsxs("strong", {
            children: [notices.filter(n => n.status === 'new').length, " новых"]
          })]
        }), notices.map(n => _jsxs("div", {
          className: `parent-notice-item ${n.status || 'new'}`,
          children: [_jsxs("div", {
            children: [_jsxs("strong", {
              children: [money(Number(n.amount || 0)), n.status === 'accepted' ? " · принято" : ""]
            }), _jsx("span", {
              children: [n.comment || "Родитель сообщил об оплате", n.createdAt ? ` · ${new Date(n.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}` : ""]
            })]
          }), n.status === 'accepted' ? _jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => onDismissPaymentNotice(student.id, n.id),
            children: "Скрыть"
          }) : _jsxs("div", {
            className: "parent-notice-actions",
            children: [_jsx("button", {
              className: "btn btn-sm btn-green",
              onClick: () => onAcceptPaymentNotice(student.id, n.id),
              children: "Принять"
            }), _jsx("button", {
              className: "btn btn-sm btn-white",
              onClick: () => onDismissPaymentNotice(student.id, n.id),
              children: "Скрыть"
            })]
          })]
        }, n.id))]
      }), _jsxs("div", {
        className: "parent-preview-card",
        children: [_jsxs("div", {
          className: "parent-preview-head",
          children: [_jsx("span", {
            children: "Предпросмотр"
          }), _jsx("strong", {
            children: student.name
          })]
        }), _jsxs("div", {
          className: "parent-preview-grid",
          children: [_jsxs("div", {
            children: [_jsx("span", {
              children: "Баланс"
            }), _jsx("strong", {
              style: {
                color: balanceColor(payload.finance.balance)
              },
              children: balanceLabel(payload.finance.balance)
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "Следующий урок"
            }), _jsx("strong", {
              children: payload.nextLessons[0] ? `${fmtDate(payload.nextLessons[0].date)} ${payload.nextLessons[0].time}` : "не запланирован"
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "Домашки"
            }), _jsx("strong", {
              children: payload.homeworkDoneRate == null ? "нет данных" : `${payload.homeworkDoneRate}%`
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "Теория"
            }), _jsx("strong", {
              children: payload.theoryPercent == null ? "нет данных" : `${payload.theoryPercent}%`
            })]
          })]
        })]
      })]
    })]
  });
}
function ParentPortalPage({
  student,
  students,
  groups,
  lessons,
  txs,
  onPaymentNotice
}) {
  if (!student) return _jsxs("div", {
    className: "parent-public-page",
    children: [_jsx("main", {
      className: "parent-public-shell",
      children: _jsx(EmptyState, {
        title: "Ссылка недоступна",
        text: "Доступ мог быть выключен репетитором или ссылка была обновлена."
      })
    })]
  });
  const payload = buildParentPortalPayload(student, students, groups, lessons, txs);
  const portal = payload.portal;
  const [noticeAmount, setNoticeAmount] = useState(String(Math.max(0, Math.abs(Math.min(0, Number(payload.finance.balance || 0)))) || ''));
  const [noticeComment, setNoticeComment] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);
  const payments = txs.filter(tx => sameId(tx.studentId, student.id)).sort((a, b) => txSortKey(b).localeCompare(txSortKey(a))).slice(0, 6);
  const sendNotice = () => {
    const amount = Number(noticeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Укажите сумму оплаты.');
      return;
    }
    onPaymentNotice(student.id, {
      id: Date.now() + Math.random(),
      amount,
      comment: noticeComment.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    });
    setNoticeSent(true);
  };
  const financeEvents = payload.finance.events.slice(0, 6).reverse();
  const maxFinanceDelta = Math.max(1, ...financeEvents.map(ev => Math.abs(ev.delta)));
  const debtAmount = Math.abs(Math.min(0, Number(payload.finance.balance || 0)));
  const nextLesson = payload.nextLessons[0];
  const homeworkStats = payload.homeworkStats || {};
  const attendanceStats = payload.attendanceStats || {};
  const homeworkRate = homeworkStats.rate == null ? 'нет данных' : `${homeworkStats.rate}%`;
  const attendanceRate = attendanceStats.rate == null ? 'нет данных' : `${attendanceStats.rate}%`;
  const studyProgress = payload.studyProgress || getStudyProgress(student);
  const theoryRate = payload.theoryPercent == null ? 'нет данных' : `${payload.theoryPercent}%`;
  const assimilationRate = payload.assimilationPercent == null ? 'нет данных' : `${payload.assimilationPercent}%`;
  const latestMock = payload.latestMock;
  const latestMockRate = latestMock ? `${mockTestPercent(latestMock)}%` : 'нет данных';
  const mockAverageRate = payload.mockAveragePercent == null ? 'нет данных' : `${payload.mockAveragePercent}%`;
  const parentPrimaryAction = debtAmount ? `К оплате ${money(debtAmount)}` : payload.finance.balance > 0 ? `Предоплата ${money(payload.finance.balance)}` : 'Баланс закрыт';
  return _jsx("div", {
    className: "parent-public-page",
    children: _jsxs("main", {
      className: "parent-public-shell",
      children: [_jsxs("section", {
        className: "parent-public-hero",
        children: [_jsxs("div", {
          children: [_jsx("div", {
            className: "metric-label",
            children: "Кабинет ученика"
          }), _jsx("h1", {
            children: student.name
          }), _jsx("p", {
            children: portal.teacherComment || "Здесь собрана актуальная информация по занятиям: баланс, домашние задания, прогресс и ближайшее расписание."
          })]
        }), portal.showFinance && _jsxs("div", {
          className: "parent-balance-card",
          children: [_jsx("span", {
            children: "Баланс"
          }), _jsx("strong", {
            style: {
              color: balanceColor(payload.finance.balance)
            },
            children: balanceLabel(payload.finance.balance)
          })]
        })]
      }), _jsxs("section", {
        className: "parent-dashboard",
        children: [_jsxs("div", {
          className: "parent-dashboard-head",
          children: [_jsxs("div", {
            children: [_jsx("h2", {
              children: "\u0421\u0432\u043E\u0434\u043A\u0430 \u0434\u043B\u044F \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044F"
            }), _jsx("p", {
              children: "\u0413\u043B\u0430\u0432\u043D\u043E\u0435 \u043F\u043E \u0437\u0430\u043D\u044F\u0442\u0438\u044F\u043C, \u043E\u043F\u043B\u0430\u0442\u0430\u043C \u0438 \u0434\u043E\u043C\u0430\u0448\u043A\u0435 \u043D\u0430 \u043E\u0434\u043D\u043E\u043C \u044D\u043A\u0440\u0430\u043D\u0435."
            })]
          }), _jsx("strong", {
            className: debtAmount ? 'parent-action-badge debt' : 'parent-action-badge ok',
            children: parentPrimaryAction
          })]
        }), _jsxs("div", {
          className: "parent-kpi-grid",
          children: [_jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0443\u0440\u043E\u043A"
            }), _jsx("strong", {
              children: nextLesson ? `${fmtDate(nextLesson.date)} ${nextLesson.time}` : '\u043D\u0435\u0442 \u0432 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0438'
            }), _jsx("small", {
              children: nextLesson ? getLessonSubject(nextLesson, groups) : '\u0440\u0435\u043F\u0435\u0442\u0438\u0442\u043E\u0440 \u0434\u043E\u0431\u0430\u0432\u0438\u0442 \u0434\u0430\u0442\u0443 \u043F\u043E\u0437\u0436\u0435'
            })]
          }), _jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "\u0414\u043E\u043C\u0430\u0448\u043A\u0430"
            }), _jsx("strong", {
              children: homeworkRate
            }), _jsx("small", {
              children: `${homeworkStats.done || 0} \u0441\u0434\u0435\u043B\u0430\u043D\u043E \u00B7 ${homeworkStats.partial || 0} \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E \u00B7 ${homeworkStats.missed || 0} \u043D\u0435 \u0441\u0434\u0435\u043B\u0430\u043D\u043E`
            })]
          }), _jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "\u041F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C"
            }), _jsx("strong", {
              children: attendanceRate
            }), _jsx("small", {
              children: `${attendanceStats.done || 0} \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u043E \u00B7 ${attendanceStats.noShow || 0} \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u043E\u0432`
            })]
          }), _jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "Теория"
            }), _jsx("strong", {
              children: theoryRate
            }), _jsx("small", {
              children: studyProgress.totalTopics ? `${studyProgress.completedTopics} из ${studyProgress.totalTopics} тем` : "заполните отчёт ученика"
            })]
          }), _jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "Усвоение"
            }), _jsx("strong", {
              children: assimilationRate
            }), _jsx("small", {
              children: studyProgress.focus || "по оценке репетитора"
            })]
          }), _jsxs("div", {
            className: "parent-kpi-card",
            children: [_jsx("span", {
              children: "Пробники"
            }), _jsx("strong", {
              children: latestMockRate
            }), _jsx("small", {
              children: latestMock ? `${fmtDate(latestMock.date)} · среднее ${mockAverageRate}` : "результатов пока нет"
            })]
          })]
        }), _jsxs("div", {
          className: "parent-chart-grid",
          children: [_jsxs("div", {
            className: "parent-chart-card",
            children: [_jsxs("div", {
              className: "parent-chart-title",
              children: [_jsx("strong", {
                children: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B"
              }), _jsx("span", {
                children: payload.finance.events.length ? "\u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438" : "\u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"
              })]
            }), financeEvents.length ? financeEvents.map(ev => _jsxs("div", {
              className: "parent-money-bar",
              children: [_jsx("span", {
                children: fmtDate(ev.tx.date)
              }), _jsx("i", {
                className: ev.delta > 0 ? 'plus' : 'minus',
                style: {
                  width: `${Math.max(10, Math.round(Math.abs(ev.delta) / maxFinanceDelta * 100))}%`
                }
              }), _jsx("b", {
                children: `${ev.delta > 0 ? '+' : '-'}${money(Math.abs(ev.delta))}`
              })]
            }, ev.tx.id)) : _jsx("p", {
              className: "parent-muted",
              children: "\u041A\u043E\u0433\u0434\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043E\u043F\u043B\u0430\u0442\u044B \u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F, \u0437\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u043D\u0430 \u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0430."
            })]
          }), _jsxs("div", {
            className: "parent-chart-card",
            children: [_jsxs("div", {
              className: "parent-chart-title",
              children: [_jsx("strong", {
                children: "\u0414\u043E\u043C\u0430\u0448\u043A\u0430"
              }), _jsx("span", {
                children: homeworkStats.total ? `${homeworkStats.total} \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A` : "\u043D\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u043E\u043A"
              })]
            }), _jsxs("div", {
              className: "parent-stack-chart",
              children: [_jsx("i", {
                className: "good",
                style: {
                  flexGrow: homeworkStats.done || 0
                }
              }), _jsx("i", {
                className: "warn",
                style: {
                  flexGrow: homeworkStats.partial || 0
                }
              }), _jsx("i", {
                className: "bad",
                style: {
                  flexGrow: homeworkStats.missed || 0
                }
              })]
            }), _jsxs("div", {
              className: "parent-chart-legend",
              children: [_jsx("span", {
                children: "\u0441\u0434\u0435\u043B\u0430\u043D\u043E"
              }), _jsx("span", {
                children: "\u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E"
              }), _jsx("span", {
                children: "\u043D\u0435 \u0441\u0434\u0435\u043B\u0430\u043D\u043E"
              })]
            })]
          })]
        })]
      }), portal.showProgress && _jsxs("section", {
        className: "parent-public-section parent-study-public-section",
        children: [_jsxs("div", {
          className: "parent-study-head",
          children: [_jsxs("div", {
            children: [_jsx("h2", {
              children: "Учебный прогресс"
            }), _jsxs("p", {
              children: [studyProgress.subject, " · теория, усвоение и пробники"]
            })]
          }), _jsx("strong", {
            children: theoryRate
          })]
        }), _jsxs("div", {
          className: "parent-study-grid",
          children: [_jsxs("div", {
            className: "parent-study-main",
            children: [_jsxs("div", {
              className: "parent-study-meter-head",
              children: [_jsx("span", {
                children: "Темы кодификатора"
              }), _jsx("b", {
                children: studyProgress.totalTopics ? `${studyProgress.completedTopics}/${studyProgress.totalTopics}` : "нет данных"
              })]
            }), _jsx("div", {
              className: "parent-study-meter",
              children: _jsx("i", {
                style: {
                  width: `${payload.theoryPercent || 0}%`
                }
              })
            }), _jsxs("p", {
              children: ["Пройдено теории: ", _jsx("strong", {
                children: theoryRate
              }), ". Усвоение по оценке репетитора: ", _jsx("strong", {
                children: assimilationRate
              }), "."]
            }), studyProgress.focus && _jsxs("p", {
              children: ["Сейчас в фокусе: ", _jsx("strong", {
                children: studyProgress.focus
              })]
            })]
          }), _jsxs("div", {
            className: "parent-study-side",
            children: [_jsxs("div", {
              children: [_jsx("span", {
                children: "Последний пробник"
              }), _jsx("strong", {
                children: latestMockRate
              }), _jsx("small", {
                children: latestMock ? `${fmtDate(latestMock.date)} · ${latestMock.score}/${latestMock.maxScore}` : "пока не добавлен"
              })]
            }), _jsxs("div", {
              children: [_jsx("span", {
                children: "Среднее по пробникам"
              }), _jsx("strong", {
                children: mockAverageRate
              }), _jsx("small", {
                children: `${studyProgress.mockTests.length} результатов`
              })]
            })]
          })]
        }), studyProgress.mockTests.length > 0 && _jsx("div", {
          className: "parent-mock-list",
          children: studyProgress.mockTests.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 4).map(test => _jsxs("div", {
            children: [_jsx("b", {
              children: `${mockTestPercent(test)}%`
            }), _jsxs("span", {
              children: [fmtDate(test.date), " · ", test.score, "/", test.maxScore, test.comment ? ` · ${test.comment}` : ""]
            })]
          }, test.id))
        })]
      }), payload.parentComments.length > 0 && _jsxs("section", {
        className: "parent-public-section parent-comment-section",
        children: [_jsx("h2", {
          children: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043F\u043E\u0441\u043B\u0435 \u0443\u0440\u043E\u043A\u0430"
        }), payload.parentComments.map(l => {
          const statusInfo = HOMEWORK_STATUS[l.homeworkStatus || 'unset'] || HOMEWORK_STATUS.unset;
          return _jsxs("div", {
            className: "parent-lesson-comment",
            children: [_jsxs("div", {
              children: [_jsx("strong", {
                children: `${fmtDate(l.date)} \u00B7 ${getLessonSubject(l, groups)}`
              }), _jsx("span", {
                children: l.parentLessonComment
              }), _jsxs("div", {
                className: "parent-lesson-comment-meta",
                children: [l.topic && _jsxs("em", {
                  children: ["Тема: ", l.topic]
                }), l.homework && _jsxs("em", {
                  children: ["ДЗ: ", l.homework]
                }), l.homeworkStatus && l.homeworkStatus !== 'unset' && _jsx("b", {
                  className: `homework-status-pill ${statusInfo.tone}`,
                  children: statusInfo.short
                })]
              })]
            }), l.rating > 0 && _jsx("b", {
              className: "parent-rating-pill",
              children: `${l.rating}/5`
            })]
          }, l.id);
        })]
      }), portal.showSchedule && _jsxs("section", {
        className: "parent-public-section",
        children: [_jsx("h2", {
          children: "Ближайшие занятия"
        }), payload.nextLessons.length ? payload.nextLessons.map(l => _jsxs("div", {
          className: "parent-public-row",
          children: [_jsxs("div", {
            children: [_jsx("strong", {
              children: `${fmtDate(l.date)} ${l.time}`
            }), _jsx("span", {
              children: getLessonSubject(l, groups)
            })]
          }), _jsx("b", {
            children: LESSON_STATUS[l.status]?.label || l.status
          })]
        }, l.id)) : _jsx("p", {
          className: "parent-muted",
          children: "Ближайших уроков пока нет."
        })]
      }), portal.showFinance && _jsxs("section", {
        className: "parent-public-section",
        children: [_jsx("h2", {
          children: "Финансы"
        }), _jsxs("div", {
          className: "parent-finance-explain",
          children: [_jsx("strong", {
            children: balanceLabel(payload.finance.balance)
          }), _jsx("p", {
            children: payload.finance.balance < 0 ? buildDebtParentMessage(student, txs, lessons, groups).split('\n').slice(0, 5).join('\n') : "Сейчас долг не отображается. Если была недавняя оплата, она появится после отметки репетитором."
          })]
        }), portal.showPayments && payments.map(tx => _jsxs("div", {
          className: "parent-public-row",
          children: [_jsxs("div", {
            children: [_jsx("strong", {
              children: tx.comment || (tx.type === 'payment' ? "Оплата" : "Списание")
            }), _jsx("span", {
              children: fmtDate(tx.date)
            })]
          }), _jsx("b", {
            className: tx.type === 'payment' ? 'balance-plus' : 'balance-minus',
            children: `${tx.type === 'payment' ? '+' : '-'}${money(tx.amount)}`
          })]
        }, tx.id)), portal.allowPaymentNotice && (noticeSent ? _jsx("div", {
          className: "parent-payment-sent",
          children: "Заявка отправлена репетитору. Баланс изменится после подтверждения."
        }) : _jsxs("div", {
          className: "parent-payment-form",
          children: [_jsx("input", {
            className: "input",
            type: "number",
            min: "1",
            placeholder: "Сумма оплаты",
            value: noticeAmount,
            onChange: e => setNoticeAmount(e.target.value)
          }), _jsx("input", {
            className: "input",
            placeholder: "Комментарий, если нужно",
            value: noticeComment,
            onChange: e => setNoticeComment(e.target.value)
          }), _jsx("button", {
            className: "btn btn-yellow btn-full",
            onClick: sendNotice,
            children: "Я оплатил(а)"
          })]
        }))]
      }), portal.showHomework && _jsxs("section", {
        className: "parent-public-section",
        children: [_jsxs("h2", {
          children: ["Домашние задания", payload.homeworkDoneRate != null ? ` · ${payload.homeworkDoneRate}%` : ""]
        }), (() => {
          const rows = payload.homeworkStatusLessons.length ? payload.homeworkStatusLessons : payload.homeworkLessons;
          return rows.length ? rows.map(l => {
            const statusInfo = HOMEWORK_STATUS[l.homeworkStatus || 'unset'] || HOMEWORK_STATUS.unset;
            return _jsxs("div", {
              className: "parent-homework-card",
              children: [_jsxs("div", {
                children: [_jsx("strong", {
                  children: `${fmtDate(l.date)} · ${getLessonSubject(l, groups)}`
                }), _jsx("span", {
                  children: l.homework || "Статус ДЗ прошлого урока"
                })]
              }), _jsx("b", {
                className: `homework-status-pill ${statusInfo.tone}`,
                children: statusInfo.short
              })]
            }, l.id);
          }) : _jsx("p", {
          className: "parent-muted",
          children: "Домашние задания пока не добавлены."
          });
        })()]
      }), portal.showProgress && _jsxs("section", {
        className: "parent-public-section",
        children: [_jsx("h2", {
          children: "Активность по предметам"
        }), payload.progress.length ? payload.progress.map(row => _jsxs("div", {
          className: "parent-progress-row",
          children: [_jsxs("div", {
            children: [_jsx("strong", {
              children: row.subject
            }), _jsxs("span", {
              children: [row.lessons, " занятий", row.avg ? ` · средняя оценка ${row.avg.toFixed(1)}` : ""]
            })]
          }), _jsx("div", {
            className: "parent-progress-track",
            children: _jsx("i", {
              style: {
                width: `${Math.min(100, row.lessons * 16)}%`
              }
            })
          })]
        }, row.subject)) : _jsx("p", {
          className: "parent-muted",
          children: "Активность появится после проведённых уроков."
        })]
      })]
    })
  });
}
function StudentDetailModal({
  student,
  lessons,
  txs,
  groups,
  students,
  onClose,
  onEdit,
  onProfile,
  onPay,
  onLesson,
  onGroupLesson,
  onPackage,
  onMessage,
  onReport,
  onArchive,
  onSaveParentPortal,
  onAcceptPaymentNotice,
  onDismissPaymentNotice
}) {
  const [detailTab, setDetailTab] = useState('overview');
  const ownLessons = lessons.filter(l => l.type === 'individual' ? sameId(l.targetId, student.id) : groups.find(g => sameId(g.id, l.targetId))?.studentIds?.some(id => sameId(id, student.id))).map(l => withStudentLessonMeta(l, student.id)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const completed = ownLessons.filter(l => l.status === 'completed' || l.status === 'no_show');
  const skipped = completed.filter(l => l.attendance?.[student.id] === false || l.status === 'no_show').length;
  const attended = completed.length - skipped;
  const studentTxs = txs.filter(tx => sameId(tx.studentId, student.id));
  const finance = getStudentFinanceSummary(student, txs, lessons, groups);
  const plannedLessons = ownLessons.filter(l => l.status === 'planned').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const seenLessonRows = new Set();
  const displayLessons = [...plannedLessons.slice(0, 8), ...completed.slice(0, 22)].filter(l => {
    const key = `${l.type}-${l.targetId}-${l.date}-${l.time}-${l.status}`;
    if (seenLessonRows.has(key)) return false;
    seenLessonRows.add(key);
    return true;
  });
  const homeworkLessons = ownLessons.filter(l => l.homework || l.homeworkStatus && l.homeworkStatus !== 'unset').slice(0, 12);
  const tabs = [['overview', 'Обзор'], ['lessons', `Занятия ${ownLessons.length}`], ['finance', 'Финансы'], ['parent', 'Родителям'], ['notes', 'Заметки']];
  const memberGroups = groups.filter(g => !g.archived && g.studentIds?.some(id => sameId(id, student.id)));
  return _jsxs(Modal, {
    title: student.name,
    onClose: onClose,
    children: [_jsxs("div", {
      className: "stat-row",
      children: [_jsxs("div", {
        className: "stat-card",
        children: [_jsx("div", {
          className: "stat-label",
          children: "\u0411\u0430\u043B\u0430\u043D\u0441"
        }), _jsx("div", {
          className: "stat-value",
          style: {
            color: balanceColor(finance.balance)
          },
          children: money(finance.balance)
        })]
      }), _jsxs("div", {
        className: "stat-card",
        children: [_jsx("div", {
          className: "stat-label",
          children: "\u0410\u0431\u043E\u043D\u0435\u043C\u0435\u043D\u0442"
        }), _jsx("div", {
          className: "stat-value",
          children: student.packageLessons || 0
        })]
      }), _jsxs("div", {
        className: "stat-card",
        children: [_jsx("div", {
          className: "stat-label",
          children: "\u041F\u043E\u0441\u0435\u0449\u0430\u0435\u043C\u043E\u0441\u0442\u044C"
        }), _jsxs("div", {
          className: "stat-value",
          children: [completed.length ? Math.round(attended / completed.length * 100) : 0, "%"]
        })]
      }), _jsxs("div", {
        className: "stat-card",
        children: [_jsx("div", {
          className: "stat-label",
          children: "\u0411\u0443\u0434\u0443\u0449\u0438\u0435"
        }), _jsx("div", {
          className: "stat-value",
          children: plannedLessons.length
        })]
      })]
    }), _jsxs("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 14
      },
      children: [student.balance < 0 && _jsx("button", {
        className: "btn btn-green btn-full",
        onClick: () => onPay(student.id),
        children: "\u041E\u043F\u043B\u0430\u0442\u0438\u043B \u0434\u043E\u043B\u0433"
      }), _jsx("button", {
        className: "btn btn-black btn-full",
        onClick: () => onLesson(student.id),
        children: "\u0423\u0440\u043E\u043A"
      }), _jsx("button", {
        className: "btn btn-blue btn-full",
        onClick: () => onPackage(student),
        children: "\u0410\u0431\u043E\u043D\u0435\u043C\u0435\u043D\u0442"
      }), _jsx("button", {
        className: "btn btn-yellow btn-full",
        onClick: onProfile,
        children: "\u041A\u0430\u0440\u0442\u0430"
      }), _jsx("button", {
        className: "btn btn-green btn-full",
        onClick: onReport,
        children: "Отчёт"
      }), _jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onEdit,
        children: "\u041F\u0440\u0430\u0432\u0438\u0442\u044C"
      }), _jsx("button", {
        className: `btn btn-full ${student.archived ? 'btn-green' : 'btn-white'}`,
        onClick: () => onArchive(student.id, !student.archived),
        children: student.archived ? 'Вернуть' : 'В архив'
      })]
    }), _jsx("div", {
      className: "detail-tabs",
      children: tabs.map(([id, label]) => _jsx("button", {
        className: `detail-tab ${detailTab === id ? 'active' : ''}`,
        onClick: () => setDetailTab(id),
        children: label
      }, id))
    }), detailTab === 'overview' && _jsxs(_Fragment, {
      children: [_jsxs("div", {
        className: "balance-trust-card",
        children: [_jsxs("div", {
          className: "balance-trust-main",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u0411\u0430\u043B\u0430\u043D\u0441 \u0441\u0435\u0439\u0447\u0430\u0441"
          }), finance.balance < 0 ? _jsx("button", {
            type: "button",
            className: "balance-trust-value balance-debt-button",
            style: {
              color: balanceColor(finance.balance)
            },
            onClick: () => onMessage(student, 'debt'),
            children: balanceLabel(finance.balance)
          }) : _jsx("div", {
            className: "balance-trust-value",
            style: {
              color: balanceColor(finance.balance)
            },
            children: balanceLabel(finance.balance)
          }), _jsx("div", {
            className: "metric-sub",
            children: finance.hasHistory ? `Последняя операция: ${finance.events[0] ? fmtDate(finance.events[0].tx.date) : 'стартовый баланс'}` : 'Операций пока нет'
          })]
        }), _jsxs("div", {
          className: "balance-trust-side",
          children: [_jsxs("div", {
            children: [_jsx("span", {
              children: "\u0420\u0430\u0441\u0447\u0435\u0442"
            }), _jsx("strong", {
              children: money(finance.calculatedBalance)
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "\u0421\u043B\u0435\u0434. \u0443\u0440\u043E\u043A"
            }), _jsx("strong", {
              children: finance.nextLesson ? `${fmtDate(finance.nextLesson.date)} · ${money(finance.nextRate)}` : 'нет'
            })]
          }), _jsx("button", {
            className: "btn btn-sm btn-black",
            onClick: () => setDetailTab('finance'),
            children: "\u041F\u043E\u0447\u0435\u043C\u0443?"
          })]
        })]
      }), _jsxs("div", {
        className: "card",
        style: {
          padding: 12
        },
        children: [_jsx("div", {
          className: "label",
          children: "\u0421\u0432\u043E\u0434\u043A\u0430"
        }), _jsxs("div", {
          style: {
            fontSize: 12,
            lineHeight: 1.8
          },
          children: ["\u0421\u0442\u0430\u0432\u043A\u0430: ", _jsx("strong", {
            children: money(student.rate)
          }), _jsx("br", {}), "\u041F\u0440\u0435\u0434\u043C\u0435\u0442\u044B: ", _jsx("strong", {
            children: (student.subjects || ['История']).join(', ')
          }), _jsx("br", {}), "\u0423\u0440\u043E\u043A\u043E\u0432: ", _jsx("strong", {
            children: ownLessons.length
          }), " \xB7 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u043E ", _jsx("strong", {
            children: completed.length
          }), " \xB7 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u043E\u0432 ", _jsx("strong", {
            children: skipped
          }), _jsx("br", {}), student.goal && _jsxs(_Fragment, {
            children: ["\u0426\u0435\u043B\u044C: ", _jsx("strong", {
              children: student.goal
            }), _jsx("br", {})]
          }), student.notes && _jsxs(_Fragment, {
            children: ["\u0417\u0430\u043C\u0435\u0442\u043A\u0438: ", student.notes]
          })]
        })]
      }), getStudentLastHomework(student.id, lessons, groups) && _jsxs("div", {
        className: "card",
        style: {
          padding: 12
        },
        children: [_jsx("div", {
          className: "label",
          children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0434\u043E\u043C\u0430\u0448\u043A\u0430"
        }), _jsx("div", {
          style: {
            fontSize: 12,
            lineHeight: 1.6
          },
          children: getStudentLastHomework(student.id, lessons, groups)
        })]
      }), (() => {
        const ratedLessons = ownLessons.filter(l => l.status === 'completed' && l.rating > 0).slice(0, 12);
        if (ratedLessons.length < 2) return null;
        const avg = ratedLessons.reduce((s, l) => s + l.rating, 0) / ratedLessons.length;
        return _jsxs("div", {
          className: "card",
          style: {
            padding: 12
          },
          children: [_jsxs("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 11,
              fontWeight: 900,
              marginBottom: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            },
            children: [_jsx("span", {
              children: "\u041F\u0420\u041E\u0413\u0420\u0415\u0421\u0421"
            }), _jsxs("span", {
              style: {
                color: 'var(--text-sec)',
                fontSize: 10
              },
              children: ["\u0441\u0440. ", avg.toFixed(1), " / 5"]
            })]
          }), _jsx("div", {
            style: {
              display: 'flex',
              alignItems: 'flex-end',
              gap: 4,
              height: 50
            },
            children: ratedLessons.slice().reverse().map(l => _jsxs("div", {
              style: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              },
              children: [_jsx("div", {
                style: {
                  width: '100%',
                  background: l.rating >= 4 ? 'var(--green)' : l.rating >= 3 ? '#FF8C00' : 'var(--red)',
                  borderRadius: '3px 3px 0 0',
                  height: `${l.rating / 5 * 44}px`
                }
              }), _jsx("span", {
                style: {
                  fontSize: 8,
                  color: 'var(--text-muted)',
                  fontFamily: 'Martian Mono,monospace'
                },
                children: new Date(l.date + 'T00:00:00').toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'numeric'
                })
              })]
            }, l.id))
          })]
        });
      })()]
    }), detailTab === 'finance' && _jsxs(_Fragment, {
      children: [_jsxs("div", {
        className: "finance-panel balance-explain-panel",
        children: [_jsx("div", {
          className: "metric-label",
          children: "\u041F\u043E\u0447\u0435\u043C\u0443 \u0442\u0430\u043A\u043E\u0439 \u0431\u0430\u043B\u0430\u043D\u0441"
        }), finance.balance < 0 ? _jsx("button", {
          type: "button",
          className: "balance-trust-value balance-debt-button",
          style: {
            color: balanceColor(finance.balance)
          },
          onClick: () => onMessage(student, 'debt'),
          children: balanceLabel(finance.balance)
        }) : _jsx("div", {
          className: "balance-trust-value",
          style: {
            color: balanceColor(finance.balance)
          },
          children: balanceLabel(finance.balance)
        }), _jsxs("div", {
          className: "balance-explain-grid",
          children: [_jsxs("div", {
            children: [_jsx("span", {
              children: "\u0421\u0442\u0430\u0440\u0442"
            }), _jsx("strong", {
              children: money(finance.opening)
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0439"
            }), _jsx("strong", {
              children: finance.events.length
            })]
          }), _jsxs("div", {
            children: [_jsx("span", {
              children: "\u0420\u0430\u0441\u0447\u0435\u0442"
            }), _jsx("strong", {
              children: money(finance.calculatedBalance)
            })]
          })]
        }), finance.mismatch !== 0 && _jsx("div", {
          className: "balance-warning",
          children: "\u0415\u0441\u0442\u044C \u0440\u0430\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435 \u043C\u0435\u0436\u0434\u0443 \u0438\u0441\u0442\u043E\u0440\u0438\u0435\u0439 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043D\u044B\u043C \u0431\u0430\u043B\u0430\u043D\u0441\u043E\u043C. \u041D\u0443\u0436\u043D\u0430 \u043A\u043E\u0440\u0440\u0435\u043A\u0446\u0438\u044F."
        }), _jsxs("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 12
          },
          children: [_jsx("button", {
            className: "btn btn-green btn-full",
            onClick: () => onPay(student.id),
            children: finance.balance < 0 ? "\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0434\u043E\u043B\u0433" : "\u0412\u043D\u0435\u0441\u0442\u0438 \u043E\u043F\u043B\u0430\u0442\u0443"
          }), _jsx("button", {
            className: "btn btn-white btn-full",
            onClick: onEdit,
            children: "\u041F\u0440\u0430\u0432\u0438\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0430"
          })]
        })]
      }), finance.nextLesson && _jsxs("div", {
        className: "finance-panel",
        children: [_jsx("div", {
          className: "metric-label",
          children: "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
        }), _jsxs("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 13,
            fontWeight: 900
          },
          children: [fmtDate(finance.nextLesson.date), " \xB7 ", finance.nextLesson.time, " \xB7 ", money(finance.nextRate)]
        }), _jsxs("div", {
          className: "metric-sub",
          children: ["\u0415\u0441\u043B\u0438 \u0443\u0440\u043E\u043A \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D, \u0431\u0430\u043B\u0430\u043D\u0441 \u0441\u0442\u0430\u043D\u0435\u0442: ", money(finance.balance - finance.nextRate)]
        })]
      }), _jsx("div", {
        className: "balance-timeline",
        children: finance.events.length === 0 ? _jsx(EmptyState, {
          title: "\u0418\u0441\u0442\u043E\u0440\u0438\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
          text: "\u041A\u043E\u0433\u0434\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043E\u043F\u043B\u0430\u0442\u044B \u0438\u043B\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F, \u043E\u043D\u0438 \u0431\u0443\u0434\u0443\u0442 \u0440\u0430\u0441\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u0442\u044C \u0431\u0430\u043B\u0430\u043D\u0441."
        }) : finance.events.slice(0, 20).map(ev => _jsxs("div", {
          className: "balance-event",
          children: [_jsxs("div", {
            className: "balance-event-head",
            children: [_jsxs("div", {
              children: [_jsx("strong", {
                children: ev.title
              }), _jsxs("span", {
                children: [fmtDate(ev.tx.date), " \xB7 ", ev.source]
              })]
            }), _jsx("div", {
              className: ev.delta >= 0 ? 'balance-plus' : 'balance-minus',
              children: `${ev.delta >= 0 ? '+' : ''}${money(ev.delta)}`
            })]
          }), _jsx("div", {
            className: "balance-event-comment",
            children: ev.comment
          }), _jsxs("div", {
            className: "balance-event-flow",
            children: [money(ev.before), " \u2192 ", money(ev.after)]
          })]
        }, ev.tx.id))
      })]
    }), detailTab === 'lessons' && _jsx(_Fragment, {
      children: displayLessons.length === 0 ? _jsx(EmptyState, {
        title: "\u0423\u0440\u043E\u043A\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
        text: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u0443\u0440\u043E\u043A \u043F\u0440\u044F\u043C\u043E \u0438\u0437 \u043F\u0440\u043E\u0444\u0438\u043B\u044F \u0443\u0447\u0435\u043D\u0438\u043A\u0430.",
        action: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0443\u0440\u043E\u043A",
        onAction: () => onLesson(student.id)
      }) : displayLessons.slice(0, 30).map(l => _jsxs("div", {
        className: "crm-table-row",
        children: [_jsxs("div", {
          children: [_jsxs("div", {
            style: {
              fontWeight: 800,
              fontSize: 12
            },
            children: [fmtDate(l.date), " \xB7 ", l.time, " \xB7 ", l.subject || 'История']
          }), _jsxs("div", {
            style: {
              fontSize: 11,
              color: 'var(--text-sec)'
            },
            children: [l.type === 'group' ? getGroupDisplayName(groups.find(g => sameId(g.id, l.targetId)), students) : 'Индивидуально', " \xB7 ", LESSON_STATUS[l.status]?.label || l.status]
          })]
        }), (l.homework || l.homeworkStatus && l.homeworkStatus !== 'unset') && _jsxs("div", {
          style: {
            maxWidth: 240,
            textAlign: 'right'
          },
          children: [_jsx("span", {
            className: "badge badge-green",
            children: "\u0414\u0417"
          }), _jsx("div", {
            style: {
              marginTop: 4,
              fontSize: 11,
              lineHeight: 1.35,
              color: 'var(--text-sec)'
            },
            children: l.homework || (HOMEWORK_STATUS[l.homeworkStatus] || HOMEWORK_STATUS.unset).label
          })]
        })]
      }, l.id))
    }), detailTab === 'payments' && _jsx(_Fragment, {
      children: studentTxs.length === 0 ? _jsx(EmptyState, {
        title: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
        text: "\u041A\u043E\u0433\u0434\u0430 \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043E\u043F\u043B\u0430\u0442\u044B \u0438\u043B\u0438 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F, \u043E\u043D\u0438 \u0431\u0443\u0434\u0443\u0442 \u0437\u0434\u0435\u0441\u044C.",
        action: student.balance < 0 ? 'Оплатил долг' : 'Добавить абонемент',
        onAction: () => student.balance < 0 ? onPay(student.id) : onPackage(student)
      }) : studentTxs.slice(0, 30).map(tx => _jsxs("div", {
        className: "crm-table-row",
        children: [_jsxs("div", {
          children: [_jsxs("div", {
            style: {
              fontWeight: 800,
              fontSize: 12
            },
            children: [fmtDate(tx.date), " \xB7 ", tx.comment || (tx.type === 'payment' ? 'Оплата' : 'Списание')]
          }), _jsx("div", {
            style: {
              fontSize: 11,
              color: 'var(--text-sec)'
            },
            children: tx.type === 'payment' ? 'Поступление' : 'Списание'
          })]
        }), _jsxs("strong", {
          style: {
            color: tx.type === 'payment' ? 'var(--green)' : 'var(--red)'
          },
          children: [tx.type === 'payment' ? '+' : '-', money(tx.amount)]
        })]
      }, tx.id))
    }), detailTab === 'homework' && _jsx(_Fragment, {
      children: homeworkLessons.length === 0 ? _jsx(EmptyState, {
        title: "\u0414\u043E\u043C\u0430\u0448\u0435\u043A \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
        text: "\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u0443\u0440\u043E\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435, \u0438 \u043E\u043D\u043E \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0432 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u0443\u0447\u0435\u043D\u0438\u043A\u0430.",
        action: "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0443",
        onAction: () => onMessage(student)
      }) : homeworkLessons.map(l => {
        const statusInfo = HOMEWORK_STATUS[l.homeworkStatus || 'unset'] || HOMEWORK_STATUS.unset;
        return _jsxs("div", {
          className: "card homework-detail-card",
          style: {
            padding: 12
          },
          children: [_jsxs("div", {
            className: "homework-detail-head",
            children: [_jsxs("div", {
              className: "label",
              children: [fmtDate(l.date), " \xB7 ", l.time]
            }), l.homeworkStatus && l.homeworkStatus !== 'unset' && _jsx("span", {
              className: `homework-status-pill ${statusInfo.tone}`,
              children: statusInfo.label
            })]
          }), _jsx("div", {
            className: "homework-detail-text",
            children: l.homework || "\u0421\u0442\u0430\u0442\u0443\u0441 \u0414\u0417 \u043F\u0440\u043E\u0448\u043B\u043E\u0433\u043E \u0443\u0440\u043E\u043A\u0430"
          })]
        }, l.id);
      })
    }), detailTab === 'availability' && _jsxs(_Fragment, {
      children: [_jsxs("div", {
        className: "card",
        style: {
          padding: 12
        },
        children: [_jsx("div", {
          className: "label",
          children: "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435 \u043E\u043A\u043D\u0430 \u0443\u0447\u0435\u043D\u0438\u043A\u0430"
        }), _jsx("div", {
          style: {
            whiteSpace: 'pre-wrap',
            fontSize: 12,
            lineHeight: 1.7,
            color: student.availabilityNotes ? 'var(--black)' : 'var(--text-muted)'
          },
          children: student.availabilityNotes || 'Заполните доп. расписание в редакторе ученика: например, Пн 15:00-18:00.'
        })]
      }), memberGroups.length === 0 ? _jsx(EmptyState, {
        title: "\u0413\u0440\u0443\u043F\u043F \u0443 \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u043D\u0435\u0442",
        text: "\u041A\u043E\u0433\u0434\u0430 \u0443\u0447\u0435\u043D\u0438\u043A \u0431\u0443\u0434\u0435\u0442 \u0432 \u0433\u0440\u0443\u043F\u043F\u0435, \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043E\u0431\u0449\u0438\u0435 \u043E\u043A\u043D\u0430 \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0430."
      }) : memberGroups.map(g => {
        const members = g.studentIds.map(id => students.find(s => sameId(s.id, id))).filter(Boolean);
        const slots = commonAvailability(members);
        return _jsxs("div", {
          className: "card",
          style: {
            padding: 12
          },
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 6
            },
            children: g.name
          }), slots.length ? _jsx("div", {
            style: {
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap'
            },
            children: slots.map(slot => _jsx("button", {
              className: "btn btn-sm btn-white",
              onClick: () => onGroupLesson(g, nextDateForDow(slot.day), minToTime(slot.start)),
              children: `${DAY_FULL[slot.day]} ${minToTime(slot.start)}-${minToTime(slot.end)}`
            }, `${g.id}-${slot.day}-${slot.start}`))
          }) : _jsx("div", {
            style: {
              fontSize: 12,
              color: 'var(--text-sec)',
              lineHeight: 1.6
            },
            children: "\u041E\u0431\u0449\u0435 \u043E\u043A\u043D\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B. \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0434\u043E\u043F. \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0443 \u0432\u0441\u0435\u0445 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u0433\u0440\u0443\u043F\u043F\u044B."
          })]
        }, g.id);
      })]
    }), detailTab === 'parent' && _jsx(ParentPortalPanel, {
      student: student,
      students: students,
      groups: groups,
      lessons: lessons,
      txs: txs,
      onSave: onSaveParentPortal,
      onAcceptPaymentNotice: onAcceptPaymentNotice,
      onDismissPaymentNotice: onDismissPaymentNotice
    }), detailTab === 'notes' && _jsxs("div", {
      className: "card",
      style: {
        padding: 12
      },
      children: [_jsx("div", {
        className: "label",
        children: "\u0426\u0435\u043B\u044C"
      }), _jsx("div", {
        style: {
          fontSize: 12,
          lineHeight: 1.7,
          marginBottom: 12
        },
        children: student.goal || 'Цель не указана'
      }), _jsx("div", {
        className: "label",
        children: "\u0417\u0430\u043C\u0435\u0442\u043A\u0438"
      }), _jsx("div", {
        style: {
          fontSize: 12,
          lineHeight: 1.7,
          marginBottom: 12
        },
        children: student.notes || 'Заметок пока нет'
      }), _jsx("div", {
        className: "label",
        children: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C"
      }), _jsx("div", {
        style: {
          whiteSpace: 'pre-wrap',
          fontSize: 12,
          lineHeight: 1.7,
          marginBottom: 12,
          color: student.availabilityNotes ? 'var(--black)' : 'var(--text-muted)'
        },
        children: student.availabilityNotes || "\u0414\u043E\u043F. \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043D\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u043E"
      }), _jsx("div", {
        className: "label",
        children: "\u0421\u0442\u0430\u0432\u043A\u0438 \u043F\u043E \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u0430\u043C"
      }), _jsx("div", {
        style: {
          fontSize: 12,
          lineHeight: 1.8
        },
        children: Object.keys(student.lessonRates || {}).length ? Object.entries(student.lessonRates).map(([subject, rate]) => _jsxs("div", {
          children: [subject, ": ", _jsx("strong", {
            children: money(rate)
          })]
        }, subject)) : 'Используется базовая ставка'
      }), _jsx("button", {
        className: "btn btn-black btn-full",
        style: {
          marginTop: 12
        },
        onClick: onEdit,
        children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u043C\u0435\u0442\u043A\u0438"
      })]
    })]
  });
}
function StudentReportModal({
  student,
  students,
  groups,
  lessons,
  txs,
  onClose,
  onSave
}) {
  const ownLessons = getStudentLessons(student.id, lessons, groups, {
    includeArchived: true
  }).map(l => withStudentLessonMeta(l, student.id));
  const completed = ownLessons.filter(l => l.status === 'completed' || l.status === 'no_show');
  const homeworkStatusLessons = completed.filter(l => l.homeworkStatus && l.homeworkStatus !== 'unset');
  const homeworkTotal = homeworkStatusLessons.filter(l => l.homeworkStatus !== 'none').length;
  const homeworkScore = homeworkStatusLessons.reduce((sum, l) => sum + (l.homeworkStatus === 'done' ? 1 : l.homeworkStatus === 'partial' ? .5 : 0), 0);
  const homeworkRate = homeworkTotal ? Math.round(homeworkScore / homeworkTotal * 100) : null;
  const finance = getStudentFinanceSummary(student, txs, lessons, groups);
  const progress = getStudyProgress(student);
  const [subject, setSubject] = useState(progress.subject);
  const [totalTopics, setTotalTopics] = useState(progress.totalTopics || '');
  const [completedTopics, setCompletedTopics] = useState(progress.completedTopics || '');
  const [assimilationPercent, setAssimilationPercent] = useState(progress.assimilationPercent ?? '');
  const [focus, setFocus] = useState(progress.focus || '');
  const [mockTests, setMockTests] = useState(progress.mockTests);
  const [mockDate, setMockDate] = useState(getTodayDate());
  const [mockScore, setMockScore] = useState('');
  const [mockMax, setMockMax] = useState(100);
  const [mockComment, setMockComment] = useState('');
  const totalNum = clampCount(totalTopics);
  const completedNum = Math.min(totalNum || clampCount(completedTopics), clampCount(completedTopics));
  const theoryPercent = totalNum ? clampPercent(completedNum / totalNum * 100) : null;
  const mockAverage = averageMockPercent({
    mockTests
  });
  const addTopics = count => {
    const next = clampCount(completedTopics) + count;
    setCompletedTopics(totalNum ? Math.min(totalNum, next) : next);
  };
  const addMock = () => {
    const score = clampCount(mockScore);
    const maxScore = Math.max(1, clampCount(mockMax || 100));
    if (!score || score > maxScore) return;
    setMockTests(p => [{
      id: Date.now() + Math.random(),
      date: mockDate || getTodayDate(),
      title: 'Пробник',
      score,
      maxScore,
      comment: mockComment.trim()
    }, ...p].slice(0, 24));
    setMockScore('');
    setMockComment('');
  };
  const removeMock = id => setMockTests(p => p.filter(test => test.id !== id));
  const submit = e => {
    e.preventDefault();
    onSave({
      studyProgress: {
        subject: subject.trim() || student.subjects?.[0] || 'Предмет',
        totalTopics: totalNum,
        completedTopics: completedNum,
        assimilationPercent: assimilationPercent === '' ? null : clampPercent(assimilationPercent),
        focus: focus.trim(),
        mockTests
      }
    });
  };
  return _jsx(Modal, {
    title: `Отчёт · ${student.name}`,
    onClose: onClose,
    className: "student-report-modal",
    children: _jsxs("form", {
      onSubmit: submit,
      className: "student-report-form",
      children: [_jsxs("div", {
        className: "report-auto-grid",
        children: [_jsxs("div", {
          className: "report-auto-card",
          children: [_jsx("span", {
            children: "Баланс"
          }), _jsx("strong", {
            style: {
              color: balanceColor(finance.balance)
            },
            children: balanceLabel(finance.balance)
          }), _jsx("small", {
            children: "из оплат и списаний"
          })]
        }), _jsxs("div", {
          className: "report-auto-card",
          children: [_jsx("span", {
            children: "Занятий"
          }), _jsx("strong", {
            children: completed.length
          }), _jsx("small", {
            children: `${ownLessons.length} всего`
          })]
        }), _jsxs("div", {
          className: "report-auto-card",
          children: [_jsx("span", {
            children: "ДЗ"
          }), _jsx("strong", {
            children: homeworkRate == null ? "нет" : `${homeworkRate}%`
          }), _jsx("small", {
            children: homeworkTotal ? `${homeworkTotal} проверок` : "статусов пока нет"
          })]
        }), _jsxs("div", {
          className: "report-auto-card accent",
          children: [_jsx("span", {
            children: "Теория"
          }), _jsx("strong", {
            children: theoryPercent == null ? "нет" : `${theoryPercent}%`
          }), _jsx("small", {
            children: totalNum ? `${completedNum} из ${totalNum} тем` : "задайте объём"
          })]
        })]
      }), _jsxs("section", {
        className: "report-section",
        children: [_jsx("h3", {
          children: "Теория по кодификатору"
        }), _jsxs("div", {
          className: "profile-grid two",
          children: [_jsx(FormField, {
            label: "Предмет / направление",
            children: _jsx("input", {
              className: "input",
              value: subject,
              onChange: e => setSubject(e.target.value),
              placeholder: "История, общество, математика"
            })
          }), _jsx(FormField, {
            label: "Всего тем в плане",
            children: _jsx("input", {
              className: "input",
              type: "number",
              min: "0",
              value: totalTopics,
              onChange: e => setTotalTopics(e.target.value),
              placeholder: "Например 120"
            })
          }), _jsx(FormField, {
            label: "Пройдено тем",
            children: _jsx("input", {
              className: "input",
              type: "number",
              min: "0",
              value: completedTopics,
              onChange: e => setCompletedTopics(e.target.value),
              placeholder: "Например 43"
            })
          }), _jsx(FormField, {
            label: "Усвоение, %",
            children: _jsx("input", {
              className: "input",
              type: "number",
              min: "0",
              max: "100",
              value: assimilationPercent,
              onChange: e => setAssimilationPercent(e.target.value),
              placeholder: "Например 78"
            })
          })]
        }), _jsxs("div", {
          className: "report-quick-row",
          children: [_jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => addTopics(1),
            children: "+1 тема"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => addTopics(2),
            children: "+2 темы"
          }), _jsx("button", {
            type: "button",
            className: "btn btn-sm btn-white",
            onClick: () => addTopics(5),
            children: "+5 тем"
          }), [50, 65, 75, 85, 95].map(value => _jsx("button", {
            type: "button",
            className: `btn btn-sm ${clampCount(assimilationPercent) === value ? 'btn-black' : 'btn-white'}`,
            onClick: () => setAssimilationPercent(value),
            children: `${value}%`
          }, value))]
        }), _jsxs("div", {
          className: "report-track-card",
          children: [_jsxs("div", {
            children: [_jsx("span", {
              children: "Пройдено теории"
            }), _jsx("strong", {
              children: theoryPercent == null ? "0%" : `${theoryPercent}%`
            })]
          }), _jsx("div", {
            className: "report-track",
            children: _jsx("i", {
              style: {
                width: `${theoryPercent || 0}%`
              }
            })
          })]
        }), _jsx(FormField, {
          label: "Что сейчас в фокусе",
          children: _jsx("textarea", {
            className: "input",
            value: focus,
            onChange: e => setFocus(e.target.value),
            placeholder: "Например: повторить экономику, добрать аргументацию, закрепить тестовую часть",
            style: {
              minHeight: 72,
              resize: 'vertical'
            }
          })
        })]
      }), _jsxs("section", {
        className: "report-section",
        children: [_jsx("h3", {
          children: "Пробники"
        }), _jsxs("div", {
          className: "report-mock-entry",
          children: [_jsx("input", {
            className: "input",
            type: "date",
            value: mockDate,
            onChange: e => setMockDate(e.target.value)
          }), _jsx("input", {
            className: "input",
            type: "number",
            min: "0",
            value: mockScore,
            onChange: e => setMockScore(e.target.value),
            placeholder: "Балл"
          }), _jsx("input", {
            className: "input",
            type: "number",
            min: "1",
            value: mockMax,
            onChange: e => setMockMax(e.target.value),
            placeholder: "Макс."
          }), _jsx("button", {
            type: "button",
            className: "btn btn-black btn-full",
            onClick: addMock,
            children: "Добавить"
          })]
        }), _jsx("textarea", {
          className: "input",
          value: mockComment,
          onChange: e => setMockComment(e.target.value),
          placeholder: "Короткий комментарий к пробнику",
          style: {
            minHeight: 58,
            resize: 'vertical',
            marginTop: 8
          }
        }), _jsxs("div", {
          className: "report-mock-summary",
          children: [_jsxs("strong", {
            children: ["Среднее: ", mockAverage == null ? "нет данных" : `${mockAverage}%`]
          }), _jsxs("span", {
            children: ["Пробников: ", mockTests.length]
          })]
        }), _jsx("div", {
          className: "report-mock-list",
          children: mockTests.length ? mockTests.slice().sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8).map(test => _jsxs("div", {
            children: [_jsxs("div", {
              children: [_jsx("strong", {
                children: `${mockTestPercent(test)}%`
              }), _jsxs("span", {
                children: [fmtDate(test.date), " · ", test.score, "/", test.maxScore, test.comment ? ` · ${test.comment}` : ""]
              })]
            }), _jsx("button", {
              type: "button",
              className: "btn btn-sm btn-white",
              onClick: () => removeMock(test.id),
              children: "убрать"
            })]
          }, test.id)) : _jsx("p", {
            className: "parent-muted",
            children: "Пробников пока нет."
          })
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "Отмена"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-green btn-full",
          children: "Сохранить отчёт"
        })]
      })]
    })
  });
}
function PackageModal({
  student,
  onClose,
  onSave
}) {
  const [lessonsCount, setLessonsCount] = useState(4);
  const [amount, setAmount] = useState(student.rate * 4);
  const submit = e => {
    e.preventDefault();
    onSave(student.id, Number(lessonsCount), Number(amount));
  };
  return _jsx(Modal, {
    title: "\u0410\u0431\u043E\u043D\u0435\u043C\u0435\u043D\u0442",
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsxs("div", {
        className: "card modal-summary-card",
        children: [_jsx("div", {
          className: "label",
          children: "\u0423\u0447\u0435\u043D\u0438\u043A"
        }), _jsx("div", {
          className: "modal-summary-title",
          children: student.name
        }), _jsxs("div", {
          className: "modal-summary-meta",
          children: ["\u0421\u0435\u0439\u0447\u0430\u0441 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C: ", student.packageLessons || 0, " \u0437\u0430\u043D."]
        })]
      }), _jsx(FormField, {
        label: "\u0417\u0430\u043D\u044F\u0442\u0438\u0439 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
        children: _jsx("select", {
          className: "input",
          value: lessonsCount,
          onChange: e => {
            const n = Number(e.target.value);
            setLessonsCount(n);
            setAmount(student.rate * n);
          },
          children: [1, 2, 4, 6, 8, 10, 12].map(n => _jsxs("option", {
            value: n,
            children: [n, " \u0437\u0430\u043D."]
          }, n))
        })
      }), _jsx(FormField, {
        label: "\u041E\u043F\u043B\u0430\u0442\u0430 \u20BD",
        children: _jsx("input", {
          className: "input",
          type: "number",
          min: "0",
          value: amount,
          onChange: e => setAmount(e.target.value)
        })
      }), _jsx("div", {
        className: "empty-state modal-note-box",
        children: _jsx("div", {
          className: "modal-note-text",
          children: "\u0410\u0431\u043E\u043D\u0435\u043C\u0435\u043D\u0442 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0430\u043D\u0441\u043E\u043C: \u043E\u043F\u043B\u0430\u0442\u0430 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0442 \u0431\u0430\u043B\u0430\u043D\u0441, \u0430 \u043A\u0430\u0436\u0434\u044B\u0439 \u0443\u0440\u043E\u043A \u0441\u043F\u0438\u0448\u0435\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0438 1 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u0438\u0437 \u043F\u0430\u043A\u0435\u0442\u0430."
        })
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-green btn-full",
          children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"
        })]
      })]
    })
  });
}
function RescheduleModal({
  lesson,
  onClose,
  onSave
}) {
  const [date, setDate] = useState(lesson.date);
  const [time, setTime] = useState(lesson.time);
  const submit = e => {
    e.preventDefault();
    onSave(lesson.id, date, time);
  };
  return _jsx(Modal, {
    title: "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0443\u0440\u043E\u043A",
    onClose: onClose,
    children: _jsxs("form", {
      onSubmit: submit,
      children: [_jsxs("div", {
        className: "modal-muted-line",
        children: ["\u0421\u0442\u0430\u0440\u044B\u0439 \u0443\u0440\u043E\u043A: ", fmtDate(lesson.date), " \u0432 ", lesson.time]
      }), _jsxs("div", {
        className: "modal-two-col",
        children: [_jsx(FormField, {
          label: "\u041D\u043E\u0432\u0430\u044F \u0434\u0430\u0442\u0430",
          children: _jsx("input", {
            className: "input",
            type: "date",
            required: true,
            value: date,
            onChange: e => setDate(e.target.value)
          })
        }), _jsx(FormField, {
          label: "\u041D\u043E\u0432\u043E\u0435 \u0432\u0440\u0435\u043C\u044F",
          children: _jsx("input", {
            className: "input",
            type: "time",
            required: true,
            value: time,
            onChange: e => setTime(e.target.value)
          })
        })]
      }), _jsxs("div", {
        className: "modal-actions",
        children: [_jsx("button", {
          type: "button",
          className: "btn btn-white btn-full",
          onClick: onClose,
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }), _jsx("button", {
          type: "submit",
          className: "btn btn-blue btn-full",
          children: "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438"
        })]
      })]
    })
  });
}
function MessageModal({
  student,
  lesson,
  groups,
  lessons,
  txs,
  mode,
  templates,
  onClose,
  onSaveTemplate
}) {
  const debtTemplate = mode === 'debt' ? {
    id: 'debt_details',
    name: 'Долг подробно',
    body: buildDebtParentMessage(student, txs || [], lessons, groups)
  } : null;
  const allTemplates = [...(debtTemplate ? [debtTemplate] : []), ...DEFAULT_TEMPLATES, ...(templates || [])];
  const [selId, setSelId] = useState(debtTemplate?.id || allTemplates[0]?.id || '');
  const [editMode, setEditMode] = useState(false); // manage custom templates
  const [customText, setCustomText] = useState('');
  const [editingTpl, setEditingTpl] = useState(null); // {id,name,body} | 'new'
  const [newName, setNewName] = useState('');
  const [newBody, setNewBody] = useState('');
  const [copied, setCopied] = useState(false);
  const targetLesson = lesson || getStudentLessons(student.id, lessons, groups).filter(l => l.status === 'planned').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const lastHomework = getStudentLastHomework(student.id, lessons, groups);
  const selectedTpl = allTemplates.find(t => t.id === selId);
  const generatedText = selectedTpl ? renderTemplate(selectedTpl.body, student, targetLesson, lastHomework) : '';
  const text = customText || generatedText;

  // When template changes, reset custom override
  const pickTemplate = id => {
    setSelId(id);
    setCustomText('');
    setCopied(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const a = document.createElement('textarea');
      a.value = text;
      document.body.appendChild(a);
      a.select();
      document.execCommand('copy');
      a.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const openTg = async () => {
    if (!student.tgId) return;
    // Copy text to clipboard before opening TG
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const a = document.createElement('textarea');
      a.value = text;
      document.body.appendChild(a);
      a.select();
      document.execCommand('copy');
      a.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    const id = String(student.tgId).trim();
    window.open(id.startsWith('@') ? `https://t.me/${id.slice(1)}` : `https://t.me/${id}`, '_blank');
  };
  if (editMode) {
    const customTemplates = templates || [];
    return _jsxs(Modal, {
      title: "\u041C\u043E\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u044B",
      onClose: () => setEditMode(false),
      children: [_jsxs("div", {
        style: {
          fontSize: 11,
          color: '#666',
          marginBottom: 12
        },
        children: ["\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440\u044B: ", _jsx("code", {
          children: '{name}'
        }), " ", _jsx("code", {
          children: '{lessonDate}'
        }), " ", _jsx("code", {
          children: '{balance}'
        }), " ", _jsx("code", {
          children: '{homework}'
        })]
      }), editingTpl ? _jsxs("div", {
        children: [_jsx(FormField, {
          label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0448\u0430\u0431\u043B\u043E\u043D\u0430",
          children: _jsx("input", {
            className: "input",
            value: newName,
            onChange: e => setNewName(e.target.value),
            placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041E\u043F\u043E\u0437\u0434\u0430\u043D\u0438\u0435"
          })
        }), _jsx(FormField, {
          label: "\u0422\u0435\u043A\u0441\u0442",
          children: _jsx("textarea", {
            className: "input",
            value: newBody,
            onChange: e => setNewBody(e.target.value),
            style: {
              minHeight: 100,
              resize: 'vertical'
            },
            placeholder: "\u041F\u0440\u0438\u0432\u0435\u0442, {name}! ..."
          })
        }), _jsxs("div", {
          style: {
            display: 'flex',
            gap: 8
          },
          children: [_jsx("button", {
            className: "btn btn-white btn-full",
            onClick: () => {
              setEditingTpl(null);
              setNewName('');
              setNewBody('');
            },
            children: "\u041E\u0442\u043C\u0435\u043D\u0430"
          }), _jsx("button", {
            className: "btn btn-black btn-full",
            onClick: () => {
              if (!newName.trim() || !newBody.trim()) return;
              if (editingTpl === 'new') {
                onSaveTemplate([...customTemplates, {
                  id: 'custom_' + Date.now(),
                  name: newName,
                  body: newBody
                }]);
              } else {
                onSaveTemplate(customTemplates.map(t => t.id === editingTpl.id ? {
                  ...t,
                  name: newName,
                  body: newBody
                } : t));
              }
              setEditingTpl(null);
              setNewName('');
              setNewBody('');
            },
            children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"
          })]
        })]
      }) : _jsxs(_Fragment, {
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 10,
            fontWeight: 900,
            marginBottom: 8,
            color: '#666'
          },
          children: "\u0412\u0421\u0422\u0420\u041E\u0415\u041D\u041D\u042B\u0415"
        }), DEFAULT_TEMPLATES.map(t => _jsxs("div", {
          style: {
            padding: '8px 0',
            borderBottom: '1px solid #ddd',
            fontSize: 11
          },
          children: [_jsx("div", {
            style: {
              fontWeight: 700,
              marginBottom: 2
            },
            children: t.name
          }), _jsx("div", {
            style: {
              color: '#666',
              fontSize: 10
            },
            children: t.body
          })]
        }, t.id)), _jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 10,
            fontWeight: 900,
            margin: '14px 0 8px',
            color: '#666'
          },
          children: "\u041C\u041E\u0418 \u0428\u0410\u0411\u041B\u041E\u041D\u042B"
        }), customTemplates.length === 0 && _jsx("div", {
          style: {
            fontSize: 11,
            color: '#888',
            marginBottom: 12
          },
          children: "\u041D\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0445 \u0448\u0430\u0431\u043B\u043E\u043D\u043E\u0432"
        }), customTemplates.map(t => _jsxs("div", {
          style: {
            padding: '8px 0',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 8
          },
          children: [_jsxs("div", {
            className: "today-close-body",
            children: [_jsx("div", {
              style: {
                fontWeight: 700,
                fontSize: 11
              },
              children: t.name
            }), _jsx("div", {
              style: {
                color: '#666',
                fontSize: 10,
                marginTop: 2
              },
              children: t.body
            })]
          }), _jsxs("div", {
            style: {
              display: 'flex',
              gap: 4,
              flexShrink: 0
            },
            children: [_jsx("button", {
              className: "btn btn-sm btn-white",
              title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
              style: {
                padding: '4px 8px'
              },
              onClick: () => {
                setEditingTpl(t);
                setNewName(t.name);
                setNewBody(t.body);
              },
              children: _jsx(IcoEdit, {
                size: 13
              })
            }), _jsx("button", {
              className: "btn btn-sm btn-red",
              title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C",
              style: {
                padding: '4px 8px'
              },
              onClick: () => onSaveTemplate(customTemplates.filter(x => x.id !== t.id)),
              children: _jsx(IcoTrash, {
                size: 13
              })
            })]
          })]
        }, t.id)), _jsx("div", {
          style: {
            marginTop: 12,
            display: 'flex',
            gap: 8
          },
          children: _jsx("button", {
            className: "btn btn-black btn-full",
            onClick: () => {
              setEditingTpl('new');
              setNewName('');
              setNewBody('');
            },
            children: "+ \u041D\u043E\u0432\u044B\u0439 \u0448\u0430\u0431\u043B\u043E\u043D"
          })
        })]
      })]
    });
  }
  return _jsxs(Modal, {
    title: `${mode === 'debt' ? 'Сообщение о долге' : 'Сообщение'} · ${student.name}`,
    onClose: onClose,
    children: [_jsxs("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 12
      },
      children: [allTemplates.map(t => _jsx("button", {
        className: `btn btn-sm ${selId === t.id ? 'btn-black' : 'btn-white'}`,
        style: {
          padding: '5px 10px',
          fontSize: 9
        },
        onClick: () => pickTemplate(t.id),
        children: t.name
      }, t.id)), _jsxs("button", {
        className: "btn btn-sm btn-white",
        style: {
          padding: '5px 10px',
          fontSize: 9,
          marginLeft: 'auto'
        },
        onClick: () => setEditMode(true),
        children: [_jsx(IcoEdit, {
          size: 13
        }), " \u0428\u0430\u0431\u043B\u043E\u043D\u044B"]
      })]
    }), _jsx(FormField, {
      label: "\u0422\u0435\u043A\u0441\u0442",
      children: _jsx("textarea", {
        className: "input",
        value: customText || generatedText,
        onChange: e => setCustomText(e.target.value),
        style: {
          minHeight: 120,
          resize: 'vertical'
        }
      })
    }), customText && customText !== generatedText && _jsx("button", {
      style: {
        background: 'none',
        border: 'none',
        fontSize: 10,
        color: '#666',
        cursor: 'pointer',
        marginBottom: 8,
        padding: 0
      },
      onClick: () => setCustomText(''),
      children: "\u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0438\u0437 \u0448\u0430\u0431\u043B\u043E\u043D\u0430"
    }), _jsxs("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 4
      },
      children: [_jsx("button", {
        className: `btn btn-full ${copied ? 'btn-green' : 'btn-black'}`,
        onClick: copy,
        style: {
          flex: 2
        },
        children: copied ? '✓ Скопировано' : 'Скопировать'
      }), student.tgId && _jsxs("button", {
        className: "btn btn-blue btn-full",
        onClick: openTg,
        style: {
          flex: 1,
          gap: 4
        },
        children: [_jsx(IcoTg, {
          size: 14
        }), " TG"]
      })]
    })]
  });
}

// ── GROUP DETAIL MODAL ──────────────────────────────────────────────────────────
function GroupDetailModal({
  group,
  students,
  lessons,
  onClose,
  onEdit
}) {
  const members = group.studentIds.map(id => students.find(s => sameId(s.id, id))).filter(Boolean);
  const groupLessons = lessons.filter(l => l.type === 'group' && sameId(l.targetId, group.id));
  const upcoming = groupLessons.filter(l => l.status === 'planned').sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 5);
  const completedCount = groupLessons.filter(l => l.status === 'completed').length;
  return _jsxs(Modal, {
    title: `${group.emoji ? group.emoji + ' ' : ''}${getGroupDisplayName(group, students)}`,
    onClose: onClose,
    className: "group-detail-modal",
    children: [_jsxs("div", {
      className: "group-detail-summary",
      children: [_jsx("span", {
        className: "lesson-tag",
        style: {
          background: subjectColor(group.subject || 'История'),
          color: subjectTagText(group.subject || 'История')
        },
        children: group.subject || 'История'
      }), _jsxs("span", {
        className: "group-detail-meta",
        children: [completedCount, " \u043F\u0440\u043E\u0432\u0435\u0434\u0435\u043D\u043E \xB7 ", upcoming.length, " \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E"]
      }), group.archived && _jsx("span", {
        className: "badge badge-yellow",
        children: "\u0410\u0420\u0425\u0418\u0412"
      })]
    }), _jsxs("div", {
      className: "group-detail-section-title",
      children: ["\u0423\u0427\u0415\u041D\u0418\u041A\u0418 (", members.length, ")"]
    }), _jsx("div", {
      className: "group-detail-list",
      children: members.map(s => _jsxs("div", {
        className: "group-detail-row",
        children: [_jsx("span", {
          children: s.name
        }), _jsxs("span", {
          className: "group-detail-rate",
          children: [group.rateOverrides?.[s.id] !== undefined ? _jsxs(_Fragment, {
            children: [_jsx("s", {
              style: {
                opacity: .5
              },
              children: money(s.rate)
            }), " ", money(group.rateOverrides[s.id])]
          }) : money(s.rate), "/\u0443\u0440\u043E\u043A"]
        })]
      }, s.id))
    }), _jsx("div", {
      className: "group-detail-section-title",
      children: "\u0411\u041B\u0418\u0416\u0410\u0419\u0428\u0418\u0415 \u0423\u0420\u041E\u041A\u0418"
    }), upcoming.length === 0 ? _jsx("div", {
      className: "group-detail-empty",
      children: "\u041D\u0435\u0442 \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u0443\u0440\u043E\u043A\u043E\u0432"
    }) : _jsx("div", {
      className: "group-detail-list compact",
      children: upcoming.map(l => _jsxs("div", {
        className: "group-detail-row",
        children: [_jsx("span", {
          children: fmtDate(l.date)
        }), _jsx("span", {
          className: "group-detail-rate",
          children: l.time
        })]
      }, l.id))
    }), _jsxs("div", {
      className: "modal-actions group-detail-actions",
      children: [_jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onClose,
        children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"
      }), _jsx("button", {
        className: "btn btn-black btn-full",
        onClick: onEdit,
        children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"
      })]
    })]
  });
}
function DeleteJournalModal({
  entries,
  onRestore,
  onClose
}) {
  return _jsx(Modal, {
    title: "\u0416\u0443\u0440\u043D\u0430\u043B \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0439",
    onClose: onClose,
    children: entries.length === 0 ? _jsx(EmptyState, {
      title: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442",
      text: "\u0412 \u044D\u0442\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u0441\u044E\u0434\u0430 \u043F\u043E\u043F\u0430\u0434\u0443\u0442 \u0443\u0434\u0430\u043B\u0451\u043D\u043D\u044B\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0438, \u0433\u0440\u0443\u043F\u043F\u044B, \u0437\u0430\u043D\u044F\u0442\u0438\u044F \u0438 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438. \u0418\u0445 \u043C\u043E\u0436\u043D\u043E \u0431\u0443\u0434\u0435\u0442 \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0431\u0435\u0437 \u043F\u043E\u0438\u0441\u043A\u0430 \u043F\u043E \u0431\u044D\u043A\u0430\u043F\u0430\u043C."
    }) : _jsxs(_Fragment, {
      children: [_jsx("div", {
        className: "modal-note-text modal-inline-note",
        children: "\u0416\u0443\u0440\u043D\u0430\u043B \u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043E \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F. \u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043D\u0430 \u043C\u043E\u043C\u0435\u043D\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F."
      }), entries.map(entry => _jsxs("div", {
        className: "crm-table-row",
        children: [_jsxs("div", {
          children: [_jsx("div", {
            className: "modal-list-title",
            children: entry.label
          }), _jsxs("div", {
            className: "modal-list-meta",
            children: ["\u0423\u0434\u0430\u043B\u0435\u043D\u043E \u0432 ", entry.createdAt]
          })]
        }), _jsx("button", {
          className: "btn btn-sm btn-green",
          onClick: () => onRestore(entry),
          children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C"
        })]
      }, entry.id))]
    })
  });
}

// ── SCHEDULE EXPORT MODAL ───────────────────────────────────────────────────────
function ScheduleExportModal({
  lessons,
  onExport,
  onClose
}) {
  const today = getTodayDate();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const presets = [{
    label: 'Эта неделя',
    fn: () => {
      const d = new Date();
      const dow = d.getDay() || 7;
      const mon = new Date(d);
      mon.setDate(d.getDate() - dow + 1);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setFrom(mon.toISOString().slice(0, 10));
      setTo(sun.toISOString().slice(0, 10));
    }
  }, {
    label: 'Этот месяц',
    fn: () => {
      const d = new Date();
      setFrom(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      setTo(last.toISOString().slice(0, 10));
    }
  }, {
    label: 'Прошлый месяц',
    fn: () => {
      const d = new Date();
      const y = d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear();
      const m = d.getMonth() === 0 ? 12 : d.getMonth();
      setFrom(`${y}-${String(m).padStart(2, '0')}-01`);
      const last = new Date(y, m, 0);
      setTo(last.toISOString().slice(0, 10));
    }
  }];
  const count = lessons.filter(l => l.date >= from && l.date <= to).length;
  return _jsxs(Modal, {
    title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F",
    onClose: onClose,
    children: [_jsx("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 14
      },
      children: presets.map(p => _jsx("button", {
        className: "btn btn-sm btn-white",
        style: {
          padding: '6px 10px',
          fontSize: 10
        },
        onClick: p.fn,
        children: p.label
      }, p.label))
    }), _jsxs("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10
      },
      children: [_jsx(FormField, {
        label: "\u0421",
        children: _jsx("input", {
          className: "input",
          type: "date",
          value: from,
          onChange: e => setFrom(e.target.value)
        })
      }), _jsx(FormField, {
        label: "\u041F\u043E",
        children: _jsx("input", {
          className: "input",
          type: "date",
          value: to,
          onChange: e => setTo(e.target.value)
        })
      })]
    }), _jsxs("div", {
      style: {
        fontSize: 11,
        color: '#666',
        margin: '8px 0 14px',
        textAlign: 'center'
      },
      children: [count, " \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u043F\u0435\u0440\u0438\u043E\u0434\u0435"]
    }), _jsxs("div", {
      style: {
        display: 'flex',
        gap: 10
      },
      children: [_jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onClose,
        children: "\u041E\u0442\u043C\u0435\u043D\u0430"
      }), _jsxs("button", {
        className: "btn btn-black btn-full",
        disabled: !count,
        onClick: () => {
          onExport(from, to);
          onClose();
        },
        children: [_jsx(IcoPrint, {
          size: 14
        }), " \u041F\u0435\u0447\u0430\u0442\u044C / PDF"]
      })]
    })]
  });
}

// ── TIPS MODAL ─────────────────────────────────────────────────────────────────
const TIPS = [{
  icon: 'рџ’Ў',
  title: 'Серии уроков',
  text: 'При создании урока включи "Серия" — приложение автоматически создаст повторяющиеся уроки на несколько недель вперёд. Не нужно добавлять каждый урок вручную.'
}, {
  icon: '⚡',
  title: 'Быстрое закрытие дня',
  text: 'На главном экране кнопка "Закрыть N" сразу отмечает все прошедшие уроки как проведённые с полной посещаемостью. 2 секунды вместо 5 минут.'
}, {
  icon: 'рџ’ё',
  title: 'Абонементы',
  text: 'Абонемент списывает уроки с пакета, а не с баланса. Удобно когда ученик платит сразу за месяц — не нужно следить за суммами.'
}, {
  icon: 'рџ“Љ',
  title: 'Долги на главной',
  text: 'Раздел "Требует внимания" показывает всех должников прямо на главном экране. Оттуда же можно отправить напоминание.'
}, {
  icon: 'рџ“±',
  title: 'Telegram-чат одним нажатием',
  text: 'Заполни Telegram ID или @username в профиле ученика — кнопка "Написать" станет синей и откроет чат напрямую без копирования номера.'
}, {
  icon: 'рџЋЁ',
  title: 'Смайлы для групп',
  text: 'Добавь смайл группе (рџЏ›пёЏ рџ“љ рџ”ў рџЊЌ) — так группы мгновенно различаются в списке, особенно если их много.'
}, {
  icon: 'рџ’°',
  title: 'Разные ставки',
  text: 'В профиле ученика можно задать разные ставки для разных предметов. Например: история 1500 ₽, обществознание 1200 ₽.'
}, {
  icon: 'рџ“…',
  title: 'Экспорт расписания',
  text: 'Кнопка PDF в расписании выгружает таблицу за любой период. Удобно сохранить на месяц или отправить родителям.'
}, {
  icon: 'рџ”Ќ',
  title: 'Фильтр по предметам',
  text: 'В расписании и списке учеников есть фильтр по предмету — удобно когда ведёшь несколько дисциплин.'
}, {
  icon: '✏пёЏ',
  title: 'Свои шаблоны сообщений',
  text: 'В окне "Написать" → "⚙ Шаблоны" можно создавать свои тексты с плейсхолдерами {name}, {lessonDate}, {balance}.'
}];
function TipsModal({
  onClose
}) {
  const [idx, setIdx] = useState(0);
  const tip = TIPS[idx];
  return _jsxs(Modal, {
    title: "\u0421\u043E\u0432\u0435\u0442\u044B",
    onClose: onClose,
    children: [_jsxs("div", {
      style: {
        textAlign: 'center',
        padding: '8px 0 20px'
      },
      children: [_jsx("div", {
        style: {
          width: 56,
          height: 56,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--border)',
          borderRadius: 12,
          background: 'var(--bg-subtle)',
          marginBottom: 12
        },
        children: _jsx(IcoLightbulb, {
          size: 30
        })
      }), _jsx("div", {
        style: {
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontWeight: 900,
          fontSize: 14,
          marginBottom: 12,
          lineHeight: 1.4
        },
        children: tip.title
      }), _jsx("div", {
        style: {
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--black)',
          opacity: .8
        },
        children: tip.text
      })]
    }), _jsx("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
      },
      children: TIPS.map((_, i) => _jsx("div", {
        onClick: () => setIdx(i),
        style: {
          flex: 1,
          height: 4,
          borderRadius: 2,
          cursor: 'pointer',
          background: i === idx ? 'var(--ink)' : '#ddd',
          transition: 'background .2s'
        }
      }, i))
    }), _jsxs("div", {
      style: {
        display: 'flex',
        gap: 8
      },
      children: [_jsx("button", {
        className: "btn btn-white btn-full",
        disabled: idx === 0,
        onClick: () => setIdx(i => i - 1),
        children: "\u2190 \u041D\u0430\u0437\u0430\u0434"
      }), idx < TIPS.length - 1 ? _jsx("button", {
        className: "btn btn-black btn-full",
        onClick: () => setIdx(i => i + 1),
        children: "\u0412\u043F\u0435\u0440\u0451\u0434 \u2192"
      }) : _jsx("button", {
        className: "btn btn-black btn-full",
        onClick: onClose,
        children: "\u0413\u043E\u0442\u043E\u0432\u043E \u2713"
      })]
    })]
  });
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
const STUDENT_TEXT_IMPORT_SAMPLE = `Ирина; +7 900 111-22-33; История; 1500
Марк, Анатолий, Ирина | Общество 10 | 1300
Полина | Английский | 1800`;
const normalizeImportName = value => String(value || '').replace(/[•*]/g, ' ').replace(/\s+/g, ' ').trim();
const importNameKey = value => normalizeImportName(value).toLowerCase();
const extractImportPhone = line => {
  const match = String(line || '').match(/\+?\d[\d\s()\-]{7,}\d/);
  return match ? match[0].replace(/\s+/g, ' ').trim() : '';
};
const extractImportRate = line => {
  const safeLine = String(line || '').replace(/\+?\d[\d\s()\-]{7,}\d/g, ' ');
  const values = [...safeLine.matchAll(/(?:^|[^\d])(\d{3,5})(?:\s*(?:₽|руб|р))?/gi)].map(m => Number(m[1])).filter(n => Number.isFinite(n) && n >= 300 && n <= 20000);
  return values.length ? values[values.length - 1] : null;
};
const cleanImportNamePart = (value, phone = '', rate = null) => {
  let result = String(value || '');
  if (phone) result = result.replace(phone, ' ');
  if (rate) result = result.replace(new RegExp(`\\b${rate}\\b\\s*(?:₽|руб|р)?`, 'i'), ' ');
  result = result.replace(/\b(?:история|истор|обществознание|общество|русский|математика|английский|другое|группа|класс|урок|руб|р)\b/gi, ' ');
  result = result.replace(/\b\d{1,2}\s*(?:класс|кл)?\b/gi, ' ');
  return normalizeImportName(result.replace(/[|;:]/g, ' '));
};
const splitImportNames = value => cleanImportNamePart(value).split(/\s*,\s*|\s+и\s+/i).map(normalizeImportName).filter(name => name && /[A-Za-zА-Яа-яЁё]/.test(name));
const isUsefulGroupName = value => {
  const text = normalizeImportName(value);
  if (!text || extractImportPhone(text) || extractImportRate(text)) return false;
  return /(группа|класс|\d{1,2}|истор|обществ|рус|мат|англ)/i.test(text);
};
function buildStudentTextImportPlan(text, existingStudents = [], existingGroups = []) {
  const lines = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const existingByName = new Map(existingStudents.map(s => [importNameKey(s.name), s]).filter(([key]) => key));
  const draftByName = new Map();
  const updatesByName = new Map();
  const matchedIds = new Set();
  const groupDrafts = [];
  const skipped = [];
  const touchStudent = (name, meta) => {
    const cleanName = normalizeImportName(name);
    const key = importNameKey(cleanName);
    if (!key) return null;
    const existing = existingByName.get(key);
    if (existing) {
      matchedIds.add(existing.id);
      const update = updatesByName.get(key) || {
        key,
        id: existing.id,
        phone: '',
        subjects: []
      };
      if (meta.phone && !existing.phone) update.phone = meta.phone;
      if (meta.subject && !(existing.subjects || []).includes(meta.subject)) update.subjects = [...new Set([...(update.subjects || []), meta.subject])];
      updatesByName.set(key, update);
      return {
        key,
        id: existing.id,
        existing: true
      };
    }
    const current = draftByName.get(key) || {
      key,
      name: cleanName,
      phone: '',
      rate: DEFAULT_RATE,
      subjects: []
    };
    draftByName.set(key, {
      ...current,
      phone: current.phone || meta.phone || '',
      rate: meta.rate || current.rate || DEFAULT_RATE,
      subjects: [...new Set([...(current.subjects || []), meta.subject || 'История'])]
    });
    return {
      key,
      existing: false
    };
  };
  lines.forEach((line, lineIndex) => {
    const phone = extractImportPhone(line);
    const rate = extractImportRate(line);
    const subject = inferSubject(line);
    const parts = line.split(/[|;\t]/).map(part => part.trim()).filter(Boolean);
    const namesPart = parts.find(part => splitImportNames(cleanImportNamePart(part, phone, rate)).length) || cleanImportNamePart(line, phone, rate);
    const names = splitImportNames(cleanImportNamePart(namesPart, phone, rate));
    if (!names.length) {
      skipped.push({
        line,
        reason: 'не найдено имя',
        index: lineIndex
      });
      return;
    }
    const refs = names.map(name => touchStudent(name, {
      phone: names.length === 1 ? phone : '',
      rate,
      subject
    })).filter(Boolean);
    if (names.length > 1) {
      const nameCandidate = parts.find(part => part !== namesPart && isUsefulGroupName(part)) || '';
      groupDrafts.push({
        name: normalizeImportName(nameCandidate),
        subject,
        rate,
        studentKeys: refs.map(ref => ref.key),
        studentNames: names
      });
    }
  });
  const groupUniq = new Set(existingGroups.map(group => `${importNameKey(getGroupDisplayName(group, existingStudents))}|${(group.studentIds || []).map(String).sort().join(',')}`));
  const groups = groupDrafts.filter(group => group.studentKeys.length > 1).filter(group => {
    const signature = `${importNameKey(group.name || group.studentNames.join(','))}|${group.studentKeys.slice().sort().join(',')}`;
    if (groupUniq.has(signature)) return false;
    groupUniq.add(signature);
    return true;
  });
  return {
    totalLines: lines.length,
    newStudents: [...draftByName.values()],
    matchedCount: matchedIds.size,
    existingUpdates: [...updatesByName.values()].filter(update => update.phone || update.subjects.length),
    groups,
    skipped
  };
}
function StudentTextImportModal({
  students,
  groups,
  onImport,
  onClose
}) {
  const [text, setText] = useState('');
  const plan = useMemo(() => buildStudentTextImportPlan(text, students, groups), [text, students, groups]);
  const canImport = !!text.trim() && (plan.newStudents.length || plan.groups.length || plan.existingUpdates.length);
  return _jsxs(Modal, {
    title: "Импорт учеников",
    onClose: onClose,
    children: [_jsx("div", {
      className: "data-modal-note",
      children: "Вставьте строки из заметок, Excel, Google Sheets или старого приложения. Одна строка — ученик или группа. Несколько имен через запятую создадут группу."
    }), _jsx("textarea", {
      className: "input import-textarea",
      value: text,
      placeholder: STUDENT_TEXT_IMPORT_SAMPLE,
      onChange: e => setText(e.target.value)
    }), _jsxs("div", {
      className: "import-preview-grid",
      children: [_jsxs("div", {
        className: "import-preview-card",
        children: [_jsx("span", {
          children: "Новые ученики"
        }), _jsx("strong", {
          children: plan.newStudents.length
        })]
      }), _jsxs("div", {
        className: "import-preview-card",
        children: [_jsx("span", {
          children: "Найдены в базе"
        }), _jsx("strong", {
          children: plan.matchedCount
        })]
      }), _jsxs("div", {
        className: "import-preview-card",
        children: [_jsx("span", {
          children: "Группы"
        }), _jsx("strong", {
          children: plan.groups.length
        })]
      })]
    }), text.trim() && _jsxs("div", {
      className: "import-preview-box",
      children: [_jsx("div", {
        className: "modal-section-label",
        children: "Предпросмотр"
      }), plan.newStudents.length ? _jsx("div", {
        className: "import-chip-list",
        children: plan.newStudents.slice(0, 10).map(student => _jsxs("span", {
          children: [student.name, " · ", student.subjects.join(', '), " · ", money(student.rate)]
        }, student.key))
      }) : _jsx("p", {
        className: "modal-note-text",
        children: "Новых учеников нет. Совпадения будут использованы для групп и обновления пустых полей."
      }), plan.groups.length ? _jsx("div", {
        className: "import-group-list",
        children: plan.groups.slice(0, 6).map((group, index) => _jsxs("div", {
          children: [_jsx("strong", {
            children: group.name || buildGroupAutoName([], [], group.subject)
          }), _jsx("span", {
            children: group.studentNames.join(', ')
          })]
        }, index))
      }) : null, plan.skipped.length ? _jsxs("div", {
        className: "import-skip-note",
        children: ["Не распознано строк: ", plan.skipped.length]
      }) : null]
    }), _jsxs("div", {
      className: "modal-actions-row",
      children: [_jsx("button", {
        className: "btn btn-white btn-full",
        onClick: () => setText(STUDENT_TEXT_IMPORT_SAMPLE),
        children: "Вставить пример"
      }), _jsx("button", {
        className: "btn btn-black btn-full",
        disabled: !canImport,
        onClick: () => onImport(text),
        children: "Импортировать"
      })]
    })]
  });
}
function DataModal({
  stats,
  lastSavedAt,
  lastBackupAt,
  storageWarning,
  onExport,
  onImport,
  onTextImport,
  onLocalBackup,
  onClose
}) {
  const stamp = value => value ? new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'нет';
  const rows = [['Ученики', stats.students], ['Группы', stats.groups], ['Уроки', stats.lessons], ['Финансы', stats.txs], ['Шаблоны', stats.templates]];
  return _jsxs(Modal, {
    title: "\u0414\u0430\u043D\u043D\u044B\u0435",
    onClose: onClose,
    children: [_jsx("div", {
      className: "data-modal-note",
      children: "\u041F\u043E\u043B\u043D\u044B\u0439 \u0431\u044D\u043A\u0430\u043F \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442 \u0432\u0441\u044E \u0431\u0430\u0437\u0443: \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432, \u0433\u0440\u0443\u043F\u043F\u044B, \u0443\u0440\u043E\u043A\u0438, \u0444\u0438\u043D\u0430\u043D\u0441\u044B, \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u044B \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0439."
    }), _jsx("div", {
      className: "data-stat-grid",
      children: rows.map(([label, value]) => _jsxs("div", {
        className: "data-stat-card",
        children: [_jsx("span", {
          children: label
        }), _jsx("strong", {
          children: value
        })]
      }, label))
    }), _jsxs("div", {
      className: "data-modal-summary",
      children: [_jsxs("div", {
        children: [_jsx("span", {
          children: "\u0410\u0432\u0442\u043E\u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E"
        }), _jsx("strong", {
          children: stamp(lastSavedAt)
        })]
      }), _jsxs("div", {
        children: [_jsx("span", {
          children: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043F\u0438\u044F"
        }), _jsx("strong", {
          children: stamp(lastBackupAt)
        })]
      })]
    }), storageWarning && _jsx("div", {
      className: "data-modal-warning",
      children: storageWarning
    }), _jsxs("div", {
      className: "data-actions",
      children: [_jsx("button", {
        className: "btn btn-black btn-full",
        onClick: onExport,
        children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0432\u0441\u044E \u0431\u0430\u0437\u0443"
      }), _jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onImport,
        children: "\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432\u0441\u044E \u0431\u0430\u0437\u0443"
      }), _jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onTextImport,
        children: "Импорт учеников и групп из текста"
      }), _jsx("button", {
        className: "btn btn-white btn-full",
        onClick: onLocalBackup,
        children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043A\u043E\u043F\u0438\u044E \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435"
      })]
    })]
  });
}
function App() {
  const [tab, setTab] = useState('today');
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [txs, setTxs] = useState([]);
  const [settings, setSettings] = useState({
    theme: 'light'
  });
  const [loaded, setLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [lastBackupAt, setLastBackupAt] = useState(null);
  const [storageWarning, setStorageWarning] = useState('');

  // selected date for schedule tab
  const [selDate, setSelDate] = useState(getTodayDate());

  // modals
  const [modal, setModal] = useState(null); // { type, payload }

  // ── Hoisted page state (survives modal open/close) ──
  const [studentsView, setStudentsView] = useState('students');
  const [studentsQ, setStudentsQ] = useState('');
  const [studentsDebtOnly, setStudentsDebtOnly] = useState(false);
  const [studentsShowArchived, setStudentsShowArchived] = useState(false);
  const [studentsSubjectFilter, setStudentsSubjectFilter] = useState('all');
  const [schedView, setSchedView] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [calMonth, setCalMonth] = useState(new Date());
  const [schedSubject, setSchedSubject] = useState('all');
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [deletionLog, setDeletionLog] = useState([]);
  const notifications = useMemo(() => loaded ? generateNotifications(lessons, students, groups) : [], [loaded, lessons, students, groups]);

  // ── Undo system ──
  const [pendingUndo, setPendingUndo] = useState(null);
  const undoTimerRef = useRef(null);
  const triggerUndo = (label, snapL, snapS, snapT, snapG, timeoutMs = 4000) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setPendingUndo({
      label,
      restore: () => {
        setLessons(snapL);
        setStudents(snapS);
        setTxs(snapT);
        if (snapG !== undefined) setGroups(snapG);
      }
    });
    undoTimerRef.current = setTimeout(() => setPendingUndo(null), timeoutMs);
  };
  const handleUndo = () => {
    if (!pendingUndo) return;
    clearTimeout(undoTimerRef.current);
    pendingUndo.restore();
    setPendingUndo(null);
  };
  const recordDeletion = (label, restore) => {
    setDeletionLog(p => [{
      id: Date.now() + Math.random(),
      label,
      createdAt: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      restore
    }, ...p].slice(0, 30));
  };
  const restoreDeletion = entry => {
    entry.restore();
    setDeletionLog(p => p.filter(x => x.id !== entry.id));
    setPendingUndo(null);
  };
  useEffect(() => {
    const saved = loadSavedState();
    const initial = saved || cloneEmptyState();
    const r = runAutoCompletion(initial.lessons, initial.students, initial.groups, initial.txs || []);
    setLessons(r?.newLessons || initial.lessons);
    setStudents(r?.newStudents || initial.students);
    setGroups(initial.groups || []);
    setTxs(r?.newTransactions || initial.txs || []);
    setSettings(initial.settings || {
      theme: 'light'
    });
    if (initial.customTemplates?.length) setCustomTemplates(initial.customTemplates);
    // load custom templates
    try {
      const t = localStorage.getItem('tutor-templates');
      if (t) setCustomTemplates(JSON.parse(t));
    } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLastSavedAt(JSON.parse(raw)?.savedAt || null);
      const b1 = localStorage.getItem('tutor-backup-1');
      if (b1) setLastBackupAt(JSON.parse(b1)?.t || null);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      const savedAt = saveState({
        students,
        groups,
        lessons,
        txs,
        settings,
        customTemplates
      });
      setLastSavedAt(savedAt);
      setStorageWarning('');
    } catch (e) {
      setStorageWarning(e?.name === 'QuotaExceededError' ? 'Память браузера заполнена. Скачайте бэкап и очистите лишние данные.' : 'Не удалось сохранить данные в браузере.');
    }
  }, [loaded, students, groups, lessons, txs, settings, customTemplates]);

  // Auto-backup every 5 minutes with rotation (keep last 3)
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      try {
        const createdAt = new Date().toISOString();
        const backup = JSON.stringify({
          v: STORAGE_VERSION,
          t: createdAt,
          data: {
            students,
            groups,
            lessons,
            txs,
            settings,
            customTemplates
          }
        });
        const keys = ['tutor-backup-1', 'tutor-backup-2', 'tutor-backup-3'];
        // Rotate: 2→3, 1→2, new→1
        const b2 = localStorage.getItem(keys[1]);
        if (b2) localStorage.setItem(keys[2], b2);
        const b1 = localStorage.getItem(keys[0]);
        if (b1) localStorage.setItem(keys[1], b1);
        localStorage.setItem(keys[0], backup);
        setLastBackupAt(createdAt);
        setStorageWarning('');
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage full — скачайте бэкап!');
          setStorageWarning('Память браузера заполнена. Скачайте бэкап и очистите лишние данные.');
        }
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loaded, students, groups, lessons, txs, settings, customTemplates]);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('tutor-templates', JSON.stringify(customTemplates));
  }, [loaded, customTemplates]);
  useEffect(() => {
    const theme = settings.theme || 'light';
    document.body.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12110f' : '#fffdf2');
  }, [settings.theme]);

  // ── handlers ──
  const lessonFinanceStudents = lesson => getLessonStudents(lesson, students, groups).map(student => ({
    ...student,
    rate: getLessonRate(lesson, student, groups)
  }));
  const removeLessonFinanceEffects = (baseStudents, baseTxs, deletedLessons) => {
    let nextStudents = baseStudents;
    let nextTxs = baseTxs;
    deletedLessons.forEach(lesson => {
      const attendanceState = financeCore.removeLessonTransactionsState({
        students: nextStudents,
        txs: nextTxs,
        lessonId: lesson.id,
        kind: 'attendance',
        packageUse: lesson.packageUse
      });
      nextStudents = attendanceState.students;
      nextTxs = attendanceState.txs;
      const noShowState = financeCore.removeLessonTransactionsState({
        students: nextStudents,
        txs: nextTxs,
        lessonId: lesson.id,
        kind: 'no_show'
      });
      nextStudents = noShowState.students;
      nextTxs = noShowState.txs;
    });
    return {
      students: nextStudents,
      txs: nextTxs
    };
  };
  const getSeriesFutureSlotLessons = source => {
    if (!source) return [];
    return lessons.filter(l => sameRecurringSlot(l, source) && l.status === 'planned' && lessonDateTimeKey(l) >= lessonDateTimeKey(source));
  };
  const saveStudent = data => {
    const edit = modal?.payload;
    if (edit) setStudents(p => p.map(s => sameId(s.id, edit.id) ? {
      ...s,
      ...data
    } : s));else setStudents(p => [...p, {
      ...data,
      id: Date.now(),
      balance: 0
    }]);
    setModal(null);
  };
  const saveParentPortal = (studentId, parentPortal) => {
    setStudents(p => p.map(s => sameId(s.id, studentId) ? {
      ...s,
      parentPortal
    } : s));
    if (modal?.type === 'studentDetail' && sameId(modal.payload?.id, studentId)) {
      setModal({
        ...modal,
        payload: {
          ...modal.payload,
          parentPortal
        }
      });
    }
  };
  const updateStudentPortal = (studentId, updater) => {
    const currentStudent = students.find(s => sameId(s.id, studentId));
    if (!currentStudent) return null;
    const currentPortal = getParentPortalSettings(currentStudent);
    const nextPortal = updater(currentPortal, currentStudent);
    setStudents(p => p.map(s => sameId(s.id, studentId) ? {
      ...s,
      parentPortal: nextPortal
    } : s));
    if (modal?.type === 'studentDetail' && sameId(modal.payload?.id, studentId)) {
      setModal({
        ...modal,
        payload: {
          ...modal.payload,
          parentPortal: nextPortal
        }
      });
    }
    return nextPortal;
  };
  const saveParentPaymentNotice = (studentId, notice) => {
    updateStudentPortal(studentId, portal => ({
      ...portal,
      paymentNotices: [notice, ...(portal.paymentNotices || [])].slice(0, 30)
    }));
  };
  const dismissParentPaymentNotice = (studentId, noticeId) => {
    updateStudentPortal(studentId, portal => ({
      ...portal,
      paymentNotices: (portal.paymentNotices || []).map(n => n.id === noticeId ? {
        ...n,
        status: 'hidden',
        hiddenAt: new Date().toISOString()
      } : n)
    }));
  };
  const acceptParentPaymentNotice = (studentId, noticeId) => {
    const student = students.find(s => sameId(s.id, studentId));
    if (!student) return;
    const portal = getParentPortalSettings(student);
    const notice = (portal.paymentNotices || []).find(n => n.id === noticeId);
    const amount = Number(notice?.amount || 0);
    if (!notice || !Number.isFinite(amount) || amount <= 0) return;
    const snapS = [...students],
      snapT = [...txs];
    const nextState = financeCore.saveTransactionState({
      students,
      txs,
      data: {
        studentId: student.id,
        type: 'payment',
        amount,
        date: getTodayDate(),
        comment: notice.comment || 'Оплата по заявке родителя'
      },
      createId: Date.now
    });
    const nextPortal = {
      ...portal,
      paymentNotices: (portal.paymentNotices || []).map(n => n.id === noticeId ? {
        ...n,
        status: 'accepted',
        acceptedAt: new Date().toISOString()
      } : n)
    };
    const nextStudents = nextState.students.map(s => sameId(s.id, studentId) ? {
      ...s,
      parentPortal: nextPortal
    } : s);
    setStudents(nextStudents);
    setTxs(nextState.txs);
    if (modal?.type === 'studentDetail' && sameId(modal.payload?.id, studentId)) {
      setModal({
        ...modal,
        payload: {
          ...modal.payload,
          balance: nextStudents.find(s => sameId(s.id, studentId))?.balance ?? modal.payload.balance,
          parentPortal: nextPortal
        }
      });
    }
    triggerUndo('Оплата по заявке принята', lessons, snapS, snapT, undefined, 3000);
  };
  const archiveStudent = (id, archived = true) => {
    setStudents(p => p.map(s => sameId(s.id, id) ? {
      ...s,
      archived
    } : s));
    if (archived) setGroups(p => p.map(g => ({
      ...g,
      studentIds: g.studentIds.filter(x => !sameId(x, id))
    })));
  };
  const delStudent = id => {
    const snapL = [...lessons],
      snapS = [...students],
      snapT = [...txs],
      snapG = [...groups];
    const student = students.find(s => sameId(s.id, id));
    const deletedLessons = lessons.filter(l => l.type === 'individual' && sameId(l.targetId, id));
    const cleanedFinance = removeLessonFinanceEffects(students, txs, deletedLessons);
    const nextLessons = lessons.filter(l => !(l.type === 'individual' && sameId(l.targetId, id))).map(l => l.type === 'group' ? stripStudentFromLesson(l, id) : l);
    const nextGroups = groups.map(g => ({
      ...g,
      studentIds: g.studentIds.filter(x => !sameId(x, id)),
      rateOverrides: omitRecordKey(g.rateOverrides, id)
    }));
    recordDeletion(`Ученик ${student?.name || ''}`.trim(), () => {
      setLessons(snapL);
      setStudents(snapS);
      setTxs(snapT);
      setGroups(snapG);
    });
    setStudents(cleanedFinance.students.filter(s => !sameId(s.id, id)));
    setGroups(nextGroups);
    setLessons(nextLessons);
    setTxs(cleanedFinance.txs.filter(tx => !sameId(tx.studentId, id)));
    triggerUndo(`${student?.name || 'Ученик'} удалён`, snapL, snapS, snapT, snapG);
  };
  const saveGroup = data => {
    const edit = modal?.payload;
    if (edit) setGroups(p => p.map(g => sameId(g.id, edit.id) ? {
      ...g,
      ...data
    } : g));else setGroups(p => [...p, {
      ...data,
      id: Date.now()
    }]);
    setModal(null);
  };
  const delGroup = id => {
    const snapL = [...lessons],
      snapS = [...students],
      snapT = [...txs],
      snapG = [...groups];
    const group = groups.find(g => sameId(g.id, id));
    const deletedLessons = lessons.filter(l => l.type === 'group' && sameId(l.targetId, id));
    const cleanedFinance = removeLessonFinanceEffects(students, txs, deletedLessons);
    recordDeletion(`Группа ${getGroupDisplayName(group, students) || ''}`.trim(), () => {
      setLessons(snapL);
      setStudents(snapS);
      setTxs(snapT);
      setGroups(snapG);
    });
    setGroups(groups.filter(g => !sameId(g.id, id)));
    setLessons(lessons.filter(l => !(l.type === 'group' && sameId(l.targetId, id))));
    setStudents(cleanedFinance.students);
    setTxs(cleanedFinance.txs);
    triggerUndo('Группа удалена', snapL, snapS, snapT, snapG);
  };
  const saveTx = data => {
    const edit = modal?.type === 'transaction' && modal?.payload?.id ? modal?.payload : null;
    const nextState = financeCore.saveTransactionState({
      students,
      txs,
      data,
      edit,
      createId: Date.now
    });
    setStudents(nextState.students);
    setTxs(nextState.txs);
    setModal(null);
  };
  const delTx = tx => {
    const snapS = [...students],
      snapT = [...txs];
    const student = students.find(s => sameId(s.id, tx.studentId));
    recordDeletion(`Операция ${student?.name || 'ученика'} ${money(tx.amount)}`, () => {
      setStudents(snapS);
      setTxs(snapT);
    });
    const nextState = financeCore.deleteTransactionState({
      students,
      txs,
      tx
    });
    setStudents(nextState.students);
    setTxs(nextState.txs);
    triggerUndo('Операция удалена', lessons, snapS, snapT);
  };
  const confirmLessonConflicts = (items, ignoreIds = null) => {
    const arr = Array.isArray(items) ? items : [items];
    const ignoreSet = new Set(Array.isArray(ignoreIds) ? ignoreIds : ignoreIds !== null && ignoreIds !== undefined ? [ignoreIds] : []);
    const sourceLessons = ignoreSet.size ? lessons.filter(l => !ignoreSet.has(l.id)) : lessons;
    const conflicts = arr.flatMap(item => findLessonConflicts(item, sourceLessons, students, groups, null));
    const unique = [...new Map(conflicts.map(l => [l.id, l])).values()];
    if (!unique.length) return true;
    return confirm(`Есть конфликт расписания:\n\n${conflictText(unique, groups, students)}\n\nВсе равно сохранить?`);
  };
  const saveLesson = (data, editId = null, options = {}) => {
    if (editId) {
      const editLesson = lessons.find(l => l.id === editId);
      const patch = data[0];
      if (!editLesson) return;
      const scope = options.seriesScope === 'future' && editLesson.status === 'planned' ? 'future' : 'single';
      const dateShiftDays = dateDiffDays(editLesson.date, patch.date);
      const affected = scope === 'future' ? getSeriesFutureSlotLessons(editLesson) : [editLesson];
      const changed = affected.map(l => ({
        ...l,
        ...patch,
        date: l.id === editId ? patch.date : shiftDate(l.date, dateShiftDays)
      }));
      if (!confirmLessonConflicts(changed, affected.map(l => l.id))) return;
      const changedById = new Map(changed.map(l => [l.id, l]));
      setLessons(p => p.map(l => changedById.get(l.id) || l));
    } else {
      const arr = Array.isArray(data) ? data : [data];
      if (!confirmLessonConflicts(arr)) return;
      setLessons(p => [...p, ...arr.map((l, i) => ({
        ...l,
        id: Date.now() + i,
        status: 'planned'
      }))]);
    }
    setModal(null);
  };
  const moveLesson = (lessonId, date, time) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const patch = {
      ...lesson,
      date,
      time
    };
    if (!confirmLessonConflicts(patch, lessonId)) return;
    setLessons(p => p.map(l => l.id === lessonId ? {
      ...l,
      date,
      time
    } : l));
    setSelDate(date);
  };
  const rescheduleLesson = (lessonId, date, time) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const newLesson = {
      ...lesson,
      id: Date.now(),
      date,
      time,
      status: 'planned',
      attendance: undefined,
      rescheduledFrom: lesson.id,
      packageUse: {}
    };
    setLessons(p => p.map(l => l.id === lessonId ? {
      ...l,
      status: 'rescheduled',
      rescheduledTo: newLesson.id
    } : l).concat(newLesson));
    setModal(null);
  };
  const savePackage = (studentId, lessonsCount, amount) => {
    const nextState = financeCore.buyPackageState({
      students,
      txs,
      studentId,
      lessonsCount,
      amount,
      date: getTodayDate(),
      comment: `РђР±РѕРЅРµРјент: ${lessonsCount} зан.`,
      createId: Date.now
    });
    setStudents(nextState.students);
    setTxs(nextState.txs);
    setModal(null);
  };
  const delLesson = (id, e) => {
    if (e) e.stopPropagation();
    const snapL = [...lessons],
      snapS = [...students],
      snapT = [...txs];
    const lesson = lessons.find(l => l.id === id);
    recordDeletion(`Занятие ${lesson ? `${fmtDate(lesson.date)} ${lesson.time}` : ''}`.trim(), () => {
      setLessons(snapL);
      setStudents(snapS);
      setTxs(snapT);
    });
    if (lesson?.status === 'no_show') {
      removeNoShowCharges(id);
    } else if (lesson?.status === 'completed') {
      const nextState = financeCore.refundCompletedLessonState({
        students,
        txs,
        lesson,
        lessonStudents: lessonFinanceStudents(lesson),
        date: getTodayDate(),
        lessonDateLabel: fmtDate(lesson.date),
        createId: index => Date.now() + index + Math.random()
      });
      setStudents(nextState.students);
      setTxs(nextState.txs);
    }
    setLessons(p => p.filter(l => l.id !== id));
    setModal(null);
    triggerUndo('Занятие удалено', snapL, snapS, snapT);
  };
  const delFutureSeriesLessons = (id, e) => {
    if (e) e.stopPropagation();
    const lesson = lessons.find(l => l.id === id);
    if (!lesson?.seriesId) {
      delLesson(id, e);
      return;
    }
    const targets = getSeriesFutureSlotLessons(lesson);
    const targetIds = new Set(targets.map(l => l.id));
    if (!targetIds.size) return;
    const snapL = [...lessons],
      snapS = [...students],
      snapT = [...txs];
    const label = `Занятия с ${fmtDate(lesson.date)} удалены`;
    recordDeletion(label, () => {
      setLessons(snapL);
      setStudents(snapS);
      setTxs(snapT);
    });
    const cleanedFinance = removeLessonFinanceEffects(students, txs, targets);
    setLessons(lessons.filter(l => !targetIds.has(l.id)));
    setStudents(cleanedFinance.students);
    setTxs(cleanedFinance.txs);
    setModal(null);
    triggerUndo(label, snapL, snapS, snapT);
  };
  const requestDeleteLesson = (lessonOrId, e) => {
    if (e) e.stopPropagation();
    const lesson = typeof lessonOrId === 'object' ? lessonOrId : lessons.find(l => l.id === lessonOrId);
    if (!lesson) return;
    if (lesson.status === 'planned' && getSeriesFutureSlotLessons(lesson).length > 1) {
      setModal({
        type: 'lessonDelete',
        payload: {
          lesson
        }
      });
      return;
    }
    delLesson(lesson.id, e);
  };
  const chargeNoShow = lesson => {
    const nextState = financeCore.chargeNoShowState({
      students,
      txs,
      lesson,
      lessonStudents: lessonFinanceStudents(lesson),
      date: getTodayDate(),
      lessonDateLabel: fmtDate(lesson.date),
      createId: index => Date.now() + index + Math.random()
    });
    if (!nextState.addedTxs.length) return;
    setStudents(nextState.students);
    setTxs(nextState.txs);
  };
  const removeNoShowCharges = lessonId => {
    const nextState = financeCore.removeLessonTransactionsState({
      students,
      txs,
      lessonId,
      kind: 'no_show'
    });
    if (!nextState.removedTxs.length) return;
    setStudents(nextState.students);
    setTxs(nextState.txs);
  };
  const removeLessonAttendanceTxs = lessonId => {
    const lesson = lessons.find(l => l.id === lessonId);
    const hasPackageUse = Object.values(lesson?.packageUse || {}).some(Boolean);
    const nextState = financeCore.removeLessonTransactionsState({
      students,
      txs,
      lessonId,
      kind: 'attendance',
      packageUse: hasPackageUse ? lesson.packageUse : null
    });
    if (!nextState.removedTxs.length && !hasPackageUse) return;
    setStudents(nextState.students);
    setTxs(nextState.txs);
  };
  const setLessonStatus = (lessonId, status) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    if (lesson.status === 'no_show' && status !== 'no_show') removeNoShowCharges(lessonId);
    if (lesson.status === 'completed' && status !== 'completed') removeLessonAttendanceTxs(lessonId);
    if (status === 'no_show') chargeNoShow(lesson);
    const attendance = status === 'no_show' ? Object.fromEntries(getLessonStudents(lesson, students, groups).map(s => [s.id, false])) : lesson.attendance;
    setLessons(p => p.map(l => l.id === lessonId ? {
      ...l,
      status,
      attendance,
      packageUse: status === 'planned' ? {} : l.packageUse || {}
    } : l));
    setModal(null);
  };
  const saveAttendance = (lessonId, newAtt, meta = {}) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    let baseStudents = students;
    let baseTxs = txs;
    if (lesson.status === 'no_show') {
      const cleanState = financeCore.removeLessonTransactionsState({
        students,
        txs,
        lessonId,
        kind: 'no_show'
      });
      baseStudents = cleanState.students;
      baseTxs = cleanState.txs;
    }
    const nextState = financeCore.saveAttendanceState({
      students: baseStudents,
      txs: baseTxs,
      lesson,
      lessonStudents: lessonFinanceStudents(lesson),
      newAttendance: newAtt,
      date: getTodayDate(),
      lessonDateLabel: fmtDate(lesson.date),
      createId: index => Date.now() + index + Math.random()
    });
    const nextStudentsWithProgress = applyLessonStudyProgressState(nextState.students, lesson.progressByStudent || {}, meta.progressByStudent || {}, newAtt);
    setStudents(nextStudentsWithProgress);
    setTxs(nextState.txs);
    setLessons(p => p.map(l => l.id === lessonId ? {
      ...l,
      ...meta,
      status: 'completed',
      attendance: newAtt,
      packageUse: nextState.packageUse
    } : l));
    setModal(null);
  };
  const closeTodayLessons = () => {
    const now = new Date();
    const due = lessons.filter(l => l.status === 'planned' && l.date === getTodayDate() && new Date(`${l.date}T${l.time}`) <= now);
    if (!due.length) return;
    if (!confirm(`Закрыть прошедшие уроки за сегодня: ${due.length}? Все ученики будут отмечены присутствующими.`)) return;
    due.forEach(l => {
      const att = {};
      getLessonStudents(l, students, groups).forEach(s => {
        att[s.id] = true;
      });
      saveAttendance(l.id, att);
    });
  };
  const clearStorageCopies = () => {
    [STORAGE_KEY, 'tutor-backup-1', 'tutor-backup-2', 'tutor-backup-3', 'tutor-templates'].forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  };
  const loadDemoData = (ask = true) => {
    if (ask !== false && !confirm('Загрузить демо-набор? Текущие данные будут заменены.')) return;
    const demo = cloneDemoState();
    localStorage.removeItem(STORAGE_KEY);
    setStudents(demo.students);
    setGroups(demo.groups);
    setLessons(demo.lessons);
    setTxs(demo.txs);
    setSettings(demo.settings || {
      theme: 'light'
    });
    setCustomTemplates([]);
    setSelDate(getTodayDate());
    setWeekOffset(0);
    setTab('today');
    setModal(null);
  };
  const clearDemoData = (ask = true) => {
    if (ask !== false && !confirm('Очистить демо-данные и начать с пустого приложения?')) return;
    const empty = cloneEmptyState();
    clearStorageCopies();
    setStudents(empty.students);
    setGroups(empty.groups);
    setLessons(empty.lessons);
    setTxs(empty.txs);
    setSettings({
      ...empty.settings,
      theme: settings.theme || 'light'
    });
    setCustomTemplates([]);
    setLastSavedAt(null);
    setLastBackupAt(null);
    setStorageWarning('');
    setSelDate(getTodayDate());
    setWeekOffset(0);
    setTab('today');
    setModal(null);
  };
  const exportCsv = () => {
    const header = ['date', 'student', 'type', 'amount', 'comment'];
    const rows = txs.map(tx => {
      const s = students.find(st => sameId(st.id, tx.studentId));
      return [tx.date, s?.name || 'Удален', tx.type, tx.amount, tx.comment || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const blob = new Blob([[header.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-finance-${getTodayDate()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportJson = () => {
    const exportedAt = new Date().toISOString();
    const snapshot = {
      version: STORAGE_VERSION,
      exportedAt,
      app: 'TutorApp',
      students,
      groups,
      lessons,
      txs,
      settings,
      customTemplates
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-backup-${getTodayDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setLastBackupAt(exportedAt);
  };
  const normalizeImportedBackup = raw => {
    const source = raw?.data && (raw.data.students || raw.data.lessons || raw.data.txs) ? raw.data : raw;
    if (!source || !Array.isArray(source.students) || !Array.isArray(source.lessons)) return null;
    return {
      exportedAt: raw.exportedAt || raw.t || source.exportedAt || null,
      students: source.students || [],
      groups: Array.isArray(source.groups) ? source.groups : [],
      lessons: source.lessons || [],
      txs: Array.isArray(source.txs) ? source.txs : [],
      settings: source.settings || settings,
      customTemplates: Array.isArray(source.customTemplates) ? source.customTemplates : Array.isArray(raw.customTemplates) ? raw.customTemplates : []
    };
  };
  const createLocalBackup = (notify = true) => {
    try {
      const createdAt = new Date().toISOString();
      const backup = JSON.stringify({
        v: STORAGE_VERSION,
        t: createdAt,
        data: {
          students,
          groups,
          lessons,
          txs,
          settings,
          customTemplates
        }
      });
      const keys = ['tutor-backup-1', 'tutor-backup-2', 'tutor-backup-3'];
      const b2 = localStorage.getItem(keys[1]);
      if (b2) localStorage.setItem(keys[2], b2);
      const b1 = localStorage.getItem(keys[0]);
      if (b1) localStorage.setItem(keys[1], b1);
      localStorage.setItem(keys[0], backup);
      setLastBackupAt(createdAt);
      setStorageWarning('');
      if (notify) alert('Локальная копия создана.');
      return true;
    } catch (e) {
      setStorageWarning(e?.name === 'QuotaExceededError' ? 'Память браузера заполнена. Скачайте бэкап и очистите лишние данные.' : 'Не удалось создать локальную копию.');
      if (notify) alert('Не удалось создать локальную копию.');
      return false;
    }
  };
  const importFullJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const imported = normalizeImportedBackup(JSON.parse(ev.target.result));
          if (!imported) {
            alert('Файл не распознан: нет данных об учениках или уроках.');
            return;
          }
          const date = imported.exportedAt ? new Date(imported.exportedAt).toLocaleString('ru-RU') : 'неизвестная дата';
          if (!confirm(`Загрузить полный бэкап от ${date}?\n\nТекущие данные будут полностью заменены. Перед импортом приложение создаст локальную копию текущего состояния.`)) return;
          createLocalBackup(false);
          setStudents(imported.students);
          setGroups(imported.groups);
          setLessons(imported.lessons);
          setTxs(imported.txs);
          setSettings(imported.settings);
          setCustomTemplates(imported.customTemplates);
          setModal(null);
          alert('Импорт всей базы завершен.');
        } catch {
          alert('Не удалось прочитать файл. Возможно, он поврежден.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  const applyStudentTextImport = text => {
    const plan = buildStudentTextImportPlan(text, students, groups);
    const hasImport = plan.newStudents.length || plan.groups.length || plan.existingUpdates.length;
    if (!hasImport) {
      alert('Не удалось найти новых учеников или групп. Проверьте, что в строках есть имена.');
      return;
    }
    const stamp = Date.now();
    const newStudents = plan.newStudents.map((draft, index) => ({
      id: stamp + index,
      name: draft.name,
      rate: normalizeMoneyInput(draft.rate, DEFAULT_RATE),
      phone: draft.phone || '',
      balance: 0,
      archived: false,
      packageLessons: 0,
      subjects: draft.subjects?.length ? draft.subjects : ['История'],
      lessonRates: {}
    }));
    const keyToId = new Map(students.map(student => [importNameKey(student.name), student.id]).filter(([key]) => key));
    newStudents.forEach(student => keyToId.set(importNameKey(student.name), student.id));
    const updatesById = new Map(plan.existingUpdates.map(update => [String(update.id), update]));
    const nextExistingStudents = students.map(student => {
      const update = updatesById.get(String(student.id));
      if (!update) return student;
      const subjects = [...new Set([...(student.subjects || (student.subject ? [student.subject] : [])), ...(update.subjects || [])])];
      return {
        ...student,
        phone: student.phone || update.phone || '',
        subjects: subjects.length ? subjects : ['История']
      };
    });
    const newGroups = plan.groups.map((draft, index) => {
      const studentIds = draft.studentKeys.map(key => keyToId.get(key)).filter(id => id != null);
      return {
        id: stamp + 1000 + index,
        name: draft.name || '',
        emoji: randomGroupEmoji(),
        subject: draft.subject || 'История',
        archived: false,
        studentIds,
        rateOverrides: draft.rate ? Object.fromEntries(studentIds.map(id => [id, normalizeMoneyInput(draft.rate, DEFAULT_RATE)])) : {}
      };
    }).filter(group => group.studentIds.length > 1);
    setStudents([...nextExistingStudents, ...newStudents]);
    setGroups([...groups, ...newGroups]);
    setStudentsView(newGroups.length ? 'groups' : 'students');
    setTab('students');
    setModal(null);
    alert(`Импорт завершен.\nНовые ученики: ${newStudents.length}\nОбновлено совпадений: ${plan.existingUpdates.length}\nГруппы: ${newGroups.length}`);
  };
  const exportSchedulePdf = (fromDate, toDate) => {
    const filtered = lessons.filter(l => l.date >= fromDate && l.date <= toDate).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const getName = l => {
      if (l.type === 'group') return getGroupDisplayName(groups.find(g => sameId(g.id, l.targetId)), students) || 'Группа';
      const student = students.find(s => sameId(s.id, l.targetId));
      if (student?.name) return student.name;
      const staleGroup = groups.find(g => sameId(g.id, l.targetId));
      return getGroupDisplayName(staleGroup, students) || 'Индивидуально';
    };
    const statusRu = s => LESSON_STATUS[s]?.label || s;
    const cards = filtered.map(l => `
      <section class="lesson-card-print">
        <div class="time">${l.time}</div>
        <div class="body">
          <div class="date">${fmtDate(l.date)} · ${l.type === 'group' ? 'Группа' : 'Индивидуально'} · ${statusRu(l.status)}</div>
          <h3>${getName(l)}</h3>
          <div class="chips"><span>${l.subject || '—'}</span>${l.topic ? `<span>${l.topic}</span>` : ''}</div>
          <div class="checks">
            <label><i></i> Проведено</label>
            <label><i></i> Оплата</label>
            <label><i></i> ДЗ</label>
            <label><i></i> Напомнить</label>
          </div>
          <div class="notes">Заметки:</div>
        </div>
      </section>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <title>Расписание ${fromDate} — ${toDate}</title>
    <style>
      body{font-family:Inter,Arial,sans-serif;font-size:12px;padding:18px;color:#151515}
      h2{margin:0 0 4px;font-size:20px}
      .sub{color:#666;margin:0 0 14px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .lesson-card-print{break-inside:avoid;display:grid;grid-template-columns:68px 1fr;border:2px solid #1d1d1d;border-radius:8px;overflow:hidden;min-height:132px;background:#fff}
      .time{background:#f3d45f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px}
      .body{padding:10px 12px}
      .date{font-size:10px;color:#666;text-transform:uppercase;font-weight:800;margin-bottom:3px}
      h3{font-size:15px;line-height:1.2;margin:0 0 6px}
      .chips{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px}
      .chips span{border:1.5px solid #222;border-radius:4px;padding:2px 6px;font-size:9px;font-weight:800;text-transform:uppercase}
      .checks{display:grid;grid-template-columns:1fr 1fr;gap:5px 10px;margin:8px 0}
      .checks label{font-size:11px;display:flex;align-items:center;gap:5px}
      .checks i{width:13px;height:13px;border:1.8px solid #222;display:inline-block;border-radius:2px}
      .notes{height:22px;border-bottom:1px solid #999;color:#777;font-size:10px}
      @media print{body{padding:0}.grid{gap:8px}}
    </style></head><body>
    <h2>Расписание: ${fmtDate(fromDate)} — ${fmtDate(toDate)}</h2>
    <p class="sub">Всего занятий: ${filtered.length}</p>
    <div class="grid">${cards}</div>
    </body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 400);
  };
  const toggleTheme = () => {
    setSettings(p => ({
      ...p,
      theme: p.theme === 'dark' ? 'light' : 'dark'
    }));
  };
  const getLessonName = l => {
    if (l.type === 'group') return getGroupDisplayName(groups.find(g => sameId(g.id, l.targetId)), students) || 'Группа';
    const student = students.find(s => sameId(s.id, l.targetId));
    if (student?.name) return student.name;
    const staleGroup = groups.find(g => sameId(g.id, l.targetId));
    return getGroupDisplayName(staleGroup, students) || 'Индивидуально';
  };
  const openLessonCard = l => {
    if (!l) return;
    setModal({
      type: 'lesson',
      payload: {
        lesson: l
      }
    });
  };

  // ── PAGES ──────────────────────────────────────────────────────────────────

  // TODAY PAGE
  const PageToday = () => {
    const todayLessons = lessons.filter(l => l.date === getTodayDate()).sort((a, b) => a.time.localeCompare(b.time));
    const activeStudents = students.filter(s => !s.archived);
    const debt = activeStudents.filter(s => s.balance < 0).reduce((s, st) => s + Math.abs(st.balance), 0);
    const debtors = activeStudents.filter(s => s.balance < 0).length;
    const now = new Date();
    const plannedToday = todayLessons.filter(l => l.status === 'planned');
    const dueToday = plannedToday.filter(l => new Date(`${l.date}T${l.time}`) <= now);
    const todayTxs = txs.filter(tx => tx.date === getTodayDate());
    const earnedToday = todayTxs.filter(tx => tx.type === 'payment').reduce((s, tx) => s + tx.amount, 0);
    const chargedToday = todayTxs.filter(tx => tx.type === 'charge').reduce((s, tx) => s + tx.amount, 0);
    const futureLessons = lessons.filter(l => l.status === 'planned' && l.date >= getTodayDate());
    const lowPackages = activeStudents.filter(s => (s.packageLessons || 0) === 1).length;
    const todayNotes = todayLessons.filter(l => l.lessonNote).length;
    const attention = [...activeStudents.filter(s => (s.packageLessons || 0) === 1).slice(0, 3).map(s => ({
      kind: 'Абонемент',
      text: `${s.name}: остался 1 урок`,
      student: s
    })), ...activeStudents.filter(s => !futureLessons.some(l => getLessonStudents(l, students, groups).some(st => sameId(st.id, s.id)))).slice(0, 3).map(s => ({
      kind: 'Нет уроков',
      text: s.name,
      student: s
    }))].slice(0, 5);
    const actionItems = [{
      key: 'close',
      label: 'Закрыть прошедшие уроки',
      count: dueToday.length,
      tone: 'hot',
      action: closeTodayLessons
    }, {
      key: 'packages',
      label: 'Пополнить абонементы',
      count: lowPackages,
      tone: 'warn',
      action: () => setTab('finance')
    }, {
      key: 'notes',
      label: 'Уроки с пометками',
      count: todayNotes,
      tone: 'warn',
      action: () => setTab('schedule')
    }].filter(item => item && Number(item.count) > 0).slice(0, 2);
    // Active lesson detection
    const currentLesson = todayLessons.find(l => {
      if (l.status !== 'planned') return false;
      const s = new Date(`${l.date}T${l.time}`).getTime();
      const e = s + (l.duration || 60) * 60000;
      return now.getTime() >= s && now.getTime() <= e;
    });
    return _jsxs("div", {
      className: "today-page",
      children: [currentLesson && _jsx(TimerBanner, {
        lesson: currentLesson,
        name: getLessonName(currentLesson),
        onAttend: () => setModal({
          type: 'attendance',
          payload: currentLesson
        })
      }), _jsxs("div", {
        className: "today-hero",
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20
        },
        children: [_jsxs("div", {
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 11,
              color: 'var(--text-sec)',
              textTransform: 'uppercase',
              letterSpacing: '.05em'
            },
            children: new Date().toLocaleDateString('ru-RU', {
              weekday: 'long'
            })
          }), _jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.1
            },
            children: new Date().toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long'
            })
          })]
        }), _jsxs("div", {
          style: {
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start'
          },
          children: [debt > 0 && _jsxs("button", {
            type: "button",
            className: "today-debt-pill",
            onClick: () => setTab('finance'),
            style: {
              background: 'var(--bg-danger)',
              border: 'var(--border)',
              borderColor: 'color-mix(in srgb, var(--red) 54%, var(--border-light))',
              borderRadius: 4,
              padding: '8px 12px',
              boxShadow: 'none',
              textAlign: 'left',
              cursor: 'pointer'
            },
            children: [_jsx("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontSize: 9,
                color: 'var(--red)',
                textTransform: 'uppercase'
              },
              children: "\u0414\u043E\u043B\u0433\u0438"
            }), _jsxs("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontSize: 16,
                fontWeight: 900,
                color: 'var(--black)'
              },
              children: [debt.toLocaleString(), " \u20BD"]
            }), _jsxs("div", {
              style: {
                fontSize: 10,
                color: 'var(--text-sec)'
              },
              children: [debtors, " \u0447\u0435\u043B."]
            })]
          }), _jsx("button", {
            className: "btn btn-sm btn-white demo-reset-top",
            onClick: () => clearDemoData(true),
            title: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0434\u0435\u043C\u043E-\u0434\u0430\u043D\u043D\u044B\u0435",
            children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0434\u0435\u043C\u043E"
          }), _jsx("button", {
            className: "btn btn-sm btn-white theme-toggle",
            onClick: toggleTheme,
            title: settings.theme === 'dark' ? 'Светлая тема' : 'Тёмная тема',
            children: settings.theme === 'dark' ? _jsx(IcoSun, {
              size: 16
            }) : _jsx(IcoMoon, {
              size: 16
            })
          })]
        })]
      }), students.length === 0 && lessons.length === 0 && _jsx(EmptyState, {
        title: "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0441 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0443\u0447\u0435\u043D\u0438\u043A\u0430",
        text: "\u0414\u0435\u043C\u043E-\u0434\u0430\u043D\u043D\u044B\u0435 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u043C\u0435\u0448\u0430\u044E\u0442: \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0430, \u0437\u0430\u0442\u0435\u043C \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0437\u0430\u043D\u044F\u0442\u0438\u0435 \u0438\u043B\u0438 \u0433\u0440\u0443\u043F\u043F\u0443.",
        action: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0430",
        onAction: () => setModal({
          type: 'student',
          payload: null
        }),
        secondary: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0435\u043C\u043E-\u0433\u0440\u0443\u043F\u043F\u0443",
        onSecondary: () => loadDemoData(groups.length || txs.length ? true : false)
      }), _jsxs("div", {
        className: "today-stats-grid",
        children: [_jsxs("div", {
          className: "stat-card stat-card-ink",
          children: [_jsx("div", {
            className: "stat-label",
            children: "\u0423\u0440\u043E\u043A\u043E\u0432"
          }), _jsx("div", {
            className: "stat-value",
            children: todayLessons.length
          })]
        }), _jsxs("div", {
          className: "stat-card",
          children: [_jsx("div", {
            className: "stat-label",
            children: "\u0423\u0447\u0435\u043D\u0438\u043A\u043E\u0432"
          }), _jsx("div", {
            className: "stat-value",
            children: activeStudents.length
          })]
        }), _jsxs("div", {
          className: `stat-card stat-card-earned ${chargedToday > 0 ? 'has-value' : ''} ${chargedToday >= 10000 ? 'has-large' : ''}`,
          children: [_jsx("div", {
            className: "stat-label",
            children: "\u0417\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E"
          }), _jsx("div", {
            className: "stat-value",
            children: chargedToday > 0 ? money(chargedToday) : '—'
          })]
        })]
      }), actionItems.length > 0 && _jsxs("div", {
        className: "today-command-panel",
        children: [_jsx("div", {
          className: "today-command-title",
          children: "\u0424\u043E\u043A\u0443\u0441 \u0434\u043D\u044F"
        }), _jsx("div", {
          className: "today-command-grid",
          children: actionItems.map(item => _jsxs("button", {
            className: `today-command-item ${item.tone}`,
            disabled: item.count === 0,
            onClick: item.action,
            children: [_jsx("strong", {
              children: item.count
            }), _jsx("span", {
              children: item.label
            })]
          }, item.key))
        })]
      }), dueToday.length > 0 && _jsx("div", {
        className: "card today-close-card",
        children: _jsxs("div", {
          className: "today-close-row",
          children: [_jsxs("div", {
            className: "today-close-body",
            children: [_jsx("div", {
              className: "label",
              children: "\u0417\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0434\u043D\u044F"
            }), _jsx("div", {
              className: "today-close-text",
            children: _jsxs(_Fragment, {
              children: ["\u041D\u0443\u0436\u043D\u043E \u0437\u0430\u043A\u0440\u044B\u0442\u044C: ", _jsx("strong", {
                children: dueToday.length
              }), " \u0443\u0440."]
            })
            }), _jsxs("div", {
              className: "today-close-meta",
              children: ["\u041E\u043F\u043B\u0430\u0442\u044B: ", money(earnedToday), " \xB7 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F: ", money(chargedToday)]
            })]
          }), _jsxs("button", {
            className: "btn btn-sm btn-green",
            onClick: closeTodayLessons,
            children: ["\u0417\u0430\u043A\u0440\u044B\u0442\u044C ", dueToday.length]
          })]
        })
      }), attention.length > 0 && _jsxs("div", {
        className: "card today-attention-card",
        style: {
          padding: 12,
          marginBottom: 16
        },
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 12,
            fontWeight: 900,
            marginBottom: 8
          },
          children: "\u0422\u0420\u0415\u0411\u0423\u0415\u0422 \u0412\u041D\u0418\u041C\u0410\u041D\u0418\u042F"
        }), attention.map((item, i) => {
          const phoneClean = (item.student.phone || '').replace(/\s/g, '');
          return _jsxs("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 0',
              borderTop: i ? '1px solid var(--border-light)' : 'none'
            },
            children: [_jsx("span", {
              className: `badge ${item.kind === 'Долг' ? 'badge-red' : item.kind === 'Абонемент' ? 'badge-yellow' : 'badge-green'}`,
              children: item.kind
            }), _jsx("div", {
              style: {
                fontSize: 12,
                flex: 1
              },
              children: item.text
            }), item.student.phone && _jsx("a", {
              href: `tel:${phoneClean}`,
              className: "btn btn-sm btn-white",
              style: {
                padding: '4px 7px',
                textDecoration: 'none',
                color: 'inherit',
                minHeight: 'auto'
              },
              onClick: e => e.stopPropagation(),
              title: "\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C",
              children: _jsx(IcoPhone, {
                size: 14
              })
            }), item.student.tgId && _jsx("button", {
              className: "btn btn-sm btn-blue",
              style: {
                padding: '4px 7px',
                minHeight: 'auto'
              },
              onClick: () => {
                const id = String(item.student.tgId).trim();
                window.open(id.startsWith('@') ? `https://t.me/${id.slice(1)}` : `https://t.me/${id}`, '_blank');
              },
              title: "Telegram",
              children: _jsx(IcoTg, {
                size: 14
              })
            }), _jsx("button", {
              className: "btn btn-sm btn-white",
              style: {
                minHeight: 'auto'
              },
              onClick: () => setModal({
                type: 'message',
                payload: {
                  student: item.student,
                  mode: item.student.balance < 0 ? 'debt' : null
                }
              }),
              children: "\u0422\u0435\u043A\u0441\u0442"
            })]
          }, i);
        })]
      }), _jsxs("div", {
        className: "today-lessons-head",
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10
        },
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 13,
            fontWeight: 900
          },
          children: "\u0421\u0415\u0413\u041E\u0414\u041D\u042F"
        }), _jsxs("button", {
          className: "btn btn-sm btn-black today-section-add",
          onClick: () => setModal({
            type: 'lesson',
            payload: {
              date: getTodayDate()
            }
          }),
          children: [_jsx(IcoPlus, {
            size: 14
          }), " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"]
        })]
      }), todayLessons.length === 0 ? _jsx("div", {
        className: "card",
        style: {
          padding: 24,
          textAlign: 'center'
        },
        children: _jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.5
          },
          children: "\u0423\u0440\u043E\u043A\u043E\u0432 \u043D\u0435\u0442"
        })
      }) : todayLessons.map(l => _jsx(LessonCard, {
        lesson: l,
        name: getLessonName(l),
        onEdit: () => setModal({
          type: 'lesson',
          payload: {
            lesson: l
          }
        }),
        onAttend: () => setModal({
          type: 'attendance',
          payload: l
        }),
        onStatus: () => setModal({
          type: 'lessonStatus',
          payload: l
        }),
        onDelete: e => requestDeleteLesson(l, e)
      }, l.id))]
    });
  };

  // SCHEDULE PAGE
  const PageSchedule = () => {
    const scheduleLessons = schedSubject === 'all' ? lessons : lessons.filter(l => getLessonSubject(l, groups) === schedSubject);
    const WeekView = () => {
      const mobileDragRef = useRef(null);
      const mobileSuppressClickRef = useRef(false);
      // Mon–Sun of selected week
      const getWeekDates = offset => {
        const today = new Date();
        const dow = today.getDay() || 7; // Mon=1..Sun=7
        const mon = new Date(today);
        mon.setDate(today.getDate() - dow + 1 + offset * 7);
        return Array.from({
          length: 7
        }, (_, i) => {
          const d = new Date(mon);
          d.setDate(mon.getDate() + i);
          return localDateString(d);
        });
      };
      const weekDates = getWeekDates(weekOffset);
      const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
      const today = getTodayDate();

      // All unique times in this week, sorted
      const weekLessons = scheduleLessons.filter(l => weekDates.includes(l.date));
      const allTimes = [...new Set(weekLessons.map(l => l.time))].sort();

      // Week label
      const [wStart, wEnd] = [weekDates[0], weekDates[6]];
      const fmtShort = ds => new Date(ds + 'T00:00:00').toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short'
      });
      const swipeRef = useSwipe(() => setWeekOffset(w => w + 1), () => setWeekOffset(w => w - 1));

      const weekDaySummaries = weekDates.map((d, i) => ({
        date: d,
        index: i,
        num: new Date(d + 'T00:00:00').getDate(),
        isToday: d === today,
        lessons: scheduleLessons.filter(l => l.date === d).sort((a, b) => a.time.localeCompare(b.time))
      }));
      const mobileDay = Math.max(0, weekDates.indexOf(weekDates.includes(selDate) ? selDate : weekDates.includes(today) ? today : weekDates[0]));
      const mobileDayData = weekDaySummaries[mobileDay] || weekDaySummaries[0];
      const mobileDayLessons = mobileDayData?.lessons || [];
      const mobileMarkers = l => {
        const markers = [];
        if (l.homework) markers.push(['homework', 'ДЗ']);
        if (l.lessonNote) markers.push(['note', 'Заметка']);
        if (findLessonConflicts(l, lessons, students, groups, l.id).length) markers.push(['conflict', 'Конфликт']);
        if (getLessonStudents(l, students, groups).some(s => s.balance < 0)) markers.push(['debt', 'Долг']);
        if (l.seriesId) markers.push(['series', 'Серия']);
        return markers;
      };
      const mobileTableTimes = [...new Set([...allTimes, '15:00', '16:30', '18:00'])].sort();
      const dropLessonTo = (e, date, time) => {
        e.preventDefault();
        const id = Number(e.dataTransfer.getData('text/lesson-id'));
        if (!id) return;
        setSelDate(date);
        moveLesson(id, date, time);
      };
      const openAddLessonAt = (date, time) => {
        const payload = {
          date
        };
        if (time) payload.time = time;
        setSelDate(date);
        setModal({
          type: 'lesson',
          payload
        });
      };
      const startMobileLessonDrag = (e, lesson) => {
        if (lesson.status !== 'planned' || !e.pointerId) return;
        const source = e.currentTarget;
        const drag = {
          lessonId: lesson.id,
          startX: e.clientX,
          startY: e.clientY,
          active: false
        };
        mobileDragRef.current = drag;
        const cleanup = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          window.removeEventListener('pointercancel', onCancel);
          source.classList.remove('is-touch-dragging');
          document.body.classList.remove('mobile-week-dragging');
          mobileDragRef.current = null;
        };
        const onMove = ev => {
          const current = mobileDragRef.current;
          if (!current || current.lessonId !== lesson.id) return;
          const dx = ev.clientX - current.startX;
          const dy = ev.clientY - current.startY;
          if (!current.active && Math.hypot(dx, dy) > 16) {
            current.active = true;
            source.classList.add('is-touch-dragging');
            document.body.classList.add('mobile-week-dragging');
          }
          if (current.active) ev.preventDefault();
        };
        const onUp = ev => {
          const current = mobileDragRef.current;
          const wasActive = Boolean(current?.active);
          cleanup();
          if (!wasActive) return;
          mobileSuppressClickRef.current = true;
          setTimeout(() => {
            mobileSuppressClickRef.current = false;
          }, 250);
          const target = document.elementFromPoint(ev.clientX, ev.clientY);
          const drop = target?.closest?.('[data-mobile-week-drop="1"]');
          const date = drop?.getAttribute('data-date');
          const time = drop?.getAttribute('data-time');
          if (date && time) {
            setSelDate(date);
            moveLesson(lesson.id, date, time);
          }
          ev.preventDefault();
        };
        const onCancel = () => cleanup();
        window.addEventListener('pointermove', onMove, {
          passive: false
        });
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);
      };
      const mobileTableCells = mobileTableTimes.flatMap(time => {
        const timeCell = _jsx("div", {
          className: "mobile-week-table-time",
          children: time
        }, `time-${time}`);
        const dayCells = weekDates.map((date, di) => {
          const cell = scheduleLessons.filter(l => l.date === date && l.time === time).sort((a, b) => String(a.id).localeCompare(String(b.id)));
          if (cell.length === 0) {
            return _jsx("button", {
              type: "button",
              className: `mobile-week-table-cell empty ${date === selDate ? 'selected-day' : ''}`,
              "data-date": date,
              "data-time": time,
              "data-mobile-week-drop": "1",
              "aria-label": `Добавить урок ${date} ${time}`,
              onClick: () => openAddLessonAt(date, time),
              onDragOver: e => e.preventDefault(),
              onDrop: e => dropLessonTo(e, date, time),
              children: _jsx("span", {
                children: "+"
              })
            }, `${date}-${time}`);
          }
          return _jsx("div", {
            className: `mobile-week-table-cell filled ${date === selDate ? 'selected-day' : ''}`,
            "data-date": date,
            "data-time": time,
            "data-mobile-week-drop": "1",
            onDragOver: e => e.preventDefault(),
            onDrop: e => dropLessonTo(e, date, time),
            children: cell.map(l => {
              const markers = mobileMarkers(l);
              const statusInfo = LESSON_STATUS[l.status] || LESSON_STATUS.planned;
              const done = isFinalLesson(l);
              return _jsxs("article", {
                role: "button",
                tabIndex: 0,
                draggable: l.status === 'planned',
                className: `mobile-week-table-lesson ${l.type === 'group' ? 'group' : 'individual'} status-${l.status} ${done ? 'done' : 'planned'}`,
                onClick: () => {
                  if (mobileSuppressClickRef.current) return;
                  setSelDate(l.date);
                  openLessonCard(l);
                },
                onKeyDown: e => {
                  if (e.key !== 'Enter' && e.key !== ' ') return;
                  e.preventDefault();
                  setSelDate(l.date);
                  openLessonCard(l);
                },
                onPointerDown: e => startMobileLessonDrag(e, l),
                onDragStart: e => {
                  e.dataTransfer.setData('text/lesson-id', String(l.id));
                  e.dataTransfer.effectAllowed = 'move';
                },
                children: [_jsxs("span", {
                  className: "mobile-week-table-lesson-title",
                  children: [l.time, " ", getLessonName(l)]
                }), _jsxs("span", {
                  className: "mobile-week-table-lesson-meta",
                  children: [_jsx("b", {
                    children: getLessonSubject(l, groups)
                  }), _jsx("em", {
                    children: statusInfo.label
                  })]
                }), markers.length > 0 && _jsx("span", {
                  className: "mobile-week-table-markers",
                  children: markers.slice(0, 4).map(([kind, title]) => _jsx("i", {
                    className: `week-dot ${kind}`,
                    title
                  }, kind))
                }), _jsx("button", {
                  type: "button",
                  className: `mobile-week-table-lesson-action ${l.status === 'planned' ? 'primary' : ''}`,
                  title: l.status === 'planned' ? "\u041F\u0440\u043E\u0432\u0435\u0441\u0442\u0438" : l.status === 'completed' ? "\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u0435" : "\u0421\u0442\u0430\u0442\u0443\u0441",
                  onPointerDown: e => e.stopPropagation(),
                  onClick: e => {
                    e.stopPropagation();
                    setModal({
                      type: l.status === 'planned' || l.status === 'completed' ? 'attendance' : 'lessonStatus',
                      payload: l
                    });
                  },
                  children: l.status === 'planned' ? _jsx(IcoPlay, {
                    size: 13
                  }) : l.status === 'completed' ? _jsx(IcoCheck, {
                    size: 13
                  }) : _jsx(IcoRepeat, {
                    size: 13
                  })
                })]
              }, l.id);
            })
          }, `${date}-${time}`);
        });
        return [timeCell, ...dayCells];
      });
      return _jsxs("div", {
        ref: swipeRef,
        className: "sched-swipe",
        children: [_jsxs("div", {
          className: "week-nav",
          children: [_jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => setWeekOffset(w => w - 1),
            children: _jsx(IcoChevL, {
              size: 16
            })
          }), _jsxs("div", {
            className: "week-title-block",
            children: [_jsx("div", {
              className: "week-title",
              children: weekOffset === 0 ? 'ЭТА НЕДЕЛЯ' : weekOffset === 1 ? 'СЛЕДУЮЩАЯ' : weekOffset === -1 ? 'ПРОШЛАЯ' : `${weekOffset > 0 ? '+' : ''}${weekOffset} НЕД.`
            }), _jsxs("div", {
              className: "week-range",
              children: [fmtShort(wStart), " \u2014 ", fmtShort(wEnd)]
            })]
          }), _jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => setWeekOffset(w => w + 1),
            children: _jsx(IcoChevR, {
              size: 16
            })
          })]
        }), _jsxs("div", {
          className: "sched-mobile",
          children: [_jsxs("div", {
            className: "mobile-week-table-shell",
            children: [_jsx("div", {
              className: "mobile-week-table-hint",
              children: "\u0421\u0434\u0432\u0438\u0433\u0430\u0439\u0442\u0435 \u0441\u0435\u0442\u043A\u0443 \u0432\u0431\u043E\u043A. \u041F\u0443\u0441\u0442\u0430\u044F \u044F\u0447\u0435\u0439\u043A\u0430 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u0442 \u0443\u0440\u043E\u043A."
            }), _jsxs("div", {
              className: "mobile-week-table-toolbar",
              children: [_jsxs("div", {
                className: "mobile-week-table-current",
                children: [_jsx("span", {
                  children: "\u0412\u044B\u0431\u0440\u0430\u043D\u043E"
                }), _jsxs("strong", {
                  children: [DAY_LABELS[mobileDayData?.index || 0], " ", mobileDayData?.num || new Date(weekDates[0] + 'T00:00:00').getDate(), " \u00B7 ", mobileDayLessons.length, " \u0443\u0440."]
                })]
              }), _jsxs("button", {
                type: "button",
                className: "mobile-week-table-add",
                onClick: () => openAddLessonAt(mobileDayData?.date || weekDates[0]),
                children: ["+ \u0423\u0440\u043E\u043A"]
              })]
            }), _jsx("div", {
              className: "mobile-week-table-scroll",
              children: _jsxs("div", {
                className: "mobile-week-table",
                children: [_jsx("div", {
                  className: "mobile-week-table-corner",
                  children: "\u0412\u0440."
                }), weekDaySummaries.map(day => _jsxs("button", {
                  type: "button",
                  className: `mobile-week-table-day ${mobileDay === day.index ? 'selected' : ''} ${day.isToday ? 'today' : ''}`,
                  onClick: () => setSelDate(day.date),
                  children: [_jsx("span", {
                    children: DAY_LABELS[day.index]
                  }), _jsx("strong", {
                    children: day.num
                  }), _jsxs("em", {
                    children: [day.lessons.length || 0, " ур."]
                  })]
                }, day.date)), mobileTableCells]
              })
            }), _jsxs("div", {
              className: "week-marker-legend mobile-week-table-legend",
              children: [_jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot homework"
                }), "ДЗ"]
              }), _jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot note"
                }), "заметка"]
              }), _jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot debt"
                }), "долг"]
              })]
            })]
          }), _jsxs("div", {
            className: "mobile-week-shell",
            children: [_jsx("div", {
              className: "mobile-week-strip",
              children: weekDaySummaries.map(day => _jsxs("button", {
                type: "button",
                className: `mobile-week-strip-day ${mobileDay === day.index ? 'selected' : ''} ${day.isToday ? 'today' : ''} ${day.lessons.length > 3 ? 'dense' : ''}`,
                onClick: () => setSelDate(day.date),
                children: [_jsx("span", {
                  children: DAY_LABELS[day.index]
                }), _jsx("strong", {
                  children: day.num
                }), _jsx("em", {
                  children: day.lessons.length || "0"
                }), day.lessons[0] && _jsx("small", {
                  children: day.lessons[0].time
                })]
              }, day.date))
            }), _jsxs("section", {
              className: `mobile-selected-day ${mobileDayData?.isToday ? 'today' : ''}`,
              children: [_jsxs("div", {
                className: "mobile-selected-head",
                children: [_jsxs("div", {
                  children: [_jsx("span", {
                    children: "Выбранный день"
                  }), _jsx("strong", {
                    children: new Date((mobileDayData?.date || weekDates[0]) + 'T00:00:00').toLocaleDateString('ru-RU', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })
                  })]
                }), _jsxs("div", {
                  className: "mobile-selected-summary",
                  children: [_jsxs("b", {
                    children: [mobileDayLessons.length, " ур."]
                  }), _jsx("button", {
                    type: "button",
                    onClick: () => setModal({
                      type: 'lesson',
                      payload: {
                        date: mobileDayData?.date || weekDates[0]
                      }
                    }),
                    children: "+"
                  })]
                })]
              }), mobileDayLessons.length ? _jsx("div", {
                className: "mobile-agenda-list",
                children: mobileDayLessons.map(l => {
                  const statusInfo = LESSON_STATUS[l.status] || LESSON_STATUS.planned;
                  const markers = mobileMarkers(l);
                  const sub = getLessonSubject(l, groups);
                  return _jsxs("article", {
                    className: `mobile-agenda-card ${l.type === 'group' ? 'group' : 'individual'} status-${l.status} ${isFinalLesson(l) ? 'final' : ''}`,
                    onClick: () => openLessonCard(l),
                    children: [_jsx("div", {
                      className: "mobile-agenda-time",
                      children: l.time
                    }), _jsxs("div", {
                      className: "mobile-agenda-body",
                      children: [_jsxs("div", {
                        className: "mobile-agenda-title",
                        children: [_jsx("span", {
                          children: getLessonName(l)
                        }), markers.length > 0 && _jsx("em", {
                          children: markers.slice(0, 4).map(([kind, title]) => _jsx("i", {
                            className: `week-dot ${kind}`,
                            title: title
                          }, kind))
                        })]
                      }), _jsxs("div", {
                        className: "mobile-agenda-meta",
                        children: [_jsx("span", {
                          children: sub
                        }), _jsx("span", {
                          children: statusInfo.label
                        }), l.duration && l.duration !== 60 && _jsx("span", {
                          children: l.duration < 60 ? `${l.duration}м` : l.duration === 90 ? '1.5ч' : '2ч'
                        })]
                      })]
                    }), _jsxs("div", {
                      className: "mobile-agenda-actions",
                      children: [l.status === 'planned' ? _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-main",
                        title: "Провести",
                        onClick: e => {
                          e.stopPropagation();
                          setModal({
                            type: 'attendance',
                            payload: l
                          });
                        },
                        children: _jsx(IcoPlay, {
                          size: 14
                        })
                      }) : l.status === 'completed' ? _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-icon",
                        title: "Посещение",
                        onClick: e => {
                          e.stopPropagation();
                          setModal({
                            type: 'attendance',
                            payload: l
                          });
                        },
                        children: _jsx(IcoCheck, {
                          size: 14
                        })
                      }) : _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-icon",
                        title: "Статус",
                        onClick: e => {
                          e.stopPropagation();
                          setModal({
                            type: 'lessonStatus',
                            payload: l
                          });
                        },
                        children: _jsx(IcoRepeat, {
                          size: 14
                        })
                      }), _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-icon",
                        title: "Перенести",
                        onClick: e => {
                          e.stopPropagation();
                          setModal({
                            type: 'reschedule',
                            payload: {
                              lesson: l
                            }
                          });
                        },
                        children: _jsx(IcoRepeat, {
                          size: 14
                        })
                      }), _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-icon",
                        title: "Изменить",
                        onClick: e => {
                          e.stopPropagation();
                          setModal({
                            type: 'lesson',
                            payload: {
                              lesson: l
                            }
                          });
                        },
                        children: _jsx(IcoEdit, {
                          size: 14
                        })
                      }), _jsx("button", {
                        type: "button",
                        className: "mobile-agenda-icon danger",
                        title: "Удалить",
                        onClick: e => requestDeleteLesson(l, e),
                        children: _jsx(IcoTrash, {
                          size: 14
                        })
                      })]
                    })]
                  }, l.id);
                })
              }) : _jsx("button", {
                type: "button",
                className: "mobile-selected-empty",
                onClick: () => setModal({
                  type: 'lesson',
                  payload: {
                    date: mobileDayData?.date || weekDates[0]
                  }
                }),
                children: "Нет занятий · добавить"
              })]
            }), _jsxs("div", {
              className: "week-marker-legend",
              children: [_jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot homework"
                }), "ДЗ"]
              }), _jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot note"
                }), "заметка"]
              }), _jsxs("span", {
                children: [_jsx("i", {
                  className: "week-dot debt"
                }), "долг"]
              })]
            })]
          })]
        }), _jsx("div", {
          className: "sched-desktop",
          children: _jsx("div", {
            className: "schedule-grid-wrap",
            children: _jsxs("table", {
              className: "schedule-table",
              children: [_jsx("thead", {
                children: _jsxs("tr", {
                  children: [_jsx("th", {
                    className: "schedule-time-head"
                  }), weekDates.map((d, i) => {
                    const isToday = d === today;
                    const num = new Date(d + 'T00:00:00').getDate();
                    return _jsxs("th", {
                      onClick: () => setSelDate(d),
                      className: `schedule-head-cell ${isToday ? 'today' : ''} ${selDate === d ? 'selected' : ''}`,
                      children: [_jsx("div", {
                        className: "schedule-head-weekday",
                        children: DAY_LABELS[i]
                      }), _jsx("div", {
                        className: "schedule-head-daynum",
                        children: num
                      })]
                    }, d);
                  })]
                })
              }), _jsx("tbody", {
                children: allTimes.length === 0 ? _jsx("tr", {
                  children: _jsx("td", {
                    colSpan: 8,
                    children: _jsx("div", {
                      className: "schedule-empty-week",
                      children: "\u0423\u0440\u043E\u043A\u043E\u0432 \u043D\u0430 \u044D\u0442\u0443 \u043D\u0435\u0434\u0435\u043B\u044E \u043D\u0435\u0442"
                    })
                  })
                }) : allTimes.map(time => {
                  const byDay = {};
                  weekDates.forEach((d, i) => {
                    byDay[i] = scheduleLessons.filter(l => l.date === d && l.time === time);
                  });
                  return _jsxs("tr", {
                    children: [_jsx("td", {
                      className: "schedule-time-cell",
                      children: time
                    }), [0, 1, 2, 3, 4, 5, 6].map(di => {
                      const cell = byDay[di] || [];
                      if (cell.length === 0) {
                        return _jsx("td", {
                          className: "schedule-grid-cell",
                          children: _jsx("div", {
                            "data-date": weekDates[di],
                            "data-time": time,
                            "aria-label": `Добавить урок ${weekDates[di]} ${time}`,
                            role: "button",
                            onClick: () => openAddLessonAt(weekDates[di], time),
                            onDragOver: e => e.preventDefault(),
                            onDrop: e => {
                              e.preventDefault();
                              const id = Number(e.dataTransfer.getData('text/lesson-id'));
                              if (id) {
                                setSelDate(weekDates[di]);
                                moveLesson(id, weekDates[di], time);
                              }
                            },
                            className: "schedule-empty-cell"
                          })
                        }, di);
                      }
                      return _jsx("td", {
                        className: "schedule-grid-cell",
                        onDragOver: e => e.preventDefault(),
                        onDrop: e => {
                          e.preventDefault();
                          const id = Number(e.dataTransfer.getData('text/lesson-id'));
                          if (id) {
                            setSelDate(weekDates[di]);
                            moveLesson(id, weekDates[di], time);
                          }
                        },
                        children: cell.map(l => {
                          const name = getLessonName(l);
                          const done = isFinalLesson(l);
                          const statusInfo = LESSON_STATUS[l.status] || LESSON_STATUS.planned;
                          const hasConflict = findLessonConflicts(l, lessons, students, groups, l.id).length > 0;
                          return _jsxs("div", {
                            draggable: l.status === 'planned',
                            onDragStart: e => {
                              e.dataTransfer.setData('text/lesson-id', String(l.id));
                              e.dataTransfer.effectAllowed = 'move';
                            },
                            onClick: () => openLessonCard(l),
                            className: `schedule-lesson-cell ${done ? 'done' : 'planned'} ${l.type === 'group' ? 'group' : 'individual'} ${hasConflict ? 'conflict' : ''}`,
                            children: [(() => {
                              const stList = getLessonStudents(l, students, groups);
                              const hasDebt = stList.some(s => s.balance < 0);
                              const hasNote = Boolean(l.lessonNote);
                              const hasSeries = Boolean(l.seriesId);
                              return hasDebt || hasConflict || hasNote || hasSeries ? _jsxs("div", {
                                className: "lesson-markers",
                                children: [hasNote && _jsx("span", {
                                  className: "lesson-marker-dot lesson-marker-note",
                                  title: "\u0415\u0441\u0442\u044C \u043F\u043E\u043C\u0435\u0442\u043A\u0430"
                                }), hasConflict && _jsx("span", {
                                  className: "lesson-marker-dot lesson-marker-conflict",
                                  title: "\u041A\u043E\u043D\u0444\u043B\u0438\u043A\u0442 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F"
                                }), hasDebt && _jsx("span", {
                                  className: "lesson-marker-dot lesson-marker-debt",
                                  title: "\u0415\u0441\u0442\u044C \u0437\u0430\u0434\u043E\u043B\u0436\u0435\u043D\u043D\u043E\u0441\u0442\u044C"
                                }), hasSeries && _jsx("span", {
                                  className: "lesson-marker-dot lesson-marker-series",
                                  title: "\u0421\u0435\u0440\u0438\u044F \u0443\u0440\u043E\u043A\u043E\u0432"
                                })]
                              }) : null;
                            })(), _jsx("div", {
                              className: "schedule-lesson-title",
                              children: name
                            }), _jsxs("div", {
                              className: "schedule-lesson-finance",
                              children: [_jsx("span", {
                                children: getLessonSubject(l, groups)
                              }), _jsx("span", {
                                children: money(getLessonStudents(l, students, groups).reduce((sum, s) => sum + getLessonRate(l, s, groups), 0))
                              })]
                            }), _jsxs("div", {
                              className: "schedule-lesson-meta",
                              children: [_jsx("span", {
                                children: hasConflict ? `⚠ ${statusInfo.label}` : statusInfo.label
                              }), l.duration && l.duration !== 60 && _jsx("span", {
                                children: l.duration < 60 ? `${l.duration}м` : l.duration === 90 ? '1.5ч' : '2ч'
                              })]
                            })]
                          }, l.id);
                        })
                      }, di);
                    })]
                  }, time);
                })
              })]
            })
          })
        }), selDate && weekDates.includes(selDate) && (() => {
          const dl = scheduleLessons.filter(l => l.date === selDate).sort((a, b) => a.time.localeCompare(b.time));
          const obj = new Date(selDate + 'T00:00:00');
          const title = obj.toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          }).toUpperCase();
          return _jsxs("div", {
            className: "desktop-selected-day-panel",
            children: [_jsxs("div", {
              className: "desktop-selected-day-head",
              children: [_jsxs("div", {
                children: [_jsx("span", {
                  children: "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0434\u0435\u043D\u044C"
                }), _jsx("strong", {
                  children: title
                })]
              }), _jsx("button", {
                className: "btn btn-sm desktop-selected-add",
                onClick: () => setModal({
                  type: 'lesson',
                  payload: {
                    date: selDate
                  }
                }),
                children: "+ \u0423\u0420\u041E\u041A"
              })]
            }), dl.length === 0 ? _jsx("button", {
              type: "button",
              className: "desktop-selected-empty",
              onClick: () => setModal({
                type: 'lesson',
                payload: {
                  date: selDate
                }
              }),
              children: "\u041D\u0435\u0442 \u0443\u0440\u043E\u043A\u043E\u0432 \u00B7 \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043D\u044F\u0442\u0438\u0435"
            }) : _jsx("div", {
              className: "desktop-selected-day-list",
              children: dl.map(l => _jsx(LessonCard, {
                lesson: l,
                name: getLessonName(l),
                onAttend: () => setModal({
                  type: 'attendance',
                  payload: l
                }),
                onStatus: () => setModal({
                  type: 'lessonStatus',
                  payload: l
                }),
                onEdit: () => setModal({
                  type: 'lesson',
                  payload: {
                    lesson: l
                  }
                }),
                onDelete: e => requestDeleteLesson(l, e)
              }, l.id))
            })]
          });
        })()]
      });
    };

    // ── MONTH VIEW ─────────────────────────────────────────────────────────────
    const MonthView = () => {
      const y = calMonth.getFullYear(),
        m = calMonth.getMonth();
      let firstDow = new Date(y, m, 1).getDay();
      firstDow = firstDow === 0 ? 6 : firstDow - 1; // Mon-based
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const calendarCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
      const today = getTodayDate();
      const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
      const selDateObj = new Date(selDate + 'T00:00:00');
      const lessonsByDate = scheduleLessons.reduce((acc, l) => {
        if (!acc.has(l.date)) acc.set(l.date, []);
        acc.get(l.date).push(l);
        return acc;
      }, new Map());
      const lessonMarkers = l => {
        const markers = [];
        if (l.homework) markers.push(['homework', 'ДЗ']);
        if (l.lessonNote) markers.push(['note', 'Заметка']);
        if (findLessonConflicts(l, lessons, students, groups, l.id).length) markers.push(['conflict', 'Конфликт']);
        if (getLessonStudents(l, students, groups).some(s => s.balance < 0)) markers.push(['debt', 'Долг']);
        if (l.seriesId) markers.push(['series', 'Серия']);
        return markers;
      };
      const lessonAccent = l => (LESSON_STATUS[l.status] || LESSON_STATUS.planned).color || 'var(--blue)';
      const monthCellName = l => getLessonName(l).replace(/\s*\([^)]*\)\s*$/, '');
      const monthCellShortName = l => {
        const name = monthCellName(l).trim();
        const match = name.match(/^([A-Za-z\u0400-\u04FF]+)\s*(\d+)?/);
        if (!match) return name.slice(0, 4);
        return `${match[1].slice(0, 1).toUpperCase()}${match[2] || ''}`;
      };
      const gridStart = new Date(y, m, 1 - firstDow);
      const calendarDays = Array.from({
        length: calendarCells
      }, (_, i) => {
        const raw = new Date(gridStart);
        raw.setDate(gridStart.getDate() + i);
        const ds = localDateString(raw);
        const dayLessons = [...(lessonsByDate.get(ds) || [])].sort((a, b) => a.time.localeCompare(b.time));
        const markers = [...new Map(dayLessons.flatMap(lessonMarkers).map(marker => [marker[0], marker])).values()];
        return {
          raw,
          date: ds,
          num: raw.getDate(),
          inMonth: raw.getMonth() === m,
          isToday: ds === today,
          isSelected: ds === selDate,
          lessons: dayLessons,
          markers
        };
      });
      const selDayLessons = [...(lessonsByDate.get(selDate) || [])].sort((a, b) => a.time.localeCompare(b.time));
      const monthTitle = calMonth.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
      }).toUpperCase();
      const selectedTitle = selDateObj.toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).toUpperCase();
      const changeMonth = delta => {
        const next = new Date(y, m + delta, 1);
        const selectedDay = Math.min(selDateObj.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate());
        setCalMonth(next);
        setSelDate(localDateString(new Date(next.getFullYear(), next.getMonth(), selectedDay)));
      };
      const selectDay = day => {
        setSelDate(day.date);
        if (!day.inMonth) setCalMonth(new Date(day.raw.getFullYear(), day.raw.getMonth(), 1));
      };
      return _jsxs("div", {
        className: "month-calendar-shell",
        children: [_jsxs("div", {
          className: "month-toolbar",
          children: [_jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => changeMonth(-1),
            children: _jsx(IcoChevL, {
              size: 16
            })
          }), _jsx("div", {
            className: "month-title",
            children: monthTitle
          }), _jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => changeMonth(1),
            children: _jsx(IcoChevR, {
              size: 16
            })
          })]
        }), _jsx("div", {
          className: "month-weekdays",
          children: DAY_LABELS.map(d => _jsx("div", {
            children: d
          }, d))
        }), _jsx("div", {
          className: "month-grid",
          children: calendarDays.map(day => {
            const planned = day.lessons.filter(l => l.status === 'planned').length;
            const visibleLessons = day.lessons.slice(0, 3);
            return _jsxs("div", {
              className: ["month-day", !day.inMonth && "other", day.isToday && "today", day.isSelected && "selected", day.lessons.length && "busy"].filter(Boolean).join(' '),
              onClick: () => selectDay(day),
              children: [_jsxs("div", {
                className: "month-day-head",
                children: [_jsx("strong", {
                  children: day.num
                }), day.lessons.length > 0 && _jsx("span", {
                  className: planned ? "planned" : "final",
                  children: day.lessons.length
                })]
              }), visibleLessons.length ? _jsx("div", {
                className: "month-day-lessons",
                children: visibleLessons.map(l => {
                  return _jsxs("div", {
                    className: `month-lesson-chip ${l.type === 'group' ? 'group' : 'individual'} ${isFinalLesson(l) ? 'final' : ''}`,
                    style: {
                      '--month-accent': lessonAccent(l)
                    },
                    children: [_jsx("span", {
                      className: "month-lesson-time",
                      children: l.time
                    }), _jsx("b", {
                      className: "month-lesson-title",
                      children: monthCellName(l)
                    }), _jsx("b", {
                      className: "month-lesson-title-short",
                      children: monthCellShortName(l)
                    })]
                  }, l.id);
                })
              }) : _jsx("div", {
                className: "month-day-empty",
                children: day.inMonth ? "свободно" : ""
              }), day.lessons.length > visibleLessons.length && _jsxs("div", {
                className: "month-day-more",
                children: ["+", day.lessons.length - visibleLessons.length]
              })]
            }, day.date);
          })
        }), _jsxs("section", {
          className: "month-selected-panel",
          children: [_jsxs("div", {
            className: "month-selected-header",
            children: [_jsxs("div", {
              children: [_jsx("span", {
                children: "Выбранный день"
              }), _jsx("strong", {
                children: selectedTitle
              })]
            }), _jsx("button", {
              type: "button",
              className: "month-add-btn",
              onClick: () => setModal({
                type: 'lesson',
                payload: {
                  date: selDate
                }
              }),
              children: "+ \u0423\u0420\u041E\u041A"
            })]
          }), selDayLessons.length === 0 ? _jsx("div", {
            className: "month-empty",
            children: "\u041D\u0435\u0442 \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u2014 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 + \u0447\u0442\u043E\u0431\u044B \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C"
          }) : selDayLessons.map(l => {
            const statusInfo = LESSON_STATUS[l.status] || LESSON_STATUS.planned;
            const markers = lessonMarkers(l);
            return _jsxs("article", {
              className: `month-agenda-row ${isFinalLesson(l) ? 'final' : ''}`,
              children: [_jsx("div", {
              className: "month-agenda-time",
              children: l.time
            }), _jsxs("div", {
              className: "month-agenda-main",
              children: [_jsx("div", {
                className: "month-agenda-name",
                children: getLessonName(l)
              }), _jsxs("div", {
                className: "month-agenda-meta",
                children: [_jsx("span", {
                  children: l.type === 'group' ? 'Группа' : 'Инд'
                }), _jsx("span", {
                  style: {
                    '--month-accent': lessonAccent(l)
                  },
                  children: statusInfo.label
                }), _jsx("span", {
                  children: getLessonSubject(l, groups)
                }), markers.length > 0 && _jsx("em", {
                  children: markers.slice(0, 5).map(([kind, title]) => _jsx("i", {
                    className: `week-dot ${kind}`,
                    title: title
                  }, kind))
                })]
              })]
            }), _jsxs("div", {
              className: "month-agenda-actions",
              children: [l.status === 'planned' ? _jsx("button", {
              type: "button",
              className: "month-agenda-action main",
              title: "Провести",
              onClick: () => setModal({
                type: 'attendance',
                payload: l
              }),
              children: _jsx(IcoPlay, {
                size: 13
              })
            }) : l.status === 'completed' ? _jsx("button", {
              type: "button",
              className: "month-agenda-action",
              title: "Изменить посещение",
              onClick: () => setModal({
                type: 'attendance',
                payload: l
              }),
              children: _jsx(IcoCheck, {
                size: 13
              })
            }) : _jsx("button", {
              type: "button",
              className: "month-agenda-action",
              title: "Статус",
              onClick: () => setModal({
                type: 'lessonStatus',
                payload: l
              }),
              children: _jsx(IcoRepeat, {
                size: 14
              })
            }), _jsx("button", {
              type: "button",
              className: "month-agenda-action",
              title: "Перенести",
              onClick: () => setModal({
                type: 'reschedule',
                payload: {
                  lesson: l
                }
              }),
              children: _jsx(IcoRepeat, {
                size: 15
              })
            }), _jsx("button", {
              type: "button",
              className: "month-agenda-action",
              title: "Изменить",
              onClick: () => setModal({
                type: 'lesson',
                payload: {
                  lesson: l
                }
              }),
              children: _jsx(IcoEdit, {
                size: 15
              })
            }), _jsx("button", {
              type: "button",
              className: "month-agenda-action danger",
              title: "Удалить",
              onClick: e => requestDeleteLesson(l, e),
              children: _jsx(IcoTrash, {
                size: 15
              })
            })]
            })]
            }, l.id);
          })]
        })]
      });
    };
    return _jsxs("div", {
      className: "schedule-page",
      children: [_jsxs("div", {
        className: "schedule-toolbar",
        children: [_jsx("div", {
          className: "schedule-toolbar-title",
          children: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435"
        }), _jsxs("div", {
          className: "schedule-toolbar-actions",
          children: [_jsx("button", {
            className: "btn btn-sm btn-white schedule-print-btn",
            title: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 PDF",
            onClick: () => setModal({
              type: 'schedExport'
            }),
            children: _jsx(IcoPrint, {
              size: 15
            })
          }), _jsxs("div", {
            className: "toggle-row schedule-view-toggle",
            children: [_jsx("button", {
              className: `toggle-opt schedule-view-toggle-option ${schedView === 'week' ? 'active' : ''}`,
              onClick: () => setSchedView('week'),
              children: "\u041D\u0435\u0434\u0435\u043B\u044F"
            }), _jsx("button", {
              className: `toggle-opt schedule-view-toggle-option ${schedView === 'month' ? 'active' : ''}`,
              onClick: () => setSchedView('month'),
              children: "\u041C\u0435\u0441\u044F\u0446"
            })]
          })]
        })]
      }), students.length === 0 && lessons.length === 0 && _jsx(EmptyState, {
        title: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E\u0435",
        text: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0430 \u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u0443\u0440\u043E\u043A. \u041F\u043E\u0441\u043B\u0435 \u044D\u0442\u043E\u0433\u043E \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043D\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C.",
        action: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0430",
        onAction: () => setModal({
          type: 'student',
          payload: null
        }),
        secondary: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0435\u043C\u043E-\u0433\u0440\u0443\u043F\u043F\u0443",
        onSecondary: () => loadDemoData(groups.length || txs.length ? true : false)
      }), (() => {
        const getWeekDatesForFilter = offset => {
          const today = new Date();
          const dow = today.getDay() || 7;
          const mon = new Date(today);
          mon.setDate(today.getDate() - dow + 1 + offset * 7);
          return Array.from({
            length: 7
          }, (_, i) => {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            return localDateString(d);
          });
        };
        const wDates = schedView === 'week' ? getWeekDatesForFilter(weekOffset) : null;
        const weekLessonsAll = wDates ? lessons.filter(l => wDates.includes(l.date)) : lessons;
        const weekSubjects = [...new Set(weekLessonsAll.map(l => getLessonSubject(l, groups)))].filter(s => SUBJECTS.includes(s));
        return _jsxs("div", {
          className: "day-strip",
          style: {
            marginBottom: 14
          },
          children: [_jsx("button", {
            className: `day-btn ${schedSubject === 'all' ? 'active' : ''}`,
            onClick: () => setSchedSubject('all'),
            style: {
              minWidth: 82
            },
            children: _jsx("span", {
              className: "day-btn-name",
              children: "\u0412\u0441\u0435"
            })
          }), weekSubjects.map(subject => _jsx("button", {
            className: `day-btn ${schedSubject === subject ? 'active' : ''}`,
            onClick: () => setSchedSubject(subject),
            style: {
              minWidth: 96
            },
            children: _jsx("span", {
              className: "day-btn-name",
              children: subject
            })
          }, subject))]
        });
      })(), schedView === 'week' ? _jsx(WeekView, {}) : _jsx(MonthView, {})]
    });
  };

  // STUDENTS PAGE
  const PageStudents = () => {
    const view = studentsView;
    const setView = setStudentsView;
    const q = studentsQ;
    const setQ = setStudentsQ;
    const debtOnly = studentsDebtOnly;
    const setDebtOnly = setStudentsDebtOnly;
    const showArchived = studentsShowArchived;
    const setShowArchived = setStudentsShowArchived;
    const subjectFilter = studentsSubjectFilter;
    const setSubjectFilter = setStudentsSubjectFilter;
    const availableSubjects = SUBJECTS.filter(subject => view === 'students' ? students.some(s => (!s.archived || showArchived) && (s.subjects || []).includes(subject)) : groups.some(g => g.subject === subject));
    const filtered = students.filter(s => {
      if (!showArchived && s.archived) return false;
      if (debtOnly && s.balance >= 0) return false;
      if (subjectFilter !== 'all' && !(s.subjects || []).includes(subjectFilter)) return false;
      return s.name.toLowerCase().includes(q.toLowerCase());
    });
    const filteredGroups = groups.filter(g => {
      if (subjectFilter !== 'all' && g.subject !== subjectFilter) return false;
      return getGroupDisplayName(g, students).toLowerCase().includes(q.toLowerCase());
    });
    return _jsxs("div", {
      className: "students-page",
      children: [_jsxs("div", {
        className: "page-title",
        children: [view === 'students' ? 'Ученики' : 'Группы', _jsx("button", {
          className: "btn btn-sm btn-black",
          onClick: () => setModal({
            type: view === 'students' ? 'student' : 'group',
            payload: null
          }),
          children: _jsx(IcoPlus, {
            size: 14
          })
        })]
      }), _jsxs("div", {
        className: "toggle-row",
        children: [_jsx("button", {
          className: `toggle-opt ${view === 'students' ? 'active' : ''}`,
          onClick: () => setView('students'),
          children: "\u0423\u0447\u0435\u043D\u0438\u043A\u0438"
        }), _jsx("button", {
          className: `toggle-opt ${view === 'groups' ? 'active' : ''}`,
          onClick: () => setView('groups'),
          children: "\u0413\u0440\u0443\u043F\u043F\u044B"
        })]
      }), _jsxs("div", {
        style: {
          position: 'relative',
          marginBottom: 10
        },
        children: _jsx("input", {
          className: "input",
          placeholder: "\u041F\u043E\u0438\u0441\u043A...",
          value: q,
          onChange: e => setQ(e.target.value)
        })
      }), _jsxs("div", {
        className: "day-strip",
        style: {
          marginBottom: 12
        },
        children: [_jsx("button", {
          className: `day-btn ${subjectFilter === 'all' ? 'active' : ''}`,
          onClick: () => setSubjectFilter('all'),
          style: {
            minWidth: 82
          },
          children: _jsx("span", {
            className: "day-btn-name",
            children: "\u0412\u0441\u0435"
          })
        }), availableSubjects.map(subject => _jsx("button", {
          className: `day-btn ${subjectFilter === subject ? 'active' : ''}`,
          onClick: () => setSubjectFilter(subject),
          style: {
            minWidth: 96
          },
          children: _jsx("span", {
            className: "day-btn-name",
            children: subject
          })
        }, subject))]
      }), view === 'students' ? _jsxs(_Fragment, {
        children: [filtered.map(s => _jsxs("div", {
          className: "student-item",
          onClick: () => setModal({
            type: 'studentDetail',
            payload: s
          }),
          style: {
            cursor: 'pointer',
            opacity: s.archived ? .55 : 1
          },
          children: [_jsxs("div", {
            style: {
              flex: 1,
              minWidth: 0
            },
            children: [_jsx("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontWeight: 900,
                fontSize: 13,
                marginBottom: 4
              },
              children: s.name
            }), _jsxs("div", {
              style: {
                fontSize: 11,
                color: 'var(--text-sec)'
              },
              children: [money(s.rate), "/\u0443\u0440\u043E\u043A \xB7 ", s.phone]
            }), _jsx("div", {
              style: {
                display: 'flex',
                gap: 5,
                flexWrap: 'wrap',
                marginTop: 5
              },
              children: (s.subjects || ['История']).map(subject => _jsx("span", {
                className: "lesson-tag",
                style: {
                  background: subjectColor(subject),
                  color: subjectTagText(subject)
                },
                children: subject
              }, subject))
            }), _jsxs("div", {
              style: {
                marginTop: 6
              },
              children: [s.balance < 0 ? _jsxs("button", {
                type: "button",
                className: "badge badge-red debt-message-trigger",
                title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u043E \u0434\u043E\u043B\u0433\u0435",
                onClick: e => {
                  e.stopPropagation();
                  setModal({
                    type: 'message',
                    payload: {
                      student: s,
                      mode: 'debt'
                    }
                  });
                },
                children: [s.balance > 0 ? '+' : '', money(s.balance)]
              }) : _jsxs("span", {
                className: `badge ${s.balance < 0 ? 'badge-red' : s.balance > 0 ? 'badge-green' : 'badge-yellow'}`,
                children: [s.balance > 0 ? '+' : '', money(s.balance)]
              }), (s.packageLessons || 0) > 0 && _jsxs("span", {
                className: "badge badge-green",
                style: {
                  marginLeft: 6
                },
                children: [s.packageLessons, " \u0437\u0430\u043D."]
              }), s.archived && _jsx("span", {
                className: "badge badge-yellow",
                style: {
                  marginLeft: 6
                },
                children: "\u0410\u0420\u0425\u0418\u0412"
              })]
            })]
          }), _jsxs("div", {
            style: {
              display: 'flex',
              gap: 6,
              marginLeft: 8,
              alignItems: 'center'
            },
            children: [s.phone && _jsx("a", {
              href: `tel:${s.phone}`,
              title: s.phone,
              className: "btn btn-sm btn-white",
              style: {
                padding: '4px 7px',
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit'
              },
              onClick: e => e.stopPropagation(),
              children: _jsx(IcoPhone, {
                size: 14
              })
            }), _jsxs("button", {
              title: s.tgId ? 'Открыть в Telegram' : 'Написать',
              className: `btn btn-sm ${s.tgId ? 'btn-blue' : 'btn-white'}`,
              style: {
                padding: '4px 8px',
                fontSize: 9,
                gap: 4
              },
              onClick: e => {
                e.stopPropagation();
                if (s.tgId) {
                  const id = String(s.tgId).trim();
                  window.open(id.startsWith('@') ? `https://t.me/${id.slice(1)}` : `https://t.me/${id}`, '_blank');
                } else {
                  setModal({
                    type: 'message',
                    payload: {
                      student: s
                    }
                  });
                }
              },
              children: [s.tgId ? _jsx(IcoTg, {
                size: 12
              }) : null, "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C"]
            }), _jsx("button", {
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6
              },
              onClick: e => {
                e.stopPropagation();
                setModal({
                  type: 'student',
                  payload: s
                });
              },
              children: _jsx(IcoEdit, {
                size: 18
              })
            }), _jsx("button", {
              style: {
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6
              },
              onClick: e => {
                e.stopPropagation();
                delStudent(s.id);
              },
              children: _jsx(IcoTrash, {
                size: 18
              })
            })]
          })]
        }, s.id)), filtered.length === 0 && _jsx(EmptyState, {
          title: students.length ? 'Ничего не найдено' : 'Добавьте первого ученика',
          text: students.length ? 'Измените фильтр или строку поиска.' : 'Карточка ученика хранит ставку, предметы, долги, ДЗ и историю занятий.',
          action: "\u041D\u043E\u0432\u044B\u0439 \u0443\u0447\u0435\u043D\u0438\u043A",
        onAction: () => setModal({
          type: 'student',
          payload: null
        }),
        secondary: students.length ? null : "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0435\u043C\u043E-\u0433\u0440\u0443\u043F\u043F\u0443",
        onSecondary: students.length ? null : () => loadDemoData(groups.length || lessons.length || txs.length ? true : false)
      })]
      }) : _jsxs(_Fragment, {
        children: [filteredGroups.map(g => {
          const memberNames = g.studentIds.map(id => students.find(s => sameId(s.id, id))?.name).filter(Boolean);
          const futureCount = lessons.filter(l => l.type === 'group' && sameId(l.targetId, g.id) && l.status === 'planned').length;
          return _jsxs("div", {
            className: "student-item",
            style: {
              opacity: g.archived ? .6 : 1,
              cursor: 'pointer'
            },
            onClick: () => setModal({
              type: 'groupDetail',
              payload: g
            }),
            children: [_jsxs("div", {
              style: {
                flex: 1,
                minWidth: 0
              },
              children: [_jsxs("div", {
                style: {
                  fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                  fontWeight: 900,
                  fontSize: 13,
                  marginBottom: 4
                },
                children: [g.emoji && _jsx("span", {
                  style: {
                    marginRight: 6,
                    fontSize: 16
                  },
                  children: g.emoji
                }), getGroupDisplayName(g, students), " ", g.archived && _jsx("span", {
                  className: "badge badge-yellow",
                  children: "\u0410\u0420\u0425\u0418\u0412"
                })]
              }), _jsx("span", {
                className: "lesson-tag",
                style: {
                  background: subjectColor(g.subject),
                  color: subjectTagText(g.subject)
                },
                children: g.subject || 'История'
              }), _jsx("div", {
                style: {
                  fontSize: 11,
                  color: '#666',
                  lineHeight: 1.5
                },
                children: memberNames.join(', ') || 'Нет учеников'
              }), _jsxs("div", {
                style: {
                  fontSize: 10,
                  color: '#666',
                  marginTop: 4
                },
                children: ["\u0411\u0443\u0434\u0443\u0449\u0438\u0445 \u0443\u0440\u043E\u043A\u043E\u0432: ", futureCount]
              })]
            }), _jsxs("div", {
              style: {
                display: 'flex',
                gap: 8,
                marginLeft: 8
              },
              children: [_jsx("button", {
                style: {
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6
                },
                onClick: e => {
                  e.stopPropagation();
                  setModal({
                    type: 'group',
                    payload: g
                  });
                },
                children: _jsx(IcoEdit, {
                  size: 18
                })
              }), _jsx("button", {
                style: {
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 6
                },
                onClick: e => {
                  e.stopPropagation();
                  delGroup(g.id);
                },
                children: _jsx(IcoTrash, {
                  size: 18
                })
              })]
            })]
          }, g.id);
        }), filteredGroups.length === 0 && _jsx(EmptyState, {
          title: groups.length ? 'Группы не найдены' : 'Групп пока нет',
          text: groups.length ? 'Попробуйте другой поиск или предмет.' : 'Группы удобны для мини-классов: укажите учеников, предмет и разные ставки.',
          action: "\u041D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430",
        onAction: () => setModal({
          type: 'group',
          payload: null
        }),
        secondary: groups.length ? null : "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0435\u043C\u043E-\u0433\u0440\u0443\u043F\u043F\u0443",
        onSecondary: groups.length ? null : () => loadDemoData(students.length || lessons.length || txs.length ? true : false)
      })]
      })]
    });
  };

  // FINANCE PAGE (with full analytics, deduplication-safe)
  const PageFinance = () => {
    const [finTab, setFinTab] = useState('control'); // 'control' | 'analytics' | 'trust'
    const [analyticsPeriod, setAnalyticsPeriod] = useState('current_month');
    const [txStudentFilter, setTxStudentFilter] = useState('all');
    const [txTypeFilter, setTxTypeFilter] = useState('all');
    const [historyExpanded, setHistoryExpanded] = useState(false);
    const [customFrom, setCustomFrom] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [customTo, setCustomTo] = useState(getTodayDate);
    const activeStudents = students.filter(s => !s.archived);
    const debt = activeStudents.filter(s => s.balance < 0).reduce((s, st) => s + Math.abs(st.balance), 0);
    const prepaid = activeStudents.filter(s => s.balance > 0).reduce((s, st) => s + st.balance, 0);
    const debtors = activeStudents.filter(s => s.balance < 0).sort((a, b) => a.balance - b.balance);
    const lowPackages = students.filter(s => !s.archived && (s.packageLessons || 0) > 0 && (s.packageLessons || 0) <= 1);
    const balanceSummaries = activeStudents.map(s => ({
      student: s,
      finance: getStudentFinanceSummary(s, txs, lessons, groups)
    }));
    const recentMoneyEvents = txs.slice().sort((a, b) => txSortKey(b).localeCompare(txSortKey(a))).slice(0, 5);
    const upcomingCharges = activeStudents.map(s => ({
      student: s,
      finance: getStudentFinanceSummary(s, txs, lessons, groups)
    })).filter(x => x.finance.nextLesson).sort((a, b) => (a.finance.nextLesson.date + a.finance.nextLesson.time).localeCompare(b.finance.nextLesson.date + b.finance.nextLesson.time)).slice(0, 4);
    const historyTxs = txs.filter(tx => {
      if (txStudentFilter !== 'all' && !sameId(tx.studentId, txStudentFilter)) return false;
      if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false;
      return true;
    });
    const historyLimit = historyExpanded ? historyTxs.length : 12;
    const hiddenHistoryCount = Math.max(0, historyTxs.length - historyLimit);

    // Safe quick-pay: only pays the exact outstanding debt (not arbitrary amount)
    const quickPay = studentId => {
      const snapS = [...students],
        snapT = [...txs];
      const nextState = financeCore.quickDebtPaymentState({
        students,
        txs,
        studentId,
        date: getTodayDate(),
        comment: 'Быстрая оплата долга',
        createId: Date.now
      });
      if (!nextState.tx) return;
      setStudents(nextState.students);
      setTxs(nextState.txs);
      triggerUndo('Оплата добавлена', lessons, snapS, snapT, undefined, 3000);
    };

    // ── ANALYTICS ───────────────────────────────────────────────────────────
    const getPeriodBounds = p => {
      const now = new Date();
      const y = now.getFullYear(),
        m = now.getMonth();
      if (p === 'current_month') return {
        start: new Date(y, m, 1),
        end: new Date(y, m + 1, 0, 23, 59, 59)
      };
      if (p === 'last_month') return {
        start: new Date(y, m - 1, 1),
        end: new Date(y, m, 0, 23, 59, 59)
      };
      if (p === 'next_month') return {
        start: new Date(y, m + 1, 1),
        end: new Date(y, m + 2, 0, 23, 59, 59)
      };
      if (p === 'custom') return {
        start: new Date(customFrom + 'T00:00:00'),
        end: new Date(customTo + 'T23:59:59')
      };
      return {
        start: new Date(2000, 0, 1),
        end: new Date(2100, 0, 1)
      };
    };
    const bounds = getPeriodBounds(analyticsPeriod);
    const inBounds = ds => {
      const d = new Date(ds + 'T00:00:00');
      return d >= bounds.start && d <= bounds.end;
    };
    const periodOptions = [['last_month', 'Прошлый мес.'], ['current_month', 'Этот месяц'], ['next_month', 'Следующий'], ['all_time', 'Всё время']];
    const FinancePeriodPicker = () => _jsxs("div", {
      className: "finance-period-panel",
      children: [_jsx("div", {
        className: "finance-period-label",
        children: "\u041F\u0435\u0440\u0438\u043E\u0434 \u0440\u0430\u0441\u0447\u0435\u0442\u0430"
      }), _jsxs("div", {
        className: "finance-period-grid",
        children: [periodOptions.map(([v, l]) => _jsx("button", {
          type: "button",
          className: `finance-period-btn ${analyticsPeriod === v ? 'active' : ''}`,
          onClick: () => setAnalyticsPeriod(v),
          children: l
        }, v)), _jsx("button", {
          type: "button",
          className: `finance-period-btn custom ${analyticsPeriod === 'custom' ? 'active' : ''}`,
          onClick: () => setAnalyticsPeriod('custom'),
          children: "\u0421\u0432\u043E\u0439 \u043F\u0435\u0440\u0438\u043E\u0434"
        })]
      }), analyticsPeriod === 'custom' && _jsxs("div", {
        className: "finance-period-custom",
        children: [_jsxs("label", {
          children: [_jsx("span", {
            children: "\u0421"
          }), _jsx("input", {
            className: "input",
            type: "date",
            value: customFrom,
            onChange: e => setCustomFrom(e.target.value)
          })]
        }), _jsxs("label", {
          children: [_jsx("span", {
            children: "\u041F\u043E"
          }), _jsx("input", {
            className: "input",
            type: "date",
            value: customTo,
            onChange: e => setCustomTo(e.target.value)
          })]
        })]
      })]
    });

    // All completed lessons
    const completedLessons = lessons.filter(l => l.status === 'completed' || l.status === 'no_show');
    const periodLessons = lessons.filter(l => inBounds(l.date));
    const periodCompleted = periodLessons.filter(l => l.status === 'completed' || l.status === 'no_show');
    const periodPlanned = periodLessons.filter(l => l.status === 'planned');

    // Compute per-student stats across ALL time (for skip rate)
    const studentStats = useMemo(() => {
      const stats = {};
      students.forEach(s => {
        stats[s.id] = {
          scheduled: 0,
          attended: 0,
          skipped: 0,
          earned: 0,
          lost: 0
        };
      });
      completedLessons.forEach(lesson => {
        const ls = getLessonStudents(lesson, students, groups, {
          includeArchived: true
        });
        ls.forEach(s => {
          if (!stats[s.id]) return;
          const rate = getLessonRate(lesson, s, groups);
          const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
          stats[s.id].scheduled++;
          if (present) {
            stats[s.id].attended++;
            stats[s.id].earned += rate;
          } else {
            stats[s.id].skipped++;
            stats[s.id].lost += rate;
          }
        });
      });
      return stats;
    }, [completedLessons, students, groups]);

    // Average skip rate across all students (weighted by scheduled lessons)
    const totalScheduled = Object.values(studentStats).reduce((s, v) => s + v.scheduled, 0);
    const totalSkipped = Object.values(studentStats).reduce((s, v) => s + v.skipped, 0);
    const avgSkipRate = totalScheduled > 0 ? totalSkipped / totalScheduled : 0;

    // Period income (actual from txs)
    const periodTxs = txs.filter(tx => inBounds(tx.date));
    const actualPayments = periodTxs.filter(tx => tx.type === 'payment' && tx.kind !== 'attendance').reduce((s, t) => s + t.amount, 0);
    const actualCharges = periodTxs.filter(tx => tx.type === 'charge').reduce((s, t) => s + t.amount, 0);

    // Period earned from completed lessons (gross)
    let periodEarned = 0,
      periodLost = 0;
    periodCompleted.forEach(lesson => {
      const ls = getLessonStudents(lesson, students, groups, {
        includeArchived: true
      });
      ls.forEach(s => {
        const rate = getLessonRate(lesson, s, groups);
        const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
        if (present) periodEarned += rate;else periodLost += rate;
      });
    });

    // Projected income for planned lessons in period
    let projIdeal = 0,
      projRealistic = 0;
    periodPlanned.forEach(lesson => {
      const ls = getLessonStudents(lesson, students, groups);
      ls.forEach(s => {
        const rate = getLessonRate(lesson, s, groups);
        projIdeal += rate;
        projRealistic += rate * (1 - avgSkipRate);
      });
    });
    const totalIdeal = periodEarned + projIdeal;
    const totalRealistic = periodEarned + projRealistic;

    // Per-student table for period
    const studentPeriodStats = useMemo(() => {
      const st = {};
      students.forEach(s => {
        st[s.id] = {
          earned: 0,
          lost: 0,
          scheduled: 0,
          attended: 0
        };
      });
      periodCompleted.forEach(lesson => {
        const ls = getLessonStudents(lesson, students, groups, {
          includeArchived: true
        });
        ls.forEach(s => {
          if (!st[s.id]) return;
          const rate = getLessonRate(lesson, s, groups);
          const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
          st[s.id].scheduled++;
          if (present) {
            st[s.id].attended++;
            st[s.id].earned += rate;
          } else {
            st[s.id].lost += rate;
          }
        });
      });
      return st;
    }, [periodCompleted, students, groups]);
    const studentRows = students.map(s => ({
      ...s,
      ...studentPeriodStats[s.id]
    })).filter(s => s.scheduled > 0).sort((a, b) => b.earned - a.earned);
    const todayMs = new Date(getTodayDate() + 'T00:00:00').getTime();
    const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const daysBetween = date => Math.max(0, Math.floor((todayMs - new Date(date + 'T00:00:00').getTime()) / 86400000));
    const lessonFinanceRows = lesson => getLessonStudents(lesson, students, groups).map(student => ({
      student,
      rate: getLessonRate(lesson, student, groups),
      present: lesson.status !== 'no_show' && lesson.attendance?.[student.id] !== false
    }));
    const plannedSeats = periodPlanned.reduce((sum, lesson) => sum + lessonFinanceRows(lesson).length, 0);
    const rateSamples = periodLessons.flatMap(lesson => lessonFinanceRows(lesson).map(row => row.rate));
    const averageSeatRate = rateSamples.length ? Math.round(rateSamples.reduce((sum, rate) => sum + rate, 0) / rateSamples.length) : 0;
    const periodGoal = totalRealistic <= 100000 ? 100000 : Math.ceil(totalRealistic / 50000) * 50000;
    const goalGap = Math.max(0, Math.round(periodGoal - totalRealistic));
    const lessonsToGoal = averageSeatRate ? Math.ceil(goalGap / averageSeatRate) : 0;
    const priceStep = 200;
    const priceStepEffect = plannedSeats * priceStep;
    const oldDebt = balanceSummaries.filter(x => x.finance.balance < 0 && x.finance.lastCharge && daysBetween(x.finance.lastCharge.date) >= 14).reduce((sum, x) => sum + Math.abs(x.finance.balance), 0);
    const debtAgeRows = balanceSummaries.filter(x => x.finance.balance < 0).map(x => {
      const age = x.finance.lastCharge ? daysBetween(x.finance.lastCharge.date) : 0;
      return {
        student: x.student,
        debt: Math.abs(x.finance.balance),
        age,
        bucket: age >= 15 ? '15+ дней' : age >= 8 ? '8-14 дней' : '1-7 дней'
      };
    }).sort((a, b) => b.age - a.age || b.debt - a.debt);
    const debtBuckets = ['1-7 дней', '8-14 дней', '15+ дней'].map(label => ({
      label,
      amount: debtAgeRows.filter(row => row.bucket === label).reduce((sum, row) => sum + row.debt, 0),
      count: debtAgeRows.filter(row => row.bucket === label).length
    }));
    const channelStats = {
      group: {
        earned: 0,
        seats: 0,
        lessons: 0
      },
      individual: {
        earned: 0,
        seats: 0,
        lessons: 0
      }
    };
    periodCompleted.forEach(lesson => {
      const type = lesson.type === 'group' ? 'group' : 'individual';
      channelStats[type].lessons += 1;
      lessonFinanceRows(lesson).forEach(row => {
        if (row.present) {
          channelStats[type].earned += row.rate;
          channelStats[type].seats += 1;
        }
      });
    });
    const channelRows = [{
      key: 'group',
      label: 'Группы',
      ...channelStats.group
    }, {
      key: 'individual',
      label: 'Индивидуальные',
      ...channelStats.individual
    }].map(row => ({
      ...row,
      avgSeat: row.seats ? Math.round(row.earned / row.seats) : 0,
      avgLesson: row.lessons ? Math.round(row.earned / row.lessons) : 0
    }));
    const dayEconomics = dayLabels.map((label, idx) => ({
      label,
      earned: 0,
      planned: 0,
      lessons: 0
    }));
    periodLessons.forEach(lesson => {
      const idx = (new Date(lesson.date + 'T00:00:00').getDay() + 6) % 7;
      const row = dayEconomics[idx];
      row.lessons += 1;
      lessonFinanceRows(lesson).forEach(fin => {
        if (lesson.status === 'planned') row.planned += fin.rate;
        if (isFinalLesson(lesson) && fin.present) row.earned += fin.rate;
      });
    });
    const maxDayMoney = Math.max(...dayEconomics.map(row => row.earned + row.planned), 1);
    const riskRows = activeStudents.map(s => {
      const stat = studentStats[s.id] || {
        scheduled: 0,
        skipped: 0
      };
      const skipRate = stat.scheduled > 0 ? stat.skipped / stat.scheduled : 0;
      const reasons = [];
      let score = 0;
      if (s.balance < 0) {
        reasons.push(`долг ${money(Math.abs(s.balance))}`);
        score += 3;
      }
      if (skipRate >= 0.2) {
        reasons.push(`пропуски ${Math.round(skipRate * 100)}%`);
        score += 2;
      } else if (skipRate >= 0.1) {
        reasons.push(`пропуски ${Math.round(skipRate * 100)}%`);
        score += 1;
      }
      if ((s.packageLessons || 0) > 0 && (s.packageLessons || 0) <= 1) {
        reasons.push('абонемент на исходе');
        score += 1;
      }
      return {
        student: s,
        score,
        reasons
      };
    }).filter(row => row.score > 0).sort((a, b) => b.score - a.score || Math.abs(b.student.balance) - Math.abs(a.student.balance)).slice(0, 5);
    const cashGap = Math.max(0, periodEarned - actualPayments);
    const paymentCoverage = periodEarned > 0 ? Math.min(1, actualPayments / periodEarned) : 1;
    const paymentCoverageLabel = `${Math.round(paymentCoverage * 100)}%`;
    const revenueRows = studentRows.filter(s => s.earned > 0).sort((a, b) => b.earned - a.earned);
    const topRevenueRows = revenueRows.slice(0, 3);
    const topRevenue = topRevenueRows.reduce((sum, row) => sum + row.earned, 0);
    const topRevenueShare = periodEarned > 0 ? topRevenue / periodEarned : 0;
    const topRevenueLabel = `${Math.round(topRevenueShare * 100)}%`;
    const dependencyTone = topRevenueShare >= 0.55 ? 'hot' : topRevenueShare >= 0.38 ? 'warn' : 'good';
    const dependencyText = periodEarned === 0 ? 'данных за период пока нет' : topRevenueShare >= 0.55 ? 'выручка слишком зависит от нескольких учеников' : topRevenueShare >= 0.38 ? 'зависимость умеренная, стоит растить длинный хвост' : 'выручка распределена достаточно ровно';
    const cashText = periodEarned === 0 ? 'нет заработка за период' : cashGap > 0 ? `в кассу не дошло ${money(cashGap)}` : 'оплаты закрывают заработанное';
    const periodLessonTimes = periodLessons.map(lesson => new Date(lesson.date + 'T00:00:00').getTime());
    const periodStartMs = analyticsPeriod === 'all_time' && periodLessonTimes.length ? Math.min(...periodLessonTimes) : bounds.start.getTime();
    const periodEndMs = analyticsPeriod === 'all_time' && periodLessonTimes.length ? Math.max(...periodLessonTimes) : bounds.end.getTime();
    const periodTodayMs = Math.min(Math.max(todayMs, periodStartMs), periodEndMs);
    const elapsedPeriodDays = Math.max(1, Math.floor((periodTodayMs - periodStartMs) / 86400000) + 1);
    const totalPeriodDays = Math.max(elapsedPeriodDays, Math.floor((periodEndMs - periodStartMs) / 86400000) + 1);
    const paceForecast = Math.round(periodEarned / elapsedPeriodDays * totalPeriodDays);
    const cautiousFuture = Math.round(projIdeal * Math.max(0, 1 - Math.min(avgSkipRate + 0.12, 0.45)));
    const cautiousForecast = periodEarned + cautiousFuture;
    const realisticForecast = Math.round(totalRealistic);
    const idealForecast = Math.round(totalIdeal);
    const forecastMax = Math.max(periodGoal, cautiousForecast, realisticForecast, idealForecast, paceForecast, 1);
    const forecastRows = [{
      label: 'Осторожно',
      value: cautiousForecast,
      hint: 'с запасом на пропуски',
      tone: 'warn'
    }, {
      label: 'Реально',
      value: realisticForecast,
      hint: `пропуски ${Math.round(avgSkipRate * 100)}%`,
      tone: 'good'
    }, {
      label: 'Максимум',
      value: idealForecast,
      hint: 'если все придут',
      tone: 'info'
    }];
    const collectionRate = periodEarned > 0 ? Math.min(1, Math.max(0.35, actualPayments / periodEarned)) : 0.75;
    const expectedCash = Math.round(actualPayments + Math.max(0, periodEarned - actualPayments) * 0.65 + projRealistic * collectionRate);
    const expectedCashWithDebt = expectedCash + Math.round(debt * 0.7);
    const cashForecastText = debt > 0 ? `с возвратом 70% долгов: ${money(expectedCashWithDebt)}` : 'долгов почти нет, прогноз зависит от посещаемости';
    const weekKey = ds => {
      const d = new Date(ds + 'T00:00:00');
      const day = (d.getDay() + 6) % 7;
      d.setDate(d.getDate() - day);
      return localDateString(d);
    };
    const weekForecastMap = {};
    periodLessons.forEach(lesson => {
      const key = weekKey(lesson.date);
      if (!weekForecastMap[key]) {
        weekForecastMap[key] = {
          key,
          label: fmtDate(key),
          fact: 0,
          plan: 0
        };
      }
      lessonFinanceRows(lesson).forEach(row => {
        if (isFinalLesson(lesson) && row.present) weekForecastMap[key].fact += row.rate;
        if (lesson.status === 'planned') weekForecastMap[key].plan += row.rate * (1 - avgSkipRate);
      });
    });
    const weekForecastRows = Object.values(weekForecastMap).sort((a, b) => a.key.localeCompare(b.key)).slice(-8);
    const maxWeekForecast = Math.max(...weekForecastRows.map(row => row.fact + row.plan), 1);
    const recoverableLost = Math.round(periodLost * 0.5);
    const financeLevers = [{
      label: 'Собрать долги',
      value: debt,
      text: oldDebt > 0 ? `${money(oldDebt)} старше 14 дней` : `${debtors.length} должников`,
      tone: debt > 0 ? 'hot' : 'quiet'
    }, {
      label: '+200 ₽ к ставке',
      value: priceStepEffect,
      text: `${plannedSeats} будущих списаний`,
      tone: priceStepEffect > 0 ? 'info' : 'quiet'
    }, {
      label: 'Вернуть пропуски',
      value: recoverableLost,
      text: 'если отработать половину потерь',
      tone: recoverableLost > 0 ? 'warn' : 'quiet'
    }, {
      label: 'Добрать цель',
      value: goalGap,
      text: goalGap > 0 ? `${lessonsToGoal} ученико-уроков` : 'цель уже закрыта',
      tone: goalGap > 0 ? 'good' : 'quiet'
    }].sort((a, b) => b.value - a.value).slice(0, 3);
    const maxLeverValue = Math.max(...financeLevers.map(row => row.value), 1);
    const forecastMood = realisticForecast >= periodGoal ? 'План выглядит здоровым' : goalGap > 0 ? `до цели не хватает ${money(goalGap)}` : 'прогноз устойчивый';
    const insightCards = [{
      tone: debt > 0 ? 'hot' : 'good',
      label: 'Долги',
      value: money(debt),
      text: debt > 0 ? `${debtors.length} чел.; ${money(oldDebt)} старше 14 дней` : 'долгов нет, касса чистая'
    }, {
      tone: goalGap > 0 ? 'warn' : 'good',
      label: 'До цели',
      value: money(goalGap),
      text: goalGap > 0 ? `примерно ${lessonsToGoal} ученико-уроков по средней ставке` : 'период уже выше целевого уровня'
    }, {
      tone: priceStepEffect > 0 ? 'info' : 'quiet',
      label: '+200 ₽ к ставке',
      value: money(priceStepEffect),
      text: `${plannedSeats} будущих списаний в выбранном периоде`
    }, {
      tone: periodLost > 0 ? 'hot' : 'good',
      label: 'Пропуски',
      value: money(periodLost),
      text: periodLost > 0 ? `потеряно в выбранном периоде` : 'потерь за период нет'
    }];
    const Stat = ({
      label,
      value,
      color,
      sub
    }) => _jsxs("div", {
      className: `metric-card ${color ? 'accent' : ''}`,
      style: color ? {
        '--metric-bg': color
      } : {},
      children: [_jsx("div", {
        className: "metric-label",
        children: label
      }), _jsx("div", {
        className: "metric-value",
        children: value
      }), sub && _jsx("div", {
        className: "metric-sub",
        children: sub
      })]
    });
    const ControlTab = () => _jsxs("div", {
      children: [_jsxs("div", {
        className: "crm-dashboard",
        children: [_jsx(Stat, {
          label: "\u0414\u043E\u043B\u0433\u0438",
          value: `${debt.toLocaleString()} ₽`,
          color: "#dc4c4c",
          sub: `${debtors.length} чел.`
        }), _jsx(Stat, {
          label: "\u041F\u0440\u0435\u0434\u043E\u043F\u043B\u0430\u0442\u044B",
          value: `${prepaid.toLocaleString()} ₽`,
          color: "#2f9e68"
        }), _jsx(Stat, {
          label: "\u0424\u0430\u043A\u0442 \u043E\u043F\u043B\u0430\u0442",
          value: `${actualPayments.toLocaleString()} ₽`,
          sub: "\u0437\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434"
        }), _jsx(Stat, {
          label: "\u0421\u043F\u0438\u0441\u0430\u043D\u043E \u0443\u0440\u043E\u043A\u043E\u0432",
          value: `${actualCharges.toLocaleString()} ₽`,
          sub: "\u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F"
        }), _jsx(Stat, {
          label: "\u041F\u0440\u043E\u0433\u043D\u043E\u0437",
          value: `${Math.round(totalRealistic).toLocaleString()} ₽`,
          color: "#2f6fed",
          sub: "\u0440\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u043E"
        }), _jsx(Stat, {
          label: "\u041F\u043E\u0442\u0435\u0440\u0438",
          value: `${periodLost.toLocaleString()} ₽`,
          color: "#8a5a44",
          sub: "\u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0438"
        })]
      }), activeStudents.length > 0 && _jsxs("div", {
        className: "finance-control-grid",
        children: [_jsxs("div", {
          className: "finance-panel finance-trust-panel finance-control-trust-preview",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u0414\u043E\u0432\u0435\u0440\u0438\u0435 \u043A \u0431\u0430\u043B\u0430\u043D\u0441\u0430\u043C"
          }), _jsx("div", {
            className: "finance-trust-score",
            children: balanceSummaries.filter(x => x.finance.hasHistory || x.finance.balance !== 0).length
          }), _jsx("div", {
            className: "metric-sub",
            children: "\u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u0441 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u043A\u043E\u0439 \u0431\u0430\u043B\u0430\u043D\u0441\u0430"
          }), _jsx("div", {
            className: "finance-mini-list",
            children: balanceSummaries.filter(x => x.finance.balance !== 0).slice(0, 4).map(({
              student: s,
              finance
            }) => _jsxs("button", {
              className: "finance-mini-row",
              onClick: () => setModal({
                type: 'studentDetail',
                payload: s
              }),
              children: [_jsx("span", {
                children: s.name
              }), _jsx("strong", {
                style: {
                  color: balanceColor(finance.balance)
                },
                children: balanceLabel(finance.balance)
              })]
            }, s.id))
          })]
        }), _jsxs("div", {
          className: "finance-panel",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u041E\u0436\u0438\u0434\u0430\u0435\u043C\u044B\u0435 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F"
          }), upcomingCharges.length ? upcomingCharges.map(({
            student: s,
            finance
          }) => _jsxs("div", {
            className: "finance-mini-row static",
            children: [_jsxs("span", {
              children: [s.name, " \xB7 ", fmtDate(finance.nextLesson.date)]
            }), _jsx("strong", {
              children: money(finance.nextRate)
            })]
          }, s.id)) : _jsx("div", {
            className: "metric-sub",
            children: "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0445 \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0439 \u043D\u0435\u0442"
          })]
        })]
      }), students.length === 0 && txs.length === 0 && _jsx(EmptyState, {
        title: "\u0424\u0438\u043D\u0430\u043D\u0441\u044B \u043F\u043E\u044F\u0432\u044F\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0432\u044B\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439",
        text: "\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0430, \u043F\u0440\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0443\u0440\u043E\u043A \u0438\u043B\u0438 \u0432\u043D\u0435\u0441\u0438\u0442\u0435 \u043E\u043F\u043B\u0430\u0442\u0443. \u0414\u043E\u043B\u0433\u0438, \u043F\u0440\u0435\u0434\u043E\u043F\u043B\u0430\u0442\u044B \u0438 \u043F\u0440\u043E\u0433\u043D\u043E\u0437 \u0441\u043E\u0431\u0435\u0440\u0443\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438.",
        action: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0443\u0447\u0435\u043D\u0438\u043A\u0430",
        onAction: () => setModal({
          type: 'student',
          payload: null
        })
      }), debtors.length > 0 && _jsxs(_Fragment, {
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 12,
            fontWeight: 900,
            marginBottom: 10
          },
          children: "\u0414\u041E\u041B\u0416\u041D\u0418\u041A\u0418"
        }), debtors.map(s => _jsxs("div", {
          className: "finance-panel",
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px',
            marginBottom: 8,
            background: 'var(--bg-danger)'
          },
          children: [_jsxs("div", {
            style: {
              flex: 1
            },
            children: [_jsx("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontWeight: 900,
                fontSize: 12
              },
              children: s.name
            }), _jsxs("button", {
              type: "button",
              className: "finance-debt-open",
              title: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442 \u0441 \u0440\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u043A\u043E\u0439 \u0434\u043E\u043B\u0433\u0430",
              onClick: () => setModal({
                type: 'message',
                payload: {
                  student: s,
                  mode: 'debt'
                }
              }),
              children: [money(Math.abs(s.balance))]
            })]
          }), _jsx("button", {
            className: "btn btn-sm btn-white",
            style: {
              padding: '6px 9px',
              fontSize: 14
            },
            title: "\u041D\u0430\u043F\u0438\u0441\u0430\u0442\u044C \u043D\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u043D\u0438\u0435",
            onClick: () => setModal({
              type: 'message',
              payload: {
                student: s,
                mode: 'debt'
              }
            }),
            children: _jsx(IcoEdit, {
              size: 14
            })
          }), _jsx("button", {
            className: "btn btn-sm btn-green",
            onClick: () => quickPay(s.id),
            children: "\u041E\u043F\u043B\u0430\u0442\u0438\u043B"
          })]
        }, s.id))]
      }), lowPackages.length > 0 && _jsxs(_Fragment, {
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 12,
            fontWeight: 900,
            marginBottom: 10
          },
          children: "\u0410\u0411\u041E\u041D\u0415\u041C\u0415\u041D\u0422\u042B \u041D\u0410 \u0418\u0421\u0425\u041E\u0414\u0415"
        }), lowPackages.map(s => _jsxs("div", {
          className: "finance-panel",
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px',
            marginBottom: 8,
            background: 'var(--bg-subtle)'
          },
          children: [_jsxs("div", {
            style: {
              flex: 1
            },
            children: [_jsx("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontWeight: 900,
                fontSize: 12
              },
              children: s.name
            }), _jsxs("div", {
              style: {
                fontSize: 11,
                color: 'var(--text-sec)'
              },
              children: ["\u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C ", s.packageLessons, " \u0437\u0430\u043D\u044F\u0442\u0438\u0435"]
            })]
          }), _jsx("button", {
            className: "btn btn-sm btn-blue",
            onClick: () => setModal({
              type: 'package',
              payload: {
                student: s
              }
            }),
            children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C"
          })]
        }, s.id))]
      }), _jsxs("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '16px 0 10px'
        },
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 12,
            fontWeight: 900
          },
          children: "\u0418\u0421\u0422\u041E\u0420\u0418\u042F"
        }), _jsxs("button", {
          className: "btn btn-sm btn-black",
          onClick: () => setModal({
            type: 'transaction',
            payload: null
          }),
          children: [_jsx(IcoPlus, {
            size: 13
          }), " \u041E\u043F\u0435\u0440\u0430\u0446\u0438\u044F"]
        })]
      }), _jsxs("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 10
        },
        children: [_jsxs("select", {
          className: "input",
          value: txStudentFilter,
          onChange: e => setTxStudentFilter(e.target.value),
          style: {
            fontSize: 11,
            padding: '8px'
          },
          children: [_jsx("option", {
            value: "all",
            children: "\u0412\u0441\u0435 \u0443\u0447\u0435\u043D\u0438\u043A\u0438"
          }), students.map(s => _jsx("option", {
            value: s.id,
            children: s.name
          }, s.id))]
        }), _jsxs("select", {
          className: "input",
          value: txTypeFilter,
          onChange: e => setTxTypeFilter(e.target.value),
          style: {
            fontSize: 11,
            padding: '8px'
          },
          children: [_jsx("option", {
            value: "all",
            children: "\u0412\u0441\u0435 \u0442\u0438\u043F\u044B"
          }), _jsx("option", {
            value: "payment",
            children: "\u041E\u043F\u043B\u0430\u0442\u044B"
          }), _jsx("option", {
            value: "charge",
            children: "\u0421\u043F\u0438\u0441\u0430\u043D\u0438\u044F"
          })]
        })]
      }), _jsx("div", {
        className: "finance-history-list",
        children: historyTxs.slice(0, historyLimit).map(tx => {
        const s = students.find(st => sameId(st.id, tx.studentId));
        const meta = getTxMeta(tx);
        return _jsxs("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            padding: '10px 0',
            borderBottom: '1.5px solid var(--border-light)'
          },
          children: [_jsxs("div", {
            children: [_jsx("div", {
              style: {
                fontWeight: 700,
                fontSize: 12
              },
              children: [s?.name || 'Удалён', " \xB7 ", meta.title]
            }), _jsxs("div", {
              style: {
                fontSize: 10,
                color: 'var(--text-sec)'
              },
              children: [fmtDate(tx.date), " \xB7 ", meta.source, tx.comment ? ` · ${tx.comment}` : '']
            })]
          }), _jsxs("div", {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 6
            },
            children: [_jsxs("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontWeight: 900,
                fontSize: 14,
                color: tx.type === 'payment' ? 'var(--green)' : 'var(--red)',
                minWidth: 72,
                textAlign: 'right'
              },
              children: [tx.type === 'payment' ? '+' : '-', money(tx.amount)]
            }), !tx.lessonId && _jsxs(_Fragment, {
              children: [tx.type === 'payment' && _jsx("button", {
                className: "tx-cancel-btn",
                onClick: () => delTx(tx),
                children: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C"
              }), _jsx("button", {
                style: {
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4
                },
                onClick: () => setModal({
                  type: 'transaction',
                  payload: tx
                }),
                children: _jsx(IcoEdit, {
                  size: 15
                })
              }), _jsx("button", {
                style: {
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#999'
                },
                onClick: () => delTx(tx),
                children: _jsx(IcoTrash, {
                  size: 15
                })
              })]
            })]
          })]
        }, tx.id);
      })
      }), historyTxs.length > 12 && _jsxs("button", {
        type: "button",
        className: "btn btn-sm btn-white finance-history-more",
        onClick: () => setHistoryExpanded(v => !v),
        children: historyExpanded ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B" : ["\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0435 ", hiddenHistoryCount]
      }), _jsxs("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginTop: 14
        },
        children: [_jsx("button", {
          className: "btn btn-sm btn-white btn-full",
          onClick: exportCsv,
          children: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442 CSV"
        }), _jsx("button", {
          className: "btn btn-sm btn-red btn-full",
          onClick: clearDemoData,
          children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0434\u0435\u043C\u043E"
        })]
      }), _jsxs("div", {
        className: "finance-panel",
        style: {
          marginTop: 8,
          background: 'var(--bg-subtle)'
        },
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 10,
            fontWeight: 900,
            marginBottom: 4
          },
          children: "\u0411\u042D\u041A\u0410\u041F \u0414\u0410\u041D\u041D\u042B\u0425"
        }), _jsx("div", {
          style: {
            fontSize: 11,
            color: '#666',
            marginBottom: 10,
            lineHeight: 1.5
          },
          children: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0439 \u0431\u044D\u043A\u0430\u043F \u0440\u0430\u0437 \u0432 \u043D\u0435\u0434\u0435\u043B\u044E \u2014 \u0434\u0430\u043D\u043D\u044B\u0435 \u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435 \u0438 \u043C\u043E\u0433\u0443\u0442 \u043F\u0440\u043E\u043F\u0430\u0441\u0442\u044C \u043F\u0440\u0438 \u043E\u0447\u0438\u0441\u0442\u043A\u0435 \u043A\u044D\u0448\u0430."
        }), _jsxs("div", {
          style: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          },
          children: [_jsxs("button", {
            className: "btn btn-sm btn-black btn-full",
            onClick: exportJson,
            children: [_jsx(IcoPrint, {
              size: 13
            }), " \u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0431\u044D\u043A\u0430\u043F"]
          }), _jsxs("button", {
            className: "btn btn-sm btn-white btn-full",
            onClick: importFullJson,
            children: [_jsx(IcoPlus, {
              size: 13
            }), " \u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0431\u044D\u043A\u0430\u043F"]
          }), _jsxs("button", {
            className: "btn btn-sm btn-white btn-full",
            style: {
              gridColumn: '1/-1'
            },
            onClick: () => setModal({
              type: 'studentTextImport'
            }),
            children: [_jsx(IcoPlus, {
              size: 13
            }), " Импорт учеников из текста"]
          })]
        })]
      })]
    });
    const TrustTab = () => _jsxs("div", {
      className: "finance-trust-page",
      children: [_jsx("div", {
        className: "finance-section-title",
        children: "\u0414\u041E\u0412\u0415\u0420\u0418\u0415 \u041A \u0411\u0410\u041B\u0410\u041D\u0421\u0410\u041C"
      }), _jsxs("div", {
        className: "finance-split-grid finance-trust-overview",
        children: [_jsxs("div", {
          className: "finance-panel finance-trust-panel",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u0420\u0430\u0441\u0448\u0438\u0444\u0440\u043E\u0432\u0430\u043D\u043E"
          }), _jsx("div", {
            className: "finance-trust-score",
            children: balanceSummaries.filter(x => x.finance.hasHistory || x.finance.balance !== 0).length
          }), _jsx("div", {
            className: "metric-sub",
            children: "\u0443\u0447\u0435\u043D\u0438\u043A\u043E\u0432, \u0433\u0434\u0435 \u0431\u0430\u043B\u0430\u043D\u0441 \u043C\u043E\u0436\u043D\u043E \u043E\u0431\u044A\u044F\u0441\u043D\u0438\u0442\u044C \u043F\u043E \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F\u043C"
          })]
        }), _jsxs("div", {
          className: "finance-panel",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0434\u0435\u043D\u0435\u0436\u043D\u044B\u0435 \u0441\u043E\u0431\u044B\u0442\u0438\u044F"
          }), recentMoneyEvents.length ? recentMoneyEvents.map(tx => {
            const s = students.find(st => sameId(st.id, tx.studentId));
            const meta = getTxMeta(tx);
            return _jsxs("div", {
              className: "finance-mini-row static",
              children: [_jsxs("span", {
                children: [s?.name || "\u0423\u0434\u0430\u043B\u0451\u043D", " \xB7 ", meta.title]
              }), _jsx("strong", {
                style: {
                  color: tx.type === 'payment' ? 'var(--green)' : 'var(--red)'
                },
                children: `${tx.type === 'payment' ? '+' : '-'}${money(tx.amount)}`
              })]
            }, tx.id);
          }) : _jsx("div", {
            className: "metric-sub",
            children: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"
          })]
        })]
      }), _jsx("div", {
        className: "finance-section-title",
        children: "\u0411\u0410\u041B\u0410\u041D\u0421\u042B \u0423\u0427\u0415\u041D\u0418\u041A\u041E\u0412"
      }), _jsx("div", {
        className: "finance-panel finance-balance-trust-list",
        children: balanceSummaries.length ? balanceSummaries.map(({
          student: s,
          finance
        }) => _jsxs("button", {
          className: "finance-mini-row",
          onClick: () => setModal({
            type: 'studentDetail',
            payload: s
          }),
          children: [_jsxs("span", {
            children: [s.name, finance.hasHistory ? " \xB7 \u0435\u0441\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044F" : " \xB7 \u043D\u0443\u0436\u043D\u0430 \u0438\u0441\u0442\u043E\u0440\u0438\u044F"]
          }), _jsx("strong", {
            style: {
              color: balanceColor(finance.balance)
            },
            children: balanceLabel(finance.balance)
          })]
        }, s.id)) : _jsx("div", {
          className: "metric-sub",
          children: "\u0423\u0447\u0435\u043D\u0438\u043A\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442"
        })
      })]
    });
    const AnalyticsTab = () => _jsxs("div", {
      children: [_jsx("div", {
        className: "finance-section-title",
        children: "ДЕНЕЖНЫЕ ИНСАЙТЫ"
      }), _jsx("div", {
        className: "finance-insight-grid",
        children: insightCards.map(card => _jsxs("div", {
          className: `finance-insight-card ${card.tone}`,
          children: [_jsx("div", {
            className: "finance-insight-label",
            children: card.label
          }), _jsx("div", {
            className: "finance-insight-value",
            children: card.value
          }), _jsx("div", {
            className: "finance-insight-text",
            children: card.text
          })]
        }, card.label))
      }), _jsx("div", {
        className: "finance-section-title",
        children: "ПРОГНОЗ И РЫЧАГИ"
      }), _jsxs("div", {
        className: "finance-forecast-lab",
        children: [_jsxs("div", {
          className: "finance-panel finance-forecast-hero",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "СЦЕНАРИИ ДОХОДА"
          }), _jsxs("div", {
            className: "finance-forecast-main",
            children: [_jsx("span", {
              children: "ожидаемый итог"
            }), _jsx("strong", {
              children: money(realisticForecast)
            }), _jsx("em", {
              children: forecastMood
            })]
          }), _jsx("div", {
            className: "finance-forecast-bars",
            children: forecastRows.map(row => _jsxs("div", {
              className: `finance-forecast-row ${row.tone}`,
              children: [_jsxs("div", {
                children: [_jsx("span", {
                  children: row.label
                }), _jsx("strong", {
                  children: money(row.value)
                })]
              }), _jsx("div", {
                className: "finance-forecast-track",
                children: _jsx("i", {
                  style: {
                    width: `${Math.max(5, row.value / forecastMax * 100)}%`
                  }
                })
              }), _jsx("small", {
                children: row.hint
              })]
            }, row.label))
          })]
        }), _jsxs("div", {
          className: "finance-panel finance-cash-projection",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ПРОГНОЗ КАССЫ"
          }), _jsxs("div", {
            className: "finance-cash-big",
            children: [_jsx("span", {
              children: "вероятно придет деньгами"
            }), _jsx("strong", {
              children: money(expectedCash)
            }), _jsx("em", {
              children: cashForecastText
            })]
          }), _jsx("div", {
            className: "finance-week-bars",
            children: weekForecastRows.length ? weekForecastRows.map(row => _jsxs("div", {
              className: "finance-week-row",
              children: [_jsx("span", {
                children: row.label
              }), _jsxs("div", {
                children: [_jsx("i", {
                  style: {
                    width: `${row.fact / maxWeekForecast * 100}%`
                  }
                }), _jsx("b", {
                  style: {
                    width: `${row.plan / maxWeekForecast * 100}%`
                  }
                })]
              }), _jsx("strong", {
                children: money(Math.round(row.fact + row.plan))
              })]
            }, row.key)) : _jsx("div", {
              className: "metric-sub",
              children: "Нет уроков для недельного прогноза"
            })
          })]
        }), _jsxs("div", {
          className: "finance-panel finance-lever-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ЧТО БЫСТРЕЕ ДАСТ ДЕНЬГИ"
          }), _jsx("div", {
            className: "finance-lever-list",
            children: financeLevers.map(row => _jsxs("div", {
              className: `finance-lever-row ${row.tone}`,
              children: [_jsxs("div", {
                children: [_jsx("span", {
                  children: row.label
                }), _jsx("strong", {
                  children: money(row.value)
                }), _jsx("small", {
                  children: row.text
                })]
              }), _jsx("i", {
                style: {
                  width: `${row.value > 0 ? Math.max(5, row.value / maxLeverValue * 100) : 0}%`
                }
              })]
            }, row.label))
          })]
        })]
      }), _jsxs("div", {
        className: "finance-split-grid",
        children: [_jsxs("div", {
          className: "finance-panel finance-goal-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ЦЕЛЬ ПЕРИОДА"
          }), _jsxs("div", {
            className: "finance-goal-head",
            children: [_jsxs("div", {
              children: [_jsx("span", {
                children: "Реалистичный итог"
              }), _jsx("strong", {
                children: money(Math.round(totalRealistic))
              })]
            }), _jsxs("div", {
              children: [_jsx("span", {
                children: "Цель"
              }), _jsx("strong", {
                children: money(periodGoal)
              })]
            })]
          }), _jsx("div", {
            className: "finance-goal-meter",
            children: _jsx("div", {
              style: {
                width: `${Math.min(100, periodGoal ? totalRealistic / periodGoal * 100 : 0)}%`
              }
            })
          }), _jsxs("div", {
            className: "finance-goal-note",
            children: goalGap > 0 ? ["Не хватает ", money(goalGap), ". Это примерно ", lessonsToGoal, " ученико-уроков или повышение цены на части занятий."] : ["Цель закрыта. Следующий полезный шаг - удержание посещаемости и долгов."]
          })]
        }), _jsxs("div", {
          className: "finance-panel finance-day-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ЭКОНОМИКА ПО ДНЯМ"
          }), _jsx("div", {
            className: "finance-day-list",
            children: dayEconomics.map(row => _jsxs("div", {
              className: "finance-day-row",
              children: [_jsx("span", {
                children: row.label
              }), _jsx("div", {
                className: "finance-day-track",
                children: _jsx("div", {
                  style: {
                    width: `${Math.max(4, (row.earned + row.planned) / maxDayMoney * 100)}%`
                  }
                })
              }), _jsx("strong", {
                children: row.lessons ? money(row.earned + row.planned) : "пусто"
              })]
            }, row.label))
          })]
        })]
      }), _jsx("div", {
        className: "finance-section-title",
        children: "УСТОЙЧИВОСТЬ ДОХОДА"
      }), _jsxs("div", {
        className: "finance-stability-grid",
        children: [_jsxs("div", {
          className: "finance-panel finance-cash-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "КАССА VS ЗАРАБОТАНО"
          }), _jsxs("div", {
            className: "finance-cash-head",
            children: [_jsxs("div", {
              children: [_jsx("span", {
                children: "Заработано"
              }), _jsx("strong", {
                children: money(periodEarned)
              })]
            }), _jsxs("div", {
              children: [_jsx("span", {
                children: "Оплачено"
              }), _jsx("strong", {
                children: money(actualPayments)
              })]
            }), _jsxs("div", {
              children: [_jsx("span", {
                children: "Разрыв"
              }), _jsx("strong", {
                children: money(cashGap)
              })]
            })]
          }), _jsx("div", {
            className: "finance-cash-meter",
            children: _jsx("div", {
              style: {
                width: paymentCoverageLabel
              }
            })
          }), _jsxs("div", {
            className: "finance-cash-note",
            children: [_jsx("strong", {
              children: paymentCoverageLabel
            }), " покрытия оплатами. ", cashText]
          })]
        }), _jsxs("div", {
          className: `finance-panel finance-dependency-panel ${dependencyTone}`,
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ЗАВИСИМОСТЬ ОТ ТОП-3"
          }), _jsxs("div", {
            className: "finance-dependency-head",
            children: [_jsx("strong", {
              children: topRevenueLabel
            }), _jsx("span", {
              children: dependencyText
            })]
          }), _jsx("div", {
            className: "finance-dependency-list",
            children: topRevenueRows.length ? topRevenueRows.map(row => _jsxs("div", {
              className: "finance-dependency-row",
              children: [_jsx("span", {
                children: row.name
              }), _jsx("div", {
                children: _jsx("i", {
                  style: {
                    width: `${Math.max(5, row.earned / Math.max(topRevenueRows[0]?.earned || 1, 1) * 100)}%`
                  }
                })
              }), _jsx("strong", {
                children: money(row.earned)
              })]
            }, row.id)) : _jsx("div", {
              className: "metric-sub",
              children: "Нет завершенных уроков за период"
            })
          })]
        })]
      }), _jsx("div", {
        className: "finance-section-title",
        children: "\u0418\u0422\u041E\u0413 \u041F\u0415\u0420\u0418\u041E\u0414\u0410"
      }), _jsxs("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 10
        },
        children: [_jsx(Stat, {
          label: "\u0417\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E",
          value: `${periodEarned.toLocaleString()} ₽`,
          color: "var(--green)"
        }), _jsx(Stat, {
          label: "\u041F\u043E\u0442\u0435\u0440\u044F\u043D\u043E \u043D\u0430 \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0445",
          value: `${periodLost.toLocaleString()} ₽`,
          color: "var(--red)"
        })]
      }), _jsxs("div", {
        style: {
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontSize: 11,
          fontWeight: 900,
          marginBottom: 10,
          marginTop: 16
        },
        children: ["\u041F\u0420\u041E\u0413\u041D\u041E\u0417 (\u043E\u0441\u0442\u0430\u0432\u0448\u0438\u0435\u0441\u044F ", periodPlanned.length, " \u0443\u0440\u043E\u043A\u043E\u0432)"]
      }), _jsxs("div", {
        className: "forecast-grid",
        children: [_jsxs("div", {
          className: "forecast-card good",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u0418\u0434\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437"
          }), _jsxs("div", {
            className: "metric-value",
            children: [projIdeal.toLocaleString(), " \u20BD"]
          }), _jsxs("div", {
            className: "metric-sub",
            children: ["\u0415\u0441\u043B\u0438 \u0432\u0441\u0435 \u043F\u0440\u0438\u0434\u0443\u0442. \u0418\u0442\u043E\u0433\u043E: ", totalIdeal.toLocaleString(), " \u20BD"]
          })]
        }), _jsxs("div", {
          className: "forecast-card warn",
          children: [_jsx("div", {
            className: "metric-label",
            children: "\u0420\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u043D\u043E\u0437"
          }), _jsxs("div", {
            className: "metric-value",
            children: [Math.round(projRealistic).toLocaleString(), " \u20BD"]
          }), _jsxs("div", {
            className: "metric-sub",
            children: ["\u0421 \u0443\u0447\u0435\u0442\u043E\u043C \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u043E\u0432 ", Math.round(avgSkipRate * 100), "%. \u0418\u0442\u043E\u0433\u043E: ", Math.round(totalRealistic).toLocaleString(), " \u20BD"]
          })]
        })]
      }), _jsx("div", {
        className: "finance-section-title",
        children: "ГДЕ ДЕНЬГИ ЗАСТРЕВАЮТ"
      }), _jsxs("div", {
        className: "finance-split-grid",
        children: [_jsxs("div", {
          className: "finance-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ДОЛГИ ПО ДАВНОСТИ"
          }), debtBuckets.map(row => _jsxs("div", {
            className: "finance-kpi-row",
            children: [_jsx("span", {
              children: row.label
            }), _jsx("strong", {
              children: money(row.amount)
            }), _jsxs("em", {
              children: [row.count, " чел."]
            })]
          }, row.label))]
        }), _jsxs("div", {
          className: "finance-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ФОРМАТЫ ЗАНЯТИЙ"
          }), channelRows.map(row => _jsxs("div", {
            className: "finance-kpi-row",
            children: [_jsx("span", {
              children: row.label
            }), _jsxs("strong", {
              children: [money(row.avgLesson), " / урок"]
            }), _jsxs("em", {
              children: [row.lessons, " ур."]
            })]
          }, row.key))]
        })]
      }), _jsxs("div", {
        className: "finance-panel finance-risk-panel",
        children: [_jsx("div", {
          className: "finance-section-title compact",
          children: "УЧЕНИКИ С Р РСКОМ ПО ДЕНЬГАМ"
        }), riskRows.length ? _jsx("div", {
          className: "finance-risk-list",
          children: riskRows.map(row => _jsxs("button", {
            className: "finance-risk-row",
            onClick: () => setModal({
              type: 'studentDetail',
              payload: row.student
            }),
            children: [_jsxs("span", {
              children: [_jsx("strong", {
                children: row.student.name
              }), _jsx("small", {
                children: row.reasons.join(' · ')
              })]
            }), _jsxs("em", {
              children: ["риск ", row.score]
            })]
          }, row.student.id))
        }) : _jsx("div", {
          className: "metric-sub",
          children: "Нет явных финансовых красных зон"
        })]
      }), _jsxs("div", {
        className: "finance-panel",
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 10,
            fontWeight: 900,
            marginBottom: 6
          },
          children: "\u0421\u0422\u0410\u0422\u0418\u0421\u0422\u0418\u041A\u0410 \u041F\u0420\u041E\u041F\u0423\u0421\u041A\u041E\u0412 (\u0432\u0441\u0435 \u0432\u0440\u0435\u043C\u044F)"
        }), _jsxs("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          },
          children: [_jsxs("div", {
            children: [_jsxs("div", {
              style: {
                fontSize: 11,
                color: 'var(--text-sec)'
              },
              children: [totalScheduled, " \u0437\u0430\u043D\u044F\u0442\u0438\u0439 \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E"]
            }), _jsxs("div", {
              style: {
                fontSize: 11,
                color: 'var(--text-sec)'
              },
              children: [totalSkipped, " \u043F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043E"]
            })]
          }), _jsxs("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 28,
              fontWeight: 900,
              color: avgSkipRate > 0.2 ? 'var(--red)' : avgSkipRate > 0.1 ? '#b9892f' : 'var(--green)'
            },
            children: [Math.round(avgSkipRate * 100), "%"]
          })]
        }), _jsx("div", {
          style: {
            marginTop: 10,
            height: 10,
            background: 'var(--border-light)',
            borderRadius: 999,
            overflow: 'hidden'
          },
          children: _jsx("div", {
            style: {
              height: '100%',
              width: `${Math.min(avgSkipRate * 100, 100)}%`,
              background: avgSkipRate > 0.2 ? 'var(--red)' : avgSkipRate > 0.1 ? '#b9892f' : 'var(--green)',
              transition: 'width .3s'
            }
          })
        })]
      }), _jsx("div", {
        style: {
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontSize: 11,
          fontWeight: 900,
          marginBottom: 10
        },
        children: "АНАЛИТИКА ПЕРИОДА"
      }), analyticsPeriod !== 'all_time' && (() => {
        const weekMap = {};
        periodCompleted.forEach(lesson => {
          const d = new Date(lesson.date + 'T00:00:00');
          const dow = d.getDay() || 7;
          const mon = new Date(d);
          mon.setDate(d.getDate() - dow + 1);
          const key = mon.toISOString().slice(0, 10);
          const ls = getLessonStudents(lesson, students, groups, {
            includeArchived: true
          });
          ls.forEach(s => {
            const rate = getLessonRate(lesson, s, groups);
            const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
            if (present) weekMap[key] = (weekMap[key] || 0) + rate;
          });
        });
        const weeks = Object.keys(weekMap).sort();
        if (weeks.length < 2) return null;
        const maxVal = Math.max(...weeks.map(w => weekMap[w]), 1);
        const barW = Math.max(18, Math.min(34, Math.floor(220 / weeks.length) - 6));
        const gap = 8;
        const h = 58;
        const svgW = Math.max(360, weeks.length * (barW + gap));
        return _jsxs("div", {
          className: "finance-panel finance-chart-panel",
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 10,
              fontWeight: 900,
              marginBottom: 10
            },
            children: "\u0414\u041E\u0425\u041E\u0414 \u041F\u041E \u041D\u0415\u0414\u0415\u041B\u042F\u041C"
          }), _jsx("div", {
            className: "finance-chart-scroll",
            children: _jsx("svg", {
              width: "100%",
              viewBox: `0 0 ${Math.max(svgW, 200)} ${h + 32}`,
              className: "finance-chart-svg weekly",
              style: {
                minWidth: `${svgW}px`
              },
              children: weeks.map((w, i) => {
                const val = weekMap[w] || 0;
                const barH = val / maxVal * h;
                const x = i * (barW + gap);
                const weekNum = new Date(w + 'T00:00:00');
                const label = weekNum.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'numeric'
                });
                return _jsxs("g", {
                  children: [_jsx("rect", {
                    x: x,
                    y: h - barH,
                    width: barW,
                    height: barH,
                    rx: 3,
                    fill: "var(--blue)",
                    opacity: 0.85
                  }), val > 0 && _jsxs("text", {
                    x: x + barW / 2,
                    y: h - barH - 4,
                    textAnchor: "middle",
                    fontSize: "8",
                    fontFamily: "Unbounded, Arial Black, Segoe UI, sans-serif",
                    fontWeight: "700",
                    fill: "var(--black)",
                    children: [Math.round(val / 1000), "\u043A"]
                  }), _jsx("text", {
                    x: x + barW / 2,
                    y: h + 14,
                    textAnchor: "middle",
                    fontSize: "8",
                    fontFamily: "Martian Mono,monospace",
                    fill: "var(--text-sec)",
                    children: label
                  })]
                }, w);
              })
            })
          })]
        });
      })(), (() => {
        const subjectMap = {};
        periodCompleted.forEach(lesson => {
          const subject = getLessonSubject(lesson, groups);
          if (!subjectMap[subject]) subjectMap[subject] = {
            subject,
            lessons: 0,
            earned: 0,
            lost: 0
          };
          const row = subjectMap[subject];
          row.lessons += 1;
          const ls = getLessonStudents(lesson, students, groups, {
            includeArchived: true
          });
          ls.forEach(s => {
            const rate = getLessonRate(lesson, s, groups);
            const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
            if (present && isFinalLesson(lesson)) row.earned += rate;
            if (!present && lesson.status === 'no_show') row.lost += rate;
          });
        });
        const rows = Object.values(subjectMap).sort((a, b) => b.earned - a.earned || b.lessons - a.lessons).slice(0, 6);
        const maxEarned = Math.max(...rows.map(r => r.earned), 1);
        if (!rows.length) return null;
        return _jsxs("div", {
          className: "finance-panel finance-subject-panel",
          children: [_jsx("div", {
            style: {
              fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
              fontSize: 10,
              fontWeight: 900,
              marginBottom: 10
            },
            children: "ДОХОД ПО ПРЕДМЕТАМ"
          }), _jsx("div", {
            className: "finance-subject-list",
            children: rows.map(r => _jsxs("div", {
              className: "finance-subject-row",
              children: [_jsxs("div", {
                className: "finance-subject-head",
                children: [_jsx("strong", {
                  children: r.subject
                }), _jsxs("span", {
                  children: [r.lessons, " уроков"]
                })]
              }), _jsxs("div", {
                className: "finance-subject-money",
                children: [_jsxs("b", {
                  children: [r.earned.toLocaleString(), " ₽"]
                }), r.lost > 0 && _jsxs("span", {
                  children: ["-", r.lost.toLocaleString(), " ₽"]
                })]
              }), _jsx("div", {
                className: "finance-subject-track",
                children: _jsx("div", {
                  style: {
                    width: `${Math.max(6, r.earned / maxEarned * 100)}%`
                  }
                })
              })]
            }, r.subject))
          })]
        });
      })(), _jsx("div", {
        style: {
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontSize: 11,
          fontWeight: 900,
          marginBottom: 10
        },
        children: "\u041F\u041E \u0423\u0427\u0415\u041D\u0418\u041A\u0410\u041C (\u043F\u0435\u0440\u0438\u043E\u0434)"
      }), studentRows.length === 0 ? _jsx("div", {
        style: {
          textAlign: 'center',
          padding: 20,
          color: 'var(--text-muted)',
          fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
          fontSize: 11
        },
        children: "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430 \u043F\u0435\u0440\u0438\u043E\u0434"
      }) : studentRows.map(s => {
        const skipRate = s.scheduled > 0 ? s.skipped / s.scheduled : 0;
        const ownSkip = studentStats[s.id];
        const allTimeSkip = ownSkip.scheduled > 0 ? ownSkip.skipped / ownSkip.scheduled : 0;
        return _jsxs("div", {
          className: "finance-panel",
          style: {
            padding: '10px 12px'
          },
          children: [_jsxs("div", {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 8
            },
            children: [_jsx("div", {
              style: {
                fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                fontWeight: 900,
                fontSize: 12
              },
              children: s.name
            }), _jsxs("div", {
              style: {
                display: 'flex',
                gap: 6
              },
              children: [_jsxs("span", {
                style: {
                  fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                  fontSize: 11,
                  fontWeight: 900,
                  color: 'var(--green)'
                },
                children: [s.earned.toLocaleString(), " \u20BD"]
              }), s.lost > 0 && _jsxs("span", {
                style: {
                  fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
                  fontSize: 11,
                  fontWeight: 900,
                  color: 'var(--red)'
                },
                children: ["-", s.lost.toLocaleString(), " \u20BD"]
              })]
            })]
          }), _jsxs("div", {
            style: {
              display: 'flex',
              gap: 6,
              fontSize: 10,
              color: 'var(--text-sec)',
              marginBottom: 6
            },
            children: [_jsxs("span", {
              children: [s.attended, "/", s.scheduled, " \u0443\u0440\u043E\u043A\u043E\u0432"]
            }), _jsx("span", {
              children: "\xB7"
            }), _jsxs("span", {
              style: {
                color: allTimeSkip > 0.2 ? 'var(--red)' : allTimeSkip > 0.1 ? '#FF8C00' : 'var(--green)',
                fontWeight: 700
              },
              children: ["\u043F\u0440\u043E\u043F\u0443\u0441\u043A ", Math.round(allTimeSkip * 100), "% (\u0432\u0441\u0451 \u0432\u0440\u0435\u043C\u044F)"]
            })]
          }), _jsx("div", {
            style: {
              height: 6,
              background: 'var(--border-light)',
              borderRadius: 3,
              border: '1px solid var(--border-dashed)',
              overflow: 'hidden'
            },
            children: _jsxs("div", {
              style: {
                height: '100%',
                display: 'flex'
              },
              children: [_jsx("div", {
                style: {
                  width: `${s.scheduled > 0 ? s.attended / s.scheduled * 100 : 0}%`,
                  background: 'var(--green)',
                  transition: 'width .3s'
                }
              }), _jsx("div", {
                style: {
                  flex: 1,
                  background: 'var(--red)'
                }
              })]
            })
          })]
        }, s.id);
      })]
    });
    return _jsxs("div", {
      className: "finance-page",
      children: [_jsxs("div", {
        className: "page-title",
        children: ["\u0424\u0438\u043D\u0430\u043D\u0441\u044B", _jsxs("div", {
          style: {
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          },
          children: [_jsxs("button", {
            className: "btn btn-sm btn-green",
            onClick: () => setModal({
              type: 'transaction',
              payload: null
            }),
          children: [_jsx(IcoWallet, {
            size: 13
          }), " \u041D\u043E\u0432\u0430\u044F \u043E\u043F\u043B\u0430\u0442\u0430"]
          }), _jsx("button", {
            className: "btn btn-sm btn-white",
            onClick: () => setModal({
              type: 'data'
            }),
            children: "\u0414\u0430\u043D\u043D\u044B\u0435"
          }), _jsxs("button", {
            className: "btn btn-sm btn-white",
            onClick: () => setModal({
              type: 'deletions'
            }),
            children: ["\u0416\u0443\u0440\u043D\u0430\u043B ", deletionLog.length ? `· ${deletionLog.length}` : '']
          })]
        })]
      }), _jsx(FinancePeriodPicker, {}), _jsxs("div", {
        className: "toggle-row",
        style: {
          marginBottom: 16
        },
        children: [_jsx("button", {
          className: `toggle-opt ${finTab === 'control' ? 'active' : ''}`,
          onClick: () => setFinTab('control'),
          children: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C"
        }), _jsx("button", {
          className: `toggle-opt ${finTab === 'trust' ? 'active' : ''}`,
          onClick: () => setFinTab('trust'),
          children: "\u0414\u043E\u0432\u0435\u0440\u0438\u0435"
        }), _jsx("button", {
          className: `toggle-opt ${finTab === 'analytics' ? 'active' : ''}`,
          onClick: () => setFinTab('analytics'),
          children: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430"
        })]
      }), finTab === 'control' ? _jsx(ControlTab, {}) : finTab === 'trust' ? _jsx(TrustTab, {}) : _jsx(AnalyticsTab, {})]
    });
  };
  const dataStats = {
    students: students.length,
    groups: groups.length,
    lessons: lessons.length,
    txs: txs.length,
    templates: customTemplates.length
  };
  if (!loaded) return _jsx("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
      fontSize: 14
    },
    children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..."
  });
  const parentToken = new URLSearchParams(window.location.search).get('parent');
  if (parentToken) {
    const parentStudent = students.find(s => {
      const portal = getParentPortalSettings(s);
      return portal.enabled && portal.token === parentToken;
    });
    return _jsx(ParentPortalPage, {
      student: parentStudent || null,
      students: students,
      groups: groups,
      lessons: lessons,
      txs: txs,
      onPaymentNotice: saveParentPaymentNotice
    });
  }
  return _jsxs("div", {
    children: [_jsx(UndoToast, {
      pendingUndo: pendingUndo,
      onUndo: handleUndo
    }), _jsxs("div", {
      className: "main",
      children: [tab === 'today' && _jsx(PageToday, {}), tab === 'schedule' && _jsx(PageSchedule, {}), tab === 'students' && _jsx(PageStudents, {}), tab === 'finance' && _jsx(PageFinance, {})]
    }), tab === 'today' && _jsxs(_Fragment, {
      children: [fabOpen && _jsx("div", {
        className: "fab-overlay",
        onClick: () => setFabOpen(false)
      }), fabOpen && _jsxs("div", {
        className: "fab-menu",
        children: [_jsxs("div", {
          className: "fab-item",
          style: {
            background: 'var(--yellow)',
            color: 'var(--black)'
          },
          onClick: () => {
            setFabOpen(false);
            setModal({
              type: 'lesson',
              payload: {
                date: tab === 'schedule' ? selDate : getTodayDate()
              }
            });
          },
          children: [_jsx(IcoCal, {
            size: 16
          }), " \u041D\u043E\u0432\u044B\u0439 \u0443\u0440\u043E\u043A"]
        }), _jsxs("div", {
          className: "fab-item",
          style: {
            background: 'var(--green)',
            color: 'var(--black)'
          },
          onClick: () => {
            setFabOpen(false);
            setModal({
              type: 'student',
              payload: null
            });
          },
          children: [_jsx(IcoUsers, {
            size: 16
          }), " \u041D\u043E\u0432\u044B\u0439 \u0443\u0447\u0435\u043D\u0438\u043A"]
        }), _jsxs("div", {
          className: "fab-item",
          style: {
            background: 'var(--blue)',
            color: '#fff'
          },
          onClick: () => {
            setFabOpen(false);
            setModal({
              type: 'transaction',
              payload: null
            });
          },
          children: [_jsx(IcoWallet, {
            size: 16
          }), " \u041D\u043E\u0432\u0430\u044F \u043E\u043F\u043B\u0430\u0442\u0430"]
        })]
      }), _jsx("div", {
        className: "fab",
        onClick: () => setFabOpen(!fabOpen),
        style: {
          transform: fabOpen ? 'rotate(45deg)' : 'none',
          transition: 'transform .2s'
        },
        children: _jsx(IcoPlus, {
          size: 28
        })
      })]
    }), showSearch && _jsx(SearchModal, {
      students: students,
      groups: groups,
      lessons: lessons,
      onClose: () => setShowSearch(false),
      onOpenStudent: s => setModal({
        type: 'studentDetail',
        payload: s
      }),
      onOpenGroup: g => setModal({
        type: 'groupDetail',
        payload: g
      }),
      onOpenLesson: openLessonCard
    }), showNotifs && _jsx("div", {
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 199
      },
      onClick: () => setShowNotifs(false),
      children: _jsxs("div", {
        onClick: e => e.stopPropagation(),
        style: {
          position: 'fixed',
          right: 16,
          top: 60,
          width: 300,
          maxHeight: 400,
          overflowY: 'auto',
          background: 'var(--white)',
          border: 'var(--border)',
          borderRadius: 4,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 200,
          padding: 8
        },
        children: [_jsx("div", {
          style: {
            fontFamily: 'Unbounded, Arial Black, Segoe UI, sans-serif',
            fontSize: 10,
            fontWeight: 900,
            padding: '8px 8px 4px',
            color: 'var(--text-sec)'
          },
          children: "\u0423\u0412\u0415\u0414\u041E\u041C\u041B\u0415\u041D\u0418\u042F"
        }), notifications.length === 0 ? _jsx("div", {
          style: {
            padding: 16,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-muted)'
          },
          children: "\u0412\u0441\u0451 \u043E\u0442\u043B\u0438\u0447\u043D\u043E"
        }) : notifications.map(n => _jsxs("div", {
          style: {
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            padding: '8px',
            borderBottom: '1px solid var(--border-light)'
          },
          children: [_jsx("span", {
            style: {
              fontSize: 18
            },
            children: n.icon
          }), _jsxs("div", {
            children: [_jsx("div", {
              style: {
                fontSize: 12,
                fontWeight: 600
              },
              children: n.text
            }), n.sub && _jsx("div", {
              style: {
                fontSize: 10,
                color: 'var(--text-sec)'
              },
              children: n.sub
            })]
          })]
        }, n.id))]
      })
    }), _jsx("nav", {
      className: "navbar",
      children: [{
        id: 'today',
        icon: _jsx(IcoHome, {}),
        label: 'Сегодня'
      }, {
        id: 'schedule',
        icon: _jsx(IcoCal, {}),
        label: 'Расписание'
      }, {
        id: 'students',
        icon: _jsx(IcoUsers, {}),
        label: 'Ученики'
      }, {
        id: 'finance',
        icon: _jsx(IcoWallet, {}),
        label: 'Финансы'
      }].map(({
        id,
        icon,
        label
      }) => _jsxs("button", {
        className: `nav-btn ${tab === id ? 'active' : ''}`,
        onClick: () => {
          setTab(id);
          setFabOpen(false);
        },
        children: [icon, _jsx("span", {
          children: label
        })]
      }, id))
    }), modal?.type === 'lesson' && _jsx(LessonModal, {
      students: students,
      groups: groups,
      lessons: lessons,
      initialDate: modal.payload?.date || getTodayDate(),
      initialStudentId: modal.payload?.studentId || null,
      initialType: modal.payload?.initialType || null,
      initialTargetId: modal.payload?.targetId || null,
      initialTime: modal.payload?.time || null,
      lessonToEdit: modal.payload?.lesson || null,
      onClose: () => setModal(null),
      onSave: (data, options) => saveLesson(data, modal.payload?.lesson?.id || null, options)
    }), modal?.type === 'attendance' && _jsx(AttendanceModal, {
      lesson: modal.payload,
      students: students,
      groups: groups,
      onClose: () => setModal(null),
      onSave: saveAttendance
    }), modal?.type === 'student' && _jsx(StudentModal, {
      student: modal.payload,
      onClose: () => setModal(null),
      onSave: saveStudent
    }), modal?.type === 'studentProfile' && _jsx(StudentProfileModal, {
      student: modal.payload,
      students: students,
      groups: groups,
      lessons: lessons,
      txs: txs,
      onClose: () => setModal(null),
      onSave: saveStudent
    }), modal?.type === 'studentDetail' && _jsx(StudentDetailModal, {
      student: modal.payload,
      students: students,
      lessons: lessons,
      txs: txs,
      groups: groups,
      onClose: () => setModal(null),
      onEdit: () => setModal({
        type: 'student',
        payload: modal.payload
      }),
      onProfile: () => setModal({
        type: 'studentProfile',
        payload: modal.payload
      }),
      onReport: () => setModal({
        type: 'studentReport',
        payload: modal.payload
      }),
      onPay: studentId => {
        const s = students.find(st => sameId(st.id, studentId));
        setModal({
          type: 'transaction',
          payload: {
            studentId,
            type: 'payment',
            amount: s?.balance < 0 ? Math.abs(s.balance) : '',
            date: getTodayDate(),
            comment: s?.balance < 0 ? 'Оплата долга' : ''
          }
        });
      },
      onLesson: studentId => setModal({
        type: 'lesson',
        payload: {
          date: getTodayDate(),
          studentId
        }
      }),
      onGroupLesson: (group, date, time) => setModal({
        type: 'lesson',
        payload: {
          date,
          time,
          initialType: 'group',
          targetId: group.id
        }
      }),
      onPackage: student => setModal({
        type: 'package',
        payload: {
          student
        }
      }),
      onMessage: (student, mode = null) => setModal({
        type: 'message',
        payload: {
          student,
          mode
        }
      }),
      onArchive: archiveStudent,
      onSaveParentPortal: saveParentPortal,
      onAcceptPaymentNotice: acceptParentPaymentNotice,
      onDismissPaymentNotice: dismissParentPaymentNotice
    }), modal?.type === 'studentReport' && _jsx(StudentReportModal, {
      student: modal.payload,
      students: students,
      groups: groups,
      lessons: lessons,
      txs: txs,
      onClose: () => setModal(null),
      onSave: saveStudent
    }), modal?.type === 'transaction' && _jsx(TransactionModal, {
      tx: modal.payload,
      students: students,
      onClose: () => setModal(null),
      onSave: saveTx
    }), modal?.type === 'group' && _jsx(GroupModal, {
      group: modal.payload,
      students: students,
      onClose: () => setModal(null),
      onSave: saveGroup
    }), modal?.type === 'groupDetail' && _jsx(GroupDetailModal, {
      group: modal.payload,
      students: students,
      lessons: lessons,
      onClose: () => setModal(null),
      onEdit: () => setModal({
        type: 'group',
        payload: modal.payload
      })
    }), modal?.type === 'lessonStatus' && _jsx(LessonStatusModal, {
      lesson: modal.payload,
      onClose: () => setModal(null),
      onStatus: setLessonStatus,
      onDelete: requestDeleteLesson,
      onReschedule: lesson => setModal({
        type: 'reschedule',
        payload: {
          lesson
        }
      })
    }), modal?.type === 'lessonDelete' && _jsx(LessonDeleteModal, {
      lesson: modal.payload.lesson,
      onClose: () => setModal(null),
      onDeleteOne: delLesson,
      onDeleteFuture: delFutureSeriesLessons
    }), modal?.type === 'package' && _jsx(PackageModal, {
      student: modal.payload.student,
      onClose: () => setModal(null),
      onSave: savePackage
    }), modal?.type === 'reschedule' && _jsx(RescheduleModal, {
      lesson: modal.payload.lesson,
      onClose: () => setModal(null),
      onSave: rescheduleLesson
    }), modal?.type === 'message' && modal.payload?.student && _jsx(MessageModal, {
      student: modal.payload.student,
      lesson: modal.payload.lesson || null,
      groups: groups,
      lessons: lessons,
      txs: txs,
      mode: modal.payload.mode || null,
      templates: customTemplates,
      onSaveTemplate: setCustomTemplates,
      onClose: () => setModal(null)
    }), modal?.type === 'schedExport' && _jsx(ScheduleExportModal, {
      lessons: lessons,
      onExport: exportSchedulePdf,
      onClose: () => setModal(null)
    }), modal?.type === 'tips' && _jsx(TipsModal, {
      onClose: () => setModal(null)
    }), modal?.type === 'data' && _jsx(DataModal, {
      stats: dataStats,
      lastSavedAt: lastSavedAt,
      lastBackupAt: lastBackupAt,
      storageWarning: storageWarning,
      onExport: exportJson,
      onImport: importFullJson,
      onTextImport: () => setModal({
        type: 'studentTextImport'
      }),
      onLocalBackup: () => createLocalBackup(true),
      onClose: () => setModal(null)
    }), modal?.type === 'studentTextImport' && _jsx(StudentTextImportModal, {
      students: students,
      groups: groups,
      onImport: applyStudentTextImport,
      onClose: () => setModal(null)
    }), modal?.type === 'deletions' && _jsx(DeleteJournalModal, {
      entries: deletionLog,
      onRestore: restoreDeletion,
      onClose: () => setModal(null)
    })]
  });
}

// Shared LessonCard component
function LessonCard({
  lesson,
  name,
  onEdit,
  onAttend,
  onStatus,
  onDelete,
  compact = false
}) {
  const done = isFinalLesson(lesson);
  const statusInfo = LESSON_STATUS[lesson.status] || LESSON_STATUS.planned;
  const openCard = () => {
    if (lesson.status === 'completed') {
      onAttend();
      return;
    }
    if (lesson.status === 'planned') {
      onEdit();
      return;
    }
    onStatus();
  };
  const handleCardKey = e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    openCard();
  };
  return _jsxs("div", {
    className: `lesson-card status-${lesson.status} ${done ? 'is-final' : ''} ${compact ? 'compact' : ''}`,
    role: "button",
    tabIndex: 0,
    onClick: openCard,
    onKeyDown: handleCardKey,
    style: {
      opacity: done ? .75 : 1
    },
    children: [lesson.lessonNote && _jsx("span", {
      className: "lesson-note-dot",
      title: "\u0415\u0441\u0442\u044C \u043F\u043E\u043C\u0435\u0442\u043A\u0430"
    }), _jsxs("div", {
      className: "lesson-time",
      style: {
        background: done ? 'var(--done-bg)' : 'var(--ink)',
        minWidth: compact ? 52 : 62,
        fontSize: compact ? 12 : 14
      },
      children: [_jsx("span", {
        children: lesson.time
      }), lesson.duration && lesson.duration !== 60 && _jsx("span", {
        style: {
          fontSize: 8,
          color: '#bbb',
          marginTop: 1
        },
        children: lesson.duration < 60 ? `${lesson.duration}м` : lesson.duration === 90 ? '1.5ч' : lesson.duration === 120 ? '2ч' : `${lesson.duration}м`
      }), done && _jsx("span", {
        style: {
          fontSize: 8,
          color: 'var(--text-sec)',
          marginTop: 2,
          textAlign: 'center'
        },
        children: statusInfo.label
      })]
    }), _jsxs("div", {
      className: "lesson-body",
      children: [_jsx("div", {
        className: "lesson-name",
        style: {
          fontSize: compact ? 11 : 12
        },
        children: name
      }), _jsxs("div", {
        children: [_jsx("span", {
          className: "lesson-tag",
          style: {
            background: subjectColor(lesson.subject || 'История'),
            color: subjectTagText(lesson.subject || 'История')
          },
          children: lesson.subject || 'История'
        }), lesson.seriesId && _jsx("span", {
          className: "lesson-tag",
          style: {
            marginLeft: 5,
            background: 'var(--white)',
            color: 'var(--black)'
          },
          children: "\u0441\u0435\u0440\u0438\u044F"
        }), lesson.homework && _jsx("span", {
          className: "lesson-tag",
          style: {
            marginLeft: 5,
            background: 'var(--green)',
            color: 'var(--black)'
          },
          children: "\u0414\u0417"
        }), lesson.status !== 'planned' && !done && _jsx("span", {
          className: "lesson-tag",
          style: {
            marginLeft: 5,
            background: statusInfo.color,
            color: '#fff'
          },
          children: statusInfo.label
        })]
    }), _jsxs("div", {
      className: "lesson-actions",
      children: [lesson.status === 'planned' ? _jsx("button", {
        type: "button",
        title: "Провести",
        "aria-label": "Провести урок",
        className: "btn btn-sm btn-green",
        onClick: e => {
          e.stopPropagation();
          onAttend();
        },
        children: _jsx(IcoPlay, {
          size: 14
        })
      }) : lesson.status === 'completed' ? _jsx("button", {
        type: "button",
        title: "Изменить посещение",
        "aria-label": "Изменить посещение",
        className: "btn btn-sm btn-white",
        onClick: e => {
          e.stopPropagation();
          onAttend();
        },
        children: _jsx(IcoCheck, {
          size: 14
        })
      }) : _jsx("button", {
        type: "button",
        title: "Статус урока",
        "aria-label": "Статус урока",
        className: "btn btn-sm btn-white",
        onClick: e => {
          e.stopPropagation();
          onStatus();
        },
        children: _jsx("span", {
          style: {
            maxWidth: 96,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          },
          children: statusInfo.label
        })
      }), _jsx("button", {
        type: "button",
        title: "Статус и перенос",
        "aria-label": "Статус и перенос",
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          color: '#555'
        },
        onClick: e => {
          e.stopPropagation();
          onStatus();
        },
        children: _jsx(IcoRepeat, {
          size: 16
        })
      }), _jsx("button", {
        type: "button",
        title: "Изменить занятие",
        "aria-label": "Изменить занятие",
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          color: '#555'
        },
        onClick: e => {
          e.stopPropagation();
          onEdit();
        },
        children: _jsx(IcoEdit, {
          size: 16
        })
      }), _jsx("button", {
        type: "button",
        title: "Удалить занятие",
        "aria-label": "Удалить занятие",
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 6,
          color: '#999'
        },
        onClick: e => {
          e.stopPropagation();
          onDelete(e);
        },
        children: _jsx(IcoTrash, {
          size: 16
        })
      })]
    })]
  })]
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(App, {}));

// ── PWA: Service Worker Registration ──
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    const isLocalDev = ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
    if (isLocalDev) {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(reg => reg.unregister())).catch(() => {});
      window.caches?.keys?.().then(keys => keys.forEach(key => window.caches.delete(key))).catch(() => {});
      return;
    }
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

