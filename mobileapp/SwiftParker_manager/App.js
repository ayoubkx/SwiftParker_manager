import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from "./Screens/LoginScreen";
import ParkingSelectionScreen from "./Screens/ParkingSelectionScreen";
import ManagerDashboardScreen from "./Screens/ManagerDashboardScreen";
import ScanQRScreen from "./Screens/ScanQRScreen";
import CheckPlatesScreen from "./Screens/CheckPlatesScreen";


const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ParkingSelection" component={ParkingSelectionScreen} />
            <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
            <Stack.Screen name="ScanQRCode" component={ScanQRScreen} />
            <Stack.Screen name="CheckPlates" component={CheckPlatesScreen} />



        </Stack.Navigator>
      </NavigationContainer>
  );
}
