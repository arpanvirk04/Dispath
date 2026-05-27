import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Map, Users } from 'lucide-react-native';
import RouteScreen from '../components/RouteScreen';
import ProfileScreen from '../components/ProfileScreen';
import DeliveriesScreen from '../components/DeliveriesScreen';
import DeliveryDetailsScreen from '../components/DeliveryDetailsScreen';

const Tab = createBottomTabNavigator();
const RouteStack = createStackNavigator();

function RouteStackNavigator({ route, driver, setDriver }) {
    const stackDriver = driver || route?.params?.driver;
    return (
        <RouteStack.Navigator>
            <RouteStack.Screen 
                name="Routes"
                options={{ headerShown: false }}
            >
                {(props) => <RouteScreen {...props} driver={stackDriver} setDriver={setDriver} />}
            </RouteStack.Screen>
            <RouteStack.Screen 
                name="Deliveries"
                options={({ route }) => ({ 
                    title: route.params?.routeName || 'Deliveries',
                    headerBackTitleVisible: false
                })}
            >
                {(props) => <DeliveriesScreen {...props} driver={stackDriver} />}
            </RouteStack.Screen>
            <RouteStack.Screen 
                name="DeliveryDetails"
                options={{ 
                    headerShown: false,
                    title: 'Delivery Details'
                }}
            >
                {(props) => <DeliveryDetailsScreen {...props} driver={stackDriver} />}
            </RouteStack.Screen>
        </RouteStack.Navigator>
    );
}

export default function TabNavigator({ route }) {
    const initialDriver = route?.params?.driver;
    const [driverState, setDriverState] = React.useState(initialDriver);
    React.useEffect(() => {
        console.log('Driver state updated', driverState);
    }, [driverState]);
    return (
        <Tab.Navigator>
            <Tab.Screen
                name="RoutesTab"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Map color={color} size={size} />
                    ),
                    headerShown: false,
                    tabBarLabel: 'Routes'
                }}
            >
                {(props) => <RouteStackNavigator {...props} driver={driverState} setDriver={setDriverState} />}
            </Tab.Screen>
            <Tab.Screen
                name="Profile"
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Users color={color} size={size} />
                    ),
                    headerShown: false,
                }}
            >
                {(props) => <ProfileScreen {...props} driver={driverState} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}
