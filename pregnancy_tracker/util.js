// https://stackoverflow.com/a/31615643/6894436
function nth(n) {
	var s = ["th", "st", "nd", "rd"],
		v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function scrollTo(e) {
	e.preventDefault();
	
	const theadHeight = document.querySelector('.table-tracker > thead').clientHeight;
	const navTarget = e.target.getAttribute('data-nav');
	
	const top = navTarget === 'top'
		? 0
		: document.querySelector(`[data-row-nav="${navTarget}"]`).getBoundingClientRect().top + window.scrollY - theadHeight;

	window.scroll({
		top,
		behavior: 'smooth',
	});
}

function buildElement(el, options) {
	const element = document.createElement(el);
	if (options?.innerHTML != null) {
		element.innerHTML = options.innerHTML;
	}
	if (options?.textContent != null) {
		element.textContent = options.textContent;
	}
	if (options?.classes?.length > 0) {
		element.classList.add(...options.classes);
	}
	if (options?.attributes?.length > 0) {
		options.attributes.forEach(([key, value]) => element.setAttribute(key, value));
	}
	if (options?.listeners?.length > 0) {
		options.listeners.forEach(({ trigger, action }) => element.addEventListener(trigger, action));
	}
	if (options?.children?.length > 0) {
		options.children.forEach(child => element.appendChild(child));
	}
	return element;
}