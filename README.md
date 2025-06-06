# Think41 AI SDK

A modern SDK for building AI-powered conversational interfaces with React and TypeScript support in Next.js applications.

## 1. Quick Start

### - Create a new Next.js application

First, create a new Next.js application with TypeScript:

```bash
npx create-next-app@latest my-ai-app --typescript --tailwind --eslint
cd my-ai-app
```

### - Install Required Dependencies

Install the Think41 SDK packages:

```bash
npm install @think41/react-sdk@0.1.1 @think41/client-js-standalone@0.1.0
```

### - Set Up Environment Variables
```

### - Start Development Server

Run the development server:

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`.

### 2. Basic Implementation of page.tsx

Here's how to create a complete AI chat widget with audio capabilities:

```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  CAIProvider, 
  useRTVIClientTransportState,
  RTVIClientAudio,  
  ChatWindow,
  AudioVisualizer,
  ChatProvider,
  ConnectionButton,
  MicControl
} from '@think41/client-react'; // Update the import path
import { MessageSquare, ChevronDown } from 'lucide-react';

function PipecatWidget() {
  const transportState = useRTVIClientTransportState();
  const isConnected = ["connected", "ready"].includes(transportState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (isConnected || transportState === "disconnected") {
      setIsConnecting(false);
    }
  }, [transportState, isConnected]);

  return (
    <>
      {/* Chat toggle button in top-left corner */}
      <div className="fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
        >
          {isChatOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <MessageSquare className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Connect button in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <div className="rounded-lg shadow-lg p-2">
          <ConnectionButton />
        </div>
      </div>

      {/* Chat Window */}
      <div className={`fixed top-16 left-4 z-40 w-[90vw] max-w-sm h-[70vh] max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden flex-col ${
        isChatOpen ? 'flex' : 'hidden'
      }`}>
        <div className="flex-1 overflow-y-auto">
          <ChatWindow className="h-full"/>
        </div>
      </div>

      {/* Center positioned visualizer */}
      <div className="fixed inset-0 flex items-center justify-center">
        <AudioVisualizer 
          participantType="bot"
          containerClassName="w-64 h-64 bg-black/80 rounded-lg"
          barCount={5}
          barWidth={40}
          barGap={15}
          barColor="#ffffff"
          barGlowColor="rgba(250, 250, 250, 0.7)"
          visualizerStyle="bars"
        />
      </div>
      
      {/* Controls at bottom right */}
      <div className="fixed bottom-8 right-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <MicControl
            isActive={isConnected || isConnecting}
            className="w-auto"
            demoMode={false}
          />
        </div>
      </div>
      <RTVIClientAudio />
    </>
  );
}

export default function WebRTCApp() {
  return (
    <CAIProvider clientType="webrtc">
      <ChatProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 pb-20 font-sans">
          <PipecatWidget />
        </div>
      </ChatProvider>
    </CAIProvider>
  );
}
```

##  Explanation:-

- The above code provides an example of a complete AI chat widget with audio capabilities. It uses the Think41 AI SDK to initialize the AI client and manage the connection to the AI service.

- The main client is being initialized with the `CAIProvider` component, which is a provider component that initializes the AI client and manages the connection to the AI service.

- All the components that need the client are being used inside the `CAIProvider` component.

- there are there main things that our sdk provides:

- **`components`**: These are the components that are used to build the UI of the chat widget.
- **`hooks and events`**: The sdk provides many different hooks and events like `useChat`, `useRTVIClient`, `useRTVIClientEvent` etc.



## RTVI Client

Using you'r RTVI Client gives you access to your client instance that manages all real-time communication, media handling, and AI interactions.

Here is how you can use a simple `useRTVIClient` hook:

```typescript
import { useRTVIClient } from '@pipecat-ai/client-react'; // Adjust path if needed

function MyComponent() {
  const client = useRTVIClient();

  // Now you're ready to roll!
  // You can use client.connect(), client.enableMic(true), etc.
  if (client) {
    // Example: Connect when component mounts
    // client.connect();
  }

  return (
    // Your component's JSX
  );
}
```

