const assert = require('assert');
const finance = require('../financeLogic.js');

const baseStudents = [
  { id: 1, name: 'A', balance: -1500, packageLessons: 0 },
  { id: 2, name: 'B', balance: 500, packageLessons: 1 }
];

assert.strictEqual(finance.txDelta({ type: 'payment', amount: 1200 }), 1200);
assert.strictEqual(finance.txDelta({ type: 'charge', amount: 1200 }), -1200);

{
  const result = finance.quickDebtPaymentState({
    students: baseStudents,
    txs: [],
    studentId: 1,
    date: '2026-05-16',
    comment: 'quick',
    createId: () => 10
  });
  assert.strictEqual(result.tx.amount, 1500);
  assert.strictEqual(result.students.find(s => s.id === 1).balance, 0);
  assert.strictEqual(result.txs.length, 1);

  const deleted = finance.deleteTransactionState({
    students: result.students,
    txs: result.txs,
    tx: result.tx
  });
  assert.strictEqual(deleted.students.find(s => s.id === 1).balance, -1500);
  assert.strictEqual(deleted.txs.length, 0);
}

{
  const result = finance.buyPackageState({
    students: baseStudents,
    txs: [],
    studentId: 2,
    lessonsCount: 4,
    amount: 6000,
    date: '2026-05-16',
    comment: 'package',
    createId: () => 20
  });
  const student = result.students.find(s => s.id === 2);
  assert.strictEqual(student.balance, 6500);
  assert.strictEqual(student.packageLessons, 5);
  assert.strictEqual(result.tx.kind, 'package');

  const deleted = finance.deleteTransactionState({
    students: result.students,
    txs: result.txs,
    tx: result.tx
  });
  const restored = deleted.students.find(s => s.id === 2);
  assert.strictEqual(restored.balance, 500);
  assert.strictEqual(restored.packageLessons, 1);
}

{
  const created = finance.saveTransactionState({
    students: baseStudents,
    txs: [],
    data: { studentId: 1, type: 'payment', amount: 500, date: '2026-05-16' },
    createId: () => 30
  });
  assert.strictEqual(created.students.find(s => s.id === 1).balance, -1000);

  const edited = finance.saveTransactionState({
    students: created.students,
    txs: created.txs,
    edit: created.tx,
    data: { studentId: 2, type: 'charge', amount: 300, date: '2026-05-17' }
  });
  assert.strictEqual(edited.students.find(s => s.id === 1).balance, -1500);
  assert.strictEqual(edited.students.find(s => s.id === 2).balance, 200);
}

{
  const lesson = { id: 101, status: 'planned' };
  const lessonStudents = [{ id: 1, rate: 1500 }, { id: 2, rate: 1200 }];
  const result = finance.saveAttendanceState({
    students: [
      { id: 1, balance: 0, packageLessons: 1 },
      { id: 2, balance: 0, packageLessons: 0 }
    ],
    txs: [],
    lesson,
    lessonStudents,
    newAttendance: { 1: true, 2: true },
    date: '2026-05-16',
    lessonDateLabel: '16 мая',
    createId: index => 100 + index
  });
  assert.strictEqual(result.students.find(s => s.id === 1).balance, -1500);
  assert.strictEqual(result.students.find(s => s.id === 1).packageLessons, 0);
  assert.strictEqual(result.students.find(s => s.id === 2).balance, -1200);
  assert.strictEqual(result.packageUse[1], true);
  assert.strictEqual(result.txs.length, 2);

  const reverted = finance.removeLessonTransactionsState({
    students: result.students,
    txs: result.txs,
    lessonId: 101,
    kind: 'attendance',
    packageUse: result.packageUse
  });
  assert.strictEqual(reverted.students.find(s => s.id === 1).balance, 0);
  assert.strictEqual(reverted.students.find(s => s.id === 1).packageLessons, 1);
  assert.strictEqual(reverted.students.find(s => s.id === 2).balance, 0);
  assert.strictEqual(reverted.txs.length, 0);
}

{
  const lesson = {
    id: 102,
    status: 'completed',
    attendance: { 1: true, 2: true },
    packageUse: { 1: true }
  };
  const edited = finance.saveAttendanceState({
    students: [
      { id: 1, balance: -1500, packageLessons: 0 },
      { id: 2, balance: -1200, packageLessons: 0 }
    ],
    txs: [
      { id: 1, studentId: 1, type: 'charge', amount: 1500, lessonId: 102, kind: 'attendance' },
      { id: 2, studentId: 2, type: 'charge', amount: 1200, lessonId: 102, kind: 'attendance' }
    ],
    lesson,
    lessonStudents: [{ id: 1, rate: 1500 }, { id: 2, rate: 1200 }],
    newAttendance: { 1: false, 2: true },
    date: '2026-05-16',
    lessonDateLabel: '16 мая',
    createId: index => 200 + index
  });
  assert.strictEqual(edited.students.find(s => s.id === 1).balance, 0);
  assert.strictEqual(edited.students.find(s => s.id === 1).packageLessons, 1);
  assert.strictEqual(edited.students.find(s => s.id === 2).balance, -1200);
  assert.strictEqual(Boolean(edited.packageUse[1]), false);
  assert.strictEqual(edited.txs.length, 3);
}

{
  const lesson = {
    id: 103,
    attendance: { 1: true, 2: true },
    packageUse: { 1: true }
  };
  const result = finance.refundCompletedLessonState({
    students: [
      { id: 1, balance: -1500, packageLessons: 0 },
      { id: 2, balance: -1200, packageLessons: 0 }
    ],
    txs: [],
    lesson,
    lessonStudents: [{ id: 1, rate: 1500 }, { id: 2, rate: 1200 }],
    date: '2026-05-16',
    lessonDateLabel: '16 мая',
    createId: index => 300 + index
  });
  assert.strictEqual(result.students.find(s => s.id === 1).balance, 0);
  assert.strictEqual(result.students.find(s => s.id === 1).packageLessons, 1);
  assert.strictEqual(result.students.find(s => s.id === 2).balance, 0);
  assert.strictEqual(result.txs.length, 2);
}

{
  const charged = finance.chargeNoShowState({
    students: [{ id: 1, balance: 0, packageLessons: 0 }],
    txs: [],
    lesson: { id: 104 },
    lessonStudents: [{ id: 1, rate: 1300 }],
    date: '2026-05-16',
    lessonDateLabel: '16 мая',
    createId: () => 400
  });
  assert.strictEqual(charged.students[0].balance, -1300);
  assert.strictEqual(charged.txs.length, 1);

  const removed = finance.removeLessonTransactionsState({
    students: charged.students,
    txs: charged.txs,
    lessonId: 104,
    kind: 'no_show'
  });
  assert.strictEqual(removed.students[0].balance, 0);
  assert.strictEqual(removed.txs.length, 0);
}

console.log('financeLogic tests passed');
