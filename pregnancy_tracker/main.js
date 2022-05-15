const DateTime = luxon.DateTime;
const localStorageKey = 'pregnancy-tracker';
const PREGNANCY_LENGTH_DAYS = 280;

let dueDate;
let tableData;
let popup;

function init() {
	const dueDateInput = document.getElementById('due-date-input');
	document.getElementById('form-due-date')
		.addEventListener('submit', e => {
			saveDueDate(dueDateInput.value);
			dueDate = DateTime.fromISO(dueDateInput.value);
			calculateTableData();
			updateTable();
			updateCalendar();
			e.preventDefault();
		});

	document.getElementById('btn-reset').addEventListener('click', reset);
	document.addEventListener('click', closeDayDetails);

	buildWeekNav();

	dueDateInput.value = getSavedData()?.dueDate ?? '';
	if (dueDateInput.value.length) {
		dueDate = DateTime.fromISO(dueDateInput.value);
		calculateTableData();
		updateTable();
		updateCalendar();
	}

	setTimeout(() => document.body.classList.add('show'));
}

function buildWeekNav() {
	const ul = document.getElementById('nav-weeks');
	for (let weekNo = 5; weekNo < 40; weekNo += 5) {
		const li = document.createElement('li');

		const a = buildElement('a', {
			textContent: nth(weekNo) + ' Week',
			classes: ['nav-link'],
			attributes: [
				['data-nav', 'week-' + weekNo]
			],
		});

		li.appendChild(a);
		ul.appendChild(li);
	}

	document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', scrollTo));
}

function getSavedData() {
	if (localStorage.getItem(localStorageKey)) {
		return JSON.parse(localStorage.getItem(localStorageKey));
	}
	return {};
}

function saveDueDate(dueDate) {
	if (!/\d{4}-\d{2}-\d{2}/.test(dueDate)) {
		throw new Error('Invalid due date');
	}

	const data = {
		...getSavedData(),
		dueDate
	};

	localStorage.setItem(localStorageKey, JSON.stringify(data));
}

function saveNote(dayGest, note) {
	if (dayGest == null) return;

	const data = getSavedData();
	if (data.notes == null) {
		data.notes = [];
	}
	const existingNote = data.notes.find(note => note.dayGest === dayGest);
	if (existingNote) {
		existingNote.note = note;
	} else {
		data.notes.push({ dayGest, note });
	}
	localStorage.setItem(localStorageKey, JSON.stringify(data));
}

function updateTable() {
	const today = DateTime.now();
	
	// Build the table
	const table = document.getElementById('table-tracker');
	const tbody = table.getElementsByTagName('tbody')[0];
	tbody.innerHTML = '';

	for (const record of tableData) {
		const row = buildElement('tr', {
			classes: record.weekNo % 2 === 0 ? ['row-shaded'] : [],
			children: [
				// Date
				buildElement('td', {
					textContent: record.date.toLocaleString({ month: 'short', day: 'numeric', weekday: 'short' }),
					classes: ['col-date'],
				}),

				// Week Number
				buildElement('td', {
					textContent: nth(record.weekNo),
					classes: ['col-week-no'],
				}),

				// Day of Gestation
				buildElement('td', {
					textContent: record.dayGest,
					classes: ['col-day-gest'],
				}),

				// Day of Fertilization
				buildElement('td', {
					textContent: record.dayFert,
					classes: ['col-day-fert'],
				}),

				// Age of Pregnancy
				buildElement('td', {
					textContent: record.agePreg,
					classes: ['col-age-pregnancy'],
				}),

				// Age of Conceptus
				buildElement('td', {
					textContent: record.ageConc,
					classes: ['col-age-conceptus'],
				}),

				// Countdown
				buildElement('td', {
					textContent: record.countdown,
					classes: ['col-countdown'],
				}),

				// Note
				buildElement('td', {
					innerHTML: record.note ?? '',
					classes: ['col-notes'],
					attributes: [
						['contentEditable', 'true'],
					],
					listeners: [
						{ trigger: 'blur', action: e => saveNote(record.dayGest, e.target.innerHTML) },
					]
				})
			]
		})

		if (record.date.toLocaleString() === today.toLocaleString()) {
			row.classList.add('row-today');
			row.setAttribute('data-row-nav', 'today');
		} else if (record.date.toLocaleString() === dueDate.toLocaleString()) {
			row.classList.add('row-due-date');
			row.setAttribute('data-row-nav', 'due-date');
		} else {
			row.setAttribute('data-row-nav', 'week-' + record.weekNo);
		}

		tbody.appendChild(row);
	}

	document.getElementById('main').classList.remove('empty');
}

function calculateTableData() {
	const savedData = getSavedData();

	// Calculate 40 weeks of gestation + one additional week
	tableData = [];
	for (let week = 0; week < 41; week++) {

		for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
			
			// Day of Gestation
			const dayGest = (week * 7) + dayOfWeek;

			// Countdown to Due Date
			const countdownDays = PREGNANCY_LENGTH_DAYS - dayGest;

			// Date
			const date = dueDate.minus({ days: countdownDays });

			// Week Number
			const weekNo = week + 1;

			// Day of Fertilization
			const dayFert = dayGest < 13 ? null : dayGest - 13;

			// Age of Pregnancy
			const agePregWeeks = Math.floor(dayGest / 7);
			const agePregDays = dayGest % 7;
			const agePreg = `${agePregWeeks} week${agePregWeeks === 1 ? '' : 's'}, ${agePregDays} day${agePregDays === 1 ? '' : 's'}`;

			// Age of Embryo/Fetus (Conceptus)
			const ageConcWeeks = Math.floor(dayFert / 7);
			const ageConcDays = dayFert % 7;
			const ageConc = dayFert == null 
				? null 
				: `${ageConcWeeks} week${ageConcWeeks === 1 ? '' : 's'}, ${ageConcDays} day${ageConcDays === 1 ? '' : 's'}`;

			const countdown = countdownDays < 1 ? null : countdownDays + (countdownDays === 1 ? ' day' : ' days');

			// Saved note
			let note = (savedData?.notes ?? []).find(note => note.dayGest === dayGest)?.note;
			if (!note) {
				if (agePregWeeks === 13 && agePregDays === 0) {
					note = '2nd Trimester Begins';
				} else if (agePregWeeks === 28 && agePregDays === 0) {
					note = '3rd Trimester Begins';
				}
			}

			tableData.push({
				date,
				weekNo,
				dayGest,
				dayFert,
				agePreg,
				ageConc,
				countdown,
				note,
			});
		}
	}
}

