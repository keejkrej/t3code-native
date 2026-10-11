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
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
    deleteThread,
    sendMessage,
    setInspectorTab,
  } = useAppStore();

  const scrollViewRef = useRef<any>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const threadMessages = activeThreadId ? messages[activeThreadId] || [] : [];
  const threadTurns = activeThreadId ? turns[activeThreadId] || [] : [];

  // Auto-scroll on new message or generation
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [threadMessages.length, threadTurns.length, isGenerating]);

  if (!activeThread) {
    return (
      <View style={styles.noThreadContainer}>
        <Icon name="Compass" size={36} color={colors.textMuted} />
        <Text style={styles.noThreadTitle}>No Thread Selected</Text>
        <Text style={styles.noThreadSub}>
          Select a conversation from the sidebar or start a new task.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Thread Subheader */}
      <View style={styles.threadSubheader}>
        <View style={styles.threadHeaderLeft}>
          <Text style={styles.threadTitle} numberOfLines={1}>
            {activeThread.title}
          </Text>
          <View style={styles.metaRow}>
            <Badge
              label={`${activeThread.provider.toUpperCase()} • ${activeThread.model}`}
              variant="purple"
              size="sm"
            />
            <View style={styles.branchTag}>
              <Icon name="GitBranch" size={11} color={colors.textSecondary} />
              <Text style={styles.branchTagText}>{activeThread.branch}</Text>
            </View>
            <Text style={styles.timeTag}>Created {activeThread.createdAt}</Text>
          </View>
        </View>

        <View style={styles.threadHeaderRight}>
          <Button
            icon="Terminal"
            label="Terminal"
            variant="ghost"
            size="sm"
            onPress={() => setInspectorTab('terminal')}
          />
          <Button
            icon="FileCode"
            label="Changes"
            variant="ghost"
            size="sm"
            onPress={() => setInspectorTab('diffs')}
          />
          <Button
            icon="Trash2"
            variant="ghost"
            size="sm"
            onPress={() => deleteThread(activeThread.id)}
          />
        </View>
      </View>

      {/* Transcript Timeline */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.transcript}
        contentContainerStyle={styles.transcriptContent}
        showsVerticalScrollIndicator={true}
      >
        {threadMessages.length === 0 && (
          <View style={styles.emptyHero}>
            <View style={styles.heroBadge}>
              <Icon name="Sparkles" size={24} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>What would you like to build?</Text>
            <Text style={styles.heroSub}>
              T3 Code Native can direct local CLIs, inspect files, execute terminal tasks, and create commits.
            </Text>

            <View style={styles.promptSuggestions}>
              {[
                'Refactor desktop window controls to native titlebar',
                'Write unit tests for WebSocket client reconnection',
                'Add support for side-by-side git diff view',
              ].map((prompt, idx) => (
                <Pressable
                  key={idx}
                  style={styles.suggestionCard}
                  onPress={() => sendMessage(prompt)}
                >
                  <Icon name="ChevronRight" size={12} color={colors.primary} />
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Message Items & Turns */}
        {threadMessages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <View key={msg.id} style={styles.userMessageCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>YOU</Text>
                  </View>
                  <Text style={styles.userTimestamp}>{msg.timestamp}</Text>
                </View>

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

                <Text style={styles.userMessageText} selectable>
                  {msg.content}
                </Text>
              </View>
            );
          }

          // Assistant Message
          const matchedTurn = msg.turnId
            ? threadTurns.find((t) => t.id === msg.turnId)
            : undefined;

          return (
            <View key={msg.id} style={styles.assistantMessageCard}>
              <View style={styles.assistantHeader}>
                <View style={styles.assistantAvatar}>
                  <Icon name="Sparkles" size={12} color="#ffffff" />
                </View>
                <Text style={styles.assistantName}>T3 Agent</Text>
                <Text style={styles.userTimestamp}>{msg.timestamp}</Text>
              </View>

              {/* Turn Thoughts / Reasoning */}
              {matchedTurn?.thoughts && (
                <ThinkingAccordion thoughts={matchedTurn.thoughts} />
              )}

              {/* Tool Calls */}
              {matchedTurn?.toolCalls && matchedTurn.toolCalls.length > 0 && (
                <View style={styles.toolCallsGroup}>
                  {matchedTurn.toolCalls.map((tc) => (
                    <ToolCallCard key={tc.id} toolCall={tc} />
                  ))}
                </View>
              )}

              {/* Message Markdown Body */}
              <View style={styles.markdownWrapper}>
                <MarkdownRenderer content={msg.content} />
              </View>

              {/* Checkpoint Banner */}
              {matchedTurn?.checkpoint && (
                <View style={styles.checkpointBanner}>
                  <View style={styles.checkpointLeft}>
                    <Icon name="GitCommit" size={13} color={colors.accentEmerald} />
                    <Text style={styles.checkpointTitle}>
                      Checkpoint: {matchedTurn.checkpoint.message}
                    </Text>
                  </View>
                  <View style={styles.commitPill}>
                    <Text style={styles.commitHash}>
                      {matchedTurn.checkpoint.commitHash}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Streaming / In-Progress Turn */}
        {isGenerating && (
          <View style={styles.generatingContainer}>
            <View style={styles.generatingHeader}>
              <View style={styles.assistantAvatar}>
                <Icon name="Sparkles" size={12} color="#ffffff" />
              </View>
              <Text style={styles.generatingText}>Agent is running...</Text>
            </View>
            <View style={styles.activeTurnPlaceholder}>
              <ThinkingAccordion
                thoughts="Evaluating workspace context and generating diff..."
                isStreaming={true}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: 'column',
  },
  threadSubheader: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  threadHeaderLeft: {
    flex: 1,
  },
  threadTitle: {
    color: colors.text,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  branchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchTagText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  timeTag: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.fontFamily,
  },
  threadHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transcript: {
    flex: 1,
  },
  transcriptContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 40,
  },
  noThreadContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noThreadTitle: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  noThreadSub: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
  },
  emptyHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    maxWidth: 600,
    alignSelf: 'center',
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    color: colors.text,
    fontSize: typography.sizes.heading,
    fontWeight: typography.weights.bold,
    fontFamily: typography.fontFamily,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSub: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  promptSuggestions: {
    width: '100%',
    gap: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: 8,
  },
  suggestionText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
  },
  userMessageCard: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 8,
    maxWidth: 900,
    alignSelf: 'stretch',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userAvatar: {
    backgroundColor: colors.surfaceActive,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  avatarText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    fontFamily: typography.monoFontFamily,
  },
  userTimestamp: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  contextChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.25)',
  },
  chipText: {
    color: colors.primaryLight,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
  },
  userMessageText: {
    color: colors.text,
    fontSize: typography.sizes.base,
    lineHeight: 22,
    fontFamily: typography.fontFamily,
  },
  assistantMessageCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 10,
    maxWidth: 900,
    alignSelf: 'stretch',
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assistantAvatar: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantName: {
    color: colors.text,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
    flex: 1,
  },
  toolCallsGroup: {
    gap: 4,
  },
  markdownWrapper: {
    marginTop: 4,
  },
  checkpointBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginTop: 6,
  },
  checkpointLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkpointTitle: {
    color: colors.accentEmerald,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  commitPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  commitHash: {
    color: colors.accentEmerald,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  generatingContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 10,
  },
  generatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generatingText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    fontFamily: typography.fontFamily,
  },
  activeTurnPlaceholder: {
    marginTop: 4,
  },
});
