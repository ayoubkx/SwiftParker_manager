import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import './backend/firebaseConfig';

// Import all screens
import LoginScreen from "./Screens/LoginScreen";
import ParkingSelectionScreen from "./Screens/ParkingSelectionScreen";
import ManagerDashboardScreen from "./Screens/ManagerDashboardScreen";
import ScanQRScreen from "./Screens/ScanQRScreen";
import CheckPlatesScreen from "./Screens/CheckPlatesScreen";
import AddHardwareScreen from "./Screens/AddHardwareScreen";
import AddSensorModuleScreen from "./Screens/AddSensorModuleScreen";
import AddEntryExitModuleScreen from "./Screens/AddEntryExitModuleScreen";
import EditSensorModule from "./Screens/EditSensorModule";


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ParkingSelection" component={ParkingSelectionScreen} />
        <Stack.Screen name="ManagerDashboard" component={ManagerDashboardScreen} />
        <Stack.Screen name="ScanQRCode" component={ScanQRScreen} />
        <Stack.Screen name="CheckPlates" component={CheckPlatesScreen} />
        <Stack.Screen name="AddHardware" component={AddHardwareScreen} />
        <Stack.Screen name="AddSensorModule" component={AddSensorModuleScreen} />
        <Stack.Screen name="EditSensor" component={EditSensorModule} />
        <Stack.Screen name="AddEntryExitModule" component={AddEntryExitModuleScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;