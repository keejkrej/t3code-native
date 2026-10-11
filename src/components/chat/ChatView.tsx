import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { Icon } from '../ui/Icon';
import { ThinkingAccordion } from './ThinkingAccordion';
import { ToolCallCard } from './ToolCallCard';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ChatView: React.FC = () => {
  const {
    activeThreadId,
    threads,
    messages,
    turns,
    isGenerating,
    projects,
    activeProjectId,
    openNewThreadModal,
    isInspectorOpen,
    rightPanelMode,
  } = useAppStore();

  const scrollViewRef = useRef<any>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];
  const threadTurns = activeThreadId ? turns[activeThreadId] || [] : [];
  const isDetailsOpen = isInspectorOpen && rightPanelMode === 'workspace';

  // Auto-scroll on new message or generation
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [threadMessages.length, threadTurns.length, isGenerating]);

  const projectName = activeProject ? activeProject.name : 'server';

  return (
    <View style={styles.container}>
      {/* Transcript Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcript}
        contentContainerStyle={[
          styles.transcriptContent,
          isDetailsOpen && { paddingRight: 310 },
        ]}
        showsVerticalScrollIndicator={true}
      >
        {/* Welcome Empty State Hero (matches OG T3 Code DraftHeroHeadline) */}
        {threadMessages.length === 0 && (
          <View style={styles.welcomeHero}>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitlePrefix}>What should we build in </Text>
              <View style={styles.projectWordRow}>
                <Pressable style={styles.projectPickerUnderline} onPress={openNewThreadModal}>
                  <Text style={styles.heroProjectName}>{projectName}</Text>
                </Pressable>
                <Text style={styles.heroTitlePrefix}>?</Text>
              </View>
            </View>

            <Pressable style={styles.orNoProjectBtn}>
              <Text style={styles.orNoProjectText}>or start without a project</Text>
            </Pressable>
          </View>
        )}

        {/* Message Timeline */}
        {threadMessages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <View key={msg.id} style={styles.userMessageWrapper}>
                <View style={styles.userBubble}>
                  {/* Context chips if user attached files or git refs */}
                  {msg.contextChips && msg.contextChips.length > 0 && (
                    <View style={styles.chipsRow}>
                      {msg.contextChips.map((chip) => (
                        <View key={chip.id} style={styles.contextChip}>
                          <Icon
                            name={chip.type === 'git' ? 'GitBranch' : 'FileCode'}
                            size={11}
                            color={colors.primaryLight}
                          />
                          <Text style={styles.chipText}>{chip.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={styles.userMessageText}>{msg.content}</Text>
                </View>
                <Text style={styles.userTimestamp}>{msg.timestamp}</Text>
              </View>
            );
          }

          // Assistant Turn (Canvas fluid layout, no boxed card container)
          const matchingTurn = threadTurns.find((t) => t.id === msg.turnId);

          return (
            <View key={msg.id} style={styles.assistantTimelineEntry}>
              {/* Collapsible Chain-of-Thought Reasoning */}
              {matchingTurn?.thoughts && (
                <View style={styles.reasoningRow}>
                  <ThinkingAccordion
                    thoughts={matchingTurn.thoughts}
                    isStreaming={isGenerating && matchingTurn.status === 'thinking'}
                  />
                </View>
              )}

              {/* Tool Execution Rows (WorkLog style) */}
              {matchingTurn?.toolCalls && matchingTurn.toolCalls.length > 0 && (
                <View style={styles.workLogList}>
                  {matchingTurn.toolCalls.map((tc) => (
                    <ToolCallCard key={tc.id} toolCall={tc} />
                  ))}
                </View>
              )}

              {/* Markdown Content */}
              <View style={styles.markdownWrapper}>
                <MarkdownRenderer content={msg.content} />
              </View>
            </View>
          );
        })}

        {/* Live Generating Turn Indicator */}
        {isGenerating && threadTurns.length > 0 && !threadMessages.some((m) => m.turnId === threadTurns[threadTurns.length - 1].id) && (
          <View style={styles.assistantTimelineEntry}>
            <View style={styles.assistantHeader}>
              <Text style={styles.assistantAuthorHeading}>T3 Code</Text>
              <Text style={styles.streamingText}>Thinking & executing...</Text>
            </View>
            {threadTurns[threadTurns.length - 1].thoughts && (
              <View style={styles.reasoningRow}>
                <ThinkingAccordion
                  thoughts={threadTurns[threadTurns.length - 1].thoughts!}
                  isStreaming={true}
                />
              </View>
            )}
            {threadTurns[threadTurns.length - 1].toolCalls.length > 0 && (
              <View style={styles.workLogList}>
                {threadTurns[threadTurns.length - 1].toolCalls.map((tc) => (
                  <ToolCallCard key={tc.id} toolCall={tc} />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  transcript: {
    flex: 1,
    minHeight: 0,
  },
  transcriptContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 24,
    gap: 16,
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
  },
  welcomeHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  projectWordRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroTitlePrefix: {
    color: '#f5f5f5',
    fontSize: 29,
    fontWeight: '400',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  projectPickerUnderline: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#52525b',
    borderStyle: 'dashed',
    paddingBottom: 2,
  },
  heroProjectName: {
    color: '#f5f5f5',
    fontSize: 29,
    fontWeight: '400',
    fontFamily: typography.fontFamily,
    letterSpacing: -0.5,
  },
  orNoProjectBtn: {
    marginTop: 10,
  },
  orNoProjectText: {
    color: '#71717a',
    fontSize: 13,
    fontFamily: typography.fontFamily,
  },
  // User Right-Aligned Speech Bubble
  userMessageWrapper: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    alignItems: 'flex-end',
    gap: 4,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222226',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  userAuthorHeading: {
    color: '#a1a1aa',
    fontSize: 11,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  userTimestamp: {
    color: '#52525b',
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
    marginRight: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 2,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b1d24',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: '#262934',
  },
  chipText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
  },
  userMessageText: {
    color: '#f5f5f5',
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
  },
  // Assistant Fluid Canvas Entry
  assistantTimelineEntry: {
    alignSelf: 'flex-start',
    width: '100%',
    paddingVertical: 4,
    gap: 8,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  assistantAuthorHeading: {
    color: '#f5f5f5',
    fontSize: 13,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  assistantTimestamp: {
    color: '#52525b',
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  streamingText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
  },
  reasoningRow: {
    marginVertical: 2,
  },
  workLogList: {
    marginVertical: 2,
    gap: 2,
  },
  markdownWrapper: {
    width: '100%',
    marginTop: 2,
  },
});
