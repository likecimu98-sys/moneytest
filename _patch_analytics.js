const fs = require('fs');
const p = __dirname + '/app.js';
let src = fs.readFileSync(p, 'utf8');

function cut(from, to, label) {
  const i = src.indexOf(from);
  if (i < 0) throw new Error('not found (from): ' + label);
  const j = src.indexOf(to, i);
  if (j < 0) throw new Error('not found (to): ' + label);
  src = src.slice(0, i) + src.slice(j);
}
function replaceOnce(from, to, label) {
  const i = src.indexOf(from);
  if (i < 0) throw new Error('not found: ' + label);
  if (src.indexOf(from, i + from.length) >= 0) throw new Error('not unique: ' + label);
  src = src.slice(0, i) + to + src.slice(i + from.length);
}

// 1. goalEdit state
replaceOnce(
  "const [analyticsPeriod, setAnalyticsPeriod] = useState('current_month');",
  "const [analyticsPeriod, setAnalyticsPeriod] = useState('current_month');\n    const [goalEdit, setGoalEdit] = useState(false);",
  'goalEdit state'
);

// 2. user-defined goal
replaceOnce(
  'const periodGoal = totalRealistic <= 100000 ? 100000 : Math.ceil(totalRealistic / 50000) * 50000;',
  'const periodGoal = Math.max(0, Math.round(Number(settings.monthlyGoal) || 0));',
  'periodGoal'
);

// 3. dead computations
cut('    const debtAgeRows = balanceSummaries', '    const cashGap = ', 'debtAgeRows..riskRows');
cut('    const paymentCoverage = ', '    const revenueRows = ', 'paymentCoverage');
cut('    const dependencyTone = ', '    const realisticForecast = ', 'dependencyTone..cautiousForecast');
cut('    const idealForecast = ', '    const weekKey = ', 'idealForecast..cashForecastText');
cut('    const recoverableLost = ', '    const Stat = ({', 'recoverableLost..insightCards');

// 4. replace AnalyticsTab entirely
const start = src.indexOf('const AnalyticsTab = () =>');
if (start < 0) throw new Error('AnalyticsTab start not found');
const endMarker = 'return _jsxs("div", {\n      className: "finance-page",';
const end = src.indexOf(endMarker, start);
if (end < 0) throw new Error('AnalyticsTab end not found');

