import fs from 'node:fs/promises';
import path from 'node:path';
import type { Frame } from 'playwright';

export type FieldIntent =
  | 'first_name'
  | 'last_name'
  | 'full_name'
  | 'email'
  | 'phone'
  | 'city'
  | 'province'
  | 'country'
  | 'work_auth'
  | 'school'
  | 'degree'
  | 'major'
  | 'grad_year'
  | 'cover_letter'
  | 'resume';

export type DetectedField = {
  selector: string;
  tagName: string;
  type: string;
  labelText: string;
  confidence: number;
  required: boolean;
};

/**
 * Per-attribute weights for confidence scoring (per JobFill spec):
 *   label       40
 *   name        25
 *   id          20
 *   placeholder 10
 *   aria-label  5
 *
 * Threshold for fill: ≥ 50.
 */
type FieldAttrs = {
  label: string;
  name: string;
  id: string;
  placeholder: string;
  ariaLabel: string;
};

type DomField = {
  selector: string;
  tagName: string;
  type: string;
  required: boolean;
  attrs: FieldAttrs;
};

const ATTR_WEIGHTS = {
  label: 40,
  name: 25,
  id: 20,
  placeholder: 10,
  ariaLabel: 5,
} as const;

const INTENT_KEYWORDS: Record<FieldIntent, string[]> = {
  first_name:   ['first name', 'given name', 'firstname', 'first'],
  last_name:    ['last name', 'surname', 'family name', 'lastname', 'last'],
  full_name:    ['full name', 'legal name', 'name'],
  email:        ['email', 'e-mail', 'email address'],
  phone:        ['phone', 'phone number', 'mobile', 'cell', 'telephone'],
  city:         ['city', 'town'],
  province:     ['province', 'state', 'region'],
  country:      ['country'],
  work_auth:    ['work authorization', 'authorized', 'sponsorship', 'eligible to work', 'visa', 'citizenship', 'eligible'],
  school:       ['school', 'university', 'college', 'institution'],
  degree:       ['degree', 'qualification'],
  major:        ['major', 'field of study', 'discipline'],
  grad_year:    ['graduation year', 'grad year', 'year graduated', 'graduation date'],
  cover_letter: ['cover letter', 'why are you interested', 'motivation', 'why us'],
  resume:       ['resume', 'cv', 'curriculum vitae', 'upload resume', 'attach resume'],
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[_\-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Score one attribute against intent keywords.
 * Returns 1.0 for exact match, 0.7 for substring/partial, 0 otherwise.
 * Caller multiplies by attribute weight.
 */
function scoreAttr(intent: FieldIntent, attrValue: string): number {
  if (!attrValue) return 0;
  const norm = normalize(attrValue);
  if (!norm) return 0;
  const keywords = INTENT_KEYWORDS[intent].map(normalize);

  let best = 0;
  for (const k of keywords) {
    if (norm === k) return 1.0;
    if (norm.includes(k) || k.includes(norm)) best = Math.max(best, 0.7);
  }
  return best;
}

function scoreIntent(intent: FieldIntent, attrs: FieldAttrs): number {
  return Math.round(
    scoreAttr(intent, attrs.label)       * ATTR_WEIGHTS.label +
    scoreAttr(intent, attrs.name)        * ATTR_WEIGHTS.name +
    scoreAttr(intent, attrs.id)          * ATTR_WEIGHTS.id +
    scoreAttr(intent, attrs.placeholder) * ATTR_WEIGHTS.placeholder +
    scoreAttr(intent, attrs.ariaLabel)   * ATTR_WEIGHTS.ariaLabel,
  );
}

async function collectDomFields(frame: Frame): Promise<DomField[]> {
  return frame.evaluate(() => {
    function getLabelText(element: Element): string {
      const id = (element as HTMLInputElement).id;
      if (id) {
        const explicit = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (explicit?.textContent) return explicit.textContent;
      }
      const wrapped = element.closest('label')?.textContent;
      if (wrapped) return wrapped;
      // aria-labelledby
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const el = document.getElementById(labelledBy);
        if (el?.textContent) return el.textContent;
      }
      return '';
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        'input, textarea, select',
      ),
    ).filter((el) => {
      if (el instanceof HTMLInputElement && ['hidden', 'submit', 'button', 'reset'].includes(el.type)) {
        return false;
      }
      // Skip invisible
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return true;
    });

    return elements.map((el) => {
      const id = el.id ? `#${CSS.escape(el.id)}` : '';
      const dataTest = el.getAttribute('data-testid')
        ? `${el.tagName.toLowerCase()}[data-testid="${CSS.escape(el.getAttribute('data-testid')!)}"]`
        : '';
      const nameAttr = el.getAttribute('name')
        ? `${el.tagName.toLowerCase()}[name="${CSS.escape(el.getAttribute('name')!)}"]`
        : '';
      const selector =
        id ||
        dataTest ||
        nameAttr ||
        `${el.tagName.toLowerCase()}:nth-of-type(${1 + Array.from(el.parentElement?.children ?? []).indexOf(el)})`;
      const type = el instanceof HTMLInputElement ? el.type : el.tagName.toLowerCase();

      return {
        selector,
        tagName: el.tagName.toLowerCase(),
        type,
        required: el.hasAttribute('required') || el.getAttribute('aria-required') === 'true',
        attrs: {
          label: (getLabelText(el) || '').trim(),
          name: el.getAttribute('name') ?? '',
          id: el.id ?? '',
          placeholder: (el as HTMLInputElement).placeholder ?? '',
          ariaLabel: el.getAttribute('aria-label') ?? '',
        },
      };
    });
  });
}

