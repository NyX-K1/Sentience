import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Open Sans',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
        { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
    ]
});

const colors = {
    primary: '#1a1a1a',
    accent: '#2563eb',
    muted: '#666666',
    light: '#999999',
    bg: '#ffffff',
    sectionBg: '#f8fafc',
    border: '#e2e8f0',
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#64748b',
};

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Open Sans', backgroundColor: colors.bg, color: colors.primary },
    // Header
    header: { borderBottom: `2pt solid ${colors.primary}`, paddingBottom: 15, marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 },
    subtitle: { fontSize: 9, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    // Sections
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 600, backgroundColor: colors.sectionBg, padding: '6 10', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, borderLeft: `3pt solid ${colors.accent}` },
    subSection: { fontSize: 10, fontWeight: 600, color: colors.muted, marginTop: 10, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    // Layout
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    colLine: { flexDirection: 'row', paddingBottom: 6, borderBottom: `1pt solid ${colors.border}`, marginBottom: 6 },
    label: { fontSize: 9, fontWeight: 600, width: '40%', color: colors.muted },
    value: { fontSize: 9, width: '60%' },
    // Stat boxes
    statBoxList: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    statBox: { flex: 1, padding: 10, border: `1pt solid ${colors.border}`, borderRadius: 4, backgroundColor: colors.sectionBg },
    statValue: { fontSize: 18, fontWeight: 600, marginBottom: 3, color: colors.accent },
    statLabel: { fontSize: 8, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.3 },
    // Text
    bullet: { fontSize: 9, marginBottom: 5, lineHeight: 1.4, paddingLeft: 10 },
    bodyText: { fontSize: 9, lineHeight: 1.5, marginBottom: 4, color: '#333' },
    italic: { fontStyle: 'italic', color: '#555' },
    // Tables
    tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', padding: 6, borderBottom: `1pt solid #cbd5e1`, fontSize: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 },
    tableRow: { flexDirection: 'row', padding: 6, borderBottom: `1pt solid ${colors.border}`, fontSize: 8, lineHeight: 1.4 },
    // Column widths
    col10: { width: '10%' },
    col15: { width: '15%' },
    col20: { width: '20%' },
    col25: { width: '25%' },
    col30: { width: '30%' },
    col35: { width: '35%' },
    col40: { width: '40%' },
    col45: { width: '45%' },
    col50: { width: '50%' },
    col55: { width: '55%' },
    col60: { width: '60%' },
    // Footer
    footer: { position: 'absolute', bottom: 25, left: 40, right: 40, borderTop: `1pt solid ${colors.border}`, paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
    footerText: { fontSize: 7, color: colors.light },
});

// ─── Types ───

export interface MoodTimelineEntry {
    date: string;
    valence: number;
    arousal: number;
    dominantFamily?: string;
    triggers?: string[];
    notes?: string;
}

export interface CbtSessionDetail {
    date: string;
    situation?: string;
    thought: string;
    distortions: string[];
    initialBelief: number;
    finalBelief: number;
    reframe: string;
    takeaway?: string;
    duration?: number;
    initialEmotions?: string[];
    finalEmotions?: string[];
}

export interface JournalEntryDetail {
    date: string;
    sentiment: string;
    moodScore: number;
    emotions: string[];
    distortions: string[];
    copingStrategies: string[];
    insight: string;
    contentPreview: string;
}

export interface ConversationSample {
    journalDate: string;
    messages: { role: string; text: string }[];
}

export interface ClinicalReportProps {
    dateRange: string;
    generationDate: string;
    metrics: {
        overview: {
            totalDataPoints: number;
            activeDays: number;
            periodDays: number;
        };
        mood: {
            totalLogs: number;
            avgValence: string;
            avgArousal: string;
            topTriggers: { name: string; count: number }[];
            dominantFamilies: { name: string; count: number }[];
            timeline: MoodTimelineEntry[];
        };
        cbt: {
            totalSessions: number;
            avgBeliefShift: string;
            avgDuration: string;
            topDistortions: { name: string; count: number }[];
            recentReframes: { thought: string; reframe: string }[];
            allSessions: CbtSessionDetail[];
        };
        journal: {
            totalEntries: number;
            avgMoodScore: string;
            predominantSentiment: string;
            sentimentBreakdown: { name: string; count: number }[];
            emotionFrequencies: { name: string; count: number }[];
            distortionFrequencies: { name: string; count: number }[];
            copingStrategies: { name: string; count: number }[];
            recentInsights: string[];
            allEntries: JournalEntryDetail[];
        };
        conversations: {
            totalMessages: number;
            avgPerEntry: string;
            samples: ConversationSample[];
        };
        crossFeature: {
            commonDistortions: string[];
            engagementNote: string;
        };
    };
}

