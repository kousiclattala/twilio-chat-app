import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import {Client} from '@twilio/conversations';
import {GiftedChat} from 'react-native-gifted-chat';

const App = () => {
  const [token, setToken] = useState('');
  const [identity, setIdentity] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isChatOpened, setIsChatOpened] = useState(false);
  const [messages, setMessages] = useState([]);
  const [convoSid, setConvoSid] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const getToken = async () => {
    const res = await fetch(
      `https://venom-chat.herokuapp.com/api/v1/getToken/${identity}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    // console.log('res', res);

    const resjson = await res.json();

    console.log('token', resjson);

    if (res.ok) {
      setToken(resjson);
      // getSubscribedConvos(resjson);
    } else {
      console.log(resjson);
    }
  };

  const createOrJoin = async () => {
    var clientConvo = await Client.create(token);

    await clientConvo
      .getConversationByUniqueName(name)
      .then(conversation => {
        console.log('if convo there', conversation.status, conversation.sid);
        setConversations([...conversations, conversation]);
        // conversation.add(identity);
        conversation.join();
        setConvoSid(conversation.sid);
        getAllMessages(conversation.sid);
        setIsChatOpened(true);
      })
      .catch(err => {
        console.log('errrr', err);
        clientConvo
          .createConversation({uniqueName: name})
          .then(conversation => {
            console.log('if no convo, fresh convo', conversation);
            setConversations([...conversations, conversation]);
            conversation.join();
            setConvoSid(conversation.sid);
            getAllMessages(conversation.sid);
            setIsChatOpened(true);
          })
          .catch(err => {
            console.log('err', err);
          });
      });
  };

  const getAllMessages = async channelSid => {
    var clientConvo = await Client.create(token);

    await clientConvo
      .getConversationBySid(channelSid)
      .then(conversation => {
        conversation
          .getMessages(10)
          .then(messages => {
            console.log('messages | ', messages);
            setMessages(messages.items);
          })
          .catch(err => {
            console.log('err getting messages | ', err);
          });
      })
      .catch(err => {
        console.log('err getting convo | ', err);
      });
  };

  const onSendMessage = async () => {
    var clientConvo = await Client.create(token);

    var message = newMessage;
    setNewMessage();

    clientConvo
      .getConversationBySid(convoSid)
      .then(conversation => {
        conversation.sendMessage(newMessage);
      })
      .catch(err => {
        console.log(err);
      });

    clientConvo.on('messageAdded', message => {
      setMessages([...messages, message]);
      setNewMessage('');
    });
  };

  const getSubscribedConvos = async restoken => {
    var clientConvo = await Client.create(restoken);

    clientConvo
      .getSubscribedConversations()
      .then(conversatio => {
        console.log('convos', conversatio);
        setConversations(conversatio);
      })
      .catch(err => {
        console.log(err);
      });
  };

  // console.log(conversations);

  useEffect(() => {
    // getToken();
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  return (
    <>
      {isLoggedIn ? (
        isChatOpened ? (
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor: '#fff',
            }}>
            <View
              style={{
                height: '7%',
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                }}>
                {name}
              </Text>
            </View>
            <FlatList
              data={messages}
              renderItem={({item, index}) => {
                return (
                  <View
                    style={{
                      width: '50%',
                      backgroundColor: '#000',
                      borderRadius: 20,
                      marginTop: 10,
                    }}
                    key={index}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 14,
                      }}>
                      {item.body}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 16,
                    }}>
                    No Messages
                  </Text>
                </View>
              }
            />
            <View
              style={{
                backgroundColor: '#414a4c',
                flexDirection: 'row',
              }}>
              <TextInput
                placeholder="Enter New Message"
                placeholderTextColor="#d3d3d3"
                style={{
                  width: '70%',
                  height: '70%',
                  borderRadius: 50,
                  backgroundColor: '#fff',
                  color: '#000',
                  marginHorizontal: 15,
                  marginTop: 10,
                  paddingStart: 20,
                }}
                value={newMessage}
                onChangeText={value => {
                  setNewMessage(value);
                }}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#000',
                  width: '20%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => onSendMessage()}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 14,
                  }}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        ) : (
          // <GiftedChat messages={messages} onSend={() => onSendMessage()} />
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#fff',
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 24,
              }}>
              Create or Join a conversation
            </Text>
            <TextInput
              placeholder="Enter Group Name"
              placeholderTextColor={'#d3d3d3'}
              style={{
                width: '80%',
                height: '7%',
                marginHorizontal: '10%',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#d3d3d3',
                marginTop: '10%',
                paddingStart: 15,
                color: '#000',
              }}
              value={name}
              onChangeText={value => {
                setName(value);
              }}
            />
            <TouchableOpacity
              style={{
                width: '80%',
                height: '7%',
                marginHorizontal: '10%',
                borderRadius: 10,
                backgroundColor: '#000',
                marginTop: '10%',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                createOrJoin();
              }}>
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: 18,
                }}>
                Create or Join
              </Text>
            </TouchableOpacity>
          </View>
          // <SafeAreaView
          //   style={{
          //     flex: 1,
          //     backgroundColor: '#fff',
          //   }}>
          //   <FlatList
          //     data={conversations}
          //     renderItem={({item, index}) => (
          //       <TouchableOpacity
          //         style={{
          //           backgroundColor: '#414a4c',
          //           height: '7%',
          //           width: '100%',
          //           paddingLeft: 20,
          //         }}>
          //         <Text
          //           style={{
          //             color: '#fff',
          //             fontSize: 16,
          //           }}>
          //           {item}
          //         </Text>
          //       </TouchableOpacity>
          //     )}
          //   />
          // </SafeAreaView>
        )
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
          }}>
          <Text
            style={{
              color: '#000',
              fontSize: 24,
            }}>
            Login to start conversation
          </Text>
          <TextInput
            placeholder="Enter Email"
            placeholderTextColor={'#d3d3d3'}
            style={{
              width: '80%',
              height: '7%',
              marginHorizontal: '10%',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#d3d3d3',
              marginTop: '10%',
              paddingStart: 15,
              color: '#000',
            }}
            value={identity}
            onChangeText={value => {
              setIdentity(value);
            }}
          />
          <TouchableOpacity
            style={{
              width: '80%',
              height: '7%',
              marginHorizontal: '10%',
              borderRadius: 10,
              backgroundColor: '#000',
              marginTop: '10%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              setIsLoggedIn(true);
              getToken();
            }}>
            <Text
              style={{
                color: '#fff',
                textAlign: 'center',
                fontSize: 18,
              }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default App;