function updateCalendar() {
	const today = DateTime.now();
	const data = groupByMonth(tableData);
	console.log(data);

	const container = document.querySelector('[data-calendar]');
	container.innerHTML = '';

	for (const monthData of data) {
		const monthContainer = buildElement('div', {
			classes: ['month-container'],
			children: [
				// Month header
				buildElement('div', {
					textContent: monthData.month.toLocaleString({ month: 'long', year: 'numeric' }),
					classes: ['month-header'],
				}),

				// Month weekdays
				buildElement('div', {
					classes: ['month-weekdays', 'grid-calendar'],
					children: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
						.map(textContent => buildElement('div', { textContent })),
				}),

				// Month calendar days
				buildElement('div', {
					classes: ['month-days', 'grid-calendar'],
					children: [
						// Padding days
						...Array(monthData.days[0].date.weekday).fill(null).map(() => buildElement('div')),

						// Actual days in the month
						...monthData.days.map(dayData => {
							const calendarDay = buildElement('div', {
								textContent: dayData.date.day,
								classes: ['calendar-day'],
								listeners: dayData.dayGest != null ? [
									{ trigger: 'click', action: e => openDayDetails(dayData, e) }
								] : []
							});

							if (dayData.dayGest != null) {
								calendarDay.classList.add('pregnancy-day');
							}
							if (dayData.date.toLocaleString() === dueDate.toLocaleString()) {
								calendarDay.classList.add('due-date');
							}
							if (dayData.date.toLocaleString() === today.toLocaleString()) {
								calendarDay.classList.add('today');
							}
							if (dayData.note) {
								calendarDay.classList.add('has-note');
							}

							return calendarDay;
						})
					]
				}),
			]
		});

		container.appendChild(monthContainer);
	}
}

function groupByMonth(tableData) {
	const data = [];
	
	// Group into months
	for (const month of Array.from(new Set(tableData.map(tableRow => tableRow.date.month)))) {
		const days = tableData.filter(tableDatum => tableDatum.date.month === month);
		const firstDate = days[0].date;
		const lastDate = days[days.length - 1].date;

		// Include each day in the month, even if start date or due date are in the middle.
		if (firstDate.day !== 1) {
			for (let d = firstDate.day - 1; d > 0; d--) {
				days.unshift({
					date: firstDate.set({ day: d })
				});
			}
		}

		if (lastDate.day !== lastDate.daysInMonth) {
			for (let d = lastDate.day + 1; d <= lastDate.daysInMonth; d++) {
				days.push({
					date: lastDate.set({ day: d })
				});
			}
		}

		data.push({
			month: firstDate,
			days,
		});
	}

	return data;
}

function openDayDetails(dayData, e) {
	console.log(dayData);
	closeDayDetails();
	e.target.classList.add('active');
	e.stopPropagation();

	popup = buildElement('div', {
		classes: ['popup'],
		listeners: [
			{ trigger: 'click', action: e => e.stopPropagation() },
		],
		children: [
			buildElement('h4', {
				textContent: dayData.date.toLocaleString(DateTime.DATE_HUGE),
			}),

			// Data paragraph lines
			...[
				`<strong>${nth(dayData.weekNo)}</strong> Week`,
				`<strong>${nth(dayData.dayGest)}</strong> Day of Gestation`,
				`Pregnancy is <strong>${dayData.agePreg}</strong> old`,
				`Conceptus is <strong>${dayData.ageConc}</strong> old`,
				dayData.countdown == null ? null : `<strong>${dayData.countdown}</strong> until due date`,
				`Know more.`,
			].filter(line => line != null).map(innerHTML => buildElement('p', { innerHTML })),

			// Note
			buildElement('div', {
				classes: ['note'],
				innerHTML: dayData.note ?? '',
				attributes: [
					['contentEditable', 'true']
				],
				listeners: [
					{ 
						trigger: 'blur', 
						action: e => {
							saveNote(dayData.dayGest, e.target.innerHTML);
							dayData.note = e.target.innerHTML;
							note.innerHTML = dayData.note ?? '';
						}
					}
				]
			})
		]
	});

	// Position the popup
	const { top, left, width } = e.target.getBoundingClientRect();
	popup.style.left = left + width + 4 + 'px';
	popup.style.top = top + 'px';
	document.body.appendChild(popup);
}

function closeDayDetails() {
	document.querySelectorAll('.pregnancy-day').forEach(el => el.classList.remove('active'));
	popup?.remove();
}

function reset() {
	const input = document.getElementById('due-date-input');
	input.value = '';
	localStorage.removeItem(localStorageKey);
	const table = document.getElementById('table-tracker');
	table.getElementsByTagName('tbody')[0].innerHTML = '';
	document.getElementById('main').classList.add('empty');
	input.focus();
}

document.addEventListener('DOMContentLoaded', init);