> **NOTE:** [`CAIProvider`](#1-caiprovider) is a React component that provides the RTVI client instance to its children. It is used to wrap your application and make the client instance available to all components that need it.

Here’s a typical setup in your main application file:

```jsx
// App.tsx or your main layout component
import { CAIProvider } from '@pipecat-ai/client-react'; // Adjust path
import MyComponent from './MyComponent';

function App() {
  const clientOptions = {
    // ... your RTVI client configuration options
  };

  return (
    <CAIProvider clientType="websocket" options={clientOptions}>
      {/* Any component here (and its children) can now use useRTVIClient() */}
      <MyComponent />
      {/* ... other components like ChatWindow, MicControl, etc. */}
    </CAIProvider>
  );
}
```
By ensuring this structure, you allow all components nested within `<CAIProvider />` to access the RTVI client instance through the `useRTVIClient` hook.



> **IMPORTANT NOTE:** There's one very important step before `useRTVIClient` can work its magic: your components that need the client **must** be inside the `<CAIProvider>` component.

### Core Connection Methods

1. **`connect(): `**  
   You can use this method to connect to the RTVI service.
   ```typescript
   // Example from Connect.tsx
   const handleConnect = async () => {
     await client?.connect();
   };
   ```

2. **`disconnect(): `**  
   You can use this method to disconnect from the RTVI service.
   ```typescript
   // Example from Connect.tsx
   const handleDisconnect = async () => {
     await client?.disconnect();
   };
   ```

#### Audio Control Methods

3. **`enableMic(enable: boolean): `**  
   You can use this method to enable or disable the microphone.
   ```typescript
   // Example from MicControl.tsx
   const toggleMic = async (newState: boolean) => {
     try {
       await client.enableMic(newState);
     } catch (error) {
       console.error("Error toggling mic:", error);
     }
   };
   ```

4. **`isMicEnabled: boolean`**  
   You can use this property to check if the microphone is currently enabled.
   ```typescript
   // Example from MicControl.tsx
   const isMicActive = client.isMicEnabled;
   ```



### RTVI Hooks and Events

We provide several React hooks and event types to work with Real-Time Voice Interface (RTVI) functionality. 

These hooks allow you to build custom components that respond to voice interactions and connection states.

### Available Hooks

#### 1. `useRTVIClient`
 This hook provides access to the RTVI client instance. you can refer to the [RTVI Client](#rtvi-client) section for more information.

#### 2. `useRTVIClientMediaTrack`

This hook allows you to access media tracks for audio visualization. which can be used to create custom audio visualizers.

```typescript
import { useRTVIClientMediaTrack } from '@pipecat-ai/react-js'; // Adjust path if needed

function AudioVisualizer() {
  const audioTrack = useRTVIClientMediaTrack('audio', 'bot');
  // Use audioTrack for visualization
}
```

#### 3. `useRTVIClientEvent`
This hook allows you to subscribe to RTVI events in your components.

you can use this events to customise the behavior of your components based on the events. 

below you will find a table with all the events that are available and their data types.

```typescript
import { useRTVIClientEvent, RTVIEvent } from '@pipecat-ai/react-js'; // Adjust path if needed

function MyComponent() {
  useRTVIClientEvent(RTVIEvent.BotTranscript, (data) => {
    console.log('Bot said:', data.text);
  });
  // ...
}
```

### RTVI Events

| Event | Description | Data Type |
|-------|-------------|-----------|
| `RTVIEvent.BotTranscript` | Fired when the bot sends a text transcript | `{ text: string }` |
| `RTVIEvent.BotStartedSpeaking` | Fired when the bot starts speaking | - |
| `RTVIEvent.BotStoppedSpeaking` | Fired when the bot stops speaking | - |
| `RTVIEvent.UserStartedSpeaking` | Fired when the user starts speaking | - |
| `RTVIEvent.UserStoppedSpeaking` | Fired when the user stops speaking | - |
| `RTVIEvent.Connected` | Fired when connection to RTVI server is established | - |
| `RTVIEvent.Disconnected` | Fired when disconnected from RTVI server | - |
| `RTVIEvent.TransportStateChanged` | Fired when the transport state changes | `{ state: TransportState }` |
| `RTVIEvent.BotReady` | Fired when the bot is ready | - |
| `RTVIEvent.BotConnected` | Fired when bot connects | - |
| `RTVIEvent.BotDisconnected` | Fired when bot disconnects | - |
| `RTVIEvent.TrackStarted` | Fired when a media track starts | Track info |
| `RTVIEvent.TrackStopped` | Fired when a media track stops | Track info |


### Additional features offerd by our sdk:-

### 1. Components

- **[`CAIProvider`](#1-caiprovider)**: Root provider that initializes the AI client and manages the connection to the AI service
- **[`ChatProvider`](#2-chatprovider)**: Manages the chat state and message history
- **[`ConnectionButton`](#3-connectionbutton)**: Handles the connection to the AI service
- **[`ChatWindow`](#4-chatwindow)**: Displays the conversation history
- **[`AudioVisualizer`](#5-audiovisualizer)**: Visual feedback for audio input/output
- **[`MicControl`](#6-miccontrol)**: Button to control microphone input
- **[`RTVIClientAudio`](#rtviclientaudio)**: Handles audio playback from AI responses

### 2. Hooks

- **[`useRTVIClientTransportState`](#usertviclienttransportstate)**: Monitors and provides the current connection state
- **[`useConnectionManager`](#useconnectionmanager)**: Manages connection state with automatic reconnection capabilities
- **[`useConversationState`](#useconversationstate)**: Tracks conversation state, speaking states, and handles transcripts

## Core Concepts

### 1. CAIProvider

The `CAIProvider` component is the foundation of your think41 AI application, initializing the client and setting up the communication layer. It accepts the following props:

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `clientType` | `"webrtc"` \| `"websocket"` \| `"daily"` \| `"gemini"` \| `"openai"` | `"webrtc"` | Transport mechanism for AI communication |
| `options` | `RTVIClientOptions` | `{}` | Configuration options for the client |

#### Example

```tsx
<CAIProvider 
  clientType="webrtc"
  options={
    clientId: 'my-app-client',
    sessionId: `session-${Date.now()}`,
  }
>
  <YourApp />
</CAIProvider>
```
NOTE: You must wrap your application with the `CAIProvider` component to use the client instance.


### 2. RTVIClientAudio
**REQUIRED COMPONENT:** Handles audio playback for the client. This component is essential for any application that needs to play audio from the AI responses.

```tsx
</RTVIClientAudio>
```

**Important Notes:**
- You must include this component once in your application for audio to work properly
- Place it anywhere within your component tree under the CAIProvider
- Without this component, your application will not be able to play audio from the AI
- No additional configuration is typically needed, but props are available for advanced use cases


### 3. ChatProvider

The `ChatProvider` is a React context provider that manages the chat state and message history throughout your application. It provides a simple and efficient way to handle chat messages, including adding new messages and clearing the conversation history.

#### Key Features

- **Message Management**: Maintains a list of chat messages with unique IDs and timestamps
- **Message Types**: Supports both 'user' and 'bot' message types for clear message differentiation
- **Real-time Updates**: Automatically handles message updates and re-renders
- **Type Safety**: Fully typed with TypeScript for better development experience
- **Simple API**: Offers intuitive methods for common chat operations

#### Usage

First, wrap your application or chat component with the `ChatProvider`:

```tsx
import { ChatProvider } from './path-to/ChatProvider';

function App() {
  return (
    <ChatProvider>
      <YourChatComponents />
    </ChatProvider>
  );
}
```

Then, use the `useChat` hook in any child component to access the chat context:

```tsx
import { useChat } from './path-to/ChatProvider';

function ChatComponent() {
  const { messages, addMessage, clearMessages } = useChat();
  
  // Example: Add a new message
  const handleSendMessage = (text: string) => {
    addMessage('user', text);
    // Bot response would be added through your chat logic
  };
  
  // Example: Clear all messages
  const handleClearChat = () => {
    clearMessages();
  };
  
  return (
    // Your chat UI implementation
  );
}
```

#### Methods and Properties

- **messages**: `ChatMessage[]` - Array of chat messages
- **addMessage(type: 'user' | 'bot', text: string)**: Adds a new message to the chat
- **clearMessages()**: Clears all messages from the chat history

> **NOTE:** `ChatProvider` is a React component that provides the chat context to its children. It is used to wrap your application and make the chat context available to all components that need it.

#### Message Structure

Each message in the chat has the following structure:

```typescript
interface ChatMessage {
  id: string;          // Unique identifier for the message
  type: 'user' | 'bot'; // Sender type
  text: string;         // Message content
  timestamp: Date;      // When the message was created
}
```

#### Using with RTVI Events

You can integrate the ChatProvider with RTVI events for real-time communication without using the component directly. Here's how to set it up:

```tsx
import { useEffect } from 'react';
import { useRTVIClient, useRTVIClientEvent, RTVIEvent } from '@pipecat-ai/react-js'; // Adjust path if needed
import { useChat } from './path-to/ChatProvider';

function RTVIEventChat() {
  const { addMessage } = useChat();
  const client = useRTVIClient();

  // Listen for bot messages
  useRTVIClientEvent(RTVIEvent.BotTranscript, (data: any) => {
    if (data?.text) {
      addMessage('bot', data.text);
    }
  });

  // Send a message to the bot
  const sendMessage = async (text: string) => {
    if (!client || !text.trim()) return;
    
    // Add user message to chat
    addMessage('user', text);
    
    try {
      // Send message to agent using append_to_messages action
      await client.sendCustomAction({
        service: 'llm',
        action: 'append_to_messages',
        arguments: [
          { 
            name: 'messages', 
            value: [{ "role": "user", "content": text }] 
          },
          { name: 'run_immediately', value: true }
        ]
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('bot', 'Sorry, there was an error sending your message.');
    }
  };

  return (
    <div>
      {/* Your custom chat UI */}
      <button onClick={() => sendMessage('Hello, bot!')}>
        Send Test Message
      </button>
    </div>
  );
}
```

#### Key Points for RTVI Integration:

1. **Event Handling**: Use `useRTVIClientEvent` to listen for `RTVIEvent.BotTranscript` to receive bot messages.
2. **Message Sending**: Use `client.sendCustomAction` with `append_to_messages` to send messages to the bot.
3. **Error Handling**: Always implement error handling for network issues or API failures.
4. **Message Types**: Maintain the message type ('user' | 'bot') to differentiate between sent and received messages.
5. **State Management**: The ChatProvider handles all the message state management internally.

This approach gives you complete control over the chat UI while leveraging the RTVI event system for real-time communication.

### 4. ConnectionButton 

The `ConnectionButton` is a pre-styled, interactive button component that manages the connection state to the AI service. It provides visual feedback for different states (connected, disconnected, connecting) and handles the connection lifecycle automatically.

#### Usage

```tsx
import { ConnectionButton } from '@pipecat-ai/react-js'; // Adjust path if needed

function App() {
  const handleConnect = () => {
    console.log('Connecting to service...');
  };

  const handleDisconnect = () => {
    console.log('Disconnecting from service...');
  };

  const handleConnectionChange = (isConnected: boolean) => {
    console.log(`Connection state changed: ${isConnected ? 'Connected' : 'Disconnected'}`);
  };

  return (
    <div>
<CAIProvider clientType="webrtc" options={{/* your options */}}>
  <ConnectionButton 
    onConnect={handleConnect}
    onDisconnect={handleDisconnect}
    onChange={handleConnectionChange}
    className="my-custom-class"
  />
</CAIProvider>
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onConnect` | `() => void` | - | Callback triggered when the connect action is initiated |
| `onDisconnect` | `() => void` | - | Callback triggered when the disconnect action is initiated |
| `onChange` | `(isConnected: boolean) => void` | - | Callback triggered when connection state changes |
| `isConnected` | `boolean` | - | Controlled connection state. If not provided, the component manages its own state |
| `className` | `string` | `""` | Additional CSS classes to apply to the button |
| `disconnectLabel` | `string` | `"Disconnect"` | Label shown when connected |


#### Styling

The button automatically applies different styles based on its state:

- **Default/Disconnected**: Dark gray background (`bg-gray-800`), white text
- **Hover (Disconnected)**: Slightly darker gray background (`bg-gray-900`)
- **Connected**: Red background (`bg-red-600`), white text
- **Hover (Connected)**: Darker red background (`bg-red-700`)
- **Connecting/Disabled**: Light gray background (`bg-gray-400`), disabled cursor

#### Creating a Custom Connection Button

You can create your own custom connection button while leveraging the same connection management logic. Here's how to build a custom button using the same hooks and patterns as the built-in `ConnectionButton`:

```tsx
import { useRTVIClient, useRTVIClientEvent, RTVIEvent } from '@pipecat-ai/react-js'; // Adjust path if needed
import { useState, useCallback } from 'react';

export function CustomConnectionButton({
  onConnect,
  onDisconnect,
  onChange,
  className = '',
  isConnected: externalIsConnected,
  connectLabel = 'Connect',
  disconnectLabel = 'Disconnect',
  connectingLabel = 'Connecting...',
  ...props
}) {
  const client = useRTVIClient();
  const [internalConnected, setInternalConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Use external connected state if provided, otherwise use internal state
  const connected = externalIsConnected !== undefined ? externalIsConnected : internalConnected;

  // Listen for connection state changes
  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setInternalConnected(true);
    setIsConnecting(false);
    onChange?.(true);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setInternalConnected(false);
    setIsConnecting(false);
    onChange?.(false);
  });

  const handleClick = useCallback(async () => {
    const newState = !connected;

    try {
      setIsConnecting(true);

      if (newState) {
        onConnect?.();
        await client?.connect();
      } else {
        onDisconnect?.();
        await client?.disconnect();
      }
    } catch (error) {
      console.error('Connection toggle error:', error);
      setIsConnecting(false);
    }
  }, [client, connected, onConnect, onDisconnect]);

  return (
    <button
      onClick={handleClick}
      disabled={isConnecting}
      className={`your-custom-classes ${isConnecting ? 'opacity-75' : ''} ${className}`}
      {...props}
    >
      {isConnecting ? connectingLabel : connected ? disconnectLabel : connectLabel}
    </button>
  );
}
```

#### Key Features of Custom Implementation:

1. **State Management**:
   - Tracks connection state internally or accepts it as a prop
   - Handles loading states during connection/disconnection
   - Synchronizes with RTVI client state

2. **Event Handling**:
   - Listens for `RTVIEvent.Connected` and `RTVIEvent.Disconnected` events
   - Updates UI state based on connection changes
   - Calls appropriate callbacks for state changes

3. **Connection Logic**:
   - Handles both connection and disconnection
   - Manages async operations with proper error handling
   - Prevents multiple simultaneous connection attempts

4. **Customization**:
   - Accepts custom class names
   - Allows overriding all labels
   - Passes through additional props to the button element

#### Example Usage with Custom Styling:

```tsx
<CustomConnectionButton
  className="px-6 py-3 rounded-full font-bold text-white transition-all"
  style={{
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.3)',
    minWidth: '180px'
  }}
  connectLabel="Start Chat"
  disconnectLabel="End Chat"
  connectingLabel="Please wait..."
  onConnect={() => console.log('Connecting...')}
  onDisconnect={() => console.log('Disconnecting...')}
  onChange={(isConnected) => console.log('Connection state:', isConnected)}
/>
```

#### Example with Custom Styling

```tsx
<ConnectionButton
  className="px-8 py-4 text-lg font-bold rounded-full transition-transform hover:scale-105"
  style={{
    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.2)'
  }}
/>
```

### 5. ChatWindow

The `ChatWindow` component provides a complete chat interface that displays the conversation history and includes an input field for sending new messages. It's designed to work seamlessly with the `ChatProvider` and automatically handles message display, scrolling, and user input.

#### Usage

```tsx
import { ChatWindow } from '@pipecat-ai/react-js'; // Adjust path if needed

function ChatInterface() {
  return (
    <div className="h-[500px] w-full max-w-md">
      <ChatWindow 
        className="h-full rounded-lg shadow-lg"
        initialMessages={[
          { type: 'bot', text: 'Hello! How can I help you today?' }
        ]}
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `"w-full h-full"` | Additional CSS classes for the main container |
| `initialMessages` | `Array<{type: 'user' | 'bot', text: string}>` | `[]` | Array of messages to display when the component mounts |

#### Message Structure

Messages are displayed using the following structure:

```typescript
interface ChatMessage {
  id: string;           // Unique identifier
  type: 'user' | 'bot'; // Sender type
  text: string;         // Message content
  timestamp: Date;      // When the message was created
}
```

#### Styling

The component uses Tailwind CSS for styling. You can customize the appearance by:

1. **Main Container**:
   - Uses the `className` prop for the main container
   - Default styling includes a dark theme with purple accents

2. **Message Bubbles**:
   - User messages: Purple background with white text
   - Bot messages: White background with dark text
   - Both include rounded corners and subtle shadows

3. **Timestamps**:
   - Shown below each message
   - Formatted as "h:mm am/pm"

4. **Input Area**:
   - Fixed at the bottom
   - Includes a text input and send button
   - Shows connection status

#### Behavior

- Automatically scrolls to show new messages
- Handles Enter key for sending messages
- Shows connection status in the input placeholder
- Clears input after sending a message
- Disables input when not connected

#### Creating a Custom Chat Interface

You can build your own custom chat interface while still leveraging the `ChatProvider` for state management. Here's how to create a custom chat window:

```tsx
import { useChat, useRTVIClient, useRTVIClientEvent, RTVIEvent } from '@pipecat-ai/react-js'; // Adjust path if needed
import { useState, useRef, useEffect } from 'react';

export function CustomChatWindow() {
  const { messages, addMessage } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const client = useRTVIClient();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for bot messages
  useRTVIClientEvent(RTVIEvent.BotTranscript, (data: any) => {
    if (data?.text) {
      addMessage('bot', data.text);
    }
  });

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !client) return;

    // Add user message to chat
    addMessage('user', text);
    setInputText('');

    try {
      // Send message to agent
      await client.sendCustomAction({
        service: 'llm',
        action: 'append_to_messages',
        arguments: [
          { name: 'messages', value: [{ role: 'user', content: text }] },
          { name: 'run_immediately', value: true }
        ]
      });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('bot', 'Sorry, there was an error sending your message.');
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`mb-4 p-3 rounded-lg max-w-[80%] ${
              message.type === 'user'
                ? 'ml-auto bg-purple-600 text-white'
                : 'mr-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.text}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-3 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### Key Features of Custom Implementation:

1. **Message Display**:
   - Shows messages in bubbles with different styles for user and bot
   - Auto-scrolls to the latest message
   - Displays timestamps for each message

2. **Input Handling**:
   - Text input with Enter key support
   - Send button with disabled state when empty
   - Responsive design that works on mobile and desktop

3. **RTVI Integration**:
   - Listens for bot messages using `useRTVIClientEvent`
   - Sends messages using `sendCustomAction`
   - Handles errors gracefully

4. **Styling**:
   - Uses Tailwind CSS for styling
   - Dark mode support using dark: classes
   - Responsive design with proper spacing

To use this custom component, simply include it in your application:

```tsx
import { ChatProvider } from '@pipecat-ai/react-js'; // Adjust path if needed
import { CustomChatWindow } from './CustomChatWindow';

function App() {
  return (
    <ChatProvider>
      <CustomChatWindow />
    </ChatProvider>
  );
}
```

#### Integration with ChatProvider

The ChatWindow automatically uses the ChatContext when wrapped with a `ChatProvider`. It will display all messages from the context and automatically add new messages when they're sent.

#### Example with Custom Styling

```tsx
<ChatWindow
  className="border border-gray-200 rounded-lg overflow-hidden"
  initialMessages={[
    { type: 'bot', text: 'Welcome! How can I help you today?' }
  ]}
/>
```

This component is designed to work out-of-the-box with minimal configuration while providing a polished chat experience.

### 6. AudioVisualizer

The `AudioVisualizer` component provides real-time visualization of audio input or output with multiple visualization styles and extensive customization options. It's perfect for creating engaging audio experiences in voice-enabled applications.

#### Basic Usage

```tsx
import { AudioVisualizer } from '@pipecat-ai/react-js'; // Adjust path if needed

function VoiceCallUI() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg">
      <MicControl />
      <div className="flex-1 h-16">
        <AudioVisualizer 
          participantType="local"
          visualizerStyle="bars"
          barCount={12}
          barColor="#3b82f6"
          barGlowColor="rgba(59, 130, 246, 0.7)"
          className="rounded-lg"
        />
      </div>
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `participantType` | `"bot"` \| `"local"` | `"bot"` | Which audio stream to visualize |
| `visualizerStyle` | `"bars"` \| `"circles"` \| `"line"` | `"bars"` | Type of visualization to render |
| `barCount` | `number` | `5` | Number of visual elements to display |
| `barWidth` | `number` | `40` | Width of each bar/circle in pixels |
| `barGap` | `number` | `10` | Gap between elements in pixels |
| `barRadius` | `number` | `20` | Border radius of elements (pixels) |
| `barColor` | `string` | `"#FFFFFF"` | Color of the visualization elements |
| `barGlowColor` | `string` | `"rgba(255, 255, 255, 0.7)"` | Glow effect color |
| `barMinHeight` | `number` | `20` | Minimum height of visualization elements (pixels) |
| `barMaxHeight` | `number` | `100` | Maximum height of visualization elements (pixels) |
| `sensitivity` | `number` | `1.5` | Audio sensitivity multiplier |
| `width` | `string` \| `number` | `"100%"` | Width of the visualizer |
| `height` | `string` \| `number` | `"100%"` | Height of the visualizer |
| `backgroundColor` | `string` | `"transparent"` | Background color of the visualizer |
| `animationSpeed` | `number` | `0.1` | Speed of animations |
| `animationStyle` | `"wave"` \| `"equalizer"` \| `"pulse"` | `"wave"` | Animation style |
| `responsive` | `boolean` | `true` | Whether to automatically resize with container |
| `glowIntensity` | `number` | `15` | Intensity of the glow effect |
| `className` | `string` | - | Additional CSS classes for the container |
| `containerClassName` | `string` | - | Additional CSS classes for the inner container |
| `containerStyle` | `React.CSSProperties` | `{}` | Inline styles for the container |
| `canvasStyle` | `React.CSSProperties` | `{}` | Inline styles for the canvas |

#### Visualization Styles

##### 1. Bars
Classic equalizer-style bars that move with the audio frequency.

```tsx
<AudioVisualizer
  visualizerStyle="bars"
  barCount={8}
  barColor="#8b5cf6"
  barGlowColor="rgba(139, 92, 246, 0.6)"
  barWidth={12}
  barGap={8}
  barRadius={6}
  animationStyle="equalizer"
/>
```

##### 2. Circles
Animated circles that respond to audio levels.

```tsx
<AudioVisualizer
  visualizerStyle="circles"
  barCount={5}
  barColor="#ec4899"
  barGlowColor="rgba(236, 72, 153, 0.6)"
  barWidth={20}
  barGap={20}
  animationStyle="pulse"
/>
```

##### 3. Line
Smooth waveform line visualization.

```tsx
<AudioVisualizer
  visualizerStyle="line"
  barColor="#10b981"
  barGlowColor="rgba(16, 185, 129, 0.6)"
  barWidth={2}
  animationStyle="wave"
  animationSpeed={0.15}
/>
```

#### Animation Styles

1. **Wave**: Smooth wave-like motion (default)
2. **Equalizer**: Individual bar movements like an audio equalizer
3. **Pulse**: Pulsing animation that responds to audio levels

#### Advanced Usage

##### Custom Styling with CSS

```tsx
<div className="audio-viz-container">
  <AudioVisualizer
    className="custom-audio-viz"
    containerClassName="viz-inner"
    containerStyle={{
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}
    canvasStyle={{
      borderRadius: '8px',
      transition: 'all 0.3s ease'
    }}
  />
</div>
```

#### Creating a Custom Audio Visualizer

You can create your own custom audio visualizer using the same underlying hooks and utilities. Here's how to build a custom visualizer component:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRTVIClientMediaTrack, useRTVIClientEvent } from '@think41/client-react';
import { RTVIEvent } from '@think41/client-js';

interface CustomAudioVizProps {
  participantType?: 'bot' | 'local';
  barCount?: number;
  className?: string;
  barColor?: string;
  glowColor?: string;
  sensitivity?: number;
}

export function CustomAudioViz({
  participantType = 'bot',
  barCount = 5,
  className = '',
  barColor = '#8b5cf6',
  glowColor = 'rgba(139, 92, 246, 0.6)',
  sensitivity = 1.5,
}: CustomAudioVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioTrack = useRTVIClientMediaTrack('audio', participantType);

  // Listen for bot speaking events if participant is bot
  useRTVIClientEvent(
    participantType === 'bot' ? RTVIEvent.BotStartedSpeaking : RTVIEvent.UserStartedSpeaking,
    () => setIsSpeaking(true)
  );
  
  useRTVIClientEvent(
    participantType === 'bot' ? RTVIEvent.BotStoppedSpeaking : RTVIEvent.UserStoppedSpeaking,
    () => setIsSpeaking(false)
  );

  useEffect(() => {
    if (!audioTrack) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId: number;
    
    const renderFrame = () => {
      if (!containerRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const normalized = Math.min(Math.max((average - 50) * sensitivity, 0), 100);
      
      // Update visual elements based on audio data
      const bars = Array.from(containerRef.current.children);
      bars.forEach((bar, i) => {
        const height = isSpeaking ? normalized * (0.8 + Math.random() * 0.4) : 0;
        (bar as HTMLElement).style.height = `${height}%`;
        (bar as HTMLElement).style.opacity = isSpeaking ? '1' : '0.5';
      });
      
      animationFrameId = requestAnimationFrame(renderFrame);
    };
    
    renderFrame();
    setIsActive(true);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      source.disconnect();
      audioContext.close();
      setIsActive(false);
    };
  }, [audioTrack, isSpeaking, sensitivity]);

  return (
    <div 
      ref={containerRef}
      className={`flex items-end h-20 gap-1.5 ${className}`}
      style={{
        '--bar-color': barColor,
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className="w-3 bg-[var(--bar-color)] rounded-full transition-all duration-100 ease-in-out"
          style={{
            height: '0%',
            boxShadow: `0 0 8px 2px var(--glow-color)`,
            transition: 'height 50ms ease-out, opacity 200ms ease-out',
          }}
        />
      ))}
    </div>
  );
}
```

#### Key Features of Custom Implementation:

1. **Audio Analysis**:
   - Uses Web Audio API for real-time audio analysis
   - Tracks frequency data from the audio stream
   - Applies sensitivity adjustments to the input
   - Utilizes `useRTVIClientMediaTrack` to access the audio stream

2. **Event Handling**:
   - Listens for `RTVIEvent.BotStartedSpeaking`/`RTVIEvent.UserStartedSpeaking` to detect when audio begins
   - Listens for `RTVIEvent.BotStoppedSpeaking`/`RTVIEvent.UserStoppedSpeaking` to detect when audio ends
   - Automatically updates the visualizer based on speaking state

3. **Visual Feedback**:
   - Smooth animations using CSS transitions
   - Glow effects using CSS box-shadow
   - Dynamic height and opacity based on audio levels
   - Responsive design that works with any container size

4. **Integration**:
   - Works with both bot and local audio streams via the `participantType` prop
   - Properly cleans up audio resources on unmount
   - Handles audio context creation and management

5. **Customization**:
   - Adjustable bar count via `barCount` prop
   - Customizable colors through `barColor` and `glowColor` props
   - Configurable sensitivity for audio responsiveness
   - Extensible with custom CSS classes and inline styles

#### Example Usage:

```tsx
import { CustomAudioViz } from './CustomAudioViz';

function VoiceCallUI() {
  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <div className="flex items-center gap-4">
        <MicControl />
        <div className="flex-1">
          <CustomAudioViz 
            participantType="local"
            barCount={8}
            barColor="#3b82f6"
            glowColor="rgba(59, 130, 246, 0.5)"
            sensitivity={1.8}
            className="h-16"
          />
        </div>
      </div>
    </div>
  );
}
```

### 7. MicControl

The `MicControl` component is a customizable microphone button that handles microphone input with visual feedback. It provides a clean interface for users to start and stop audio recording, with built-in loading states and demo mode for testing.

#### Usage

```tsx
import { MicControl } from '@think41/react-js';// Adjust path if needed

function VoiceControl() {
  const handleMicToggle = (isActive: boolean) => {
    console.log(`Microphone is now ${isActive ? 'active' : 'inactive'}`);
  };

  return (
    <div className="fixed bottom-4 right-4">
      <MicControl 
        onChange={handleMicToggle}
        className="p-2 bg-white rounded-full shadow-lg"
        demoMode={false}
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes for the container |
| `isActive` | `boolean` | `false` | Controls the active state of the microphone |
| `demoMode` | `boolean` | `false` | Enables demo mode that simulates microphone activity |
| `demoInterval` | `number` | `3000` | Interval (ms) between demo mode toggles |
| `onStart` | `() => void` | - | Callback when microphone recording starts |
| `onStop` | `(duration: number) => void` | - | Callback when microphone recording stops, returns duration in seconds |
| `onChange` | `(active: boolean) => void` | - | Callback when microphone state changes |
| `visualizerBars` | `number` | `48` | Number of visualizer bars to display (when applicable) |

#### Styling

The component includes several visual states that can be styled:

- **Default State**: Shows a microphone icon
- **Active State**: Shows a pulsing red dot when recording
- **Connecting State**: Shows a loading spinner
- **Hover State**: Subtle background highlight
- **Disabled State**: Reduced opacity and not-allowed cursor

```tsx
<MicControl
  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full"
  // Custom class when active (using clsx/tailwind-merge)
  classNames={{
    button: 'transition-all duration-200',
    active: 'ring-2 ring-red-500',
    icon: 'text-blue-600 dark:text-blue-400',
  }}
/>
```

#### Advanced Usage

##### Controlled Component

```tsx
function ControlledMic() {
  const [isMicActive, setIsMicActive] = useState(false);
  
  return (
    <MicControl
      isActive={isMicActive}
      onToggle={setIsMicActive}
      onStart={() => console.log('Recording started')}
      onStop={(duration) => console.log(`Recorded for ${duration} seconds`)}
    />
  );
}
```

##### Demo Mode

```tsx
// Shows automatic toggling between active/inactive states
<MicControl demoMode={true} demoInterval={2000} />
```

##### With Audio Visualizer

```tsx
<div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
  <MicControl />
  <AudioVisualizer 
    participantType="user"
    className="flex-1 h-16"
    barCount={12}
  />
</div>
```

#### Creating a Custom Mic Control

You can create your own custom microphone control using the same underlying hooks and events. Here's how to build a custom mic control component:

```tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRTVIClient, useRTVIClientEvent } from '@pipecat-ai/client-react'; // Adjust path if needed
import { RTVIEvent } from '@pipecat-ai/client-js';// Adjust path if needed
import { Mic, MicOff } from 'lucide-react';

interface CustomMicControlProps {
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onStateChange?: (isActive: boolean) => void;
  showVisualizer?: boolean;
}

export function CustomMicControl({
  className = '',
  activeClassName = 'bg-red-500 text-white',
  inactiveClassName = 'bg-gray-200 hover:bg-gray-300',
  onStateChange,
  showVisualizer = true,
}: CustomMicControlProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const client = useRTVIClient();

  // Listen for speaking events
  useRTVIClientEvent(RTVIEvent.UserStartedSpeaking, () => setIsSpeaking(true));
  useRTVIClientEvent(RTVIEvent.UserStoppedSpeaking, () => setIsSpeaking(false));

  const toggleMic = useCallback(async () => {
    if (!client) return;
    
    const newState = !isActive;
    setIsConnecting(true);
    
    try {
      await client.enableMic(newState);
      setIsActive(newState);
      onStateChange?.(newState);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [client, isActive, onStateChange]);

  // Sync with client state on mount
  useEffect(() => {
    if (!client) return;
    
    const syncState = async () => {
      try {
        const micState = client.isMicEnabled;
        setIsActive(micState);
      } catch (error) {
        console.error('Error syncing mic state:', error);
      }
    };
    
    syncState();
  }, [client]);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={toggleMic}
        disabled={isConnecting}
        className={`p-3 rounded-full transition-all duration-200 ${
          isActive ? activeClassName : inactiveClassName
        } ${isConnecting ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        aria-label={isActive ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isConnecting ? (
          <div className="w-6 h-6 border-2 border-transparent border-t-current rounded-full animate-spin" />
        ) : isActive ? (
          <Mic className="w-6 h-6" />
        ) : (
          <MicOff className="w-6 h-6" />
        )}
      </button>
      
      {showVisualizer && isActive && (
        <div className="flex items-end h-4 gap-0.5 w-24">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-current rounded-full transition-all duration-100"
              style={{
                height: isSpeaking 
                  ? `${10 + Math.random() * 90}%` 
                  : '10%',
                opacity: isSpeaking ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      )}
      
      <span className="text-xs opacity-70">
        {isConnecting ? 'Connecting...' : isActive ? 'Listening' : 'Tap to speak'}
      </span>
    </div>
  );
}
```

#### Key Features of Custom Implementation:

1. **State Management**:
   - Tracks microphone state (active/inactive)
   - Handles connection states
   - Syncs with RTVI client state

2. **Event Handling**:
   - Listens for `RTVIEvent.UserStartedSpeaking` and `RTVIEvent.UserStoppedSpeaking`
   - Updates UI based on speaking state
   - Handles errors gracefully

3. **Customization**:
   - Customizable classes for different states
   - Optional visualizer
   - Flexible styling with CSS classes

4. **Accessibility**:
   - ARIA labels
   - Keyboard navigation support
   - Loading states

#### Example Usage:

```tsx
function VoiceInterface() {
  return (
    <div className="fixed bottom-6 right-6">
      <CustomMicControl 
        className="p-2"
        activeClassName="bg-red-500 text-white shadow-lg"
        inactiveClassName="bg-white text-gray-800 shadow-md hover:shadow-lg"
        onStateChange={(isActive) => 
          console.log(`Microphone is now ${isActive ? 'active' : 'inactive'}`)
        }
      />
    </div>
  );
}
```


## Hooks

### useRTVIClientTransportState()

Hook to get the current connection state of the AI client.

```tsx
const transportState = useRTVIClientTransportState();
// Possible states: 'disconnected', 'connecting', 'connected', 'ready', 'error'
```

### useChat()

Hook to access and modify the chat state.

```tsx
const { 
  messages,          // Array of chat messages
  sendMessage,       // Function to send a new message
  clearMessages,     // Function to clear all messages
  isTyping,         // Boolean indicating if AI is typing
  error             // Any error that occurred
} = useChat();
```


## Advanced Usage

### Styling

The widget uses Tailwind CSS for styling. You can customize the appearance by:

1. Overriding Tailwind classes
2. Using the `className` prop on components
3. Adding custom CSS with the `style` prop


### Custom Styling

You can customize the appearance of components using Tailwind classes or custom CSS:

```tsx
<ChatWindow
  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg"
  messageClassName="p-4 rounded-lg"
  inputClassName="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
  buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
/>
```

### Handling Custom Events

Listen for specific events from the AI service:

```tsx
const handleAIResponse = (response) => {
  console.log('AI Response:', response);
  // Handle custom logic based on response
};

// In your component
useEffect(() => {
  const subscription = RTVIClient.on('aiResponse', handleAIResponse);
  return () => subscription.unsubscribe();
}, []);
```

## License

MIT © [PipeCat](https://pipecat.ai)
