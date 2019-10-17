/*
 * Fetchs and reads choices file.
 * Input:
 * - filename (string): name of choices file
 * Output:
 * - text (string): contents of choices file
 */
async function getFile(filename) {
	const hostname = document.location.hostname;
	const pathname = document.location.pathname;
	const url = `https://${hostname}${pathname}${filename}`;
	const res = await fetch(url);
	return res.text();
}

/*
 * Populates the list of choices.
 * Must be called before events are attached to elements.
 * Input:
 * - text (string): contents of choices file
 * Output:
 * - choiceList (array): choice records
 */
function makeChoices(text) {
	const choiceContainerEl = document.getElementById('choice-container');
	const lines = text.trim().split('\n').filter(line => line.trim().length > 0);
	const choiceList = lines.map((choiceDisplay, i) => {
		const choiceId = `choice_holder_el_${i}`;
		const choiceEl = document.createElement('div');
		choiceEl.setAttribute('id', choiceId);
		choiceEl.classList.add('choice-holder');
		choiceEl.innerText = choiceDisplay;
		choiceContainerEl.appendChild(choiceEl);
		const choiceText = choiceDisplay.toLocaleLowerCase();
		return {choiceId, choiceText};
	});
	return choiceList;
}

/*
 * Starts search bar for choices
 * Input:
 * - text (string): contents of choices file
 */
function initSearch(choiceList) {
	const searchEl = document.getElementById('search-choices');
	const searchNoteEl = document.getElementById('search-note');
	searchEl.addEventListener('input', (e) => {
		const queryText = searchEl.value;
		const count = choiceList.reduce((agg, choice) => {
			const isMatch = choice.choiceText.includes(queryText);
			const choiceEl = document.getElementById(choice.choiceId);
			const isHidden = choiceEl.classList.contains('hidden');
			if (isMatch & isHidden) {
				choiceEl.classList.remove('hidden');
			}
			else if (!isMatch && !isHidden) {
				choiceEl.classList.add('hidden');
			}
			return agg + (isMatch ? 1 : 0);
		}, 0);
		if (queryText.length > 0) {
			const countNote = `Found ${count} result${count === 1 ? '' : 's'}.`;
			searchNoteEl.innerText = countNote;
			searchNoteEl.classList.remove('hidden');
		} else {
			searchNoteEl.classList.add('hidden');
		}
	});
}

/*
 * Sets drag and drop events for choices and ranks.
 */
function initDraggable() {
	const rankEls = Array.from(document.querySelectorAll('.rank-holder'));
	rankEls.forEach((rankEl) => {
		rankEl.addEventListener('dragover', (e) => {
			e.preventDefault();
		});
		rankEl.addEventListener('drop', (e) => {
			e.preventDefault();
			const itemEl = rankEl.querySelector('.rank-item');
			if (itemEl.childElementCount == 0) {
				const choiceId = e.dataTransfer.getData('choiceId');
				const choiceEl = document.getElementById(choiceId);
				itemEl.appendChild(choiceEl);
			}
		});
	});

	const choiceContainerEl = document.getElementById('choice-container');
	choiceContainerEl.addEventListener('dragover', (e) => {
		e.preventDefault();
	});
	choiceContainerEl.addEventListener('drop', (e) => {
		e.preventDefault();
		const choiceId = e.dataTransfer.getData('choiceId');
		const choiceEl = document.getElementById(choiceId);
		choiceContainerEl.prepend(choiceEl);
	});

	const choiceEls = Array.from(document.querySelectorAll('.choice-holder'));
	choiceEls.forEach((choiceEl, i) => {
		choiceEl.setAttribute('draggable', true);
		choiceEl.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('choiceId', choiceEl.getAttribute('id'));
			choiceEl.classList.add('dragging');
		});
		choiceEl.addEventListener('dragend', (e) => {
			choiceEl.classList.remove('dragging');
		});
	});
}

// Set up web page
getFile('choices.txt').then((text) => {
	const choiceList = makeChoices(text);
	initSearch(choiceList);
	initDraggable();
});
