export const visitGuideUpdated = '2026-10-30';
export const urologyVisitGuides = [
  {
    slug: 'adult-circumcision-korea',
    procedure: 'circumcision',
    title: 'Adult Circumcision in Korea: Planning Your Visit',
    shortTitle: 'Adult circumcision in Korea',
    description: 'Plan an adult circumcision consultation in Korea: English consultations at five Goldman branches, written quotes, preparation and follow-up questions.',
    intro: 'Before booking, discuss your reasons for treatment, the available options and how follow-up will fit your stay.',
    official: 'https://www.gold-man.com/ennew/male/circumcision',
    officialName: 'Laser Circumcision',
    reference: 'https://www.nhs.uk/tests-and-treatments/circumcision/',
    referenceName: 'NHS circumcision information',
    overview: 'Circumcision removes the foreskin covering the head of the penis. People may seek advice because of foreskin tightness, recurring inflammation or personal preferences. A consultation helps you understand whether surgery or another approach is appropriate.',
    preparation: ['Your concerns and any previous treatment or surgery.', 'Medicines, supplements, allergies and relevant medical conditions.', 'Your preferred branch and appointment dates.', 'Your departure date, if you are visiting Korea.'],
    quote: 'Ask whether consultation, tests, anaesthesia, surgery, medicines, dressings and follow-up visits are included. Your estimate should explain additional charges and which costs may change after assessment.',
    followUp: ['When should my wound be checked, and how many visits might I need?', 'How should I wash the area and care for dressings or stitches?', 'When can I return to work, exercise and sexual activity?', 'When can the clinician assess whether I am ready to travel?', 'Who should I contact if I have a concern after returning home?'],
    inquiry: 'Hello, I would like an English consultation about adult circumcision at your [branch name] branch. My preferred dates are [dates], and I plan to leave Korea on [date, if applicable]. Could you confirm appointment availability, preparation, an itemised estimate and the follow-up arrangements?',
  },
  {
    slug: 'vasectomy-korea',
    procedure: 'vasectomy',
    title: 'Vasectomy in Korea: Consultation, Visit Planning and Follow-Up',
    shortTitle: 'Vasectomy in Korea',
    description: 'Plan a vasectomy consultation in Korea: English consultations at five Goldman branches, itemised quotes and post-vasectomy semen testing arrangements.',
    intro: 'Your visit should cover both the procedure and the follow-up needed to confirm its contraceptive effect.',
    official: 'https://www.gold-man.com/ennew/male/vasectomy',
    officialName: 'No-Scalpel Vasectomy',
    reference: 'https://www.cdc.gov/contraception/hcp/usspr/permanent-contraception.html',
    referenceName: 'CDC permanent contraception guidance',
    overview: 'Vasectomy is intended to be permanent contraception. Discuss your future family plans, alternatives and the procedure’s risks with your clinician. Reversal should not be treated as a guaranteed way to restore fertility. Vasectomy does not protect against sexually transmitted infections.',
    preparation: ['Your family-planning goals and any questions about permanent contraception.', 'Previous surgery or medical problems affecting the area.', 'Medicines, supplements, allergies and relevant medical conditions.', 'Your preferred branch, appointment dates and departure date, if applicable.'],
    quote: 'Check whether consultation, tests, anaesthesia, the procedure, medicines, follow-up appointments and post-vasectomy semen analysis are included. Ask whether additional tests or repeat semen samples would involve separate charges.',
    followUp: ['When should I have the semen analysis?', 'Where can I provide the sample, and what preparation is required?', 'If I have returned home, can I use a local laboratory?', 'Will the clinic accept and review results from that laboratory?', 'How will I receive confirmation, and what happens if another sample is needed?'],
    inquiry: 'Hello, I would like an English consultation about vasectomy at your [branch name] branch. My preferred dates are [dates], and I plan to leave Korea on [date, if applicable]. Could you confirm appointment availability, an itemised estimate and how post-vasectomy semen testing would be arranged?',
  },
] as const;
export type UrologyVisitGuide = typeof urologyVisitGuides[number];
export const visitGuidePath = (slug: string) => `/guides/${slug}`;
