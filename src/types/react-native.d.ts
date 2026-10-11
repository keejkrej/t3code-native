declare module 'react-native' {
  export * from 'react-native-web';
  import * as RNW from 'react-native-web';

  export interface ViewStyle extends React.CSSProperties {
    [key: string]: any;
  }
  export interface TextStyle extends React.CSSProperties {
    [key: string]: any;
  }
  export interface ImageStyle extends React.CSSProperties {
    [key: string]: any;
  }

  export type StyleProp<T> = T | Array<T | undefined | null | false> | undefined | null | false;

  export const View: React.FC<any>;
  export const Text: React.FC<any>;
  export const TextInput: React.FC<any>;
  export const ScrollView: React.ForwardRefExoticComponent<any>;
  export const Pressable: React.FC<any>;
  export const Modal: React.FC<any>;
  export const ActivityIndicator: React.FC<any>;
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    flatten: (style: any) => any;
  };
  export const AppRegistry: {
    registerComponent: (name: string, component: () => React.ComponentType<any>) => void;
    runApplication: (name: string, config: { rootTag: HTMLElement | null }) => void;
  };
  export const Platform: {
    OS: 'web' | 'ios' | 'android' | 'windows' | 'macos';
    select: <T>(obj: Record<string, T>) => T;
  };
}