const newTab = `const AnalyticsTab = () => {
      const monthPeriod = analyticsPeriod === 'current_month' || analyticsPeriod === 'last_month' || analyticsPeriod === 'next_month';
      const attendancePct = totalScheduled > 0 ? Math.round((1 - avgSkipRate) * 100) : null;
      const factPct = periodGoal > 0 ? Math.min(100, Math.round(periodEarned / periodGoal * 100)) : 0;
      const goalPct = periodGoal > 0 ? Math.min(100, Math.round(totalRealistic / periodGoal * 100)) : 0;
      const topStudents = revenueRows.slice(0, 5);
      const maxTopEarned = Math.max(...topStudents.map(r => r.earned), 1);
      const saveGoal = e => {
        e.preventDefault();
        const v = Math.max(0, Math.round(Number(new FormData(e.target).get('goal')) || 0));
        setSettings({
          ...settings,
          monthlyGoal: v
        });
        setGoalEdit(false);
      };
      const advice = [];
      if (debt > 0) advice.push({
        tone: 'hot',
        title: \`Собрать долги: \${money(debt)}\`,
        text: oldDebt > 0 ? \`\${money(oldDebt)} висит дольше 14 дней. Чем старше долг, тем труднее его вернуть — напомните сегодня.\` : \`\${debtors.length} \${plural(debtors.length, 'должник', 'должника', 'должников')}. Готовый текст напоминания — в карточке ученика.\`
      });
      if (periodLost > 0 && periodLost >= periodEarned * 0.05) advice.push({
        tone: 'warn',
        title: \`Пропуски съели \${money(periodLost)}\`,
        text: 'Помогает правило: отмена позже, чем за 24 часа — урок оплачивается. Предупредите учеников заранее.'
      });
      if (lowPackages.length > 0) advice.push({
        tone: 'warn',
        title: 'Абонементы заканчиваются',
        text: \`\${lowPackages.map(s => s.name).join(', ')} — предложите продление заранее, чтобы занятия не прервались.\`
      });
      if (revenueRows.length >= 4 && topRevenueShare >= 0.5) advice.push({
        tone: 'info',
        title: \`\${topRevenueLabel} дохода дают 3 ученика\`,
        text: 'Если один уйдёт, доход заметно просядет. Подстраховка — один-два новых ученика или мини-группа.'
      });
      if (priceStepEffect > 0 && avgSkipRate <= 0.1 && totalScheduled >= 10) advice.push({
        tone: 'good',
        title: \`+200 ₽ к ставке = ещё \${money(priceStepEffect)}\`,
        text: \`Посещаемость \${attendancePct}% — вас ценят. Поднимать цену раз в год — нормальная практика.\`
      });
      if (!advice.length) advice.push({
        tone: 'good',
        title: 'Финансы в полном порядке',
        text: 'Долгов нет, пропуски не съедают доход. Хороший момент взять нового ученика или поднять ставку.'
      });
      return _jsxs("div", {
        children: [_jsxs("div", {
          className: "fin-hero",
          children: [_jsx("div", {
            className: "metric-label",
            children: "Заработано за период"
          }), _jsx("div", {
            className: "fin-hero-value",
            children: money(periodEarned)
          }), _jsxs("div", {
            className: "fin-hero-subrow",
            children: [_jsxs("span", {
              children: ["оплатами пришло ", _jsx("b", {
                children: money(actualPayments)
              })]
            }), periodPlanned.length > 0 && _jsxs("span", {
              children: ["прогноз к концу ≈ ", _jsx("b", {
                children: money(realisticForecast)
              })]
            })]
          })]
        }), monthPeriod && _jsxs("div", {
          className: "finance-panel fin-goal-panel",
          children: [_jsxs("div", {
            className: "fin-goal-head",
            children: [_jsx("div", {
              className: "finance-section-title compact",
              style: {
                margin: 0
              },
              children: "МОЯ ЦЕЛЬ НА МЕСЯЦ"
            }), periodGoal > 0 && !goalEdit && _jsx("button", {
              type: "button",
              className: "btn btn-sm btn-white",
              onClick: () => setGoalEdit(true),
              children: "Изменить"
            })]
          }), periodGoal > 0 && !goalEdit ? _jsxs(_Fragment, {
            children: [_jsxs("div", {
              className: "finance-goal-head",
              children: [_jsxs("div", {
                children: [_jsx("span", {
                  children: "Факт"
                }), _jsx("strong", {
                  children: money(periodEarned)
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
                  width: \`\${factPct}%\`
                }
              })
            }), _jsx("div", {
              className: "finance-goal-note",
              children: goalGap > 0 ? \`Прогноз ≈ \${money(realisticForecast)} — это \${goalPct}% цели. Не хватает \${money(goalGap)}, примерно \${pluralLessons(lessonsToGoal)}.\` : 'Прогноз уже выше цели. Можно поднять планку — кнопка «Изменить».'
            })]
          }) : _jsxs("form", {
            className: "fin-goal-form",
            onSubmit: saveGoal,
            children: [_jsx("input", {
              className: "input",
              name: "goal",
              type: "number",
              min: 0,
              step: 1000,
              defaultValue: periodGoal || '',
              placeholder: "например, 80000"
            }), _jsx("button", {
              className: "btn btn-black",
              type: "submit",
              children: "Сохранить"
            }), _jsx("div", {
              className: "metric-sub",
              style: {
                gridColumn: '1 / -1',
                margin: 0
              },
              children: "Сколько хотите зарабатывать в месяц. Цель видите только вы."
            })]
          })]
        }), _jsx("div", {
          className: "finance-section-title",
          children: "СОВЕТЫ ПО ДЕНЬГАМ"
        }), _jsx("div", {
          className: "fin-advice-list",
          children: advice.slice(0, 4).map(a => _jsxs("div", {
            className: \`fin-advice \${a.tone}\`,
            children: [_jsx("strong", {
              children: a.title
            }), _jsx("span", {
              children: a.text
            })]
          }, a.title))
        }), weekForecastRows.length > 1 && _jsxs("div", {
          className: "finance-panel",
          children: [_jsx("div", {
            className: "finance-section-title compact",
            children: "ДОХОД ПО НЕДЕЛЯМ"
          }), _jsx("div", {
            className: "finance-week-bars",
            children: weekForecastRows.map(row => _jsxs("div", {
              className: "finance-week-row",
              children: [_jsx("span", {
                children: row.label
              }), _jsxs("div", {
                children: [_jsx("i", {
                  style: {
                    width: \`\${row.fact / maxWeekForecast * 100}%\`
                  }
                }), _jsx("b", {
                  style: {
                    width: \`\${row.plan / maxWeekForecast * 100}%\`
                  }
                })]
              }), _jsx("strong", {
                children: money(Math.round(row.fact + row.plan))
              })]
            }, row.key))
          }), _jsxs("div", {
            className: "fin-week-legend",
            children: [_jsxs("span", {
              children: [_jsx("i", {}), "проведено"]
            }), _jsxs("span", {
              children: [_jsx("b", {}), "запланировано"]
            })]
          })]
        }), _jsxs("div", {
          className: "finance-split-grid",
          children: [(() => {
            const subjectMap = {};
            periodCompleted.forEach(lesson => {
              const subject = getLessonSubject(lesson, groups);
              if (!subjectMap[subject]) subjectMap[subject] = {
                subject,
                lessons: 0,
                earned: 0
              };
              const row = subjectMap[subject];
              row.lessons += 1;
              getLessonStudents(lesson, students, groups, {
                includeArchived: true
              }).forEach(s => {
                const rate = getLessonRate(lesson, s, groups);
                const present = lesson.status !== 'no_show' && lesson.attendance?.[s.id] !== false;
                if (present) row.earned += rate;
              });
            });
            const rows = Object.values(subjectMap).sort((a, b) => b.earned - a.earned || b.lessons - a.lessons).slice(0, 6);
            const maxEarned = Math.max(...rows.map(r => r.earned), 1);
            return _jsxs("div", {
              className: "finance-panel finance-subject-panel",
              children: [_jsx("div", {
                className: "finance-section-title compact",
                children: "ПО ПРЕДМЕТАМ"
              }), rows.length ? _jsx("div", {
                className: "finance-subject-list",
                children: rows.map(r => _jsxs("div", {
                  className: "finance-subject-row",
                  children: [_jsxs("div", {
                    className: "finance-subject-head",
                    children: [_jsx("strong", {
                      children: r.subject
                    }), _jsx("span", {
                      children: pluralLessons(r.lessons)
                    })]
                  }), _jsx("div", {
                    className: "finance-subject-money",
                    children: _jsxs("b", {
                      children: [r.earned.toLocaleString(), " ₽"]
                    })
                  }), _jsx("div", {
                    className: "finance-subject-track",
                    children: _jsx("div", {
                      style: {
                        width: \`\${Math.max(6, r.earned / maxEarned * 100)}%\`
                      }
                    })
                  })]
                }, r.subject))
              }) : _jsx("div", {
                className: "metric-sub",
                children: "Нет проведённых уроков за период"
              })]
            });
          })(), _jsxs("div", {
            className: "finance-panel",
            children: [_jsx("div", {
              className: "finance-section-title compact",
              children: "ТОП УЧЕНИКОВ"
            }), topStudents.length ? _jsx("div", {
              className: "finance-dependency-list",
              children: topStudents.map(row => _jsxs("div", {
                className: "finance-dependency-row",
                children: [_jsx("span", {
                  children: row.name
                }), _jsx("div", {
                  children: _jsx("i", {
                    style: {
                      width: \`\${Math.max(5, row.earned / maxTopEarned * 100)}%\`
                    }
                  })
                }), _jsx("strong", {
                  children: money(row.earned)
                })]
              }, row.id))
            }) : _jsx("div", {
              className: "metric-sub",
              children: "Нет проведённых уроков за период"
            }), revenueRows.length >= 4 && topRevenueShare >= 0.5 && _jsxs("div", {
              className: "metric-sub",
              style: {
                marginTop: 8
              },
              children: ["Топ-3 дают ", topRevenueLabel, " всего дохода"]
            })]
          })]
        }), _jsx("div", {
          className: "finance-section-title",
          children: "КЛЮЧЕВЫЕ ЦИФРЫ"
        }), _jsxs("div", {
          className: "crm-dashboard",
          children: [_jsx(Stat, {
            label: "Проведено уроков",
            value: String(periodCompleted.length),
            sub: "за выбранный период"
          }), _jsx(Stat, {
            label: "Средний чек",
            value: \`\${averageSeatRate.toLocaleString()} ₽\`,
            sub: "за занятие одного ученика"
          }), _jsx(Stat, {
            label: "Посещаемость",
            value: attendancePct === null ? '—' : \`\${attendancePct}%\`,
            color: attendancePct !== null && attendancePct >= 90 ? '#2f9e68' : undefined,
            sub: "за всё время"
          }), _jsx(Stat, {
            label: "Потери на пропусках",
            value: \`\${periodLost.toLocaleString()} ₽\`,
            color: periodLost > 0 ? '#dc4c4c' : undefined,
            sub: "за выбранный период"
          })]
        })]
      });
    };
    `;

src = src.slice(0, start) + newTab + src.slice(end);
fs.writeFileSync(p, src, 'utf8');
console.log('patched OK');
