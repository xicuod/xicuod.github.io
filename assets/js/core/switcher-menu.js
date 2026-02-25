function computeMenuTranslation(switcher, optionsElement) {
  const switcherRect = switcher.getBoundingClientRect();
  optionsElement.style.minWidth = `${Math.max(switcherRect.width, 50)}px`;

  const isOnTop = switcher.dataset.location === 'top';
  const isOnBottom = switcher.dataset.location === 'bottom';
  const isOnBottomRight = switcher.dataset.location === 'bottom-right';
  const isRTL = document.documentElement.dir === 'rtl'

  let x = switcherRect.left;

  if (isOnTop && !isRTL || isOnBottom && isRTL || isOnBottomRight && !isRTL) {
    x = switcherRect.right - optionsElement.clientWidth;
  }

  let y = switcherRect.top - window.innerHeight - 10;

  if (isOnTop) {
    y = switcherRect.top - window.innerHeight + optionsElement.clientHeight + switcher.clientHeight + 4;
  }

  return { x: x, y: y };
}

function toggleMenu(switcher) {
  const optionsElement = switcher.nextElementSibling;
  optionsElement.classList.toggle('hx:hidden');
  const translate = computeMenuTranslation(switcher, optionsElement);
  optionsElement.style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
}

function resizeMenu(switcher) {
  const optionsElement = switcher.nextElementSibling;
  if (optionsElement.classList.contains('hx:hidden')) return;
  const translate = computeMenuTranslation(switcher, optionsElement);
  optionsElement.style.transform = `translate3d(${translate.x}px, ${translate.y}px, 0)`;
}
