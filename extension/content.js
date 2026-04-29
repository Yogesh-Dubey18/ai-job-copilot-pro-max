function textFromSelectors(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const text = element?.textContent?.trim();

    if (text) {
      return text.replace(/\s+/g, ' ');
    }
  }

  return '';
}

function findCompany() {
  return textFromSelectors([
    '[data-testid*="company"]',
    '[class*="company" i]',
    '[aria-label*="company" i]',
    'a[href*="company"]',
    'span[itemprop="hiringOrganization"]'
  ]);
}

function findLocation() {
  return textFromSelectors([
    '[data-testid*="location"]',
    '[class*="location" i]',
    '[aria-label*="location" i]',
    'span[itemprop="jobLocation"]'
  ]);
}

function findDescription() {
  const selectors = [
    '[data-testid*="description"]',
    '[class*="description" i]',
    '[id*="description" i]',
    '[class*="job-details" i]',
    '[class*="jobDescription" i]',
    'main',
    'article'
  ];

  const text = textFromSelectors(selectors);

  if (text && text.length > 250) {
    return text.slice(0, 12000);
  }

  return document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 12000);
}

function scrapeJob() {
  const title = textFromSelectors([
    'h1',
    '[data-testid*="title"]',
    '[class*="job-title" i]',
    '[class*="jobTitle" i]',
    'title'
  ]);

  return {
    title: title || document.title || 'Untitled Role',
    company: findCompany() || 'Unknown Company',
    location: findLocation(),
    description: findDescription(),
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SCRAPE_JOB') {
    sendResponse(scrapeJob());
  }

  return false;
});
