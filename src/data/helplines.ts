export interface Helpline {
    id: string;
    organization: string;
    description: string;
    phone: string;
    website?: string;
    available: string;
}

export const CRISIS_HELPLINES: Helpline[] = [
    {
        id: 'icall',
        organization: 'iCall (TISS)',
        description: 'Telephone and email based counseling services.',
        phone: '9152987821',
        website: 'icallhelpline.org',
        available: 'Mon-Sat, 10 AM - 8 PM'
    },
    {
        id: 'vandrevala',
        organization: 'Vandrevala Foundation',
        description: 'For mental health crisis and suicidal thoughts.',
        phone: '9999 666 555',
        website: 'vandrevalafoundation.com',
        available: '24/7'
    },
    {
        id: 'aasra',
        organization: 'AASRA',
        description: 'Confidential, anonymous emotional support hotline.',
        phone: '9820466726',
        website: 'aasra.info',
        available: '24/7'
    },
    {
        id: 'kiran',
        organization: 'KIRAN',
        description: 'Mental health rehabilitation helpline by Min. of Social Justice.',
        phone: '1800-599-0019',
        available: '24/7'
    }
];
