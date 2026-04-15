/**
 * Section Picker — injects a highlight script into the page iframe.
 *
 * When section-pick mode is active, the iframe script:
 * 1. Highlights hovered elements with a primary-colored overlay
 * 2. On click, extracts the element's tag, class, text content, and
 *    a short description, then sends it to the parent via postMessage.
 *
 * The parent receives: { type: "SECTION_PICKED", pageId, sectionLabel, sectionHtml }
 */

export const SECTION_PICKER_SCRIPT = `
(function() {
  var overlay = null;
  var active = false;

  function getLabel(el) {
    // Build a human-readable label from the element
    var tag = el.tagName.toLowerCase();
    var id = el.id ? '#' + el.id : '';
    var cls = Array.from(el.classList)
      .filter(function(c) { return c.length < 30; })
      .slice(0, 3)
      .join(' ');

    // Try to get meaningful text
    var text = (el.innerText || '').trim().slice(0, 60);
    if (text) return text;

    // Fall back to semantic role
    var roles = {
      nav: 'Navigation',
      header: 'Header',
      footer: 'Footer',
      main: 'Main content',
      section: 'Section',
      article: 'Article',
      aside: 'Sidebar',
      form: 'Form',
      button: 'Button',
      a: 'Link',
      img: 'Image',
      h1: 'Heading 1',
      h2: 'Heading 2',
      h3: 'Heading 3',
      ul: 'List',
      table: 'Table',
    };
    return roles[tag] || (tag + (id || (cls ? ' .' + cls.split(' ')[0] : '')));
  }

  function getOuterHtmlSnippet(el) {
    // Return a trimmed snippet of the outer HTML (max 3000 chars)
    var html = el.outerHTML || '';
    return html.length > 3000 ? html.slice(0, 3000) + '...' : html;
  }

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed',
      'pointer-events:none',
      'z-index:2147483647',
      'border:2px solid rgba(99,102,241,0.9)',
      'background:rgba(99,102,241,0.08)',
      'border-radius:4px',
      'transition:all 0.1s ease',
      'display:none',
    ].join(';');
    document.body.appendChild(overlay);
  }

  function positionOverlay(el) {
    var rect = el.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.top    = (rect.top    + window.scrollY) + 'px';
    overlay.style.left   = (rect.left   + window.scrollX) + 'px';
    overlay.style.width  = rect.width  + 'px';
    overlay.style.height = rect.height + 'px';
  }

  function hideOverlay() {
    if (overlay) overlay.style.display = 'none';
  }

  // Minimum meaningful element size (skip tiny spans etc.)
  function isMeaningful(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 40 && rect.height > 20;
  }

  function findBestTarget(el) {
    // Walk up to find a meaningful container
    var current = el;
    while (current && current !== document.body) {
      if (isMeaningful(current)) return current;
      current = current.parentElement;
    }
    return el;
  }

  function onMouseMove(e) {
    if (!active) return;
    var target = findBestTarget(e.target);
    if (target) positionOverlay(target);
  }

  function onClick(e) {
    if (!active) return;
    e.preventDefault();
    e.stopPropagation();

    var target = findBestTarget(e.target);
    var label = getLabel(target);
    var html = getOuterHtmlSnippet(target);

    window.parent.postMessage({
      type: 'SECTION_PICKED',
      sectionLabel: label,
      sectionHtml: html,
    }, '*');
  }

  function onMouseLeave() {
    hideOverlay();
  }

  // Listen for activation messages from parent
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'SECTION_PICKER_ACTIVATE') {
      active = true;
      document.body.style.cursor = 'crosshair';
      if (!overlay) createOverlay();
    }
    if (e.data && e.data.type === 'SECTION_PICKER_DEACTIVATE') {
      active = false;
      document.body.style.cursor = '';
      hideOverlay();
    }
  });

  document.addEventListener('mousemove', onMouseMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('mouseleave', onMouseLeave, true);
})();
`;
