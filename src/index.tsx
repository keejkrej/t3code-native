import { AppRegistry } from 'react-native';
import { App } from './App';

AppRegistry.registerComponent('T3CodeNative', () => App);

const rootTag = document.getElementById('root');
if (rootTag) {
  AppRegistry.runApplication('T3CodeNative', {
    rootTag,
  });
}
