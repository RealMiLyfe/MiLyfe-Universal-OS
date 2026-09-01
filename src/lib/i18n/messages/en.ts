/**
 * English message catalog — the source of truth.
 * Every other locale mirrors these keys. Missing keys in other locales
 * fall back to English automatically (see dictionary.ts).
 *
 * Keep keys grouped by surface. Values are plain strings; use {name}-style
 * placeholders for interpolation via the `t()` helper.
 */
const en = {
  common: {
    signIn: 'Sign in',
    signUp: 'Sign up',
    signOut: 'Sign out',
    getStarted: 'Get started',
    learnMore: 'Learn more',
    cancel: 'Cancel',
    save: 'Save',
    back: 'Back',
    loading: 'Loading…',
    language: 'Language',
    chooseLanguage: 'Choose language',
  },
  nav: {
    home: 'Home',
    wallet: 'Wallet',
    street: 'Street',
    learn: 'Learn',
    govern: 'Govern',
    connect: 'Connect',
    profile: 'Profile',
    safety: 'Safety',
  },
  landing: {
    tagline: 'We the People. Anyone. Anywhere. From Day One.',
    heroTitle: 'The commons, owned by the people who run it',
    heroSubtitle:
      'Earn weekly basic income, govern together, learn for free, and build your community. No ads, no data selling, no catch.',
    ctaJoin: 'Join free',
    ctaExplore: 'Explore the platform',
    featureEarnTitle: 'Earn $MLY',
    featureEarnDesc: 'Universal basic income for every citizen. Spend, save, or give back.',
    featureConnectTitle: 'Connect',
    featureConnectDesc: 'Real relationships with real neighbors. Not followers — connections.',
    featureGovernTitle: 'Govern Together',
    featureGovernDesc: 'Direct democracy. Every voice counts. Propose, vote, build.',
    step1Title: 'Sign up free',
    step1Desc: 'Create your citizen profile in 30 seconds. No credit card, no catch.',
    step2Title: 'Earn $MLY from day one',
    step2Desc: 'Receive universal basic income weekly. Spend it, save it, or give it back.',
    step3Title: 'Shape your city',
    step3Desc: 'Vote on proposals, fund projects, build the community you want to see.',
    footerTagline: 'Open source. People-owned. Built with $0 for the people.',
  },
  auth: {
    welcomeBack: 'Welcome back',
    createAccount: 'Create your account',
    email: 'Email',
    password: 'Password',
    username: 'Username',
    displayName: 'Display name',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    verifyEmail: 'Check your email to verify your account.',
    resend: 'Resend verification email',
  },
  onboarding: {
    welcomeTitle: 'Welcome to MiLyfe',
    enterMilyfe: 'Enter MiLyfe',
    welcomeGrant: "You've received a 50 $MLY welcome grant — it's already in your wallet.",
    weeklyUbi: "Every Monday you'll also receive 100 $MLY in weekly basic income.",
  },
  legal: {
    privacy: 'Privacy',
    terms: 'Terms of Use',
    security: 'Security',
    platform: 'Platform',
    community: 'Community',
    legal: 'Legal',
  },
};

export default en;

/**
 * Message catalog shape: same key structure as English, but every leaf is a
 * plain `string` so translations can supply their own values. Nested groups
 * are mapped recursively.
 */
export type Messages = {
  [K in keyof typeof en]: { [P in keyof (typeof en)[K]]: string };
};
