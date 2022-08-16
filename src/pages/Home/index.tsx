import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

// @ts-ignore
import avatar from '@/assets/images/avatar.png';
import CircleSlider from '@/components/CircleSlider';

export default function App() {
  const [value, setValue] = useState(20);

  const onMove = (v: number) => {
    setValue(v);
  };
  const onRelease = (v: number) => {
    setValue(v);
  };
  return (
    <View style={styles.container}>
      {/* <View style={styles.top}>
        <View style={styles.avatarContainer}>
          <Image source={avatar} style={{ width: 100, height: 100 }}></Image>
        </View>
        <View style={styles.settingContainer}>
          <View style={styles.settingWrapper}>

          </View>
        </View>
      </View> */}
      <View>
        <CircleSlider
          value={value}
          onMove={onMove}
          onRelease={onRelease}
          min={0}
          max={40}
          outerRadius={145}
          wrapperColor={'#23242e'}
          fontSize={108}
          fontColor={'white'}
          subFontColor={'white'}
          subFontValue={'current 18℃'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent:'center',
    alignItems:'center',
    marginTop: 50,
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'red'
  },
  settingContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  settingWrapper: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#999999',
    opacity: 0.1
  }
});
