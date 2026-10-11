import React from 'react';
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

export const DiffViewer: React.FC = () => {
  const {
    fileDiffs,
    selectedDiffFile,
    setSelectedDiffFile,
    toggleStageDiff,
    revertDiff,
  } = useAppStore();

  const currentDiff = fileDiffs.find((d) => d.path === selectedDiffFile) || fileDiffs[0];

  if (!currentDiff || fileDiffs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="CheckCircle2" size={32} color={colors.accentEmerald} />
        <Text style={styles.emptyTitle}>Working Tree Clean</Text>
        <Text style={styles.emptySub}>No modified or unstaged files in repository.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Changed Files Strip */}
      <View style={styles.filesListHeader}>
        <Text style={styles.sectionTitle}>MODIFIED FILES ({fileDiffs.length})</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fileChipsScroll}>
        <View style={styles.fileChipsRow}>
          {fileDiffs.map((diff) => {
            const isSelected = diff.path === currentDiff.path;

            return (
              <Pressable
                key={diff.path}
                style={[styles.fileChip, isSelected && styles.selectedFileChip]}
                onPress={() => setSelectedDiffFile(diff.path)}
              >
                <Icon
                  name={diff.status === 'added' ? 'Plus' : 'FileCode'}
                  size={12}
                  color={diff.status === 'added' ? colors.accentEmerald : colors.textSecondary}
                />
                <Text
                  style={[styles.fileChipName, isSelected && styles.selectedFileChipName]}
                  numberOfLines={1}
                >
                  {diff.path.split('/').pop()}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.additionsText}>+{diff.additions}</Text>
                  {diff.deletions > 0 && (
                    <Text style={styles.deletionsText}>-{diff.deletions}</Text>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Diff Action Toolbar */}
      <View style={styles.diffToolbar}>
        <View style={styles.diffMetaLeft}>
          <Text style={styles.filePathText} numberOfLines={1}>
            {currentDiff.path}
          </Text>
          <Badge
            label={currentDiff.isStaged ? 'Staged' : 'Unstaged'}
            variant={currentDiff.isStaged ? 'success' : 'default'}
            size="sm"
          />
        </View>

        <View style={styles.diffActionsRight}>
          <Button
            label={currentDiff.isStaged ? 'Unstage' : 'Stage'}
            variant="outline"
            size="xs"
            onPress={() => toggleStageDiff(currentDiff.path)}
          />
          <Button
            label="Revert"
            variant="ghost"
            size="xs"
            onPress={() => revertDiff(currentDiff.path)}
          />
        </View>
      </View>

      {/* Diff Code View */}
      <ScrollView style={styles.diffContent} showsVerticalScrollIndicator={true}>
        {currentDiff.chunks.map((chunk, chunkIdx) => (
          <View key={chunkIdx} style={styles.chunkBlock}>
            {/* Chunk header */}
            <View style={styles.chunkHeader}>
              <Text style={styles.chunkHeaderText}>{chunk.header}</Text>
            </View>

            {/* Chunk Lines */}
            {chunk.lines.map((line, lineIdx) => {
              const isAdd = line.type === 'add';
              const isDel = line.type === 'delete';

              return (
                <View
                  key={lineIdx}
                  style={[
                    styles.diffLineRow,
                    isAdd && styles.addLineRow,
                    isDel && styles.delLineRow,
                  ]}
                >
                  {/* Line numbers */}
                  <View style={styles.gutter}>
                    <Text style={styles.gutterNum}>{line.oldLine || ''}</Text>
                    <Text style={styles.gutterNum}>{line.newLine || ''}</Text>
                    <Text
                      style={[
                        styles.gutterSign,
                        isAdd && styles.addSign,
                        isDel && styles.delSign,
                      ]}
                    >
                      {isAdd ? '+' : isDel ? '-' : ' '}
                    </Text>
                  </View>

                  {/* Code line */}
                  <Text
                    style={[
                      styles.codeContent,
                      isAdd && styles.addCodeContent,
                      isDel && styles.delCodeContent,
                    ]}
                    selectable
                  >
                    {line.content}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    fontFamily: typography.fontFamily,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  filesListHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  fileChipsScroll: {
    maxHeight: 38,
    paddingHorizontal: spacing.md,
    marginBottom: 6,
  },
  fileChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  selectedFileChip: {
    backgroundColor: colors.surfaceHover,
    borderColor: colors.borderHighlight,
  },
  fileChipName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
  },
  selectedFileChipName: {
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  additionsText: {
    color: colors.diffAddText,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  deletionsText: {
    color: colors.diffDeleteText,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  diffToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  diffMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  filePathText: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    fontWeight: typography.weights.medium,
  },
  diffActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  diffContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chunkBlock: {
    marginBottom: 8,
  },
  chunkHeader: {
    backgroundColor: colors.surfaceHover,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  chunkHeaderText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  diffLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  addLineRow: {
    backgroundColor: colors.diffAddBg,
  },
  delLineRow: {
    backgroundColor: colors.diffDeleteBg,
  },
  gutter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 72,
    paddingHorizontal: 4,
    justifyContent: 'flex-end',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    marginRight: 8,
  },
  gutterNum: {
    width: 24,
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
    textAlign: 'right',
  },
  gutterSign: {
    width: 14,
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    textAlign: 'center',
    color: colors.textMuted,
  },
  addSign: {
    color: colors.diffAddText,
    fontWeight: typography.weights.bold,
  },
  delSign: {
    color: colors.diffDeleteText,
    fontWeight: typography.weights.bold,
  },
  codeContent: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    lineHeight: 18,
  },
  addCodeContent: {
    color: colors.diffAddText,
  },
  delCodeContent: {
    color: colors.diffDeleteText,
  },
});
