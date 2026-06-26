import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../lib/api';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!id) return;
    api.community.get(id as string).then(setPost).catch(() => router.back());
  }, [id]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    await api.community.comment(id as string, { content: comment });
    setComment('');
    const updated = await api.community.get(id as string);
    setPost(updated);
  };

  if (!post) return <View style={styles.container}><Text>Cargando...</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.postCard}>
        <View style={styles.postMeta}>
          <Text style={styles.category}>{post.category}</Text>
          <Text style={styles.author}>{post.anonymousId}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.contentText}>{post.content}</Text>
      </View>

      <Text style={styles.commentHeader}>Comentarios ({post.comments?.length || 0})</Text>

      <View style={styles.commentForm}>
        <TextInput style={styles.commentInput} value={comment} onChangeText={setComment} placeholder="Escribe un comentario..." />
        <TouchableOpacity style={styles.sendButton} onPress={handleComment}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>

      {post.comments?.map((c: any) => (
        <View key={c.id} style={styles.comment}>
          <Text style={styles.commentAuthor}>{c.anonymousId}</Text>
          <Text style={styles.commentText}>{c.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  back: { fontSize: 14, color: '#6366f1', marginBottom: 16 },
  postCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  postMeta: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  category: { fontSize: 11, backgroundColor: '#eef2ff', color: '#6366f1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  author: { fontSize: 12, color: '#94a3b8' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  contentText: { fontSize: 15, lineHeight: 24 },
  commentHeader: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  commentForm: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, fontSize: 14, backgroundColor: '#fff' },
  sendButton: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  sendButtonText: { color: '#fff', fontWeight: '600' },
  comment: { backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  commentAuthor: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  commentText: { fontSize: 14 },
});
