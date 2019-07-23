import { adopt } from 'react-adopt';
import { map } from 'lodash';

import { createQuery, createMutation, createSubscription } from '../../apollo/utils';
import gql from '../../gql';
// import { icqBeepPlay } from '../../helpers';

const {
  GET_ME,
  GET_MY_CHATS,
  SELECT_CHAT,
  GET_SELECTED_CHAT,
  ADD_MESSAGE,
  MESSAGE_ADDED_SUBSCRIPTION,
} = gql;

const addMessageUpdate = (client, { chatId, message }) => {
  const { myContacts, myChats } = client.readQuery({ query: GET_MY_CHATS });
  const updatedMyChats = map(myChats, (chat) => {
    const { id, messages } = chat;

    if (id === chatId) {
      const newMessages = [...messages, message];

      return {
        ...chat,
        messages: newMessages,
      };
    }
    return chat;
  });

  client.writeQuery({
    query: GET_MY_CHATS,
    data: {
      myContacts,
      myChats: updatedMyChats,
    },
  });
};

const getMe = createQuery('getMe', GET_ME);
const getMyChats = createQuery('getMyChats', GET_MY_CHATS, {
  notifyOnNetworkStatusChange: true,
});
const addMessage = createMutation('addMessage', ADD_MESSAGE, {
  update(client, { data }) {
    addMessageUpdate(client, data.addMessage);
  },
});
const messageAddedSubscription = createSubscription('messageAddedSubscription', MESSAGE_ADDED_SUBSCRIPTION, {
  onSubscriptionData({ client, subscriptionData: { data: { messageAdded } } }) {
    addMessageUpdate(client, messageAdded);
    // icqBeepPlay();
  },
});

const getSelectedChat = createQuery('getSelectedChat', GET_SELECTED_CHAT);
const selectChat = createMutation('selectChat', SELECT_CHAT);

const ContactsContainer = adopt({
  getMe,
  getMyChats,
  addMessage,
  messageAddedSubscription,
  // selectChat,
  getSelectedChat,
});

export default ContactsContainer;
