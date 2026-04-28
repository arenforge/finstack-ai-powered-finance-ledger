import { useState } from 'react';
import { askAI } from '../services/api';
import '../styles/ai.css';

const examples = [
  'How much did I spend on food this month?',
  "What's my biggest expense category?",
  'Am I saving enough?',
  'Summarize last month for me'
];

export default function AIChat() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Ask me about your recent spending.' }]);
  const [question, setQuestion] = useState('');
  const [typing, setTyping] = useState(false);

  const send = async (text = question) => {
    if (!text.trim()) return;
    setQuestion('');
    setMessages((current) => [...current, { role: 'user', text }]);
    setTyping(true);
    try {
      const data = await askAI(text);
      setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', text: 'I could not reach Gemini right now.' }]);
    }
    setTyping(false);
  };

  return (
    <main className="page ai-page">
      <section className="page-title"><h1>AI Chat</h1><p>Ask from the numbers you have logged.</p></section>
      <section className="chat-box">{messages.map((message, index) => <div className={`chat-bubble ${message.role}`} key={index}>{message.text}</div>)}{typing && <div className="chat-bubble assistant typing">Typing...</div>}</section>
      <div className="chips">{examples.map((example) => <button key={example} onClick={() => send(example)}>{example}</button>)}</div>
      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a finance question" /><button className="primary-button">Send</button></form>
    </main>
  );
}
