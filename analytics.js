/* GA4 measurement shared by the public OISC family sites. No form values or credentials are collected. */
(function () {
  var config = window.__GA4_SITE_CONFIG__ || {};
  var measurementId = config.measurementId;
  if (!measurementId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var loader = document.createElement('script');
  loader.async = true;
  loader.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(loader);
  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: true,
    site: config.site,
    site_domain: config.siteDomain,
    content_group: config.site,
    page_type: pageType()
  });

  function pageType() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return 'home';
    if (/partner-finder/i.test(path)) return 'partner_finder';
    if (/membership/i.test(path)) return 'membership';
    if (/board/i.test(path)) return 'board';
    if (/portal|account|manual/i.test(path)) return 'portal';
    return 'page';
  }

  function sectionFor(element) {
    var section = element.closest('[id]');
    return section && section.id ? section.id : 'none';
  }

  function labelFor(element) {
    return (element.getAttribute('data-analytics-label') || element.textContent || element.getAttribute('aria-label') || '')
      .replace(/\s+/g, ' ').trim().slice(0, 100) || 'unlabeled';
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link || !link.href) return;
    var url = new URL(link.href, location.href);
    var sameSite = url.origin === location.origin;
    var isAuth = /portal\.gcli\.site|account\.|\/account\//i.test(url.href);
    var eventName = sameSite ? (isAuth ? 'auth_route_click' : 'internal_link_click') : 'outbound_link_click';
    gtag('event', eventName, {
      site: config.site,
      page_type: pageType(),
      section: sectionFor(link),
      link_label: labelFor(link),
      link_url: url.href.slice(0, 300),
      link_type: isAuth ? 'auth' : (sameSite ? 'internal' : 'external')
    });
  }, { passive: true });

  document.addEventListener('submit', function (event) {
    var form = event.target;
    gtag('event', 'form_submit', {
      site: config.site,
      page_type: pageType(),
      section: sectionFor(form),
      form_id: form.id || form.getAttribute('name') || 'unnamed'
    });
  }, { passive: true });

  var started = new WeakSet();
  document.addEventListener('focusin', function (event) {
    var field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) return;
    var form = field.form;
    if (!form || started.has(form)) return;
    started.add(form);
    gtag('event', 'form_start', {
      site: config.site,
      page_type: pageType(),
      section: sectionFor(form),
      form_id: form.id || form.getAttribute('name') || 'unnamed'
    });
  });

  var sentScroll = false;
  window.addEventListener('scroll', function () {
    if (sentScroll || (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight < 0.9) return;
    sentScroll = true;
    gtag('event', 'scroll_90', { site: config.site, page_type: pageType() });
  }, { passive: true });
}());
