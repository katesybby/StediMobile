import React, { useEffect, useState, } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import  Navigation from './components/Navigation';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from './screens/OnboardingScreen';
import Home from './screens/Home';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ^backs up data onto ur device


const AppStack = createNativeStackNavigator();
const loggedInStates ={
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  LOGGED_IN: 'LOGGED_IN',
  CODE_SENT: 'CODE_SENT'
}

const App = () =>{
  const [isFirstLaunch, setFirstLaunch] = React.useState(true);
  const [loggedInState,setLoggedInState] = React.useState("NOT_LOGGED_IN");
  const [homeTodayScore, setHomeTodayScore] = React.useState(0);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [oneTimePassword, setOneTimePassword] = React.useState(null);

  useEffect(()=>{ //code that has to run before ur shown the app screen
    const getSessionToken = async()=>{
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    console.log('sessionToken', sessionToken);
    const validateResponse = await fetch('https://dev.stedi.me/validate/'+sessionToken,
    {
      method: 'GET',
      headers: {
        'content-type': 'application/text'
      }
    });

    if(validateResponse.status==200){ //good, non-expired token
      const userName = await validateResponse.text();
      await AsyncStorage.setItem('userName', userName); //saves username for later
      setLoggedInState(loggedInStates.LOGGED_IN); //if token is bad, it skips to this line
    }
    }
    getSessionToken();
  });

   if (isFirstLaunch == true){
return(
  <OnboardingScreen setFirstLaunch={setFirstLaunch}/>

);
}else if(loggedInState == loggedInStates.LOGGED_IN){
  return <Navigation/>
} else if(loggedInState == loggedInStates.NOT_LOGGED_IN){
  return(
    <View>
      <TextInput style={styles.input}
      placeholderTextColor='#4251f5'
      placeholder='Phone Number'
      value={phoneNumber}
      onChangeText={setPhoneNumber}>
      </TextInput>
      <Button
      title= 'Send'
      style={styles.button}
      onPress={async()=>{
          console.log('Button was pressed!')
          await fetch('https://dev.stedi.me/twofactorlogin/'+phoneNumber,
          {
            method:'POST',
            headers:{
              'content-type':'application/text'
            }
          }
          )
          setLoggedInState(loggedInStates.CODE_SENT)
        }}
      />
    </View>
  )}
  else if(loggedInState == loggedInStates.CODE_SENT){
    return(
    <View>
      <TextInput 
        style={styles.input}
        placeholderTextColor='#4251f5'
        placeholder='One Time Password'
        value={oneTimePassword}
        onChangeText={setOneTimePassword}
        keyboardType = "numeric">
      </TextInput> 
      <Button
      title= 'Login'
        style={styles.button}
        onPress={async()=>{
          console.log('Login Button was pressed!')
          const loginResponse=await fetch('https://dev.stedi.me/twofactorlogin',
            {
              method:'POST',
              headers:{
                'content-type':'application/text'
              },
              body: JSON.stringify({
                phoneNumber: phoneNumber,
                oneTimePassword: oneTimePassword
              })
            });
            if(loginResponse.status==200){
              const sessionToken = await loginResponse.text(); 
              await AsyncStorage.setItem('sessionToken', sessionToken) 
              setLoggedInState(loggedInStates.LOGGED_IN);
            } else{
              console.log('response status', loginResponse.status); 
              Alert.alert('Invalid', 'Invalid login information') 
              setLoggedInState(NOT_LOGGED_IN);
            }
        }}
      /> 
    </View>
  )}
}
export default App;

const styles = StyleSheet.create({
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center'
},
input: {
  height: 40,
  marginTop: 100,
  margin: 12, 
  borderWidth: 1,
  padding: 10,
},
margin:{
  marginTop:100
},
button: {
  alignItems: "center",
  backgroundColor: "#DDDDDD",
  padding: 10
}    
})