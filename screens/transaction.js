import React from 'react';
import { Alert, StyleSheet, Text, KeyboardAvoidingView, TouchableOpacity, View, TextInput, Image} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase/app'
import db from '../config'
export default class TransactionScreen extends React.Component{
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData:'',
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal', 
        transactionMessage:''
      }
    }
    getCameraPermissions = async()=>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({
        hasCameraPermissions: status === 'granted',
        buttonState:IDBCursor,
        scanned: false
      })
    }
    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      console.log(this.state.scannedStudentId + "hi")
    }

    handleTransaction = async()=>{
      var transactionType = await this.checkBookEligbility();
      console.log(transactionType)
    if (!transactionType) {
      this.setState({
        scannedBookId: '',
        scannedStudentId: '',
      });
      alert("The Book Doesn't Exist, Bye!");
    } 
    else if (transactionType === 'Issued') 
    {      
      var isStudentEligible = await this.checkStudentEligbilityForBookIssue();
       console.log(this.state.scannedStudentId)
      if (isStudentEligible) {
        this.initiateBookIssue();
        } }
        else 
      {      
        isStudentEligible = await this.checkStudentEligibilityForReturn();
        if (isStudentEligible === true) 
        {
          this.initializeBookReturn();
         
        }
      
    }
    }
    initiateBookIssue=async()=>{
      //add a transaction
      db.collection('transaction').add({
        'studentId': this.state.scannedStudentId,
        'bookId': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': 'Issue'
      })
      //change book status
      db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability': false
      })
      //change number of issued books for student
      db.collection('student').doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(1)
      })
      alert("Issued")
      //ToastAndroid.show(ToastAndroid.SHORT);
      this.setState({
        scannedBookId:'',
        scannedStudentId:'',
      })
    }

    initializeBookReturn =async()=>{
      //add a transaction
      db.collection("transaction").add({
        'studentId': this.state.scannedStudentId,
        'bookId': this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType': 'Return'
      })
      
      //change book status
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability': true
      })
      //change number of issued books for student
      db.collection("student").doc(this.state.scannedStudentId).update({
        'noOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
      })
      alert("Returned")
      //ToastAndroid.show(ToastAndroid.SHORT);
      this.setState({
        scannedBookId:'',
        scannedStudentId:'',
      })

    }
    checkBookEligbility = async() => {
      const bookRef = await db
        .collection("books")
        .where('bookId', '==', this.state.scannedBookId)
        .get();
      var transactionType = '';
      if (bookRef.docs.length == 0) {
        transactionType = false;
      } else {
        bookRef.docs.map((doc) => {
          var book = doc.data();
          if (book.bookAvailability) {
            transactionType = 'Issued';
          } else {
            transactionType ='Return';
          }
        });
      }
      return transactionType;
    };
    
    checkStudentEligbilityForBookIssue = async()=>{
       
        const studentRef = await db.collection("student").where("studentId","==",this.state.scannedStudentId).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
          console.log(studentRef.studentId);
          isStudentEligible = false
          alert("The student id doesn't exist in the database!")
          this.setState({
            scannedStudentId: '',
            scannedBookId: ''
          })
         
         
        }
        else{
           studentRef.docs.map((doc)=>{
              var student = doc.data();
              if(student.noOfBooksIssued < 2){
                isStudentEligible = true
                console.log(student.noOfBooksIssued)
              }
              else{
                isStudentEligible = false
                alert("The student has already issued 2 books!")
                this.setState({
                  scannedStudentId: '',
                  scannedBookId: ''
                })
              }
  
            })
  
        }
  
        return isStudentEligible
  
      }
  
      checkStudentEligibilityForReturn = async()=>{
        const transactionRef = await db.collection("transaction").where("bookId","==",this.state.scannedBookId).limit(1).get()
       
        var isStudentEligible = ""
        transactionRef.docs.map((doc)=>{
          var lastBookTransaction = doc.data();
          
          if(lastBookTransaction.studentId === this.state.scannedStudentId)
            {
              isStudentEligible = true
            }
          else {
            isStudentEligible = false
           
            this.setState({
              scannedStudentId: '',
              scannedBookId: ''
            })
            alert("The book wasn't issued by this student!")
          }
            
        })
        return isStudentEligible
       
      }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style={styles.container} behavior = 'padding' enabled>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              value={this.state.scannedBookId}
              onChangeText ={text => this.setState({scannedBookId:text})}/>
              
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              value={this.state.scannedStudentId}
              onChangeText ={text => this.setState({scannedStudentId: text})}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity
            style ={styles.submitButton}
            onPress ={async()=>{this.handleTransaction()}}>
              <Text style = {styles.submitButtonText}>
                SUBMIT
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton: {
      backgroundColor: '#FBC02E',
      width: 100,
      height: 50
    },
    submitButtonText: {
      padding: 10,
      textAlign : 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#D4E12F'
    }
  });