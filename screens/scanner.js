import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity} from 'react-native';

import db from '../config'
export default class Scanner extends React.Component {
 
 
  
 
  render() {
    return (
      <View style={styles.container}>
      
    <TextInput 
      style ={styles.bar}
      placeholder = "Enter Book Id or Student Id"
      onChangeText={(text)=>{this.setState({search:text})}}/>
      <TouchableOpacity
        style = {styles.searchButton}
       
      >
        <Text>Search</Text>
      </TouchableOpacity>
      </View>
      )


}}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100
  },
  searchBar:{
    flexDirection:'row',
    height:40,
    width:'auto',
    borderWidth:0.5,
    alignItems:'center',
    backgroundColor:'grey',

  },
  bar:{
    borderWidth:2,
    height:30,
    width:300,
    paddingLeft:10,
  },
  searchButton:{
    borderWidth:1,
    height:30,
    width:50,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'green'
  }
})