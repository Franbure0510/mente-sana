import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { api } from '../../lib/api';

export default function ChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    initConversation();
  }, []);

  const initConversation = async () => {
    try {
      const convs = await api.chat.conversations();
      if (convs.length > 0) {
        setConvId(convs[0].id);
        const msgs = await api.chat.messages(convs[0].id);
        setMessages(msgs);
      } else {
        const conv = await api.chat.createConversation();
        setConvId(conv.id);
      }
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !convId || sending) return;
    setSending(true);
    const text = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, id: 'temp-' + Date.now() }]);
    try {
      const res = await api.chat.send(convId, text);
      setMessages(prev => [...prev.filter(m => m.id !== res.user.id), res.user, res.assistant]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error. Intenta de nuevo.', id: 'err-' + Date.now() }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Chat de apoyo</Text>

      <ScrollView ref={scrollRef} style={styles.messageList} onContentSizeChange={() => scrollRef.current?.scrollToEnd()}>
        {messages.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Cuéntame qué te preocupa. Estoy aquí para escucharte.</Text>
          </View>
        )}
        {messages.map((m: any) => (
          <View key={m.id} style={[styles.message, m.role === 'user' ? styles.userMessage : styles.assistantMessage]}>
            <Text style={[styles.messageText, m.role === 'user' && styles.userMessageText]}>{m.content}</Text>
            <Text style={[styles.messageTime, m.role === 'user' && styles.userMessageTime]}>
              {new Date(m.createdAt || Date.now()).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        {sending && (
          <View style={[styles.message, styles.assistantMessage]}>
            <Text style={styles.typing}>Escribiendo...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Escribe tu mensaje..." />
        <TouchableOpacity style={[styles.sendButton, (!input.trim() || sending) && { opacity: 0.5 }]} onPress={handleSend} disabled={!input.trim() || sending}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.disclaimer}>Basado en TCC · No reemplaza ayuda profesional</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 20, paddingBottom: 0 },
  messageList: { flex: 1, padding: 20 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  message: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userMessage: { backgroundColor: '#6366f1', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantMessage: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, lineHeight: 20 },
  userMessageText: { color: '#fff' },
  messageTime: { fontSize: 10, marginTop: 4, opacity: 0.6 },
  userMessageTime: { color: '#c7d2fe' as any },
  typing: { fontSize: 14, color: '#64748b' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
  input: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14 },
  sendButton: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  disclaimer: { fontSize: 11, color: '#94a3b8', textAlign: 'center', paddingBottom: 8 },
});