export async function findBestField(
  frame: Frame,
  intent: FieldIntent,
  minimumConfidence = 50,
): Promise<DetectedField | null> {
  const fields = await collectDomFields(frame);
  let best: DetectedField | null = null;

  for (const field of fields) {
    const confidence = scoreIntent(intent, field.attrs);
    if (confidence < minimumConfidence) continue;
    if (!best || confidence > best.confidence) {
      best = {
        selector: field.selector,
        tagName: field.tagName,
        type: field.type,
        labelText: [field.attrs.label, field.attrs.name, field.attrs.id].filter(Boolean).join(' / '),
        confidence,
        required: field.required,
      };
    }
  }

  return best;
}

export async function hasUnfilledRequiredFields(frame: Frame): Promise<boolean> {
  return frame.evaluate(() => {
    const requiredElements = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input[required], textarea[required], select[required], [aria-required='true']",
      ),
    );
    return requiredElements.some((el) => {
      if (el instanceof HTMLInputElement && el.type === 'checkbox') return !el.checked;
      if (el instanceof HTMLInputElement && el.type === 'file') return el.files === null || el.files.length === 0;
      const value = (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      return !value || !value.trim();
    });
  });
}

/** Framework-safe value setter: triggers React/Vue/Svelte change detection. */
export async function frameworkSafeFill(frame: Frame, selector: string, value: string) {
  await frame.evaluate(
    ({ selector: targetSelector, value: targetValue }) => {
      const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(targetSelector);
      if (!input) throw new Error(`Missing input: ${targetSelector}`);
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(input),
        'value',
      )?.set;
      setter?.call(input, targetValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    },
    { selector, value },
  );
}

export async function frameworkSafeSelect(frame: Frame, selector: string, value: string) {
  await frame.evaluate(
    ({ selector: targetSelector, desired }) => {
      const select = document.querySelector<HTMLSelectElement>(targetSelector);
      if (!select) throw new Error(`Missing select: ${targetSelector}`);
      const normalized = desired.toLowerCase().trim();
      const option = Array.from(select.options).find(
        (candidate) =>
          candidate.value.toLowerCase().trim() === normalized ||
          candidate.textContent?.toLowerCase().trim() === normalized ||
          candidate.textContent?.toLowerCase().includes(normalized),
      );
      if (!option) throw new Error(`No option for value: ${desired}`);
      select.value = option.value;
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('blur', { bubbles: true }));
    },
    { selector, desired: value },
  );
}

/**
 * Inject the real PDF resume into a file input via DataTransfer.
 * Critical: this is the spec's accuracy requirement — no PDF reconstruction.
 */
export async function uploadResumeViaDataTransfer(
  frame: Frame,
  selector: string,
  resumePath: string,
) {
  const data = await fs.readFile(resumePath);
  const filename = path.basename(resumePath);
  await frame.evaluate(
    ({ targetSelector, bytes, name }) => {
      const input = document.querySelector<HTMLInputElement>(targetSelector);
      if (!input) throw new Error(`Missing file input: ${targetSelector}`);
      const array = new Uint8Array(bytes);
      const file = new File([array], name, { type: 'application/pdf' });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
    },
    { targetSelector: selector, bytes: Array.from(data), name: filename },
  );
}