// ─── PDF Component ───

export const ClinicalReportPDF = ({ dateRange, generationDate, metrics }: ClinicalReportProps) => (
    <Document>
        {/* ─── PAGE 1: Executive Summary + Affect ─── */}
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Patient Clinical Summary</Text>
                <View style={[styles.row, { marginTop: 8 }]}>
                    <Text style={styles.subtitle}>Date Range: {dateRange}</Text>
                    <Text style={styles.subtitle}>Generated: {generationDate}</Text>
                </View>
            </View>

            {/* Executive Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.overview.totalDataPoints}</Text>
                        <Text style={styles.statLabel}>Total Data Points</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.overview.activeDays}</Text>
                        <Text style={styles.statLabel}>Active Days</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.overview.periodDays}</Text>
                        <Text style={styles.statLabel}>Period (Days)</Text>
                    </View>
                </View>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.totalLogs}</Text>
                        <Text style={styles.statLabel}>Mood Logs</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.journal.totalEntries}</Text>
                        <Text style={styles.statLabel}>Journal Entries</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.totalSessions}</Text>
                        <Text style={styles.statLabel}>CBT Sessions</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.conversations.totalMessages}</Text>
                        <Text style={styles.statLabel}>Conversation Messages</Text>
                    </View>
                </View>
            </View>

            {/* Section 1: Affect & Triggers */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Affect & Triggers (Mood Logs)</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.avgValence}</Text>
                        <Text style={styles.statLabel}>Avg Valence (-1 to 1)</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.avgArousal}</Text>
                        <Text style={styles.statLabel}>Avg Arousal (1 to 5)</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.mood.totalLogs}</Text>
                        <Text style={styles.statLabel}>Total Logs</Text>
                    </View>
                </View>

                <Text style={styles.subSection}>Primary Identified Triggers</Text>
                {metrics.mood.topTriggers.length > 0 ? (
                    metrics.mood.topTriggers.map((t, i) => (
                        <Text key={i} style={styles.bullet}>• {t.name} ({t.count} occurrences)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No triggers recorded in this period.</Text>
                )}

                <Text style={styles.subSection}>Dominant Emotion Families</Text>
                {metrics.mood.dominantFamilies.length > 0 ? (
                    metrics.mood.dominantFamilies.map((f, i) => (
                        <Text key={i} style={styles.bullet}>• {f.name} ({f.count} logs)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No family data recorded.</Text>
                )}
            </View>

            {/* Mood Timeline Table */}
            {metrics.mood.timeline.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subSection}>Mood Log Timeline (Recent {Math.min(metrics.mood.timeline.length, 15)})</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col15}>Date</Text>
                        <Text style={styles.col15}>Valence</Text>
                        <Text style={styles.col15}>Arousal</Text>
                        <Text style={styles.col20}>Family</Text>
                        <Text style={styles.col35}>Notes</Text>
                    </View>
                    {metrics.mood.timeline.slice(-15).map((m, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.col15}>{m.date}</Text>
                            <Text style={styles.col15}>{m.valence?.toFixed(2)}</Text>
                            <Text style={styles.col15}>{m.arousal?.toFixed(2)}</Text>
                            <Text style={styles.col20}>{m.dominantFamily || '—'}</Text>
                            <Text style={styles.col35}>{m.notes ? m.notes.slice(0, 60) : '—'}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Sentience AI — Clinical Summary Report (Strictly Confidential)</Text>
                <Text style={styles.footerText}>Page 1</Text>
            </View>
        </Page>

        {/* ─── PAGE 2: Cognitive Restructuring ─── */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Cognitive Restructuring (CBT)</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.totalSessions}</Text>
                        <Text style={styles.statLabel}>Total Sessions</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.avgBeliefShift}%</Text>
                        <Text style={styles.statLabel}>Avg Belief De-escalation</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.cbt.avgDuration} min</Text>
                        <Text style={styles.statLabel}>Avg Session Duration</Text>
                    </View>
                </View>

                <Text style={styles.subSection}>Predominant Cognitive Distortions</Text>
                {metrics.cbt.topDistortions.length > 0 ? (
                    metrics.cbt.topDistortions.map((d, i) => (
                        <Text key={i} style={styles.bullet}>• {d.name} ({d.count} sessions)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No distortions recorded in this period.</Text>
                )}
            </View>

            {/* Full Session Detail Table */}
            {metrics.cbt.allSessions.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subSection}>Session Details (All {metrics.cbt.allSessions.length} Sessions)</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col10}>Date</Text>
                        <Text style={styles.col25}>Automatic Thought</Text>
                        <Text style={styles.col15}>Distortions</Text>
                        <Text style={styles.col10}>Shift</Text>
                        <Text style={styles.col25}>Selected Reframe</Text>
                        <Text style={styles.col15}>Takeaway</Text>
                    </View>
                    {metrics.cbt.allSessions.slice(0, 20).map((s, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.col10}>{s.date}</Text>
                            <Text style={[styles.col25, styles.italic]}>{s.thought.slice(0, 50)}{s.thought.length > 50 ? '…' : ''}</Text>
                            <Text style={styles.col15}>{s.distortions.slice(0, 2).join(', ')}</Text>
                            <Text style={styles.col10}>{s.initialBelief}→{s.finalBelief}</Text>
                            <Text style={styles.col25}>{s.reframe.slice(0, 50)}{s.reframe.length > 50 ? '…' : ''}</Text>
                            <Text style={styles.col15}>{(s.takeaway || '').slice(0, 30)}{(s.takeaway || '').length > 30 ? '…' : ''}</Text>
                        </View>
                    ))}
                    {metrics.cbt.allSessions.length > 20 && (
                        <Text style={[styles.bullet, { marginTop: 4, color: colors.light }]}>... and {metrics.cbt.allSessions.length - 20} more sessions</Text>
                    )}
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Sentience AI — Clinical Summary Report (Strictly Confidential)</Text>
                <Text style={styles.footerText}>Page 2</Text>
            </View>
        </Page>

        {/* ─── PAGE 3: Smart Journal Analysis ─── */}
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Smart Journal Analysis</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.journal.totalEntries}</Text>
                        <Text style={styles.statLabel}>Total Entries</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.journal.avgMoodScore}/10</Text>
                        <Text style={styles.statLabel}>Avg Mood Score</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.journal.predominantSentiment}</Text>
                        <Text style={styles.statLabel}>Predominant Sentiment</Text>
                    </View>
                </View>
            </View>

            {/* Sentiment Breakdown */}
            <View style={styles.section}>
                <Text style={styles.subSection}>Sentiment Distribution</Text>
                {metrics.journal.sentimentBreakdown.length > 0 ? (
                    metrics.journal.sentimentBreakdown.map((s, i) => (
                        <Text key={i} style={styles.bullet}>• {s.name}: {s.count} entries</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No sentiment data available.</Text>
                )}
            </View>

            {/* Emotion Frequencies */}
            <View style={styles.section}>
                <Text style={styles.subSection}>Detected Emotion Frequencies (Top 10)</Text>
                {metrics.journal.emotionFrequencies.length > 0 ? (
                    metrics.journal.emotionFrequencies.slice(0, 10).map((e, i) => (
                        <Text key={i} style={styles.bullet}>• {e.name}: {e.count} detections</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No emotions detected in this period.</Text>
                )}
            </View>

            {/* Distortion Frequencies from Journal */}
            <View style={styles.section}>
                <Text style={styles.subSection}>Journal-Detected Cognitive Distortions</Text>
                {metrics.journal.distortionFrequencies.length > 0 ? (
                    metrics.journal.distortionFrequencies.slice(0, 8).map((d, i) => (
                        <Text key={i} style={styles.bullet}>• {d.name}: {d.count} entries</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No distortions detected in journal entries.</Text>
                )}
            </View>

            {/* Coping Strategies */}
            <View style={styles.section}>
                <Text style={styles.subSection}>Suggested Coping Strategies (Most Common)</Text>
                {metrics.journal.copingStrategies.length > 0 ? (
                    metrics.journal.copingStrategies.slice(0, 6).map((c, i) => (
                        <Text key={i} style={styles.bullet}>• {c.name} ({c.count}x suggested)</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No coping strategies generated in this period.</Text>
                )}
            </View>

            {/* Recent AI Insights */}
            <View style={styles.section}>
                <Text style={styles.subSection}>Recent AI Core Insights</Text>
                {metrics.journal.recentInsights.length > 0 ? (
                    metrics.journal.recentInsights.map((insight, i) => (
                        <Text key={i} style={styles.bullet}>• {insight}</Text>
                    ))
                ) : (
                    <Text style={styles.bullet}>No journal insights generated in this period.</Text>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Sentience AI — Clinical Summary Report (Strictly Confidential)</Text>
                <Text style={styles.footerText}>Page 3</Text>
            </View>
        </Page>

        {/* ─── PAGE 4: Journal Entries Table ─── */}
        {metrics.journal.allEntries.length > 0 && (
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3b. Journal Entry Log</Text>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col10}>Date</Text>
                        <Text style={styles.col10}>Sentiment</Text>
                        <Text style={styles.col10}>Score</Text>
                        <Text style={styles.col25}>Emotions</Text>
                        <Text style={styles.col45}>Core Insight</Text>
                    </View>
                    {metrics.journal.allEntries.slice(0, 25).map((e, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.col10}>{e.date}</Text>
                            <Text style={styles.col10}>{e.sentiment}</Text>
                            <Text style={styles.col10}>{e.moodScore}/10</Text>
                            <Text style={styles.col25}>{e.emotions.slice(0, 3).join(', ')}</Text>
                            <Text style={styles.col45}>{e.insight.slice(0, 80)}{e.insight.length > 80 ? '…' : ''}</Text>
                        </View>
                    ))}
                    {metrics.journal.allEntries.length > 25 && (
                        <Text style={[styles.bullet, { marginTop: 4, color: colors.light }]}>... and {metrics.journal.allEntries.length - 25} more entries</Text>
                    )}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Sentience AI — Clinical Summary Report (Strictly Confidential)</Text>
                    <Text style={styles.footerText}>Page 4</Text>
                </View>
            </Page>
        )}

        {/* ─── PAGE 5: Conversations + Cross-Feature ─── */}
        <Page size="A4" style={styles.page}>
            {/* Section 4: Therapeutic Conversations */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Therapeutic Conversations</Text>
                <View style={styles.statBoxList}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.conversations.totalMessages}</Text>
                        <Text style={styles.statLabel}>Total Messages</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{metrics.conversations.avgPerEntry}</Text>
                        <Text style={styles.statLabel}>Avg Messages/Entry</Text>
                    </View>
                </View>

                {metrics.conversations.samples.length > 0 ? (
                    metrics.conversations.samples.map((sample, idx) => (
                        <View key={idx} style={{ marginBottom: 12 }}>
                            <Text style={[styles.subSection, { marginBottom: 4 }]}>Conversation from {sample.journalDate}</Text>
                            {sample.messages.map((msg, mi) => (
                                <View key={mi} style={{ flexDirection: 'row', marginBottom: 3, paddingLeft: msg.role === 'assistant' ? 0 : 20 }}>
                                    <Text style={{ fontSize: 8, fontWeight: 600, color: msg.role === 'assistant' ? colors.accent : colors.muted, width: 60 }}>
                                        {msg.role === 'assistant' ? 'Sentience' : 'User'}:
                                    </Text>
                                    <Text style={{ fontSize: 8, flex: 1, lineHeight: 1.4, color: '#444' }}>
                                        {msg.text.slice(0, 150)}{msg.text.length > 150 ? '…' : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    <Text style={styles.bullet}>No therapeutic conversations recorded in this period.</Text>
                )}
            </View>

            {/* Section 5: Cross-Feature Patterns */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Cross-Feature Patterns</Text>

                <Text style={styles.subSection}>Distortions Across Features</Text>
                {metrics.crossFeature.commonDistortions.length > 0 ? (
                    <Text style={styles.bodyText}>
                        Distortions appearing in both CBT sessions and journal analysis: {metrics.crossFeature.commonDistortions.join(', ')}.
                        These recurring patterns may be priority targets for therapeutic intervention.
                    </Text>
                ) : (
                    <Text style={styles.bodyText}>
                        No overlapping distortions found between CBT sessions and journal entries in this period.
                    </Text>
                )}

                <Text style={[styles.subSection, { marginTop: 10 }]}>Engagement & Consistency</Text>
                <Text style={styles.bodyText}>{metrics.crossFeature.engagementNote}</Text>
            </View>

            {/* Disclaimer */}
            <View style={{ marginTop: 20, padding: 10, border: `1pt solid ${colors.border}`, borderRadius: 4, backgroundColor: '#fffbeb' }}>
                <Text style={{ fontSize: 8, fontWeight: 600, color: '#92400e', marginBottom: 4, textTransform: 'uppercase' }}>Disclaimer</Text>
                <Text style={{ fontSize: 7, lineHeight: 1.5, color: '#78350f' }}>
                    This report is auto-generated from user-reported data and AI analysis. It is intended to supplement — not replace — clinical assessment.
                    All AI-generated insights should be validated by a qualified mental health professional. Sentience AI does not provide medical diagnoses.
                </Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Sentience AI — Clinical Summary Report (Strictly Confidential)</Text>
                <Text style={styles.footerText}>Page {metrics.journal.allEntries.length > 0 ? '5' : '4'}</Text>
            </View>
        </Page>
    </Document>
);
