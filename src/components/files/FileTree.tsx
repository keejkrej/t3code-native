import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import { useAppStore } from '../../state/useAppStore';
import { WorkspaceFile } from '../../types';
import { Icon, IconName } from '../ui/Icon';
import { Button } from '../ui/Button';

export const FileTree: React.FC = () => {
  const { workspaceFiles, selectWorkspaceFile, selectedFileContent, closeFilePreview } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    'src/components': true,
    electron: true,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const getFileIcon = (name: string): IconName => {
    if (name.endsWith('.tsx') || name.endsWith('.ts') || name.endsWith('.js')) return 'FileCode';
    if (name.endsWith('.json') || name.endsWith('.config.ts')) return 'Code';
    if (name.endsWith('.md')) return 'FileCode';
    return 'FileCode';
  };

  const renderFileNode = (item: WorkspaceFile, depth: number = 0) => {
    const isDir = item.type === 'directory';
    const isExpanded = !!expandedFolders[item.path];

    return (
      <View key={item.path} style={{ marginLeft: depth * 12 }}>
        <Pressable
          style={styles.nodeRow}
          onPress={() => {
            if (isDir) {
              toggleFolder(item.path);
            } else {
              selectWorkspaceFile(item.path);
            }
          }}
        >
          {isDir ? (
            <Icon
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'}
              size={12}
              color={colors.textMuted}
            />
          ) : (
            <View style={{ width: 12 }} />
          )}

          <Icon
            name={isDir ? (isExpanded ? 'FolderOpen' : 'Folder') : getFileIcon(item.name)}
            size={13}
            color={isDir ? colors.primaryLight : colors.textSecondary}
          />

          <Text
            style={[styles.nodeName, isDir && styles.folderName]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {item.size && (
            <Text style={styles.fileSizeText}>
              {Math.round(item.size / 1024)}kb
            </Text>
          )}
        </Pressable>

        {isDir && isExpanded && item.children && (
          <View style={styles.childrenContainer}>
            {item.children.map((child) => renderFileNode(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {selectedFileContent ? (
        <View style={styles.filePreviewContainer}>
          <View style={styles.filePreviewHeader}>
            <View style={styles.previewPathRow}>
              <Icon name="FileCode" size={13} color={colors.primary} />
              <Text style={styles.previewPathText} numberOfLines={1}>
                {selectedFileContent.path}
              </Text>
            </View>
            <Button
              icon="X"
              variant="ghost"
              size="xs"
              onPress={closeFilePreview}
            />
          </View>
          <ScrollView style={styles.previewScroll}>
            <Text style={styles.previewCode} selectable>
              {selectedFileContent.content}
            </Text>
          </ScrollView>
        </View>
      ) : (
        <ScrollView style={styles.treeScroll}>
          <View style={styles.treeHeader}>
            <Text style={styles.treeTitle}>PROJECT EXPLORER</Text>
          </View>
          {workspaceFiles.map((file) => renderFileNode(file))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSubtle,
  },
  treeScroll: {
    flex: 1,
    padding: spacing.sm,
  },
  treeHeader: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: 4,
  },
  treeTitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
    fontFamily: typography.fontFamily,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: borderRadius.xs,
    gap: 6,
  },
  nodeName: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    flex: 1,
  },
  folderName: {
    color: colors.text,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.medium,
  },
  fileSizeText: {
    color: colors.textMuted,
    fontSize: 10,
    fontFamily: typography.monoFontFamily,
  },
  childrenContainer: {
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
    marginLeft: 6,
  },
  filePreviewContainer: {
    flex: 1,
    backgroundColor: '#07080a',
  },
  filePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  previewPathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  previewPathText: {
    color: colors.text,
    fontSize: typography.sizes.xs,
    fontFamily: typography.monoFontFamily,
    fontWeight: typography.weights.medium,
  },
  previewScroll: {
    flex: 1,
    padding: spacing.md,
  },
  previewCode: {
    color: '#e5e7eb',
    fontSize: 11,
    fontFamily: typography.monoFontFamily,
    lineHeight: 18,
  },
});
