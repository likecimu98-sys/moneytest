(function initFinanceLogic(root) {
  const toNumber = value => Number(value || 0);
  const txDelta = tx => tx && tx.type === 'payment' ? toNumber(tx.amount) : -toNumber(tx && tx.amount);

  const createTransaction = (data, createId = Date.now) => ({
    ...data,
    id: data && data.id !== undefined ? data.id : createId()
  });

  const createIndexedTransaction = (data, createId = Date.now, index = 0) => ({
    ...data,
    id: createId === Date.now ? Date.now() + index + Math.random() : createId(index)
  });

  const applyStudentPatch = (students, studentId, patcher) => students.map(student => {
    if (student.id !== studentId) return student;
    return patcher(student);
  });

  const applyTxToStudents = (students, tx) => applyStudentPatch(students, tx.studentId, student => ({
    ...student,
    balance: toNumber(student.balance) + txDelta(tx)
  }));

  const revertTxFromStudents = (students, tx) => applyStudentPatch(students, tx.studentId, student => ({
    ...student,
    balance: toNumber(student.balance) - txDelta(tx)
  }));

  const applyMoneyAndPackageDeltas = (students, balanceDeltas = {}, packageDeltas = {}) => students.map(student => {
    const balanceDelta = toNumber(balanceDeltas[student.id]);
    const packageDelta = toNumber(packageDeltas[student.id]);
    if (!balanceDelta && !packageDelta) return student;
    return {
      ...student,
      balance: toNumber(student.balance) + balanceDelta,
      packageLessons: Math.max(0, toNumber(student.packageLessons) + packageDelta)
    };
  });

  const lessonStudentId = entry => Number(entry.studentId ?? entry.id);
  const lessonStudentRate = entry => toNumber(entry.rate);

  const findStudent = (students, studentId) => students.find(student => student.id === studentId);

  const saveTransactionState = ({ students, txs, data, edit = null, createId = Date.now }) => {
    const nextTx = createTransaction(edit ? { ...edit, ...data } : data, createId);
    if (edit) {
      const revertedStudents = revertTxFromStudents(students, edit);
      return {
        students: applyTxToStudents(revertedStudents, nextTx),
        txs: txs.map(tx => tx.id === edit.id ? nextTx : tx),
        tx: nextTx
      };
    }
    return {
      students: applyTxToStudents(students, nextTx),
      txs: [nextTx, ...txs],
      tx: nextTx
    };
  };

  const deleteTransactionState = ({ students, txs, tx }) => {
    const withoutTx = txs.filter(item => item.id !== tx.id);
    const studentsAfterDelete = applyStudentPatch(students, tx.studentId, student => {
      const next = {
        ...student,
        balance: toNumber(student.balance) - txDelta(tx)
      };
      if (tx.kind === 'package' && tx.packageLessons) {
        next.packageLessons = Math.max(0, toNumber(student.packageLessons) - toNumber(tx.packageLessons));
      }
      return next;
    });
    return {
      students: studentsAfterDelete,
      txs: withoutTx
    };
  };

  const buyPackageState = ({ students, txs, studentId, lessonsCount, amount = 0, date, comment, createId = Date.now }) => {
    const cleanAmount = toNumber(amount);
    const cleanLessons = toNumber(lessonsCount);
    const studentsAfterPackage = applyStudentPatch(students, studentId, student => ({
      ...student,
      balance: toNumber(student.balance) + (cleanAmount > 0 ? cleanAmount : 0),
      packageLessons: toNumber(student.packageLessons) + cleanLessons
    }));
    if (cleanAmount <= 0) {
      return {
        students: studentsAfterPackage,
        txs,
        tx: null
      };
    }
    const tx = createTransaction({
      studentId,
      type: 'payment',
      amount: cleanAmount,
      date,
      comment,
      kind: 'package',
      packageLessons: cleanLessons
    }, createId);
    return {
      students: studentsAfterPackage,
      txs: [tx, ...txs],
      tx
    };
  };

  const quickDebtPaymentState = ({ students, txs, studentId, date, comment, createId = Date.now }) => {
    const student = students.find(item => item.id === studentId);
    if (!student || toNumber(student.balance) >= 0) {
      return {
        students,
        txs,
        tx: null
      };
    }
    return saveTransactionState({
      students,
      txs,
      data: {
        studentId,
        type: 'payment',
        amount: Math.abs(toNumber(student.balance)),
        date,
        comment
      },
      createId
    });
  };

  const removeLessonTransactionsState = ({ students, txs, lessonId, kind, packageUse = null }) => {
    const ownTxs = txs.filter(tx => tx.lessonId === lessonId && tx.kind === kind);
    if (!ownTxs.length && !packageUse) {
      return {
        students,
        txs,
        removedTxs: []
      };
    }
    const balanceDeltas = {};
    ownTxs.forEach(tx => {
      balanceDeltas[tx.studentId] = toNumber(balanceDeltas[tx.studentId]) - txDelta(tx);
    });
    const packageDeltas = {};
    if (packageUse) {
      Object.entries(packageUse).forEach(([studentId, used]) => {
        if (used) packageDeltas[Number(studentId)] = toNumber(packageDeltas[Number(studentId)]) + 1;
      });
    }
    return {
      students: applyMoneyAndPackageDeltas(students, balanceDeltas, packageDeltas),
      txs: txs.filter(tx => !(tx.lessonId === lessonId && tx.kind === kind)),
      removedTxs: ownTxs
    };
  };

  const chargeNoShowState = ({ students, txs, lesson, lessonStudents, date, lessonDateLabel, createId = Date.now }) => {
    if (txs.some(tx => tx.lessonId === lesson.id && tx.kind === 'no_show')) {
      return {
        students,
        txs,
        addedTxs: []
      };
    }
    const charges = lessonStudents.map((entry, index) => createIndexedTransaction({
      studentId: lessonStudentId(entry),
      type: 'charge',
      amount: lessonStudentRate(entry),
      date,
      comment: `Неявка: ${lessonDateLabel}`,
      lessonId: lesson.id,
      kind: 'no_show'
    }, createId, index));
    const balanceDeltas = {};
    charges.forEach(tx => {
      balanceDeltas[tx.studentId] = toNumber(balanceDeltas[tx.studentId]) + txDelta(tx);
    });
    return {
      students: applyMoneyAndPackageDeltas(students, balanceDeltas),
      txs: [...charges, ...txs],
      addedTxs: charges
    };
  };

  const saveAttendanceState = ({ students, txs, lesson, lessonStudents, newAttendance, date, lessonDateLabel, createId = Date.now }) => {
    const oldAttendance = lesson.status === 'completed' && lesson.attendance ? lesson.attendance : {};
    const oldPackageUse = lesson.packageUse || {};
    const nextPackageUse = {
      ...oldPackageUse
    };
    const addedTxs = [];
    const balanceDeltas = {};
    const packageDeltas = {};

    lessonStudents.forEach(entry => {
      const studentId = lessonStudentId(entry);
      const student = findStudent(students, studentId);
      if (!student) return;
      const wasPresent = !!oldAttendance[studentId];
      const isPresent = !!newAttendance[studentId];
      const rate = lessonStudentRate(entry);
      const packageAvailable = toNumber(student.packageLessons) + toNumber(packageDeltas[studentId]);

      if (lesson.status === 'planned') {
        if (!isPresent) return;
        if (packageAvailable > 0) {
          packageDeltas[studentId] = toNumber(packageDeltas[studentId]) - 1;
          nextPackageUse[studentId] = true;
        } else {
          delete nextPackageUse[studentId];
        }
        addedTxs.push(createIndexedTransaction({
          studentId,
          type: 'charge',
          amount: rate,
          date,
          comment: packageAvailable > 0 ? `Урок по абонементу: ${lessonDateLabel}` : `Урок: ${lessonDateLabel}`,
          lessonId: lesson.id,
          kind: 'attendance'
        }, createId, addedTxs.length));
        balanceDeltas[studentId] = toNumber(balanceDeltas[studentId]) - rate;
        return;
      }

      if (wasPresent === isPresent) return;
      if (wasPresent && !isPresent) {
        if (oldPackageUse[studentId]) {
          packageDeltas[studentId] = toNumber(packageDeltas[studentId]) + 1;
          delete nextPackageUse[studentId];
        }
        addedTxs.push(createIndexedTransaction({
          studentId,
          type: 'payment',
          amount: rate,
          date,
          comment: oldPackageUse[studentId] ? `Возврат урока по абонементу: ${lessonDateLabel}` : `Возврат (отсутствовал): ${lessonDateLabel}`,
          lessonId: lesson.id,
          kind: 'attendance'
        }, createId, addedTxs.length));
        balanceDeltas[studentId] = toNumber(balanceDeltas[studentId]) + rate;
        return;
      }

      if (packageAvailable > 0) {
        packageDeltas[studentId] = toNumber(packageDeltas[studentId]) - 1;
        nextPackageUse[studentId] = true;
      } else {
        delete nextPackageUse[studentId];
      }
      addedTxs.push(createIndexedTransaction({
        studentId,
        type: 'charge',
        amount: rate,
        date,
        comment: packageAvailable > 0 ? `Доп. списание по абонементу: ${lessonDateLabel}` : `Доп. списание (пришёл): ${lessonDateLabel}`,
        lessonId: lesson.id,
        kind: 'attendance'
      }, createId, addedTxs.length));
      balanceDeltas[studentId] = toNumber(balanceDeltas[studentId]) - rate;
    });

    return {
      students: applyMoneyAndPackageDeltas(students, balanceDeltas, packageDeltas),
      txs: addedTxs.length ? [...addedTxs, ...txs] : txs,
      addedTxs,
      packageUse: nextPackageUse
    };
  };

  const refundCompletedLessonState = ({ students, txs, lesson, lessonStudents, date, lessonDateLabel, createId = Date.now }) => {
    const refunds = [];
    const balanceDeltas = {};
    const packageDeltas = {};
    const packageUse = lesson.packageUse || {};
    Object.entries(lesson.attendance || {}).forEach(([rawStudentId, present]) => {
      if (!present) return;
      const studentId = Number(rawStudentId);
      const entry = lessonStudents.find(item => lessonStudentId(item) === studentId);
      if (!entry) return;
      const rate = lessonStudentRate(entry);
      if (packageUse[studentId]) {
        packageDeltas[studentId] = toNumber(packageDeltas[studentId]) + 1;
      }
      refunds.push(createIndexedTransaction({
        studentId,
        type: 'payment',
        amount: rate,
        date,
        comment: packageUse[studentId] ? `Возврат урока по абонементу: ${lessonDateLabel}` : `Отмена: ${lessonDateLabel}`,
        lessonId: lesson.id,
        kind: 'attendance'
      }, createId, refunds.length));
      balanceDeltas[studentId] = toNumber(balanceDeltas[studentId]) + rate;
    });
    return {
      students: applyMoneyAndPackageDeltas(students, balanceDeltas, packageDeltas),
      txs: refunds.length ? [...refunds, ...txs] : txs,
      addedTxs: refunds
    };
  };

  const api = {
    txDelta,
    createTransaction,
    applyTxToStudents,
    revertTxFromStudents,
    saveTransactionState,
    deleteTransactionState,
    buyPackageState,
    quickDebtPaymentState,
    removeLessonTransactionsState,
    chargeNoShowState,
    saveAttendanceState,
    refundCompletedLessonState
  };

  root.TutorFinanceLogic = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
